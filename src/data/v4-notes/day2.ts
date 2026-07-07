export const day2 = `
# Day 2: Linux Process Management & Resource Hogs

## 👨‍🏫 Trainer's Guidance
**Objective:** Identify, analyze, and terminate runaway processes consuming server resources.

Now that you're inside the server, you need to know what it's doing. Servers run dozens of background programs called "processes". Sometimes, a process gets stuck in a loop or leaks memory, consuming 100% of your CPU or RAM. Today, you'll learn how to act like a server detective to find the culprit and restore order.

**Practical Task:** 
1. Start a dummy background process that consumes CPU.
2. Use monitoring tools to identify its Process ID (PID).
3. Terminate it safely.

---

## 🛠️ Engineer's Notes
**Commands:**
\`\`\`bash
# 1. Start a resource hog in the background for testing
yes > /dev/null &

# 2. Monitor system resources in real-time
top
# (Pro-tip: install and use 'htop' instead for a better UI: sudo yum install htop)

# 3. Find the specific PID eating CPU
ps aux --sort=-%cpu | head -n 5

# 4. Terminate the process (replace 1234 with your PID)
kill -15 1234  # Graceful termination (SIGTERM)
kill -9 1234   # Force kill (SIGKILL) - use only if SIGTERM fails
\`\`\`

**Troubleshooting & Common Mistakes:**
- **Jumping straight to \`kill -9\`:** Never use \`-9\` as your first option. It rips the process out of memory without letting it save data or close connections, potentially causing database corruption. Always try \`kill -15\` first.
- **Zombie Processes:** Sometimes a process shows as \`Z\` (Zombie). You cannot kill a zombie directly; you must kill its parent process.

---

## 👔 CTO's Perspective
**Why this matters:** When an SLA (Service Level Agreement) breach is imminent because an application is unresponsive, you have minutes to diagnose the issue. Blindly rebooting the server destroys the forensic evidence we need to fix the root cause. 

**Success Criteria:** When an alert fires for "High CPU Usage", you can SSH in, identify the exact application causing the spike, and stabilize the system in under 2 minutes.
`;
