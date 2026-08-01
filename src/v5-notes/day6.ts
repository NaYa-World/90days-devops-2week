export const day6 = `
# Day 6 — Hardening the SSH Daemon

**Phase 1 · Week 1 · Linux & EC2 Foundations**

---

## 🎯 Trainer's Guidance — Senior DevOps Trainer

### Learning Objectives
- Harden \`sshd_config\` beyond AWS defaults for a genuinely production-facing box.
- Understand each hardening directive's actual security contribution (not cargo-culting).
- Verify changes don't lock you out before disconnecting your session.

### Explanation (Beginner-Friendly)
AWS's default AMI SSH config is reasonable but not hardened for a real production edge host. Hardening means reducing the attack surface: disable root login, disable password auth entirely (you already use keys — Day 1), restrict which users/groups may connect, and change defaults that automated scanners specifically probe for.

The golden rule: **never close your current SSH session until you've verified the new config works in a second, separate session.** A typo in \`sshd_config\` combined with a dropped connection means you're locked out of a box with no console access configured.

### Practical Task
Harden \`/etc/ssh/sshd_config\` on your Day 1 instance, restart \`sshd\`, and verify access still works from a fresh connection before closing your original session.

---

## 🛠️ Engineer's Notes — Senior DevOps Engineer

### Key Hardening Directives
\`\`\`bash
# /etc/ssh/sshd_config — edit with sudo
sudo nano /etc/ssh/sshd_config
\`\`\`
\`\`\`ini
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
MaxAuthTries 3
AllowUsers ec2-user
ClientAliveInterval 300
ClientAliveCountMax 2
Port 22
\`\`\`

### Safe Apply Sequence
\`\`\`bash
# 1. Test the config syntax before restarting anything
sudo sshd -t

# 2. Restart (not stop!) the daemon
sudo systemctl restart sshd

# 3. CRITICAL: open a brand-new terminal/session and connect fresh
ssh gk-ec2-day1
# Only close your ORIGINAL session after this succeeds

# 4. Confirm password auth is truly rejected
ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password gk-ec2-day1
# Expected: Permission denied (publickey)
\`\`\`

### Troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| \`sudo sshd -t\` reports a syntax error | Typo in \`sshd_config\` | Fix before restarting — a bad restart with \`PasswordAuthentication no\` and a broken key setup locks you out permanently |
| Locked out after restart | Config error missed by \`-t\`, or key/AllowUsers mismatch | Use AWS EC2 Instance Connect / Serial Console to recover, or restore from a backed-up \`sshd_config\` |
| \`AllowUsers\` blocks a legitimate second user | Directive is a strict allowlist | Add every required username explicitly, space-separated |

### Common Mistakes
| Mistake | Why it hurts | Fix |
|---|---|---|
| Closing the original session before verifying the new one connects | If the config is broken, you have zero remaining access | Always keep the original session open until a fresh connection is confirmed |
| Skipping \`sshd -t\` before restarting | Syntax errors surface as a failed restart or worse, an inconsistent state | Always test config syntax first — it takes one second |
| Setting \`MaxAuthTries\` absurdly low (e.g. 1) | Legitimate typos lock you out too | 3–4 is a reasonable balance |

---

## 🧭 CTO's Perspective — Head of DevOps

### Why This Matters in Real Projects
Every internet-facing Linux box is scanned for weak SSH config within hours of going live — this isn't theoretical. Disabling password auth and root login eliminates the two most common automated attack vectors outright. The verify-before-disconnect discipline here is also a broader lesson: any change to access control on a remote system needs a rollback path *before* you commit to it.

### Success Criteria
- [ ] Hardened config applied and verified via a fresh session before closing the original
- [ ] Confirmed password auth is rejected explicitly (not just assumed)
- [ ] Can explain why \`AllowUsers\` and \`PermitRootLogin no\` reduce real attack surface, not just "look secure"

### Long-Term Workflow Connection
This exact discipline — test, apply, verify-in-parallel, then commit — is the same pattern used for firewall rule changes, load balancer config, and any production access change later in the roadmap (Ansible playbooks, Terraform applies). Learn the caution now; it scales to every infrastructure-as-code change you'll make.

**Interview bar (3–4 yrs):** "You need to harden SSH on a production box you can only access via SSH — what's your exact procedure to avoid locking yourself out?" is a real signal question for this experience level.
`;

export default day6;
