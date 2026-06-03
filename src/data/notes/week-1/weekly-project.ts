import { BootcampDay } from '../types';

export const weeklyProject: BootcampDay = {
  day: 7.1,
  title: "WEEK 1 WEEKLY PROJECT",
  subtitle: "Hardened Self-Healing Deployment with S3 Config Sync & Local Monitoring",
  color: "#e040fb",
  trainerNote: "This project brings together Linux, Git, AWS CLI, S3, IAM, VPC, and Bash scripting. It specifically implements fixes for the common mistakes you encountered this week. No GUI console, no hardcoded keys.",
  engineerNote: "In production, scripting is about error handling and resilience. This project forces you to use 'set -euo pipefail', handle cron environment variables, and enforce least-privilege IAM roles instead of hardcoded keys.",
  goal: {
    icon: "🏆",
    title: "Week 1 Capstone Challenge",
    description: "Design and implement a fully automated, self-healing web deployment script. It must retrieve configurations from a secured S3 bucket via an IAM role (no access keys on server), deploy a custom Nginx webpage, configure a cron job to monitor system health and automatically restart Nginx if it fails, and log alerts back to S3."
  },
  schedule: [
    {
      time: "09:00 – 10:00",
      phase: "PLAN",
      activity: "Draw architecture and list dependencies",
      why: "Draw the system: VPC box → subnets → EC2 → IAM role arrows → S3 bucket. List all potential fail points (security groups, routes, IAM policies)."
    },
    {
      time: "10:00 – 12:00",
      phase: "INFRA",
      activity: "CLI Network & IAM Provisioning",
      why: "Create custom VPC, subnets, IGW, route tables, S3 configuration bucket, and least-privilege IAM role entirely from the AWS CLI."
    },
    {
      time: "12:00 – 13:00",
      phase: "BREAK",
      activity: "Lunch & physical break",
      why: "Rest before scripting."
    },
    {
      time: "13:00 – 15:30",
      phase: "SCRIPT",
      activity: "Write deploy_hardened.sh & monitor_server.sh",
      why: "Write shebang scripts using set -euo pipefail. Handle IMDSv2 token queries, config fetching, health checks, self-healing services, and cron automation."
    },
    {
      time: "15:30 – 16:30",
      phase: "VALIDATE",
      activity: "Run failure injection tests",
      why: "Deliberately stop Nginx, delete the IGW route, or modify S3 permissions to ensure the monitoring catches the alerts and recovers when possible."
    },
    {
      time: "16:30 – 17:00",
      phase: "DOCUMENT",
      activity: "Write README & push to GitHub",
      why: "Document the project with an ASCII architecture diagram, commit with clean git messages, and clean up AWS resources."
    }
  ],
  concepts: [
    {
      icon: "🏗️",
      title: "Hardened Scripting",
      description: "Scripts in production must be idempotent and fail fast. Using set -euo pipefail makes sure any failure exits the script immediately, preventing cascade errors.",
      analogy: "A fuse box in your house. If there is a short circuit, the fuse blows immediately to prevent a fire."
    },
    {
      icon: "🩺",
      title: "Self-Healing Architecture",
      description: "Instead of waiting for an alert, the local health check script audits the Nginx process. If it detects a crash, it initiates a service recovery automatically.",
      analogy: "A backup generator that switches on automatically the instant a power outage is detected."
    },
    {
      icon: "🔒",
      title: "Least Privilege & IAM Roles",
      description: "Never store credentials on a server. An EC2 instance assumes a temporary IAM role with a policy restricted only to a single configuration bucket.",
      analogy: "A single-purpose digital keycard that only opens the storage closet, instead of the master key."
    },
    {
      icon: "♻️",
      title: "Idempotent Cron & Scripts",
      description: "Every setup operation (creating directories, configuring cron) must be safe to run multiple times without causing duplicate configurations.",
      analogy: "Pressing the 'elevator call' button multiple times doesn't launch multiple elevators; it just registers the single request."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 1,
      sessionTitle: "Weekly Project Scripting & Setup Guide",
      sections: [
        {
          label: "Idempotent Crontab Configuration",
          lines: [
            { type: 'comment', text: "Avoid duplicates. Remove old entry first, then append fresh to crontab:" },
            { type: 'cmd', prompt: "$", text: "crontab -l 2>/dev/null | grep -v \"monitor_server.sh\" | { cat; echo \"*/5 * * * * /home/ubuntu/scripts/monitor_server.sh >> /home/ubuntu/logs/health.log 2>&1\"; } | crontab -" }
          ]
        },
        {
          label: "Checking active user identity & AWS CLI profile",
          lines: [
            { type: 'cmd', prompt: "$", text: "aws configure --profile learning" },
            { type: 'cmd', prompt: "$", text: "export AWS_PROFILE=learning" },
            { type: 'cmd', prompt: "$", text: "aws sts get-caller-identity" },
            { type: 'output', text: "{\n    \"UserId\": \"AROA...\",\n    \"Account\": \"123456789012\",\n    \"Arn\": \"arn:aws:iam::123456789012:user/devops-learner\"\n}" }
          ]
        },
        {
          label: "Querying EC2 Metadata with IMDSv2 Token",
          lines: [
            { type: 'comment', text: "Acquire token first (token-based metadata safety):" },
            { type: 'cmd', prompt: "$", text: "TOKEN=$(curl -s -X PUT \"http://169.254.169.254/latest/api/token\" -H \"X-aws-ec2-metadata-token-ttl-seconds: 21600\")" },
            { type: 'cmd', prompt: "$", text: "INSTANCE_ID=$(curl -s -H \"X-aws-ec2-metadata-token: $TOKEN\" http://169.254.169.254/latest/meta-data/instance-id)" },
            { type: 'cmd', prompt: "$", text: "echo \"Active Instance: $INSTANCE_ID\"" }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "Troubleshooting EC2 Public Reachability",
      steps: [
        {
          num: 1,
          title: "Verify Security Group permits Port 80",
          cmd: "aws ec2 describe-security-groups --filters Name=group-name,Values=devops-web-sg"
        },
        {
          num: 2,
          title: "Verify Internet Gateway (IGW) Route exists in public Route Table",
          cmd: "aws ec2 describe-route-tables --route-table-ids rtb-xxxx"
        },
        {
          num: 3,
          title: "Ensure instance is deployed in a public subnet",
          description: "Verify that the subnet is associated with a route table directing 0.0.0.0/0 to the IGW."
        }
      ]
    },
    {
      title: "Troubleshooting Cron Script Failures",
      steps: [
        {
          num: 1,
          title: "Check minimal PATH variables inside Cron execution environment",
          description: "Cron executes with a default PATH (/usr/bin:/bin). If your script calls /usr/local/bin/aws, it will fail."
        },
        {
          num: 2,
          title: "Define explicit PATH at the top of the script",
          cmd: "export PATH=\"$PATH:/usr/local/bin\""
        },
        {
          num: 3,
          title: "Verify Cron triggers in system syslog",
          cmd: "sudo grep -i cron /var/log/syslog"
        }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Hardcoding AWS Access Key credentials on the server",
      description: "Putting static keys in ~/.aws/credentials exposes them if the instance is compromised. Bots continuously scrape public Git repos.",
      fix: "Fix: Delete static credentials and configure an IAM instance profile (role) with GetObject S3 policy."
    },
    {
      mistake: "Not defining the PATH variable in scripts scheduled via Cron",
      description: "Scripts running fine manually will fail silently in cron due to 'command not found' errors.",
      fix: "Fix: Add export PATH=\"/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\" at the start of your script."
    },
    {
      mistake: "Running non-idempotent scripts that duplicate configuration lines",
      description: "If your deployment script appends a cron line every time it runs, your crontab will grow endlessly with identical lines.",
      fix: "Fix: Filter out any existing scripts from crontab using grep -v before adding the new schedule line."
    }
  ],
  project: {
    tag: "★ Week 1 Project",
    title: "Hardened self-healing deployment",
    timeEstimate: "⏱ ~4 hours",
    goal: "Deploy a resilient, self-healing system consisting of a custom VPC, S3 configuration management, EC2 instances assuming IAM Roles (least-privilege), and automated Cron monitors that verify and auto-restart Nginx if it fails, logging results to S3.",
    checklist: [
      "Create custom VPC (10.0.0.0/16) with a public subnet (10.0.1.0/24), IGW, and Route Table",
      "Create an S3 bucket and upload a config file: app.conf (contains SITE_TITLE=\"Hardened Server\")",
      "Create a least-privilege IAM Policy & Role allowing ONLY GetObject on that S3 bucket",
      "Launch EC2 instance in your public subnet and attach the IAM Instance Profile",
      "Write a deploy_hardened.sh script that pulls app.conf from S3, installs Nginx, and deploys index.html",
      "Write a monitor_server.sh script that checks disk space, audits active users, restarts Nginx if it crashes, and uploads failure logs to S3",
      "Setup cron to trigger monitor_server.sh every 5 minutes",
      "Commit all scripts to GitHub with a descriptive .gitignore (ignoring *.pem, *.log, .env)",
      "Terminate instances and clean up all AWS resources once verified"
    ],
    codeBlock: {
      title: "monitor_server.sh — Self-Healing Health Script",
      lines: [
        "#!/bin/bash",
        "set -euo pipefail",
        "",
        "# 1. Define explicit PATH for cron reliability",
        "export PATH=\"/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\"",
        "",
        "LOG_FILE=\"/home/ubuntu/logs/health.log\"",
        "S3_BUCKET=\"devops-config-YOURNAME\"",
        "",
        "mkdir -p \"$(dirname $LOG_FILE)\"",
        "echo \"[$(date '+%Y-%m-%d %H:%M:%S')] Starting health check...\" >> \"$LOG_FILE\"",
        "",
        "# 2. Check Nginx Process",
        "if ! pgrep nginx > /dev/null; then",
        "  echo \"  [ALERT] Nginx process stopped. Attempting auto-restart...\" >> \"$LOG_FILE\"",
        "  sudo systemctl restart nginx || echo \"  [FATAL] Failed to restart nginx!\" >> \"$LOG_FILE\"",
        "  ",
        "  # Upload alert logs to S3 config bucket",
        "  aws s3 cp \"$LOG_FILE\" \"s3://$S3_BUCKET/logs/health-alert-$(date +%Y%m%d-%H%M%S).log\"",
        "else",
        "  echo \"  [OK] Nginx is running normally\" >> \"$LOG_FILE\"",
        "fi",
        "",
        "# 3. Check Disk space",
        "DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')",
        "if [ \"$DISK_USAGE\" -gt 85 ]; then",
        "  echo \"  [ALERT] Disk space critical: $DISK_USAGE%\" >> \"$LOG_FILE\"",
        "fi"
      ]
    },
    expectedOutput: "✓ Nginx process automatically recovers if stopped manually\n✓ Alerts are successfully uploaded to S3 logs/ prefix\n✓ Crontab lists exactly one instance of monitor_server.sh schedule\n✓ GitHub repository is created with .gitignore blocking PEM files"
  },
  interview: [
    {
      question: "Walk me through how you'd use git in a team environment.",
      answer: "My workflow starts with pulling the latest main: git pull. Then I create a feature branch named after the work: git checkout -b feature/nginx-config-update. I do the work in small focused commits. If I need to switch context mid-task I stash unfinished work with git stash. When the feature is done, I push the branch to GitHub and open a Pull Request — a PR gives teammates a chance to review the code before it hits main. After the PR is approved and merged, I delete the branch both locally and on the remote. I never commit directly to main — main should always be in a deployable state."
    },
    {
      question: "What is the difference between git revert and git reset?",
      answer: "Both undo changes but in fundamentally different ways. git revert creates a new commit that reverses the changes from a previous commit — the original commit stays in history. It's safe to use on any branch including shared ones because it doesn't rewrite history. git reset moves the HEAD pointer backwards — it can remove commits from history entirely. reset --hard also discards working directory changes. Reset is useful for cleaning up local commits before a first push, but you should never use it on a branch that teammates have already pulled from because it creates divergent histories that require a force push. My rule: revert on anything that's been pushed, reset only on strictly local work."
    },
    {
      question: "How do you diagnose a service that's failing to start — walk me through your process.",
      answer: "First step is always to check the service status: sudo systemctl status servicename — this shows the last few log lines and the exit code. If the status isn't enough detail, I go to the journal: journalctl -u servicename -n 50 gives me the last 50 log entries for that unit. If it's a port conflict — another process already using port 80 for example — I check with sudo ss -tlnp or lsof -i :80 to see what process has the port. For nginx specifically I also run sudo nginx -t to test config syntax before attempting a restart. I work top-down: service status → logs → config → resources — rather than restarting blindly and hoping."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "You need to check nginx logs but journalctl -u nginx shows nothing. Where else do you look?",
      options: [
        { text: "A) /tmp/nginx/", isCorrect: false },
        { text: "B) /var/log/nginx/error.log and /var/log/nginx/access.log", isCorrect: true },
        { text: "C) ~/.nginx/logs/", isCorrect: false },
        { text: "D) /etc/nginx/logs/", isCorrect: false }
      ],
      explanation: "nginx writes its own logs to /var/log/nginx/ in addition to (or instead of) journald, depending on configuration. If journalctl is empty, the nginx-specific log files are the next place to check."
    },
    {
      num: 2,
      question: "What does this command do: cat /var/log/auth.log | awk '{print $1,$2}' | sort | uniq -c | sort -rn | head -5",
      options: [
        { text: "A) Deletes the 5 oldest auth log entries", isCorrect: false },
        { text: "B) Shows the 5 most frequent date-time combinations in the auth log — a basic log frequency analysis", isCorrect: true },
        { text: "C) Copies the auth log to a new file", isCorrect: false },
        { text: "D) Counts total lines in the auth log", isCorrect: false }
      ],
      explanation: "This pipeline: extracts columns 1+2 (date and time), sorts them alphabetically, counts consecutive duplicates with uniq -c, sorts numerically in reverse, and shows top 5. The result shows which minute had the most auth log activity — useful for spotting brute-force attack patterns."
    },
    {
      num: 3,
      question: "Your .bashrc has alias gs='git status' but the alias stops working when you run a shell script that calls gs. Why?",
      options: [
        { text: "A) Shell scripts don't support aliases", isCorrect: false },
        { text: "B) Aliases are only available in interactive shells by default — not in non-interactive script subshells", isCorrect: true },
        { text: "C) The alias syntax is wrong", isCorrect: false },
        { text: "D) You need to restart the EC2", isCorrect: false }
      ],
      explanation: "Bash only expands aliases in interactive shells by default. A script runs in a non-interactive subshell where .bashrc aliases are not loaded."
    },
    {
      num: 4,
      question: "You want to securely copy a log file from your EC2 to your laptop. Which command?",
      options: [
        { text: "A) aws s3 cp only works for this", isCorrect: false },
        { text: "B) scp -i key.pem ubuntu@EC2_IP:~/logs/health.log ~/Downloads/", isCorrect: true },
        { text: "C) ssh -i key.pem ubuntu@EC2_IP cat health.log", isCorrect: false },
        { text: "D) rsync is the only option", isCorrect: false }
      ],
      explanation: "scp (secure copy) uses SSH under the hood — same key, same host, same user. The syntax is source → destination."
    },
    {
      num: 5,
      question: "Why must billing alerts be set in us-east-1 specifically, even if your EC2 is in eu-west-1?",
      options: [
        { text: "A) It's a bug in AWS", isCorrect: false },
        { text: "B) Billing alarms only work in us-east-1 for paid accounts", isCorrect: false },
        { text: "C) AWS publishes estimated charge metrics to CloudWatch only in us-east-1 — it's the global billing region regardless of where your resources are", isCorrect: true },
        { text: "D) You can use any region for billing alarms", isCorrect: false }
      ],
      explanation: "AWS billing is a global construct aggregated in us-east-1. The EstimatedCharges CloudWatch metric only exists in us-east-1."
    },
    {
      num: 6,
      question: "What does tar -czf archive.tar.gz ~/scripts/ do and what does each flag mean?",
      options: [
        { text: "A) Extracts archive.tar.gz into ~/scripts/", isCorrect: false },
        { text: "B) Creates (-c) a gzip-compressed (-z) archive (-f) named archive.tar.gz containing the ~/scripts/ directory", isCorrect: true },
        { text: "C) Lists the contents of an existing archive", isCorrect: false },
        { text: "D) Compresses only without creating an archive", isCorrect: false }
      ],
      explanation: "-c = create a new archive. -z = compress using gzip. -f = write to specified filename."
    }
  ],
  github: {
    filename: "devops-90days/week-01/README.md",
    commitMessage: "docs: Week 01 complete — full architecture summary and lessons learned",
    template: `# Week 01 Complete — DevOps Foundation (Full)
**Dates:** YYYY-MM-DD to YYYY-MM-DD | **Status:** ✅ Complete
![Days](https://img.shields.io/badge/week-1%20of%2013-brightgreen)
![Commits](https://img.shields.io/badge/commits-8+-blue)

---

## 🏗 Week 1 Capstone Architecture

\`\`\`
Internet
    |
[Internet Gateway]
    |
[Custom VPC: 10.0.0.0/16]
    |
    ├─── [Public Subnet: 10.0.1.0/24]
    │         Route: 0.0.0.0/0 → IGW
    │         [EC2: t2.micro Ubuntu 22.04]
    │              └─ IAM Role → S3 Read Access
    │              └─ nginx (port 80 open)
    │              └─ monitor_server.sh (cron: */5 * * * *)
    │              └─ deploy_hardened.sh (pulls config from S3)
    │
    └─── [Private Subnet: 10.0.2.0/24]
              Route: local only

[S3 Bucket: devops-config-YOURNAME]
    └─ app.conf (SITE_TITLE, env vars)
    └─ Versioning: enabled

[IAM Role: EC2-S3-ReadOnly-Role]
    └─ Policy: GetObject + ListBucket on devops-config-YOURNAME only
\`\`\`

## 📅 What I Built Each Day
| Day | Topic | Key Output |
|-----|-------|-----------|
| 1 | Linux on EC2 | server_setup.sh + Text processing + Modern systemd logs |
| 2 | Git + AWS CLI | git checkout -b branching flow + CloudWatch billing alarms |
| 3 | EC2 + nginx | EBS Snapshot backups + deploy.sh |
| 4 | Bash scripting | sys_monitor.sh + cron scheduled |
| 5 | IAM + S3 | Custom policy, EC2 role, S3 static site |
| 6 | VPC | 2-tier VPC from scratch, public/private subnets |
| 7 | Capstone | Full system: VPC + IAM + S3 + EC2 + monitoring |
| 7.1 | Weekly Project | Hardened self-healing deployment script |

## 💡 Most Important Things I Learned
1. IAM roles on EC2 — no keys on servers, ever
2. What makes a subnet public: 0.0.0.0/0 → IGW in route table
3. set -euo pipefail — mandatory in every script
4. Least privilege: exact ARNs, not wildcards
5. Debug order: read error → check service → check network → check config → check logs
6. Always configure named profiles to segregate account environments
7. Take EBS volume snapshots before introducing major config changes
8. Define explicit PATH environments inside scripts running in Cron jobs

## 🐛 Hardest Errors I Hit and Fixed
| Error | Cause | Fix |
|-------|-------|-----|
| Site unreachable despite nginx running | IGW route missing from route table | aws ec2 create-route with 0.0.0.0/0 → IGW |
| AccessDenied on S3 from EC2 | Policy had wrong bucket ARN | Fixed ARN to exact bucket name |
| Cron job not running | Relative path for aws command | Changed to /usr/local/bin/aws |
| AWS Auth Failure | Configured default profile vs named profile mismatch | Explicitly used --profile learning and AWS_PROFILE |`
  }
};
