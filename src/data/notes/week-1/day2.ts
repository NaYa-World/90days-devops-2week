import { BootcampDay } from '../types';

export const day2: BootcampDay = {
  day: 2,
  title: "Git Workflow + AWS Account Setup",
  subtitle: "Every piece of infrastructure, config, and code in professional DevOps lives in Git. Root security starts today.",
  color: "#4df0ff",
  trainerNote: "I've seen teams lose entire infrastructure configs because someone 'just edited the server directly'. Git is the foundation of GitOps, CI/CD, collaboration, and disaster recovery. Learn it like breathing.",
  engineerNote: "In my first job I force-pushed to main and broke the release pipeline for 3 hours. That never happens when you understand Git's internals, not just the commands.",
  goal: {
    icon: "🎯",
    title: "Day 2 Goal",
    description: "By the end of Day 2 you have a real GitHub repository for your DevOps notes, understand the git commit cycle, and have an AWS account with IAM — not root — credentials configured. You never use the root account again after today."
  },
  schedule: [
    {
      time: "09:00 – 09:30",
      phase: "REVIEW",
      activity: "Day 1 recap — type 10 commands from memory",
      why: "No notes. Open your EC2. Navigate to /etc, /var/log, check running services. If you can do this without looking at your notes, proceed."
    },
    {
      time: "09:30 – 10:30",
      phase: "THEORY",
      activity: "Git mental model — commits, branches, remotes",
      why: "Why version control exists. The three areas: working directory → staging → repository. Why git is the backbone of every CI/CD pipeline."
    },
    {
      time: "10:30 – 10:45",
      phase: "BREAK",
      activity: "15-minute physical break",
      why: "Rest and physical recovery."
    },
    {
      time: "10:45 – 12:30",
      phase: "HANDS-ON",
      activity: "Git setup + first real repository on EC2",
      why: "Install git, configure identity, init a repo, make commits, link to GitHub, push. This is the full git cycle — repeat it until it feels automatic."
    },
    {
      time: "12:30 – 13:15",
      phase: "BREAK",
      activity: "Lunch break",
      why: "Mandatory break away from screen."
    },
    {
      time: "13:15 – 14:30",
      phase: "SETUP",
      activity: "AWS Account + IAM setup",
      why: "Create your AWS free tier account. Lock the root account. Create an IAM user with AdministratorAccess for your daily use. Set up MFA on root. This is mandatory security hygiene — skipping it creates billing nightmares."
    },
    {
      time: "14:30 – 15:30",
      phase: "HANDS-ON",
      activity: "AWS CLI installation + first CLI commands",
      why: "The AWS Console GUI is for beginners and demos. DevOps is done via CLI. Install and configure aws-cli, run your first real AWS commands from the terminal."
    },
    {
      time: "15:30 – 15:45",
      phase: "BREAK",
      activity: "Short break",
      why: "Step away."
    },
    {
      time: "15:45 – 16:45",
      phase: "PROJECT",
      activity: "Mini Project: Push your Day 1 notes to GitHub",
      why: "Real DevOps engineers document everything in version control. Your first repo is your public portfolio — future employers look at this."
    },
    {
      time: "16:45 – 17:00",
      phase: "DOCUMENT",
      activity: "Write Day 2 notes + Quiz",
      why: "Consolidate today's learnings."
    }
  ],
  concepts: [
    {
      icon: "🌿",
      title: "Git Three-Area Model",
      description: "Working Directory: files you're editing. Staging Area (index): changes marked ready to commit. Repository (.git): permanent history of commits.",
      analogy: "Working dir = shopping basket. Staging = items at the checkout belt. Repository = receipt/purchase history."
    },
    {
      icon: "🔗",
      title: "Remote vs Local Repository",
      description: "Local repo lives on your machine (or EC2). Remote repo lives on GitHub/GitLab. git push sends local → remote. git pull brings remote → local.",
      analogy: "Local repo = your personal notebook. GitHub = the cloud-backed shared copy your whole team can read."
    },
    {
      icon: "🪪",
      title: "IAM — Identity and Access Management",
      description: "AWS root account = god mode. Never use it for daily work. IAM lets you create users with specific permissions. Every person, application, or EC2 that touches AWS needs an IAM identity.",
      analogy: "Root is the master key to the building. IAM users are individual keycards with specific room access."
    },
    {
      icon: "⌨️",
      title: "AWS CLI",
      description: "The AWS web console is a GUI for learning. Real DevOps uses the CLI or infrastructure-as-code. aws configure sets up your access keys. Then you can control EC2, S3, IAM from the terminal.",
      analogy: "Console = ATM touchscreen. CLI = talking directly to the bank system. Faster, scriptable, auditable."
    },
    {
      icon: "🌱",
      title: "Git Branching Model",
      description: "Branches isolate changes (feature/fix/docs) from the main line. When changes are tested and verified, they are merged back into main.",
      analogy: "Draft versions of a document. You write chapters on separate copies, then compile them into the final book."
    },
    {
      icon: "📦",
      title: "Git Stash & Undo",
      description: "git stash temporarily shelves uncommitted changes so you can switch branches. git revert creates a safe undo commit; git reset --hard destroys history.",
      analogy: "Stash is like a workbench drawer for half-finished parts. Revert is like a correction edit on Wikipedia; reset is deleting pages from the database."
    },
    {
      icon: "🚨",
      title: "AWS Cost Management & Billing Alarms",
      description: "Alarms set up in CloudWatch (specifically in us-east-1) track estimated charges. Budgets send alerts when cost thresholds are forecasted to be exceeded.",
      analogy: "A SMS notification from your bank when your balance falls below a limit, keeping you safe from surprise bills."
    },
    {
      icon: "🔑",
      title: "AWS CLI Named Profiles",
      description: "Instead of overwriting configurations, named profiles organize credentials for separate AWS accounts (e.g. learning, production).",
      analogy: "Having multiple user profiles on a streaming platform so viewing histories don't mix."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 3,
      sessionTitle: "Git Setup, Commits, and Branching Workflows",
      sections: [
        {
          label: "Install and Configure Git on EC2",
          lines: [
            { type: 'cmd', prompt: "$", text: "git --version" },
            { type: 'comment', text: "If it says \"command not found\":" },
            { type: 'cmd', prompt: "$", text: "sudo apt update && sudo apt install git -y" },
            { type: 'cmd', prompt: "$", text: "git config --global user.name \"Your Name\"" },
            { type: 'cmd', prompt: "$", text: "git config --global user.email \"your@email.com\"" },
            { type: 'cmd', prompt: "$", text: "git config --global init.defaultBranch main" },
            { type: 'cmd', prompt: "$", text: "git config --list" }
          ]
        },
        {
          label: "Create Your First Repository & Commit Cycle",
          lines: [
            { type: 'cmd', prompt: "$", text: "mkdir ~/devops-90days && cd ~/devops-90days" },
            { type: 'cmd', prompt: "$", text: "git init" },
            { type: 'cmd', prompt: "$", text: "mkdir day-01 day-02" },
            { type: 'cmd', prompt: "$", text: "touch README.md day-01/notes.md day-02/notes.md" },
            { type: 'cmd', prompt: "$", text: "echo \"# 90 Days DevOps\" > README.md" },
            { type: 'cmd', prompt: "$", text: "git status" },
            { type: 'cmd', prompt: "$", text: "git add README.md" },
            { type: 'cmd', prompt: "$", text: "git diff --staged" },
            { type: 'comment', text: "Review staged changes before committing" },
            { type: 'cmd', prompt: "$", text: "git commit -m \"docs: Add initial README\"" }
          ]
        },
        {
          label: "Team Branching Workflow (checkout, stash, merge, revert)",
          lines: [
            { type: 'cmd', prompt: "$", text: "git checkout -b feature/add-health-script" },
            { type: 'comment', text: "Create and switch to a new feature branch" },
            { type: 'cmd', prompt: "$", text: "echo \"# Health Check\" > scripts/health_check.sh" },
            { type: 'cmd', prompt: "$", text: "git add scripts/health_check.sh" },
            { type: 'cmd', prompt: "$", text: "git stash" },
            { type: 'comment', text: "Stash uncommitted changes to switch context" },
            { type: 'cmd', prompt: "$", text: "git stash pop" },
            { type: 'comment', text: "Restore stashed changes" },
            { type: 'cmd', prompt: "$", text: "git commit -m \"feat: Add health check script skeleton\"" },
            { type: 'cmd', prompt: "$", text: "git checkout main" },
            { type: 'cmd', prompt: "$", text: "git merge feature/add-health-script" },
            { type: 'comment', text: "Merge features back into main" },
            { type: 'cmd', prompt: "$", text: "git log --oneline --graph --all" },
            { type: 'comment', text: "Display visual history graph" },
            { type: 'cmd', prompt: "$", text: "git revert HEAD" },
            { type: 'comment', text: "Safe undo: creates a new commit undoing the last merge" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 3,
      sessionTitle: "AWS Account Security, CLI, and Named Profiles",
      sections: [
        {
          label: "Install AWS CLI v2 on EC2",
          lines: [
            { type: 'cmd', prompt: "$", text: "curl \"https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip\" -o \"awscliv2.zip\"" },
            { type: 'cmd', prompt: "$", text: "unzip awscliv2.zip" },
            { type: 'cmd', prompt: "$", text: "sudo ./aws/install" },
            { type: 'cmd', prompt: "$", text: "aws --version" }
          ]
        },
        {
          label: "Configure Named Profiles",
          lines: [
            { type: 'cmd', prompt: "$", text: "aws configure --profile learning" },
            { type: 'comment', text: "Create named profile instead of overwriting default" },
            { type: 'cmd', prompt: "$", text: "export AWS_PROFILE=learning" },
            { type: 'comment', text: "Set current session profile" },
            { type: 'cmd', prompt: "$", text: "aws sts get-caller-identity" },
            { type: 'comment', text: "Verify active identity and account" }
          ]
        }
      ]
    },
    {
      sessionNumber: 3,
      totalSessions: 3,
      sessionTitle: "AWS Billing Safeguards Setup",
      sections: [
        {
          label: "Enable Console Alerts First",
          lines: [
            { type: 'comment', text: "Console → Account (top right) → Billing preferences" },
            { type: 'comment', text: "Check: 'Receive Billing Alerts' & 'Receive Free Tier Usage Alerts'" }
          ]
        },
        {
          label: "Create CloudWatch Billing Alarm & Budgets via CLI",
          lines: [
            { type: 'cmd', prompt: "$", text: "aws sns create-topic --name billing-alerts --region us-east-1" },
            { type: 'comment', text: "Metrics live globally in us-east-1 (N. Virginia). Command returns TopicArn." },
            { type: 'cmd', prompt: "$", text: "aws sns subscribe --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT:billing-alerts --protocol email --notification-endpoint your@email.com --region us-east-1" },
            { type: 'comment', text: "Check your email inbox and click 'Confirm Subscription'" },
            { type: 'cmd', prompt: "$", text: "aws cloudwatch put-metric-alarm --alarm-name \"Monthly-Bill-10-USD\" --alarm-description \"Alert if charges exceed $10\" --metric-name EstimatedCharges --namespace AWS/Billing --statistic Maximum --dimensions Name=Currency,Value=USD --period 86400 --evaluation-periods 1 --threshold 10 --comparison-operator GreaterThanOrEqualToThreshold --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT:billing-alerts --region us-east-1" },
            { type: 'comment', text: "Create Cost Budget" },
            { type: 'cmd', prompt: "$", text: "cat > /tmp/budget.json << 'EOF'\n{\n  \"BudgetName\": \"DevOps-Learning-Budget\",\n  \"BudgetLimit\": { \"Amount\": \"10\", \"Unit\": \"USD\" },\n  \"TimeUnit\": \"MONTHLY\",\n  \"BudgetType\": \"COST\"\n}\nEOF" },
            { type: 'cmd', prompt: "$", text: "ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text) && aws budgets create-budget --account-id $ACCOUNT_ID --budget file:///tmp/budget.json" }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "Git Push Fails with Authentication Error",
      steps: [
        {
          num: 1,
          title: "GitHub stopped accepting passwords in August 2021",
          description: "You must use a Personal Access Token (PAT), not your GitHub password."
        },
        {
          num: 2,
          title: "Generate a PAT: GitHub → Settings → Developer settings → PAT → Tokens (classic)",
          description: "Give it \"repo\" scope minimum. Copy it — shown once only."
        },
        {
          num: 3,
          title: "When prompted for password, paste the token",
          cmd: "git config --global credential.helper store",
          description: "After first successful push with token, this caches it."
        }
      ]
    },
    {
      title: "AWS CLI \"An error occurred (AuthFailure)\" or \"InvalidClientTokenId\"",
      steps: [
        {
          num: 1,
          title: "Check credentials are set correctly",
          cmd: "cat ~/.aws/credentials"
        },
        {
          num: 2,
          title: "Ensure you're using IAM user keys, not root keys",
          description: "Root access keys are in \"Security credentials\" under the account menu — top right of console. IAM user keys are in IAM → Users → [username] → Security credentials."
        },
        {
          num: 3,
          title: "Re-run aws configure to overwrite bad credentials",
          cmd: "aws configure"
        }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Committing AWS access keys to GitHub",
      description: "This is the most dangerous mistake in DevOps. Bots scan GitHub constantly. A real access key committed to a public repo will be exploited within minutes, causing unexpected AWS charges in the thousands.",
      fix: "Fix: Add .env and *.pem to your .gitignore immediately. Never use echo with keys near a git directory."
    },
    {
      mistake: "Working with the AWS root account credentials daily",
      description: "Root has no restrictions. One compromised root credential = full account takeover, all regions, all services, all billing.",
      fix: "Fix: Enable MFA on root. Create an IAM admin user. Use IAM for everything. Lock root away."
    },
    {
      mistake: "Vague commit messages like \"update\" or \"fix stuff\"",
      description: "In three weeks you will have no idea what \"update\" meant. In a team, everyone hates this. Your GitHub is your professional portfolio — commit messages reflect your engineering thinking.",
      fix: "Fix: Format: \"Type: Short description\". Examples: \"feat: add nginx setup to server_setup.sh\" | \"fix: correct chmod on pem key\" | \"docs: add Day 02 notes\""
    },
    {
      mistake: "git add . on every single commit without checking git status first",
      description: "You'll accidentally commit log files, compiled binaries, environment files, or temporary data.",
      fix: "Fix: Always run git status before git add. Create a .gitignore file immediately: echo \"*.log\\n*.pem\\n.env\\n__pycache__/\" >> .gitignore"
    },
    {
      mistake: "Working directly on the main branch — no branching workflow",
      description: "Committing directly to main stops teams from isolating new work, risking breaking the production branch.",
      fix: "Fix: Create a separate branch for every feature: git checkout -b feature/short-name, review changes with git diff, and merge only after testing."
    },
    {
      mistake: "Not setting a billing alarm before starting AWS practice",
      description: "Surprise charges in the hundreds of dollars can occur from running extra resources or leaving NAT Gateways active.",
      fix: "Fix: Set a CloudWatch billing alarm for $10 and an AWS Budget in us-east-1 first. Stop instances daily using a script or the CLI."
    },
    {
      mistake: "Running git reset --hard on shared remote branches",
      description: "git reset --hard rewrites history and destroys commit logs. If pushed, this creates divergent histories for teammates.",
      fix: "Fix: Use git revert instead to create an 'undo' commit, keeping history clean and collaborative."
    },
    {
      mistake: "Running aws configure without named profiles",
      description: "Scribbling credentials over default profiles can mix up accounts or destroy local configurations.",
      fix: "Fix: Always configure named profiles: aws configure --profile learning, and set AWS_PROFILE env variable."
    }
  ],
  project: {
    tag: "📁 Day 2 Mini Project",
    title: "devops-90days — Push Your First Real Portfolio Repo",
    timeEstimate: "⏱ ~60 minutes",
    goal: "By the end of this project you have a live GitHub repository with proper structure, a meaningful README, and your Day 1 notes committed. This is the start of your public evidence of learning — recruiters look at commit history.",
    checklist: [
      "Create a .gitignore before your first commit (add *.pem, .env, *.log)",
      "Write a real README.md with: what this repo is, what you're learning, your goal",
      "Create folder structure: /day-01/, /day-02/, /scripts/, /projects/",
      "Copy your server_setup.sh from Day 1 into /scripts/",
      "Write a meaningful commit message for each piece of work (not \"add files\")",
      "Push to GitHub and verify it displays correctly at github.com/yourusername/devops-90days",
      "Bonus: Add a GitHub Actions badge placeholder to your README (you'll fill it in Week 2)"
    ],
    expectedOutput: "A GitHub repository showing a clean folder tree containing Day 1's server_setup.sh in the /scripts/ folder, and day-01/notes.md populated, with a high quality markdown profile README.md visible on the homepage."
  },
  interview: [
    {
      question: "Walk me through the git workflow — what happens when you make a change?",
      answer: "Git has three areas. The working directory is where you edit files. When a change is ready to be saved, I stage it with git add — this moves it to the staging area, also called the index. I then run git commit with a meaningful message, which permanently records that snapshot in the local repository. If I'm working with a team, I push to the remote — GitHub in most cases — using git push. Git pull brings other people's changes down to my local copy. The reason we have a staging area is intentional: it lets you commit only part of your changes, giving you fine-grained control over what goes in each commit."
    },
    {
      question: "Why does AWS have IAM and why shouldn't you use the root account?",
      answer: "The root account in AWS is the original account owner and has unrestricted access to everything — all services, all regions, all billing. IAM — Identity and Access Management — lets you create separate users and roles with only the permissions they actually need. This follows the principle of least privilege. If an IAM user's credentials are compromised, the damage is limited to what that user can do. If root credentials are compromised, an attacker has full control of your entire AWS account. In practice: I enable MFA on root, lock the root credentials away, and create an IAM user with AdministratorAccess for my daily work. In a company, individual team members would have even more restricted IAM roles — a developer might only be able to write to S3 and trigger Lambda, not touch EC2 or billing."
    },
    {
      question: "Walk me through how you'd use git in a team environment.",
      answer: "My workflow starts with pulling the latest main: git pull. Then I create a feature branch named after the work: git checkout -b feature/nginx-config-update. I do the work in small focused commits. If I need to switch context mid-task I stash unfinished work with git stash. When the feature is done, I push the branch to GitHub and open a Pull Request — a PR gives teammates a chance to review the code before it hits main. After the PR is approved and merged, I delete the branch both locally and on the remote. I never commit directly to main — main should always be in a deployable state."
    },
    {
      question: "What is the difference between git revert and git reset?",
      answer: "Both undo changes but in fundamentally different ways. git revert creates a new commit that reverses the changes from a previous commit — the original commit stays in history. It's safe to use on any branch including shared ones because it doesn't rewrite history. git reset moves the HEAD pointer backwards — it can remove commits from history entirely. reset --hard also discards working directory changes. Reset is useful for cleaning up local commits before a first push, but you should never use it on a branch that teammates have already pulled from because it creates divergent histories that require a force push. My rule: revert on anything that's been pushed, reset only on strictly local work."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "You edited 5 files but only want to commit 2 of them. What's the correct git flow?",
      options: [
        { text: "A) git add . → git commit -m \"partial commit\"", isCorrect: false },
        { text: "B) git add file1.txt file2.txt → git commit -m \"message\"", isCorrect: true },
        { text: "C) git commit -m \"message\" → git add file1 file2", isCorrect: false },
        { text: "D) git push → git add .", isCorrect: false }
      ],
      explanation: "Stage selectively. git add . stages everything — dangerous when you have partial work. Always git add the specific files you want in that commit, then commit."
    },
    {
      num: 2,
      question: "What is the correct command to check what credentials aws CLI is using?",
      options: [
        { text: "A) aws credentials show", isCorrect: false },
        { text: "B) aws sts get-caller-identity", isCorrect: true },
        { text: "C) aws iam whoami", isCorrect: false },
        { text: "D) cat /etc/aws/config", isCorrect: false }
      ],
      explanation: "aws sts get-caller-identity tells you exactly which IAM user or role the CLI is authenticated as. Use this whenever you're unsure if your credentials are correctly configured."
    },
    {
      num: 3,
      question: "A teammate accidentally committed their AWS secret key to GitHub. What is the immediate first action?",
      options: [
        { text: "A) Delete the commit with git reset and push", isCorrect: false },
        { text: "B) Make the repo private", isCorrect: false },
        { text: "C) Revoke/delete the key in IAM console immediately, then clean git history", isCorrect: true },
        { text: "D) Email GitHub support", isCorrect: false }
      ],
      explanation: "The key was already exposed the moment it was pushed — bots scrape GitHub in real time. Making the repo private or deleting the commit does NOT help after it's public. Revoke the key first (in IAM), then clean history. The key is already compromised."
    },
    {
      num: 4,
      question: "What does git pull do?",
      options: [
        { text: "A) Sends your local commits to the remote repository", isCorrect: false },
        { text: "B) Fetches changes from the remote and merges them into your local branch", isCorrect: true },
        { text: "C) Creates a new branch from remote", isCorrect: false },
        { text: "D) Pulls all branches from GitHub", isCorrect: false }
      ],
      explanation: "git pull = git fetch (download remote changes) + git merge (apply them). Used every morning on a team project to get your colleagues' changes before you start working."
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
    }
  ],
  github: {
    filename: "devops-notes/day-02/README.md",
    commitMessage: "docs: Add Day 02 notes — Git workflow and AWS CLI setup",
    template: `# Day 02 — Git Workflow + AWS CLI Setup
**Date:** YYYY-MM-DD | **Status:** ✅ Complete | **Difficulty:** Beginner+

---

## 🎯 What I Learned Today
- Git three-area model: working directory → staging → repository
- The full commit cycle: add → commit → push
- Why root AWS credentials are dangerous and how IAM solves it
- AWS CLI installation and aws configure setup
- Set up CloudWatch billing alarms and AWS budgets for cost alerts
- Git branching model (checkout, merge, stash, revert, and logging)
- How named profiles protect credentials in AWS CLI config

## ⌨️ Git Commands Reference

\`\`\`bash
git init                          # Start a new repo
git checkout -b feature/name      # Create and switch branch
git stash && git stash pop        # Shelve and restore work
git revert COMMIT                 # Safe rollback
git log --oneline --graph --all   # View branches visually
\`\`\`

## ☁️ AWS Commands Reference

\`\`\`bash
aws configure --profile learning  # Named profile configuration
export AWS_PROFILE=learning       # Set active CLI profile
aws cloudwatch put-metric-alarm   # Set up billing alarm (in us-east-1!)
aws budgets create-budget         # Create monthly budget
aws sts get-caller-identity       # Check active user and account ID
\`\`\`

## 🔐 Security Decisions Made Today
- Created IAM user with AdministratorAccess for daily use
- Enabled MFA on root account
- Added .gitignore with *.pem, .env, *.log before first commit
- Configured CloudWatch billing alarm at $10 threshold for cost safety

## 🐛 Issues Hit Today
| Issue | Fix |
|-------|-----|
| git push Auth Error | Personal Access Token (PAT) used instead of password |
| AWS CLI Auth Failure | Configured default profile vs learning profile mismatch fixed |

## 📈 Tomorrow (Day 3)
Launching EC2 via CLI, configuring security groups, deploying a live web server`
  },
  pdfUrl: '/pdfs/day2.pdf',
  images: [
    {
      url: '/images/git_workflows_chart.png',
      caption: 'Git Workflows, Branching, Stash, and Safe Undo'
    }
  ]
};
