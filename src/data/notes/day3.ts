import { BootcampDay } from './types';

export const day3: BootcampDay = {
  day: 3,
  title: "EC2: Launch → Configure → Deploy Web Server",
  subtitle: "Launch EC2 via CLI, configure security groups, install nginx, deploy custom HTML, and verify publicly.",
  color: "#ff85e0",
  trainerNote: "Deploying your first web server to the public internet is a major milestone. If your security group isn't opened on port 80, the browser will timeout. In DevOps, networking issues account for 70% of deployment bugs.",
  engineerNote: "I still remember the first time I showed my parents a page running on a server I configured. That 'it's alive' feeling is what keeps you coding when the logs are full of errors.",
  goal: {
    icon: "🎯",
    title: "Day 3 Goal",
    description: "By the end of Day 3 you have launched an EC2 instance using the AWS CLI (not the GUI), configured a security group, SSHed in, installed nginx, and served a real web page to the public internet. You will point someone to your EC2's IP and they will see your page. This is your first \"it's live\" moment."
  },
  schedule: [
    {
      time: "09:00 – 09:30",
      phase: "REVIEW",
      activity: "Day 2 recap — git cycle without notes",
      why: "From memory: init a repo, commit a file, push to GitHub. If you need notes, spend another 20 mins drilling the git cycle before proceeding."
    },
    {
      time: "09:30 – 10:30",
      phase: "THEORY",
      activity: "EC2, VPC, Security Groups, and Networking Basics",
      why: "How EC2 connects to the internet. What a Security Group is and why it's the first thing you check when a deployment isn't working. Inbound vs outbound rules. Public IP vs Elastic IP."
    },
    {
      time: "10:30 – 10:45",
      phase: "BREAK",
      activity: "Short Break",
      why: "Mandatory rest block."
    },
    {
      time: "10:45 – 12:30",
      phase: "HANDS-ON",
      activity: "Launch EC2 via AWS CLI, SSH in, install nginx",
      why: "No GUI today. Everything from the terminal. This is how it's done in real DevOps: the console is for reading, the CLI is for doing."
    },
    {
      time: "12:30 – 13:15",
      phase: "BREAK",
      activity: "Lunch Break",
      why: "Step away from the screen."
    },
    {
      time: "13:15 – 14:30",
      phase: "HANDS-ON",
      activity: "Configure nginx, write custom HTML, verify live",
      why: "Edit nginx config. Serve your own HTML page. Hit the public IP in a browser and see it work. This is your first live deployment."
    },
    {
      time: "14:30 – 15:30",
      phase: "DEBUGGING",
      activity: "Deliberate break-and-fix exercise",
      why: "I'll tell you exactly what to break. You fix it using the debug tree. This simulates 40% of real DevOps work."
    },
    {
      time: "15:30 – 15:45",
      phase: "BREAK",
      activity: "Short Break",
      why: "Mental rest before capstone."
    },
    {
      time: "15:45 – 16:45",
      phase: "PROJECT",
      activity: "Mini Project: Automated deployment script",
      why: "Combine Day 1 (bash scripting) + Day 2 (git) + Day 3 (EC2 + nginx) into one script that deploys a web page from a git repo."
    },
    {
      time: "16:45 – 17:00",
      phase: "DOCUMENT",
      activity: "Day 3 notes + Week 1 reflection",
      why: "Summarize Week 1 progression."
    }
  ],
  concepts: [
    {
      icon: "🌐",
      title: "Security Groups — The First Debugging Stop",
      description: "A security group is EC2's firewall. It controls which traffic can reach your instance. Inbound rules = who can connect to you. Outbound rules = what your instance can connect to. By default: only port 22 (SSH) is open.",
      analogy: "A building's door security list. Port 22 (SSH) = staff entrance. Port 80 (HTTP) = public entrance. If you forget to open port 80, no browser can reach your web server — and that's the #1 mistake on Day 3."
    },
    {
      icon: "🏷",
      title: "Public IP vs Elastic IP",
      description: "When you stop and start an EC2, the public IP changes. An Elastic IP is a static IP that stays assigned to your instance. For learning, the dynamic public IP is fine. For production, you'd use an Elastic IP or a load balancer DNS name.",
      analogy: "Dynamic IP = a rental car that's a different car every morning. Elastic IP = your own car with a fixed number plate."
    },
    {
      icon: "🔄",
      title: "User Data — EC2 Launch Scripts",
      description: "You can pass a shell script to EC2 at launch time. It runs as root the very first boot. This is how DevOps engineers automate server setup — no manual SSHing and installing. This is the seed of configuration management.",
      analogy: "Like writing instructions on a sticky note that the server reads and executes the moment it wakes up for the first time."
    },
    {
      icon: "🕸",
      title: "Nginx — What a Web Server Does",
      description: "Nginx is a web server. It listens on port 80 (HTTP) or 443 (HTTPS). When a browser requests your IP, nginx receives the request, finds the right HTML file, and sends it back. Config lives at /etc/nginx/sites-available/.",
      analogy: "A restaurant host. The browser is the customer. Nginx is the host who greets them, checks which table (URL path) they want, and delivers the right dish (HTML file)."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 2,
      sessionTitle: "Launch EC2 via AWS CLI",
      sections: [
        {
          label: "Step 1: Find the right AMI (Ubuntu 22.04)",
          lines: [
            { type: 'cmd', prompt: "$", text: "aws ec2 describe-images \\\n  --owners amazon \\\n  --filters \"Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*\" \\\n  --query 'sort_by(Images,&CreationDate)[-1].ImageId' \\\n  --output text" },
            { type: 'ok', text: "ami-0a1234567890abcde" },
            { type: 'comment', text: "Save this AMI ID — you'll use it in the next command" }
          ]
        },
        {
          label: "Step 2: Create a key pair for this EC2",
          lines: [
            { type: 'cmd', prompt: "$", text: "aws ec2 create-key-pair \\\n  --key-name devops-day3-key \\\n  --query 'KeyMaterial' \\\n  --output text > devops-day3-key.pem" },
            { type: 'cmd', prompt: "$", text: "chmod 400 devops-day3-key.pem" },
            { type: 'comment', text: "chmod 400 immediately — SSH won't work without it" }
          ]
        },
        {
          label: "Step 3: Create a Security Group",
          lines: [
            { type: 'cmd', prompt: "$", text: "aws ec2 create-security-group \\\n  --group-name devops-web-sg \\\n  --description \"Security group for DevOps learning web server\"" },
            { type: 'output', text: "{\n    \"GroupId\": \"sg-0a1234567890abcde\"\n}" },
            { type: 'comment', text: "Save the GroupId" },
            { type: 'cmd', prompt: "$", text: "aws ec2 authorize-security-group-ingress \\\n  --group-id sg-0a1234567890abcde \\\n  --protocol tcp --port 22 --cidr 0.0.0.0/0" },
            { type: 'comment', text: "Port 22 = SSH" },
            { type: 'cmd', prompt: "$", text: "aws ec2 authorize-security-group-ingress \\\n  --group-id sg-0a1234567890abcde \\\n  --protocol tcp --port 80 --cidr 0.0.0.0/0" },
            { type: 'comment', text: "Port 80 = HTTP web traffic — CRITICAL for your web server" }
          ]
        },
        {
          label: "Step 4: Launch the Instance",
          lines: [
            { type: 'cmd', prompt: "$", text: "aws ec2 run-instances \\\n  --image-id ami-0a1234567890abcde \\\n  --instance-type t2.micro \\\n  --key-name devops-day3-key \\\n  --security-group-ids sg-0a1234567890abcde \\\n  --count 1 \\\n  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=devops-day3-webserver}]'" },
            { type: 'output', text: "{\n    \"Instances\": [{\n        \"InstanceId\": \"i-0a1234567890abcde\",\n        \"State\": {\"Name\": \"pending\"},\n        ...\n    }]\n}" },
            { type: 'cmd', prompt: "$", text: "aws ec2 describe-instances \\\n  --instance-ids i-0a1234567890abcde \\\n  --query 'Reservations[0].Instances[0].PublicIpAddress' \\\n  --output text" },
            { type: 'ok', text: "3.250.xxx.xxx" },
            { type: 'comment', text: "Wait 1-2 minutes for instance to reach \"running\" state first" }
          ]
        },
        {
          label: "Step 5: SSH In and Install nginx",
          lines: [
            { type: 'cmd', prompt: "$", text: "ssh -i devops-day3-key.pem ubuntu@3.250.xxx.xxx" },
            { type: 'ok', text: "Welcome to Ubuntu 22.04.4 LTS" },
            { type: 'output', text: "ubuntu@ip-172-31-xx-xx:~$" },
            { type: 'cmd', prompt: "$", text: "sudo apt update && sudo apt install nginx -y" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl start nginx" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl enable nginx" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl status nginx" },
            { type: 'ok', text: "● nginx.service - A high performance web server and a reverse proxy server" },
            { type: 'ok', text: "   Active: active (running)" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 2,
      sessionTitle: "Deploy Your Web Page",
      sections: [
        {
          label: "Create Your Web Page",
          lines: [
            { type: 'cmd', prompt: "$", text: "ls /var/www/html/" },
            { type: 'output', text: "index.nginx-debian.html" },
            { type: 'comment', text: "This is the default nginx page. Replace it with yours." },
            { type: 'cmd', prompt: "$", text: "sudo nano /var/www/html/index.html" },
            { type: 'comment', text: "Inside nano, type your custom HTML code" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl reload nginx" },
            { type: 'comment', text: "reload applies config changes without fully restarting (zero downtime)" },
            { type: 'cmd', prompt: "$", text: "curl http://localhost" },
            { type: 'comment', text: "Test from the server itself" },
            { type: 'ok', text: "<!DOCTYPE html><html><head><title>My DevOps Server</title></head>..." }
          ]
        },
        {
          label: "Verify From the Public Internet",
          lines: [
            { type: 'comment', text: "Open a browser on your laptop. Type: http://YOUR_EC2_PUBLIC_IP" },
            { type: 'comment', text: "You should see your web page. If you don't, go to the debug tree." },
            { type: 'cmd', prompt: "$", text: "sudo tail -f /var/log/nginx/access.log" },
            { type: 'comment', text: "Watch live requests" },
            { type: 'output', text: "198.51.100.2 - - [02/Jun/2026:14:30:01 +0000] \"GET / HTTP/1.1\" 200 612" },
            { type: 'comment', text: "200 = success! Every request logged with status code." },
            { type: 'comment', text: "404 = file not found. 403 = forbidden. 500 = server error. Know these." }
          ]
        },
        {
          label: "Deliberate Break-and-Fix Exercise",
          lines: [
            { type: 'comment', text: "BREAK IT: Stop nginx and try to access the page" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl stop nginx" },
            { type: 'cmd', prompt: "$", text: "curl http://localhost" },
            { type: 'err', text: "curl: (7) Failed to connect to localhost port 80: Connection refused" },
            { type: 'comment', text: "Browser would show: \"This site can't be reached\"" },
            { type: 'comment', text: "FIX IT — using the debug process, not by guessing:" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl status nginx" },
            { type: 'comment', text: "Step 1: check service status" },
            { type: 'err', text: "● nginx.service ... inactive (dead)" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl start nginx" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl status nginx" },
            { type: 'ok', text: "Active: active (running)" },
            { type: 'comment', text: "BREAK IT AGAIN: Introduce a syntax error in nginx config" },
            { type: 'cmd', prompt: "$", text: "sudo nano /etc/nginx/nginx.conf" },
            { type: 'comment', text: "Delete a semicolon somewhere. Save. Then:" },
            { type: 'cmd', prompt: "$", text: "sudo nginx -t" },
            { type: 'err', text: "nginx: [emerg] unexpected \"}\" in /etc/nginx/nginx.conf:65" },
            { type: 'comment', text: "nginx -t = test config WITHOUT restarting. Always run this before reload/restart." },
            { type: 'comment', text: "Fix the error in nano, run nginx -t again until it says:" },
            { type: 'ok', text: "nginx: configuration file /etc/nginx/nginx.conf test is successful" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl reload nginx" }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "Nginx Not Serving in Browser — Full Debug Flow",
      steps: [
        {
          num: 1,
          title: "Check if nginx is actually running",
          description: "The most common cause. The service stopped or was never started.",
          cmd: "sudo systemctl status nginx"
        },
        {
          num: 2,
          title: "Check Security Group allows port 80",
          description: "Second most common cause. You might have only opened port 22.",
          cmd: "aws ec2 describe-security-groups --group-ids sg-YOUR_ID"
        },
        {
          num: 3,
          title: "Test from inside the server first",
          description: "Isolates whether it's nginx or network.",
          cmd: "curl http://localhost"
        },
        {
          num: 4,
          title: "Check nginx error logs",
          description: "Always look at logs when something fails. This is the universal debugging principle.",
          cmd: "sudo tail -50 /var/log/nginx/error.log"
        },
        {
          num: 5,
          title: "Check nginx config is valid",
          description: "A syntax error silently breaks nginx on reload.",
          cmd: "sudo nginx -t"
        },
        {
          num: 6,
          title: "Check if something else is using port 80",
          description: "Apache might be installed alongside nginx, or another service grabbed the port.",
          cmd: "sudo ss -tlnp | grep :80"
        },
        {
          num: 7,
          title: "Verify EC2 public IP is correct",
          description: "If you stopped and restarted, the IP changed.",
          cmd: "aws ec2 describe-instances --query 'Reservations[0].Instances[0].PublicIpAddress' --output text"
        }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Using the browser IP as https:// when you haven't set up SSL",
      description: "You set up port 80 (HTTP). The browser defaults to https:// which is port 443. It will refuse because you haven't configured SSL certificates. Always start with http://.",
      fix: "Fix: Explicitly type http://YOUR_IP (not https). SSL comes in Week 3 with Let's Encrypt."
    },
    {
      mistake: "Editing the default nginx config directly instead of creating a site file",
      description: "Modifying /etc/nginx/nginx.conf directly for site content is the wrong place. nginx has a sites-available / sites-enabled pattern for a reason: multiple sites, clean separation.",
      fix: "Fix: For now, edit /var/www/html/index.html. Week 2 covers creating proper site configs in sites-available."
    },
    {
      mistake: "Restarting nginx instead of reloading after a config change",
      description: "sudo systemctl restart nginx drops all active connections (briefly). sudo systemctl reload nginx applies config changes with zero downtime. In production, this matters.",
      fix: "Fix: Use reload for config changes. Reserve restart for major failures or when reload fails."
    },
    {
      mistake: "Forgetting --tag-specifications when launching EC2 via CLI",
      description: "Without a Name tag your EC2 instance has no label in the console. You'll launch 3 instances over 90 days and can't tell which is which.",
      fix: "Fix: Always add a Name tag at launch. It costs nothing and saves enormous confusion."
    },
    {
      mistake: "Not stopping the practice EC2 at end of Day 3",
      description: "t2.micro is free tier but only for 750 hours/month. Running multiple instances or forgetting to stop burns through your free hours. Also: a running server with port 80 open is a security exposure.",
      fix: "Fix: aws ec2 stop-instances --instance-ids i-YOUR_ID at the end of every session. Terminate at end of week if you don't need it."
    }
  ],
  project: {
    tag: "📁 Day 3 Mini Project — Week 1 Capstone",
    title: "deploy.sh — One Script That Deploys Your Web Page From Git",
    timeEstimate: "⏱ ~75 minutes",
    goal: "Write a script that, when run on a fresh Ubuntu EC2, installs nginx, clones your GitHub repo, and copies the HTML file to serve it. This is a primitive version of what CI/CD pipelines do — it pulls latest code and deploys it. This script belongs in your portfolio.",
    checklist: [
      "Create deploy.sh in your GitHub repo at /scripts/deploy.sh",
      "Script must: apt update, install nginx, install git",
      "Clone your devops-90days repo from GitHub into /var/www/",
      "Copy the HTML file from the repo into /var/www/html/",
      "Start and enable nginx",
      "Print the server's public IP so you know where to look",
      "Test: run it on a fresh EC2 instance — the page must be live when script ends",
      "Commit the script to GitHub with message \"feat: Add automated web deployment script\""
    ],
    codeBlock: {
      title: "deploy.sh — Build This File",
      lines: [
        "#!/bin/bash",
        "set -e",
        "set -o pipefail",
        "# pipefail: if any command in a pipe fails, the whole script fails",
        "",
        "REPO_URL=\"https://github.com/YOURUSERNAME/devops-90days.git\"",
        "WEB_ROOT=\"/var/www/html\"",
        "CLONE_DIR=\"/var/www/devops-90days\"",
        "",
        "echo \"==============================\"",
        "echo \"  DevOps Deployment Script\"",
        "echo \"  $(date)\"",
        "echo \"==============================\"",
        "",
        "echo \"[1/5] Updating packages...\"",
        "sudo apt update -qq",
        "",
        "echo \"[2/5] Installing nginx and git...\"",
        "sudo apt install -y nginx git",
        "",
        "echo \"[3/5] Cloning repository...\"",
        "if [ -d \"$CLONE_DIR\" ]; then",
        "  echo \"  Repo exists, pulling latest...\"",
        "  cd \"$CLONE_DIR\" && git pull",
        "else",
        "  sudo git clone \"$REPO_URL\" \"$CLONE_DIR\"",
        "fi",
        "",
        "echo \"[4/5] Deploying web files...\"",
        "sudo cp \"$CLONE_DIR\"/day-03/index.html \"$WEB_ROOT/index.html\"",
        "",
        "echo \"[5/5] Starting nginx...\"",
        "sudo systemctl enable nginx",
        "sudo systemctl restart nginx",
        "",
        "PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)",
        "echo \"==============================\"",
        "echo \"✓ Deployment complete!\"",
        "echo \"  Visit: http://$PUBLIC_IP\"",
        "echo \"==============================\""
      ]
    },
    expectedOutput: "==============================\n  DevOps Deployment Script\n  Tue Jun 2 16:45:00 UTC 2026\n==============================\n[1/5] Updating packages...\n[2/5] Installing nginx and git...\n[3/5] Cloning repository...\n[4/5] Deploying web files...\n[5/5] Starting nginx...\n==============================\n✓ Deployment complete!\n  Visit: http://3.250.xxx.xxx\n=============================="
  },
  interview: [
    {
      question: "What is a security group in AWS?",
      answer: "A security group is a virtual firewall that controls inbound and outbound traffic for EC2 instances. Inbound rules define what traffic can reach the instance — I always need port 22 open for SSH. If I'm running a web server, I also open port 80 for HTTP and port 443 for HTTPS. Outbound rules control what the instance can connect to — by default all outbound traffic is allowed. Security groups are stateful, meaning if I allow an inbound request, the response traffic is automatically allowed without needing an explicit outbound rule. This is different from network ACLs, which are stateless. Security groups are the first place I check when a service isn't reachable from outside — in about 60% of cases, a missing inbound rule is the problem."
    },
    {
      question: "What does nginx do and how did you deploy a web page with it?",
      answer: "Nginx is a high-performance web server and reverse proxy. In its simplest use case — which is what I did on Day 3 of my training — it serves static HTML files. I installed it on an EC2 instance, placed my HTML file in /var/www/html/, and nginx automatically served it to any browser that hit the instance's public IP on port 80. I configured the security group to allow port 80 inbound. To verify it was working I first used curl from inside the server to isolate nginx itself, then hit the public IP from my laptop's browser. I also learned that sudo nginx -t tests config syntax before applying it — you should always run that before a reload to avoid taking a site down with a config error."
    },
    {
      question: "Describe a deployment you've done — even a simple one.",
      answer: "I wrote a bash script that automates the full deployment of a web page to a fresh EC2 instance. It updates the package list, installs nginx and git, clones a GitHub repository, copies the HTML files to the nginx web root, then starts and enables nginx so it survives reboots. At the end it fetches the EC2's public IP from the instance metadata service and prints the URL. This script means I can take a brand new EC2 from launch to serving a web page in under 3 minutes without touching the AWS console. It's a simplified version of what CI/CD pipelines do at scale — the pipeline would also run tests and handle rollbacks, but the core concept is the same: pull code from a repository and deploy it to a server."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "Your web page is not loading in the browser. nginx status shows \"active (running)\". What is the FIRST thing you check next?",
      options: [
        { text: "A) Check if the HTML file exists", isCorrect: false },
        { text: "B) Check if the Security Group has port 80 open for inbound traffic", isCorrect: true },
        { text: "C) Restart the EC2 instance", isCorrect: false },
        { text: "D) Reinstall nginx", isCorrect: false }
      ],
      explanation: "If nginx is running but the browser can't reach it, it's almost always the Security Group. Port 80 must have an inbound rule. Run: aws ec2 describe-security-groups and check IpPermissions for port 80."
    },
    {
      num: 2,
      question: "What is the difference between systemctl restart and systemctl reload for nginx?",
      options: [
        { text: "A) They do the same thing — both restart the process", isCorrect: false },
        { text: "B) restart stops and starts nginx (drops connections); reload applies new config without stopping (zero downtime)", isCorrect: true },
        { text: "C) reload is only for security updates", isCorrect: false },
        { text: "D) restart is faster than reload", isCorrect: false }
      ],
      explanation: "reload = graceful config update. Active connections finish normally while new config is applied. Always prefer reload for config changes in production. Use restart only when reload fails or for major version upgrades."
    },
    {
      num: 3,
      question: "You edited nginx.conf and ran sudo systemctl reload nginx but the site broke. What should you have done BEFORE the reload?",
      options: [
        { text: "A) Backed up the config file", isCorrect: false },
        { text: "B) Run sudo nginx -t to test config syntax", isCorrect: true },
        { text: "C) Rebooted the server first", isCorrect: false },
        { text: "D) Checked the security group", isCorrect: false }
      ],
      explanation: "sudo nginx -t validates config syntax without touching the running nginx. If it reports an error, the file has a problem. Never reload nginx without testing first — a bad config can take the site down immediately."
    },
    {
      num: 4,
      question: "Inside your deploy.sh you want to check if a directory exists before cloning. Which bash check is correct?",
      options: [
        { text: "A) if exists \"$DIR\"; then", isCorrect: false },
        { text: "B) if [ -d \"$DIR\" ]; then", isCorrect: true },
        { text: "C) if directory \"$DIR\"; then", isCorrect: false },
        { text: "D) if file \"$DIR\"; then", isCorrect: false }
      ],
      explanation: "-d tests for directory. -f tests for file. -e tests for either. [ -d \"$DIR\" ] is the correct bash syntax for directory existence check. Always quote variables in bash — unquoted paths with spaces break scripts."
    },
    {
      num: 5,
      question: "Where does nginx serve files from by default?",
      options: [
        { text: "A) /home/ubuntu/www/", isCorrect: false },
        { text: "B) /etc/nginx/html/", isCorrect: false },
        { text: "C) /var/www/html/", isCorrect: true },
        { text: "D) /usr/share/nginx/", isCorrect: false }
      ],
      explanation: "/var/www/html/ is the default nginx web root on Ubuntu. The config at /etc/nginx/sites-available/default points to this path. When you replace index.html here, nginx serves your file immediately after reload."
    }
  ],
  github: {
    filename: "devops-notes/day-03/README.md",
    commitMessage: "docs: Add Day 03 notes — EC2 launch and nginx deployment",
    template: `# Day 03 — EC2 Launch + nginx Deployment
**Date:** YYYY-MM-DD | **Status:** ✅ Complete | **Difficulty:** Intermediate
![Live Server](https://img.shields.io/badge/status-deployed-brightgreen)

---

## 🎯 What I Deployed
- Launched EC2 (Ubuntu 22.04, t2.micro) via AWS CLI — no console GUI
- Configured security group with ports 22 and 80
- Installed and started nginx
- Served a live web page at: http://[EC2-PUBLIC-IP]
- Created deploy.sh automation script

## ⌨️ AWS CLI Commands Used Today

\`\`\`bash
# Find Ubuntu AMI
aws ec2 describe-images --owners amazon \\
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04*" \\
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text

# Create key pair
aws ec2 create-key-pair --key-name my-key --query 'KeyMaterial' --output text > my-key.pem
chmod 400 my-key.pem

# Create security group and open ports
aws ec2 create-security-group --group-name my-sg --description "Learning SG"
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 80 --cidr 0.0.0.0/0

# Launch instance
aws ec2 run-instances --image-id ami-xxx --instance-type t2.micro \\
  --key-name my-key --security-group-ids sg-xxx \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=webserver}]'

# Get public IP
aws ec2 describe-instances --instance-ids i-xxx \\
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text

# Stop when done (never leave running)
aws ec2 stop-instances --instance-ids i-xxx
\`\`\`

## 🐛 Errors I Hit and Fixed

| Error | Root Cause | Fix |
|-------|-----------|-----|
| Site not loading in browser | Port 80 not in Security Group | Added inbound rule for port 80 |
| nginx config broke after edit | Missing semicolon | sudo nginx -t → found error line → fixed it |

## 🔑 Key Concepts Understood
- Security Group = EC2's firewall. Port 80 must be open for web traffic.
- nginx serves from /var/www/html/ by default
- systemctl reload applies config without dropping connections
- sudo nginx -t = ALWAYS run before reload
- curl http://localhost = test nginx from inside before testing from browser

## 🏗 Mini Project: deploy.sh
- Location: /scripts/deploy.sh
- What it does: Full automated deployment from git clone to live nginx page
- Live URL tested: http://[EC2-IP] ✅`
  }
};
