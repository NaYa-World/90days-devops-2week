export const day7 = `
# Day 7: Cron Jobs & Log Rotation

## 👨‍🏫 Trainer's Guidance
**Objective:** Automate scheduled maintenance tasks and prevent runaway log growth.

Remember Day 3 when the disk filled up? The permanent fix to that problem isn't deleting files manually—it's automation. Linux has built-in tools for scheduling tasks (\`cron\`) and automatically compressing/archiving old log files (\`logrotate\`). 

**Practical Task:** 
1. Create a cron job that runs a simple script every minute.
2. Configure \`logrotate\` for a custom application log.

---

## 🛠️ Engineer's Notes
**Commands:**
\`\`\`bash
# 1. Edit the crontab for the current user
crontab -e

# Format: MINUTE HOUR DAY-OF-MONTH MONTH DAY-OF-WEEK COMMAND
# Run a backup script every day at 2:00 AM:
# 0 2 * * * /home/ec2-user/backup.sh >> /var/log/backup.log 2>&1

# 2. Configure Logrotate
sudo nano /etc/logrotate.d/myapp

# Example content:
# /var/log/myapp.log {
#     daily
#     rotate 7
#     compress
#     missingok
#     notifempty
# }

# 3. Test logrotate manually (dry-run)
sudo logrotate -d /etc/logrotate.d/myapp
\`\`\`

**Troubleshooting & Common Mistakes:**
- **Cron Environment Constraints:** Cron executes commands in a minimal shell. It does NOT load your \`.bashrc\` or \`.profile\`. If a script works manually but fails in cron, it is almost always because a command (like \`node\` or \`aws\`) is not in the cron \`PATH\`. Always use absolute paths in cron scripts.
- **Silent Failures:** If a cron job fails, it sends an email to a local mailbox no one checks. Always redirect stdout and stderr to a log file (\`>> output.log 2>&1\`).

---

## 👔 CTO's Perspective
**Why this matters:** "Toil" is the enemy of a high-performing DevOps team. If you are doing the same task manually every week, you are wasting the company's money. Automation reduces toil and prevents "forgot to do it" outages.

**Success Criteria:** You can schedule background tasks reliably and implement log rotation to guarantee a server will never fill its disk with log files. You have now mastered the foundational Linux skills required for Week 2!
`;
