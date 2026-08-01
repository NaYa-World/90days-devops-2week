export const day3 = `
# Day 3 — Disk Space Exhaustion: The "Deleted but Still Full" Trap

**Phase 1 · Week 1 · Linux & EC2 Foundations**

---

## 🎯 Trainer's Guidance — Senior DevOps Trainer

### Learning Objectives
- Diagnose \`df\` showing 100% usage even after deleting large files.
- Understand the distinction between a file's directory entry and its actual disk allocation.
- Use \`lsof\` to find processes still holding deleted files open.

### Explanation (Beginner-Friendly)
Deleting a file with \`rm\` removes its name from the directory listing — but if a running process still has that file **open**, the kernel keeps the disk blocks allocated until the last file handle closes. \`df\` reports real disk usage (unchanged); \`ls\` shows the file is gone. This gap confuses almost every engineer the first time they hit it, usually during a 2am disk-full incident.

Classic cause: an app log file grows to 40GB, you delete it to free space, \`df -h\` still shows 100% used — because the app process still has the file descriptor open and keeps writing into the "invisible" space.

### Practical Task
Reproduce the scenario deliberately: start a process writing to a file, delete the file while it's still open, confirm disk usage doesn't drop, then fix it properly.

---

## 🛠️ Engineer's Notes — Senior DevOps Engineer

### Commands
\`\`\`bash
# Reproduce: write continuously to a file
yes "filler data" > /tmp/bigfile.log &
sleep 5

# Delete it — ls shows it's gone
rm /tmp/bigfile.log
ls -la /tmp/bigfile.log     # No such file or directory

# But disk usage hasn't changed
df -h /tmp

# Find the culprit: processes holding deleted-but-open files
lsof +L1
# or, filtered:
lsof | grep deleted

# The real fix — truncate the open file to reclaim space without killing the process
: > /proc/<PID>/fd/<FD_NUMBER>

# Or simply stop the process cleanly (see Day 2 — SIGTERM, not SIGKILL)
kill <PID>
\`\`\`

### Diagnostic Flow
1. \`df -h\` — confirm which mount is full.
2. \`du -sh /* 2>/dev/null | sort -rh | head -10\` — find the biggest directories.
3. \`lsof +L1\` — check for deleted-but-open files (the invisible culprit).
4. If nothing shows in \`lsof\`, check for filesystem-level issues: \`df -i\` for inode exhaustion (a *different* failure mode — files can be tiny but you can still run out of inodes).

### Common Mistakes
| Mistake | Fix |
|---|---|
| \`rm\`-ing a log file an active process is writing to, expecting instant space back | Truncate via \`/proc/<PID>/fd/<FD>\` or restart the process gracefully |
| Never checking \`lsof +L1\` before escalating to "the disk is broken" | Make this the second command you run, right after \`df -h\` |
| Ignoring inode exhaustion (\`df -i\`) because "there's plenty of space" | Space and inodes are separate limits — check both |

---

## 🧭 CTO's Perspective — Head of DevOps

### Why This Matters in Real Projects
Disk-full incidents are among the most common production pages, and the "I deleted it but it's still full" confusion wastes precious minutes during an active incident if the engineer hasn't seen this before. Knowing this on Day 3 means you diagnose it in under two minutes in a real incident instead of escalating in a panic.

### Success Criteria
- [ ] Reproduced the deleted-but-open-file scenario personally
- [ ] Used \`lsof +L1\` to locate the holding process
- [ ] Can explain the difference between directory entries and disk block allocation

### Long-Term Workflow Connection
This underpins proper **log rotation** design (Day 7) — logrotate's \`copytruncate\` mode exists specifically to avoid this trap. It also connects to container disk pressure in Kubernetes, where the same open-file-handle behavior applies inside a container's writable layer.

**Interview bar (3–4 yrs):** "You deleted a 50GB file but \`df\` still shows full — what's happening and how do you fix it without restarting the service?" is a real, frequently-asked question at this level.
`;

export default day3;
