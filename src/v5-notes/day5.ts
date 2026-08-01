export const day5 = `
# Day 5 — systemd: Restart=always vs Restart=on-failure

**Phase 1 · Week 1 · Linux & EC2 Foundations**

---

## 🎯 Trainer's Guidance — Senior DevOps Trainer

### Learning Objectives
- Write a real systemd unit file for a custom application.
- Understand the operational difference between restart policies.
- Know when each policy is the *wrong* choice and why.

### Explanation (Beginner-Friendly)
systemd is PID 1 on virtually every modern Linux distro — it starts, stops, and supervises services. A unit file's \`Restart=\` directive tells systemd what to do when your process exits.

- **\`Restart=always\`** — restart no matter how the process exited: clean exit, crash, or manual stop via \`kill\`. Even a deliberate \`systemctl stop\` combined with certain exit paths can trigger a restart loop if misconfigured.
- **\`Restart=on-failure\`** — restart only on a *non-zero* exit code, a signal, timeout, or watchdog failure. A clean \`exit 0\` does not trigger a restart.

Choosing wrong has real consequences: \`always\` on a service with a config bug creates an infinite crash-restart loop that floods your logs and burns CPU. \`on-failure\` on a service that should never stop can leave it down if it happens to exit 0 unexpectedly.

### Practical Task
Write a systemd unit for a simple script, test both restart policies, and deliberately trigger a crash loop to observe systemd's \`StartLimitBurst\` protection.

---

## 🛠️ Engineer's Notes — Senior DevOps Engineer

### Unit File Example
\`\`\`ini
# /etc/systemd/system/gk-app.service
[Unit]
Description=GK Sample DevOps Service
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/gk-app/app.py
Restart=on-failure
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=3
User=ec2-user
WorkingDirectory=/opt/gk-app

[Install]
WantedBy=multi-user.target
\`\`\`

### Commands
\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl enable gk-app
sudo systemctl start gk-app
sudo systemctl status gk-app

# Watch it live
journalctl -u gk-app -f

# Force a crash to observe restart behavior
sudo systemctl kill -s SIGKILL gk-app

# Check restart count and any StartLimitBurst trip
systemctl status gk-app | grep -i "restart\\|start-limit"
\`\`\`

### Troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| Service in \`failed (Result: start-limit-hit)\` | Crashed too many times within \`StartLimitIntervalSec\` | Fix the underlying crash first; \`systemctl reset-failed gk-app\` to clear the trip |
| Service restarts even after \`systemctl stop\` | \`Restart=always\` combined with an external kill signal racing the stop command | Use \`Restart=on-failure\` for services where manual stop must stick |
| Service silently stays down after unexpected clean exit | \`Restart=on-failure\` doesn't cover exit code 0 | Use \`Restart=always\` only if *any* exit should trigger a restart, or fix the app to exit non-zero on real failure |

### Common Mistakes
| Mistake | Fix |
|---|---|
| Copy-pasting \`Restart=always\` everywhere without thinking | Default to \`on-failure\` for most apps; reserve \`always\` for critical daemons that must never be "cleanly" down |
| No \`StartLimitBurst\`/\`StartLimitIntervalSec\` | Always set these — an unbounded crash loop is a resource-exhaustion incident waiting to happen |
| Forgetting \`daemon-reload\` after editing a unit file | systemd caches unit definitions; always reload after edits |

---

## 🧭 CTO's Perspective — Head of DevOps

### Why This Matters in Real Projects
This is process supervision — the same job Kubernetes' pod restart policy does at a higher layer, and the same job PM2/supervisord do for application-level process managers. Getting the policy wrong on a production service either masks real failures (endless silent restarts) or turns a minor blip into an outage (no restart at all).

### Success Criteria
- [ ] Wrote and deployed a working custom unit file
- [ ] Demonstrated both restart policies with observed, different behavior
- [ ] Correctly explains \`StartLimitBurst\` and why it exists

### Long-Term Workflow Connection
Kubernetes' \`restartPolicy\` (Always/OnFailure/Never) is conceptually identical — you are learning the *pattern*, not just a systemd feature. This also connects directly to Day 2 (SIGTERM handling) — a service that ignores SIGTERM gracefully will misbehave under any restart policy during a deploy.

**Interview bar (3–4 yrs):** "Your service keeps restarting in a loop in production — walk me through your diagnosis" should reference \`journalctl -u\`, \`StartLimitBurst\`, and root-causing the crash rather than "I'd just restart it manually."
`;

export default day5;
