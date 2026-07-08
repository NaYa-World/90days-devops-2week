export const day7 = `
# Day 7 — Log Rotation & the postrotate Directive

**Phase 1 · Week 1 · Linux & EC2 Foundations · Week 1 Capstone**

---

## 🎯 Trainer's Guidance — Senior DevOps Trainer

### Learning Objectives
- Configure \`logrotate\` for a real application log.
- Understand why \`postrotate\` exists and when it's mandatory, not optional.
- Connect this back to Day 3's deleted-but-open-file trap.

### Explanation (Beginner-Friendly)
Left alone, application logs grow forever and eventually cause the exact disk-full incident from Day 3. \`logrotate\` automates rotation: at a schedule or size threshold, it renames the current log, creates a fresh empty one, and (optionally) compresses/deletes old rotations.

The catch: many apps hold their log file open by **file descriptor**, not by filename. If \`logrotate\` simply renames the file, the app keeps writing into the old, now-renamed (and eventually deleted) file — the Day 3 problem, self-inflicted on a schedule. \`postrotate\` runs a command *after* rotation — typically signaling the app to reopen its log file, or using \`copytruncate\` to avoid the issue entirely.

### Practical Task
Configure \`logrotate\` for a sample app log with daily rotation, 7-day retention, compression, and a working \`postrotate\` that reloads the app.

---

## 🛠️ Engineer's Notes — Senior DevOps Engineer

### Config
\`\`\`bash
# /etc/logrotate.d/gk-app
sudo nano /etc/logrotate.d/gk-app
\`\`\`
\`\`\`
/var/log/gk-app/app.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 ec2-user ec2-user
    postrotate
        systemctl reload gk-app > /dev/null 2>&1 || true
    endscript
}
\`\`\`

### Commands
\`\`\`bash
# Dry run — see exactly what logrotate WOULD do, without doing it
sudo logrotate -d /etc/logrotate.d/gk-app

# Force an actual rotation right now (for testing)
sudo logrotate -f /etc/logrotate.d/gk-app

# Confirm rotation happened
ls -la /var/log/gk-app/
# app.log  app.log.1.gz  app.log.2.gz ...

# Confirm the app is still writing to the NEW file, not a stale handle
lsof | grep app.log
\`\`\`

### copytruncate Alternative (No App Reload Needed)
\`\`\`
/var/log/gk-app/app.log {
    daily
    rotate 7
    compress
    copytruncate
}
\`\`\`
\`copytruncate\` copies the log then truncates the original in place — the app's file descriptor stays valid, no signal/reload needed. Trade-off: a tiny window where log lines written between copy and truncate can be lost. Use \`postrotate\` + reload when you need zero data loss; use \`copytruncate\` when the app can't be signaled to reopen logs.

### Troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| Disk still fills up despite logrotate config | App holds old renamed file open, no \`postrotate\`/\`copytruncate\` | Add \`postrotate\` reload signal, or switch to \`copytruncate\` |
| \`postrotate\` script fails silently | Wrong service name, or app doesn't support reload signal | Test the reload command manually first: \`sudo systemctl reload gk-app\` |
| Rotated logs never get deleted | \`rotate 7\` missing or old logrotate state file corrupted | Check \`/var/lib/logrotate/logrotate.status\`; verify \`rotate N\` is set |

### Common Mistakes
| Mistake | Fix |
|---|---|
| Assuming rotation alone frees disk space (Day 3 gap) | Rotation without reopening the file descriptor doesn't help — always pair with \`postrotate\` or \`copytruncate\` |
| No \`missingok\`/\`notifempty\` | Cron-triggered logrotate errors out on missing/empty logs in edge cases — always set both |
| Testing changes with real production rotation instead of \`-d\` (dry run) first | Always dry-run new configs before forcing a real rotation |

---

## 🧭 CTO's Perspective — Head of DevOps

### Why This Matters in Real Projects
Uncontrolled log growth is one of the most preventable causes of production disk-full incidents — and it's entirely solved by configuration, not code changes. This closes the loop on the whole week: Day 3 taught you *why* deleted-but-open files stay allocated; Day 7 teaches you how to prevent ever hitting that trap via automated, signal-aware rotation.

### Success Criteria
- [ ] Working \`logrotate\` config with daily rotation, 7-day retention, and compression
- [ ] \`postrotate\` (or \`copytruncate\`) verified to keep the app writing correctly post-rotation
- [ ] Can explain the tradeoff between \`postrotate\`+reload and \`copytruncate\`

### Week 1 Capstone Tie-In
Days 1–7 now form a complete operational loop for a single EC2-hosted service: secure access (Day 1) → correct shutdown handling (Day 2) → disk awareness (Day 3) → correct network exposure (Day 4) → supervised process lifecycle (Day 5) → hardened remote access (Day 6) → automated log hygiene (Day 7). Week 2 builds CI/CD and configuration management on top of this foundation — none of it works reliably if this week's fundamentals are shaky.

**Interview bar (3–4 yrs):** "How do you prevent log rotation itself from causing a disk or logging outage?" — expect a candidate to reference file descriptors and \`postrotate\`/\`copytruncate\` specifically, not just "I set up logrotate."
`;

export default day7;
