import { BootcampDay } from './types';

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
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 2,
      sessionTitle: "Git Setup and First Commits",
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
            { type: 'cmd', prompt: "$", text: "git config --list" },
            { type: 'comment', text: "Verify your settings" },
            { type: 'output', text: "user.name=Your Name" },
            { type: 'output', text: "user.email=your@email.com" },
            { type: 'output', text: "init.defaultBranch=main" }
          ]
        },
        {
          label: "Create Your First Repository",
          lines: [
            { type: 'cmd', prompt: "$", text: "mkdir ~/devops-90days && cd ~/devops-90days" },
            { type: 'cmd', prompt: "$", text: "git init" },
            { type: 'output', text: "Initialized empty Git repository in /home/ubuntu/devops-90days/.git/" },
            { type: 'cmd', prompt: "$", text: "mkdir day-01 day-02" },
            { type: 'cmd', prompt: "$", text: "touch README.md day-01/notes.md day-02/notes.md" },
            { type: 'cmd', prompt: "$", text: "echo \"# 90 Days DevOps Journey\" > README.md" },
            { type: 'cmd', prompt: "$", text: "echo \"## About\" >> README.md" },
            { type: 'cmd', prompt: "$", text: "echo \"Learning DevOps from zero. Documenting every day.\" >> README.md" },
            { type: 'cmd', prompt: "$", text: "git status" },
            { type: 'warn', text: "Untracked files:" },
            { type: 'output', text: "  README.md" },
            { type: 'output', text: "  day-01/" },
            { type: 'output', text: "  day-02/" },
            { type: 'comment', text: "Untracked = git sees them but isn't tracking changes yet" }
          ]
        },
        {
          label: "The Commit Cycle — Learn This Cold",
          lines: [
            { type: 'cmd', prompt: "$", text: "git add README.md" },
            { type: 'comment', text: "Stage ONE file" },
            { type: 'cmd', prompt: "$", text: "git status" },
            { type: 'ok', text: "Changes to be committed:" },
            { type: 'ok', text: "  new file: README.md" },
            { type: 'cmd', prompt: "$", text: "git add ." },
            { type: 'comment', text: "Stage ALL changes" },
            { type: 'cmd', prompt: "$", text: "git commit -m \"Day 01: Add initial project structure and README\"" },
            { type: 'output', text: "[main (root-commit) a3f4b12] Day 01: Add initial project structure and README" },
            { type: 'output', text: " 3 files changed, 4 insertions(+)" },
            { type: 'cmd', prompt: "$", text: "git log --oneline" },
            { type: 'comment', text: "See commit history" },
            { type: 'output', text: "a3f4b12 (HEAD -> main) Day 01: Add initial project structure and README" },
            { type: 'cmd', prompt: "$", text: "git log" },
            { type: 'comment', text: "Full detail version" },
            { type: 'output', text: "commit a3f4b12... (HEAD -> main)" },
            { type: 'output', text: "Author: Your Name <your@email.com>" },
            { type: 'output', text: "Date:   Tue Jun 2 14:30:00 2026" },
            { type: 'output', text: "    Day 01: Add initial project structure and README" }
          ]
        },
        {
          label: "Connect to GitHub and Push",
          lines: [
            { type: 'comment', text: "First: Create a new repo on github.com — click \"New repository\"" },
            { type: 'comment', text: "Name it: devops-90days | Set to Public | Do NOT add README (you have one)" },
            { type: 'cmd', prompt: "$", text: "git remote add origin https://github.com/YOURUSERNAME/devops-90days.git" },
            { type: 'cmd', prompt: "$", text: "git remote -v" },
            { type: 'comment', text: "Verify remote is set" },
            { type: 'output', text: "origin  https://github.com/YOURUSERNAME/devops-90days.git (fetch)" },
            { type: 'output', text: "origin  https://github.com/YOURUSERNAME/devops-90days.git (push)" },
            { type: 'cmd', prompt: "$", text: "git push -u origin main" },
            { type: 'comment', text: "First push: GitHub will ask for username + personal access token (NOT password)" },
            { type: 'comment', text: "Create token: GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)" },
            { type: 'comment', text: "Give it: repo scope. Copy the token — you only see it once." },
            { type: 'output', text: "Branch 'main' set up to track remote branch 'main' from 'origin'." },
            { type: 'ok', text: "Everything up-to-date" },
            { type: 'cmd', prompt: "$", text: "echo \"# Day 01 Notes\" >> day-01/notes.md" },
            { type: 'cmd', prompt: "$", text: "git add day-01/notes.md" },
            { type: 'cmd', prompt: "$", text: "git commit -m \"Day 01: Add day 1 notes file\"" },
            { type: 'cmd', prompt: "$", text: "git push" },
            { type: 'comment', text: "After first push, just git push works" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 2,
      sessionTitle: "AWS CLI Setup",
      sections: [
        {
          label: "Install AWS CLI v2 on EC2",
          lines: [
            { type: 'cmd', prompt: "$", text: "curl \"https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip\" -o \"awscliv2.zip\"" },
            { type: 'cmd', prompt: "$", text: "unzip awscliv2.zip" },
            { type: 'cmd', prompt: "$", text: "sudo ./aws/install" },
            { type: 'cmd', prompt: "$", text: "aws --version" },
            { type: 'ok', text: "aws-cli/2.17.0 Python/3.11.8 Linux/6.5.0 exe/x86_64" }
          ]
        },
        {
          label: "Configure with IAM User Credentials",
          lines: [
            { type: 'comment', text: "First: Go to IAM Console → Users → Your IAM user → Security credentials" },
            { type: 'comment', text: "Create Access Key → select \"CLI\" use case → download the CSV" },
            { type: 'cmd', prompt: "$", text: "aws configure" },
            { type: 'output', text: "AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE" },
            { type: 'output', text: "AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" },
            { type: 'output', text: "Default region name [None]: eu-west-1" },
            { type: 'comment', text: "Use your closest region: eu-west-1=Ireland, us-east-1=Virginia, ap-south-1=Mumbai" },
            { type: 'output', text: "Default output format [None]: json" },
            { type: 'cmd', prompt: "$", text: "aws sts get-caller-identity" },
            { type: 'comment', text: "Verify credentials work" },
            { type: 'output', text: "{\n    \"UserId\": \"AIDAIOSFODNN7EXAMPLE\",\n    \"Account\": \"123456789012\",\n    \"Arn\": \"arn:aws:iam::123456789012:user/devops-learner\"\n}" },
            { type: 'cmd', prompt: "$", text: "aws ec2 describe-instances --output table" },
            { type: 'comment', text: "List your EC2 instances" },
            { type: 'cmd', prompt: "$", text: "aws s3 ls" },
            { type: 'comment', text: "List your S3 buckets (empty if new account)" }
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

## ⌨️ Git Commands Reference

\`\`\`bash
git init                          # Start a new repo
git config --global user.name ""  # One-time setup
git status                        # Always check before add
git add filename                  # Stage specific file
git add .                         # Stage all changes (careful!)
git commit -m "type: description" # Create commit
git log --oneline                 # View commit history
git remote add origin URL          # Connect to GitHub
git push -u origin main           # First push (sets tracking)
git push                          # Subsequent pushes
git pull                          # Get teammate changes
\`\`\`

## ☁️ AWS Commands Reference

\`\`\`bash
aws configure                     # Set up credentials
aws sts get-caller-identity       # Verify who I'm authenticated as
aws ec2 describe-instances        # List EC2 instances
aws s3 ls                         # List S3 buckets
aws iam list-users                # List IAM users
\`\`\`

## 🔐 Security Decisions Made Today
- Created IAM user with AdministratorAccess for daily use
- Enabled MFA on root account
- Added .gitignore with *.pem, .env, *.log before first commit
- AWS credentials stored in ~/.aws/credentials (NOT in any code file)

## 🐛 Issues Hit Today
| Issue | Fix |
|-------|-----|
| [Write yours here] | [How you fixed it] |

## 📈 Tomorrow (Day 3)
Launching EC2 via CLI, configuring security groups, deploying a live web server`
  }
};
