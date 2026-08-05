import { Phase } from '../types/roadmap';

export const PHASES_V5: Phase[] = [
  {
    "id": "phase-1",
    "phase": 1,
    "title": "Linux & Bash Scripting — The Foundation",
    "days": "Days 1–12",
    "icon": "🐧",
    "instanceType": "t2.micro",
    "estimatedCost": "Free tier eligible — $0",
    "weeklyProject": {
      "title": "Automated Linux Hardening & Monitoring Script",
      "scenario": "Write a single idempotent Bash script that hardens a fresh Amazon Linux 2 instance: creates a deploy user, locks down SSH, installs core utilities, sets up log rotation, and writes a simple health-check cron job.",
      "successCriteria": [
        "Script is idempotent — runs twice without errors",
        "SSH root login and password auth disabled",
        "Deploy user with sudo rights and SSH key created",
        "Health check cron job active and logging to /var/log/health.log",
        "ufw/iptables firewall rules applied"
      ],
      "artifact": "GitHub repo URL with setup.sh and a README"
    },
    "incidentDrill": {
      "title": "SEV-2: Locked Out of Production EC2",
      "scenario": "A misconfigured sshd_config change pushed via a bad Ansible run has locked all engineers out of a production EC2. The server is still running. You must recover access without rebooting via the AWS console.",
      "timeLimit": "20 minutes",
      "postMortemRequired": true
    },
    "dayTasks": [
      {
        "id": "p1-d1",
        "title": "Kernel, Shell & Filesystem Hierarchy Standard",
        "scenario": "You join a new team and need to quickly orient yourself on a production Linux server. Understand what is running, what Linux distribution it is, and how the filesystem is organised before touching anything.",
        "tasks": [
          "Run uname -a and document kernel version, architecture and hostname",
          "Identify distro with cat /etc/os-release and understand LTS vs non-LTS",
          "Navigate the full FHS: /etc, /var, /usr/bin, /usr/local, /opt, /proc, /sys",
          "Read /proc/meminfo and /proc/cpuinfo — understand what these virtual files expose",
          "Use man hier to read the official FHS explanation",
          "Distinguish interactive login shells vs non-login shells (check ~/.bashrc vs ~/.bash_profile)",
          "Verify PATH order and understand why /usr/local/bin comes before /usr/bin"
        ],
        "commands": [
          "uname -a",
          "cat /etc/os-release",
          "ls -la /",
          "cat /proc/cpuinfo | grep \"model name\"",
          "echo $SHELL && type -a ls"
        ],
        "gotcha": "On modern systemd-based distros, /bin and /sbin are symlinks to /usr/bin and /usr/sbin. Scripts that hardcode /bin/bash may behave differently on older RHEL vs Ubuntu. Always use #!/usr/bin/env bash in shebangs.",
        "interviewAnswer": "The FHS standardises directory structure so automation scripts work across distributions. /etc holds configuration, /var holds variable runtime data (logs, spools), /usr holds user programs, and /proc is a virtual filesystem exposing kernel state. Understanding this lets me write portable automation.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Create a gist with your uname, os-release, and /proc/cpuinfo outputs",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d2",
        "title": "File Operations & Linux Permissions Model",
        "scenario": "A developer uploads a deployment script and a configuration file to a shared server. They report the script cannot execute and config is readable by all users. You need to fix both issues without breaking existing access.",
        "tasks": [
          "Understand octal notation — map rwx to 4+2+1 and derive 755, 644, 700",
          "Use chmod symbolic vs octal modes: chmod u+x, chmod go-w, chmod 644",
          "Use chown and chgrp to transfer file ownership to the deploy user",
          "Set the sticky bit on a shared directory: chmod +t /shared",
          "Set the setuid bit on a script and understand the security implications",
          "Use find to locate world-writable files: find / -perm -0002 -type f",
          "Understand umask and configure it for a deploy user to default to 022",
          "Read /etc/sudoers safely with visudo and add a user with NOPASSWD"
        ],
        "commands": [
          "chmod 755 deploy.sh && chmod 640 config.yml",
          "chown deploy:deploy /var/app/",
          "find /var/www -perm /o+w -type f",
          "umask 022"
        ],
        "gotcha": "chmod 777 is never the solution. It grants write access to every user on the system. Always find the owning user/group and grant targeted permissions. A file owned by root but world-writable is a privilege escalation vector.",
        "interviewAnswer": "I resolve permission issues by first checking who the process runs as with ps aux, then ensuring the correct user owns the file with chown, and setting strict permissions. I never use 777 — I use 755 for executables and 644 for read-only files as baseline safe permissions.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist of chmod/chown commands run and their ls -la output confirming the fix",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d3",
        "title": "User & Group Management",
        "scenario": "Your team is onboarding a new DevOps engineer. You need to create an account, set up SSH key authentication, add them to the correct groups, and ensure they cannot use password login.",
        "tasks": [
          "Create user with useradd -m -s /bin/bash -G sudo,docker newengineer",
          "Lock the password with passwd -l newengineer",
          "Create the .ssh directory and authorized_keys with correct permissions (700/600)",
          "Add the users public key to authorized_keys",
          "Configure /etc/sudoers.d/ for user-specific sudo rules",
          "Use groups and id commands to verify group membership",
          "Test SSH key login from a separate terminal before closing your session",
          "Review /etc/passwd, /etc/shadow, and /etc/group structure"
        ],
        "commands": [
          "useradd -m -s /bin/bash newengineer",
          "mkdir -p /home/newengineer/.ssh && chmod 700 /home/newengineer/.ssh",
          "echo \"ssh-rsa AAAA...\" >> /home/newengineer/.ssh/authorized_keys && chmod 600 /home/newengineer/.ssh/authorized_keys",
          "id newengineer"
        ],
        "gotcha": "The .ssh directory must be owned by the user (not root) and have permissions 700. The authorized_keys file must be 600. If either is wrong, SSH will silently ignore the keys and fall back to password authentication.",
        "interviewAnswer": "I create service accounts without shell access (useradd -s /sbin/nologin) for daemon processes, and human accounts with SSH key authentication and locked passwords. I never share accounts — each engineer gets their own key pair for full auditability.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing useradd command, id output and successful SSH key auth test",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d4",
        "title": "Process Management & System Signals",
        "scenario": "A Java application on a production server is consuming 100% CPU and 90% memory. You need to identify it, understand why, gracefully attempt to restart it, and if that fails, force kill it — all without rebooting.",
        "tasks": [
          "Use top and htop to identify the top CPU/memory consuming processes",
          "Use ps aux --sort=-%cpu and ps aux --sort=-%mem to get static snapshots",
          "Use pgrep and pstree to find parent-child process relationships",
          "Use lsof -p <PID> to see all open files and network connections of the process",
          "Send SIGTERM (-15) to request graceful shutdown and monitor for exit",
          "If process does not exit in 30s, send SIGKILL (-9)",
          "Use strace -p <PID> to trace system calls of a stuck process",
          "Understand /proc/<PID>/status, /proc/<PID>/fd, and /proc/<PID>/maps"
        ],
        "commands": [
          "ps aux --sort=-%cpu | head -10",
          "pstree -p $(pgrep java)",
          "lsof -p 12345 | grep -E \"IPv4|IPv6\"",
          "kill -15 12345 && sleep 10 && kill -0 12345 || echo \"Process stopped\"",
          "cat /proc/12345/status"
        ],
        "gotcha": "kill -9 (SIGKILL) cannot be caught, blocked, or ignored — the kernel forcefully terminates the process. This means the process has no chance to flush buffers, close connections, or clean up temp files. Always prefer SIGTERM and give the process 30 seconds. Reserve SIGKILL for truly unresponsive processes.",
        "interviewAnswer": "My process troubleshooting order is: identify with ps/htop, inspect with lsof and strace, attempt graceful shutdown with SIGTERM, verify exit, and only escalate to SIGKILL if the process is truly hung. I document every force-kill in the incident log.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of htop showing the process and the terminal showing kill commands",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d5",
        "title": "Linux Networking Commands — Full Diagnostic Toolkit",
        "scenario": "A microservice reports it cannot connect to the PostgreSQL database on port 5432. The DB team says the server is healthy. You need to diagnose every network layer systematically to find the exact point of failure.",
        "tasks": [
          "Use dig and nslookup to verify DNS resolution of the DB hostname",
          "Use ping to test ICMP reachability (understand ICMP may be blocked)",
          "Use nc -zv db-host 5432 to test TCP connectivity on the specific port",
          "Use ss -tlnp to list all listening sockets on the target server",
          "Use traceroute/tracepath to map the network path to the destination",
          "Use curl -v to test HTTP/HTTPS connectivity including TLS handshake",
          "Use ip route show to inspect routing table",
          "Check /etc/hosts for any override entries that might shadow DNS"
        ],
        "commands": [
          "dig db-host.internal",
          "nc -zv db-host 5432 && echo \"Port open\" || echo \"Port closed\"",
          "ss -tlnp | grep 5432",
          "traceroute db-host.internal",
          "curl -v --connect-timeout 5 http://db-host:8080/health"
        ],
        "gotcha": "AWS Security Groups block ICMP by default, so ping will appear to fail even when the instance is running. Never diagnose connectivity with ping alone. Always test the specific application port using nc or curl. A successful ping only proves ICMP is allowed — not that your application port is reachable.",
        "interviewAnswer": "I follow a layered diagnostic approach: DNS resolution with dig, ICMP with ping, TCP port test with nc, then application-layer with curl. This isolates whether the issue is DNS, routing, firewall, or application. In AWS, I also check Security Groups and NACLs since those are stateful and stateless firewalls respectively.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing full diagnostic output from dig, nc, ss and traceroute commands",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d6",
        "title": "Text Processing — grep, awk, sed, xargs & Pipelines",
        "scenario": "A production Nginx access log has grown to 8GB. You need to extract the top 10 IP addresses making 404 requests, replace deprecated API endpoint paths in a config file, and extract specific fields from a CSV without loading the entire file into memory.",
        "tasks": [
          "Use grep with -E for extended regex, -v for inversion, -c for count",
          "Chain awk to extract specific fields: print $1, $7, $9 from access.log",
          "Combine grep and awk to filter 404s and extract unique IPs with count",
          "Use sort | uniq -c | sort -nr | head to rank by frequency",
          "Use sed for in-place substitution with backup: sed -i.bak s/old/new/g",
          "Use cut -d, -f1,3 to extract CSV columns without awk",
          "Use xargs to delete old log files found by find",
          "Use tee to log pipeline output while still piping it forward"
        ],
        "commands": [
          "awk '$9 == 404 {print $1}' access.log | sort | uniq -c | sort -nr | head -10",
          "sed -i.bak 's/api\\/v1/api\\/v2/g' config.txt",
          "find /var/log -name '*.gz' -mtime +30 | xargs rm -f",
          "grep -E 'ERROR|FATAL' app.log | awk '{print $1, $2, $NF}' | tee errors_summary.txt"
        ],
        "gotcha": "Using cat file | grep is called a \"Useless Use of Cat\" (UUoC). grep can read files directly: grep pattern file. This avoids spawning an extra process. Also, sed without -i.bak means no backup — one typo in your regex destroys the file permanently in-place.",
        "interviewAnswer": "For large log analysis, I always stream with awk and grep rather than loading files into Python or scripts. AWK's field splitting is extremely efficient for structured logs. For complex analytics, I combine awk for extraction, sort for ordering, and uniq -c for counting — this pipeline handles GB-scale files with minimal memory.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing the full awk pipeline for 404 extraction and the sed substitution with before/after output",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d7",
        "title": "SSH Security & Key Management",
        "scenario": "Your organization is auditing SSH access across all production EC2 instances. You need to harden sshd_config, set up SSH agent forwarding for multi-hop connections, and configure SSH config for fast access to multiple servers.",
        "tasks": [
          "Edit /etc/ssh/sshd_config: disable PasswordAuthentication, PermitRootLogin, X11Forwarding",
          "Set AllowUsers and AllowGroups to restrict SSH access to specific identities",
          "Validate config with sshd -t before restarting the service",
          "Configure ~/.ssh/config with Host blocks, IdentityFile, and ProxyJump for bastion",
          "Use ssh-keygen -t ed25519 to generate a modern key pair (avoid RSA-2048)",
          "Use ssh-copy-id to distribute public keys safely",
          "Enable SSH agent with ssh-agent and ssh-add for key forwarding",
          "Audit active SSH sessions with who, w, and last"
        ],
        "commands": [
          "sshd -t && systemctl reload sshd",
          "ssh-keygen -t ed25519 -C \"deploy@company.com\" -f ~/.ssh/id_ed25519",
          "ssh -J bastion.company.com internal-server.private",
          "ss -tnp | grep :22"
        ],
        "gotcha": "Never restart sshd without first testing the config with sshd -t and keeping your current session open while testing a new SSH session in a separate terminal. If you restart with a bad config and lose access, you need AWS Systems Manager Session Manager or the console to recover.",
        "interviewAnswer": "For production SSH hardening: disable password auth and root login, use ed25519 keys (stronger and shorter than RSA), configure AllowGroups to whitelist only the devops group, set ClientAliveInterval for session timeouts, and audit with last. For multi-hop access, I use ProxyJump through a bastion host rather than storing private keys on intermediate servers.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing your hardened sshd_config (sensitive values redacted) and your ~/.ssh/config with ProxyJump",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d8",
        "title": "Bash Scripting — Variables, Conditionals & Loops",
        "scenario": "A junior team member is manually checking disk usage across 5 servers every morning and emailing the team. You need to write a Bash script that automates this: checks disk usage, categorises each mount by warning/critical threshold, and outputs a formatted report.",
        "tasks": [
          "Write a script with proper shebang #!/usr/bin/env bash and set -euo pipefail",
          "Use variables with readonly and local scope inside functions",
          "Use if/elif/else with numeric comparisons: -gt, -lt, -eq, -ge, -le",
          "Use [[]] for string comparisons and pattern matching (prefer over [])",
          "Write a for loop iterating over an array of mount points",
          "Write a while loop reading file line by line with while IFS= read -r line",
          "Use case statements for dispatching on argument values",
          "Use $?, $#, $@, $0, $1 — understand all special variables",
          "Use $(command) for command substitution and $(( )) for arithmetic"
        ],
        "commands": [
          "#!/usr/bin/env bash\nset -euo pipefail",
          "df -h | awk 'NR>1 {print $5, $6}' | while IFS=\" \" read -r usage mount; do\n  pct=${usage%\\%}\n  if (( pct >= 90 )); then echo \"CRITICAL: $mount at $usage\"; elif (( pct >= 75 )); then echo \"WARNING: $mount at $usage\"; fi\ndone"
        ],
        "gotcha": "Never use set -e alone — combine it with set -u (treat unset variables as errors) and set -o pipefail (pipeline fails if any command fails, not just the last). Without pipefail, a script with false | true exits with code 0 and you will miss silent failures in pipelines.",
        "interviewAnswer": "Every production Bash script starts with set -euo pipefail — this turns Bash into a strict mode that catches common silent failure patterns. I also wrap the main logic in a main() function and call it at the bottom, making scripts both sourced and executed safely. Variables are quoted by default to prevent word splitting.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit your disk-check.sh script to a GitHub repo",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d9",
        "title": "Bash Scripting — Functions, Error Handling & Production Patterns",
        "scenario": "The disk check script works locally but fails silently on remote servers via cron. You need to refactor it into a production-grade script with proper error handling, logging, cleanup on exit, retry logic, and a test mode.",
        "tasks": [
          "Define reusable functions with local variables and explicit return codes",
          "Use trap ERR, EXIT, and INT to handle errors and cleanup temp files",
          "Implement a log() function that writes timestamped output to a log file and stdout",
          "Write a retry() wrapper function with configurable attempts and backoff",
          "Use getopts to parse command-line flags (--dry-run, --verbose, --output)",
          "Write a die() function that prints error message and exits with non-zero code",
          "Make the script idempotent: safe to run multiple times with same result",
          "Add a --dry-run mode that prints what it would do without doing it",
          "Write a unit-test style validation at the bottom guarded by [[ \"${BASH_SOURCE[0]}\" == \"$0\" ]]"
        ],
        "commands": [
          "trap cleanup EXIT\ntrap \"die \"Script interrupted\"\" INT TERM",
          "retry() {\n  local max_attempts=$1; shift\n  local attempt=1\n  until \"$@\"; do\n    [[ $attempt -ge $max_attempts ]] && return 1\n    echo \"Attempt $attempt failed. Retrying in $((attempt * 2))s...\"\n    sleep $((attempt * 2))\n    ((attempt++))\n  done\n}"
        ],
        "gotcha": "Cron runs with a minimal environment — $PATH does not include /usr/local/bin or the users PATH. Scripts that work in your terminal silently fail in cron because commands like aws, terraform, or docker are not found. Always use absolute paths for all external commands in cron scripts, or explicitly set PATH at the top of the script.",
        "interviewAnswer": "My production Bash scripts follow SOLID principles: single responsibility (one script does one thing), proper error handling with trap, structured logging, and idempotency. The trap EXIT pattern ensures cleanup always runs, even on unexpected exits. I use a --dry-run flag in all infrastructure scripts so engineers can safely validate before execution.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit the refactored production-grade script with functions, trap, retry, and getopts",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d10",
        "title": "Package Management & systemd Service Management",
        "scenario": "You need to deploy a Node.js API on a fresh Amazon Linux instance: install dependencies via yum, configure the application as a systemd service that restarts on failure, and ensure it starts on boot.",
        "tasks": [
          "Use yum/dnf to install packages, list installed, and remove with dependency cleanup",
          "Use yum history to audit and rollback package changes",
          "Add a custom RPM/yum repository for NodeJS from NodeSource",
          "Write a systemd unit file (.service) for the Node.js application",
          "Set Restart=on-failure and RestartSec in the unit file",
          "Use systemctl enable, start, status, and journalctl -u for log viewing",
          "Set resource limits in the service unit with LimitNOFILE and MemoryMax",
          "Use systemd-analyze to check boot time and identify slow services"
        ],
        "commands": [
          "sudo yum install -y nodejs",
          "systemctl enable --now myapp.service",
          "journalctl -u myapp.service -f --since \"1 hour ago\"",
          "systemd-analyze blame | head -10"
        ],
        "gotcha": "Never pin to package major versions with yum install nodejs. This gives you the OS repository version which is often years behind. Add the NodeSource repository to get the current LTS. Also, systemctl enable does NOT start the service immediately — use enable --now or follow with systemctl start.",
        "interviewAnswer": "I manage application services with systemd unit files that include Restart=on-failure, dependency ordering (After=network.target), and proper environment variable injection via EnvironmentFile. This ensures the service survives crashes, reboots, and deployments without manual intervention.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist with your systemd .service file and journalctl output showing service startup",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d11",
        "title": "Cron Jobs, Log Rotation & Disk Management",
        "scenario": "A production server is running out of disk space. Old logs are never cleaned up, cron jobs are not running reliably, and disk is not monitored. Fix all three issues in one operational session.",
        "tasks": [
          "Use df -h for disk usage and df -i for inode usage (inode exhaustion mimics disk full)",
          "Use du -sh /*  and du -h --max-depth=2 / to find large directories",
          "Use lsof | grep deleted to find files held open by processes that have been deleted",
          "Configure logrotate with daily rotation, compress, and missingok",
          "Write a cron job using full paths and redirecting both stdout and stderr to a log file",
          "Use cron MAILTO= and SHELL= directives to configure environment",
          "Test cron timing with cronitor or manually advance system time in test env",
          "Use watch -n 5 df -h to monitor disk space in real time during cleanup"
        ],
        "commands": [
          "du -h --max-depth=2 /var | sort -rh | head -20",
          "lsof | grep \"(deleted)\" | awk '{print $7, $1, $2}' | sort -rn | head",
          "crontab -e  # Add: 0 2 * * * /usr/local/bin/cleanup.sh >> /var/log/cleanup.log 2>&1"
        ],
        "gotcha": "Deleting a large log file while the process is still writing to it does NOT immediately free disk space. The file descriptor remains open and the inode is still allocated. You must restart the process or truncate the file with > /path/to/file to free space immediately without deleting the file descriptor.",
        "interviewAnswer": "When a server is out of space, I check df -h and df -i (inode exhaustion is equally critical). I use du to find the culprit directory, lsof to find deleted files still held open, then either truncate open files or restart the owning service. Long term, I implement logrotate and a monitoring alert on 85% disk usage.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing df output before and after cleanup, your logrotate config, and your crontab entry",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p1-d12",
        "title": "Phase 1 Weekly Project & Incident Drill",
        "scenario": "PART 1 — Weekly Project: Finalize and test the automated hardening script. PART 2 — Incident Drill: A bad sshd_config change has locked everyone out. Use AWS Systems Manager Session Manager (no SSH) to recover.",
        "tasks": [
          "Run the hardening script on a fresh EC2 instance end-to-end",
          "Verify idempotency by running the script a second time with no errors",
          "Document the AWS SSM Session Manager recovery procedure step by step",
          "Use aws ssm start-session to connect to the locked EC2 without SSH",
          "Revert the bad sshd_config change and test SSH access is restored",
          "Write a blameless postmortem covering root cause, impact, and remediation",
          "Add a validation function to the hardening script that self-tests sshd_config before reloading",
          "Push everything to GitHub with a detailed README"
        ],
        "commands": [
          "bash setup.sh --dry-run && bash setup.sh",
          "aws ssm start-session --target i-0abc123def456",
          "sshd -t && systemctl reload sshd"
        ],
        "gotcha": "AWS Systems Manager Session Manager requires the EC2 to have the SSM Agent installed (pre-installed on Amazon Linux 2) and an IAM Instance Profile with AmazonSSMManagedInstanceCore. Without this profile attached, you have no break-glass access path if SSH is broken.",
        "interviewAnswer": "My hardening scripts always include a self-validation step: run sshd -t before restarting SSH. I also maintain AWS Systems Manager as a break-glass access path — this requires the SSM Agent and correct IAM profile to be configured at instance launch time, not after you are locked out.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "GitHub repo URL containing setup.sh, logrotate config, postmortem.md, and README",
          "exampleFormat": "https://github.com/user/phase1-project",
          "blocksCompletion": true
        }
      }
    ]
  },
  {
    "id": "phase-2",
    "phase": 2,
    "title": "Source Control & Build Automation",
    "days": "Days 13–26",
    "icon": "🐙",
    "instanceType": "N/A",
    "estimatedCost": "$0",
    "weeklyProject": {
      "title": "Multi-module Maven Project with Protected GitHub Repo",
      "scenario": "Create a Java multi-module project (parent POM + api module + core module), configure GitHub branch protection, add a PR template, and set up a Maven release pipeline. The repo must enforce code review before any merge to main.",
      "successCriteria": [
        "Multi-module POM structure builds cleanly with mvn clean verify",
        "Branch protection on main requires 1 approval and passing status checks",
        "PR template present and used in a test PR",
        "Signed commits configured with GPG or SSH signing",
        "Maven release plugin configured for automated versioning"
      ],
      "artifact": "GitHub repo URL with PR screenshot showing branch protection enforcement"
    },
    "incidentDrill": {
      "title": "SEV-1: AWS API Key Committed to Public GitHub Repo",
      "scenario": "An engineer accidentally committed an AWS_SECRET_ACCESS_KEY to main in a public repository 5 minutes ago. GitHub has already scanned it. You must: rotate the key, purge it from Git history, and prevent it from happening again.",
      "timeLimit": "25 minutes",
      "postMortemRequired": true
    },
    "dayTasks": [
      {
        "id": "p2-d13",
        "title": "Git Internals & The Staging Area",
        "scenario": "Your team is reviewing a Git commit that was made incorrectly — it mixes a feature change and a bug fix in one commit, making git bisect and rollbacks painful. Understand Git internals well enough to craft atomic commits.",
        "tasks": [
          "Explore .git directory: understand COMMIT_EDITMSG, HEAD, refs, objects",
          "Use git cat-file -t and git cat-file -p to inspect blobs, trees, commits",
          "Stage partial changes with git add -p (interactive staging)",
          "Use git status and git diff --staged vs git diff to understand the three-tree model",
          "Write a proper multi-line commit message with subject, blank line, and body",
          "Use git commit --amend to fix the last commit message (before pushing)",
          "Understand how SHA-1 hashes link commits in a DAG (Directed Acyclic Graph)",
          "Configure global .gitignore and git config user.email, user.name, core.editor"
        ],
        "commands": [
          "git add -p",
          "git log --oneline --graph --all",
          "git cat-file -p HEAD",
          "git diff --staged",
          "git config --global core.editor vim"
        ],
        "gotcha": "git commit -m is convenient for simple commits but prevents you from writing a detailed body. Git commit messages should follow the convention: imperative subject under 50 chars, blank line, then a body explaining WHY the change was made. The subject is the what, the body is the why.",
        "interviewAnswer": "Git's three-tree model (working directory → index/staging → repository) is the foundation of clean commits. I use git add -p to stage only related changes, creating atomic commits that represent a single logical change. This makes git bisect, git revert, and code review dramatically more effective.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "GitHub commit URL showing a properly formatted multi-line commit message",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d14",
        "title": "Branching Strategies & Merge Patterns",
        "scenario": "Your team has an ongoing debate: some engineers use GitHub Flow, others want Git Flow for a complex product with multiple release trains. Implement both on a test repository and evaluate the trade-offs for a team deploying 10+ times per day.",
        "tasks": [
          "Implement GitHub Flow: create feature branch, PR to main, delete branch on merge",
          "Implement Git Flow: create develop, release/1.0, hotfix/login-crash branches",
          "Use git merge --no-ff to preserve feature branch history in a merge commit",
          "Use git merge --squash to collapse a feature into a single clean commit",
          "Configure git branch naming conventions with a team CONTRIBUTING.md",
          "Use git branch -d (safe) vs git branch -D (force) and understand the difference",
          "Use git log --first-parent to view only merge commits on main",
          "Understand MERGE_HEAD and how to resolve merge conflicts using git mergetool"
        ],
        "commands": [
          "git checkout -b feat/TICKET-123-login-fix",
          "git merge --no-ff feat/TICKET-123-login-fix",
          "git log --oneline --graph --all --decorate",
          "git branch -d feat/TICKET-123-login-fix"
        ],
        "gotcha": "git merge --ff-only (fast-forward only) is the safest for simple linear histories but fails when branches have diverged. git merge --no-ff always creates a merge commit — essential for feature branches so history shows where a feature was developed. Choose intentionally based on your team's branching model.",
        "interviewAnswer": "For teams deploying frequently (10+ times/day), GitHub Flow is superior — it's simple, fast, and aligns with CI/CD. Git Flow adds complexity suited for products with explicit versioned releases. I advocate for trunk-based development with short-lived feature branches (< 1 day) to minimize merge conflicts and maximize CI feedback speed.",
        "artifactContract": {
          "type": "github-pr",
          "instruction": "URL of a PR in your test repo demonstrating branch protection and the --no-ff merge",
          "exampleFormat": "https://github.com/user/repo/pull/1",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d15",
        "title": "Advanced Git — Rebase, Cherry-pick & Stash",
        "scenario": "Your feature branch is 15 commits behind main, making it impossible to merge without massive conflicts. Additionally, a critical bug fix committed in a feature branch needs to be applied to the release branch immediately.",
        "tasks": [
          "Use git rebase main to replay feature branch commits on top of main",
          "Resolve rebase conflicts at each commit using git add and git rebase --continue",
          "Use git rebase -i HEAD~5 to squash, reword, drop, and reorder commits interactively",
          "Use git cherry-pick <SHA> to apply a specific commit to another branch",
          "Use git cherry-pick -n to cherry-pick without auto-committing",
          "Use git stash push -m \"WIP: login form\" to save incomplete work",
          "List, apply, pop, and drop stash entries",
          "Understand when to use rebase vs merge — the golden rule of rebasing"
        ],
        "commands": [
          "git rebase main",
          "git rebase -i HEAD~3",
          "git cherry-pick abc1234",
          "git stash push -m \"WIP feature\" && git stash list && git stash pop"
        ],
        "gotcha": "NEVER rebase commits that have already been pushed to a shared remote branch. Rebasing rewrites commit SHAs — if teammates have pulled those commits, their histories will diverge. Only rebase private local branches or use --force-with-lease (safer than --force) if you must rewrite pushed branches.",
        "interviewAnswer": "Rebase is for integrating changes from main into your local feature branch to keep it up to date — never on shared branches. Cherry-pick is my preferred tool for applying bug fixes to multiple release branches without merging the entire feature. I always use --force-with-lease instead of --force to prevent accidentally overwriting remote commits I haven't seen.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "GitHub commit showing a rebased branch and the cherry-picked fix commit on a separate branch",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d16",
        "title": "Git History, Bisect & Disaster Recovery",
        "scenario": "A bug was introduced somewhere in the last 50 commits. The broken commit caused a 2% revenue drop. You need to find the exact commit using git bisect, then use git reflog to recover from an accidental git reset --hard that deleted local commits.",
        "tasks": [
          "Use git log with --grep, --author, -S (pickaxe search) to narrow history",
          "Use git bisect start, git bisect good, git bisect bad to binary search history",
          "Automate bisect with git bisect run ./test.sh for programmatic good/bad detection",
          "Simulate an accidental git reset --hard HEAD~5 (destroying local commits)",
          "Recover lost commits from git reflog",
          "Use git fsck --lost-found to find dangling commits and blobs",
          "Use git show <SHA>:path/to/file to inspect a file at a specific commit",
          "Tag the found culprit commit and create a revert commit"
        ],
        "commands": [
          "git bisect start && git bisect bad HEAD && git bisect good v1.2.0",
          "git bisect run sh -c \"mvn test -q 2>/dev/null\"",
          "git reflog | head -20",
          "git reset --hard HEAD@{5}  # Recover via reflog"
        ],
        "gotcha": "git reset --hard discards working directory changes permanently — they are NOT in the reflog. However, if you had committed the changes (even locally), they are recoverable from the reflog for up to 90 days (default gc.reflogExpire). The reflog is your safety net for all committed changes.",
        "interviewAnswer": "git bisect has saved our team hours of manual debugging. By automating it with a test script, we can binary search through hundreds of commits in minutes to find exactly which commit introduced a regression. I always tag the culprit commit and create a revert rather than hard reset, so the history shows exactly what happened.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing git bisect session output and git reflog recovery commands",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d17",
        "title": "GitHub Pull Requests, Templates & Code Review Culture",
        "scenario": "Your team has no formal PR process. PRs are merged within minutes, reviews are rubber stamps, and bugs keep reaching production. Design and implement a PR process with templates, review checklists, and automatic reviewers.",
        "tasks": [
          "Create .github/pull_request_template.md with sections for description, testing, and checklist",
          "Create CODEOWNERS file to automatically assign reviewers based on file paths",
          "Open a PR with a proper description linking to a fake JIRA ticket",
          "Use GitHub Review to add inline comments and request changes",
          "Understand the difference between Approve, Comment, and Request Changes states",
          "Configure required reviewers and dismiss stale reviews in branch protection",
          "Use Draft PRs for work-in-progress (open early, mark ready when done)",
          "Practice the PR description anti-patterns: what to avoid and why"
        ],
        "commands": [
          "gh pr create --title \"feat: add login validation\" --body \"$(cat .github/pr_body.md)\"",
          "gh pr review 42 --approve --body \"LGTM — tested locally\"",
          "gh pr list --state open"
        ],
        "gotcha": "CODEOWNERS syntax requires paths to be relative to the repository root and uses gitignore-style patterns. A common mistake is writing /src/* instead of src/* (no leading slash). Also, CODEOWNERS only applies to PRs — it does not restrict who can push to branches directly.",
        "interviewAnswer": "A good PR process has three components: a template that forces authors to explain what and why, CODEOWNERS to ensure domain experts review their areas, and branch protection that requires at least one approval with no stale dismissal. I also advocate for small PRs — under 400 lines — because research shows review effectiveness drops sharply above that threshold.",
        "artifactContract": {
          "type": "github-pr",
          "instruction": "URL of a real PR in your repo showing a filled-out PR template and at least one code review comment",
          "exampleFormat": "https://github.com/user/repo/pull/2",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d18",
        "title": "GitHub Security — Branch Protection, Dependabot & Secret Scanning",
        "scenario": "A security audit found that your repo has no branch protection, outdated npm dependencies with known CVEs, and three historical commits containing API keys. Fix all three issues and add pre-commit hooks to prevent future secrets.",
        "tasks": [
          "Enable branch protection on main: require PR, require status checks, dismiss stale reviews",
          "Enable secret scanning and push protection in GitHub Security settings",
          "Configure Dependabot for weekly dependency updates (dependabot.yml)",
          "Install pre-commit and configure detect-secrets hook locally",
          "Use git-secrets or trufflehog to scan the entire repo history for secrets",
          "Use BFG Repo Cleaner or git filter-repo to remove historical secret from all commits",
          "Add .gitignore entries for .env, *.key, *.pem, and terraform.tfvars",
          "Enable GitHub Advanced Security Code Scanning with CodeQL"
        ],
        "commands": [
          "gh api repos/user/repo/branches/main/protection --method PUT --input protection.json",
          "pip install pre-commit && pre-commit install",
          "trufflehog git file://. --since-commit HEAD~50"
        ],
        "gotcha": "After removing a secret from Git history with BFG or filter-repo, you MUST force-push and ALL team members must reclone or reset their local repos. The secret must be considered compromised from the moment it was committed — rotate it immediately, history cleanup is secondary. Attackers can archive GitHub repos within seconds of a push.",
        "interviewAnswer": "When a secret is leaked, the rotation order is: immediately rotate the credential in AWS/GitHub/etc, then notify security team, then clean the history. I implement push protection so GitHub blocks pushes containing detected secrets at the API level — before the commit even reaches the remote. Combine this with pre-commit hooks for local defence-in-depth.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of GitHub branch protection settings and Dependabot alerts dashboard",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d19",
        "title": "Maven Fundamentals & POM Structure",
        "scenario": "A new Java project needs to be standardised with Maven. Create a project from archetype, understand the full POM structure, manage dependencies precisely, and understand how Maven resolves version conflicts.",
        "tasks": [
          "Generate project with mvn archetype:generate and understand generated directory structure",
          "Understand every mandatory POM element: groupId, artifactId, version, packaging",
          "Add dependencies with explicit <version> tags — never use ranges",
          "Use mvn dependency:tree to visualise the full transitive dependency graph",
          "Resolve a dependency conflict using <exclusions> and <dependencyManagement>",
          "Understand SNAPSHOT vs RELEASE versioning semantics",
          "Use mvn help:effective-pom to see the fully resolved POM including parent",
          "Add the maven-enforcer-plugin to fail on banned dependencies or wrong Java version"
        ],
        "commands": [
          "mvn archetype:generate -DgroupId=com.company -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false",
          "mvn dependency:tree -Dverbose",
          "mvn dependency:analyze  # Find unused declared and used undeclared"
        ],
        "gotcha": "Using version ranges like [1.0,2.0) in Maven seems convenient but causes non-deterministic builds. Different developers get different transitive dependency versions depending on when they run the build. Always pin exact versions and use the dependency:analyze goal to keep your POM clean.",
        "interviewAnswer": "Maven enforces reproducible builds through the POM file. I always use explicit versions pinned in <dependencyManagement> for all transitive dependencies that matter. I run mvn dependency:analyze in CI to catch unused declared dependencies (bloat) and used undeclared dependencies (hidden coupling). The enforcer plugin prevents the team from accidentally downgrading the Java version.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL showing the pom.xml with enforcer plugin and dependency tree output in a comment",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d20",
        "title": "Maven Lifecycle, Plugins & Custom Phases",
        "scenario": "Your build takes 8 minutes because it re-downloads dependencies on every CI run and runs a slow integration test suite on every commit. Optimise the Maven build with proper plugin configuration, parallel execution, and test separation.",
        "tasks": [
          "Map all 23 Maven lifecycle phases from validate to deploy",
          "Configure maven-compiler-plugin for Java 17 with -parameters flag",
          "Configure maven-surefire-plugin to run unit tests with forking",
          "Configure maven-failsafe-plugin to run integration tests only on verify phase",
          "Enable parallel test execution with forkCount and reuseForks",
          "Add maven-resources-plugin for environment-specific resource filtering",
          "Bind a custom plugin goal to a specific lifecycle phase",
          "Use mvn -T 4 (4 threads) or mvn -T 1C (1 thread per CPU core) for parallel module builds"
        ],
        "commands": [
          "mvn clean package -DskipITs  # Skip integration tests",
          "mvn clean verify -T 2C  # 2 threads per core",
          "mvn test -pl module-name  # Run tests for specific module only"
        ],
        "gotcha": "mvn test only runs through the test phase. mvn verify runs all phases including package and integration-test. If your integration tests are bound to the verify phase via failsafe, running mvn test will never catch integration test failures. CI must always run mvn verify.",
        "interviewAnswer": "I split test execution into unit tests (surefire, fast, run on every commit) and integration tests (failsafe, slow, run on verify/merge). For CI optimization: dependency caching in ~/.m2, -T for parallel module builds, and -pl to build only changed modules in monorepos. This reduced our build from 8 minutes to 2 minutes.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit showing configured surefire, failsafe plugins and a Jenkinsfile/workflow that uses the correct Maven goals",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d21",
        "title": "Maven Repositories, Credentials & settings.xml",
        "scenario": "Your team uses a private Maven repository in JFrog Artifactory. Configure Maven to authenticate to it, proxy all downloads through it (for security scanning and audit), and set up a mirror so no dependency is ever downloaded from Maven Central directly.",
        "tasks": [
          "Configure <mirrors> in ~/.m2/settings.xml to proxy all repos through Artifactory",
          "Configure <servers> with encrypted credentials using mvn --encrypt-password",
          "Configure <repositories> for snapshot and release repos with update policies",
          "Use mvn deploy to publish to the remote repository",
          "Configure <distributionManagement> in POM for deployment target",
          "Use mvn install vs mvn deploy — understand the critical difference",
          "Configure settings-security.xml for master password encryption",
          "Verify mirror is being used: mvn clean install -X | grep Downloading"
        ],
        "commands": [
          "mvn --encrypt-master-password mysecret",
          "mvn --encrypt-password mypassword",
          "mvn clean deploy -s settings.xml",
          "mvn dependency:resolve -U  # Force update snapshots"
        ],
        "gotcha": "Never store plaintext passwords in settings.xml. Use mvn --encrypt-password with a master password stored in settings-security.xml. Also, mvn install publishes to your LOCAL ~/.m2 repository only. mvn deploy publishes to the REMOTE repository. In CI pipelines, always use mvn deploy — not install — to make artifacts available to other services.",
        "interviewAnswer": "All Maven dependencies in production go through our Artifactory proxy — never Maven Central directly. This gives us: audit of all downloaded artifacts, security scanning before they enter our environment, and a cache that remains available even if Maven Central has an outage. Credentials are stored encrypted in settings.xml on the CI agent.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing your settings.xml (passwords redacted with ****) and the deploy command output confirming upload to Artifactory",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d22",
        "title": "Maven Multi-module Projects",
        "scenario": "A monolithic application needs to be split into three Maven modules: api (REST layer), service (business logic), and data (database layer). The parent POM must enforce dependency versions centrally so no module can independently upgrade a shared library.",
        "tasks": [
          "Create parent POM with <packaging>pom</packaging> and <modules> list",
          "Define all dependency versions centrally in parent <dependencyManagement>",
          "Create api, service, and data child modules with correct <parent> references",
          "Configure inter-module dependencies (api depends on service, service on data)",
          "Use mvn clean install from the root to build all modules in dependency order",
          "Use mvn -pl api -am (build api and all modules it depends on)",
          "Use mvn -pl data (build only data module)",
          "Verify parent POM inheritance with mvn help:effective-pom -pl api"
        ],
        "commands": [
          "mvn clean install -DskipTests",
          "mvn -pl api,service -am clean package",
          "mvn help:effective-pom -pl data"
        ],
        "gotcha": "Child POM <parent> block must have a <relativePath> pointing to the parent POM directory. If you leave it blank, Maven looks for the parent in the local repository, which causes confusing \"artifact not found\" errors in a freshly checked-out repository.",
        "interviewAnswer": "Multi-module Maven projects enforce separation of concerns at the build level. By centralising all dependency versions in the parent <dependencyManagement>, we guarantee that upgrading a library version happens in one place and applies uniformly across all modules. This eliminates version drift between modules that share transitive dependencies.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "GitHub repo URL showing multi-module structure with parent POM and child module POMs",
          "exampleFormat": "https://github.com/user/multi-module-project",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d23",
        "title": "Maven Testing Strategy & Test Management",
        "scenario": "The test suite has 500 unit tests and 50 integration tests. Unit tests must run on every commit (< 30s). Integration tests must only run on PRs to main (3 minutes). Configure Maven to support this split strategy.",
        "tasks": [
          "Configure surefire to exclude *IT.java and *IntegrationTest.java from unit test run",
          "Configure failsafe to include only *IT.java and run only in the verify phase",
          "Add JaCoCo maven plugin for code coverage reporting",
          "Configure JaCoCo to fail build if coverage drops below 80%",
          "Generate a Surefire XML report and understand the report format",
          "Use mvn test -Dtest=LoginServiceTest to run a single test class",
          "Use @Tag or @Category to group tests and run by category",
          "Configure test logging level to avoid verbose output on passing tests"
        ],
        "commands": [
          "mvn test -Dtest=LoginServiceTest,UserServiceTest",
          "mvn verify -Pfull-integration  # Run all tests via profile",
          "mvn jacoco:report && open target/site/jacoco/index.html"
        ],
        "gotcha": "JaCoCo agent must be configured BEFORE the test phase runs — using the prepare-agent goal bound to initialize phase. If you add JaCoCo and run mvn test without prepare-agent, all coverage reports show 0% because the agent was never attached to the JVM during test execution.",
        "interviewAnswer": "Our testing pyramid for Maven: unit tests in surefire (run always, < 30s), integration tests in failsafe (run on verify, 3 minutes), and JaCoCo enforces a minimum 80% coverage gate. The CI pipeline runs mvn test on feature branches and mvn verify on PRs to main. This gives fast feedback for development and thorough validation before merging.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit showing surefire, failsafe, and JaCoCo configuration with coverage threshold",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d24",
        "title": "Maven Release Plugin & Semantic Versioning",
        "scenario": "The team manually updates version numbers and creates Git tags for releases. This is error-prone (forgot to tag twice this month). Automate the entire release process: version bump, build, tag, and deploy using maven-release-plugin.",
        "tasks": [
          "Configure maven-release-plugin in parent POM with release version strategy",
          "Configure SCM section pointing to GitHub repository",
          "Use mvn release:prepare --dry-run to preview what will happen",
          "Run mvn release:prepare to bump version, commit, and tag",
          "Run mvn release:perform to build the tagged version and deploy to Artifactory",
          "Understand SNAPSHOT to RELEASE version transition logic",
          "Configure release profiles to skip optional steps (javadoc, sources) for speed",
          "Set up semantic versioning policy: MAJOR.MINOR.PATCH with meaningful bumps"
        ],
        "commands": [
          "mvn release:prepare -DdryRun=true",
          "mvn release:prepare -DreleaseVersion=2.1.0 -DdevelopmentVersion=2.2.0-SNAPSHOT",
          "mvn release:rollback  # If something goes wrong"
        ],
        "gotcha": "mvn release:prepare commits and tags in Git, modifies pom.xml versions, and stages the build. If any step fails midway (e.g., network issue), the pom.xml may be left in a half-modified state. Always run with --dry-run first and have a rollback plan with mvn release:rollback.",
        "interviewAnswer": "Automated releases with maven-release-plugin eliminate the most common source of release failures: human error in version management. The plugin handles the SNAPSHOT → RELEASE → next SNAPSHOT cycle atomically, creates the Git tag, and deploys to our artifact repository. I combine this with semantic versioning where MAJOR changes mean breaking API changes, MINOR means new features, PATCH means bug fixes.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing mvn release:prepare output and the Git log showing the release tag commit",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d25",
        "title": "Phase 2 Weekly Project Delivery",
        "scenario": "Deliver the complete multi-module Maven project on GitHub with all Phase 2 practices applied: branch protection, CODEOWNERS, signed commits, PR template, Dependabot, and the Maven release plugin configured.",
        "tasks": [
          "Verify mvn clean verify passes for all modules",
          "Open a PR demonstrating the PR template is filled out correctly",
          "Merge the PR through the branch protection check (requires reviewer approval)",
          "Run mvn release:prepare to create version 1.0.0 tag",
          "Verify the tag appears in GitHub Releases",
          "Confirm Dependabot is enabled and shows at least one dependency update PR",
          "Run trufflehog on the repo to confirm no secrets are present",
          "Write a team README documenting the branching strategy and release process"
        ],
        "commands": [
          "mvn clean verify -pl api,service,data",
          "git tag --list | grep release",
          "gh release view 1.0.0"
        ],
        "gotcha": "GitHub branch protection rules only take effect for PR merges. A user with admin rights can bypass branch protection unless \"Restrict deletions\" and \"Require status checks\" are enabled for admins too. Always tick \"Include administrators\" in branch protection settings for true enforcement.",
        "interviewAnswer": "A mature source control setup reduces deployment incidents caused by bad code reaching main. Branch protection, CODEOWNERS, and required status checks together form a quality gate that every commit must pass. Combined with automated dependency updates via Dependabot and secret scanning, the repository becomes a secure, auditable foundation for the entire CI/CD pipeline.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Link to the GitHub repository with all Phase 2 features implemented and a screenshot of the branch protection settings",
          "exampleFormat": "https://github.com/user/phase2-project",
          "blocksCompletion": true
        }
      },
      {
        "id": "p2-d26",
        "title": "Phase 2 Incident Drill — SEV-1 Leaked AWS Key",
        "scenario": "You just noticed an AWS_SECRET_ACCESS_KEY in a commit from 3 hours ago on a public repository. GitHub's secret scanning alert is in your inbox. Execute the full incident response: rotate, purge, prevent.",
        "tasks": [
          "Step 1 — Immediately go to AWS IAM and deactivate the exposed access key",
          "Step 2 — Create a new access key for the service account",
          "Step 3 — Enable GitHub push protection in repository security settings",
          "Step 4 — Install git-filter-repo and purge the secret from ALL commits: git filter-repo --path .env --invert-paths",
          "Step 5 — Force push the rewritten history to remote with --force-with-lease",
          "Step 6 — Notify all team members to reclone (history has been rewritten)",
          "Step 7 — Add detect-secrets pre-commit hook to all developers machines",
          "Step 8 — Write postmortem with 5-Why root cause analysis"
        ],
        "commands": [
          "aws iam update-access-key --access-key-id AKIAIOSFODNN7EXAMPLE --status Inactive",
          "git filter-repo --path-regex \".*\\.env$\" --invert-paths",
          "git push origin --force-with-lease --all && git push origin --force-with-lease --tags"
        ],
        "gotcha": "Force pushing after history rewrite breaks every team member's local clone. They will see \"tip of your current branch is behind\" and cannot simply git pull. They must run git fetch && git reset --hard origin/main. Communicate this clearly BEFORE force pushing, or you will have angry engineers with lost local commits.",
        "interviewAnswer": "The key incident response priority order: rotate the credential first (5 minutes), then clean the history (30 minutes), then prevent recurrence (1 day). The secret is compromised the moment it is committed — cleaning history only prevents future exposure. Automated push protection stops this at the source. Every team member gets a pre-commit hook after this incident.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your postmortem document (5-Why analysis, timeline, and action items)",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      }
    ]
  },
  {
    "id": "phase-3",
    "phase": 3,
    "title": "CI/CD — Jenkins + GitHub Actions + SonarCloud + JFrog",
    "days": "Days 27–40",
    "icon": "⚙️",
    "instanceType": "t3.medium",
    "estimatedCost": "~$15/month (Jenkins EC2)",
    "weeklyProject": {
      "title": "Full End-to-End CI Pipeline for Multi-module App",
      "scenario": "Build a complete Jenkins Declarative Pipeline that: checks out code, runs Maven build, scans with SonarCloud, enforces Quality Gate, publishes the JAR to JFrog Artifactory, builds a Docker image, pushes to GHCR, and triggers a GitHub Actions workflow on the same repository.",
      "successCriteria": [
        "Jenkinsfile in repo, pipeline triggers on PR and main",
        "SonarQube Quality Gate blocks merge if coverage < 80%",
        "JAR artifact published to JFrog with correct version",
        "Docker image published to GHCR with git-sha tag",
        "GitHub Actions workflow runs and sends Slack notification"
      ],
      "artifact": "Jenkins build URL screenshot + GitHub Actions run URL"
    },
    "incidentDrill": {
      "title": "SEV-2: Master Pipeline Broken — All Deployments Blocked",
      "scenario": "A flaky integration test on the main branch has been failing intermittently for 4 hours, blocking all deployments. The on-call engineer must: quarantine the test, unblock the pipeline, fix the flaky test, and add monitoring to prevent recurrence.",
      "timeLimit": "30 minutes",
      "postMortemRequired": true
    },
    "dayTasks": [
      {
        "id": "p3-d27",
        "title": "Jenkins Architecture, Installation & Master-Agent Setup",
        "scenario": "Your team needs to set up a Jenkins CI server on AWS EC2. The Jenkins master must NOT run builds directly — all builds execute on ephemeral agent nodes to isolate environments and prevent master overload.",
        "tasks": [
          "Install Jenkins on Amazon Linux 2 via the official RPM repository",
          "Configure Jenkins behind an Nginx reverse proxy with HTTPS (self-signed cert)",
          "Set up a second EC2 instance as a permanent SSH agent node",
          "Configure agent launch via SSH with the Jenkins master SSH credential",
          "Restrict master node executors to 0 — force all builds to run on agents",
          "Install essential plugins: Git, Pipeline, Credentials, Blue Ocean, Slack",
          "Configure Jenkins system-level tool: JDK, Maven, NodeJS with auto-installation",
          "Configure Jenkins URL, SMTP email, and System Admin email address"
        ],
        "commands": [
          "sudo yum install -y java-17-amazon-corretto jenkins",
          "sudo systemctl enable --now jenkins",
          "cat /var/lib/jenkins/secrets/initialAdminPassword  # First-time setup"
        ],
        "gotcha": "Running builds on the Jenkins master node is a severe security and stability risk. Builds execute with the jenkins user, which has write access to the master filesystem including all credentials and pipeline secrets. Set master executors to 0 the moment you finish initial setup.",
        "interviewAnswer": "Jenkins follows a master-agent architecture. The master schedules builds and manages the UI and state; agents execute the actual workloads in isolated environments. In production, I use ephemeral agents (Kubernetes pods or EC2 spot instances) that spin up for a build and terminate afterward, giving clean environments and zero idle cost.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of Jenkins \"Manage Nodes\" showing the master with 0 executors and the agent node online",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d28",
        "title": "Declarative Pipelines, Webhooks & Multibranch",
        "scenario": "Convert a freestyle Jenkins job to a Declarative Pipeline stored in the repository (Pipeline-as-Code). Set up a GitHub Webhook so builds trigger immediately on push, not via inefficient SCM polling.",
        "tasks": [
          "Write a Jenkinsfile with agent, stages (Checkout, Build, Test, Package), and post section",
          "Use environment block for global variables and credentials() for secrets",
          "Set up GitHub Webhook pointing to Jenkins/github-webhook/ endpoint",
          "Create a Multibranch Pipeline to auto-discover PRs and branches",
          "Configure Multibranch to run PR builds on GitHub PR events",
          "Add a when { branch \"main\" } condition to only deploy from main",
          "Use parallel stages for running unit tests and linting simultaneously",
          "Configure Jenkins to post build status back to GitHub commits"
        ],
        "commands": [
          "# Jenkinsfile snippet",
          "pipeline { agent any; stages { stage(\"Build\") { steps { sh \"mvn clean package -DskipTests\" }}}}"
        ],
        "gotcha": "SCM polling (checking for changes every N minutes) is inefficient and creates 30-second to N-minute delays between code push and build start. Always use webhooks for immediate triggering. If Jenkins is behind a corporate firewall and cannot receive webhooks, consider using the GitHub Checks plugin with polling as a fallback only.",
        "interviewAnswer": "Pipeline-as-Code (Jenkinsfile in the repository) means the pipeline definition is versioned, code-reviewed, and auditable — just like application code. Webhooks provide sub-second build triggering compared to polling. Multibranch pipelines automatically discover new feature branches and create jobs for them without manual configuration.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL of the Jenkinsfile and screenshot of the Multibranch pipeline detecting the branch",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d29",
        "title": "Jenkins Shared Libraries & DRY Pipelines",
        "scenario": "Your organisation has 30 repositories, each with a Jenkinsfile. Every time the company changes the build process (new security scan, different Docker registry), you have to update 30 files. Centralise shared logic in a Jenkins Shared Library.",
        "tasks": [
          "Create a Shared Library repository with the correct directory structure (vars/, src/, resources/)",
          "Write a vars/buildJavaApp.groovy with call() method",
          "Write a vars/dockerBuild.groovy shared step",
          "Configure the library in Jenkins Global Pipeline Libraries",
          "Update a Jenkinsfile to use @Library and call shared steps",
          "Pass parameters to shared steps and return results",
          "Write unit tests for Groovy shared library code with JenkinsPipelineUnit",
          "Version the shared library with Git tags and reference a specific version in Jenkinsfiles"
        ],
        "commands": [
          "# In Jenkinsfile\n@Library(\"company-pipeline-lib@v2.1.0\") _\npipeline { agent any; stages { stage(\"Build\") { steps { buildJavaApp() }}}}"
        ],
        "gotcha": "Shared Library code runs in the Jenkins sandbox by default. Certain Groovy methods (like reading files, executing system commands) are restricted and require administrator approval in the \"Script Approval\" section. When you see \"Scripts not permitted to use...\" errors, the fix is Script Approval — not removing the security restriction.",
        "interviewAnswer": "Jenkins Shared Libraries are the equivalent of packages for your pipelines. They allow you to centralise company-standard build logic (security scans, artifact publishing, notifications) in one versioned repository. When we update the shared library, all 30 pipelines automatically adopt the new behaviour on their next run — no mass PR needed.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Link to the Shared Library repo and a Jenkinsfile that uses it",
          "exampleFormat": "https://github.com/user/pipeline-lib",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d30",
        "title": "Jenkins Credentials Management & Security",
        "scenario": "A code review found that a developer hardcoded an API token in a Jenkinsfile. Audit all Jenkins pipelines for hardcoded secrets, migrate them to Jenkins credentials store, and implement credential binding best practices.",
        "tasks": [
          "Create Jenkins credentials of types: Username/Password, Secret Text, SSH Key, Certificate",
          "Use the Credentials Binding plugin to inject secrets as environment variables",
          "Use credentials() helper in Jenkinsfile environment block",
          "Configure role-based access control with the Role Strategy plugin",
          "Restrict credential access to specific jobs or folders using domain restrictions",
          "Enable the Audit Trail plugin to log credential access",
          "Scan existing Jenkinsfiles with trufflehog/gitleaks to find hardcoded secrets",
          "Configure Jenkins to mask credentials from build logs automatically"
        ],
        "commands": [
          "# In Jenkinsfile environment block:\nenvironment { API_TOKEN = credentials(\"my-api-token-id\") }"
        ],
        "gotcha": "Jenkins masks credentials in the console output, but only for the exact credential value. If the credential value appears in a base64-encoded form, URL-encoded, or as part of a longer string, Jenkins will NOT mask it. Always test credential masking by intentionally echoing a credential and verifying it appears as ****.",
        "interviewAnswer": "Jenkins credential store is encrypted at rest using the master key. I organise credentials by domain (production, staging, github) and use folder-scoped credentials for team isolation. Every credential access is audited via the Audit Trail plugin. I also run gitleaks on all Jenkinsfiles in CI to catch hardcoded secrets before they reach the shared library.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of Jenkins Credentials store (values redacted) and a build log showing credentials masked as ****",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d31",
        "title": "SonarCloud Static Analysis & Code Quality",
        "scenario": "The codebase has accumulated technical debt — security vulnerabilities, code smells, and zero test coverage on critical modules. Set up SonarCloud to measure and gate the codebase quality before any code reaches main.",
        "tasks": [
          "Create a SonarCloud account and organisation linked to your GitHub repo",
          "Generate a SonarCloud token and store in Jenkins credentials",
          "Configure sonar-project.properties with project key, sources, and coverage paths",
          "Add mvn sonar:sonar step to Jenkinsfile with token injection",
          "Configure the Sonar Scanner for the pull request analysis (decoration)",
          "Review the SonarCloud dashboard: Bugs, Vulnerabilities, Code Smells, Security Hotspots",
          "Understand New Code vs Overall Code distinction in SonarCloud",
          "Fix at least 3 identified Security Hotspots in the codebase"
        ],
        "commands": [
          "mvn clean verify sonar:sonar -Dsonar.projectKey=company_myapp -Dsonar.host.url=https://sonarcloud.io -Dsonar.token=$SONAR_TOKEN",
          "mvn jacoco:report  # Generate coverage for Sonar to pick up"
        ],
        "gotcha": "SonarCloud only picks up JaCoCo coverage if: (1) the report file exists before sonar:sonar runs, (2) the path is configured in sonar.coverage.jacoco.xmlReportPaths, and (3) the XML report is used (not binary). Running sonar:sonar before mvn verify gives you 0% coverage every time.",
        "interviewAnswer": "SonarCloud provides four quality dimensions: Reliability (bugs), Security (vulnerabilities + hotspots), Maintainability (code smells/technical debt), and Coverage. I configure PR analysis so SonarCloud posts inline comments on GitHub PRs — developers get feedback in context, not in a separate dashboard. Security hotspots are mandatory review items before merge.",
        "artifactContract": {
          "type": "sonar-report-url",
          "instruction": "URL of your SonarCloud project dashboard showing the quality metrics",
          "exampleFormat": "https://sonarcloud.io/dashboard?id=yourproject",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d32",
        "title": "Quality Gates — Enforcing Standards in CI",
        "scenario": "The SonarCloud analysis runs but engineers ignore the results and merge anyway. Configure Quality Gates as hard blockers: the pipeline must FAIL if the gate is not passed, and the PR must show a failing status check.",
        "tasks": [
          "Create a custom Quality Gate in SonarCloud with conditions: coverage > 80%, 0 blocker bugs, 0 critical vulnerabilities",
          "Configure the Sonar Jenkins plugin's waitForQualityGate() step",
          "Set up SonarCloud webhook to call back to Jenkins after analysis completes",
          "Configure GitHub branch protection to require the sonar status check",
          "Test the gate by deliberately adding a bug — verify pipeline fails",
          "Configure the Quality Gate to apply different thresholds to New Code vs Overall",
          "Add the sonar-scanner to a GitHub Actions workflow as well",
          "Review how to handle false positives with // NOSONAR and marking as \"won't fix\""
        ],
        "commands": [
          "# Jenkinsfile\nstage(\"Quality Gate\") { steps { waitForQualityGate abortPipeline: true }}"
        ],
        "gotcha": "waitForQualityGate() blocks the pipeline until SonarCloud calls back via webhook. If the SonarCloud webhook is not configured to point to your Jenkins URL, the pipeline will hang indefinitely until it times out. Configure the webhook in SonarCloud Administration → Webhooks before using this step.",
        "interviewAnswer": "Quality gates turn suggestions into mandatory standards. I configure them as pipeline blockers so failed quality gates fail the build and fail the GitHub status check — making it impossible to merge code that violates our quality standards. I set different thresholds for New Code (strict) vs Overall Code (pragmatic), allowing gradual improvement of legacy code.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of a failed Jenkins pipeline due to Quality Gate failure and the SonarCloud dashboard showing the gate conditions",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d33",
        "title": "JFrog Artifactory & Artifact Repositories",
        "scenario": "The team uses Maven Central for all dependencies and GitHub Releases for artifacts. This is unsustainable — no audit trail, no security scanning, no version retention policy. Set up JFrog Artifactory Cloud as the central artifact repository.",
        "tasks": [
          "Create a JFrog Cloud account (SaaS) and configure local Maven repositories (snapshots + releases)",
          "Create a virtual repository that proxies JFrog Central, Maven Central, and your local repos",
          "Configure Maven settings.xml to use JFrog as the default mirror",
          "Configure mvn deploy to publish to JFrog using access token authentication",
          "Set up an Xray scan policy to block downloads of artifacts with critical CVEs",
          "Configure artifact retention policies: keep 5 releases, auto-delete older snapshots",
          "Use JFrog CLI (jf) to promote an artifact from staging to release repository",
          "Configure properties on artifacts: git.commit, build.number, environment"
        ],
        "commands": [
          "jf config add my-jfrog --artifactory-url https://company.jfrog.io/artifactory --access-token $JFROG_TOKEN",
          "mvn clean deploy -s settings-jfrog.xml",
          "jf rt build-promote my-build 42 release-local --status Released"
        ],
        "gotcha": "SNAPSHOT artifacts in Maven are mutable by design — they can be re-uploaded with the same version. RELEASE artifacts should be immutable. Configure JFrog to prevent overwrite of release artifacts (deploymentPolicy: deny). Allowing release artifact overwrite destroys the build reproducibility guarantee.",
        "interviewAnswer": "JFrog Artifactory is the artifact supply chain backbone. We proxy all external repositories through it for security scanning and caching, publish internal artifacts to it for immutable storage, and promote artifacts through environments (dev → staging → prod) using JFrog Xray as the security gate. Every artifact has metadata linking it to the Git commit and build that created it.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of JFrog Artifactory showing the published artifact with its properties (git commit, build number)",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d34",
        "title": "Container Registries — GHCR & ECR",
        "scenario": "The team has been storing Docker images locally and sharing them via docker save | gzip. This is not scalable. Configure GitHub Container Registry (GHCR) for development and AWS ECR for production deployment.",
        "tasks": [
          "Authenticate to GHCR using a GitHub Personal Access Token with write:packages scope",
          "Tag an image correctly: ghcr.io/username/repo:v1.0.0 and ghcr.io/username/repo:sha-$(git rev-parse --short HEAD)",
          "Push and pull from GHCR and verify the image appears in GitHub Packages",
          "Create an ECR repository and configure aws ecr get-login-password authentication",
          "Set an ECR lifecycle policy to keep only the last 10 production images",
          "Configure image immutability on ECR (prevent tag overwrite)",
          "Add a multi-arch build using Docker buildx for linux/amd64 and linux/arm64",
          "Scan the pushed image with ECR vulnerability scanning (basic + enhanced)"
        ],
        "commands": [
          "echo $GH_PAT | docker login ghcr.io -u username --password-stdin",
          "docker tag myapp ghcr.io/user/myapp:sha-$(git rev-parse --short HEAD)",
          "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456.dkr.ecr.us-east-1.amazonaws.com"
        ],
        "gotcha": "ECR authentication tokens expire after 12 hours. CI pipelines that run longer than 12 hours (e.g., overnight batch jobs) will fail with \"no basic auth credentials\" errors. Implement a re-authentication step at the start of each pipeline stage that pushes images, not just at the beginning of the entire pipeline.",
        "interviewAnswer": "I use GHCR for development images (tight GitHub integration, free for public repos) and ECR for production (tight AWS IAM integration, no cross-cloud authentication needed from EKS). Image tags always include the git SHA for immutability — never use the latest tag in production because it cannot be rolled back reliably.",
        "artifactContract": {
          "type": "docker-image-tag",
          "instruction": "The full Docker image tag you pushed, including SHA",
          "exampleFormat": "ghcr.io/username/myapp:sha-a1b2c3d4",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d35",
        "title": "Artifact Promotion Strategy & Immutable Releases",
        "scenario": "Artifacts built on feature branches keep reaching production environments. Implement an artifact promotion strategy where only artifacts that pass all quality gates can be promoted to production, and once promoted, they are immutable.",
        "tasks": [
          "Define three artifact maturity levels: SNAPSHOT (dev), RC (staging), RELEASE (production)",
          "Use JFrog CLI to add a maturity property to the artifact metadata",
          "Write a Jenkins pipeline stage that promotes artifact from staging to release repository",
          "Configure JFrog Xray policy to block promotion if the artifact has critical CVEs",
          "Implement the \"build once, promote everywhere\" principle — never rebuild for different environments",
          "Tag the Docker image with the semantic version after successful promotion",
          "Create a GitHub Release with the artifact changelog when promoting to production",
          "Document the promotion pipeline flow with a diagram"
        ],
        "commands": [
          "jf rt sp \"my-repo/com/company/app/1.0.0/app-1.0.0.jar\" \"status=RELEASE;approved.by=SeniorEngineer\"",
          "docker tag ghcr.io/user/app:sha-a1b2c3 ghcr.io/user/app:v1.0.0"
        ],
        "gotcha": "Never rebuild artifacts for different environments. Rebuilding means \"the tested artifact\" and \"the deployed artifact\" are different binaries — even from the same source code, environment differences (JDK version, compiler settings) can produce different bytecode. Build once, tag with git SHA, promote that exact binary through environments.",
        "interviewAnswer": "Artifact promotion implements the \"build once, deploy everywhere\" principle. The artifact built on the commit is the only thing that moves between environments — it is never rebuilt. Promotion gates (Xray scan, Quality Gate, manual approval for production) ensure only verified artifacts reach production. The git SHA tag is the immutable identifier that links the running code to its exact source commit.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist of the JFrog CLI promotion commands and the artifact properties showing RELEASE status",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d36",
        "title": "GitHub Actions — Workflow Syntax, Triggers & Secrets",
        "scenario": "Your team needs a CI pipeline that runs on GitHub infrastructure (no Jenkins to maintain) for a React frontend project. Build a GitHub Actions workflow from scratch that builds, tests, and deploys on every push.",
        "tasks": [
          "Create .github/workflows/ci.yml with correct YAML structure",
          "Configure triggers: on: push to main, pull_request to main, workflow_dispatch (manual)",
          "Define jobs with runs-on: ubuntu-latest and steps with uses and run",
          "Use actions/checkout@v4 and actions/setup-node@v4 with version pinning",
          "Cache node_modules with actions/cache using package-lock.json hash",
          "Store secrets in GitHub Settings → Secrets and access as ${{ secrets.SECRET_NAME }}",
          "Add environment variables at workflow, job, and step levels",
          "Use if: conditionals to run steps only on specific branches or events"
        ],
        "commands": [
          "# .github/workflows/ci.yml\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm"
        ],
        "gotcha": "GitHub Actions uses ${{ secrets.NAME }} syntax (not $SECRET_NAME). Secrets are masked in logs but only for exact values. If you base64-encode a secret and print it, it will appear unmasked. Also, secrets are NOT available to pull requests from forks by default — this is a security feature to prevent untrusted code from exfiltrating your secrets.",
        "interviewAnswer": "GitHub Actions workflows are YAML-as-Code stored in the repository, version-controlled and reviewed like application code. I pin all action versions to a specific SHA (not a tag) to prevent supply chain attacks where an action maintainer could push malicious code under a mutable tag. Secrets live in GitHub Settings and never in the repository.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "URL of a successful GitHub Actions workflow run",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d37",
        "title": "GitHub Actions Advanced — Matrix Builds, Environments & OIDC",
        "scenario": "The frontend needs to be tested against Node 18, 20, and 22 simultaneously. The production deployment to AWS requires AWS credentials but cannot use long-lived access keys (security policy). Solve both with matrix builds and OIDC authentication.",
        "tasks": [
          "Define a matrix strategy to test against multiple Node.js and OS combinations",
          "Use matrix.include to add custom variables to specific matrix jobs",
          "Use matrix.exclude to skip certain combinations",
          "Configure GitHub Environments (staging, production) with required reviewers",
          "Deploy to staging automatically, require manual approval for production",
          "Configure AWS OIDC trust relationship with GitHub Actions (no static access keys)",
          "Use aws-actions/configure-aws-credentials@v4 with role-to-assume for keyless auth",
          "Add environment protection rules: required reviewer, deployment branches restriction"
        ],
        "commands": [
          "# Matrix strategy\njobs:\n  test:\n    strategy:\n      matrix:\n        node: [18, 20, 22]\n        os: [ubuntu-latest, windows-latest]\n    runs-on: ${{ matrix.os }}\n    steps:\n      - uses: actions/setup-node@v4\n        with:\n          node-version: ${{ matrix.node }}"
        ],
        "gotcha": "AWS OIDC with GitHub Actions requires creating an IAM OIDC Identity Provider in your AWS account AND configuring a trust policy on the IAM role that restricts it to your specific GitHub repository and branch. Without the branch condition (token.actions.githubusercontent.com:sub: repo:org/repo:ref:refs/heads/main), any GitHub Actions workflow from ANY repo could assume your role.",
        "interviewAnswer": "Matrix builds multiply test coverage across versions without writing multiple jobs. For AWS authentication, OIDC is the only acceptable approach — it issues short-lived tokens valid for the duration of the workflow run. There are no long-lived credentials to rotate, leak, or store. The IAM role trust policy restricts which repo and branch can assume it.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "URL of a matrix workflow run showing all matrix combinations (at least 4 parallel jobs)",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d38",
        "title": "GitHub Actions — Full Docker CI/CD Pipeline",
        "scenario": "Combine everything: build a GitHub Actions workflow that builds a multi-arch Docker image, pushes to GHCR with git-SHA and semantic-version tags, runs Trivy scanning, and deploys to a staging ECS service on merge to main.",
        "tasks": [
          "Build Docker image with docker/build-push-action",
          "Set up QEMU and buildx for multi-arch builds (amd64 + arm64)",
          "Tag with both git-sha and semantic version (from github.ref_name)",
          "Push to GHCR only on successful Trivy scan",
          "Run Trivy scan with aquasecurity/trivy-action and upload SARIF to GitHub Security tab",
          "Deploy to ECS on main merge using aws-actions/amazon-ecs-deploy-task-definition",
          "Add Slack notification on deployment success or failure",
          "Pin all action versions to exact SHAs in the workflow file"
        ],
        "commands": [
          "- uses: docker/build-push-action@v5\n  with:\n    push: true\n    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}\n    platforms: linux/amd64,linux/arm64"
        ],
        "gotcha": "Multi-arch builds using QEMU emulation are 5-10x slower than native builds. For production pipelines, use self-hosted runners on native ARM instances for the ARM builds. The QEMU approach is fine for open-source projects but is a bottleneck in large teams with many PRs.",
        "interviewAnswer": "A complete GitHub Actions CI/CD pipeline replaces Jenkins for most teams — it eliminates the operational overhead of maintaining Jenkins infrastructure. The key security practices: OIDC for AWS auth, Trivy scanning before push, SARIF upload to GitHub Security for vulnerability tracking, and pinned action SHAs to prevent supply chain attacks.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "URL of the complete Docker CI/CD workflow run showing Trivy scan and ECS deploy steps",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d39",
        "title": "Phase 3 Weekly Project — Full CI Pipeline Delivery",
        "scenario": "Deliver the complete CI system: Jenkins for Java with Sonar + JFrog + Docker, GitHub Actions for the frontend with matrix testing + OIDC + ECS deploy. Both pipelines must be fully working end-to-end.",
        "tasks": [
          "Run the full Jenkins pipeline end-to-end: checkout, build, test, sonar, publish, docker push",
          "Verify the SonarCloud Quality Gate blocks a deliberate bad commit",
          "Verify the artifact in JFrog with correct version and build properties",
          "Run the GitHub Actions matrix pipeline across all node versions",
          "Verify the Docker image in GHCR with SHA and version tags",
          "Trigger a manual production deployment via GitHub Environment approval",
          "Write a CI Architecture Decision Record (ADR) documenting why Jenkins vs GitHub Actions",
          "Create a runbook for common pipeline failures (auth expired, quality gate failed, timeout)"
        ],
        "commands": [],
        "gotcha": "The most common reason pipelines \"work locally but fail in CI\" is environment differences — missing environment variables, different tool versions, or different file paths. Always document exactly what environment variables and tool versions CI agents require, and pin those versions in your pipeline.",
        "interviewAnswer": "A mature CI system provides a single, automated, reproducible path from code commit to deployable artifact. By combining Jenkins (Java/Maven expertise) with GitHub Actions (GitHub-native, no infrastructure), we give the team the best of both worlds while ensuring every artifact is scanned, quality-gated, and traceable to its source commit.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "GitHub Actions run URL AND Jenkins build URL screenshot as a gist",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p3-d40",
        "title": "Phase 3 Incident Drill — Flaky Test Blocking All Deployments",
        "scenario": "It is 9 PM. The main branch pipeline has failed 4 times in a row due to a flaky database integration test. All deployments are blocked. Engineers are waiting. You have 30 minutes to diagnose, quarantine, and restore the pipeline.",
        "tasks": [
          "Review the Jenkins pipeline failure logs to identify the exact failing test and error",
          "Determine if it is truly flaky (intermittent) by re-running the failed stage only",
          "Add @Disabled annotation to the flaky test with a TODO JIRA ticket reference",
          "Commit and push the quarantine fix — verify pipeline goes green",
          "Create a JIRA ticket with the test failure logs, frequency, and investigation notes",
          "Set up a separate Jenkins job to run the quarantined test in isolation every 30 minutes",
          "Add a Prometheus alert on pipeline failure rate (> 2 consecutive failures = alert)",
          "Write a postmortem: why was a flaky test not caught before reaching main?"
        ],
        "commands": [
          "# Find the test and mark it\n@Disabled(\"JIRA-1234: Flaky test - intermittent DB connection failure\")\npublic void testDatabaseConnection() {}"
        ],
        "gotcha": "Never just re-run a failed pipeline hoping it passes. Flaky tests are bugs in your test suite and will strike again. Quarantine immediately, create a ticket, and fix the root cause (usually race condition, wrong test isolation, or external dependency like a shared DB). Un-merged flaky tests erode trust in the entire CI system.",
        "interviewAnswer": "My protocol for pipeline failures: first determine if it is environmental (re-run once) or a real failure. If the test is flaky (passes on retry), quarantine it immediately with @Disabled + JIRA ticket, restore the pipeline, then fix the root cause in a follow-up PR. Flaky tests are technical debt with an operational cost that compounds — each one slows down your entire delivery pipeline.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL showing the quarantined test with @Disabled annotation and JIRA reference, plus green pipeline screenshot",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      }
    ]
  },
  {
    "id": "phase-4",
    "phase": 4,
    "title": "The Case for Docker — Understanding the Problem Before the Solution",
    "days": "Days 41–52",
    "icon": "🐳",
    "instanceType": "t2.micro",
    "estimatedCost": "Free tier eligible",
    "weeklyProject": {
      "title": "Containerise a Legacy App — Before & After Comparison",
      "scenario": "Take the Maven application from Phase 2 and containerise it with Docker. Deploy a before-version (manual server setup) and an after-version (Docker Compose) side by side on the same EC2, documenting everything that was broken in the manual approach and fixed by Docker.",
      "successCriteria": [
        "Documentation of 5 specific problems encountered during manual deployment",
        "docker-compose up -d runs the entire stack with zero manual steps",
        "Multi-stage Dockerfile reduces image size by at least 60%",
        "Custom bridge network used with service discovery by name",
        "Named volumes persist data across container restarts"
      ],
      "artifact": "GitHub repo with Dockerfile, docker-compose.yml, and before-after-comparison.md"
    },
    "incidentDrill": {
      "title": "SEV-2: Container Exits Immediately After Start — No Logs Available",
      "scenario": "A containerised service that worked yesterday is now exiting within 100ms of starting. The container runtime shows \"Exited (1)\" and docker logs shows nothing. Diagnose and fix without rebuilding the image.",
      "timeLimit": "20 minutes",
      "postMortemRequired": true
    },
    "dayTasks": [
      {
        "id": "p4-d41",
        "title": "Life Before Docker — Dependency Hell & \"Works on My Machine\"",
        "scenario": "Your team is about to deploy a new Java + Node.js microservice to a production server. Before Docker existed, you would do this manually. Experience every pain point of manual server provisioning and understand WHY the industry moved to containers.",
        "tasks": [
          "Provision a fresh EC2 and manually install Java 17 — note the specific steps required",
          "Install Node.js 20 alongside Java — discover the version conflicts with existing system packages",
          "Install the application dependencies and observe how they conflict with the OS-level packages",
          "Try to run the same app on a second EC2 with a slightly different Amazon Linux version — document what breaks",
          "Create a wiki page listing every environment-specific variable (ports, paths, service accounts) needed for deployment",
          "Attempt to reproduce a production bug on your laptop — note all the \"works on my machine\" differences",
          "Calculate how long the manual process took (in minutes) and what could go wrong at each step",
          "Write a reflection document: \"10 Problems With Manual Server Deployment\""
        ],
        "commands": [
          "sudo yum install java-17-amazon-corretto -y",
          "sudo yum install nodejs -y  # Conflict with java? Different glibc?",
          "java -version && node -v  # Document exact versions",
          "node app.js  # Watch what environment-specific errors appear"
        ],
        "gotcha": "This day is intentionally painful. The dependency conflicts, version mismatches, and environment differences you encounter are not bugs to be fixed — they are the exact problems Docker was designed to eliminate. Document every problem you hit, not the solution. You are building the case for why containers exist.",
        "interviewAnswer": "Before containers, deploying an application meant: writing a 50-page deployment runbook, maintaining environment-specific configuration files, enduring \"it works on my machine\" debugging sessions, and praying the production OS matched the dev environment. A single OS update could silently break the application. Docker eliminates this by packaging the application WITH its complete runtime environment.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your \"10 Problems With Manual Server Deployment\" document",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d42",
        "title": "VM-Based Deployment Drawbacks & The Container Contract",
        "scenario": "Compare three deployment approaches side-by-side: bare metal manual, VM (with an AMI snapshot), and containers. Understand the trade-offs in startup time, resource efficiency, portability, and operational overhead. Build the business case for containers.",
        "tasks": [
          "Create an AWS AMI snapshot of the manually configured EC2 from Day 41",
          "Launch a new EC2 from the AMI — measure startup time to first request",
          "Identify the problems with AMI-based deployment: AMI age drift, AMI size, region portability",
          "Calculate the cost difference: always-on EC2 for each service vs containers on shared EC2",
          "Understand how containers use Linux namespaces for isolation and cgroups for resource limits",
          "Read and understand the OCI (Open Container Initiative) specification — what a container IS at the OS level",
          "Compare startup time: EC2 boot (~60s), container start (~100ms) — why the difference matters for autoscaling",
          "Draw a diagram comparing: VM vs Container resource sharing model"
        ],
        "commands": [
          "time docker run --rm nginx echo \"started\"  # Measure container startup time",
          "docker run --rm --cpus 0.5 --memory 256m nginx  # cgroups resource limits",
          "cat /proc/self/cgroup  # See cgroup membership of current process"
        ],
        "gotcha": "Containers share the HOST kernel — they are not VMs. If the kernel has a vulnerability, ALL containers on that host are potentially affected. Container isolation is strong but not absolute. For workloads requiring true kernel-level isolation (e.g., running untrusted code), use gVisor or Kata Containers (micro-VMs). This is why Kubernetes has node-level security policies.",
        "interviewAnswer": "Containers solve the \"dependency hell\" problem by packaging the application with all its runtime dependencies into an immutable image. They start in milliseconds (not minutes like VMs), use resources efficiently (many containers share one OS kernel), and are identical across environments (dev, staging, prod all run the exact same image). The OCI standard ensures images built with Docker run on any compliant runtime (containerd, podman, crio).",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing your VM vs Container comparison document with startup time measurements and resource cost calculations",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d43",
        "title": "Docker Architecture — Daemon, containerd & runc",
        "scenario": "Understand Docker not as a black box but as a layered system of components. Inspect what actually happens when you run \"docker run\": from the Docker CLI to containerd to runc creating a Linux namespace and cgroup.",
        "tasks": [
          "Map the Docker call chain: docker CLI → dockerd → containerd → containerd-shim → runc",
          "Use docker info to see the full runtime configuration and storage driver",
          "Inspect the containerd socket and understand why decoupling matters for Kubernetes",
          "Use runc list to see running containers at the lowest level",
          "Understand Union filesystems: OverlayFS layers and how they compose an image",
          "Use docker history <image> to see the layer breakdown of an image",
          "Understand image layers vs container layer (the writable layer)",
          "Read a Dockerfile and mentally map each instruction to an OverlayFS layer"
        ],
        "commands": [
          "docker info | grep -E \"Server Version|Storage Driver|Cgroup Driver\"",
          "docker history --no-trunc nginx",
          "docker inspect nginx | jq \".[0].GraphDriver\""
        ],
        "gotcha": "Docker's storage driver (OverlayFS on modern Linux) means that every container gets a read-write layer on top of read-only image layers. Changes inside a running container are stored in this writable layer and ARE LOST when the container is removed. This is by design — containers are ephemeral. For persistent data, always use named volumes or bind mounts.",
        "interviewAnswer": "Docker is a collection of components: dockerd (daemon), containerd (container runtime), and runc (OCI runtime). Kubernetes bypasses dockerd and talks directly to containerd, which is why Docker was deprecated as a Kubernetes runtime in 1.24. Understanding this stack helps troubleshoot: daemon issues vs runtime issues vs OS-level cgroup/namespace issues.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing docker info output and docker history output for a real image",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d44",
        "title": "Docker Core Commands — Full Lifecycle Mastery",
        "scenario": "A junior engineer on your team can only run \"docker run\" and \"docker ps\". Train them on the complete Docker lifecycle by covering every essential command needed for day-to-day operations and debugging.",
        "tasks": [
          "Run containers in detached mode (-d), interactive (-it), and with resource limits (--cpus, --memory)",
          "Understand docker ps, docker ps -a, and docker ps --format",
          "Use docker exec -it to debug inside running containers",
          "Use docker logs with --follow, --since, --tail options",
          "Use docker inspect to read container IP, mounts, environment, and port bindings",
          "Use docker cp to copy files in and out of containers",
          "Use docker stats to monitor real-time resource usage per container",
          "Use docker system prune, docker image prune, and docker volume prune safely"
        ],
        "commands": [
          "docker run -d --name webapp --cpus 0.5 --memory 256m -p 8080:80 nginx",
          "docker exec -it webapp /bin/bash",
          "docker logs webapp --follow --since 10m",
          "docker inspect webapp | jq \".[0].NetworkSettings.IPAddress\"",
          "docker stats --no-stream"
        ],
        "gotcha": "docker system prune -a removes ALL unused images — including images that are not running but are referenced by other images as base layers. If you run this during a build, the intermediate layers are deleted and the next build starts from scratch. Use docker system df first to understand what will be deleted before pruning.",
        "interviewAnswer": "I use docker inspect constantly for debugging — it shows the full container configuration including environment variables, port mappings, network settings, and volume mounts in JSON format. docker logs --since is essential for incident response: \"show me all logs in the last 30 minutes.\" docker stats provides real-time CPU/memory usage to identify containers approaching their limits.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing docker inspect output (IP, mounts, env) and docker stats output for a running container",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d45",
        "title": "Writing Production-Grade Dockerfiles",
        "scenario": "A Dockerfile for a Python application was written by a developer with no Docker experience. It runs as root, installs dev dependencies, has no health check, ignores .dockerignore, and takes 4 minutes to build due to poor layer caching. Rewrite it following production best practices.",
        "tasks": [
          "Use an official minimal base image: python:3.12-slim over python:3.12",
          "Create and use a non-root USER (appuser) for running the application",
          "Write a proper .dockerignore to exclude __pycache__, .git, .venv, *.pyc",
          "Order Dockerfile instructions for maximum layer cache efficiency",
          "COPY requirements.txt and RUN pip install BEFORE copying application code",
          "Use COPY --chown=appuser:appuser to set correct ownership in one step",
          "Add a HEALTHCHECK instruction with proper interval and retries",
          "Use ARG for build-time variables and ENV for runtime variables"
        ],
        "commands": [
          "FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY --chown=appuser:appuser . .\nUSER appuser\nHEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:8080/health || exit 1"
        ],
        "gotcha": "Running containers as root is a critical security vulnerability. If the application is compromised, the attacker has root access to the container filesystem and can potentially escalate to the host through kernel vulnerabilities. ALWAYS create a non-root user and switch to it with USER before CMD or ENTRYPOINT. Most base images now include a built-in app user.",
        "interviewAnswer": "Production Dockerfiles follow these principles: minimal base image (slim/alpine), non-root user, layer cache optimization (dependencies before source code), .dockerignore to prevent accidentally including .git or secrets, HEALTHCHECK for orchestrator integration, and no secrets baked into the image. I review Dockerfiles in code review with the same rigor as application code.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit showing the improved Dockerfile, .dockerignore, and a before/after image size comparison",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d46",
        "title": "Multi-Stage Builds & Image Optimization",
        "scenario": "A Node.js application Docker image is 1.2GB — it includes the entire Node.js build toolchain, devDependencies, and test files. Use multi-stage builds to produce a production image under 150MB.",
        "tasks": [
          "Write a multi-stage Dockerfile with AS builder and AS production stages",
          "Run npm install and npm run build in the builder stage",
          "Copy ONLY the built dist/ and node_modules (production only) to the production stage",
          "Use alpine base for the final stage for minimal footprint",
          "Compare layer count and total size between single-stage and multi-stage builds",
          "Use dive tool to inspect image layers and find optimization opportunities",
          "Understand COPY --from=builder and why it prevents dev tool leakage",
          "Apply the same multi-stage pattern to a Java Spring Boot app with Maven"
        ],
        "commands": [
          "FROM node:20 AS builder\nWORKDIR /build\nCOPY package*.json .\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS production\nWORKDIR /app\nCOPY --from=builder /build/dist ./dist\nCOPY --from=builder /build/node_modules ./node_modules\nUSER node\nCMD [\"node\", \"dist/index.js\"]",
          "docker images | grep myapp  # Compare sizes"
        ],
        "gotcha": "npm ci (clean install) is not the same as npm install. npm ci deletes node_modules and installs exactly what is in package-lock.json — making builds deterministic. npm install may update package-lock.json and install slightly different versions. Always use npm ci in CI and Dockerfiles.",
        "interviewAnswer": "Multi-stage builds are the most impactful Docker optimization. They eliminate the compiler, build tools, dev dependencies, and test artifacts from the final image. For Java: build with Maven in a JDK image, copy only the JAR to a JRE-only image. For Node: build in full Node, copy only dist/ and production node_modules to Alpine Node. A 1.2GB image becomes 80MB — improving pull time, startup speed, and reducing the attack surface.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of docker images output showing before (large) and after (slim) image sizes",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d47",
        "title": "Docker Compose — Multi-service Apps & Healthchecks",
        "scenario": "Deploy a production-like stack with three services: Nginx (reverse proxy), Node API, and PostgreSQL database. Services must start in the correct order, only after their dependencies are actually ready (not just started).",
        "tasks": [
          "Write a docker-compose.yml with services for nginx, api, and postgres",
          "Use depends_on with condition: service_healthy to enforce readiness ordering",
          "Add HEALTHCHECK to the postgres service: pg_isready command",
          "Add HEALTHCHECK to the api service: curl http://localhost:3000/health",
          "Configure env_file to load environment variables from a .env file",
          "Use named volumes for postgres data persistence",
          "Create a custom bridge network and assign all services to it",
          "Use docker-compose profiles to separate core services from dev-only tools (pgAdmin)"
        ],
        "commands": [
          "services:\n  postgres:\n    image: postgres:16\n    healthcheck:\n      test: [\"CMD\", \"pg_isready\", \"-U\", \"postgres\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n  api:\n    depends_on:\n      postgres:\n        condition: service_healthy"
        ],
        "gotcha": "depends_on without condition: service_healthy only waits for the container to START, not for the service to be READY. Postgres takes 2-5 seconds to be ready for connections after starting. Without healthcheck-based depends_on, your API will crash on startup because it cannot connect to a Postgres that is still initializing.",
        "interviewAnswer": "Docker Compose with healthcheck-based dependencies is the correct way to manage service startup order. I configure HEALTHCHECK on every service that other services depend on, using the actual application health endpoint (not just process existence). For production, I use Compose to define the complete local development stack, ensuring every developer has an identical environment with a single command.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit with docker-compose.yml showing healthchecks and depends_on with service_healthy",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d48",
        "title": "Docker Networking — Bridges, Overlays & DNS",
        "scenario": "Diagnose a networking issue where two services in Docker Compose cannot communicate. Deep dive into Docker networking modes, DNS resolution, and port mapping to understand every aspect of container networking.",
        "tasks": [
          "Create a custom bridge network and verify containers resolve each other by service name",
          "Compare default bridge (no DNS) vs custom bridge (automatic DNS) behaviour",
          "Use docker network inspect to see all containers in a network and their IPs",
          "Understand host network mode and when to use it (performance-critical apps)",
          "Understand none network mode (completely isolated containers)",
          "Configure a container to use a static IP within a custom network",
          "Debug network connectivity with a nicolaka/netshoot debug container",
          "Understand port publishing (-p): HOST:CONTAINER vs exposing (EXPOSE in Dockerfile)"
        ],
        "commands": [
          "docker network create --driver bridge --subnet 172.20.0.0/16 mynet",
          "docker run --network mynet --name service1 alpine sleep 1000",
          "docker run --rm --network mynet alpine ping service1  # DNS resolves by name",
          "docker run --rm --net container:service1 nicolaka/netshoot tcpdump -i eth0"
        ],
        "gotcha": "The default bridge network (docker0) does NOT support container DNS resolution by name. You MUST create a custom bridge network to use service names like postgres, redis, or api to connect between containers. This is the most common networking mistake beginners make — they use the default network and cannot understand why pinging by name fails.",
        "interviewAnswer": "Custom bridge networks provide automatic DNS for container discovery. In production orchestration (Kubernetes), each pod gets its own IP and kube-dns handles service discovery. Docker's networking model mirrors this — understanding how bridge networks and DNS work in Docker directly translates to understanding Kubernetes service discovery. For debugging, nicolaka/netshoot is an excellent Swiss Army knife container with all networking tools pre-installed.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing docker network inspect output and successful ping between containers by name",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d49",
        "title": "Docker Volumes — State, Persistence & Backup",
        "scenario": "A PostgreSQL container is losing all data every time it is restarted. The operations team is manually backing up data with docker cp. Implement proper volume management with named volumes, backup scripts, and volume migration.",
        "tasks": [
          "Create a named volume and mount it to a postgres container",
          "Verify data persists after docker stop and docker rm + docker run",
          "Compare named volumes vs bind mounts: when to use each",
          "Use a sidecar container to back up volume data to S3",
          "Inspect a volume with docker volume inspect to find the host mount path",
          "Migrate data from an old volume to a new volume using a temporary container",
          "Configure volume drivers for cloud storage (S3 via rclone, NFS)",
          "Understand tmpfs mounts for sensitive data (secrets, tokens in /run)"
        ],
        "commands": [
          "docker volume create postgres-data",
          "docker run -v postgres-data:/var/lib/postgresql/data postgres:16",
          "docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data"
        ],
        "gotcha": "Bind mounts (using absolute host paths like -v /home/user/data:/app/data) are brittle in production: the host path must exist, the user permissions must match, and the path is specific to one machine. Named volumes are managed by Docker, portable, and survive container deletion. In production orchestration, use named volumes — never bind mounts.",
        "interviewAnswer": "Containers are ephemeral by design — all data written inside a container is lost when the container is removed. Named volumes provide persistent storage that outlives any individual container. I separate stateful services (databases, message queues) from stateless services (APIs, workers) architecturally, and apply backup policies to all named volumes.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing named volume creation, data persistence verification (stop/remove/restart), and backup command",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d50",
        "title": "AWS ECR & Container Registry Integration",
        "scenario": "Push your optimized Docker image to AWS ECR, set up lifecycle policies, configure image scanning, and integrate ECR authentication into a GitHub Actions workflow using OIDC.",
        "tasks": [
          "Create an ECR repository with image scanning enabled (basic scanning on push)",
          "Configure ECR image tag immutability to prevent tag overwrite",
          "Write an ECR lifecycle policy to retain last 10 production images and 5 branch images",
          "Configure aws ecr get-login-password in GitHub Actions using OIDC",
          "Push images with both git-sha and branch-name tags",
          "Review ECR scan results and understand the severity levels",
          "Use ECR pull-through cache to mirror Docker Hub images",
          "Configure cross-account ECR access for a separate production AWS account"
        ],
        "commands": [
          "aws ecr create-repository --repository-name myapp --image-scanning-configuration scanOnPush=true --image-tag-mutability IMMUTABLE",
          "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456.dkr.ecr.us-east-1.amazonaws.com",
          "aws ecr describe-image-scan-findings --repository-name myapp --image-id imageTag=sha-abc123"
        ],
        "gotcha": "ECR image tag immutability prevents overwriting an existing tag but DOES NOT prevent pushing new images. If you set IMMUTABLE and try to push to an existing tag, the push fails — which is the desired behaviour for git-sha tags. However, set lifecycle policies BEFORE you start pushing or old images accumulate silently and cost money.",
        "interviewAnswer": "ECR integrates natively with IAM, making it the preferred registry when running workloads on AWS. Image tag immutability ensures the SHA-tagged image always refers to the exact binary we tested. I configure lifecycle policies to automatically clean old images (keeping the last 10 production and last 3 branch builds) to control storage costs.",
        "artifactContract": {
          "type": "docker-image-tag",
          "instruction": "The ECR image URI you pushed including account ID and SHA tag",
          "exampleFormat": "123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:sha-a1b2c3d4",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d51",
        "title": "Phase 4 Weekly Project — Containerise the Legacy App",
        "scenario": "Deliver the complete containerisation of the Phase 2 Maven application. Compare the before (manual server setup from Day 41) and after (Docker Compose) approaches in a formal comparison document. Run the full stack end-to-end.",
        "tasks": [
          "Write a multi-stage Dockerfile for the Java Spring Boot application",
          "Write a docker-compose.yml with the app, postgres, and nginx",
          "Implement healthchecks on all services with proper startup ordering",
          "Push the image to GHCR with git-sha tag from GitHub Actions",
          "Run the complete stack and verify the API responds correctly",
          "Document the before-after comparison: setup time, reproducibility, portability",
          "Calculate the image size reduction from single-stage to multi-stage build",
          "Add Docker Compose to the project README with a \"Getting Started\" section"
        ],
        "commands": [
          "docker-compose up -d && docker-compose ps",
          "docker-compose logs -f api",
          "docker-compose down -v  # Teardown including volumes for clean test"
        ],
        "gotcha": "Ensure your docker-compose down -v step is in your CI teardown for clean testing. Without -v, named volumes persist between test runs and can cause false positives (test passed because of leftover data from a previous run, not because the code is correct).",
        "interviewAnswer": "Containerising an application is not just about writing a Dockerfile — it is about designing for the container model: stateless processes, external configuration via environment variables, logs to stdout, health endpoints, and graceful shutdown handling. The Phase 4 project demonstrates every one of these container contract principles.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "GitHub repo URL with Dockerfile, docker-compose.yml, before-after-comparison.md, and GitHub Actions workflow that builds and pushes to GHCR",
          "exampleFormat": "https://github.com/user/phase4-project",
          "blocksCompletion": true
        }
      },
      {
        "id": "p4-d52",
        "title": "Phase 4 Incident Drill — Container Exits Immediately",
        "scenario": "A containerised service exits with code 1 within 100ms of starting. docker logs shows nothing. docker ps -a shows \"Exited (1)\". You cannot rebuild the image. You have 20 minutes to diagnose and fix.",
        "tasks": [
          "Use docker ps -a to see the exit code and confirm \"Exited (1)\"",
          "Run docker logs <container_id> (even if empty, attempt it)",
          "Override the entrypoint to get a shell: docker run --entrypoint /bin/sh -it <image>",
          "Inside the shell, manually run the CMD command to see the actual error",
          "Check if required environment variables are missing",
          "Check if required files or directories (config, secrets) are not present",
          "Verify the binary or script the CMD references actually exists in the image",
          "Write a postmortem documenting the exact root cause and a health check that would have caught this"
        ],
        "commands": [
          "docker ps -a --format \"table {{.Names}}\\t{{.Status}}\\t{{.Ports}}\"",
          "docker run --entrypoint /bin/sh -it broken-image  # Debug interactively",
          "docker inspect <container_id> | jq \".[0].State\""
        ],
        "gotcha": "When a container exits before writing to stdout, docker logs is empty because the process never wrote anything before crashing. The trick is overriding the entrypoint to get a shell, then manually running the CMD. This always reveals the actual error — usually a missing file, missing env var, or wrong path.",
        "interviewAnswer": "The entrypoint override technique is the most powerful Docker debugging tool. By running docker run --entrypoint /bin/sh -it <image>, I can interactively explore the container filesystem, run the startup command manually, and see the exact error before the process exits. This technique works even when docker logs is empty because the container exits before writing any output.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing the debugging session: docker run --entrypoint /bin/sh output and the root cause identified",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      }
    ]
  },
  {
    "id": "phase-5",
    "phase": 5,
    "title": "Container Security & Kubernetes Orchestration",
    "days": "Days 53–66",
    "icon": "☸️",
    "instanceType": "EKS t3.medium",
    "estimatedCost": "~$80/month (EKS + nodes)",
    "weeklyProject": {
      "title": "Secure Kubernetes Deployment with Helm & HPA",
      "scenario": "Deploy the Phase 4 containerised application to an EKS cluster: scan the image with Trivy, block deployment if critical CVEs found, deploy using a Helm chart with proper resource limits, configure HPA for autoscaling, and implement rolling updates.",
      "successCriteria": [
        "Trivy scan passes with no CRITICAL CVEs before deploy",
        "App deployed via Helm chart with values.yaml per environment",
        "Resource requests and limits set on all containers",
        "HPA scales pods from 1 to 5 under load (use k6 for load test)",
        "Rolling update completes with zero downtime"
      ],
      "artifact": "GitHub repo with Helm chart + GitHub Actions deploy workflow + k6 load test results"
    },
    "incidentDrill": {
      "title": "SEV-1: Pod OOMKilled — App Unresponsive for 15 Minutes",
      "scenario": "The API pods are being OOMKilled every 10 minutes. The service is flapping and users are getting 503s. You must identify the memory-leaking container, set resource limits, tune the JVM heap size, and implement a liveness probe to force restart on freeze.",
      "timeLimit": "25 minutes",
      "postMortemRequired": true
    },
    "dayTasks": [
      {
        "id": "p5-d53",
        "title": "Container Security & Trivy — Image Vulnerability Scanning",
        "scenario": "Before any container image reaches your Kubernetes cluster, it must pass a security scan. Set up Trivy to scan images for CVEs, OS package vulnerabilities, and misconfiguration, with results fed back into the PR as a comment.",
        "tasks": [
          "Install Trivy CLI and run a basic scan: trivy image nginx:latest",
          "Understand severity levels: CRITICAL, HIGH, MEDIUM, LOW, UNKNOWN",
          "Configure Trivy to fail only on CRITICAL and HIGH with --severity flag",
          "Create a .trivyignore file to suppress accepted false positives with justification",
          "Integrate Trivy into GitHub Actions using aquasecurity/trivy-action",
          "Upload SARIF results to GitHub Security tab with github/codeql-action/upload-sarif",
          "Scan a Dockerfile for misconfigurations: trivy config Dockerfile",
          "Configure Trivy to scan file systems and git repos for secrets and IaC misconfigs"
        ],
        "commands": [
          "trivy image --severity CRITICAL,HIGH myapp:latest",
          "trivy image --format sarif --output results.sarif myapp:latest",
          "trivy config ./  # Scan Dockerfiles and K8s YAML for misconfigs",
          "trivy fs --security-checks secret .  # Scan for secrets in codebase"
        ],
        "gotcha": "Do not scan with --exit-code 1 (fail on any finding) in production pipelines — public base images like ubuntu and node contain dozens of low-severity CVEs that have no fix available. Instead, fail only on CRITICAL and fixable HIGH. Use .trivyignore for accepted risks with a justification comment and a review date.",
        "interviewAnswer": "Trivy provides comprehensive security scanning across multiple targets: container images (OS + application), Dockerfiles, Kubernetes manifests, and Terraform code. I integrate it as a pipeline gate with --exit-code 1 for CRITICAL and HIGH FIXABLE vulnerabilities. Results go to GitHub Security Advisories for tracking. The .trivyignore file is reviewed quarterly to ensure accepted risks are still valid.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "GitHub Actions run URL showing Trivy scan results in the Security tab",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d54",
        "title": "Trivy Advanced — CI/CD Integration & Admission Control",
        "scenario": "Trivy scans images before push, but images already in the registry might develop new vulnerabilities as new CVEs are published. Implement continuous scanning and configure a Kubernetes admission webhook (Trivy Operator) to block vulnerable images from running in the cluster.",
        "tasks": [
          "Set up Trivy Operator in the Kubernetes cluster using Helm",
          "Configure automatic cluster scanning on a schedule (daily)",
          "Review VulnerabilityReport CRDs created by the operator",
          "Configure GitHub Actions to scan on schedule (nightly) for new CVEs in existing images",
          "Set up Dependency Track or SBOM (Software Bill of Materials) generation",
          "Generate SBOM with trivy image --format cyclonedx --output sbom.json",
          "Configure admission webhook policy to reject images with CRITICAL CVEs",
          "Review and remediate a specific CVE by updating the base image"
        ],
        "commands": [
          "helm install trivy-operator aqua/trivy-operator --namespace trivy-system --create-namespace",
          "kubectl get vulnerabilityreports -A",
          "trivy image --format cyclonedx myapp:latest > sbom.json"
        ],
        "gotcha": "New CVEs are published daily. An image that passed a Trivy scan last week may now have a CRITICAL vulnerability in it. This is why continuous scanning (Trivy Operator in cluster) is necessary in addition to pipeline scanning. Configure alerts when new CRITICAL CVEs are detected in deployed images.",
        "interviewAnswer": "Security scanning is not a one-time CI gate — it must be continuous. Trivy Operator in Kubernetes continuously monitors deployed images against the latest vulnerability database and generates Kubernetes CRD reports. I combine pipeline scanning (before image push), registry scanning (on image push to ECR), and cluster scanning (continuously) for three layers of defence.",
        "artifactContract": {
          "type": "kubectl-output",
          "instruction": "kubectl get vulnerabilityreports -A output showing scan results in your cluster",
          "exampleFormat": "NAMESPACE  NAME                    CRITICAL  HIGH  MEDIUM\ndefault    pod-myapp-xxx           0         2     5",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d55",
        "title": "Kubernetes Architecture & EKS Cluster Setup",
        "scenario": "Your organisation is moving from Docker Compose on EC2 to managed Kubernetes on EKS. Create an EKS cluster, understand every component of the control plane, and verify worker node health before deploying any workloads.",
        "tasks": [
          "Create an EKS cluster with eksctl: define node groups, instance types, and IAM roles",
          "Understand control plane components: kube-apiserver, etcd, kube-scheduler, kube-controller-manager",
          "Understand worker node components: kubelet, kube-proxy, and the container runtime (containerd)",
          "Configure kubectl to connect to the cluster with aws eks update-kubeconfig",
          "Verify node health with kubectl get nodes, kubectl describe node",
          "Understand the K8s add-ons: CoreDNS, kube-proxy, VPC CNI, and metrics-server",
          "Configure IAM OIDC provider for IRSA (IAM Roles for Service Accounts)",
          "Understand EKS managed vs self-managed node groups and Fargate"
        ],
        "commands": [
          "eksctl create cluster --name prod-cluster --region us-east-1 --nodegroup-name workers --node-type t3.medium --nodes 2 --nodes-min 1 --nodes-max 4",
          "aws eks update-kubeconfig --region us-east-1 --name prod-cluster",
          "kubectl get nodes -o wide",
          "kubectl get pods -n kube-system"
        ],
        "gotcha": "EKS control plane costs $0.10/hour (~$73/month) PLUS EC2 costs for worker nodes. An EKS cluster with 2 t3.medium workers costs ~$130/month. Always delete dev clusters when not in use. Use eksctl delete cluster or terraform destroy. Check AWS Cost Explorer if surprised by bills.",
        "interviewAnswer": "EKS abstracts the control plane (API server, etcd, scheduler) so we never manage those components. We are responsible for: worker node fleet (size, patching, autoscaling), IAM permissions (node role, IRSA for pods), networking (VPC CNI, security groups for pods), and add-ons (CoreDNS, metrics-server). I use eksctl for cluster creation and Terraform for Day 2 operations.",
        "artifactContract": {
          "type": "kubectl-output",
          "instruction": "kubectl get nodes -o wide output showing your EKS cluster nodes",
          "exampleFormat": "NAME                          STATUS   ROLES    AGE   VERSION\nip-10-0-1-100.ec2.internal    Ready    <none>   5m    v1.29.0",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d56",
        "title": "Pods, Deployments & ReplicaSets",
        "scenario": "Deploy your containerised application to Kubernetes using a Deployment. Understand why bare Pods are never used in production and how Deployments, ReplicaSets, and the reconciliation loop work together to maintain desired state.",
        "tasks": [
          "Write a Pod manifest and apply it — understand why this is NOT production practice",
          "Write a Deployment manifest with replicas: 2, resource requests and limits, and readiness probe",
          "Apply the deployment and watch the reconciliation loop create pods",
          "Delete one Pod manually and observe the ReplicaSet immediately create a replacement",
          "Scale the deployment with kubectl scale and with kubectl edit",
          "Understand the reconciliation loop: actual state vs desired state",
          "Use kubectl rollout status to monitor deployment progress",
          "Inspect the generated ReplicaSet and understand the relationship to the Deployment"
        ],
        "commands": [
          "kubectl apply -f deployment.yaml",
          "kubectl get pods -w  # Watch pods being created",
          "kubectl scale deployment myapp --replicas=3",
          "kubectl rollout status deployment/myapp",
          "kubectl get replicaset -o wide"
        ],
        "gotcha": "Never deploy bare Pods in production. Bare Pods have no resurrection — if the node they run on fails or is drained, the Pod is gone permanently. Deployments create a ReplicaSet controller that continuously reconciles the actual number of running pods to match the desired replica count. This is Kubernetes' self-healing capability.",
        "interviewAnswer": "Kubernetes' core value proposition is declarative state management. I declare \"I want 3 replicas of this application\" in a Deployment manifest, and the controller loop continuously ensures exactly 3 are running — restarting crashed pods, rescheduling pods when nodes fail, and scaling on demand. This is fundamentally different from manual or script-based approaches.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL of your deployment.yaml with resource limits and readiness probe",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d57",
        "title": "Services, Ingress & Load Balancing",
        "scenario": "Your deployed application needs to be accessible: internally between microservices (ClusterIP), and externally from the internet (Ingress with TLS). Configure both and understand the role of kube-proxy in service routing.",
        "tasks": [
          "Create a ClusterIP Service to expose the application internally",
          "Test internal DNS resolution: curl http://myapp.default.svc.cluster.local",
          "Create a NodePort Service and test access via node IP (dev/test only)",
          "Create a LoadBalancer Service and observe the AWS NLB being provisioned",
          "Install AWS Load Balancer Controller via Helm for better ALB/NLB integration",
          "Create an Ingress resource with host-based routing and path-based routing",
          "Configure TLS termination using a Kubernetes Secret with the cert",
          "Understand kube-proxy in iptables mode and how it routes service traffic"
        ],
        "commands": [
          "kubectl expose deployment myapp --port=80 --target-port=3000 --type=ClusterIP",
          "kubectl run test --rm -it --image=alpine -- wget -qO- http://myapp.default.svc.cluster.local",
          "kubectl apply -f ingress.yaml",
          "kubectl get ingress -o wide"
        ],
        "gotcha": "A LoadBalancer Service on EKS provisions a REAL AWS Classic Load Balancer that costs $0.025/hour (~$18/month) per service. In a cluster with 10 services, that is $180/month in load balancers alone. Use Ingress instead — one ALB can route to multiple services via host/path rules, dramatically reducing cost.",
        "interviewAnswer": "Services abstract Pod IPs with a stable DNS name and IP. ClusterIP for internal communication, LoadBalancer (or Ingress) for external. In production, one Ingress controller (AWS ALB) handles all external traffic via routing rules — far more cost-effective than one LB per service. Services use iptables/IPVS rules maintained by kube-proxy for efficient traffic routing.",
        "artifactContract": {
          "type": "working-url",
          "instruction": "URL of your application accessible through the Ingress",
          "exampleFormat": "http://myapp.company.example.com/api/health",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d58",
        "title": "ConfigMaps, Secrets & External Secrets",
        "scenario": "Your application reads 5 environment variables: 3 are non-sensitive config, 2 are database credentials. Decouple all configuration from the container image using ConfigMaps and Secrets, and understand why native K8s Secrets are not secure enough for production.",
        "tasks": [
          "Create a ConfigMap with non-sensitive config values and mount as env vars",
          "Create a ConfigMap and mount as a file (for config.yaml pattern)",
          "Create a Kubernetes Secret with database credentials",
          "Mount the Secret as environment variables (not as a volume, for simpler apps)",
          "Understand why Kubernetes Secrets are only base64 encoded — NOT encrypted by default",
          "Install External Secrets Operator and configure AWS Secrets Manager as a backend",
          "Create an ExternalSecret that syncs from AWS Secrets Manager to a K8s Secret",
          "Enable KMS envelope encryption for etcd (Secrets at Rest encryption)"
        ],
        "commands": [
          "kubectl create configmap app-config --from-file=config.yaml",
          "kubectl create secret generic db-creds --from-literal=password=supersecret",
          "kubectl get secret db-creds -o jsonpath=\"{.data.password}\" | base64 -d  # Trivially decoded!"
        ],
        "gotcha": "kubectl get secret db-creds -o yaml shows the \"encrypted\" value as just a base64-encoded string. Anyone with kubectl get secret permission can decode it with one command. For real secrets security in K8s: enable etcd encryption at rest, use External Secrets Operator with AWS Secrets Manager/Vault, and restrict access via RBAC. Do NOT commit Kubernetes Secret YAML files to Git.",
        "interviewAnswer": "Kubernetes Secrets are base64-encoded, not encrypted — they are only as secure as your etcd storage and RBAC policies. For production, I use External Secrets Operator to sync secrets from AWS Secrets Manager. This means: credentials live in AWS (with rotation, audit logging), pods get them as K8s Secrets (transparent to the app), and nothing sensitive lives in Git.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit showing configmap.yaml (non-sensitive) and an ExternalSecret manifest referencing AWS Secrets Manager",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d59",
        "title": "Namespaces, RBAC & Network Policies",
        "scenario": "Your cluster runs both the dev and staging teams' workloads. The dev team accidentally connected to a staging database last week. Isolate environments using namespaces, restrict API access with RBAC, and prevent cross-namespace network traffic with NetworkPolicies.",
        "tasks": [
          "Create dev and staging namespaces with resource quotas",
          "Create a ServiceAccount for a CI/CD pipeline with minimal permissions",
          "Write a Role granting get/list/watch on pods in the dev namespace only",
          "Create a RoleBinding binding the CI/CD ServiceAccount to the Role",
          "Write a ClusterRole for cross-namespace read access (for monitoring)",
          "Apply a NetworkPolicy that denies all ingress by default in staging namespace",
          "Add NetworkPolicy rules to allow only specific pods to communicate",
          "Test the NetworkPolicy: verify denied traffic is actually blocked"
        ],
        "commands": [
          "kubectl create namespace dev --dry-run=client -o yaml | kubectl apply -f -",
          "kubectl create rolebinding ci-bind --role=ci-deployer --serviceaccount=dev:ci-sa -n dev",
          "kubectl auth can-i get pods --as=system:serviceaccount:dev:ci-sa -n dev"
        ],
        "gotcha": "NetworkPolicies in Kubernetes are \"additive allow\" rules, not a firewall with a default deny. If no NetworkPolicy selects a pod, ALL traffic is allowed to that pod. To implement a deny-all baseline, explicitly create a NetworkPolicy with an empty podSelector (selects all pods) and no ingress/egress rules. Then add specific allow rules on top.",
        "interviewAnswer": "Namespace isolation combines three controls: RBAC (who can do what via API), ResourceQuotas (how much resource a team can consume), and NetworkPolicies (which pods can communicate). None of these alone is sufficient. RBAC without NetworkPolicies lets pods communicate freely. NetworkPolicies without RBAC still allow API access. I implement all three together for true multi-tenant isolation.",
        "artifactContract": {
          "type": "kubectl-output",
          "instruction": "kubectl auth can-i output showing the CI ServiceAccount permission matrix",
          "exampleFormat": "yes/no output for get pods, create deployments, delete secrets etc.",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d60",
        "title": "kubectl Mastery — Debugging & Troubleshooting",
        "scenario": "A pod is in a CrashLoopBackOff state. Another pod is Pending. A third is running but the health check is failing. You need to diagnose all three issues using kubectl alone — no access to the node.",
        "tasks": [
          "Diagnose CrashLoopBackOff: kubectl logs -p (previous container logs), kubectl describe pod",
          "Read pod Events section in kubectl describe to understand scheduling/image issues",
          "Diagnose Pending: check resource availability with kubectl describe node and kubectl top nodes",
          "Run a debug pod in the same namespace: kubectl run debug --rm -it --image=nicolaka/netshoot",
          "Use kubectl port-forward to test application locally without exposing a Service",
          "Use kubectl exec to enter a running pod and debug from inside",
          "Use kubectl get events --sort-by=.metadata.creationTimestamp for cluster timeline",
          "Use kubectl rollout history to see previous deployments and kubectl rollout undo to revert"
        ],
        "commands": [
          "kubectl logs crashpod -p  # Previous container logs",
          "kubectl describe pod pendingpod | grep Events -A 20",
          "kubectl run debug --rm -it --image=nicolaka/netshoot -- bash",
          "kubectl port-forward pod/myapp-abc123 8080:3000",
          "kubectl rollout undo deployment/myapp"
        ],
        "gotcha": "kubectl logs only shows the CURRENT container. If it crashed and restarted, kubectl logs shows the NEW (healthy) container's logs, not the crashed one. You MUST use kubectl logs -p (previous) to see what killed the previous container. This is the most common mistake when debugging CrashLoopBackOff.",
        "interviewAnswer": "My kubectl debugging workflow: kubectl get pod (status), kubectl describe pod (events + conditions), kubectl logs -p (previous container for crashes), kubectl exec (application-level debugging). For network issues: kubectl run a debug pod with netshoot and diagnose from within the cluster network. kubectl port-forward lets me test services without exposing them publicly.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing kubectl describe and kubectl logs -p output for the CrashLoopBackOff pod, and the fix applied",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d61",
        "title": "Resource Management — Requests, Limits & QoS",
        "scenario": "One poorly configured pod is consuming all CPU on a node, causing other pods to be throttled and slow. Configure resource requests and limits for all pods and understand how Kubernetes uses them for scheduling and Quality of Service.",
        "tasks": [
          "Set CPU requests and limits on a deployment: 100m request, 500m limit",
          "Set memory requests and limits: 128Mi request, 256Mi limit",
          "Use kubectl top pods to observe actual resource usage",
          "Understand the three QoS classes: Guaranteed, Burstable, BestEffort",
          "Configure a LimitRange to set default requests/limits in a namespace",
          "Configure a ResourceQuota to cap total namespace resource consumption",
          "Use kubectl describe node to see allocated vs available resources",
          "Set JVM heap size (-Xmx) to be 75% of the container memory limit for Java apps"
        ],
        "commands": [
          "kubectl top pods -A --sort-by=memory",
          "kubectl top nodes",
          "kubectl describe node ip-10-0-1-100 | grep -A 5 \"Allocated resources\""
        ],
        "gotcha": "Containers without memory limits are assigned QoS class BestEffort — they are the FIRST to be evicted when the node runs out of memory. A single memory-unbounded pod can consume all node memory, causing the kubelet to OOMKill other pods on the same node. ALWAYS set memory limits, and set them thoughtfully based on actual application usage.",
        "interviewAnswer": "Kubernetes uses resource REQUESTS for scheduling (where to place the pod) and resource LIMITS for enforcement (when to throttle/kill). Memory limit exceeded = OOMKill (crash). CPU limit exceeded = throttled (slowed). For Java apps, I set container memory limit to 1.5x the JVM max heap (-Xmx) to account for JVM overhead (metaspace, native threads, GC). Requests are set at typical usage; limits are set at maximum acceptable usage.",
        "artifactContract": {
          "type": "kubectl-output",
          "instruction": "kubectl top pods output before limits + kubectl describe node showing allocated resources after limits are set",
          "exampleFormat": "NAME         CPU   MEMORY\nmyapp-xxx    45m   192Mi",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d62",
        "title": "HPA & Cluster Autoscaler",
        "scenario": "Your application handles 10x load spikes during business hours. Configure Horizontal Pod Autoscaler to scale pods based on CPU utilization, and Cluster Autoscaler to automatically add EC2 nodes when pods cannot be scheduled.",
        "tasks": [
          "Deploy metrics-server in the cluster (prerequisite for HPA)",
          "Create an HPA targeting 50% CPU utilization with min 2 and max 10 replicas",
          "Run a k6 load test to trigger autoscaling and observe pod creation",
          "Configure Cluster Autoscaler on EKS with the correct IAM permissions",
          "Observe Cluster Autoscaler add a node when existing nodes are at capacity",
          "Configure scale-down policies: delay, cooldown, and utilization threshold",
          "Use kubectl describe hpa to see scaling decisions and events",
          "Configure custom metrics-based HPA (e.g., scale on request queue length via KEDA)"
        ],
        "commands": [
          "kubectl autoscale deployment myapp --cpu-percent=50 --min=2 --max=10",
          "kubectl get hpa -w  # Watch scaling events",
          "k6 run --vus 100 --duration 5m load-test.js",
          "kubectl describe hpa myapp"
        ],
        "gotcha": "HPA requires resource REQUESTS to be set on all containers in the pod. If requests are not set, the utilization percentage cannot be calculated (there is no denominator). HPA will show \"FailedGetResourceMetric\" or \"unknown/50%\" and never scale. Always set CPU requests before configuring HPA.",
        "interviewAnswer": "HPA and Cluster Autoscaler work together as two layers of elasticity. HPA scales pods horizontally within available node capacity. When pods cannot be scheduled due to insufficient node resources, Cluster Autoscaler adds new EC2 nodes. I set HPA scale-up aggressively (trigger at 50% CPU) and scale-down conservatively (longer cooldown) to avoid thrashing during bursty traffic.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of kubectl get hpa showing REPLICAS changing under load and kubectl get nodes showing a new node being added",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d63",
        "title": "Helm — Kubernetes Package Management",
        "scenario": "Your application is deployed with 8 separate kubectl apply commands. Every environment change requires editing multiple YAML files manually. Convert the entire deployment to a Helm chart with environment-specific values files.",
        "tasks": [
          "Install Helm and understand chart directory structure (Chart.yaml, values.yaml, templates/)",
          "Create a chart with helm create and review the generated structure",
          "Write deployment, service, ingress, and hpa templates using {{ .Values.xxx }}",
          "Create values.yaml (defaults), values-staging.yaml, and values-prod.yaml",
          "Deploy to staging: helm install myapp-staging ./charts/myapp -f values-staging.yaml",
          "Upgrade a release: helm upgrade myapp-staging ./charts/myapp --set image.tag=sha-abc",
          "Use helm template to render manifests without deploying (for debugging)",
          "Use helm test to run post-deployment verification tests"
        ],
        "commands": [
          "helm create myapp",
          "helm install myapp-staging ./myapp -f values-staging.yaml --namespace staging",
          "helm upgrade myapp-staging ./myapp --set image.tag=sha-abc123",
          "helm rollback myapp-staging 1  # Rollback to revision 1"
        ],
        "gotcha": "Helm chart values override order: default values.yaml → environment values file → --set flags. --set flags have the highest priority and override everything. This is convenient for CI overrides (--set image.tag=$SHA) but dangerous if used carelessly to override production security settings.",
        "interviewAnswer": "Helm is the Kubernetes package manager. Charts make deployments reproducible and environment-specific values files keep configuration DRY. I use Helm in CI: helm upgrade --install (idempotent) with --set image.tag=$GIT_SHA for atomic, versioned deployments. Helm releases are tracked in Kubernetes as secrets, allowing helm rollback to any previous revision.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "GitHub repo URL with the complete Helm chart, values-staging.yaml, and GitHub Actions workflow deploying via helm upgrade",
          "exampleFormat": "https://github.com/user/helm-chart",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d64",
        "title": "Rolling Updates, Blue-Green & Canary Deployments",
        "scenario": "A new version of the application has a database schema change. A basic rolling update could cause 5xx errors during the transition. Implement blue-green deployment to eliminate downtime and prepare a canary strategy for gradual traffic shifting.",
        "tasks": [
          "Configure rolling update strategy with maxUnavailable: 0 and maxSurge: 1 for zero-downtime",
          "Add readiness probes that ensure traffic only routes to fully initialised pods",
          "Implement blue-green: deploy v2 alongside v1, switch Service selector when verified",
          "Implement canary: run 1 canary pod alongside 9 stable pods (10% traffic)",
          "Use kubectl rollout pause to freeze a deployment mid-rollout for verification",
          "Use kubectl rollout resume to continue after verification",
          "Use kubectl rollout undo if issues are found after rollout",
          "Document the trade-offs: rolling (simple), blue-green (fast cutover), canary (safe but complex)"
        ],
        "commands": [
          "# Blue-green via Service selector switch\nkubectl patch service myapp -p '{\"spec\":{\"selector\":{\"version\":\"v2\"}}}'",
          "kubectl rollout pause deployment/myapp",
          "kubectl rollout resume deployment/myapp",
          "kubectl rollout undo deployment/myapp"
        ],
        "gotcha": "Rolling updates with maxUnavailable: 0 require that the new pods pass their readiness probe BEFORE old pods are terminated. If your readiness probe is too fast or poorly configured, Kubernetes may send traffic to pods that are not yet fully initialised. Always test your readiness probe logic — it is the key to truly zero-downtime deployments.",
        "interviewAnswer": "Rolling updates are the default but not always sufficient for complex changes. I use blue-green for database migration deployments (two complete versions running simultaneously, instant cutover via Service selector switch) and canary for new features (1-5% traffic to the new version, monitoring error rates before full rollout). Canary requires proper observability to detect regressions early.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing the blue-green Service selector switch commands and kubectl rollout status output",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d65",
        "title": "Phase 5 Weekly Project — Secure K8s Deployment",
        "scenario": "Deliver the complete Kubernetes deployment of the Phase 4 application: Trivy-scanned, Helm-deployed to EKS, with HPA, resource limits, and rolling updates. The deployment must be triggered automatically by GitHub Actions on merge to main.",
        "tasks": [
          "Verify Trivy scan passes in the CI pipeline before any deploy step",
          "Deploy to staging namespace with helm upgrade --install via GitHub Actions",
          "Require manual approval for production deployment via GitHub Environment",
          "Run k6 load test against staging and observe HPA scaling pods",
          "Verify rolling update completes with zero downtime (monitor with curl loop)",
          "Confirm resource limits are set and visible in kubectl describe pod",
          "Verify External Secrets syncing from AWS Secrets Manager",
          "Run kubectl get vulnerabilityreports -A to show clean Trivy Operator output"
        ],
        "commands": [
          "helm upgrade --install myapp ./chart -f values-staging.yaml --namespace staging --wait",
          "kubectl rollout status deployment/myapp -n staging --timeout=300s",
          "k6 run --vus 50 --duration 2m staging-load-test.js"
        ],
        "gotcha": "The --wait flag in helm upgrade waits for all resources to be ready before considering the upgrade successful. Without it, helm upgrade exits 0 even if pods are crashing. Always use --wait --timeout in CI pipelines so the pipeline fails if deployment is unhealthy.",
        "interviewAnswer": "Production Kubernetes deployments require orchestration of multiple concerns simultaneously: security scanning, configuration management, deployment strategy, and observability. By combining Trivy (security), External Secrets (config), Helm (packaging), HPA (scalability), and GitHub Actions (automation), we have a deployment pipeline where no unsafe image can reach the cluster and no deployment can silently fail.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "GitHub Actions workflow run URL showing Trivy scan + Helm deploy + k6 load test steps",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p5-d66",
        "title": "Phase 5 Incident Drill — OOMKilled Pod Flapping",
        "scenario": "The Java API pods are being OOMKilled every 8 minutes causing a CrashLoopBackOff. Users are seeing intermittent 503 errors. You must diagnose the root cause, set appropriate limits, tune JVM heap, and add a liveness probe to auto-recover.",
        "tasks": [
          "Identify OOMKilled pods: kubectl get pods and look for \"OOMKilled\" in reason",
          "Check pod restart count: kubectl get pods shows RESTARTS column",
          "Read previous container logs with kubectl logs -p to find memory growth pattern",
          "Use kubectl top pod to see current memory consumption",
          "Add memory limit and JVM flags: -Xmx=<75% of limit> -Xms=<50% of limit>",
          "Add liveness probe with failureThreshold: 3 to force pod restart on freeze",
          "Verify Kubernetes OOM events in kubectl describe pod Events section",
          "Write postmortem: why was there no memory limit and no monitoring alert?"
        ],
        "commands": [
          "kubectl get pods -o wide | grep CrashLoop",
          "kubectl logs -p myapp-xxx-yyy  # Previous container logs showing OOM",
          "kubectl top pods --sort-by=memory",
          "kubectl describe pod myapp-xxx-yyy | grep -A 5 \"OOMKilled\""
        ],
        "gotcha": "Java applications are particularly vulnerable to OOMKill because the JVM does not respect container memory limits by default. Without -Xmx set, the JVM uses a percentage of the TOTAL HOST memory (not the container limit) for heap sizing. A 256Mi container limit on a 16GB host results in the JVM trying to use 4GB heap, instantly causing an OOMKill.",
        "interviewAnswer": "OOMKill debugging requires correlating kubectl describe (shows OOMKilled in LastState), kubectl logs -p (shows OOM error in previous container), and kubectl top pods (shows current memory usage). For Java: always set -Xmx to 75% of the container memory limit. For general: set limits based on actual profiling data with a 20% headroom buffer, and configure liveness probes to auto-recover from frozen states.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing kubectl describe output showing OOMKilled and the fixed deployment YAML with correct JVM flags and memory limits",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      }
    ]
  },
  {
    "id": "phase-6",
    "phase": 6,
    "title": "Observability — Metrics, Logs, Traces & On-Call",
    "days": "Days 67–78",
    "icon": "📊",
    "instanceType": "EKS (existing)",
    "estimatedCost": "Helm charts — $0 extra",
    "weeklyProject": {
      "title": "Full-Stack Observability Platform",
      "scenario": "Deploy Prometheus, Grafana, and OpenTelemetry Collector on your EKS cluster. Instrument the Java application to emit traces. Build a custom Grafana dashboard showing: request rate, error rate, p50/p99 latency (RED metrics), and pod resource utilization.",
      "successCriteria": [
        "Prometheus scraping application /metrics endpoint",
        "Grafana dashboard with RED metrics visible",
        "Alertmanager sends Slack notification on high error rate",
        "OpenTelemetry traces visible in Grafana Tempo or Jaeger",
        "Log correlation: trace ID appears in both traces and structured logs"
      ],
      "artifact": "Grafana dashboard URL (public link or screenshot) + Alert rule YAML"
    },
    "incidentDrill": {
      "title": "SEV-1: 5% Error Rate Alert at 2AM",
      "scenario": "An Alertmanager alert fires: HTTP 5xx error rate is 5.2% for the last 10 minutes. You are on-call. Using only Grafana and the log aggregation system, identify the root cause within 20 minutes and execute a mitigation.",
      "timeLimit": "30 minutes",
      "postMortemRequired": true
    },
    "dayTasks": [
      {
        "id": "p6-d67",
        "title": "Observability Pillars — Metrics, Logs & Traces",
        "scenario": "A production incident is happening. An engineer is checking logs on Server A, another is looking at metrics on a dashboard, a third is reading error messages. Nobody can correlate them because they are isolated data sources. Design the observability architecture that connects all three.",
        "tasks": [
          "Define the three observability pillars and how they relate: metrics (aggregated state), logs (events), traces (request flows)",
          "Understand the difference between monitoring (metrics thresholds) and observability (asking arbitrary questions about system state)",
          "Map the RED method: Rate, Errors, Duration — the three metrics every service must expose",
          "Map the USE method: Utilization, Saturation, Errors — for infrastructure resources",
          "Understand structured logging: why JSON logs with trace IDs are required for correlation",
          "Read and understand the OpenTelemetry specification: signals (metrics, logs, traces) and the SDK",
          "Design the trace propagation flow: HTTP header W3C-TraceContext, B3 format",
          "Draw an architecture diagram of your complete observability stack"
        ],
        "commands": [
          "# Example structured log with trace correlation:\n{\"level\":\"ERROR\",\"message\":\"DB connection failed\",\"traceId\":\"abc123\",\"spanId\":\"def456\",\"timestamp\":\"2024-01-15T10:30:00Z\"}"
        ],
        "gotcha": "Logging everything is not the same as being observable. Logs without structure (trace IDs, service names, request IDs) are just noise. An alert without context (no link to traces, no correlated logs) wastes 80% of incident response time. Build the correlation from day one: every log line must include the trace ID from the incoming request.",
        "interviewAnswer": "True observability means you can ask any question about your system's internal state using external outputs (metrics, logs, traces) without deploying new code. Metrics tell you THAT something is wrong (error rate is 5%), logs tell you WHAT the errors are, and traces tell you WHERE in the request flow the failure occurred. All three must be correlated via trace IDs for effective incident response.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your observability architecture diagram (ASCII or Mermaid) and a list of RED/USE metrics for your application",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d68",
        "title": "Prometheus — Metrics Collection & ServiceMonitors",
        "scenario": "Deploy the kube-prometheus-stack on EKS and configure it to scrape metrics from both Kubernetes system components and your application. Understand the pull model, target discovery, and how to expose application metrics.",
        "tasks": [
          "Deploy kube-prometheus-stack with helm: includes Prometheus, Grafana, Alertmanager, node-exporter, kube-state-metrics",
          "Understand the Prometheus pull model vs push model (Pushgateway) and when to use each",
          "Configure a ServiceMonitor CRD to tell Prometheus how to scrape your application",
          "Add a /metrics endpoint to the Java application using micrometer and prometheus registry",
          "Verify your application metrics appear in Prometheus with up==1",
          "Understand metric types: Counter, Gauge, Histogram, Summary",
          "Configure relabeling rules to enrich metrics with Kubernetes labels",
          "Set up Prometheus storage retention policy and remote_write to long-term storage"
        ],
        "commands": [
          "helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack -n monitoring --create-namespace",
          "kubectl get servicemonitors -n monitoring",
          "kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n monitoring"
        ],
        "gotcha": "ServiceMonitors only work if their label selector matches the Prometheus custom resource's serviceMonitorSelector. If your ServiceMonitor has labels that do not match, Prometheus silently ignores it and your target never appears. Check the Prometheus custom resource's serviceMonitorSelector and ensure your ServiceMonitor has matching labels.",
        "interviewAnswer": "Prometheus uses a pull model — it scrapes targets on a configured interval rather than targets pushing metrics. This is simpler (no network configuration needed on the target), and if Prometheus is down, it just catches up on the next scrape. I use the kube-prometheus-stack (community Helm chart) because it pre-configures Kubernetes cluster monitoring with sensible defaults and ServiceMonitor-based target discovery.",
        "artifactContract": {
          "type": "working-url",
          "instruction": "URL of Prometheus UI showing your application as a scrape target with Status: UP",
          "exampleFormat": "http://prometheus.company.internal:9090/targets",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d69",
        "title": "PromQL — Metrics Query Language Deep Dive",
        "scenario": "Write PromQL queries to answer real operational questions: What is the current request rate? What percentage of requests are failing? What is the p99 latency? Which pod is consuming the most memory? Understand selectors, operators, and functions.",
        "tasks": [
          "Query instant vectors vs range vectors: understand the difference between metric{} and metric{}[5m]",
          "Use rate() to calculate per-second rate from counter metrics: rate(http_requests_total[5m])",
          "Use irate() vs rate(): understand when each is appropriate",
          "Calculate error rate: rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
          "Calculate p99 latency: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))",
          "Use label matchers: = (exact), != (not equal), =~ (regex), !~ (not regex)",
          "Aggregate with sum(), avg(), max(), min(), count() and by()/without() clauses",
          "Use predict_linear() to forecast when disk space will run out"
        ],
        "commands": [
          "# Error rate (%):\n100 * rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
          "# P99 latency:\nhistogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))",
          "# Memory top 5 pods:\ntopk(5, container_memory_working_set_bytes{container!=\"\"})",
          "# Disk full in hours:\npredict_linear(node_filesystem_free_bytes[1h], 3600)"
        ],
        "gotcha": "rate() requires at least two data points in the time range to calculate a rate. Using rate(metric[1m]) when your scrape interval is 1m gives unreliable results — you need at least 2x the scrape interval. Use 5m range for 1m scrape intervals. Also, NEVER use rate() on a gauge metric — rate() is for counters only. Using rate() on a gauge gives nonsensical results.",
        "interviewAnswer": "PromQL's power comes from combining rate() for counter metrics with label aggregation. The standard RED dashboard requires three queries: rate(http_requests_total) for request rate, the error rate formula, and histogram_quantile(0.99, ...) for p99 latency. I also use predict_linear() proactively for capacity planning — alerting when disk space is predicted to run out within 4 hours.",
        "artifactContract": {
          "type": "grafana-dashboard-url",
          "instruction": "Grafana Explore URL or screenshot showing your PromQL queries for rate, error rate, and p99 latency",
          "exampleFormat": "http://grafana.company.internal/explore?...",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d70",
        "title": "Grafana — Dashboard Design & Visualisation",
        "scenario": "Build a production-grade Grafana dashboard for the application following the RED methodology. The on-call engineer must be able to determine the health status of the entire application within 5 seconds of opening the dashboard.",
        "tasks": [
          "Create a Grafana dashboard from scratch with a meaningful title and description",
          "Add a Stat panel for current request rate with colour thresholds",
          "Add a Gauge panel for current error rate (green < 1%, yellow < 5%, red > 5%)",
          "Add a Time series panel for p50, p95, p99 latency on the same graph",
          "Add a Heatmap panel for request duration distribution",
          "Configure dashboard variables (namespace, service) for filtering",
          "Add a Table panel showing top 5 slowest API endpoints",
          "Export the dashboard as JSON and commit to a git repository"
        ],
        "commands": [
          "# Grafana dashboard JSON can be exported via UI or API:\ncurl -H \"Authorization: Bearer $GRAFANA_TOKEN\" http://grafana:3000/api/dashboards/uid/myapp | jq ."
        ],
        "gotcha": "Dashboards with more than 20 panels become \"information overload\" — engineers stop looking at them. A good on-call dashboard has 5-7 panels maximum: overall health, key SLI metrics, top errors, and a link to more detailed dashboards. Design for the 2 AM engineer who is stressed and needs answers in seconds, not the architect building a comprehensive monitoring system.",
        "interviewAnswer": "Effective Grafana dashboards follow a top-down design: overall status at the top (are we healthy?), key metrics in the middle (what is happening?), and raw data at the bottom (why?). I code-review dashboards as JSON and store them in Git, deploying via Grafana's dashboard provisioning feature. This ensures dashboards are version-controlled and reproducible across environments.",
        "artifactContract": {
          "type": "grafana-dashboard-url",
          "instruction": "URL of your Grafana dashboard or exported JSON committed to GitHub",
          "exampleFormat": "http://grafana.company.internal/d/myapp-dashboard",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d71",
        "title": "Alertmanager — Routing, Grouping & Silencing",
        "scenario": "The team is receiving 200 alert emails per day — mostly noise. Configure Alertmanager with intelligent routing (Slack for warnings, PagerDuty for critical), grouping to prevent alert storms, inhibition to suppress downstream alerts, and silences for maintenance windows.",
        "tasks": [
          "Write PrometheusRule CRD for an alert: error rate > 1% for 5 minutes",
          "Write a critical alert: error rate > 5% for 2 minutes",
          "Configure Alertmanager routes: critical → PagerDuty, warning → Slack",
          "Configure group_by to batch related alerts (same service) into one notification",
          "Configure group_wait and group_interval to control notification timing",
          "Configure inhibit_rules to suppress warning when critical fires for the same service",
          "Create a silence during a planned maintenance window via Alertmanager UI",
          "Test the full alert cycle: trigger alert, verify Slack/PagerDuty notification"
        ],
        "commands": [
          "# PrometheusRule\napiVersion: monitoring.coreos.com/v1\nkind: PrometheusRule\nspec:\n  groups:\n  - name: myapp\n    rules:\n    - alert: HighErrorRate\n      expr: rate(http_errors_total[5m]) / rate(http_requests_total[5m]) > 0.05\n      for: 2m\n      labels:\n        severity: critical"
        ],
        "gotcha": "The for: duration in a PrometheusRule means the condition must be true CONTINUOUSLY for that duration. A transient spike that resolves in 30 seconds will not fire a for: 5m alert. This is intentional (prevents alert flapping) but means your for: duration must balance between catching real issues and avoiding noise. 2-5 minutes is typical for production alerts.",
        "interviewAnswer": "Alert quality is measured by the signal-to-noise ratio. A good alert is actionable (someone must do something), urgent (it cannot wait until morning), and unambiguous (the runbook tells you exactly what to do). I configure every alert with a runbook URL in the annotations, route by severity (PagerDuty for critical = production impact, Slack for warning = investigate soon), and use inhibition to prevent cascading alerts from one root cause.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit with PrometheusRule YAML and Alertmanager configuration YAML",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d72",
        "title": "Distributed Tracing & OpenTelemetry",
        "scenario": "A user reports that some API requests take 3 seconds while most take 50ms. Metrics show p99 latency is 3s but you cannot tell which part of the request (app logic, DB query, or external API call) is slow. Implement distributed tracing to find out.",
        "tasks": [
          "Understand distributed tracing concepts: trace, span, context propagation, W3C TraceContext header",
          "Add OpenTelemetry Java agent to the application (zero-code instrumentation)",
          "Configure the OTEL exporter to send traces to OpenTelemetry Collector (OTLP protocol)",
          "Deploy OpenTelemetry Collector on Kubernetes using the operator",
          "Configure Collector pipeline: receivers (OTLP) → processors (batch) → exporters (Jaeger/Tempo)",
          "Deploy Grafana Tempo as the trace backend and configure as a Grafana data source",
          "View a trace in Grafana Tempo: see each span (app, DB, HTTP call) with duration",
          "Configure exemplars in Prometheus to link metric data points to trace IDs"
        ],
        "commands": [
          "# Java OTEL agent instrumentation:\njava -javaagent:opentelemetry-javaagent.jar \\\n  -Dotel.service.name=myapp \\\n  -Dotel.exporter.otlp.endpoint=http://otel-collector:4317 \\\n  -jar app.jar"
        ],
        "gotcha": "Distributed traces are only useful if ALL services in the call chain propagate the trace context. If one service does not forward the W3C traceparent header, the trace is broken at that service — you see two disconnected spans instead of a complete end-to-end view. Check that all your HTTP clients (RestTemplate, OkHttp, fetch) have OTEL instrumentation.",
        "interviewAnswer": "Distributed tracing answers questions that metrics cannot: \"Which database query is taking 2 seconds?\" or \"Is this external API call slow or is it my code?\" OpenTelemetry provides a vendor-neutral SDK and wire protocol. I use the Java OTEL agent for zero-code instrumentation — it automatically instruments HTTP, JDBC, and common frameworks. Traces are stored in Tempo (cheap, scalable) and queryable from Grafana alongside metrics.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of a distributed trace in Grafana Tempo showing all spans with their durations",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d73",
        "title": "Splunk & Centralised Log Management",
        "scenario": "Your application logs are scattered across 20 pods in Kubernetes. Each pod has independent log files. When a user reports an error, you need to SSH into each pod separately to find the relevant log entry. Implement centralised logging with Fluent Bit → Splunk.",
        "tasks": [
          "Understand the log pipeline: application → stdout → Fluent Bit DaemonSet → Splunk HEC",
          "Deploy Fluent Bit as a DaemonSet on EKS using the official Helm chart",
          "Configure Fluent Bit to tail /var/log/containers/*.log and parse JSON logs",
          "Configure Splunk HTTP Event Collector (HEC) token and endpoint",
          "Configure Kubernetes metadata enrichment: add pod, namespace, and node name to each log",
          "Set up index routing in Splunk: production logs to prod-index, dev to dev-index",
          "Configure log filtering to DROP health check logs (high volume, low value)",
          "Verify logs appear in Splunk with correct metadata within 30 seconds"
        ],
        "commands": [
          "kubectl apply -f https://raw.githubusercontent.com/fluent/fluent-bit-kubernetes-logging/master/fluent-bit-ds.yaml",
          "kubectl logs -n logging -l app=fluent-bit  # Verify FLuent Bit is forwarding"
        ],
        "gotcha": "Applications must log to stdout (not to log files) for the container log collection pattern to work. If your application writes to /app/logs/app.log inside the container, Fluent Bit (running on the node) cannot access it by default. The container runtime captures stdout/stderr and writes them to /var/log/containers/ on the host — that is what Fluent Bit reads.",
        "interviewAnswer": "The Kubernetes log collection architecture: applications log to stdout, the container runtime captures and writes to the node filesystem, Fluent Bit (DaemonSet) reads those files, enriches them with K8s metadata, and forwards to a central aggregator. Centralised logging enables cross-service log correlation, alerting on log patterns, and compliance audit trails.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of Splunk showing your application logs with Kubernetes metadata (pod, namespace, container)",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d74",
        "title": "SPL — Splunk Search Processing Language",
        "scenario": "During an incident, you need to answer 5 questions in under 2 minutes using SPL: How many 500 errors in the last hour? Which endpoint is responsible? Which user is affected? What was the first occurrence? Is it spreading to other services?",
        "tasks": [
          "Write SPL to search by time range, index, and source type",
          "Use stats count by host to aggregate errors by server",
          "Use table, sort, dedup, and head/tail to format results",
          "Use timechart span=5m count by status to create a time-series view of errors",
          "Use transaction to group related log events by session or request ID",
          "Write a search that alerts when error count exceeds threshold",
          "Use rex to extract fields from unstructured log messages",
          "Save a search as a Splunk alert with email/Slack webhook action"
        ],
        "commands": [
          "index=prod sourcetype=kubernetes:container status>=500 | stats count by uri | sort -count | head 10",
          "index=prod \"ERROR\" earliest=-1h | timechart span=5m count by level",
          "index=prod | rex field=message \"userId=(?<user_id>\\\\w+)\" | stats count by user_id | sort -count"
        ],
        "gotcha": "SPL searches with leading wildcards (*error) perform a full index scan and are extremely slow — they can take minutes on large datasets and consume significant resources. Always start your search with a time range and indexed fields (index=, host=, source=) to use the index efficiently. Leading wildcards disable all indexing optimisations.",
        "interviewAnswer": "SPL follows a pipeline model: search commands separated by | characters, each transforming the results. I structure incident investigation searches from broad to narrow: start with the time range and error filter, aggregate by service/endpoint to find the affected component, drill down to specific error messages, then use transaction to correlate related log events by request ID.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist with 5 SPL queries you used to answer the incident investigation questions",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d75",
        "title": "Real-Time Incident Investigation — Correlating Signals",
        "scenario": "An alert fires for high 5xx rate. You have metrics, logs, and traces available. Walk through a structured investigation methodology that moves from symptom (alert) to root cause (code/infra issue) in under 20 minutes using all three observability signals.",
        "tasks": [
          "Start with the Grafana dashboard: identify WHEN the error rate increased (exact timestamp)",
          "Narrow to WHICH service/endpoint by checking service-level breakdowns",
          "Use Splunk to filter logs to that time window and service — find the specific error messages",
          "Extract the trace ID from the error log and look up the full trace in Grafana Tempo",
          "In the trace, identify the slow or failing span (DB query, HTTP call, etc.)",
          "Correlate metrics: did DB query time spike? Did external API latency increase?",
          "Draft the incident timeline from the investigation data",
          "Identify the mitigation action: scale, rollback, circuit break, or configuration change"
        ],
        "commands": [
          "# Splunk: find errors in the 5-minute window\nindex=prod earliest=\"2024-01-15T02:25:00\" latest=\"2024-01-15T02:30:00\" status>=500\n| table _time, host, uri, status, message, traceId"
        ],
        "gotcha": "All timestamps across metrics, logs, and traces must be in UTC and must be synchronised via NTP. A 1-second clock drift between nodes means your correlation will fail — logs from one service will appear before the trace span that triggered them. Use Amazon Time Sync Service on all EC2 instances and enforce UTC everywhere.",
        "interviewAnswer": "Structured incident investigation follows the signals in order: metrics (WHAT happened), logs (exact errors), traces (WHERE in the call chain). I always start with the Grafana dashboard to identify the exact timestamp the error rate increased — this bounds my log and trace searches. The trace view reveals the root cause faster than any other signal because it shows the complete request flow in one diagram.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist documenting your incident investigation process: timeline, SPL queries used, Grafana dashboard link, and trace ID that revealed root cause",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d76",
        "title": "On-Call Dashboard Design & Runbook Engineering",
        "scenario": "New engineers joining the on-call rotation get paged at 2 AM and spend 45 minutes finding the right dashboard before they can even start investigating. Design an on-call dashboard and write runbooks that enable any team member to handle incidents confidently.",
        "tasks": [
          "Design a top-level \"On-Call Health\" dashboard with overall system status (RED for all services)",
          "Link each service panel to a service-specific deep-dive dashboard",
          "Write a runbook for \"HighErrorRate\" alert: exact investigation steps, SPL queries, and escalation path",
          "Write a runbook for \"PodOOMKilled\" alert: kubectl commands, JVM tuning steps, and rollback procedure",
          "Configure Alertmanager to include the runbook URL in every alert notification",
          "Add a \"blast radius\" section to each runbook: which user-facing features are affected",
          "Configure PagerDuty escalation policy: 5 minutes auto-escalate to on-call lead",
          "Run a tabletop exercise: simulate an alert and walk a new engineer through a runbook"
        ],
        "commands": [
          "# Alert annotation with runbook URL:\nannotations:\n  summary: \"High error rate in myapp\"\n  runbook_url: \"https://wiki.company.com/runbooks/high-error-rate\"\n  description: \"Error rate {{ $value | humanizePercentage }} exceeds 5% threshold\""
        ],
        "gotcha": "A runbook that says \"check if the database is down\" is useless. An actionable runbook says: \"Run kubectl get pods -l app=postgres -n database. If status is not Running, check kubectl logs -l app=postgres --previous. If error is ConnectionRefused, escalate to DBA team at pagerduty.com/teams/database.\"",
        "interviewAnswer": "On-call effectiveness is a product of dashboard quality and runbook quality. I design dashboards for the stressed, sleep-deprived on-call engineer: large panels, clear colour coding (green/yellow/red), and direct links to service dashboards. Runbooks are step-by-step procedures with exact commands — not conceptual descriptions. If a runbook can be executed by a new engineer without domain knowledge, it is a good runbook.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL of your runbook markdown files (at least 2 runbooks)",
          "exampleFormat": "https://github.com/user/repo/runbooks/high-error-rate.md",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d77",
        "title": "Phase 6 Weekly Project — Full Observability Stack",
        "scenario": "Deliver the complete observability platform: Prometheus + Grafana + Alertmanager + Tempo + Fluent Bit → Splunk. All components running in EKS, all application signals instrumented, and a working end-to-end alert → investigation → trace workflow.",
        "tasks": [
          "Verify Prometheus scraping application metrics with UP == 1",
          "Open the Grafana RED dashboard and confirm all three panels show live data",
          "Trigger a test alert by temporarily setting the threshold below current values",
          "Verify Alertmanager sends the Slack notification with runbook link",
          "Use k6 to simulate a spike and observe the alert fire and recover",
          "Find a specific request in Grafana Tempo by tracing from a Grafana Explore metric exemplar",
          "Verify Splunk shows structured logs with Kubernetes metadata",
          "Export all Grafana dashboards as JSON and commit to the observability GitOps repository"
        ],
        "commands": [
          "kubectl get pods -n monitoring  # All monitoring pods Running",
          "kubectl port-forward svc/grafana 3000:80 -n monitoring"
        ],
        "gotcha": "Observability data can be expensive at scale. 100 services emitting traces at 100% sampling generates enormous data. Implement tail-based sampling in the OpenTelemetry Collector: only keep 100% of error traces, 5% of slow traces (> 1s), and 1% of successful fast traces. This reduces trace storage by 95% while retaining all useful data.",
        "interviewAnswer": "A complete observability stack is the difference between reactive firefighting and proactive operations. With metrics for trends, alerts for anomalies, logs for root cause, and traces for request-level analysis, the mean time to resolution (MTTR) drops from hours to minutes. The business value is quantifiable: each hour of downtime has a cost, and good observability reduces that by 70-80%.",
        "artifactContract": {
          "type": "grafana-dashboard-url",
          "instruction": "URL of your live Grafana dashboard showing RED metrics for the application",
          "exampleFormat": "http://grafana.company.internal/d/myapp",
          "blocksCompletion": true
        }
      },
      {
        "id": "p6-d78",
        "title": "Phase 6 Incident Drill — 2 AM High Error Rate",
        "scenario": "Execute the on-call drill: Alertmanager fires a HighErrorRate alert. As the on-call engineer, follow the runbook, investigate using Grafana + Splunk + Tempo, identify the root cause (a misconfigured DB connection pool), and execute the mitigation (increase pool size via ConfigMap update).",
        "tasks": [
          "Receive the simulated PagerDuty alert and acknowledge within 5 minutes",
          "Open the on-call dashboard and identify which service has elevated errors",
          "Run the SPL query from the runbook to find the specific error messages",
          "Find the trace ID in the log, look up the trace in Grafana Tempo",
          "Identify the slow/failed span (DB connection wait time = 5 seconds)",
          "Update the DB connection pool size in the ConfigMap and rolling restart",
          "Monitor Grafana dashboard to confirm error rate returns to < 1%",
          "Write the incident postmortem within 24 hours"
        ],
        "commands": [
          "kubectl patch configmap app-config -n production --type merge -p '{\"data\":{\"DB_POOL_SIZE\":\"20\"}}'",
          "kubectl rollout restart deployment/myapp -n production",
          "kubectl rollout status deployment/myapp -n production --timeout=120s"
        ],
        "gotcha": "During a live incident, the instinct is to make many changes simultaneously to fix the problem faster. This is catastrophically wrong — each change introduces new variables, making it impossible to determine which change fixed (or worsened) the problem. Make one change at a time, wait 3-5 minutes for metrics to stabilise, then assess.",
        "interviewAnswer": "Effective incident response requires discipline: acknowledge, investigate, mitigate, communicate. I follow the runbook exactly on the first pass — it was written by someone who solved this problem before. I only deviate if the runbook steps are exhausted and the issue is not mitigated. All actions are logged in real time in the incident channel so the team has a complete timeline for the postmortem.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your incident postmortem: timeline, root cause, impact, and action items",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      }
    ]
  },
  {
    "id": "phase-7",
    "phase": 7,
    "title": "Infrastructure as Code — Terraform & Ansible",
    "days": "Days 79–94",
    "icon": "🏗️",
    "instanceType": "N/A",
    "estimatedCost": "~$25/month (VPC endpoints)",
    "weeklyProject": {
      "title": "Zero-Click Production Environment Provisioning",
      "scenario": "Write Terraform code to provision a secure AWS VPC, private subnets, NAT gateway, EKS cluster, and RDS PostgreSQL database. Write Ansible playbooks to configure a Bastion host with fail2ban and SSH auditing. The entire environment must spin up from scratch with zero manual clicks.",
      "successCriteria": [
        "Terraform state stored in S3 backend with DynamoDB locking",
        "VPC has public, private, and database subnet tiers",
        "Database is only accessible from the private subnet (security groups)",
        "Ansible playbook hardens the Bastion host against SSH brute force",
        "tfsec scan passes with zero critical findings before apply"
      ],
      "artifact": "GitHub repo with Terraform modules, Ansible playbooks, and a tfsec scan report"
    },
    "incidentDrill": {
      "title": "SEV-1: Terraform State Deleted — Infrastructure Drift",
      "scenario": "An engineer accidentally deleted the terraform.tfstate file from the S3 bucket. The infrastructure is still running in AWS, but Terraform has lost track of it. You must import the existing VPC, EKS cluster, and RDS instance back into a new state file without destroying anything.",
      "timeLimit": "35 minutes",
      "postMortemRequired": true
    },
    "dayTasks": [
      {
        "id": "p7-d79",
        "title": "Terraform State, Providers & HCL Syntax",
        "scenario": "Your team is tired of \"ClickOps\" — manually creating AWS resources in the console. Write your first Terraform configuration to create a single S3 bucket, understand the state file (.tfstate), and learn why the state file is the most critical part of Terraform.",
        "tasks": [
          "Install Terraform CLI and configure the AWS provider in main.tf",
          "Write a resource block to create an S3 bucket with versioning enabled",
          "Run terraform init, terraform plan, and terraform apply",
          "Open terraform.tfstate locally and inspect the JSON structure",
          "Change a property in the AWS console manually (drift)",
          "Run terraform plan and observe how Terraform detects the drift",
          "Run terraform apply to reconcile the drift (revert the manual change)",
          "Understand provider version pinning to prevent breaking updates"
        ],
        "commands": [
          "terraform init",
          "terraform plan -out=tfplan",
          "terraform apply tfplan",
          "cat terraform.tfstate | jq \".resources[0]\""
        ],
        "gotcha": "The terraform.tfstate file contains the mapping between your HCL code and the real-world cloud resources. It also contains all sensitive data (passwords, certificates) in PLAINTEXT. NEVER commit terraform.tfstate to Git. This is a critical security vulnerability and will leak your cloud secrets instantly.",
        "interviewAnswer": "Terraform is a declarative IaC tool. You define the desired end-state in HCL, and Terraform calculates the delta between the current state (stored in the .tfstate file) and the desired state, then executes the necessary API calls to reconcile them. This makes infrastructure changes predictable, reviewable in PRs, and completely reproducible across environments.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your main.tf and the terraform plan output showing the creation of the bucket",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d80",
        "title": "Remote State, Locking & Modules",
        "scenario": "Two engineers run terraform apply at the same time and corrupt the state file. Move the state file to a remote S3 backend, configure DynamoDB for state locking, and refactor a monolithic main.tf into reusable modules.",
        "tasks": [
          "Create an S3 bucket for remote state and a DynamoDB table for state locking",
          "Configure the terraform { backend \"s3\" } block in your configuration",
          "Migrate the local state to the remote backend: terraform init -migrate-state",
          "Simulate a locked state by running terraform apply in two terminals simultaneously",
          "Refactor a VPC configuration into a reusable local module (modules/vpc)",
          "Use input variables (variables.tf) and output values (outputs.tf)",
          "Call the module from the root main.tf passing variables",
          "Understand module versioning using external module registries"
        ],
        "commands": [
          "# Backend config snippet\nterraform {\n  backend \"s3\" {\n    bucket         = \"company-tf-state\"\n    key            = \"prod/terraform.tfstate\"\n    region         = \"us-east-1\"\n    dynamodb_table = \"terraform-locks\"\n  }\n}"
        ],
        "gotcha": "When creating the S3 bucket for remote state, you MUST enable versioning. If the state file gets corrupted (e.g., interrupted network connection during write), S3 versioning is your only backup. Without it, a corrupted state means you have to manually import every single resource back into a new state file.",
        "interviewAnswer": "For team collaboration, local state is impossible. Remote state in S3 provides a central source of truth, and DynamoDB provides a mutex lock so only one engineer (or CI pipeline) can run an apply at a time, preventing state corruption. I organise Terraform into reusable modules to enforce company standards (e.g., every S3 bucket module automatically enables encryption and versioning).",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL showing the backend configuration and the modularized repository structure",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d81",
        "title": "Terraform Security — tfsec & Checkov",
        "scenario": "A Junior engineer created an RDS database module, but forgot to enable encryption at rest and made it publicly accessible. Integrate static analysis tools to catch these security flaws before terraform plan is even run.",
        "tasks": [
          "Install tfsec (Trivy) and checkov locally",
          "Run tfsec on a vulnerable Terraform configuration (e.g., public S3 bucket, unencrypted EBS)",
          "Review the tfsec output: understand the severity and the remediation links provided",
          "Fix the vulnerabilities by adding the required security arguments to the HCL",
          "Run the scan again to verify a clean pass",
          "Configure a .tfsecignore file to suppress a false positive with a justification comment",
          "Add tfsec to a GitHub Actions pre-commit workflow",
          "Understand the difference between static IaC scanning (tfsec) and runtime scanning"
        ],
        "commands": [
          "tfsec .",
          "checkov -d .",
          "trivy config .  # Trivy now includes tfsec capabilities"
        ],
        "gotcha": "Static analysis tools like tfsec can be noisy, flagging things that might be acceptable in a dev environment (like a lack of KMS encryption). Do not disable the tool — instead, use inline ignore comments (# tfsec:ignore:aws-s3-enable-versioning) with a reason. This makes the accepted risk visible and auditable.",
        "interviewAnswer": "IaC security must shift left. Running tfsec in the CI pipeline (or as a pre-commit hook) prevents insecure infrastructure from ever being provisioned. It catches missing encryption, wide-open security groups, and public buckets before they hit the AWS API. I treat tfsec failures exactly like compilation errors — they block the PR from being merged.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of tfsec output showing the initial vulnerabilities and the clean pass after remediation",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d82",
        "title": "Terraform CI/CD — GitOps for Infrastructure",
        "scenario": "Engineers are running terraform apply from their laptops using personal AWS credentials. This is a massive security risk and provides no audit trail. Build a GitHub Actions workflow that automates Terraform plan and apply.",
        "tasks": [
          "Write a GitHub Actions workflow that runs terraform fmt -check, init, and validate",
          "Configure the workflow to run terraform plan on pull requests",
          "Use the hashicorp/setup-terraform action and configure it to post the plan output as a PR comment",
          "Configure AWS OIDC to grant the GitHub Action permissions without static keys",
          "Configure the workflow to run terraform apply ONLY on push to the main branch",
          "Add manual approval requirements via GitHub Environments before the apply step",
          "Implement a strategy to handle Terraform lock timeouts in CI",
          "Use Terraform Workspaces (or separate state files) to separate dev/staging/prod"
        ],
        "commands": [
          "# Post plan to PR snippet (using tj-actions/terraform-pr-commenter or similar)"
        ],
        "gotcha": "Never use Terraform Workspaces to isolate production from development. Workspaces share the same backend configuration, meaning a typo can destroy production while you are working in the dev workspace. Use separate state files in separate directories (environments/dev, environments/prod) with completely separate backend S3 keys for hard isolation.",
        "interviewAnswer": "Infrastructure changes should follow the exact same GitOps workflow as application code. The CI pipeline runs terraform plan and posts the output to the PR. Reviewers approve the code AND the plan. Once merged to main, the CD pipeline runs terraform apply. No human engineer has AWS API credentials with write access — only the CI/CD role (via OIDC) can provision infrastructure.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "GitHub Actions run URL showing a successful terraform apply on the main branch",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d83",
        "title": "Ansible Fundamentals & Inventory",
        "scenario": "You need to install updates, configure NTP, and create a deploy user on 50 EC2 instances. SSHing into each one is not an option. Learn Ansible to configure all 50 servers in parallel, idempotently, via SSH.",
        "tasks": [
          "Install Ansible and understand the control node vs managed node architecture",
          "Create a static inventory file (hosts.ini) grouping servers by role (web, db)",
          "Configure Ansible to connect using an SSH private key",
          "Run ad-hoc commands: ansible all -m ping to test connectivity",
          "Run a command on all servers: ansible web -m command -a \"uptime\"",
          "Use the setup module to gather facts about the managed nodes",
          "Understand idempotency: running the same module twice should result in \"changed: 0\"",
          "Configure ansible.cfg to disable host key checking (for dynamic cloud environments)"
        ],
        "commands": [
          "ansible all -i hosts.ini -m ping",
          "ansible web -i hosts.ini -m command -a \"df -h\"",
          "ansible db -i hosts.ini -m setup | grep ansible_distribution"
        ],
        "gotcha": "Ansible is agentless — it uses SSH. If your control node cannot SSH to the target (firewall, wrong key, SSH daemon down), Ansible cannot manage it. Always test connectivity with ansible all -m ping before running complex playbooks. The \"ping\" module does not use ICMP; it verifies SSH connectivity and Python availability.",
        "interviewAnswer": "Ansible is a configuration management tool that ensures servers are in a desired state. Its greatest strength is its agentless architecture — it requires only SSH and Python on the target nodes. I use Ansible for OS-level configuration (hardening, user management, patching) while using Terraform for the underlying infrastructure provisioning.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing your inventory file and the output of ansible all -m ping against at least 2 target nodes",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d84",
        "title": "Ansible Playbooks, Roles & Handlers",
        "scenario": "Write an Ansible playbook to configure an Nginx web server. It must install the package, copy a custom configuration file, start the service, and restart the service ONLY if the configuration file changes.",
        "tasks": [
          "Write a playbook (site.yml) with tasks using apt/yum, copy, and service modules",
          "Run the playbook: ansible-playbook -i hosts.ini site.yml",
          "Implement a Handler (notify) to restart Nginx only when the config file changes",
          "Verify idempotency: run the playbook again and ensure Nginx is NOT restarted",
          "Refactor the playbook into an Ansible Role (roles/nginx/tasks/main.yml)",
          "Use variables (defaults/main.yml) to make the role reusable across environments",
          "Use Jinja2 templates (templates/nginx.conf.j2) to dynamically generate config files based on node facts",
          "Use Ansible Vault to encrypt sensitive variables (passwords, API keys)"
        ],
        "commands": [
          "ansible-playbook -i hosts.ini site.yml",
          "ansible-galaxy init roles/nginx",
          "ansible-vault encrypt group_vars/all/vault.yml"
        ],
        "gotcha": "Using the command or shell modules breaks idempotency because Ansible has no way to know if running a bash script changes the system state. Always prefer native modules (apt, user, file, systemd) which check state before acting. If you MUST use shell, use the creates or removes arguments to tell Ansible when to skip the task.",
        "interviewAnswer": "Playbooks should be idempotent — safe to run repeatedly. Handlers are crucial for this: they execute only when a task reports a \"changed\" state, ensuring services are not restarted unnecessarily. I structure all Ansible code into Roles to keep it modular and reusable, and I use Ansible Vault to encrypt secrets directly in the repository.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL of your Ansible Role containing tasks, handlers, and a Jinja2 template",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d85",
        "title": "Dynamic Inventory & Terraform Integration",
        "scenario": "In AWS, EC2 instances are created and destroyed constantly by Auto Scaling Groups. A static hosts.ini file is useless because IP addresses change. Configure Ansible to use dynamic inventory, querying the AWS API to find current instances, and integrate Ansible into a Terraform workflow.",
        "tasks": [
          "Configure the aws_ec2 dynamic inventory plugin",
          "Group instances dynamically based on AWS tags (e.g., tag_Role_web)",
          "Verify dynamic inventory: ansible-inventory -i aws_ec2.yml --graph",
          "Use Terraform provisioner \"local-exec\" to trigger an Ansible playbook after instance creation",
          "Understand the drawbacks of Terraform provisioners and why Packer is preferred for immutable infrastructure",
          "Use SSM (Systems Manager) as the Ansible connection plugin instead of SSH for better security",
          "Write a playbook that patches all EC2 instances across an AWS account in rolling fashion",
          "Configure Ansible to wait for SSH to become available after instance boot"
        ],
        "commands": [
          "ansible-inventory -i aws_ec2.yml --graph",
          "ansible-playbook -i aws_ec2.yml patch_servers.yml"
        ],
        "gotcha": "Terraform local-exec provisioners that run Ansible are brittle. If the Ansible run fails, the Terraform apply completes successfully but the instance is in an unknown state. Terraform is not a configuration management tool. Prefer immutable infrastructure: use Packer and Ansible to build an AMI, then use Terraform to deploy that AMI.",
        "interviewAnswer": "Static inventories do not work in cloud environments. I use the aws_ec2 dynamic inventory plugin to group instances based on their AWS tags. For the larger pipeline, I advocate for immutable infrastructure: we use Ansible inside Packer to bake AMIs, and Terraform to deploy them. This removes the need to run Ansible against live production servers entirely.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing your aws_ec2.yml configuration and the output of the ansible-inventory --graph command showing dynamic groups",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d86",
        "title": "Immutable Infrastructure with Packer",
        "scenario": "Stop running Ansible against live production servers. Instead, use HashiCorp Packer to run your Ansible roles against a temporary EC2 instance to build a hardened \"Golden AMI\". Terraform will then deploy this pre-configured AMI, booting in seconds rather than minutes.",
        "tasks": [
          "Install Packer and write a packer.pkr.hcl template for an Amazon EBS builder",
          "Configure the ansible provisioner in Packer to apply your Nginx/hardening roles",
          "Run packer build to create the Golden AMI in your AWS account",
          "Verify the AMI is created and tagged correctly in the AWS console",
          "Update your Terraform code to use a data source (data \"aws_ami\") to find the newest Golden AMI",
          "Deploy the Golden AMI with Terraform — observe the faster boot time (no configuration required on boot)",
          "Integrate Packer into a GitHub Actions workflow to build AMIs weekly",
          "Understand the security benefits of immutable infrastructure (read-only filesystems, no SSH access required)"
        ],
        "commands": [
          "packer init .",
          "packer build ubuntu-nginx.pkr.hcl",
          "# Terraform data source:\ndata \"aws_ami\" \"golden\" {\n  most_recent = true\n  owners      = [\"self\"]\n  tags = { Name = \"nginx-golden-*\" }\n}"
        ],
        "gotcha": "Packer creates a temporary security group and key pair to SSH into the build instance. If the build fails, Packer usually cleans these up, but if the Packer process is killed abruptly, it leaves orphaned resources in your AWS account. Regularly audit your AWS account for orphaned \"packer_*\" security groups and key pairs.",
        "interviewAnswer": "Mutable infrastructure (running Ansible against live servers) leads to configuration drift — servers that have been running for a year are uniquely different from newly provisioned ones. Immutable infrastructure solves this. We bake the configuration into a Golden AMI using Packer and Ansible. When an update is needed, we do not patch the live server; we bake a new AMI and replace the server via a Terraform rolling update. This guarantees consistency and vastly speeds up auto-scaling.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL of your packer.pkr.hcl template and the Terraform code that consumes the generated AMI",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d87",
        "title": "Phase 7 Weekly Project — Zero-Click Production Environment",
        "scenario": "Deliver the full IaC pipeline: Terraform provisions a VPC and Bastion Host. Ansible (via dynamic inventory or Packer) hardens the Bastion. The entire workflow runs via GitHub Actions, guarded by tfsec. Zero manual steps.",
        "tasks": [
          "Write Terraform code for VPC, public/private subnets, IGW, and NAT Gateway",
          "Write Terraform code for the Bastion EC2 in the public subnet",
          "Write Terraform code for an RDS Postgres instance in the private subnet (no public access)",
          "Ensure tfsec passes clean on the repository",
          "Run terraform apply via GitHub Actions to provision the environment",
          "Verify the Bastion is reachable via SSH and hardened correctly",
          "Verify the RDS instance is ONLY reachable from the Bastion, not the internet",
          "Document the architecture and the deployment workflow in the README"
        ],
        "commands": [
          "# CI Workflow snippet\nterraform init\nterraform validate\ntfsec .\nterraform plan -out=tfplan\nterraform apply -auto-approve tfplan"
        ],
        "gotcha": "NAT Gateways are expensive (~$32/month base cost + data processing). If you leave this project running for a month, it will cost money. ALWAYS run terraform destroy when you are finished learning for the day. Add a destroy workflow or a cron job to automatically tear down dev environments at night.",
        "interviewAnswer": "A mature IaC pipeline treats infrastructure exactly like application code. Changes are proposed in PRs, tfsec provides automated security review, terraform plan provides the diff, and GitHub Actions performs the apply. This project demonstrates a production-ready AWS network topology (public/private tiers) managed entirely as code, with no human having console write access.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "GitHub Actions run URL showing successful terraform apply and tfsec pass",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d88",
        "title": "Phase 7 Incident Drill — Terraform State Deleted",
        "scenario": "Disaster strikes: the terraform.tfstate file is deleted from S3. The infrastructure is still running perfectly, but you cannot manage it via Terraform anymore. Running terraform apply now will attempt to recreate everything, which will fail (or worse, destroy data). Recover the state.",
        "tasks": [
          "Delete the terraform.tfstate file from your S3 backend manually to simulate the disaster",
          "Run terraform plan — observe it wants to CREATE all resources (which already exist)",
          "Attempt the easiest fix: check S3 versioning history and restore the previous version of the state file",
          "If versioning was disabled, use terraform import to pull the existing resources back into the state",
          "Run terraform import aws_vpc.main vpc-0abc12345",
          "Run terraform import aws_db_instance.default mydbinstance",
          "Run terraform plan until it shows \"No changes. Infrastructure is up-to-date.\"",
          "Write a postmortem on why S3 versioning must be enabled on state buckets"
        ],
        "commands": [
          "terraform import aws_vpc.main vpc-0abc1234567890def",
          "terraform plan  # Keep importing until this shows no changes"
        ],
        "gotcha": "terraform import pulls the resource into the state file, but it does NOT generate the HCL code for you. You must already have the HCL code written. Also, importing complex resources (like EKS clusters) can require importing multiple sub-resources (node groups, auth configmaps). Always enable S3 versioning to avoid this nightmare.",
        "interviewAnswer": "Terraform state loss is a critical incident. The recovery process depends on backups. If S3 versioning is enabled (which it always must be), recovery is a 1-minute process of restoring the previous version. If backups are gone, you must use terraform import to carefully map the real-world resource IDs back to your HCL definitions until terraform plan shows zero changes. Running an apply with an empty state against existing infrastructure is catastrophic.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing the terraform import commands used and the final terraform plan output showing \"No changes\"",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d89",
        "title": "Infrastructure Cost Optimisation & FinOps",
        "scenario": "Your AWS bill has doubled in the last 3 months. You need to implement FinOps practices to track, attribute, and optimise cloud costs across your Terraform-managed infrastructure without impacting performance.",
        "tasks": [
          "Implement a mandatory tagging strategy in Terraform (Environment, Team, CostCenter, Owner)",
          "Use the Terraform aws_default_tags provider configuration to enforce tags globally",
          "Integrate Infracost into your GitHub Actions workflow to see cost estimates on PRs",
          "Analyse the cost difference between On-Demand and Spot instances for worker nodes",
          "Configure a Terraform module to use an EC2 Spot Fleet or EKS managed spot node group",
          "Identify unattached EBS volumes and orphaned Elastic IPs in AWS using a bash script",
          "Configure AWS Budgets via Terraform to alert when monthly spend exceeds $50",
          "Write an architecture proposal for reducing the environment cost by 30%"
        ],
        "commands": [
          "infracost breakdown --path .",
          "infracost diff --path . --compare-to pre-commit-plan.json",
          "# Global tags in Terraform:\nprovider \"aws\" {\n  default_tags {\n    tags = { Environment = \"Production\", ManagedBy = \"Terraform\" }\n  }\n}"
        ],
        "gotcha": "Tags applied via aws_default_tags only apply to resources created by THAT provider block. Resources created by modules that instantiate their own providers, or resources where the tag key conflicts with a specific tag on the resource, may behave unexpectedly. Always verify tag coverage using AWS Cost Explorer or Tag Editor.",
        "interviewAnswer": "Cost is a first-class engineering metric. I implement FinOps by shifting cost awareness left: Infracost runs on every PR, showing the developer exactly how much their change will impact the monthly bill before it is merged. I use global default tags in Terraform so every resource is attributable to a team. For stateless workloads, moving from On-Demand to Spot instances via Auto Scaling Groups typically reduces compute costs by 60-70%.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of a GitHub PR comment from Infracost showing the cost impact of a change",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d90",
        "title": "Advanced Terraform — Terragrunt & DRY Environments",
        "scenario": "Managing dev, staging, and prod environments with plain Terraform requires copying and pasting module blocks and backend configurations. The code is not DRY. Migrate the infrastructure to Terragrunt to keep environment configurations DRY and manage dependencies between modules.",
        "tasks": [
          "Install Terragrunt and understand how it wraps Terraform",
          "Create a directory structure: prod/vpc, prod/eks, dev/vpc, dev/eks",
          "Write a root terragrunt.hcl to define the remote backend (S3) dynamically based on path",
          "Write child terragrunt.hcl files that source the Terraform modules and pass environment-specific inputs",
          "Define dependencies between modules: EKS depends on VPC outputs",
          "Run terragrunt run-all plan to plan the entire environment across all modules",
          "Understand how Terragrunt keeps backend configurations DRY (generate blocks)",
          "Compare Terragrunt to Terraform Workspaces and understand why Terragrunt is preferred for hard isolation"
        ],
        "commands": [
          "terragrunt plan",
          "terragrunt run-all apply",
          "# terragrunt.hcl snippet:\ndependency \"vpc\" {\n  config_path = \"../vpc\"\n}\ninputs = { vpc_id = dependency.vpc.outputs.vpc_id }"
        ],
        "gotcha": "terragrunt run-all can be dangerous if not used carefully, as it applies changes across multiple modules at once. If a dependency module (VPC) fails midway, the dependent modules (EKS) will also fail, leaving the environment in an inconsistent state. Prefer applying modules individually in CI pipelines for better control and error handling.",
        "interviewAnswer": "As infrastructure grows, plain Terraform struggles with code repetition across environments (dev/staging/prod) and managing dependencies between state files (e.g., EKS needs VPC outputs). Terragrunt solves this by keeping the backend configuration DRY, managing module dependencies natively, and allowing you to define environments using pure input variables without duplicating Terraform code.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL showing the Terragrunt directory structure and terragrunt.hcl files",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d91",
        "title": "Ansible Advanced — Dynamic Workflows & AWX/Tower",
        "scenario": "Running Ansible from a laptop is fine for 5 servers, but not for 500 across multiple teams. Install AWX (the open-source upstream for Ansible Automation Platform) to provide a web UI, RBAC, credentials management, and API access for your Ansible playbooks.",
        "tasks": [
          "Deploy AWX on your Kubernetes cluster (or Minikube) using the AWX Operator",
          "Configure an AWX Project linking to your Git repository containing the playbooks",
          "Configure AWX Credentials to securely store SSH keys and AWS access keys",
          "Create an AWX Inventory using the AWS EC2 dynamic inventory script",
          "Create a Job Template to run the patching playbook",
          "Configure RBAC: grant the \"Dev Team\" permission to run the playbook, but not edit it",
          "Trigger an AWX Job Template via its REST API (webhook from CI/CD)",
          "Understand the difference between Ansible CLI and enterprise automation platforms"
        ],
        "commands": [
          "kubectl apply -k github.com/ansible/awx-operator/config/default?ref=2.12.0",
          "curl -X POST -H \"Authorization: Bearer $TOKEN\" -H \"Content-Type: application/json\" https://awx.company.com/api/v2/job_templates/1/launch/"
        ],
        "gotcha": "AWX can be resource-intensive to run locally (requires PostgreSQL, Redis, and multiple pods). Ensure your cluster has at least 4GB of RAM available. Also, troubleshooting failed AWX jobs requires looking at the job execution logs in the UI, not just the pod logs.",
        "interviewAnswer": "Ansible CLI is a great tool, but AWX/Tower turns it into an enterprise platform. It provides a central execution environment, secure credential storage (so engineers don't need SSH keys on their laptops), RBAC, and full audit logging of who ran what playbook and when. It also exposes playbooks as an API, allowing us to trigger infrastructure configuration directly from our CI/CD pipelines or ITSM tools (like ServiceNow).",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of the AWX web UI showing a successful Job Template execution",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d92",
        "title": "Phase 7 Integration — The Complete GitOps Workflow",
        "scenario": "Bring it all together. A developer needs a new S3 bucket and a change to the Nginx configuration. They should not have AWS or SSH access. Create the end-to-end GitOps workflow where they open a PR, the infrastructure and configuration are tested, and changes are applied automatically on merge.",
        "tasks": [
          "Create a single Git repository containing both Terraform (infrastructure) and Ansible (configuration)",
          "Write a GitHub Actions workflow that detects changes in the `terraform/` directory and runs TF plan/apply",
          "Write a workflow that detects changes in the `ansible/` directory and triggers the AWX API to run the playbook",
          "Enforce branch protection rules requiring passing tfsec and Infracost checks before merge",
          "Test the workflow: open a PR changing the S3 bucket name and the Nginx port",
          "Review the automated PR comments (plan output, cost impact)",
          "Merge the PR and verify the infrastructure and configuration are updated in AWS",
          "Document the entire workflow and the security boundaries it enforces"
        ],
        "commands": [
          "# Workflow path filtering snippet\non:\n  push:\n    paths:\n      - \"terraform/**\"\n      - \"ansible/**\""
        ],
        "gotcha": "When combining infrastructure provisioning (Terraform) and configuration management (Ansible) in CI, ordering is critical. If Terraform creates a new EC2 instance, you must wait for the instance to boot, pass status checks, and have SSH available BEFORE triggering the Ansible playbook. Use a sleep or a wait-for-ssh task in Ansible to handle the timing gap.",
        "interviewAnswer": "The pinnacle of infrastructure management is a complete GitOps workflow. The Git repository is the sole source of truth. Developers request changes via Pull Requests. CI pipelines provide automated feedback on security (tfsec) and cost (Infracost). Upon merge, CD pipelines orchestrate the change: Terraform provisions the resources, and then Ansible (via AWX) configures them. No human touches production directly; everything is versioned, peer-reviewed, and auditable.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "GitHub Actions run URL showing the combined Terraform and Ansible execution workflow",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d93",
        "title": "Phase 7 Capstone Review & Optimisation",
        "scenario": "Review the entire Phase 7 deployment. Identify areas for optimisation in performance, security, and cost. Refactor the Terraform modules to use best practices and optimise the Ansible playbooks for faster execution.",
        "tasks": [
          "Review Terraform code for hardcoded values and replace with variables/locals",
          "Optimise Ansible playbooks: use `async` and `poll` for long-running tasks",
          "Optimise Ansible execution: enable pipelining in ansible.cfg to reduce SSH overhead",
          "Review AWS security groups: ensure absolute minimum required ports are open",
          "Implement a Terraform data source to dynamically fetch the latest secure AMI",
          "Write comprehensive documentation (README.md) for the repository",
          "Prepare a presentation summarizing the architecture, security posture, and workflow",
          "Clean up all AWS resources to avoid unnecessary charges (terraform destroy)"
        ],
        "commands": [
          "# ansible.cfg snippet\n[ssh_connection]\npipelining = True",
          "terraform destroy -auto-approve"
        ],
        "gotcha": "Enabling pipelining in Ansible significantly speeds up execution, but it requires `requiretty` to be disabled in `/etc/sudoers` on the managed nodes. If a playbook fails with a sudo error after enabling pipelining, check the sudoers configuration.",
        "interviewAnswer": "Continuous improvement is part of IaC. I regularly review Terraform code to remove hardcoding, tighten security groups, and implement data sources for dynamic lookups (like latest AMIs). For Ansible, enabling pipelining and using async tasks for slow operations (like package updates) can reduce playbook execution time by 50%, speeding up the entire deployment pipeline.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL showing the optimised Terraform and Ansible configurations and comprehensive documentation",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p7-d94",
        "title": "Phase 7 Incident Drill — Compromised Bastion Host",
        "scenario": "Security alerts indicate suspicious outbound traffic originating from your Bastion host. You must assume the host is compromised. You need to isolate it, preserve logs for forensics, and provision a new, secure replacement using your IaC pipeline.",
        "tasks": [
          "Isolate the compromised instance: modify its security group via AWS Console (or CLI) to block ALL outbound and inbound traffic (except your forensic IP)",
          "DO NOT terminate the instance yet; preserve it for forensics",
          "Identify the root cause in the Ansible hardening playbook (e.g., weak SSH config or missing fail2ban)",
          "Update the Ansible playbook to fix the vulnerability and commit to Git",
          "Update Terraform to create a new Bastion instance (change the name/ID) and run terraform apply",
          "Verify the new Bastion is secure and operational",
          "Terminate the compromised instance via Terraform (remove it from state, then delete in AWS)",
          "Write a postmortem detailing the breach, response, and remediation"
        ],
        "commands": [
          "aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --groups sg-isolated",
          "terraform state rm aws_instance.bastion  # Remove compromised from state",
          "aws ec2 terminate-instances --instance-ids i-1234567890abcdef0"
        ],
        "gotcha": "If you just run `terraform destroy` on the compromised instance, you destroy all forensic evidence (logs, memory state). You must isolate it at the network level first. Furthermore, if you just update the code and run `terraform apply`, it might destroy and recreate the instance in place, again losing evidence. Remove the instance from Terraform state first (`terraform state rm`), then provision a new one.",
        "interviewAnswer": "Incident response for compromised infrastructure in an IaC environment: Isolate, Preserve, Remediate via Code, Provision New, Terminate Old. I isolate the instance using AWS Security Groups to stop data exfiltration while preserving the disk/memory for forensics. I fix the root cause in Terraform/Ansible, deploy a fresh instance via the CI pipeline, and only then terminate the isolated instance. IaC allows us to rebuild clean infrastructure in minutes rather than spending hours trying to clean a compromised server.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your incident response timeline, commands used for isolation, and the postmortem",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      }
    ]
  },
  {
    "id": "phase-8",
    "phase": 8,
    "title": "Advanced Kubernetes & Service Mesh",
    "days": "Days 95–110",
    "icon": "🕸️",
    "instanceType": "EKS t3.medium",
    "estimatedCost": "~$100/month (EKS + Nodes)",
    "weeklyProject": {
      "title": "Microservices with Istio Service Mesh",
      "scenario": "Deploy a multi-tier microservices application (e.g., Google's Microservices Demo or Bookinfo) to EKS. Install Istio. Configure mTLS between all services, implement traffic shifting (Canary) for one service, set up rate limiting, and visualize the service graph using Kiali and Jaeger.",
      "successCriteria": [
        "Istio installed and sidecars injected into all application pods",
        "Strict mTLS enforced across the namespace",
        "VirtualService configured to route 10% of traffic to a canary version",
        "Kiali dashboard shows the service graph and traffic flow",
        "Jaeger shows distributed traces across the microservices"
      ],
      "artifact": "Screenshot of Kiali service graph and URL to Istio configuration YAMLs"
    },
    "incidentDrill": {
      "title": "SEV-1: Service Mesh Misconfiguration — 503s Cascading",
      "scenario": "An engineer applied a new Istio DestinationRule and suddenly services are returning 503 Service Unavailable. The application pods are running and healthy, but traffic is blocked. Diagnose Envoy proxy logs and fix the routing configuration.",
      "timeLimit": "30 minutes",
      "postMortemRequired": true
    },
    "dayTasks": [
      {
        "id": "p8-d95",
        "title": "StatefulSets & Persistent Volumes",
        "scenario": "You need to deploy a highly available database (e.g., MongoDB replica set) on Kubernetes. A Deployment will not work because the pods need stable network identities and persistent storage that stays with the specific pod even if it is rescheduled. Use StatefulSets.",
        "tasks": [
          "Understand the difference between Deployment (stateless) and StatefulSet (stateful)",
          "Create a StorageClass for AWS EBS volumes",
          "Create a PersistentVolumeClaim (PVC) and understand how it binds to a PersistentVolume (PV)",
          "Write a StatefulSet manifest for a simple database (or Redis)",
          "Configure a Headless Service (ClusterIP: None) for stable DNS names (pod-0.service, pod-1.service)",
          "Deploy the StatefulSet and observe ordered pod creation (0, 1, 2)",
          "Delete a pod and verify it is rescheduled with the SAME identity and SAME attached volume",
          "Understand the complexities of backing up and scaling StatefulSets"
        ],
        "commands": [
          "kubectl apply -f storageclass.yaml",
          "kubectl apply -f statefulset.yaml",
          "kubectl get pods -w  # Observe ordered creation",
          "kubectl delete pod my-db-0 && kubectl get pods -w  # Observe recreation"
        ],
        "gotcha": "StatefulSets manage ordered deployment, scaling, and deletion. If you scale down a StatefulSet, it terminates pods in reverse order (2, then 1, then 0). However, scaling down does NOT delete the PersistentVolumeClaims. This is a safety feature to prevent data loss, but it means you must manually delete PVCs if you want to completely tear down the stateful application and stop paying for storage.",
        "interviewAnswer": "Deployments are for stateless applications where any pod can handle any request and pods are interchangeable. StatefulSets are for stateful applications (databases, message queues) that require stable network identities (DNS), stable persistent storage (volumes attached to specific pods), and ordered deployment/scaling. I use Headless Services to allow pods within a StatefulSet to discover each other directly for clustering.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your StatefulSet and Headless Service YAML configurations",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d96",
        "title": "Kubernetes Secrets Management Deep Dive",
        "scenario": "Your current External Secrets Operator setup is good, but your security team requires integration with HashiCorp Vault for dynamic secrets (short-lived database credentials). Deploy Vault and configure the Vault Agent Injector to provide secrets to pods without using Kubernetes Secrets at all.",
        "tasks": [
          "Deploy HashiCorp Vault to the cluster using the official Helm chart",
          "Initialize and unseal Vault",
          "Configure Kubernetes authentication in Vault (pods authenticate using their ServiceAccount)",
          "Enable the database secrets engine in Vault to generate short-lived credentials",
          "Write a Vault policy granting read access to specific secret paths",
          "Annotate an application Deployment to use the Vault Agent Injector",
          "Verify the application pod receives the secret in an in-memory file (/vault/secrets/)",
          "Understand why this is more secure than native Kubernetes Secrets (no etcd storage, short-lived)"
        ],
        "commands": [
          "helm install vault hashicorp/vault --set \"server.dev.enabled=true\"",
          "vault auth enable kubernetes",
          "vault write auth/kubernetes/config kubernetes_host=\"https://$KUBERNETES_PORT_443_TCP_ADDR:443\"",
          "kubectl exec -it app-pod -- cat /vault/secrets/db-creds"
        ],
        "gotcha": "The Vault Agent Injector mutates your pod configuration to add a sidecar container that fetches the secrets. If Vault is down, or if the pod's ServiceAccount lacks permissions in Vault, the sidecar will fail to start, preventing the main application container from starting (InitContainer failure). Always ensure Vault is highly available and policies are correct.",
        "interviewAnswer": "Native Kubernetes Secrets are stored in etcd (often unencrypted) and are static. For high-security environments, I use HashiCorp Vault with the Agent Injector. The application pod authenticates to Vault using its native Kubernetes ServiceAccount. Vault then dynamically generates short-lived credentials (e.g., valid for 1 hour) and injects them directly into the pod's memory space. The secret never touches etcd or the disk, and if compromised, expires quickly.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot showing the injected secret file inside the application pod",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d97",
        "title": "Introduction to Service Mesh & Istio Architecture",
        "scenario": "As your microservices grow to 20+ applications, configuring mTLS, retries, circuit breakers, and distributed tracing in every application's code becomes impossible. Introduce Istio Service Mesh to handle all network communication transparently at the infrastructure layer.",
        "tasks": [
          "Understand the Service Mesh architecture: Control Plane (istiod) vs Data Plane (Envoy proxies)",
          "Install Istio on your EKS cluster using the istioctl CLI (demo profile)",
          "Label a namespace for automatic sidecar injection (istio-injection=enabled)",
          "Deploy a sample microservices application (e.g., Bookinfo)",
          "Verify that every application pod now has 2 containers (app + istio-proxy)",
          "Understand how iptables intercepts all inbound and outbound pod traffic and routes it through Envoy",
          "Install Kiali, Prometheus, and Jaeger addons provided by Istio",
          "Access the Kiali dashboard and view the service graph"
        ],
        "commands": [
          "istioctl install --set profile=demo -y",
          "kubectl label namespace default istio-injection=enabled",
          "kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml",
          "istioctl dashboard kiali"
        ],
        "gotcha": "Istio sidecar injection only happens when pods are CREATED. If you label a namespace with istio-injection=enabled, existing pods do NOT automatically get the sidecar. You must restart them (e.g., kubectl rollout restart deployment) so the admission controller can intercept the creation request and inject the Envoy proxy.",
        "interviewAnswer": "A Service Mesh abstracts network communication logic (retries, mTLS, routing, observability) out of the application code and into an infrastructure layer. Istio uses Envoy proxies deployed as sidecars in every pod (the Data Plane), managed by a central Control Plane (istiod). This allows us to enforce global security policies and gain deep observability without rewriting application code.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of the Kiali dashboard showing the service graph of the deployed application",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d98",
        "title": "Istio Traffic Management — Gateways & VirtualServices",
        "scenario": "You need to expose the microservices application to the internet, but you want advanced routing: route mobile users to a v2 service, and desktop users to v1. Configure Istio Ingress Gateway and VirtualServices to manage inbound traffic.",
        "tasks": [
          "Understand the difference between Kubernetes Ingress and Istio Gateway/VirtualService",
          "Create an Istio Gateway resource to configure the entry point (ports, hosts, TLS)",
          "Create a VirtualService to route traffic from the Gateway to the internal Kubernetes Services",
          "Configure path-based routing (/api/v1 goes to service A, /api/v2 goes to service B)",
          "Configure header-based routing (e.g., user-agent regex matching for mobile vs desktop)",
          "Test the routing rules using curl with different headers",
          "Configure traffic shifting (weight-based routing): 90% to v1, 10% to v2 (Canary)",
          "Use DestinationRules to define subsets (versions) of a service based on pod labels"
        ],
        "commands": [
          "kubectl apply -f gateway.yaml",
          "kubectl apply -f virtualservice.yaml",
          "kubectl apply -f destinationrule.yaml",
          "curl -H \"User-Agent: Mobile\" http://$INGRESS_HOST/api"
        ],
        "gotcha": "A common mistake is creating a VirtualService but forgetting the DestinationRule. If you configure a VirtualService to route to subset: v2, but no DestinationRule defines what v2 is (via label selectors), Envoy will drop the traffic and return a 503 Service Unavailable. Gateway, VirtualService, and DestinationRule work together.",
        "interviewAnswer": "Istio replaces standard Kubernetes Ingress with a more powerful model. The Gateway configures the load balancer (ports, TLS). The VirtualService handles the routing logic (host, path, headers, weights). The DestinationRule configures what happens when traffic reaches the service (load balancing policy, subsets/versions, circuit breakers). This decoupling enables complex traffic patterns like canary deployments and header-based routing.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your Gateway, VirtualService, and DestinationRule YAML configurations",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d99",
        "title": "Istio Resilience — Retries, Timeouts & Circuit Breakers",
        "scenario": "One backend service is occasionally slow or returning 500s, causing the upstream services to wait indefinitely or fail. Implement resilience patterns at the network layer using Istio, without changing the application code.",
        "tasks": [
          "Configure a timeout in a VirtualService (e.g., abort request if not answered in 2 seconds)",
          "Configure automatic retries in a VirtualService (e.g., retry 3 times on 5xx errors)",
          "Understand the \"retry storm\" problem and how to mitigate it",
          "Configure a Circuit Breaker in a DestinationRule using ConnectionPoolSettings and OutlierDetection",
          "Set rules to eject a pod from the load balancing pool if it returns 5 consecutive 5xx errors",
          "Test the circuit breaker using a load generator (k6 or fortio)",
          "Observe the circuit breaker tripping in the Envoy proxy logs and Kiali",
          "Implement fault injection (chaos engineering) via VirtualService to test resilience"
        ],
        "commands": [
          "kubectl apply -f virtualservice-retry-timeout.yaml",
          "kubectl apply -f destinationrule-circuitbreaker.yaml",
          "kubectl apply -f virtualservice-fault-injection.yaml",
          "fortio load -c 2 -qps 0 -n 20 -loglevel Warning http://service-b:8000/"
        ],
        "gotcha": "Retries and timeouts must be coordinated across the stack. If Service A calls Service B with a 5-second timeout, and Service B calls Service C with a 10-second timeout, Service A will time out before Service B finishes. Istio handles this automatically by propagating the deadline context via headers, but you must be aware of the overall request budget.",
        "interviewAnswer": "Resilience should be handled by the infrastructure, not the application. I use Istio VirtualServices to enforce timeouts and retries, protecting against transient network failures. More importantly, I configure Circuit Breakers in DestinationRules (Outlier Detection). If a specific pod starts throwing errors, Istio automatically removes it from the load balancing pool for a period, preventing cascading failures across the microservice architecture.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing the DestinationRule with Circuit Breaker (OutlierDetection) configuration",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d100",
        "title": "Istio Security — mTLS, Authorization & PeerAuthentication",
        "scenario": "Compliance requires that all communication between microservices is encrypted in transit and strongly authenticated. Enable strict mTLS across the cluster and configure AuthorizationPolicies to enforce zero-trust network access.",
        "tasks": [
          "Understand how Istio provisions identities (SPIFFE) and certificates to Envoy proxies",
          "Create a PeerAuthentication resource to enforce STRICT mTLS for the entire namespace",
          "Verify that pods outside the mesh (no sidecar) can no longer communicate with pods inside the mesh",
          "Create AuthorizationPolicies to implement Zero-Trust (default deny all traffic)",
          "Add specific AuthorizationPolicies to allow Service A to GET Service B, but deny POST",
          "Deny access to specific paths (e.g., /admin) except from specific ServiceAccounts",
          "Verify the policies by using curl from different pods (allowed vs denied)",
          "View the mTLS status and security badges in the Kiali dashboard"
        ],
        "commands": [
          "kubectl apply -f peerauthentication-strict.yaml",
          "kubectl apply -f authorizationpolicy-deny-all.yaml",
          "kubectl apply -f authorizationpolicy-allow-a-to-b.yaml",
          "istioctl x describe pod <pod-name>"
        ],
        "gotcha": "When applying a default-deny AuthorizationPolicy, you must ensure you have explicit rules allowing health checks (liveness/readiness probes) from the kubelet. If you block the kubelet, your pods will fail health checks and be restarted continuously (CrashLoopBackOff). Istio usually handles this by rewriting probes, but complex policies can interfere.",
        "interviewAnswer": "Istio provides Zero-Trust networking out of the box. PeerAuthentication enforces strict mTLS, ensuring all pod-to-pod traffic is encrypted and authenticated using SPIFFE identities, without any code changes. AuthorizationPolicies allow me to enforce granular, layer-7 access control: specifying not just WHICH service can talk to another, but WHAT HTTP methods and paths they are allowed to use.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of Kiali showing the padlock icon (mTLS) on edges between services, and a gist of your AuthorizationPolicy",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d101",
        "title": "Debugging Envoy & istioctl",
        "scenario": "A complex routing rule is not working as expected. You need to debug the configuration at the data plane level by inspecting the Envoy proxy configuration directly.",
        "tasks": [
          "Use istioctl analyze to find common misconfigurations before applying YAML",
          "Use istioctl proxy-status to check the sync status of all Envoy proxies",
          "Use istioctl proxy-config cluster to see the upstream clusters Envoy knows about",
          "Use istioctl proxy-config route to inspect the specific routing rules applied to a pod",
          "Use istioctl proxy-config endpoint to verify Envoy has the correct pod IPs for a service",
          "Enable Envoy access logs via Istio configuration",
          "Read and understand the Envoy access log format (response flags like NR, URX, UF)",
          "Diagnose a 503 error using response flags"
        ],
        "commands": [
          "istioctl analyze -n default",
          "istioctl proxy-status",
          "istioctl proxy-config route <pod-name>",
          "kubectl logs <pod-name> -c istio-proxy | grep \"503\""
        ],
        "gotcha": "Istio configuration is eventually consistent. When you apply a VirtualService, istiod must translate it and push it to all Envoy proxies. This takes milliseconds to seconds. Always use istioctl proxy-status to ensure the configuration is SYNCED across all proxies before assuming your change is broken.",
        "interviewAnswer": "Debugging a Service Mesh means debugging Envoy. When routing fails, I start with istioctl analyze to catch obvious errors. Then, I use istioctl proxy-config route to see exactly what routing rules Envoy is applying to that specific pod. If the rules are correct but traffic fails, I check the Envoy access logs in the istio-proxy container — the response flags (like NR for No Route, or UC for Upstream Connection Failure) tell me exactly why Envoy dropped or rejected the request.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing the output of istioctl proxy-config route for one of your pods",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d102",
        "title": "Kubernetes GitOps with ArgoCD",
        "scenario": "Stop running kubectl apply in CI pipelines. It requires giving CI tools cluster admin credentials and suffers from configuration drift. Implement GitOps using ArgoCD: the cluster pulls configuration from Git and continuously reconciles it.",
        "tasks": [
          "Understand the pull-based GitOps model vs the push-based CI/CD model",
          "Install ArgoCD in your cluster using the official manifests",
          "Access the ArgoCD UI and configure a connection to your Git repository",
          "Create an ArgoCD Application resource pointing to your Helm chart or manifests in Git",
          "Observe ArgoCD deploy the application and mark it as \"Healthy\" and \"Synced\"",
          "Simulate configuration drift: manually delete a pod or edit a deployment via kubectl",
          "Observe ArgoCD detect the \"OutOfSync\" state and automatically heal the cluster",
          "Configure ArgoCD auto-sync policies and prune behavior"
        ],
        "commands": [
          "kubectl create namespace argocd",
          "kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml",
          "kubectl port-forward svc/argocd-server -n argocd 8080:443",
          "argocd app create myapp --repo https://github.com/my/repo.git --path chart --dest-server https://kubernetes.default.svc --dest-namespace default"
        ],
        "gotcha": "ArgoCD considers resources OutOfSync if the cluster state differs from Git. If you have tools like HPA (Horizontal Pod Autoscaler) or other operators modifying resources in the cluster (e.g., changing the replica count), ArgoCD will fight them, constantly reverting the replica count back to what is in Git. Configure ArgoCD to ignore differences for specific fields (like spec.replicas) when using HPA.",
        "interviewAnswer": "GitOps with ArgoCD flips the deployment model. Instead of CI pushing to Kubernetes (which requires exposing cluster credentials), ArgoCD runs inside the cluster and pulls desired state from Git. Git becomes the absolute source of truth. If anyone makes manual changes in the cluster, ArgoCD detects the drift and immediately reconciles it back to the Git state, eliminating configuration drift and simplifying disaster recovery.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of the ArgoCD UI showing your application as Synced and Healthy",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d103",
        "title": "Advanced ArgoCD — ApplicationSets & Multi-Cluster",
        "scenario": "You need to deploy the same application to 5 different environments (dev, staging, prod-us, prod-eu, prod-asia). Creating 5 ArgoCD Applications manually is tedious. Use ApplicationSets to automate application deployment across multiple clusters and environments.",
        "tasks": [
          "Understand the ArgoCD ApplicationSet controller",
          "Create an ApplicationSet using the List generator to deploy to dev and staging namespaces",
          "Use template fields ({{cluster}}, {{namespace}}) to dynamically configure the deployments",
          "Understand the Git directory generator: automatically deploy any new app added to a specific Git folder",
          "Configure a Sync Window to restrict deployments to specific maintenance hours",
          "Implement a progressive sync strategy for safer multi-cluster rollouts",
          "Manage ArgoCD RBAC: grant developers read-only access to their applications",
          "Use ArgoCD Image Updater to automatically deploy new image tags without committing to Git (optional/advanced)"
        ],
        "commands": [
          "# applicationset.yaml snippet\napiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nmetadata:\n  name: myapp-deployments\nspec:\n  generators:\n  - list:\n      elements:\n      - cluster: in-cluster\n        namespace: dev\n      - cluster: in-cluster\n        namespace: staging\n  template:\n    metadata:\n      name: '{{namespace}}-myapp'\n    spec:\n      destination:\n        server: 'https://kubernetes.default.svc'\n        namespace: '{{namespace}}'"
        ],
        "gotcha": "ApplicationSets are powerful but can be destructive. If you accidentally misconfigure a generator or template and it evaluates to replacing or deleting existing applications, ArgoCD will ruthlessly execute that change across all targeted clusters simultaneously. Always test ApplicationSets in a dry-run or dev environment first, and use the `preserveResourcesOnDeletion` flag while learning.",
        "interviewAnswer": "Managing multi-environment, multi-cluster deployments manually doesn't scale. ArgoCD ApplicationSets act as a \"factory\" for Applications. I use the Git directory generator to automatically instantiate applications whenever a new folder is added to our GitOps repo, and the List generator to fan out a single application to dev, staging, and production clusters with environment-specific values. This provides a single pane of glass for fleet-wide management.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL showing your ApplicationSet YAML configuration",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d104",
        "title": "Progressive Delivery with Argo Rollouts",
        "scenario": "Standard Kubernetes rolling updates lack fine-grained control and observability. If a new version introduces a subtle bug, 100% of users might be affected before you notice. Implement Argo Rollouts to perform automated, metric-driven Canary deployments.",
        "tasks": [
          "Install the Argo Rollouts controller and kubectl plugin",
          "Migrate a standard Kubernetes Deployment to an Argo Rollouts Rollout resource",
          "Configure a Canary strategy: 20% traffic for 5 minutes, then 50% for 5 minutes, then 100%",
          "Integrate with Prometheus: configure an AnalysisTemplate to measure HTTP success rate",
          "Trigger an update and watch the rollout pause at the canary steps",
          "Simulate a failed deployment (high error rate) and watch Argo Rollouts automatically abort and rollback",
          "Use the Argo Rollouts dashboard or CLI to promote or abort a rollout manually",
          "Compare Blue-Green and Canary strategies within Argo Rollouts"
        ],
        "commands": [
          "kubectl argo rollouts plugin install",
          "kubectl apply -f rollout.yaml",
          "kubectl argo rollouts set image rollout/myapp app=myapp:v2",
          "kubectl argo rollouts get rollout myapp -w",
          "kubectl argo rollouts promote myapp"
        ],
        "gotcha": "Argo Rollouts relies heavily on the underlying ingress controller or service mesh for fine-grained traffic splitting. If you use a basic Kubernetes Service, traffic splitting is limited by the ratio of pod replicas (e.g., to get 10% canary traffic, you need at least 9 stable pods and 1 canary pod). To achieve true percentage-based traffic splitting regardless of pod count, you must integrate Argo Rollouts with Istio, NGINX Ingress, or AWS ALB.",
        "interviewAnswer": "Progressive delivery reduces the blast radius of bad deployments. Argo Rollouts replaces the standard Deployment object and orchestrates complex release strategies like Canary and Blue-Green. The real power is automated analysis: during a canary step, Argo queries Prometheus metrics (e.g., error rate, latency). If the metrics degrade, it automatically aborts and rolls back before impacting all users. This moves us from \"deploy and pray\" to data-driven releases.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of the `kubectl argo rollouts get rollout -w` output showing a progressive canary rollout in progress",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d105",
        "title": "Kubernetes Backup & Disaster Recovery with Velero",
        "scenario": "Your cluster was accidentally deleted, or a ransomware attack corrupted your Persistent Volumes. You need to restore the entire cluster state and stateful data to a new cluster within 1 hour. Implement Velero for backup and disaster recovery.",
        "tasks": [
          "Install Velero CLI and deploy Velero to the cluster using the AWS plugin",
          "Configure Velero to use an S3 bucket for backup storage and EBS snapshots for volumes",
          "Create a backup of a specific namespace, including its Persistent Volumes",
          "Simulate a disaster: delete the namespace completely (kubectl delete ns myapp)",
          "Restore the namespace from the Velero backup",
          "Verify the application is running and the persistent data is intact",
          "Configure scheduled backups (e.g., daily at midnight)",
          "Understand the difference between state (etcd) backups and resource backups (Velero)"
        ],
        "commands": [
          "velero install --provider aws --plugins velero/velero-plugin-for-aws:v1.6.0 --bucket my-velero-backups --secret-file ./credentials-velero --use-volume-snapshots=true --backup-location-config region=us-east-1 --snapshot-location-config region=us-east-1",
          "velero backup create myapp-backup --include-namespaces myapp",
          "kubectl delete namespace myapp",
          "velero restore create --from-backup myapp-backup"
        ],
        "gotcha": "Velero EBS snapshots only work if the AWS IAM role attached to the Velero pod has the necessary EC2 snapshot permissions. Furthermore, EBS snapshots are region-specific. If your DR strategy involves restoring to a cluster in a DIFFERENT AWS region, you must configure cross-region snapshot copying, or use Velero's restic/kopia integration to backup volume data directly to S3 (file-system level backup) instead of relying on EBS snapshots.",
        "interviewAnswer": "GitOps (ArgoCD) restores stateless configuration, but it does not restore stateful data (volumes) or cluster-specific state (like dynamically generated certificates or tokens). Velero fills this gap. It backs up Kubernetes API resources to S3 and takes native cloud snapshots (EBS) of persistent volumes. In a DR scenario, I use Terraform to provision a new cluster, ArgoCD to lay down the base configuration, and Velero to restore the stateful workloads and their data.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing the Velero backup and restore commands, and kubectl output confirming the restored resources",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d106",
        "title": "Phase 8 Weekly Project — Microservices with Istio & ArgoCD",
        "scenario": "Deliver the full advanced stack: Deploy a microservices demo app using ArgoCD GitOps. Inject Istio sidecars. Enforce strict mTLS. Implement an Argo Rollouts Canary deployment for one service, and verify traffic routing and security policies in Kiali.",
        "tasks": [
          "Set up the GitOps repo structure for the microservices app",
          "Create an ArgoCD Application to manage the deployment",
          "Ensure the namespace is labelled for Istio injection",
          "Apply Istio PeerAuthentication and AuthorizationPolicies via ArgoCD",
          "Migrate one service to use an Argo Rollouts Canary strategy",
          "Trigger a deployment and observe the automated rollout",
          "Verify mTLS and traffic flow in Kiali",
          "Verify distributed tracing in Jaeger"
        ],
        "commands": [
          "# This project relies on Git commits to trigger ArgoCD, rather than imperative commands",
          "git commit -m \"Update image tag to v2 for canary rollout\"",
          "git push origin main"
        ],
        "gotcha": "When combining ArgoCD, Istio, and Argo Rollouts, the interaction between controllers can be complex. Argo Rollouts creates temporary ReplicaSets during a canary update. If ArgoCD is not configured to ignore these generated resources, it will constantly report \"OutOfSync\" and try to delete them. Ensure ArgoCD is properly configured with custom resource health checks and ignore differences for Argo Rollouts.",
        "interviewAnswer": "This architecture represents modern cloud-native delivery. ArgoCD provides GitOps CD, ensuring the cluster matches Git. Istio provides the secure, observable network fabric (mTLS, tracing). Argo Rollouts leverages Istio's traffic management to provide safe, progressive canary deployments based on metrics. Together, they eliminate manual intervention, reduce deployment risk, and provide deep visibility into microservice interactions.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Collage or links to screenshots showing: ArgoCD Healthy state, Kiali Service Graph with mTLS, and Argo Rollouts Canary in progress",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d107",
        "title": "Phase 8 Incident Drill — Service Mesh Misconfiguration",
        "scenario": "An engineer merged a PR updating the Istio configuration. Suddenly, the frontend service is returning 503 errors when calling the backend. The pods are healthy. You have 30 minutes to diagnose the Envoy proxy configuration, find the bad rule, and fix it via GitOps.",
        "tasks": [
          "Acknowledge the alert and begin investigation",
          "Check application logs — confirm the pods are healthy and not crashing",
          "Check Envoy proxy logs (istio-proxy container) in the frontend pod",
          "Identify the response flag in the Envoy log (e.g., NR for No Route, or UO for Upstream Overflow)",
          "Use istioctl analyze to check for configuration conflicts",
          "Use istioctl proxy-config route and endpoint to see how Envoy is trying to route the traffic",
          "Identify the misconfigured VirtualService or DestinationRule (e.g., missing subset, wrong port)",
          "Fix the YAML in Git, push, let ArgoCD sync, and verify recovery"
        ],
        "commands": [
          "kubectl logs <frontend-pod> -c istio-proxy --tail 50",
          "istioctl analyze -n default",
          "istioctl proxy-config route <frontend-pod> --name <backend-port>"
        ],
        "gotcha": "When a Service Mesh is involved, network errors often manifest as 503 Service Unavailable, generated by the proxy, not the application. The application logs will show nothing, because the request never reached the application. You must look at the Envoy access logs (`-c istio-proxy`) to see why the proxy rejected or dropped the request.",
        "interviewAnswer": "Troubleshooting in a Service Mesh requires a mindset shift. If pods are healthy but communication fails, the mesh configuration is the suspect. I rely heavily on `istioctl` for debugging. I check the Envoy access logs for response flags (like 503 UC - Upstream Connection Failure), use `istioctl analyze` to spot logical errors, and inspect the actual proxy routes with `istioctl proxy-config`. Once identified, the fix is always pushed through GitOps (ArgoCD) to maintain the audit trail.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist detailing the troubleshooting steps, the Envoy log error found, the `istioctl` command used, and the configuration fix",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d108",
        "title": "Kubernetes Cluster Upgrades & Maintenance",
        "scenario": "Your EKS cluster is running Kubernetes v1.28. It needs to be upgraded to v1.29. Plan and execute a zero-downtime cluster upgrade, including control plane, worker nodes, and critical add-ons.",
        "tasks": [
          "Read the Kubernetes and EKS release notes for the target version (check for deprecated APIs)",
          "Use a tool like `pluto` or `kubepug` to scan the cluster for deprecated API versions",
          "Upgrade the EKS control plane via Terraform or eksctl",
          "Upgrade critical add-ons (VPC CNI, CoreDNS, kube-proxy)",
          "Create a new managed node group with the updated AMI",
          "Cordon and drain the old worker nodes safely to migrate pods to the new nodes",
          "Verify PodDisruptionBudgets (PDBs) are respected during the node drain",
          "Delete the old node group"
        ],
        "commands": [
          "pluto detect-helm --helm-version 3",
          "eksctl upgrade cluster --name my-cluster --version 1.29 --approve",
          "kubectl drain <old-node-name> --ignore-daemonsets --delete-emptydir-data"
        ],
        "gotcha": "Kubernetes removes deprecated APIs regularly. If you upgrade the control plane while you have resources (like old Ingress or HPA manifests) using removed API versions, those resources may break, or your GitOps tool will fail to sync them. Always scan for deprecated APIs BEFORE starting the upgrade.",
        "interviewAnswer": "Cluster upgrades are routine but require careful planning. The process: 1. Scan for and remediate deprecated APIs. 2. Upgrade the control plane. 3. Upgrade add-ons. 4. Roll the worker nodes. I use managed node groups and `kubectl drain` to gracefully evict pods. PodDisruptionBudgets (PDBs) are critical here—they ensure that draining a node doesn't violate the high-availability requirements of the applications running on it.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing the output of the API deprecation scan and the commands used to drain a node",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d109",
        "title": "Custom Resource Definitions (CRDs) & Operators",
        "scenario": "Extend Kubernetes capabilities by understanding how Operators work. Deploy the Prometheus Operator and create custom resources to automatically manage monitoring configuration.",
        "tasks": [
          "Understand the Operator Pattern: CRD (Custom Resource Definition) + Custom Controller",
          "Examine a CRD definition (e.g., ServiceMonitor) to see how it extends the Kubernetes API",
          "Install the Prometheus Operator (if not already done via kube-prometheus-stack)",
          "Create a ServiceMonitor custom resource for a new application",
          "Observe how the Operator detects the new ServiceMonitor and reconfigures Prometheus automatically",
          "Understand the difference between a standard controller (like ReplicaSet) and an Operator (domain-specific knowledge)",
          "Explore other common Operators (e.g., Strimzi for Kafka, ECK for Elasticsearch)",
          "Use kubectl to interact with custom resources just like native resources (get, describe, edit)"
        ],
        "commands": [
          "kubectl get crds | grep coreos",
          "kubectl get servicemonitors -A",
          "kubectl describe crd servicemonitors.monitoring.coreos.com"
        ],
        "gotcha": "When you delete a CRD, Kubernetes automatically deletes ALL custom resources of that type across the entire cluster. If you accidentally delete the ServiceMonitor CRD, every single ServiceMonitor configuration is wiped out instantly. Manage CRDs carefully, usually via cluster-admin restricted pipelines.",
        "interviewAnswer": "The Operator pattern is how Kubernetes is extended to manage complex, stateful applications. It combines a CRD (which defines a new API schema) with a custom controller (a pod running a reconciliation loop). Instead of manually configuring Prometheus, we create a ServiceMonitor CRD; the Operator sees it and handles the complex configuration updates. This turns human operational knowledge into software.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing the `kubectl get crds` output and the YAML for a custom resource you created",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p8-d110",
        "title": "Phase 8 Capstone & Review",
        "scenario": "Consolidate knowledge from Phase 8. Review the architecture, security, and operational workflows of the advanced Kubernetes setup.",
        "tasks": [
          "Review the Service Mesh architecture and traffic flow",
          "Review the GitOps deployment workflow with ArgoCD and Argo Rollouts",
          "Ensure all disaster recovery procedures (Velero) are documented",
          "Verify IAM roles and RBAC permissions are least-privilege",
          "Conduct a well-architected review of the cluster setup",
          "Prepare a final architecture diagram of the entire platform",
          "Tear down expensive resources if running in a personal lab environment",
          "Reflect on the journey from manual EC2 provisioning to automated Kubernetes orchestration"
        ],
        "commands": [
          "terraform destroy -auto-approve  # If tearing down the lab"
        ],
        "gotcha": "Complexity is the enemy of reliability. While Istio, ArgoCD, and operators provide immense power, they also introduce significant operational overhead. Only introduce these tools when the organizational scale or technical requirements (e.g., strict mTLS compliance, multi-cluster management) demand them. For a simple CRUD app, standard Kubernetes is often sufficient.",
        "interviewAnswer": "An advanced Kubernetes platform is an integration of several specialized systems. We use EKS for compute, ArgoCD for declarative GitOps delivery, Istio for secure and observable networking, and Argo Rollouts for progressive deployment. This architecture minimizes manual toil, enforces security by default, and provides the necessary guardrails for developers to deploy rapidly and safely.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing the final architecture diagram and a summary of the capabilities implemented",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      }
    ]
  },
  {
    "id": "phase-10",
    "phase": 10,
    "title": "GitOps, FinOps & Final Capstone",
    "days": "Days 103–120",
    "icon": "🚀",
    "instanceType": "N/A",
    "estimatedCost": "$0",
    "weeklyProject": {
      "title": "The Production Readiness Review",
      "scenario": "You are the Lead DevOps Engineer. A development team is preparing to launch a new microservice. Conduct a comprehensive Production Readiness Review covering infrastructure, CI/CD, security, observability, and resilience. Build the final architecture presentation.",
      "successCriteria": [
        "Complete architecture diagram covering all 8 phases",
        "Production Readiness Checklist completed",
        "Disaster Recovery plan documented",
        "Cost estimation spreadsheet completed",
        "Mock interview questions answered successfully"
      ],
      "artifact": "Final Portfolio Repository with all documentation and architecture diagrams"
    },
    "incidentDrill": {
      "title": "SEV-1: The Final Boss — Multi-System Failure",
      "scenario": "A database migration failed, causing the application to crash (OOM), which triggered an alert storm, and the rollback deployment failed due to an expired AWS credential in CI. Diagnose and resolve this cascading failure across multiple systems.",
      "timeLimit": "45 minutes",
      "postMortemRequired": true
    },
    "dayTasks": [
      {
        "id": "p10-d103",
        "title": "Ansible Fundamentals & Inventory",
        "scenario": "You need to install updates, configure NTP, and create a deploy user on 50 EC2 instances. SSHing into each one is not an option. Learn Ansible to configure all 50 servers in parallel, idempotently, via SSH.",
        "tasks": [
          "Install Ansible and understand the control node vs managed node architecture",
          "Create a static inventory file (hosts.ini) grouping servers by role (web, db)",
          "Configure Ansible to connect using an SSH private key",
          "Run ad-hoc commands: ansible all -m ping to test connectivity",
          "Run a command on all servers: ansible web -m command -a \"uptime\"",
          "Use the setup module to gather facts about the managed nodes",
          "Understand idempotency: running the same module twice should result in \"changed: 0\"",
          "Configure ansible.cfg to disable host key checking (for dynamic cloud environments)"
        ],
        "commands": [
          "ansible all -i hosts.ini -m ping",
          "ansible web -i hosts.ini -m command -a \"df -h\"",
          "ansible db -i hosts.ini -m setup | grep ansible_distribution"
        ],
        "gotcha": "Ansible is agentless — it uses SSH. If your control node cannot SSH to the target (firewall, wrong key, SSH daemon down), Ansible cannot manage it. Always test connectivity with ansible all -m ping before running complex playbooks. The \"ping\" module does not use ICMP; it verifies SSH connectivity and Python availability.",
        "interviewAnswer": "Ansible is a configuration management tool that ensures servers are in a desired state. Its greatest strength is its agentless architecture — it requires only SSH and Python on the target nodes. I use Ansible for OS-level configuration (hardening, user management, patching) while using Terraform for the underlying infrastructure provisioning.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing your inventory file and the output of ansible all -m ping against at least 2 target nodes",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d104",
        "title": "Ansible Playbooks, Roles & Handlers",
        "scenario": "Write an Ansible playbook to configure an Nginx web server. It must install the package, copy a custom configuration file, start the service, and restart the service ONLY if the configuration file changes.",
        "tasks": [
          "Write a playbook (site.yml) with tasks using apt/yum, copy, and service modules",
          "Run the playbook: ansible-playbook -i hosts.ini site.yml",
          "Implement a Handler (notify) to restart Nginx only when the config file changes",
          "Verify idempotency: run the playbook again and ensure Nginx is NOT restarted",
          "Refactor the playbook into an Ansible Role (roles/nginx/tasks/main.yml)",
          "Use variables (defaults/main.yml) to make the role reusable across environments",
          "Use Jinja2 templates (templates/nginx.conf.j2) to dynamically generate config files based on node facts",
          "Use Ansible Vault to encrypt sensitive variables (passwords, API keys)"
        ],
        "commands": [
          "ansible-playbook -i hosts.ini site.yml",
          "ansible-galaxy init roles/nginx",
          "ansible-vault encrypt group_vars/all/vault.yml"
        ],
        "gotcha": "Using the command or shell modules breaks idempotency because Ansible has no way to know if running a bash script changes the system state. Always prefer native modules (apt, user, file, systemd) which check state before acting. If you MUST use shell, use the creates or removes arguments to tell Ansible when to skip the task.",
        "interviewAnswer": "Playbooks should be idempotent — safe to run repeatedly. Handlers are crucial for this: they execute only when a task reports a \"changed\" state, ensuring services are not restarted unnecessarily. I structure all Ansible code into Roles to keep it modular and reusable, and I use Ansible Vault to encrypt secrets directly in the repository.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL of your Ansible Role containing tasks, handlers, and a Jinja2 template",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d105",
        "title": "Dynamic Inventory & Terraform Integration",
        "scenario": "In AWS, EC2 instances are created and destroyed constantly by Auto Scaling Groups. A static hosts.ini file is useless because IP addresses change. Configure Ansible to use dynamic inventory, querying the AWS API to find current instances, and integrate Ansible into a Terraform workflow.",
        "tasks": [
          "Configure the aws_ec2 dynamic inventory plugin",
          "Group instances dynamically based on AWS tags (e.g., tag_Role_web)",
          "Verify dynamic inventory: ansible-inventory -i aws_ec2.yml --graph",
          "Use Terraform provisioner \"local-exec\" to trigger an Ansible playbook after instance creation",
          "Understand the drawbacks of Terraform provisioners and why Packer is preferred for immutable infrastructure",
          "Use SSM (Systems Manager) as the Ansible connection plugin instead of SSH for better security",
          "Write a playbook that patches all EC2 instances across an AWS account in rolling fashion",
          "Configure Ansible to wait for SSH to become available after instance boot"
        ],
        "commands": [
          "ansible-inventory -i aws_ec2.yml --graph",
          "ansible-playbook -i aws_ec2.yml patch_servers.yml"
        ],
        "gotcha": "Terraform local-exec provisioners that run Ansible are brittle. If the Ansible run fails, the Terraform apply completes successfully but the instance is in an unknown state. Terraform is not a configuration management tool. Prefer immutable infrastructure: use Packer and Ansible to build an AMI, then use Terraform to deploy that AMI.",
        "interviewAnswer": "Static inventories do not work in cloud environments. I use the aws_ec2 dynamic inventory plugin to group instances based on their AWS tags. For the larger pipeline, I advocate for immutable infrastructure: we use Ansible inside Packer to bake AMIs, and Terraform to deploy them. This removes the need to run Ansible against live production servers entirely.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist showing your aws_ec2.yml configuration and the output of the ansible-inventory --graph command showing dynamic groups",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d106",
        "title": "Immutable Infrastructure with Packer",
        "scenario": "Stop running Ansible against live production servers. Instead, use HashiCorp Packer to run your Ansible roles against a temporary EC2 instance to build a hardened \"Golden AMI\". Terraform will then deploy this pre-configured AMI, booting in seconds rather than minutes.",
        "tasks": [
          "Install Packer and write a packer.pkr.hcl template for an Amazon EBS builder",
          "Configure the ansible provisioner in Packer to apply your Nginx/hardening roles",
          "Run packer build to create the Golden AMI in your AWS account",
          "Verify the AMI is created and tagged correctly in the AWS console",
          "Update your Terraform code to use a data source (data \"aws_ami\") to find the newest Golden AMI",
          "Deploy the Golden AMI with Terraform — observe the faster boot time (no configuration required on boot)",
          "Integrate Packer into a GitHub Actions workflow to build AMIs weekly",
          "Understand the security benefits of immutable infrastructure (read-only filesystems, no SSH access required)"
        ],
        "commands": [
          "packer init .",
          "packer build ubuntu-nginx.pkr.hcl",
          "# Terraform data source:\ndata \"aws_ami\" \"golden\" {\n  most_recent = true\n  owners      = [\"self\"]\n  tags = { Name = \"nginx-golden-*\" }\n}"
        ],
        "gotcha": "Packer creates a temporary security group and key pair to SSH into the build instance. If the build fails, Packer usually cleans these up, but if the Packer process is killed abruptly, it leaves orphaned resources in your AWS account. Regularly audit your AWS account for orphaned \"packer_*\" security groups and key pairs.",
        "interviewAnswer": "Mutable infrastructure (running Ansible against live servers) leads to configuration drift — servers that have been running for a year are uniquely different from newly provisioned ones. Immutable infrastructure solves this. We bake the configuration into a Golden AMI using Packer and Ansible. When an update is needed, we do not patch the live server; we bake a new AMI and replace the server via a Terraform rolling update. This guarantees consistency and vastly speeds up auto-scaling.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL of your packer.pkr.hcl template and the Terraform code that consumes the generated AMI",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d107",
        "title": "Ansible Advanced — Dynamic Workflows & AWX/Tower",
        "scenario": "Running Ansible from a laptop is fine for 5 servers, but not for 500 across multiple teams. Install AWX (the open-source upstream for Ansible Automation Platform) to provide a web UI, RBAC, credentials management, and API access for your Ansible playbooks.",
        "tasks": [
          "Deploy AWX on your Kubernetes cluster (or Minikube) using the AWX Operator",
          "Configure an AWX Project linking to your Git repository containing the playbooks",
          "Configure AWX Credentials to securely store SSH keys and AWS access keys",
          "Create an AWX Inventory using the AWS EC2 dynamic inventory script",
          "Create a Job Template to run the patching playbook",
          "Configure RBAC: grant the \"Dev Team\" permission to run the playbook, but not edit it",
          "Trigger an AWX Job Template via its REST API (webhook from CI/CD)",
          "Understand the difference between Ansible CLI and enterprise automation platforms"
        ],
        "commands": [
          "kubectl apply -k github.com/ansible/awx-operator/config/default?ref=2.12.0",
          "curl -X POST -H \"Authorization: Bearer $TOKEN\" -H \"Content-Type: application/json\" https://awx.company.com/api/v2/job_templates/1/launch/"
        ],
        "gotcha": "AWX can be resource-intensive to run locally (requires PostgreSQL, Redis, and multiple pods). Ensure your cluster has at least 4GB of RAM available. Also, troubleshooting failed AWX jobs requires looking at the job execution logs in the UI, not just the pod logs.",
        "interviewAnswer": "Ansible CLI is a great tool, but AWX/Tower turns it into an enterprise platform. It provides a central execution environment, secure credential storage (so engineers don't need SSH keys on their laptops), RBAC, and full audit logging of who ran what playbook and when. It also exposes playbooks as an API, allowing us to trigger infrastructure configuration directly from our CI/CD pipelines or ITSM tools (like ServiceNow).",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of the AWX web UI showing a successful Job Template execution",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d108",
        "title": "Ansible Weekly Project — The Complete GitOps Workflow",
        "scenario": "Bring it all together. A developer needs a new S3 bucket and a change to the Nginx configuration. They should not have AWS or SSH access. Create the end-to-end GitOps workflow where they open a PR, the infrastructure and configuration are tested, and changes are applied automatically on merge.",
        "tasks": [
          "Create a single Git repository containing both Terraform (infrastructure) and Ansible (configuration)",
          "Write a GitHub Actions workflow that detects changes in the `terraform/` directory and runs TF plan/apply",
          "Write a workflow that detects changes in the `ansible/` directory and triggers the AWX API to run the playbook",
          "Enforce branch protection rules requiring passing tfsec and Infracost checks before merge",
          "Test the workflow: open a PR changing the S3 bucket name and the Nginx port",
          "Review the automated PR comments (plan output, cost impact)",
          "Merge the PR and verify the infrastructure and configuration are updated in AWS",
          "Document the entire workflow and the security boundaries it enforces"
        ],
        "commands": [
          "# Workflow path filtering snippet\non:\n  push:\n    paths:\n      - \"terraform/**\"\n      - \"ansible/**\""
        ],
        "gotcha": "When combining infrastructure provisioning (Terraform) and configuration management (Ansible) in CI, ordering is critical. If Terraform creates a new EC2 instance, you must wait for the instance to boot, pass status checks, and have SSH available BEFORE triggering the Ansible playbook. Use a sleep or a wait-for-ssh task in Ansible to handle the timing gap.",
        "interviewAnswer": "The pinnacle of infrastructure management is a complete GitOps workflow. The Git repository is the sole source of truth. Developers request changes via Pull Requests. CI pipelines provide automated feedback on security (tfsec) and cost (Infracost). Upon merge, CD pipelines orchestrate the change: Terraform provisions the resources, and then Ansible (via AWX) configures them. No human touches production directly; everything is versioned, peer-reviewed, and auditable.",
        "artifactContract": {
          "type": "github-actions-run",
          "instruction": "GitHub Actions run URL showing the combined Terraform and Ansible execution workflow",
          "exampleFormat": "https://github.com/user/repo/actions/runs/123456789",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d109",
        "title": "Ansible Capstone Review & Optimisation",
        "scenario": "Review the entire Ansible deployment. Identify areas for optimisation in performance, security, and cost. Optimise the Ansible playbooks for faster execution.",
        "tasks": [
          "Optimise Ansible playbooks: use `async` and `poll` for long-running tasks",
          "Optimise Ansible execution: enable pipelining in ansible.cfg to reduce SSH overhead",
          "Review AWS security groups: ensure absolute minimum required ports are open",
          "Implement a Terraform data source to dynamically fetch the latest secure AMI",
          "Write comprehensive documentation (README.md) for the repository",
          "Prepare a presentation summarizing the architecture, security posture, and workflow",
          "Clean up all AWS resources to avoid unnecessary charges (terraform destroy)"
        ],
        "commands": [
          "# ansible.cfg snippet\n[ssh_connection]\npipelining = True",
          "terraform destroy -auto-approve"
        ],
        "gotcha": "Enabling pipelining in Ansible significantly speeds up execution, but it requires `requiretty` to be disabled in `/etc/sudoers` on the managed nodes. If a playbook fails with a sudo error after enabling pipelining, check the sudoers configuration.",
        "interviewAnswer": "Continuous improvement is part of IaC. I regularly review Terraform code to remove hardcoding, tighten security groups, and implement data sources for dynamic lookups (like latest AMIs). For Ansible, enabling pipelining and using async tasks for slow operations (like package updates) can reduce playbook execution time by 50%, speeding up the entire deployment pipeline.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL showing the optimised Terraform and Ansible configurations and comprehensive documentation",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d110",
        "title": "Ansible Incident Drill — Compromised Bastion Host",
        "scenario": "Security alerts indicate suspicious outbound traffic originating from your Bastion host. You must assume the host is compromised. You need to isolate it, preserve logs for forensics, and provision a new, secure replacement using your IaC pipeline.",
        "tasks": [
          "Isolate the compromised instance: modify its security group via AWS Console (or CLI) to block ALL outbound and inbound traffic (except your forensic IP)",
          "DO NOT terminate the instance yet; preserve it for forensics",
          "Identify the root cause in the Ansible hardening playbook (e.g., weak SSH config or missing fail2ban)",
          "Update the Ansible playbook to fix the vulnerability and commit to Git",
          "Update Terraform to create a new Bastion instance (change the name/ID) and run terraform apply",
          "Verify the new Bastion is secure and operational",
          "Terminate the compromised instance via Terraform (remove it from state, then delete in AWS)",
          "Write a postmortem detailing the breach, response, and remediation"
        ],
        "commands": [
          "aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --groups sg-isolated",
          "terraform state rm aws_instance.bastion  # Remove compromised from state",
          "aws ec2 terminate-instances --instance-ids i-1234567890abcdef0"
        ],
        "gotcha": "If you just run `terraform destroy` on the compromised instance, you destroy all forensic evidence (logs, memory state). You must isolate it at the network level first. Furthermore, if you just update the code and run `terraform apply`, it might destroy and recreate the instance in place, again losing evidence. Remove the instance from Terraform state first (`terraform state rm`), then provision a new one.",
        "interviewAnswer": "Incident response for compromised infrastructure in an IaC environment: Isolate, Preserve, Remediate via Code, Provision New, Terminate Old. I isolate the instance using AWS Security Groups to stop data exfiltration while preserving the disk/memory for forensics. I fix the root cause in Terraform/Ansible, deploy a fresh instance via the CI pipeline, and only then terminate the isolated instance. IaC allows us to rebuild clean infrastructure in minutes rather than spending hours trying to clean a compromised server.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your incident response timeline, commands used for isolation, and the postmortem",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d111",
        "title": "GitOps Principles & ArgoCD Setup",
        "scenario": "Stop running kubectl apply in CI pipelines. It requires giving CI tools cluster admin credentials and suffers from configuration drift. Implement GitOps using ArgoCD: the cluster pulls configuration from Git and continuously reconciles it.",
        "tasks": [
          "Understand the pull-based GitOps model vs the push-based CI/CD model",
          "Install ArgoCD in your cluster using the official manifests",
          "Access the ArgoCD UI and configure a connection to your Git repository",
          "Create an ArgoCD Application resource pointing to your Helm chart or manifests in Git",
          "Observe ArgoCD deploy the application and mark it as \"Healthy\" and \"Synced\"",
          "Simulate configuration drift: manually delete a pod or edit a deployment via kubectl",
          "Observe ArgoCD detect the \"OutOfSync\" state and automatically heal the cluster",
          "Configure ArgoCD auto-sync policies and prune behavior"
        ],
        "commands": [
          "kubectl create namespace argocd",
          "kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml",
          "kubectl port-forward svc/argocd-server -n argocd 8080:443",
          "argocd app create myapp --repo https://github.com/my/repo.git --path chart --dest-server https://kubernetes.default.svc --dest-namespace default"
        ],
        "gotcha": "ArgoCD considers resources OutOfSync if the cluster state differs from Git. If you have tools like HPA (Horizontal Pod Autoscaler) or other operators modifying resources in the cluster (e.g., changing the replica count), ArgoCD will fight them, constantly reverting the replica count back to what is in Git. Configure ArgoCD to ignore differences for specific fields (like spec.replicas) when using HPA.",
        "interviewAnswer": "GitOps with ArgoCD flips the deployment model. Instead of CI pushing to Kubernetes (which requires exposing cluster credentials), ArgoCD runs inside the cluster and pulls desired state from Git. Git becomes the absolute source of truth. If anyone makes manual changes in the cluster, ArgoCD detects the drift and immediately reconciles it back to the Git state, eliminating configuration drift and simplifying disaster recovery.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of the ArgoCD UI showing your application as Synced and Healthy",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d112",
        "title": "ArgoCD Applications, App-of-Apps & Sync Policy",
        "scenario": "You need to deploy the same application to 5 different environments (dev, staging, prod-us, prod-eu, prod-asia). Creating 5 ArgoCD Applications manually is tedious. Use ApplicationSets (or App-of-Apps) to automate application deployment across multiple clusters and environments.",
        "tasks": [
          "Understand the ArgoCD ApplicationSet controller or App-of-Apps pattern",
          "Create a parent application that points to a folder of other ArgoCD Application definitions",
          "Use template fields ({{cluster}}, {{namespace}}) to dynamically configure the deployments",
          "Configure a Sync Window to restrict deployments to specific maintenance hours",
          "Implement a progressive sync strategy for safer multi-cluster rollouts",
          "Manage ArgoCD RBAC: grant developers read-only access to their applications",
          "Use ArgoCD Image Updater to automatically deploy new image tags without committing to Git (optional/advanced)"
        ],
        "commands": [
          "# applicationset.yaml snippet\napiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nmetadata:\n  name: myapp-deployments\nspec:\n  generators:\n  - list:\n      elements:\n      - cluster: in-cluster\n        namespace: dev\n      - cluster: in-cluster\n        namespace: staging"
        ],
        "gotcha": "ApplicationSets are powerful but can be destructive. If you accidentally misconfigure a generator or template and it evaluates to replacing or deleting existing applications, ArgoCD will ruthlessly execute that change across all targeted clusters simultaneously. Always test ApplicationSets in a dry-run or dev environment first, and use the `preserveResourcesOnDeletion` flag while learning.",
        "interviewAnswer": "Managing multi-environment, multi-cluster deployments manually doesn't scale. The App-of-Apps pattern or ArgoCD ApplicationSets act as a \"factory\" for Applications. I fan out a single application to dev, staging, and production clusters with environment-specific values. This provides a single pane of glass for fleet-wide management.",
        "artifactContract": {
          "type": "github-commit",
          "instruction": "Commit URL showing your App-of-Apps or ApplicationSet YAML configuration",
          "exampleFormat": "https://github.com/user/repo/commit/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d113",
        "title": "Incident Response & Postmortem Culture",
        "scenario": "Review the incident management process. A healthy DevOps culture relies on blameless postmortems to improve the system. Formalise the incident response lifecycle and the postmortem template.",
        "tasks": [
          "Define the roles in an incident: Incident Commander, Operations Lead, Communications Lead",
          "Draft a standard Incident Response procedure (Acknowledge, Triage, Mitigate, Resolve)",
          "Create a Blameless Postmortem template (Timeline, Root Cause, Impact, Action Items)",
          "Practice the \"5 Whys\" technique on a historical outage",
          "Understand why \"human error\" is never the root cause (it's a systemic failure)",
          "Define severity levels (SEV-1, SEV-2, SEV-3) and SLA expectations for each",
          "Set up a process for tracking postmortem action items to completion"
        ],
        "commands": [],
        "gotcha": "If a postmortem concludes with \"Engineer X made a mistake; action item: be more careful,\" the process has failed. The question is not WHO made the mistake, but WHY the system allowed the mistake to happen or reach production. Fix the guardrails (CI checks, IAM permissions, automation), don't blame the human.",
        "interviewAnswer": "Incident response is structured to minimize MTTR (Mean Time To Resolution). I designate an Incident Commander to coordinate, allowing engineers to focus on mitigation. Post-incident, we hold blameless postmortems. We assume good intent and look for systemic flaws. If someone ran a bad command, the action item isn't \"don't run that command\"; it's \"automate the process so the command isn't needed\" or \"remove permissions so it can't be run in production.\"",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your Blameless Postmortem template and the 5 Whys analysis of a past scenario",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d114",
        "title": "Disaster Recovery, RTO, and RPO",
        "scenario": "Business stakeholders need to know what happens if the AWS region goes down or if ransomware deletes the databases. Define the Disaster Recovery strategy, calculate Recovery Time Objective (RTO) and Recovery Point Objective (RPO).",
        "tasks": [
          "Define RTO (how long the system can be down) and RPO (how much data can be lost)",
          "Document the backup strategy for stateful data (RDS automated backups, Velero for K8s)",
          "Document the recovery procedure for stateless infrastructure (Terraform apply in new region)",
          "Identify single points of failure in the current architecture",
          "Plan a tabletop DR exercise to test the procedures",
          "Write a runbook for full cluster recreation in a secondary region",
          "Understand the cost implications of Active-Active vs Active-Passive vs Cold Standby DR architectures"
        ],
        "commands": [],
        "gotcha": "Backups are useless if you haven't tested the restore process. Many companies find out during an outage that their backups are corrupted, inaccessible, or take 48 hours to restore (violating the RTO). DR is not about taking backups; it's about proving you can restore them within the required timeframe.",
        "interviewAnswer": "Disaster Recovery is driven by business requirements: RTO and RPO. Since our infrastructure is 100% codified (Terraform) and applications are GitOps managed (ArgoCD), our RTO for stateless workloads is the time it takes to run the CI/CD pipelines in a new region (usually < 1 hour). For stateful data, we rely on AWS RDS cross-region replication and Velero backups to meet RPO targets. Regular tabletop exercises ensure the team actually knows how to execute the recovery.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your DR Plan, including RTO/RPO definitions and the high-level recovery steps",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d115",
        "title": "FinOps Deep Dive & Cost Optimization",
        "scenario": "The CFO wants a cost breakdown of the production environment. You need to estimate the monthly AWS bill, identify the primary cost drivers, and propose optimization strategies.",
        "tasks": [
          "Use the AWS Pricing Calculator to estimate the cost of the VPC, EKS, RDS, and NAT Gateways",
          "Calculate the cost of data transfer (often a hidden surprise in AWS bills)",
          "Identify the top 3 most expensive resources in the architecture",
          "Propose optimizations: Graviton instances, Spot instances, Savings Plans / Reserved Instances",
          "Document how auto-scaling (HPA/Cluster Autoscaler) impacts the cost model",
          "Create a simple FinOps dashboard layout (what metrics the business cares about)",
          "Understand the concept of Unit Economics (e.g., cost per transaction or cost per user)"
        ],
        "commands": [],
        "gotcha": "NAT Gateways and cross-AZ data transfer are notorious for causing unexpected bill spikes. Every GB that passes through a NAT Gateway costs money. Ensure internal traffic stays on private IPs and use VPC Endpoints (PrivateLink) for AWS services like S3 and ECR to avoid NAT Gateway data processing charges.",
        "interviewAnswer": "Cloud cost is an engineering responsibility. The largest cost drivers in our architecture are typically compute (EKS nodes/RDS) and network (NAT Gateways/Data Transfer). I optimize compute by using Spot instances for stateless worker nodes and Graviton processors. For predictable workloads, we purchase Compute Savings Plans. I monitor unit economics to ensure that as our user base scales, our infrastructure cost scales sub-linearly.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing your monthly cost estimate breakdown and three specific optimization proposals",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d116",
        "title": "FinOps — Tagging and Automation",
        "scenario": "Your AWS bill has doubled in the last 3 months. You need to implement FinOps practices to track, attribute, and optimise cloud costs across your Terraform-managed infrastructure without impacting performance.",
        "tasks": [
          "Implement a mandatory tagging strategy in Terraform (Environment, Team, CostCenter, Owner)",
          "Use the Terraform aws_default_tags provider configuration to enforce tags globally",
          "Integrate Infracost into your GitHub Actions workflow to see cost estimates on PRs",
          "Analyse the cost difference between On-Demand and Spot instances for worker nodes",
          "Configure a Terraform module to use an EC2 Spot Fleet or EKS managed spot node group",
          "Identify unattached EBS volumes and orphaned Elastic IPs in AWS using a bash script",
          "Configure AWS Budgets via Terraform to alert when monthly spend exceeds $50",
          "Write an architecture proposal for reducing the environment cost by 30%"
        ],
        "commands": [
          "infracost breakdown --path .",
          "infracost diff --path . --compare-to pre-commit-plan.json",
          "# Global tags in Terraform:\nprovider \"aws\" {\n  default_tags {\n    tags = { Environment = \"Production\", ManagedBy = \"Terraform\" }\n  }\n}"
        ],
        "gotcha": "Tags applied via aws_default_tags only apply to resources created by THAT provider block. Resources created by modules that instantiate their own providers, or resources where the tag key conflicts with a specific tag on the resource, may behave unexpectedly. Always verify tag coverage using AWS Cost Explorer or Tag Editor.",
        "interviewAnswer": "Cost is a first-class engineering metric. I implement FinOps by shifting cost awareness left: Infracost runs on every PR, showing the developer exactly how much their change will impact the monthly bill before it is merged. I use global default tags in Terraform so every resource is attributable to a team. For stateless workloads, moving from On-Demand to Spot instances via Auto Scaling Groups typically reduces compute costs by 60-70%.",
        "artifactContract": {
          "type": "screenshot-url",
          "instruction": "Screenshot of a GitHub PR comment from Infracost showing the cost impact of a change",
          "exampleFormat": "https://imgur.com/abc",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d117",
        "title": "Phase 10 Project & Portfolio Finalization",
        "scenario": "Compile all your projects, architecture diagrams, and documentation into a professional portfolio repository on GitHub. This repository will serve as your resume for potential employers.",
        "tasks": [
          "Create a well-structured GitHub repository summarizing the 120-day journey",
          "Write a comprehensive README.md with architecture diagrams and tech stack details",
          "Organize code snippets, Terraform modules, and Kubernetes manifests into logical folders",
          "Include links to the artifacts created in previous phases (Grafana dashboards, CI runs)",
          "Ensure all sensitive information (passwords, AWS account IDs) is scrubbed",
          "Publish the repository and add it to your LinkedIn profile and resume",
          "Review the repository from the perspective of a hiring manager: is it clean, professional, and well-documented?"
        ],
        "commands": [],
        "gotcha": "A repository full of code but lacking a good README is useless to a recruiter. The README is your storefront. It must explain WHAT the project is, WHY you built it, HOW to run it, and WHAT you learned. Use visuals (diagrams) heavily.",
        "interviewAnswer": "My portfolio repository demonstrates a complete, production-ready cloud-native architecture. It showcases not just the code, but the operational practices: infrastructure as code with Terraform, CI/CD with GitHub Actions, orchestration with Kubernetes, and observability with Prometheus/Grafana. It proves I can build and operate complex systems end-to-end.",
        "artifactContract": {
          "type": "github-repo",
          "instruction": "URL to your final public GitHub Portfolio repository",
          "exampleFormat": "https://github.com/user/devops-portfolio",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d118",
        "title": "Phase 10 Incident Drill & Graduation",
        "scenario": "The Final Boss Drill. A cascading failure hits the production environment. You have 45 minutes to diagnose and resolve a multi-layered incident involving database connection issues, pod evictions, and a blocked CI pipeline. Prove you are ready.",
        "tasks": [
          "Acknowledge the simulated alerts",
          "Diagnose the initial failure using Grafana and Splunk (e.g., database connection pool exhaustion)",
          "Identify secondary failures (e.g., pods restarting rapidly, causing node CPU spikes and evictions)",
          "Identify CI/CD blockage (e.g., Terraform state locked or credentials expired during attempted rollback)",
          "Execute mitigation steps in the correct order (unlock state, rollback deployment, scale database)",
          "Restore service to healthy metrics",
          "Write a comprehensive final postmortem",
          "Celebrate the completion of the 120-Day DevOps Journey!"
        ],
        "commands": [],
        "gotcha": "In a cascading failure, panic leads to mistakes. Don't try to fix everything at once. Prioritize: 1. Stop the bleeding (e.g., rate limit traffic or rollback). 2. Stabilize the infrastructure. 3. Fix the root cause. Methodical troubleshooting is more important than speed if speed causes further damage.",
        "interviewAnswer": "Handling a multi-system failure requires a cool head and a solid grasp of the entire architecture. I follow the signals: alerts point to the symptom, dashboards show the blast radius, and traces/logs reveal the root cause. I mitigate first (rollback) to restore service, then investigate deeply. This 120-day journey has equipped me with both the technical skills to manage these systems and the operational maturity to respond to incidents effectively.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist containing the final postmortem of the cascading failure drill",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d119",
        "title": "Interview Prep: CI/CD, Git, & Infrastructure as Code",
        "scenario": "Prepare for questions on software delivery and automation. Focus on Terraform, Ansible, Jenkins, GitHub Actions, and Git workflows.",
        "tasks": [
          "Review Git branching strategies, merge vs rebase, and resolving conflicts",
          "Review Terraform state management, modules, and locking",
          "Review Ansible idempotency, inventory management, and roles",
          "Practice explaining the difference between mutable and immutable infrastructure",
          "Review CI/CD pipeline design, quality gates, and artifact management",
          "Practice explaining a complex deployment strategy (Blue/Green or Canary)",
          "Prepare a story about a time you improved a slow or flaky CI pipeline"
        ],
        "commands": [],
        "gotcha": "Interviewers will test your understanding of Terraform state. If asked \"What happens if two people run terraform apply at the same time?\", the answer must involve remote state locking (DynamoDB). Understanding how tools fail and how to use them safely in a team environment is more important than knowing every CLI flag.",
        "interviewAnswer": "I advocate for immutable infrastructure using Terraform. Terraform manages the state of the cloud resources, allowing us to review infrastructure changes in Pull Requests before applying them. For configuration, we use Ansible to bake Golden AMIs, avoiding configuration drift on live servers. This approach, combined with a robust CI/CD pipeline, ensures predictable and repeatable deployments.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist with written answers to 3 common CI/CD and IaC interview questions using the STAR method",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      },
      {
        "id": "p10-d120",
        "title": "Interview Prep: Kubernetes, Docker, & Cloud",
        "scenario": "Prepare for questions on container orchestration and cloud architecture. Focus on Docker fundamentals, Kubernetes primitives, and AWS services.",
        "tasks": [
          "Review Docker architecture (daemon, containerd, namespaces, cgroups)",
          "Review Kubernetes core objects (Pods, Deployments, Services, Ingress)",
          "Review Kubernetes networking (CNI, CoreDNS, Service discovery)",
          "Review Kubernetes resource management (Requests, Limits, HPA)",
          "Review core AWS services (VPC, IAM, EC2, S3, RDS, EKS)",
          "Practice explaining the Kubernetes reconciliation loop",
          "Prepare a story about a complex Kubernetes troubleshooting scenario (e.g., CrashLoopBackOff or network policy issue)"
        ],
        "commands": [],
        "gotcha": "Don't confuse a Pod with a Container. A Pod is the smallest deployable unit in K8s and can contain multiple containers (like sidecars). When discussing troubleshooting, emphasize looking at `kubectl describe pod` for events and `kubectl logs -p` for previous container crashes. Knowing the debugging workflow is crucial.",
        "interviewAnswer": "Kubernetes operates on a declarative model. We define the desired state (e.g., 3 replicas of a Deployment), and the control plane controllers continuously monitor the cluster, taking action to reconcile the actual state with the desired state. This self-healing capability, combined with abstractions like Services for stable networking, is why it's the standard for container orchestration. In AWS, I integrate EKS with IAM roles for service accounts (IRSA) to maintain least privilege.",
        "artifactContract": {
          "type": "gist-url",
          "instruction": "Gist with written answers to 3 common Kubernetes/Cloud interview questions using the STAR method",
          "exampleFormat": "https://gist.github.com/user/abc123",
          "blocksCompletion": true
        }
      }
    ]
  }
];
