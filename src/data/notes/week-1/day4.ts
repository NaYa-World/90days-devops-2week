import { BootcampDay } from '../types';

export const day4: BootcampDay = {
  day: 4,
  title: "Linux Deep Dive + Processes + System Debugging",
  subtitle: "Day 1 was theory. Day 2 was commands. Day 4 is what you do when something breaks.",
  color: "#38bdf8",
  trainerNote: "This is the day that separates DevOps engineers from people who just 'deploy stuff'. Production goes down. You have to find it fast. This is the systematic debugging framework.",
  engineerNote: "The best incident responder I've worked with didn't know every tool. They had a mental framework: hardware → OS → process → network → app. They always found the issue in under 10 minutes.",
  goal: {
    icon: "🎯",
    title: "Day 4 Goal",
    description: "By the end of Day 4, you can systematically debug a down Linux server, write a cron-based automated backup/cleanup script, filter logs with grep/awk/sed, and configure advanced SSH shortcuts and tunnels."
  },
  schedule: [
    {
      time: "09:00 – 09:30",
      phase: "REVIEW",
      activity: "Day 3 recap — launch EC2 and deploy Nginx from memory",
      why: "Validate you understand how to write and use deployment scripts without reference materials."
    },
    {
      time: "09:30 – 10:30",
      phase: "THEORY",
      activity: "The System Debugging Framework",
      why: "Learn the systematic debugging layers: hardware/VM status → OS health → process runtime → network connectivity → logs. Never guess."
    },
    {
      time: "10:30 – 10:45",
      phase: "BREAK",
      activity: "Short Break",
      why: "Let the brain absorb the theory."
    },
    {
      time: "10:45 – 12:30",
      phase: "HANDS-ON",
      activity: "System health check commands",
      why: "Practice monitoring disk (df/du), memory (free), CPU (top/htop), open file descriptors (lsof), and system logs (journalctl)."
    },
    {
      time: "12:30 – 13:15",
      phase: "BREAK",
      activity: "Lunch Break",
      why: "Away from screen."
    },
    {
      time: "13:15 – 14:30",
      phase: "HANDS-ON",
      activity: "Cron jobs + Env vars config",
      why: "Configure export, environment variables list, and scheduled automation tasks. The backbone of systems administration."
    },
    {
      time: "14:30 – 15:30",
      phase: "HANDS-ON",
      activity: "Text parsing with grep, awk, and sed",
      why: "Parse sample log files to find error counts, unique IPs, and run search-and-replace scripts inside files."
    },
    {
      time: "15:30 – 15:45",
      phase: "BREAK",
      activity: "Short Break",
      why: "Short recovery before project."
    },
    {
      time: "15:45 – 16:45",
      phase: "PROJECT",
      activity: "Mini Project: sys_monitor.sh",
      why: "Write an automated system health script that checks CPU, memory, and disk usage, formats the report, and runs on a cron schedule."
    },
    {
      time: "16:45 – 17:00",
      phase: "DOCUMENT",
      activity: "Day 4 notes + Quiz",
      why: "Document today's deep dive."
    }
  ],
  concepts: [
    {
      icon: "⚙️",
      title: "The System Debugging Framework",
      description: "Troubleshoot sequentially: Hardware (df, free, top) → OS (dmesg, uptime) → Process (systemctl, ps) → Network (ss, curl, ping) → Logs (tail, journalctl).",
      analogy: "Like a mechanic diagnosing a car: first check if there is fuel (disk/mem), then check if engine turns on (process), then check if wheels rotate (network), then read diagnostics codes (logs)."
    },
    {
      icon: "⏰",
      title: "Cron Jobs: Scheduled Automation",
      description: "Cron runs tasks on a schedule using the 5-field format: minute hour day-of-month month day-of-week. Redirect output (>> log 2>&1) so errors don't disappear.",
      analogy: "Setting recurring calendar events on your phone: 'Run backup script at 2 AM every Monday'."
    },
    {
      icon: "🎛",
      title: "Environment Variables",
      description: "Configuration should be external to application code. Export variables in the shell session or store them in env files. This makes apps portable.",
      analogy: "Like settings on your phone (language, dark mode) that multiple apps read, instead of each app hardcoding its own theme."
    },
    {
      icon: "🔑",
      title: "SSH Configuration & Tunnels",
      description: "Generate secure keys (ed25519) and configure shortcuts in ~/.ssh/config. Forward remote ports to localhost to access secure databases.",
      analogy: "Creating a secure private pipeline between your computer and a room inside a secure corporate office."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 4,
      sessionTitle: "System Health & Monitoring",
      sections: [
        {
          label: "First 60 Seconds in an Incident",
          lines: [
            { type: 'cmd', prompt: "$", text: "df -h" },
            { type: 'comment', text: "Disk usage — full disk = app crashes silently" },
            { type: 'cmd', prompt: "$", text: "du -sh /var/log/*" },
            { type: 'comment', text: "What's eating disk? Logs are usually the culprit" },
            { type: 'cmd', prompt: "$", text: "free -h" },
            { type: 'comment', text: "Memory usage — is the app OOM (out of memory)?" },
            { type: 'cmd', prompt: "$", text: "top" },
            { type: 'comment', text: "Which process is eating CPU or memory? Press q to quit" },
            { type: 'cmd', prompt: "$", text: "uptime" },
            { type: 'comment', text: "Load average — if > CPU count, system is overloaded" },
            { type: 'cmd', prompt: "$", text: "ps aux --sort=-%cpu | head -5" },
            { type: 'comment', text: "List top 5 CPU hogging processes" },
            { type: 'cmd', prompt: "$", text: "lsof -i :80" },
            { type: 'comment', text: "What process is listening on port 80?" },
            { type: 'cmd', prompt: "$", text: "sudo tail -n 50 /var/log/syslog" },
            { type: 'comment', text: "Read last 50 lines of syslog" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 4,
      sessionTitle: "Text Parsing & Log Filtering",
      sections: [
        {
          label: "grep, awk, sed — The Holy Trinity",
          lines: [
            { type: 'cmd', prompt: "$", text: "grep -i \"error\" /var/log/nginx/error.log" },
            { type: 'comment', text: "Search case-insensitively for \"error\"" },
            { type: 'cmd', prompt: "$", text: "grep -v \"info\" /var/log/nginx/access.log" },
            { type: 'comment', text: "Show lines that DON'T contain \"info\"" },
            { type: 'cmd', prompt: "$", text: "awk '{print $1, $7}' /var/log/nginx/access.log | head -10" },
            { type: 'comment', text: "Print client IP (col 1) and requested path (col 7)" },
            { type: 'cmd', prompt: "$", text: "sed -i 's/localhost/127.0.0.1/g' config.txt" },
            { type: 'comment', text: "Search and replace 'localhost' with '127.0.0.1' inline" },
            { type: 'cmd', prompt: "$", text: "awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -5" },
            { type: 'comment', text: "Find top 5 most active IP addresses hitting your server" }
          ]
        }
      ]
    },
    {
      sessionNumber: 3,
      totalSessions: 4,
      sessionTitle: "Cron Automation & Env Vars",
      sections: [
        {
          label: "Setting up scheduled tasks",
          lines: [
            { type: 'cmd', prompt: "$", text: "export DB_HOST=\"prod-db.local\"" },
            { type: 'comment', text: "Set environment variable in current shell" },
            { type: 'cmd', prompt: "$", text: "echo $DB_HOST" },
            { type: 'comment', text: "Read env variable" },
            { type: 'cmd', prompt: "$", text: "env | grep DB_" },
            { type: 'comment', text: "List env variables matching DB_" },
            { type: 'cmd', prompt: "$", text: "crontab -l" },
            { type: 'comment', text: "List current user cron jobs" },
            { type: 'cmd', prompt: "$", text: "crontab -e" },
            { type: 'comment', text: "Edit cron jobs. Add line below for 2 AM daily backup:" },
            { type: 'output', text: "0 2 * * * /home/ubuntu/scripts/backup.sh >> /var/log/backup.log 2>&1" }
          ]
        }
      ]
    },
    {
      sessionNumber: 4,
      totalSessions: 4,
      sessionTitle: "Advanced SSH Config",
      sections: [
        {
          label: "SSH Shortcuts and Tunneling",
          lines: [
            { type: 'cmd', prompt: "$", text: "ssh-keygen -t ed25519 -C \"my-key\"" },
            { type: 'comment', text: "Generate ed25519 key pair" },
            { type: 'cmd', prompt: "$", text: "cat ~/.ssh/config" },
            { type: 'comment', text: "Configure shortcuts for servers. Example configuration:" },
            { type: 'output', text: "Host webserver\n  HostName 3.250.xxx.xxx\n  User ubuntu\n  IdentityFile ~/.ssh/mykey.pem" },
            { type: 'cmd', prompt: "$", text: "ssh webserver" },
            { type: 'comment', text: "Now connect simply with the shortcut name!" },
            { type: 'cmd', prompt: "$", text: "ssh -L 5432:localhost:5432 ubuntu@3.250.xxx.xxx" },
            { type: 'comment', text: "Forward remote DB port 5432 to local port 5432" }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "Troubleshooting a Slow/Unresponsive Server",
      steps: [
        {
          num: 1,
          title: "Check Disk Space",
          description: "If disk is 100% full, system locks up, and services cannot write logs or PID files.",
          cmd: "df -h"
        },
        {
          num: 2,
          title: "Check Memory & OOM Killer",
          description: "Inspect RAM exhaustion. Check syslog to see if the kernel terminated processes.",
          cmd: "free -h && grep -i \"oom\" /var/log/syslog"
        },
        {
          num: 3,
          title: "Check CPU bottlenecks",
          description: "Find CPU-hungry processes and sort by execution time.",
          cmd: "top -b -n 1 | head -20"
        },
        {
          num: 4,
          title: "Check if disk I/O is saturated",
          description: "Look for high disk read/write wait states.",
          cmd: "iostat -x 1 5"
        }
      ]
    },
    {
      title: "Troubleshooting Cron Execution Failures",
      steps: [
        {
          num: 1,
          title: "Check cron service is active",
          cmd: "sudo systemctl status cron"
        },
        {
          num: 2,
          title: "Check cron execution logs",
          description: "Ensure that cron actually triggered the job.",
          cmd: "grep CRON /var/log/syslog"
        },
        {
          num: 3,
          title: "Check script has executable permissions",
          cmd: "chmod +x script.sh"
        },
        {
          num: 4,
          title: "Ensure script uses absolute paths",
          description: "Cron executes with a minimal PATH environment. Specify the exact binary paths."
        }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Not redirecting output of cron jobs",
      description: "Without redirection, stdout and stderr go to local mail spool. If mail isn't configured, output is completely lost, making debugging impossible.",
      fix: "Fix: Always redirect output to a log file: >> /home/ubuntu/logs/job.log 2>&1."
    },
    {
      mistake: "Hardcoding paths in crontab or cron scripts",
      description: "Cron runs with a very limited PATH env (often just /usr/bin:/bin). Commands like aws or custom binaries installed in /usr/local/bin will fail with 'command not found'.",
      fix: "Fix: Use absolute paths (e.g. /usr/local/bin/aws instead of aws) and define PATH at the top of your script."
    },
    {
      mistake: "Forgetting to test custom nginx configs before reload",
      description: "Reloading nginx with a broken syntax error will cause nginx to crash or reject the reload, causing configuration sync mismatch.",
      fix: "Fix: Always test config with sudo nginx -t before calling reload."
    },
    {
      mistake: "Hardcoding database secrets in script files",
      description: "Committing plain text passwords inside scripts into Git repositories.",
      fix: "Fix: Use environment variables or a secrets manager like AWS SSM Parameter Store."
    }
  ],
  project: {
    tag: "📁 Day 4 Mini Project",
    title: "sys_monitor.sh — Automated Server Health Script",
    timeEstimate: "⏱ ~60 minutes",
    goal: "Write a bash script that checks if disk usage is above 80%, memory usage is above 90%, and Nginx is running. It should append results to a health log and be scheduled to run every hour via cron.",
    checklist: [
      "Create the file ~/scripts/sys_monitor.sh",
      "Extract disk usage percentage and test if > 80",
      "Extract free memory percentage and test if > 90",
      "Check if nginx process is running (using pgrep nginx)",
      "Append structured status message with timestamp to ~/logs/health.log",
      "Configure crontab to trigger the script at the top of every hour"
    ],
    codeBlock: {
      title: "sys_monitor.sh — Complete Script",
      lines: [
        "#!/bin/bash",
        "set -e",
        "",
        "LOG_FILE=\"/home/ubuntu/logs/health.log\"",
        "mkdir -p \"/home/ubuntu/logs\"",
        "",
        "echo \"[$(date)] Running System Health Check\" >> \"$LOG_FILE\"",
        "",
        "# 1. Check Disk Space",
        "DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')",
        "if [ \"$DISK_USAGE\" -gt 80 ]; then",
        "  echo \"  [ALERT] Disk space is low: $DISK_USAGE%\" >> \"$LOG_FILE\"",
        "else",
        "  echo \"  [OK] Disk space: $DISK_USAGE%\" >> \"$LOG_FILE\"",
        "fi",
        "",
        "# 2. Check Memory",
        "FREE_MEM=$(free | grep Mem | awk '{print $4/$2 * 100}' | cut -d. -f1)",
        "USED_MEM=$((100 - FREE_MEM))",
        "if [ \"$USED_MEM\" -gt 90 ]; then",
        "  echo \"  [ALERT] Memory usage high: $USED_MEM%\" >> \"$LOG_FILE\"",
        "else",
        "  echo \"  [OK] Memory usage: $USED_MEM%\" >> \"$LOG_FILE\"",
        "fi",
        "",
        "# 3. Check Nginx",
        "if pgrep nginx > /dev/null; then",
        "  echo \"  [OK] Nginx is running\" >> \"$LOG_FILE\"",
        "else",
        "  echo \"  [ALERT] Nginx is STOPPED\" >> \"$LOG_FILE\"",
        "fi",
        "",
        "echo \"-----------------------------------\" >> \"$LOG_FILE\""
      ]
    },
    expectedOutput: "A log file /home/ubuntu/logs/health.log with entries:\n[Tue Jun 2 15:00:00 UTC 2026] Running System Health Check\n  [OK] Disk space: 34%\n  [OK] Memory usage: 12%\n  [OK] Nginx is running\n-----------------------------------"
  },
  interview: [
    {
      question: "How do you troubleshoot a server that is slow or unresponsive?",
      answer: "I follow a systematic top-down approach. First, I check resource constraints: df -h for disk (a full disk will lock up systems), free -h for memory (to see if memory is exhausted, which triggers the OS OOM killer), and top or htop to find CPU bottlenecks and process hoggers. Second, I look at the network: ss -tlnp to check open ports and netstat connections. Third, I check system and application logs: /var/log/syslog, dmesg, and journalctl. This isolates if the bottleneck is hardware, process-related, network-related, or application crash."
    },
    {
      question: "What is a cron job, and how do you ensure it runs reliably?",
      answer: "A cron job is a scheduled background task in Unix systems. It uses a 5-field syntax (minute, hour, day-of-month, month, day-of-week). To ensure reliability, I do three things: first, always write output redirection (>> /path/to/log.log 2>&1) so stdout/stderr are captured. Second, use absolute paths for all commands and files since cron runs with a minimal PATH environment. Third, I verify service state with systemctl status cron and check execution history in /var/log/syslog."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "How do you inspect which files are opened by a process with PID 1234?",
      options: [
        { text: "A) ps aux | grep 1234", isCorrect: false },
        { text: "B) df -h 1234", isCorrect: false },
        { text: "C) lsof -p 1234", isCorrect: true },
        { text: "D) ss -tlnp", isCorrect: false }
      ],
      explanation: "lsof stands for 'list open files' and -p filters by process ID. Very useful to debug file locking or leak issues."
    },
    {
      num: 2,
      question: "What cron schedule runs a script at 4:30 AM every Sunday?",
      options: [
        { text: "A) * * * * *", isCorrect: false },
        { text: "B) 30 4 * * 0", isCorrect: true },
        { text: "C) 4 30 * * 7", isCorrect: false },
        { text: "D) 30 4 * * 7", isCorrect: false }
      ],
      explanation: "Minutes (30), Hours (4), Day of Month (*), Month (*), Day of Week (0 or 7 represent Sunday in cron)."
    },
    {
      num: 3,
      question: "You see 'Out of memory: Kill process 5678 (nginx)' in syslog. What happened?",
      options: [
        { text: "A) Nginx crashed due to config error", isCorrect: false },
        { text: "B) Nginx reached disk limit", isCorrect: false },
        { text: "C) The OS kernel ran out of RAM and terminated nginx to protect system stability", isCorrect: true },
        { text: "D) Someone ran systemctl stop nginx", isCorrect: false }
      ],
      explanation: "The Linux Out-Of-Memory (OOM) killer automatically terminates processes using excessive RAM when system memory is depleted."
    },
    {
      num: 4,
      question: "What does the command awk '{print $1}' log.txt do?",
      options: [
        { text: "A) Finds the word '$1' in log.txt", isCorrect: false },
        { text: "B) Prints the first character of each line", isCorrect: false },
        { text: "C) Prints the first whitespace-separated column of each line", isCorrect: true },
        { text: "D) Deletes the first column of the file", isCorrect: false }
      ],
      explanation: "awk parses files line-by-line and splits columns by whitespace. $1 corresponds to the first column."
    },
    {
      num: 5,
      question: "Why is ssh -L 8080:localhost:8080 user@server useful?",
      options: [
        { text: "A) It allows SSH connection on port 8080", isCorrect: false },
        { text: "B) It forwards port 8080 from the remote server to port 8080 on your local machine", isCorrect: true },
        { text: "C) It copies files on port 8080", isCorrect: false },
        { text: "D) It opens port 8080 in the firewall", isCorrect: false }
      ],
      explanation: "SSH local port forwarding (-L) lets you securely access remote resources (like a database or internal dashboard) via a local port."
    }
  ],
  github: {
    filename: "devops-notes/day-04/README.md",
    commitMessage: "docs: Add Day 04 notes — Linux deep dive and system debugging",
    template: `# Day 04 — Linux Deep Dive + Processes + System Debugging
**Date:** YYYY-MM-DD | **Status:** ✅ Complete | **Difficulty:** Intermediate+

---

## 🎯 What I Learned Today
- Resource monitoring commands: df, free, top, lsof, journalctl
- Scheduled automation using Cron jobs
- Logging and output redirection
- Advanced text parsing with grep, awk, and sed
- SSH local port forwarding tunnels and shortcuts config

## ⌨️ Commands Reference

\`\`\`bash
# Resource monitoring
df -h
free -h
top
ps aux --sort=-%cpu
lsof -i :8080

# Log searching
grep -i "error" /var/log/syslog
awk '{print $1, $7}' /var/log/nginx/access.log

# Cron
crontab -l
crontab -e

# SSH config
ssh-keygen -t ed25519
ssh -L 5432:localhost:5432 user@server
\`\`\`

## 🏗 Mini Project: sys_monitor.sh
- Location: ~/scripts/sys_monitor.sh
- Purpose: Checks disk, memory, and Nginx health, logs alerts if limits exceeded.
- Scheduled: Runs hourly via Cron.

## ❓ Questions / Review
- How to scale log monitoring with tools like Prometheus or ELK stack next week.`
  }
};
