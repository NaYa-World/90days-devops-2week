import { BootcampDay } from '../types';

export const day7: BootcampDay = {
  day: 7,
  title: "WEEK 1 CAPSTONE",
  subtitle: "Full Automated Deployment · Multi-Tier Architecture · Debugging Under Pressure · Portfolio Commit",
  color: "#ff2a2a",
  trainerNote: "Day 7 is where everything connects. You are building a complete system from scratch. No tutorial. You are building from memory and your own notes.",
  engineerNote: "Day 7 commands are deliberately more sparse than Days 4–6. You have the reference material in your own GitHub notes. This is apprenticeship mode: I give you the spec, you figure out the implementation.",
  goal: {
    icon: "🎯",
    title: "Day 7 Goal",
    description: "Expected output: A running system with a live URL, a GitHub repo documenting it, and the ability to describe every component in a 2-minute verbal explanation. If you finish early, add a health monitoring cron job (Day 4) that logs to S3 (Day 5)."
  },
  schedule: [
    {
      time: "09:00–09:30",
      phase: "REVIEW",
      activity: "Week 1 audit — cold test yourself",
      why: "Open a fresh terminal. Without looking at notes: launch an EC2, create an S3 bucket, write a function in bash, and explain what a public subnet needs. Time yourself. Gaps = what to review."
    },
    {
      time: "09:30–10:30",
      phase: "PLAN",
      activity: "Architecture planning — draw before building",
      why: "On paper: draw the system. VPC box → subnets → EC2 → IAM role arrows → S3 bucket. Write the deploy flow. Planning before building is a senior engineering habit."
    },
    {
      time: "10:30–10:45",
      phase: "BREAK",
      activity: "Break",
      why: ""
    },
    {
      time: "10:45–12:30",
      phase: "BUILD",
      activity: "Build Phase 1: Infrastructure — VPC + IAM + S3",
      why: "Using your Day 5 + Day 6 notes: create the VPC, subnets, IGW, route tables. Create S3 bucket with config file. Create IAM role and attach to EC2. All CLI. No console."
    },
    {
      time: "12:30–13:15",
      phase: "BREAK",
      activity: "Lunch — review your plan while eating, not the screen",
      why: ""
    },
    {
      time: "13:15–15:00",
      phase: "BUILD",
      activity: "Build Phase 2: Application — EC2, nginx, full deploy script",
      why: "Launch EC2 with the IAM role in your new VPC. Write the deploy.sh that pulls config from S3 and deploys nginx. Run it. Hit the URL. Fix whatever breaks."
    },
    {
      time: "15:00–15:45",
      phase: "VALIDATE",
      activity: "Validation + deliberate failure injection",
      why: "Deliberately break each component one at a time. Remove the IGW route → what fails? Remove the IAM role → what fails? Stop nginx → does health check restart it? Fix each one systematically."
    },
    {
      time: "15:45–16:00",
      phase: "BREAK",
      activity: "Break",
      why: ""
    },
    {
      time: "16:00–17:00",
      phase: "DOCUMENT",
      activity: "Week 1 documentation + portfolio commit + cleanup",
      why: "Write your Week 1 README. Commit everything. Then STOP the EC2 and EMPTY the S3 bucket."
    }
  ],
  concepts: [
    {
      icon: "🔗",
      title: "Infrastructure as Connected Systems",
      description: "Everything you built this week is a connected system. Remove one piece and trace the failure: no IGW route → EC2 unreachable → deploy script can't run → site down. Understanding these dependency chains is what separates an operator from an engineer.",
      analogy: "Interview: 'Walk me through your Week 1 capstone architecture.' Practice this as a 2-minute verbal answer."
    },
    {
      icon: "🔒",
      title: "Defense in Depth",
      description: "Security isn't one lock — it's layers. VPC network isolation → private subnet → security group → IAM least privilege → S3 bucket policy. A breach of one layer doesn't compromise everything. This is the mental model employers test for.",
      analogy: "Your Week 1 system has 4 security layers. Be able to name them and explain what each one prevents."
    },
    {
      icon: "📊",
      title: "Observability Basics",
      description: "Your health_check.sh (Day 4.1) logs to a file. The logs are the first place you look when something fails. In real systems this scales to CloudWatch, Datadog, Grafana. The principle is the same: if it isn't logged, the failure is invisible.",
      analogy: "Week 2 covers CloudWatch. Day 7 is the conceptual foundation for why monitoring exists."
    },
    {
      icon: "🗂",
      title: "Infrastructure Reproducibility",
      description: "If your deploy.sh and your bash build scripts are in GitHub, a colleague could build your entire environment from scratch. This is the seed of Infrastructure as Code (Terraform, CloudFormation) which you'll learn in Week 3–4.",
      analogy: "Your Day 7 scripts are primitive IaC. Know how to describe them that way in an interview."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 2,
      sessionTitle: "Capstone Deploy Script — week1_deploy.sh",
      sections: [
        {
          label: "This script ties everything from Week 1 together",
          lines: [
            { type: "output", text: "#!/bin/bash" },
            { type: "output", text: "set -euo pipefail" },
            { type: "output", text: "###############################################" },
            { type: "output", text: "# week1_deploy.sh\n# Week 1 Capstone: Pull config from S3 → Deploy nginx\n# Requires: EC2 with IAM role that has S3 read access\n###############################################" },
            { type: "output", text: "CONFIG_BUCKET=\"${1:-devops-config-YOUR-NAME}\"" },
            { type: "comment", text: "$1 = first argument passed to script, with fallback default" },
            { type: "output", text: "LOG_FILE=\"${HOME}/logs/deploy-$(date +%Y%m%d-%H%M%S).log\"" },
            { type: "output", text: "WEB_ROOT=\"/var/www/html\"" },
            { type: "output", text: "REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)" },
            { type: "output", text: "INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)" },
            { type: "output", text: "PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" },
            { type: "comment", text: "EC2 metadata service: always available at 169.254.169.254\nNo auth needed — this is instance-local only" },
            { type: "output", text: "mkdir -p \"$(dirname $LOG_FILE)\"" },
            { type: "output", text: "function log() { echo \"[$(date '+%H:%M:%S')] [$1] $2\" | tee -a \"$LOG_FILE\"; }" },
            { type: "output", text: "function fail() { log \"FATAL\" \"$1\"; exit 1; }" },
            { type: "output", text: "log \"INFO\" \"=== Week 1 Capstone Deploy Starting ===\"\nlog \"INFO\" \"Instance: $INSTANCE_ID | Region: $REGION | IP: $PUBLIC_IP\"\nlog \"INFO\" \"Config bucket: $CONFIG_BUCKET\"" },
            { type: "output", text: "log \"INFO\" \"[1/5] Installing dependencies...\"\nsudo apt-get update -qq || fail \"apt update failed\"\nsudo apt-get install -y nginx awscli || fail \"Package install failed\"" },
            { type: "output", text: "log \"INFO\" \"[2/5] Pulling config from S3...\"\naws s3 cp \"s3://${CONFIG_BUCKET}/app.conf\" /tmp/app.conf \\\n || fail \"S3 pull failed — check IAM role is attached and bucket exists\"\nsource /tmp/app.conf" },
            { type: "comment", text: "app.conf contains: SITE_TITLE=\"My DevOps Server\" | source loads vars" },
            { type: "output", text: "log \"OK\" \"Config loaded: SITE_TITLE=${SITE_TITLE:-not set}\"" },
            { type: "output", text: "log \"INFO\" \"[3/5] Deploying web page...\"\nsudo tee \"$WEB_ROOT/index.html\" > /dev/null << HTML\n<!DOCTYPE html>\n<html><body style=\"background:#050509;color:#e040fb;font-family:monospace;padding:40px\">\n <h1>${SITE_TITLE:-DevOps Week 1 Complete}</h1>\n <p>Instance: $INSTANCE_ID</p>\n <p>Region: $REGION</p>\n <p>Deployed: $(date)</p>\n</body></html>\nHTML" },
            { type: "output", text: "log \"INFO\" \"[4/5] Starting nginx...\"\nsudo nginx -t || fail \"nginx config syntax error\"\nsudo systemctl enable nginx\nsudo systemctl restart nginx" },
            { type: "output", text: "log \"INFO\" \"[5/5] Scheduling health check...\"\n(crontab -l 2>/dev/null; echo \"*/5 * * * * ${HOME}/scripts/health_check.sh >> ${HOME}/logs/health.log 2>&1\") | crontab -" },
            { type: "output", text: "log \"INFO\" \"=== Deployment Complete ===\"\nlog \"INFO\" \" Site live at: http://$PUBLIC_IP\"\nlog \"INFO\" \" Deploy log: $LOG_FILE\"\nlog \"INFO\" \" Health check: crontab -l\"" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 2,
      sessionTitle: "Validation + Failure Injection Tests",
      sections: [
        {
          label: "Test 1: Verify IAM role is working (not keys)",
          lines: [
            { type: "cmd", prompt: "$", text: "cat ~/.aws/credentials 2>/dev/null || echo \"No credentials file — good\"" },
            { type: "ok", text: "No credentials file — good" },
            { type: "cmd", prompt: "$", text: "aws sts get-caller-identity" },
            { type: "ok", text: "{\n  \"Arn\": \"arn:aws:sts::123:assumed-role/EC2-S3-ReadOnly-Role/i-xxx\"\n}" },
            { type: "comment", text: "\"assumed-role\" confirms EC2 is using the role, not stored keys" }
          ]
        },
        {
          label: "Test 2: Deliberately remove IGW route — what breaks?",
          lines: [
            { type: "cmd", prompt: "$", text: "aws ec2 delete-route --route-table-id $PUBLIC_RT --destination-cidr-block 0.0.0.0/0" },
            { type: "comment", text: "From your laptop: try to SSH — connection timeout. Why?\nEC2 has a public IP but the route to the IGW is gone\nTraffic from internet enters IGW but VPC has no route for the return" },
            { type: "cmd", prompt: "$", text: "aws ec2 create-route --route-table-id $PUBLIC_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID" },
            { type: "comment", text: "Route restored — SSH works again" }
          ]
        },
        {
          label: "Test 3: S3 permission boundary — try to exceed it",
          lines: [
            { type: "cmd", prompt: "$", text: "aws s3 ls" },
            { type: "err", text: "If using a least-privilege role: AccessDenied (expected)\nYour policy only allows GetObject + ListBucket on one specific bucket\nNot s3:ListAllMyBuckets — so this is correctly denied" }
          ]
        },
        {
          label: "End of Day: Clean Up (Important — prevents billing)",
          lines: [
            { type: "cmd", prompt: "$", text: "aws s3 rm s3://$BUCKET_NAME --recursive" },
            { type: "comment", text: "Empty bucket first" },
            { type: "cmd", prompt: "$", text: "aws s3 rb s3://$BUCKET_NAME" },
            { type: "comment", text: "Then remove it" },
            { type: "cmd", prompt: "$", text: "aws ec2 terminate-instances --instance-ids $INSTANCE_ID" },
            { type: "comment", text: "terminate = permanent delete. Stop = paused but billed for storage.\nFor learning, terminate is fine. VPC resources cost nothing when empty." }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "⚡ EC2 Metadata Service Returns Nothing (curl 169.254.169.254 fails)",
      steps: [
        {
          num: 1,
          title: "Check IMDSv2 token requirement",
          description: "Newer EC2 AMIs require IMDSv2 (token-based metadata access). The simple curl may fail.",
          cmd: "TOKEN=$(curl -X PUT \"http://169.254.169.254/latest/api/token\" -H \"X-aws-ec2-metadata-token-ttl-seconds: 21600\") && curl -H \"X-aws-ec2-metadata-token: $TOKEN\" http://169.254.169.254/latest/meta-data/"
        }
      ]
    },
    {
      title: "⚡ source /tmp/app.conf Fails or Variables Are Empty",
      steps: [
        {
          num: 1,
          title: "Inspect the file before sourcing",
          cmd: "cat /tmp/app.conf"
        },
        {
          num: 2,
          title: "File format must be: KEY=\"value\" — one per line, no spaces around =",
          description: "Comments (#) are fine. But any bad line causes sourcing to fail silently or error."
        },
        {
          num: 3,
          title: "Verify S3 download actually worked",
          cmd: "aws s3 cp s3://bucket/app.conf /tmp/app.conf && echo \"OK\" || echo \"FAILED\""
        }
      ]
    },
    {
      title: "⚡ Cron Line Added But Already Exists (Duplicate)",
      steps: [
        {
          num: 1,
          title: "Check current crontab before adding",
          cmd: "crontab -l | grep health_check"
        },
        {
          num: 2,
          title: "The capstone script uses a safe append pattern — if you run twice it duplicates",
          description: "Use: crontab -l 2>/dev/null | grep -v health_check | { cat; echo \"*/5 * * * * ...\"; } | crontab -\nThis pattern removes existing entry first, then adds fresh — idempotent."
        }
      ]
    }
  ],
  mistakes: [],
  project: {
    tag: "★ Week 1 Capstone",
    title: "Full-Stack Infrastructure: VPC + IAM + S3 + EC2 + nginx + Monitoring",
    timeEstimate: "⏱ Full Day",
    goal: "Build a complete, production-pattern system from scratch in one day using only your week's notes, the command reference in this pack, and your GitHub repo. No copying from old sessions. This is your Week 1 portfolio piece — it demonstrates you can build something end-to-end from a specification. Document every decision.",
    checklist: [
      "VPC built from CLI: 10.0.0.0/16, public and private subnets, IGW, route tables",
      "S3 config bucket: holds app.conf with SITE_TITLE and any other config vars",
      "IAM role on EC2: read-only access to config bucket. Written as a JSON file committed to repo",
      "EC2 launched in public subnet: t2.micro, tagged \"week1-capstone\"",
      "week1_deploy.sh runs on EC2: pulls config from S3, installs nginx, serves page",
      "Live URL accessible: browser shows page with instance ID and region pulled dynamically",
      "health_check.sh running via cron: verify after 5+ mins that log file is growing",
      "Failure injection test: remove IGW route → site breaks → re-add route → site recovers",
      "GitHub repo: Week 1 README with ASCII architecture diagram, all scripts committed",
      "Clean up: stop/terminate EC2, empty and delete S3 buckets"
    ],
    expectedOutput: "✓ curl http://YOUR-EC2-IP → HTML page with your instance ID visible\n✓ aws sts get-caller-identity → shows \"assumed-role\", not your IAM user\n✓ crontab -l → shows health_check.sh scheduled\n✓ cat ~/logs/health.log → timestamped entries every 5 minutes\n✓ git log --oneline → at least 8 meaningful commits across the week\n✓ github.com/YOURNAME/devops-90days → populated, public, with READMEs"
  },
  interview: [
    {
      question: "Tell me about a project you built independently.",
      answer: "In my first week of structured DevOps learning, I built a complete 2-tier AWS infrastructure from scratch. I created a custom VPC with public and private subnets, an internet gateway, and separate route tables — all using the AWS CLI, not the console, so everything was repeatable. I deployed an EC2 instance in the public subnet with an IAM role attached — no access keys on the server. The IAM role has a least-privilege policy that reads only from one specific S3 bucket. I wrote a Bash deployment script that pulls configuration from that S3 bucket, installs nginx, and serves a custom web page. I also wrote a health monitoring script that runs every 5 minutes via cron and checks disk usage, RAM, and service status — it logs results with timestamps and exits with a non-zero code if problems are found. The whole system is in GitHub with commit history and architecture documentation. I know what breaks if I remove the IGW route, the IAM role, or the nginx service — because I tested each failure deliberately."
    },
    {
      question: "What would you change about your Week 1 architecture to make it production-ready?",
      answer: "Three main things. First, I'd replace the manual Bash deployment with a proper CI/CD pipeline — GitHub Actions or CodePipeline triggered on git push, with automated tests before deploy. Second, the IAM role policy is correct but I'd add a boundary condition so even administrators can't accidentally escalate it. Third, I don't have a NAT Gateway, so the private subnet EC2 can't receive software updates — in production that's a security risk. I'd add a NAT Gateway for the private subnet's outbound traffic. I'd also replace the hand-built VPC with Terraform so the whole environment can be destroyed and recreated in under 5 minutes from a git repo — that's Infrastructure as Code, which I'm learning next."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "In what order would you diagnose this: \"My EC2 web server was working, now the site is down, nginx status shows active.\"",
      options: [
        { text: "A) Reboot EC2, reinstall nginx, check S3", isCorrect: false },
        { text: "B) Check Security Group inbound rules → check IGW route → check nginx config with nginx -t → check nginx error logs", isCorrect: true },
        { text: "C) Check IAM role → check S3 → check cron", isCorrect: false },
        { text: "D) Terminate and rebuild the instance", isCorrect: false }
      ],
      explanation: "nginx is active but site is down — nginx process is fine. The issue is network or config. Security Group first (most common), then routing, then nginx's own config for subtle issues. Never reboot first — that destroys evidence of what went wrong."
    },
    {
      num: 2,
      question: "You want your deploy script to be idempotent — safe to run twice without side effects. Which bash pattern achieves this for directory creation?",
      options: [
        { text: "A) mkdir /path/to/dir (fails if already exists)", isCorrect: false },
        { text: "B) mkdir -p /path/to/dir (creates if missing, silent if exists)", isCorrect: true },
        { text: "C) rm -rf /path && mkdir /path", isCorrect: false },
        { text: "D) [ -d /path ] && echo \"exists\"", isCorrect: false }
      ],
      explanation: "Idempotency is a core DevOps principle: running the same operation multiple times produces the same result. mkdir -p silently succeeds if the directory already exists. This pattern should be in every setup script — it's safe to run repeatedly without breaking anything."
    },
    {
      num: 3,
      question: "A private subnet EC2 needs to call an external API. No NAT Gateway exists. What happens?",
      options: [
        { text: "A) The request silently times out — there is no path to the internet", isCorrect: true },
        { text: "B) AWS automatically routes through the IGW", isCorrect: false },
        { text: "C) The security group blocks it", isCorrect: false },
        { text: "D) It uses the IAM role for internet access", isCorrect: false }
      ],
      explanation: "Private subnets have no route to the internet — the route table only has the local VPC route. Without a NAT Gateway, any outbound internet traffic from a private instance drops at the routing layer. The connection simply times out. IAM roles have no bearing on network routing."
    },
    {
      num: 4,
      question: "What information does aws sts get-caller-identity give you and when do you use it?",
      options: [
        { text: "A) Shows your EC2 instance metadata", isCorrect: false },
        { text: "B) Shows which AWS identity (user or role) the current credentials belong to — use it to verify you're authenticated correctly", isCorrect: true },
        { text: "C) Lists all IAM users in your account", isCorrect: false },
        { text: "D) Checks if your S3 bucket exists", isCorrect: false }
      ],
      explanation: "aws sts get-caller-identity returns: UserId, Account number, and ARN of the current identity. The ARN tells you if you're running as an IAM user (arn:aws:iam::xxx:user/name) or assuming a role (arn:aws:sts::xxx:assumed-role/role-name/session). Use it every time before running AWS CLI commands to confirm you have the right identity."
    },
    {
      num: 5,
      question: "Your bash script runs fine manually but fails in cron with: \"/usr/bin/aws: command not found\". Why?",
      options: [
        { text: "A) AWS CLI is not installed", isCorrect: false },
        { text: "B) aws CLI is in /usr/local/bin which isn't in cron's minimal PATH", isCorrect: true },
        { text: "C) Cron doesn't support AWS commands", isCorrect: false },
        { text: "D) The IAM role expired", isCorrect: false }
      ],
      explanation: "AWS CLI v2 installs to /usr/local/bin. Cron's default PATH is /usr/bin:/bin. Use the full path in cron: /usr/local/bin/aws s3 cp ... Alternatively add PATH=/usr/bin:/usr/local/bin at the top of crontab. Find the full path with: which aws."
    },
    {
      num: 6,
      question: "What is the correct VPC CIDR for 65,536 total IP addresses?",
      options: [
        { text: "A) 10.0.0.0/8", isCorrect: false },
        { text: "B) 10.0.0.0/16", isCorrect: true },
        { text: "C) 10.0.0.0/24", isCorrect: false },
        { text: "D) 10.0.0.0/32", isCorrect: false }
      ],
      explanation: "/16 = 2^16 = 65,536 IPs. This is the standard VPC size for production workloads — large enough to have many subnets across multiple availability zones. /8 is too large, /24 is only 256 (subnet size), /32 is a single IP."
    },
    {
      num: 7,
      question: "You have 8 days of commit history on GitHub. An interviewer asks \"I can see you've been documenting your learning — walk me through what you built.\" What do you lead with?",
      options: [
        { text: "A) \"I followed a YouTube tutorial...\"", isCorrect: false },
        { text: "B) \"I installed Linux and learned some commands.\"", isCorrect: false },
        { text: "C) \"I built a 2-tier AWS infrastructure: VPC with public/private subnets, EC2 deployed with an IAM role that reads config from S3, nginx served by an automated deploy script, and a cron-scheduled health monitor. I can show you the architecture in my README.\"", isCorrect: true },
        { text: "D) \"I'm still a beginner, I haven't done anything production-ready.\"", isCorrect: false }
      ],
      explanation: "Own what you built. Be specific. Name the components and how they connect. A senior interviewer asking this question wants to hear you describe a system, not apologise for being new. Your Week 1 project IS real infrastructure — describe it that way."
    }
  ],
  github: {
    filename: "devops-90days/week-01/README.md",
    commitMessage: "docs: Week 01 complete — full architecture summary and lessons learned",
    template: `# Week 01 Complete — DevOps Foundation
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
    │              └─ health_check.sh (cron: */5 * * * *)
    │              └─ week1_deploy.sh (pulls config from S3)
    │
    └─── [Private Subnet: 10.0.2.0/24]
              Route: local only
              [EC2: backend — not internet accessible]

[S3 Bucket: devops-config-YOURNAME]
    └─ app.conf (SITE_TITLE, env vars)
    └─ Versioning: enabled

[IAM Role: EC2-S3-ReadOnly-Role]
    └─ Policy: GetObject + ListBucket on devops-config-YOURNAME only
\`\`\`

## 📅 What I Built Each Day
| Day | Topic | Key Output |
|-----|-------|-----------|
| 1 | Linux on EC2 | server_setup.sh — automated environment setup |
| 2 | Git + AWS CLI | devops-90days GitHub repo, IAM configured |
| 3 | EC2 + nginx | Live web server + deploy.sh |
| 4 | Bash scripting | health_check.sh + cron scheduled |
| 5 | IAM + S3 | Custom policy, EC2 role, S3 static site |
| 6 | VPC | 2-tier VPC from scratch, public/private subnets |
| 7 | Capstone | Full system: VPC + IAM + S3 + EC2 + monitoring |

## 💡 Most Important Things I Learned
1. IAM roles on EC2 — no keys on servers, ever
2. What makes a subnet public: 0.0.0.0/0 → IGW in route table
3. set -euo pipefail — mandatory in every script
4. Least privilege: exact ARNs, not wildcards
5. Debug order: read error → check service → check network → check config → check logs

## 🐛 Hardest Errors I Hit and Fixed
| Error | Cause | Fix |
|-------|-------|-----|
| Site unreachable despite nginx running | IGW route missing from route table | aws ec2 create-route with 0.0.0.0/0 → IGW |
| AccessDenied on S3 from EC2 | Policy had wrong bucket ARN | Fixed ARN to exact bucket name |
| Cron job not running | Relative path for aws command | Changed to /usr/local/bin/aws |
| [Your error] | | |

## 📈 Week 2 Preview
CloudWatch logging + alarms, Load Balancer, Auto Scaling Groups, RDS basics, first CI/CD with GitHub Actions`
  }
};
