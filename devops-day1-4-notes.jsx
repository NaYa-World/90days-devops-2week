import { useState } from "react";

const days = [
  {
    day: 1,
    title: "How the Internet Actually Works",
    subtitle: "Mental models before tools. This day separates people who configure vs. people who understand.",
    trainerNote: "90% of DevOps bugs I see in the real world — from juniors AND seniors — are from people who skipped this layer. They Googled the fix without understanding WHY it broke.",
    engineerNote: "I've been in prod incidents at 2am where the person who saved us wasn't the one who knew the most commands. It was the one who understood the flow of a request end-to-end.",
    color: "#00ff9d",
    sections: [
      {
        title: "The Core Mental Model: What Happens When You Visit google.com",
        type: "concept",
        content: [
          "You type google.com → your machine needs an IP address → it asks DNS",
          "DNS is a phone book: name → IP. Without this, nothing works.",
          "Your request travels as packets — small chunks, not one big blob",
          "TCP ensures all packets arrive and in order (reliable, slower)",
          "UDP fires and forgets — used where speed > accuracy (video calls, gaming)",
          "HTTP/HTTPS is the language your browser and server speak on top of TCP",
          "HTTPS = HTTP + TLS encryption. The 'S' means no one in the middle can read the data"
        ]
      },
      {
        title: "The Request Lifecycle (Memorize This Forever)",
        type: "flow",
        steps: [
          { step: "1", label: "Browser", detail: "You type URL → browser parses it" },
          { step: "2", label: "DNS Lookup", detail: "Domain → IP address resolution" },
          { step: "3", label: "TCP Handshake", detail: "3-way: SYN → SYN-ACK → ACK" },
          { step: "4", label: "TLS Handshake", detail: "Certificates exchanged, session encrypted" },
          { step: "5", label: "HTTP Request", detail: "GET /path HTTP/1.1 + headers sent" },
          { step: "6", label: "Server Processing", detail: "App logic runs, DB queried if needed" },
          { step: "7", label: "HTTP Response", detail: "200 OK + headers + body sent back" },
          { step: "8", label: "Render", detail: "Browser parses HTML/CSS/JS and displays" }
        ]
      },
      {
        title: "HTTP Status Codes You Will Debug Daily",
        type: "table",
        headers: ["Code", "Meaning", "DevOps Reality"],
        rows: [
          ["200", "OK", "All good"],
          ["301/302", "Redirect", "Config tells browser to go elsewhere"],
          ["400", "Bad Request", "Client sent garbage — check request format"],
          ["401", "Unauthorized", "No valid credentials — auth issue"],
          ["403", "Forbidden", "Credentials fine, but no permission — IAM/policy issue"],
          ["404", "Not Found", "Path doesn't exist — routing misconfiguration often"],
          ["500", "Internal Server Error", "Your app crashed — check logs immediately"],
          ["502", "Bad Gateway", "Upstream server is down — nginx can't reach your app"],
          ["503", "Service Unavailable", "App overloaded or not running"],
          ["504", "Gateway Timeout", "Upstream too slow — timeout config or perf issue"]
        ]
      },
      {
        title: "Ports: The Apartment Numbers of Networking",
        type: "concept",
        content: [
          "IP address = the building. Port = the specific apartment",
          "Port 22 → SSH (how you remotely control servers)",
          "Port 80 → HTTP (unencrypted web)",
          "Port 443 → HTTPS (encrypted web)",
          "Port 3306 → MySQL database",
          "Port 5432 → PostgreSQL database",
          "Port 6379 → Redis",
          "Port 8080 → Common app dev port (not 80 because low ports need root)",
          "Firewall rules control which ports are open — this is security layer 1"
        ]
      },
      {
        title: "Real Mistakes Everyone Makes (Trainer Sees Weekly)",
        type: "mistakes",
        items: [
          { mistake: "Confusing DNS propagation with app downtime", fix: "DNS changes take 0–48 hrs to propagate globally. App changes are instant. Know which you changed." },
          { mistake: "Thinking HTTPS = the server is safe", fix: "HTTPS only encrypts transit. If your app has SQLi vulnerability, HTTPS doesn't protect you." },
          { mistake: "Not knowing what port their app runs on", fix: "Always know: what port does my app listen on? What does the firewall allow? Are they the same?" },
          { mistake: "Confusing 401 and 403", fix: "401 = who are you? 403 = I know who you are, you just can't come in." }
        ]
      },
      {
        title: "Day 1 Lab (Do This, Don't Skip)",
        type: "lab",
        items: [
          "Open terminal: run `curl -v https://google.com` — read every line of output",
          "Run `nslookup google.com` — see DNS resolution live",
          "Run `traceroute google.com` (Mac/Linux) or `tracert google.com` (Windows)",
          "Open browser DevTools → Network tab → reload any website → look at every request",
          "Identify: which requests are 200? Any 301? What's the largest file?",
          "Run `netstat -tuln` on your machine — see what ports are currently open"
        ]
      }
    ]
  },
  {
    day: 2,
    title: "Linux: The Operating System of Everything",
    subtitle: "Every server you'll ever manage runs Linux. This isn't optional — it's the floor.",
    trainerNote: "I've interviewed 200+ DevOps candidates. Those who can't navigate Linux confidently don't get offers — regardless of their cloud or Kubernetes knowledge. The cloud runs on Linux.",
    engineerNote: "When prod is down, you SSH in and you have maybe 5 commands to figure out what's wrong before your manager calls. You need this muscle memory cold.",
    color: "#ff6b35",
    sections: [
      {
        title: "Why Linux and Not Windows",
        type: "concept",
        content: [
          "95%+ of servers on the internet run Linux — AWS, GCP, Azure all default to Linux",
          "Linux is free, open source, and built for servers — Windows Server licenses cost thousands",
          "Containers (Docker) run Linux kernel — even on Windows, WSL2 is a Linux VM underneath",
          "Shell scripting on Linux is the automation backbone of DevOps",
          "Understanding Linux = understanding the environment where all your code runs"
        ]
      },
      {
        title: "The Linux Filesystem (Mental Map)",
        type: "table",
        headers: ["Directory", "What Lives Here", "Why You Care"],
        rows: [
          ["/", "Root of everything", "All paths start here"],
          ["/home/username", "Your user files", "Where you work as a normal user"],
          ["/etc", "Config files", "App configs, system configs — you'll edit here constantly"],
          ["/var/log", "Log files", "FIRST place to look when something breaks"],
          ["/tmp", "Temporary files", "Cleared on reboot — never store important things here"],
          ["/usr/bin", "User programs", "Where installed apps live (git, curl, python...)"],
          ["/opt", "Optional software", "Third-party apps you install manually"],
          ["/proc", "Virtual filesystem", "Live kernel and process info — no real files"]
        ]
      },
      {
        title: "Commands You Will Use Every Single Day",
        type: "commands",
        groups: [
          {
            group: "Navigation",
            cmds: [
              { cmd: "pwd", desc: "Print working directory — where am I right now?" },
              { cmd: "ls -la", desc: "List all files including hidden, with permissions" },
              { cmd: "cd /path", desc: "Change directory" },
              { cmd: "cd ~", desc: "Go home" },
              { cmd: "cd ..", desc: "Go up one level" }
            ]
          },
          {
            group: "File Operations",
            cmds: [
              { cmd: "cat file.txt", desc: "Print file contents" },
              { cmd: "less file.txt", desc: "View large files page by page (q to quit)" },
              { cmd: "tail -f /var/log/app.log", desc: "Watch logs live — prod debugging staple" },
              { cmd: "grep 'ERROR' app.log", desc: "Search for pattern in file" },
              { cmd: "grep -r 'keyword' /etc/", desc: "Recursively search directory" },
              { cmd: "cp source dest", desc: "Copy file" },
              { cmd: "mv source dest", desc: "Move or rename file" },
              { cmd: "rm -rf /path", desc: "Delete recursively — DANGEROUS, double-check path" }
            ]
          },
          {
            group: "Process Management",
            cmds: [
              { cmd: "ps aux", desc: "See all running processes" },
              { cmd: "top", desc: "Live system resource monitor (q to quit)" },
              { cmd: "htop", desc: "Better top — install it always" },
              { cmd: "kill -9 PID", desc: "Force kill a process by its ID" },
              { cmd: "systemctl status nginx", desc: "Check if a service is running" },
              { cmd: "systemctl restart nginx", desc: "Restart a service" },
              { cmd: "journalctl -u nginx -f", desc: "Follow service logs in real time" }
            ]
          },
          {
            group: "Permissions",
            cmds: [
              { cmd: "chmod 755 file", desc: "Owner: rwx, Group: r-x, Others: r-x" },
              { cmd: "chmod +x script.sh", desc: "Make file executable" },
              { cmd: "chown user:group file", desc: "Change file owner" },
              { cmd: "sudo command", desc: "Run as root (superuser)" },
              { cmd: "whoami", desc: "Which user am I?" }
            ]
          },
          {
            group: "Network Debugging",
            cmds: [
              { cmd: "ping google.com", desc: "Is this host reachable?" },
              { cmd: "curl -I https://site.com", desc: "Fetch headers only — check status codes" },
              { cmd: "wget URL", desc: "Download file from URL" },
              { cmd: "ss -tuln", desc: "Show open ports (modern netstat)" },
              { cmd: "ifconfig / ip addr", desc: "See your IP address" }
            ]
          }
        ]
      },
      {
        title: "File Permissions — The Part Everyone Gets Wrong",
        type: "concept",
        content: [
          "Every file has 3 permission groups: Owner | Group | Others",
          "Each group has 3 bits: Read (4) | Write (2) | Execute (1)",
          "chmod 755 = Owner gets 7 (4+2+1=rwx), Group gets 5 (4+0+1=r-x), Others get 5",
          "chmod 600 = Owner gets 6 (rw-), Group and Others get 0 (---)",
          "SSH keys MUST be 600 — too-open permissions and SSH refuses to use them",
          "Directories need execute bit to be entered — 644 on a directory = can't cd into it",
          "When in doubt: 644 for files, 755 for directories, 600 for secrets"
        ]
      },
      {
        title: "Shell Scripting Basics (Automation Starts Here)",
        type: "code",
        language: "bash",
        snippets: [
          {
            title: "Your first script",
            code: `#!/bin/bash
# The shebang line tells the OS which interpreter to use

echo "Hello, DevOps"

# Variables
NAME="production"
echo "Environment: $NAME"

# Conditionals
if [ -f "/etc/nginx/nginx.conf" ]; then
  echo "Nginx config exists"
else
  echo "Nginx config missing — investigate"
fi

# Loops
for server in web01 web02 web03; do
  echo "Checking $server..."
  ping -c 1 $server > /dev/null && echo "$server is up" || echo "$server is DOWN"
done`
          }
        ]
      },
      {
        title: "Real Mistakes Everyone Makes (Engineer War Stories)",
        type: "mistakes",
        items: [
          { mistake: "`rm -rf /` or `rm -rf / path` (space before path)", fix: "Always echo the command first. Use --dry-run. Never run rm -rf as root without double-checking." },
          { mistake: "chmod 777 on everything to fix permission errors", fix: "777 means ANYONE can read/write/execute. Never use in prod. Find the real permission needed." },
          { mistake: "Editing /etc/sudoers directly with vim", fix: "Always use `visudo` — it validates syntax before saving. Bad sudoers file = locked out of sudo forever." },
          { mistake: "Not using `tail -f` and instead watching static logs", fix: "In prod, logs grow fast. `tail -f` follows in real-time. Add `| grep ERROR` to filter noise." }
        ]
      },
      {
        title: "Day 2 Lab",
        type: "lab",
        items: [
          "Install Ubuntu on WSL2 (Windows) or use your Mac terminal or spin up a free AWS EC2",
          "Navigate to /var/log — list all files — read the last 20 lines of syslog",
          "Create a directory structure: mkdir -p ~/devops/day2/scripts",
          "Write a script that checks if a list of 3 made-up hostnames are pingable",
          "Change permissions: make the script executable, run it",
          "Use `grep` to find any ERROR lines in /var/log/syslog",
          "Check what processes are running: ps aux | grep python"
        ]
      }
    ]
  },
  {
    day: 3,
    title: "Git: Version Control Is Not Optional",
    subtitle: "Every piece of infrastructure, config, and code in professional DevOps lives in Git. No exceptions.",
    trainerNote: "I've seen teams lose entire infrastructure configs because someone 'just edited the server directly'. Git is the foundation of GitOps, CI/CD, collaboration, and disaster recovery. Learn it like breathing.",
    engineerNote: "In my first job I force-pushed to main and broke the release pipeline for 3 hours. That never happens when you understand Git's internals, not just the commands.",
    color: "#a855f7",
    sections: [
      {
        title: "What Git Actually Is (Not What People Think)",
        type: "concept",
        content: [
          "Git is NOT a backup tool — it's a directed acyclic graph of snapshots",
          "Every commit is a snapshot of your entire project, not a diff",
          "Git stores objects: blobs (files), trees (directories), commits (snapshots), tags",
          "A branch is just a pointer to a commit — it's not a copy of the code",
          "HEAD is a pointer to where you currently are in the graph",
          "Remote (GitHub/GitLab) is just another copy of the same graph — not the 'real' one",
          "Merge and rebase both integrate changes — they create different graph shapes"
        ]
      },
      {
        title: "Git Workflow That Actually Works in Teams",
        type: "flow",
        steps: [
          { step: "1", label: "Clone/Pull", detail: "Get latest code from remote" },
          { step: "2", label: "Branch", detail: "git checkout -b feature/your-thing" },
          { step: "3", label: "Work", detail: "Edit files, write code, make changes" },
          { step: "4", label: "Stage", detail: "git add specific-files (not git add .)" },
          { step: "5", label: "Commit", detail: "git commit -m 'descriptive message'" },
          { step: "6", label: "Push", detail: "git push origin feature/your-thing" },
          { step: "7", label: "Pull Request", detail: "Create PR, get review, merge to main" },
          { step: "8", label: "Delete Branch", detail: "Clean up after merge" }
        ]
      },
      {
        title: "Commands You Will Use Daily",
        type: "commands",
        groups: [
          {
            group: "Setup",
            cmds: [
              { cmd: "git config --global user.name 'Name'", desc: "Set your identity" },
              { cmd: "git config --global user.email 'email'", desc: "Set email (matches GitHub)" },
              { cmd: "git init", desc: "Initialize new repo in current folder" },
              { cmd: "git clone URL", desc: "Copy existing repo to your machine" }
            ]
          },
          {
            group: "Daily Work",
            cmds: [
              { cmd: "git status", desc: "What changed? What's staged? Run this constantly." },
              { cmd: "git diff", desc: "What exactly changed in unstaged files" },
              { cmd: "git diff --staged", desc: "What's staged and about to be committed" },
              { cmd: "git add filename", desc: "Stage specific file (not git add . blindly)" },
              { cmd: "git commit -m 'msg'", desc: "Commit staged changes with message" },
              { cmd: "git log --oneline --graph", desc: "See commit history visually" },
              { cmd: "git show COMMIT_HASH", desc: "See what a specific commit changed" }
            ]
          },
          {
            group: "Branching",
            cmds: [
              { cmd: "git branch", desc: "List all local branches" },
              { cmd: "git checkout -b feature/name", desc: "Create and switch to new branch" },
              { cmd: "git checkout main", desc: "Switch to main branch" },
              { cmd: "git merge feature/name", desc: "Merge branch into current branch" },
              { cmd: "git branch -d feature/name", desc: "Delete branch after merge" }
            ]
          },
          {
            group: "Remote Operations",
            cmds: [
              { cmd: "git pull origin main", desc: "Get latest from remote main" },
              { cmd: "git push origin branch-name", desc: "Push your branch to remote" },
              { cmd: "git fetch --all", desc: "Download remote changes without merging" },
              { cmd: "git remote -v", desc: "See where remote points to" }
            ]
          },
          {
            group: "Fixing Mistakes",
            cmds: [
              { cmd: "git restore filename", desc: "Undo unstaged changes to file" },
              { cmd: "git restore --staged filename", desc: "Unstage a file" },
              { cmd: "git revert HASH", desc: "Safely undo a commit (creates new commit)" },
              { cmd: "git stash", desc: "Temporarily shelve your changes" },
              { cmd: "git stash pop", desc: "Bring stashed changes back" }
            ]
          }
        ]
      },
      {
        title: "Writing Commit Messages That Don't Get You Mocked in PRs",
        type: "concept",
        content: [
          "Bad: 'fix stuff', 'update', 'wip', 'asdfgh', 'changes'",
          "Good format: <type>: <short summary in present tense>",
          "Types: feat | fix | docs | refactor | test | chore | ci",
          "Example: 'feat: add health check endpoint to API gateway'",
          "Example: 'fix: correct nginx upstream timeout causing 504s'",
          "Example: 'ci: add Docker build step to GitHub Actions pipeline'",
          "First line max 72 chars. Add blank line then details if needed.",
          "Future you — and your team — will thank you at 2am"
        ]
      },
      {
        title: ".gitignore — What Never Goes in Git",
        type: "concept",
        content: [
          "Secrets: API keys, passwords, .env files — NEVER commit these",
          "If a secret is committed even once, rotate it — it's in the history forever",
          "Build artifacts: node_modules/, __pycache__/, .class files, dist/",
          "OS files: .DS_Store (Mac), Thumbs.db (Windows)",
          "IDE files: .vscode/, .idea/",
          "Terraform state: *.tfstate — state has sensitive data in plaintext",
          "Use gitignore.io to generate for your stack"
        ]
      },
      {
        title: "Real Mistakes Everyone Makes",
        type: "mistakes",
        items: [
          { mistake: "Committing .env files or AWS credentials", fix: "Add to .gitignore before first commit. If already committed: rotate the credentials NOW, use git-filter-repo to purge history." },
          { mistake: "Force pushing to main (`git push --force`)", fix: "Force push rewrites history. Other people's local copies diverge. Never force push to shared branches. Use --force-with-lease at minimum." },
          { mistake: "Merging without pulling latest first", fix: "Always `git pull origin main` before merging. Prevents unnecessary merge conflicts." },
          { mistake: "One giant commit with 'all my changes'", fix: "Commit logically small chunks. Debugging a 50-file commit at 3am is a nightmare." }
        ]
      },
      {
        title: "Day 3 Lab",
        type: "lab",
        items: [
          "Create a GitHub account if you don't have one — this is your portfolio",
          "Create a new repo called 'devops-90days' — make it public",
          "Clone it locally, create a folder structure for each week",
          "Create a README.md explaining what you're learning",
          "Practice the full flow: branch → edit → add → commit → push → PR → merge",
          "Add a .gitignore for Python and Node",
          "Look at an open-source project's commit history — study how pros write messages"
        ]
      }
    ]
  },
  {
    day: 4,
    title: "Linux Deep Dive + Processes + System Debugging",
    subtitle: "Day 1 was theory. Day 2 was commands. Day 4 is what you do when something breaks.",
    trainerNote: "This is the day that separates DevOps engineers from people who just 'deploy stuff'. Production goes down. You have to find it fast. This is the systematic debugging framework.",
    engineerNote: "The best incident responder I've worked with didn't know every tool. They had a mental framework: hardware → OS → process → network → app. They always found the issue in under 10 minutes.",
    color: "#38bdf8",
    sections: [
      {
        title: "The Debugging Framework (Use Every Time)",
        type: "flow",
        steps: [
          { step: "1", label: "Is it hardware/VM?", detail: "df -h (disk), free -h (memory), top (CPU)" },
          { step: "2", label: "Is the OS healthy?", detail: "dmesg | tail, journalctl -xe, uptime" },
          { step: "3", label: "Is the process running?", detail: "systemctl status, ps aux | grep app" },
          { step: "4", label: "Is it a network issue?", detail: "ss -tuln, curl localhost:port, ping" },
          { step: "5", label: "What do the logs say?", detail: "tail -f /var/log/*, journalctl -f" },
          { step: "6", label: "Did something change?", detail: "Check Git history, recent deploys, cron jobs" }
        ]
      },
      {
        title: "System Health Commands — Your First 60 Seconds in an Incident",
        type: "commands",
        groups: [
          {
            group: "Resource Check",
            cmds: [
              { cmd: "df -h", desc: "Disk usage — full disk = app crashes silently" },
              { cmd: "du -sh /var/log/*", desc: "What's eating disk? Logs are usually the culprit" },
              { cmd: "free -h", desc: "Memory usage — is the app OOM (out of memory)?" },
              { cmd: "top / htop", desc: "Which process is eating CPU or memory?" },
              { cmd: "uptime", desc: "Load average — if > CPU count, system is overloaded" },
              { cmd: "iostat -x 1", desc: "Disk I/O — is disk the bottleneck?" }
            ]
          },
          {
            group: "Process Deep Dive",
            cmds: [
              { cmd: "ps aux --sort=-%cpu", desc: "Sort by CPU usage — who's hogging?" },
              { cmd: "ps aux --sort=-%mem", desc: "Sort by memory" },
              { cmd: "lsof -p PID", desc: "What files does this process have open?" },
              { cmd: "lsof -i :8080", desc: "What process is listening on port 8080?" },
              { cmd: "strace -p PID", desc: "Trace system calls — deep debugging" }
            ]
          },
          {
            group: "Log Analysis",
            cmds: [
              { cmd: "tail -n 100 /var/log/syslog", desc: "Last 100 lines of syslog" },
              { cmd: "journalctl -u service -n 50 --no-pager", desc: "Last 50 lines of service log" },
              { cmd: "journalctl -xe", desc: "Recent system errors with context" },
              { cmd: "grep -i 'error\\|warn\\|crit' /var/log/syslog", desc: "Filter for problems" },
              { cmd: "awk '{print $1,$2,$3}' /var/log/nginx/access.log | sort | uniq -c | sort -rn", desc: "Most common request times — spot traffic spikes" }
            ]
          },
          {
            group: "Cron & Scheduled Tasks",
            cmds: [
              { cmd: "crontab -l", desc: "List current user's cron jobs" },
              { cmd: "cat /etc/crontab", desc: "System-wide cron jobs" },
              { cmd: "ls /etc/cron.d/", desc: "App-specific cron job files" },
              { cmd: "journalctl | grep CRON", desc: "See cron execution history" }
            ]
          }
        ]
      },
      {
        title: "Cron Jobs: Automating the World",
        type: "concept",
        content: [
          "Cron runs commands on a schedule — the backbone of ops automation",
          "Format: minute hour day-of-month month day-of-week command",
          "* = every, */5 = every 5, 0 = zero (midnight/sunday/etc)",
          "`0 2 * * *` = 2:00 AM every day",
          "`*/15 * * * *` = every 15 minutes",
          "`0 9 * * 1` = 9 AM every Monday",
          "Always redirect output: `command >> /var/log/myjob.log 2>&1`",
          "Without redirect, output goes to email (which no one reads) and errors disappear",
          "Use crontab.guru to build and verify cron expressions"
        ]
      },
      {
        title: "Environment Variables: The Config Layer",
        type: "concept",
        content: [
          "Apps should not have config hardcoded — they read from environment",
          "`export DB_HOST=localhost` sets a variable in current shell session",
          "`echo $DB_HOST` reads it back",
          "`env` lists all current environment variables",
          ".env files store variables for local development — never commit to Git",
          "In prod: use a secrets manager (AWS Secrets Manager, HashiCorp Vault)",
          "12-factor app principle: config in environment, not in code",
          "This is why Docker -e flags and Kubernetes ConfigMaps exist"
        ]
      },
      {
        title: "Text Processing Tools That Save Hours",
        type: "commands",
        groups: [
          {
            group: "grep, awk, sed — The Holy Trinity",
            cmds: [
              { cmd: "grep -v 'pattern' file", desc: "Show lines that DON'T match" },
              { cmd: "grep -c 'ERROR' app.log", desc: "Count matching lines" },
              { cmd: "awk '{print $5}' file", desc: "Print 5th column of each line" },
              { cmd: "awk -F',' '{print $2}' csv", desc: "Print 2nd field, comma-separated" },
              { cmd: "sed 's/old/new/g' file", desc: "Replace all occurrences of old with new" },
              { cmd: "cut -d':' -f1 /etc/passwd", desc: "Get usernames from passwd file" },
              { cmd: "sort | uniq -c | sort -rn", desc: "Count unique occurrences, sort by frequency" },
              { cmd: "wc -l file", desc: "Count lines in file" }
            ]
          }
        ]
      },
      {
        title: "The SSH Deep Dive — You Live Here",
        type: "concept",
        content: [
          "SSH = Secure Shell. How you remotely control any Linux server.",
          "`ssh user@ip-address` — basic connection",
          "SSH keys: never use passwords on production servers. Always key-based auth.",
          "`ssh-keygen -t ed25519` — generate a key pair (ed25519 is modern standard)",
          "Private key stays on YOUR machine only. Public key goes on the server.",
          "Server stores your public key in `~/.ssh/authorized_keys`",
          "`ssh -i ~/.ssh/mykey.pem user@server` — specify which key to use",
          "`~/.ssh/config` — create shortcuts for frequently used servers",
          "SSH tunneling: `ssh -L 5432:localhost:5432 user@server` — forward remote port to local",
          "This lets you access a remote database as if it were local"
        ]
      },
      {
        title: "Real Incident Scenarios — What You'll Actually Face",
        type: "mistakes",
        items: [
          { mistake: "App returns 502 suddenly in prod", fix: "1. Is app process running? (systemctl status) 2. What's in app logs? (journalctl -f) 3. Did disk fill up? (df -h) 4. Did someone deploy? (git log)" },
          { mistake: "Server is extremely slow, high load", fix: "top → find PID eating CPU → ps aux to see what it is → lsof -p PID → decide: kill it or investigate" },
          { mistake: "Disk full, everything breaking", fix: "df -h to confirm → du -sh /* to find biggest directory → du -sh /var/log/* → usually logs → truncate or delete old logs → `> bigfile.log` to empty without deleting" },
          { mistake: "Can't SSH into server", fix: "Check: correct IP? Correct key? Security group allows port 22? Try verbose: ssh -vvv user@ip to see where it fails" }
        ]
      },
      {
        title: "Day 4 Lab",
        type: "lab",
        items: [
          "Simulate high disk: create large files with `dd if=/dev/zero of=bigfile bs=1M count=500`, then find and delete them",
          "Write a cron job that runs every minute and appends timestamp to a log file — verify it runs",
          "Set environment variables, write a bash script that reads them and fails gracefully if they're missing",
          "Practice SSH: if you have AWS free tier, spin up an EC2, generate keys, SSH in without a password",
          "Take a real web server log (download nginx sample log) and use grep/awk to: count 500 errors, find the most-hit URL, find top IP addresses",
          "Write a health check script: checks disk (<80%), checks memory (<90%), checks if a process is running — prints OK or ALERT"
        ]
      }
    ]
  }
];

const ConfidenceBadge = ({ level }) => {
  const map = {
    Certain: { color: "#00ff9d", bg: "#00ff9d18" },
    Likely: { color: "#ff6b35", bg: "#ff6b3518" },
    Guessing: { color: "#a855f7", bg: "#a855f718" }
  };
  const style = map[level] || map.Certain;
  return (
    <span style={{ fontSize: "10px", fontFamily: "monospace", border: `1px solid ${style.color}`, color: style.color, background: style.bg, borderRadius: "3px", padding: "1px 5px", marginLeft: "6px" }}>
      [{level}]
    </span>
  );
};

export default function DevOpsNotes() {
  const [activeDay, setActiveDay] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});

  const day = days[activeDay];

  const toggleSection = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const renderSection = (section, idx) => {
    const isExpanded = expandedSections[idx] !== false;

    return (
      <div key={idx} style={{ marginBottom: "20px", border: "1px solid #1e1e2e", borderRadius: "10px", overflow: "hidden", background: "#0d0d1a" }}>
        <div
          onClick={() => toggleSection(idx)}
          style={{ padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111127", borderBottom: isExpanded ? "1px solid #1e1e2e" : "none" }}
        >
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "13px", color: day.color, fontWeight: "bold" }}>
            {section.title}
          </span>
          <span style={{ color: "#555", fontSize: "18px" }}>{isExpanded ? "−" : "+"}</span>
        </div>

        {isExpanded && (
          <div style={{ padding: "18px" }}>

            {section.type === "concept" && (
              <ul style={{ margin: 0, paddingLeft: "0", listStyle: "none" }}>
                {section.content.map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", fontSize: "13.5px", color: "#c0c0d0", lineHeight: "1.6" }}>
                    <span style={{ color: day.color, flexShrink: 0 }}>▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.type === "flow" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {section.steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: day.color, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: "bold", fontSize: "12px", flexShrink: 0, marginTop: "2px" }}>
                      {s.step}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: "bold", fontSize: "13px" }}>{s.label}</div>
                      <div style={{ color: "#888", fontSize: "12px", marginTop: "2px" }}>{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === "table" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                  <thead>
                    <tr>
                      {section.headers.map((h, i) => (
                        <th key={i} style={{ textAlign: "left", padding: "8px 12px", color: day.color, fontFamily: "monospace", borderBottom: `1px solid ${day.color}44`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, ri) => (
                      <tr key={ri} style={{ borderBottom: "1px solid #1a1a2e" }}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding: "8px 12px", color: ci === 0 ? "#fff" : "#aaa", fontFamily: ci === 0 ? "monospace" : "inherit", verticalAlign: "top" }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section.type === "commands" && (
              <div>
                {section.groups.map((group, gi) => (
                  <div key={gi} style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", color: day.color, fontFamily: "monospace", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      // {group.group}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {group.cmds.map((c, ci) => (
                        <div key={ci} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "16px", padding: "8px 12px", background: "#0a0a18", borderRadius: "6px", borderLeft: `2px solid ${day.color}55` }}>
                          <code style={{ color: day.color, fontFamily: "monospace", fontSize: "12px", whiteSpace: "nowrap" }}>{c.cmd}</code>
                          <span style={{ color: "#888", fontSize: "12px", alignSelf: "center" }}>// {c.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === "mistakes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {section.items.map((item, i) => (
                  <div key={i} style={{ border: "1px solid #ff4d4d33", borderRadius: "8px", overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#1a0808", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ color: "#ff4d4d", fontSize: "16px", flexShrink: 0 }}>✗</span>
                      <span style={{ color: "#ff9999", fontSize: "13px" }}><strong>Mistake:</strong> {item.mistake}</span>
                    </div>
                    <div style={{ padding: "10px 14px", background: "#081a08", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ color: "#00ff9d", fontSize: "16px", flexShrink: 0 }}>✓</span>
                      <span style={{ color: "#88ff99", fontSize: "13px" }}><strong>Fix:</strong> {item.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === "lab" && (
              <div>
                <div style={{ fontSize: "11px", color: "#f59e0b", fontFamily: "monospace", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  ⚡ Hands-On — Do Not Skip This
                </div>
                <ol style={{ margin: 0, paddingLeft: "20px" }}>
                  {section.items.map((item, i) => (
                    <li key={i} style={{ color: "#c0c0d0", fontSize: "13px", marginBottom: "10px", lineHeight: "1.6" }}>{item}</li>
                  ))}
                </ol>
              </div>
            )}

            {section.type === "code" && (
              <div>
                {section.snippets.map((s, si) => (
                  <div key={si}>
                    <div style={{ fontSize: "11px", color: "#888", fontFamily: "monospace", marginBottom: "8px" }}>// {s.title}</div>
                    <pre style={{ margin: 0, padding: "16px", background: "#050510", borderRadius: "8px", border: "1px solid #1e1e2e", overflowX: "auto", fontSize: "12px", color: "#c0c0d0", fontFamily: "monospace", lineHeight: "1.7" }}>
                      {s.code}
                    </pre>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#070712", color: "#e0e0f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d0d1f 0%, #070712 100%)", borderBottom: "1px solid #1a1a2e", padding: "24px 20px 0" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#555", fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>
                90 Days: Zero to DevOps Job
              </div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px" }}>
                Week 1 — Foundation Days
              </h1>
              <p style={{ margin: "6px 0 0", color: "#666", fontSize: "13px" }}>
                Dual-perspective notes: Trainer <ConfidenceBadge level="Certain" /> + Engineer <ConfidenceBadge level="Certain" />
              </p>
            </div>
            <div style={{ background: "#111127", border: "1px solid #1e1e2e", borderRadius: "8px", padding: "10px 16px", fontSize: "12px", color: "#888" }}>
              <div style={{ color: "#fff", fontWeight: "bold", marginBottom: "2px" }}>Current Phase</div>
              <div style={{ color: "#00ff9d" }}>Days 1–4 of 90</div>
            </div>
          </div>

          {/* Day Tabs */}
          <div style={{ display: "flex", gap: "4px", marginTop: "20px" }}>
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  borderRadius: "8px 8px 0 0",
                  background: activeDay === i ? d.color : "#111127",
                  color: activeDay === i ? "#000" : "#666",
                  fontWeight: activeDay === i ? "bold" : "normal",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap"
                }}
              >
                Day {d.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Day Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>

        {/* Day Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: day.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#000", fontSize: "16px", fontFamily: "monospace" }}>
              {day.day}
            </div>
            <div>
              <h2 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: "900" }}>{day.title}</h2>
              <p style={{ margin: 0, color: "#888", fontSize: "12.5px" }}>{day.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Dual Perspective Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          <div style={{ background: "#0d0d1a", border: `1px solid ${day.color}44`, borderRadius: "10px", padding: "14px" }}>
            <div style={{ fontSize: "10px", color: day.color, fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
              🎓 Trainer (Market Reality)
            </div>
            <p style={{ margin: 0, color: "#bbb", fontSize: "12.5px", lineHeight: "1.6", fontStyle: "italic" }}>"{day.trainerNote}"</p>
          </div>
          <div style={{ background: "#0d0d1a", border: "1px solid #ffffff22", borderRadius: "10px", padding: "14px" }}>
            <div style={{ fontSize: "10px", color: "#aaa", fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
              ⚙️ Senior Engineer (War Story)
            </div>
            <p style={{ margin: 0, color: "#bbb", fontSize: "12.5px", lineHeight: "1.6", fontStyle: "italic" }}>"{day.engineerNote}"</p>
          </div>
        </div>

        {/* Sections */}
        {day.sections.map((section, idx) => renderSection(section, idx))}

        {/* Bottom Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #1a1a2e" }}>
          <button
            onClick={() => setActiveDay(Math.max(0, activeDay - 1))}
            disabled={activeDay === 0}
            style={{ padding: "10px 20px", background: activeDay === 0 ? "#111" : "#1a1a2e", border: "1px solid #333", borderRadius: "8px", color: activeDay === 0 ? "#444" : "#fff", cursor: activeDay === 0 ? "not-allowed" : "pointer", fontFamily: "monospace", fontSize: "13px" }}
          >
            ← Previous Day
          </button>
          <div style={{ color: "#444", fontSize: "12px", alignSelf: "center", fontFamily: "monospace" }}>
            Day {activeDay + 1} of {days.length} (Week 1)
          </div>
          <button
            onClick={() => setActiveDay(Math.min(days.length - 1, activeDay + 1))}
            disabled={activeDay === days.length - 1}
            style={{ padding: "10px 20px", background: activeDay === days.length - 1 ? "#111" : day.color, border: "none", borderRadius: "8px", color: "#000", cursor: activeDay === days.length - 1 ? "not-allowed" : "pointer", fontFamily: "monospace", fontSize: "13px", fontWeight: "bold" }}
          >
            Next Day →
          </button>
        </div>
      </div>
    </div>
  );
}
