export const day1 = `
# Day 1 — SSH Key Security & EC2 Access Setup

**Phase 1 · Week 1 · Linux & EC2 Foundations**

---

## 🎯 Trainer's Guidance — Senior DevOps Trainer

### Learning Objectives
- Understand asymmetric key auth (public/private key pairs) and why it replaces passwords in production.
- Launch an Amazon Linux 2023 EC2 instance and connect to it exclusively via SSH key.
- Configure a local SSH client for fast, repeatable access (no re-typing key paths every time).

### Explanation (Beginner-Friendly)
Password auth on a server exposed to the public internet is a brute-force target within minutes of boot. SSH key pairs solve this with math instead of memory: you hold a **private key** (never leave your laptop), the server holds the matching **public key**. The server challenges your client to prove it holds the private key — no secret ever crosses the wire.

On EC2, this is enforced by default: password auth is disabled in \`sshd_config\` on every standard AMI. If you can't SSH in, the problem is almost always the key, the Security Group, or the username — not "the password."

### Practical Task
Launch a \`t2.micro\` Amazon Linux 2023 instance, generate an \`ed25519\` key pair, connect via SSH, and configure \`~/.ssh/config\` so you can connect with just \`ssh gk-ec2-day1\`.

---

## 🛠️ Engineer's Notes — Senior DevOps Engineer

### Commands
\`\`\`bash
# 1. Generate a modern key pair locally (do this on YOUR machine, not the server)
ssh-keygen -t ed25519 -C "gk-devops-bootcamp" -f ~/.ssh/gk_ec2_day1

# 2. Lock down the private key (SSH will refuse loose permissions)
# 🧠 Permission Breakdown (Owner-Group-Public):
# '4' = Read, '2' = Write, '0' = No access.
# chmod 400 = Read-only for you (owner), ZERO access for anyone else.
# chmod 600 = Read/Write for you (owner), ZERO access for anyone else.
chmod 400 ~/.ssh/gk_ec2_day1

# 3. Connect to the instance (replace with your Elastic/Public IP)
ssh -i ~/.ssh/gk_ec2_day1 ec2-user@<EC2_PUBLIC_IP>

# 4. On the instance — confirm identity and environment
whoami          # ec2-user on Amazon Linux
pwd             # /home/ec2-user
uname -a
curl -s ifconfig.me   # confirms your public IP from the server's own view
\`\`\`

### SSH Config Shortcut
\`\`\`
# ~/.ssh/config on your local machine
Host gk-ec2-day1
    HostName <EC2_PUBLIC_IP>
    User ec2-user
    IdentityFile ~/.ssh/gk_ec2_day1
    StrictHostKeyChecking accept-new
\`\`\`
Now \`ssh gk-ec2-day1\` just works — no flags, no typos.

### Troubleshooting Tree
| Symptom | Check | Fix |
|---|---|---|
| \`Connection refused\` | Security Group inbound rule for port 22 | Add rule: TCP 22, source your IP (not \`0.0.0.0/0\` if avoidable) |
| \`Permission denied (publickey)\` | Key file permissions: \`ls -la ~/.ssh/gk_ec2_day1\` | \`chmod 600\` the private key |
| \`Permission denied (publickey)\` | Wrong username | Amazon Linux = \`ec2-user\`, Ubuntu = \`ubuntu\` |
| Hangs, no response | Instance state / correct public IP | Check AWS console — instance running? IP changed after stop/start? |

### Common Mistakes
| Mistake | Why it hurts | Fix |
|---|---|---|
| Opening port 22 to \`0.0.0.0/0\` "to make it work" | Every bot on the internet now scans your box | Restrict source to your IP/32, tighten later with a bastion or SSM |
| Reusing one key pair across every server you'll ever own | One leaked laptop = every server compromised | One key per purpose/project at minimum |
| Committing the private key to a Git repo | Instant, permanent compromise even after deletion | \`.gitignore\` your \`.ssh/\` directory; never \`git add\` a key |

---

## 🧭 CTO's Perspective — Head of DevOps

### Why This Matters in Real Projects
Every incident review I've sat in that started with "how did they get in?" traces back to Day 1 fundamentals: an exposed port, a reused key, or password auth someone "temporarily" re-enabled. This is the cheapest security investment you'll ever make — it costs 10 minutes and prevents the most common breach vector in cloud infrastructure.

### Success Criteria
- [ ] Can SSH into the instance using only the key (password auth attempts fail/are disabled)
- [ ] \`~/.ssh/config\` alias works without specifying \`-i\` or the IP manually
- [ ] Can explain, unprompted, why the Security Group is checked *before* the OS ever sees the packet

### Long-Term Workflow Connection
This is the access model every later tool builds on: Jenkins agents SSH into build targets, Ansible controls fleets over SSH, Terraform-provisioned instances need this exact key-based bootstrap. Get sloppy here and every downstream automation inherits the sloppiness.

**Interview bar (3–4 yrs):** "Walk me through what happens when your SSH connection fails" should produce a layered answer — network (SG) → auth (key/permissions) → identity (username) — not a guess.
`;

export default day1;
