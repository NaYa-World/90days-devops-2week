export const day3 = `
# Day 3: Disk Full — When the Server Refuses Connections

## 👨‍🏫 Trainer's Guidance
**Objective:** Diagnose and recover from a 100% disk utilization scenario.

In Linux, *everything* is a file. When the disk is 100% full, the operating system can't write temporary files, databases can't save transactions, and sometimes, you can't even log in. "Disk Full" is one of the most common, yet easily preventable, production incidents.

**Practical Task:** 
1. Simulate a disk fill event using the \`dd\` command.
2. Learn how to track down the largest files and directories.
3. Clear the space to recover the server.

---

## 🛠️ Engineer's Notes
**Commands:**
\`\`\`bash
# 1. Check overall disk space (human-readable)
df -h

# 2. Find the largest directories starting from root
sudo du -sh /* 2>/dev/null | sort -rh | head -n 10

# 3. Drill down into /var/log (common culprit)
sudo du -sh /var/log/* | sort -rh | head -n 5

# 4. Safely clear a log file WITHOUT deleting the file itself
> /var/log/massive-app.log
\`\`\`

**Troubleshooting & Common Mistakes:**
- **Deleting open files with \`rm\`:** If you \`rm\` a log file while an application is actively writing to it, the disk space will **not** be freed until the application is restarted. Instead, truncate the file using the \`> filename\` trick.
- **Hidden space hogs:** Remember that deleted but open files still take space. Use \`lsof +L1\` to find deleted files that are still being held open by processes.

---

## 👔 CTO's Perspective
**Why this matters:** Silent failures cost the business money. A disk full error doesn't just stop the app; it often stops the logging that would tell us *why* the app stopped. It is a cascading failure.

**Success Criteria:** You know how to track down storage hogs systematically using \`df\` and \`du\`, and you understand the danger of deleting active file descriptors.
`;
