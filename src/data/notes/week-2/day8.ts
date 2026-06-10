import { BootcampDay } from '../types';

export const day8: BootcampDay = {
  "day": 8,
  "title": "Jenkins — Install, Configure, First Job",
  "subtitle": "EC2 Setup · Java 17 · Jenkins Install · Security Config · Plugin Install · Freestyle Job",
  "color": "#d33833",
  "trainerNote": "Jenkins is the engine of enterprise CI/CD. Focus on security and locking down ports from day one, not just getting builds to run.",
  "engineerNote": "Run Jenkins on a t2.medium. A t2.micro will run out of memory and fail silently, wasting hours of your time debugging OOM errors.",
  "goal": {
    "icon": "🎯",
    "title": "🎯 Day 8 Goal",
    "description": "By end of Day 8: Jenkins is running on your EC2, secured with a proper admin password, essential plugins installed, and you have run your first successful Freestyle job that clones a GitHub repo and prints \"BUILD SUCCESS\". Expected output: Jenkins UI accessible at http://YOUR_EC2_IP:8080, first job green."
  },
  "schedule": [
    {
      "time": "09:00–09:20",
      "phase": "RECALL",
      "activity": "Week 1 cold check",
      "why": "From memory: launch an EC2 via CLI, SSH in, run a bash script. If fuzzy, re-read Week 1 Day 3 before starting Jenkins."
    },
    {
      "time": "09:20–10:00",
      "phase": "THEORY",
      "activity": "What Jenkins is and where it sits in your roadmap",
      "why": "Jenkins as the orchestrator. Webhooks. Agents vs master. Freestyle jobs vs Pipeline jobs. Plugins. Why it runs on its own EC2 — not your dev machine."
    },
    {
      "time": "10:00–10:15",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "10:15–12:00",
      "phase": "INSTALL",
      "activity": "Launch t2.medium EC2 + Install Java 17 + Install Jenkins",
      "why": "Every command explained. Jenkins installs as a systemd service — it starts on boot automatically after this session."
    },
    {
      "time": "12:00–12:45",
      "phase": "BREAK",
      "activity": "Lunch",
      "why": ""
    },
    {
      "time": "12:45–14:15",
      "phase": "CONFIGURE",
      "activity": "Jenkins initial setup wizard + security + plugins",
      "why": "Unlock Jenkins, create admin user, install recommended + key plugins, configure security realm. Do not skip the security steps."
    },
    {
      "time": "14:15–15:30",
      "phase": "HANDS-ON",
      "activity": "First Freestyle Job — clone GitHub repo and echo build info",
      "why": "Create job, configure GitHub source, add a shell build step, run it, read the console output. Understand every section of the job config."
    },
    {
      "time": "15:30–15:45",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "15:45–16:45",
      "phase": "PROJECT",
      "activity": "Mini Project: Freestyle job that clones your devops-90days repo",
      "why": ""
    },
    {
      "time": "16:45–17:00",
      "phase": "COMMIT",
      "activity": "Day 8 notes + quiz + commit",
      "why": ""
    }
  ],
  "concepts": [
    {
      "icon": "🏗",
      "title": "What Jenkins Actually Is",
      "description": "Jenkins is a self-hosted automation server. It listens for triggers (a push to GitHub, a timer, a manual click) and then runs your pipeline steps in sequence. It is the conductor — Maven, SonarQube, Docker are the musicians. Jenkins tells each one when to play.",
      "analogy": "\"Jenkins is a CI server that automates the build, test, and deployment pipeline. It's triggered by a webhook from GitHub and orchestrates every downstream tool.\""
    },
    {
      "icon": "🔌",
      "title": "Jenkins Plugins",
      "description": "Jenkins is minimal out of the box. Almost everything useful — Git integration, Maven support, SonarQube scanning, JFrog publish — is a plugin. Plugins are installed from the Jenkins UI or CLI. Each adds new job steps, UI sections, or integrations.",
      "analogy": "Install only what you need. Too many plugins slow Jenkins, cause conflicts, and create security exposure. Your roadmap needs: Git, Maven Integration, SonarQube Scanner, Artifactory, Docker Pipeline."
    },
    {
      "icon": "🎯",
      "title": "Freestyle Job vs Pipeline Job",
      "description": "Freestyle Job: configured entirely in the UI. Click-and-configure. Good for learning concepts. Not version-controlled. Pipeline Job: driven by a Jenkinsfile in your repo. Code-as-configuration. Version-controlled. Reproducible. This is what you use in production and what Day 9 covers.",
      "analogy": "Learn Freestyle today to understand Jenkins concepts. Use Pipeline/Jenkinsfile from Day 9 onward for everything real."
    },
    {
      "icon": "🌐",
      "title": "Webhook Trigger",
      "description": "A webhook is a HTTP POST that GitHub sends to Jenkins whenever code is pushed. Jenkins receives it, identifies which job to trigger, and starts the build. This is how \"push code → build starts automatically\" works. Requires Jenkins to be publicly reachable (your EC2 has a public IP).",
      "analogy": "The webhook is the heartbeat of your roadmap pipeline. Developer pushes code → GitHub fires webhook → Jenkins triggers → entire pipeline runs. Day 9 sets this up."
    },
    {
      "icon": "🔐",
      "title": "Jenkins Security",
      "description": "Jenkins out of the box is insecure — anonymous users can trigger builds. You must: create an admin account, enable authentication, use matrix-based security for fine-grained control, and use credentials manager (not plaintext) for passwords and tokens.",
      "analogy": "An unsecured Jenkins exposed to the internet will be found and abused within hours. Port 8080 on EC2 with no auth = remote code execution waiting to happen."
    },
    {
      "icon": "📋",
      "title": "Build Console Output",
      "description": "Every Jenkins build has a Console Output log — the full stdout/stderr of every step that ran. This is your primary debugging tool. Any build failure: first action is click Console Output. The error is always there.",
      "analogy": "New Jenkins users waste time looking at the job config when the build fails. The answer is always in Console Output. Read it completely before changing anything."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 5,
      "sessionTitle": "STEP 1 — Launch t2.medium EC2 for Jenkins (from your laptop)",
      "sections": [
        {
          "label": "Launch the Jenkins EC2 — t2.medium, ports 22 and 8080 open",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "JENKINS_SG=$(aws ec2 create-security-group \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--group-name jenkins-sg \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--description \"Jenkins CI server security group\" \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--query 'GroupId' --output text)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "aws ec2 authorize-security-group-ingress --group-id $JENKINS_SG --protocol tcp --port 22 --cidr 0.0.0.0/0"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "aws ec2 authorize-security-group-ingress --group-id $JENKINS_SG --protocol tcp --port 8080 --cidr 0.0.0.0/0"
            },
            {
              "type": "output",
              "text": "# Port 8080 = Jenkins UI. Port 22 = SSH. Both need to be publicly accessible."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "AMI_ID=$(aws ec2 describe-images --owners amazon \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--filters \"Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*\" \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "JENKINS_ID=$(aws ec2 run-instances \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--image-id $AMI_ID \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--instance-type t2.medium \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--key-name YOUR_KEY_NAME \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--security-group-ids $JENKINS_SG \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=jenkins-server}]' \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--query 'Instances[0].InstanceId' --output text)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "JENKINS_IP=$(aws ec2 describe-instances --instance-ids $JENKINS_ID \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--query 'Reservations[0].Instances[0].PublicIpAddress' --output text)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo \"Jenkins will be at: http://$JENKINS_IP:8080\""
            },
            {
              "type": "ok",
              "text": "Jenkins will be at: http://3.250.xxx.xxx:8080"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "ssh -i YOUR_KEY.pem ubuntu@$JENKINS_IP"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 5,
      "sessionTitle": "STEP 2 — Install Java 17 (Jenkins requires it)",
      "sections": [
        {
          "label": "Now on the Jenkins EC2 — install Java 17 first",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt update && sudo apt upgrade -y"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt install -y openjdk-17-jdk"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "java -version"
            },
            {
              "type": "ok",
              "text": "openjdk version \"17.0.11\" 2024-04-16"
            },
            {
              "type": "ok",
              "text": "OpenJDK Runtime Environment (build 17.0.11+9-Ubuntu-1ubuntu2.22.04)"
            },
            {
              "type": "output",
              "text": "# Jenkins 2.x requires Java 17. Java 11 also works but 17 is recommended."
            },
            {
              "type": "output",
              "text": "# Do NOT use Java 8 — Jenkins has dropped support for it."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo \"JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64\" | sudo tee -a /etc/environment"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "source /etc/environment && echo \"JAVA_HOME: $JAVA_HOME\""
            },
            {
              "type": "ok",
              "text": "JAVA_HOME: /usr/lib/jvm/java-17-openjdk-amd64"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 3,
      "totalSessions": 5,
      "sessionTitle": "STEP 3 — Install Jenkins from Official Repo",
      "sections": [
        {
          "label": "Add Jenkins repository and install",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo \"deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "https://pkg.jenkins.io/debian-stable binary/\" | sudo tee \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "/etc/apt/sources.list.d/jenkins.list > /dev/null"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt update && sudo apt install -y jenkins"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl enable jenkins"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl start jenkins"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl status jenkins"
            },
            {
              "type": "ok",
              "text": "● jenkins.service - Jenkins Continuous Integration Server"
            },
            {
              "type": "ok",
              "text": "Active: active (running) since..."
            },
            {
              "type": "output",
              "text": "# Jenkins is now running. It takes 60-90 seconds to fully start after the service shows active."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
            },
            {
              "type": "ok",
              "text": "a3f4b12c8d9e0f1a2b3c4d5e6f7a8b9c"
            },
            {
              "type": "output",
              "text": "# Copy this password — you need it to unlock Jenkins in the browser"
            },
            {
              "type": "output",
              "text": "# Open browser: http://YOUR_EC2_IP:8080"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 4,
      "totalSessions": 5,
      "sessionTitle": "Install Additional Plugins via CLI (faster than UI)",
      "sections": [
        {
          "label": "Install roadmap-required plugins via Jenkins CLI",
          "lines": [
            {
              "type": "output",
              "text": "# Download Jenkins CLI jar first:"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "wget http://localhost:8080/jnlpJars/jenkins-cli.jar"
            },
            {
              "type": "output",
              "text": "# Set your admin credentials as variables (do not hardcode in scripts):"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "JENKINS_USER=\"admin\""
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "JENKINS_PASS=\"YOUR_ADMIN_PASSWORD\""
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "JENKINS_URL=\"http://localhost:8080\""
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "java -jar jenkins-cli.jar -s $JENKINS_URL -auth $JENKINS_USER:$JENKINS_PASS \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "install-plugin \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "git \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "maven-plugin \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "workflow-aggregator \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "pipeline-stage-view \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "github \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "sonar \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "-restart"
            },
            {
              "type": "ok",
              "text": "# Jenkins will restart after installing. Wait 60 seconds then refresh browser."
            },
            {
              "type": "output",
              "text": "# Plugin breakdown:"
            },
            {
              "type": "output",
              "text": "# git               → clone GitHub repos in jobs"
            },
            {
              "type": "output",
              "text": "# maven-plugin      → run Maven builds (Day 10)"
            },
            {
              "type": "output",
              "text": "# workflow-aggregator → Pipeline job type (Jenkinsfile support)"
            },
            {
              "type": "output",
              "text": "# pipeline-stage-view → visual stage diagram in Pipeline jobs"
            },
            {
              "type": "output",
              "text": "# github            → webhook integration with GitHub"
            },
            {
              "type": "output",
              "text": "# sonar             → SonarQube integration (Day 11)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl status jenkins # Verify restarted cleanly"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 5,
      "totalSessions": 5,
      "sessionTitle": "Configure Git in Jenkins — Required for All Jobs",
      "sections": [
        {
          "label": "Install Git on the EC2 and tell Jenkins where it is",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt install -y git"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git --version"
            },
            {
              "type": "ok",
              "text": "git version 2.43.0"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "which git"
            },
            {
              "type": "output",
              "text": "/usr/bin/git"
            },
            {
              "type": "output",
              "text": "# In Jenkins UI: Manage Jenkins → Tools → Git installations"
            },
            {
              "type": "output",
              "text": "# Name: Default   Path to Git executable: /usr/bin/git"
            },
            {
              "type": "output",
              "text": "# Save. Jenkins now knows where git is on this machine."
            }
          ]
        },
        {
          "label": "Add GitHub credentials to Jenkins (for private repos and webhooks)",
          "lines": [
            {
              "type": "output",
              "text": "# In Jenkins UI: Manage Jenkins → Credentials → System → Global credentials → Add Credentials"
            },
            {
              "type": "output",
              "text": "# Kind: Username with password"
            },
            {
              "type": "output",
              "text": "# Username: your GitHub username"
            },
            {
              "type": "output",
              "text": "# Password: your GitHub Personal Access Token (NOT your password)"
            },
            {
              "type": "output",
              "text": "# ID: github-credentials  (you will reference this ID in Jenkinsfiles)"
            },
            {
              "type": "output",
              "text": "# Description: GitHub PAT for pipeline access"
            },
            {
              "type": "output",
              "text": "# Save. Jenkins stores this encrypted — you never see it in plaintext again."
            }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "⚡ Jenkins UI Not Loading at :8080",
      "steps": [
        {
          "num": 1,
          "title": "Check Jenkins service is running",
          "description": "sudo systemctl status jenkins",
          "cmd": "sudo systemctl status jenkins"
        },
        {
          "num": 2,
          "title": "Check Jenkins actually started (takes 60-90s after service shows active)",
          "description": "sudo tail -f /var/log/jenkins/jenkins.log",
          "cmd": "sudo tail -f /var/log/jenkins/jenkins.log"
        },
        {
          "num": 3,
          "title": "Check security group allows port 8080 from 0.0.0.0/0",
          "description": "aws ec2 describe-security-groups --group-ids $JENKINS_SG | grep 8080",
          "cmd": "aws ec2 describe-security-groups --group-ids $JENKINS_SG | grep 8080"
        },
        {
          "num": 4,
          "title": "Check you are using the right instance type (t2.micro = insufficient memory)",
          "description": "aws ec2 describe-instances --instance-ids $JENKINS_ID --query 'Reservations[0].Instances[0].InstanceType'",
          "cmd": "aws ec2 describe-instances --instance-ids $JENKINS_ID --query 'Reservations[0].Instances[0].InstanceType'"
        }
      ]
    },
    {
      "title": "Common Errors & Troubleshooting",
      "steps": [
        {
          "num": 1,
          "title": "\"Out of memory\" or Jenkins constantly crashing",
          "description": "Cause: t2.micro doesn't have enough RAM for Jenkins under any build load | Fix: Stop instance → change instance type to t2.medium → start instance"
        },
        {
          "num": 2,
          "title": "Build fails: \"git: command not found\"",
          "description": "Cause: Git not installed on EC2 OR Jenkins Tools config doesn't point to git path | Fix: sudo apt install git -y → which git → set that path in Manage Jenkins → Tools → Git"
        },
        {
          "num": 3,
          "title": "\"Invalid credentials\" cloning from GitHub",
          "description": "Cause: GitHub credentials in Jenkins are wrong or PAT expired | Fix: Create new GitHub PAT with repo scope → update Jenkins credential → re-run job"
        },
        {
          "num": 4,
          "title": "Plugin install fails or Jenkins won't restart after plugins",
          "description": "Cause: Disk space or network issue during download | Fix: df -h to check disk space → sudo systemctl restart jenkins → retry install"
        }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Using t2.micro for Jenkins",
      "description": "Jenkins needs 2GB+ RAM for any real pipeline. t2.micro has 1GB. It will run Jenkins in idle but crash or hang the moment a Maven build starts. You will spend 2 hours debugging what is actually just an OOM kill.",
      "fix": "Always use t2.medium for Jenkins. Stop it when not studying to manage cost. This is non-negotiable."
    },
    {
      "mistake": "Skipping the security configuration",
      "description": "Jenkins with anonymous access enabled on a public EC2 means anyone on the internet can trigger your jobs, steal credentials, and execute code on your server. This happens within hours of exposure.",
      "fix": "In Manage Jenkins → Security: enable \"Jenkins' own user database\", disable \"Allow users to sign up\", set authorization to \"Logged-in users can do anything\". Never leave Jenkins open to anonymous users."
    },
    {
      "mistake": "Hardcoding passwords in build step shell scripts",
      "description": "echo \"password=mypassword123\" in a build step = that password is in every build log, visible to any Jenkins user with log access.",
      "fix": "Store all secrets in Jenkins Credentials Manager. Reference them in pipeline as credentials() binding. Never type a password in a build step."
    },
    {
      "mistake": "Not reading Console Output when a build fails",
      "description": "Jenkins users try random config changes when a build fails, hoping something works. 90% of the time the exact error is in the first 5 lines of Console Output.",
      "fix": "Build fails → click the build number → click Console Output → read the first red/error line. Fix that specific thing. No guessing."
    }
  ],
  "project": {
    "tag": "📁 Day 8 Project",
    "title": "Jenkins Running on EC2 — First Freestyle Job Green",
    "timeEstimate": "⏱ ~70 min",
    "goal": "Jenkins installed, secured, plugins loaded, and a Freestyle job cloning your devops-90days repo runs successfully. The Console Output shows your repo files and last 3 commits. This is your first CI run — simple but real.",
    "checklist": [
      "EC2 is t2.medium — verified via AWS console or CLI",
      "Java 17 installed: java -version shows openjdk 17",
      "Jenkins service running: sudo systemctl status jenkins shows active",
      "Jenkins UI accessible at http://EC2_IP:8080 with your admin login",
      "Plugins installed: git, maven-plugin, workflow-aggregator, github, sonar",
      "GitHub credentials stored in Jenkins Credentials Manager (not hardcoded)",
      "Freestyle job \"hello-jenkins\" clones your repo and shows BUILD SUCCESS",
      "Console Output shows: build number, workspace, git log, BUILD SUCCESS",
      "Screenshot the green build — first portfolio evidence of Jenkins"
    ]
  },
  "interview": [
    {
      "question": "\"What is Jenkins and where does it fit in a CI/CD pipeline?\"",
      "answer": "\"Jenkins is a self-hosted, open-source automation server written in Java. It sits at the centre of the CI/CD pipeline and acts as the orchestrator — it listens for triggers, typically a webhook from GitHub when code is pushed, and then runs a sequence of steps defined either in the UI (Freestyle jobs) or in a Jenkinsfile in the repository (Pipeline jobs). In my roadmap, Jenkins receives the GitHub webhook, then coordinates: Maven for building and testing the Java code, SonarQube for code quality scanning, JFrog Artifactory for storing the build artifact, Docker for creating the image, and Kubernetes for deployment. Jenkins doesn't do any of these itself — it calls each tool in sequence and passes the artifact from one stage to the next. If any stage fails, Jenkins stops the pipeline and marks the build as failed, so broken code never reaches production.\""
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "Why does Jenkins require at least 2GB RAM for a real CI pipeline?",
      "options": [
        {
          "text": "A) Jenkins is written inefficiently",
          "isCorrect": false
        },
        {
          "text": "B) Jenkins runs the JVM, manages multiple build processes, and Maven itself is memory-intensive — they all compete for RAM simultaneously",
          "isCorrect": true
        },
        {
          "text": "C) AWS charges more for smaller instances",
          "isCorrect": false
        },
        {
          "text": "D) It only needs 512MB in production",
          "isCorrect": false
        }
      ],
      "explanation": "Jenkins runs on the JVM (Java Virtual Machine) which itself uses 256–512MB. When a build runs, Maven launches another JVM process for the build. SonarQube analysis adds more. On a t2.micro with 1GB total, the OOM killer terminates processes randomly — causing mysterious build failures that are actually just memory starvation."
    },
    {
      "num": 2,
      "question": "What is the difference between a Freestyle job and a Pipeline job in Jenkins?",
      "options": [
        {
          "text": "A) Freestyle is faster; Pipeline is slower",
          "isCorrect": false
        },
        {
          "text": "B) Freestyle is configured in the UI (not version-controlled); Pipeline is driven by a Jenkinsfile in the repo (code as configuration, version-controlled)",
          "isCorrect": true
        },
        {
          "text": "C) Freestyle supports Docker; Pipeline does not",
          "isCorrect": false
        },
        {
          "text": "D) They are identical — just different names",
          "isCorrect": false
        }
      ],
      "explanation": "Freestyle jobs: click-and-configure in the UI. Easy to start, but config lives only in Jenkins — if Jenkins is wiped, the config is lost. Pipeline jobs: driven by a Jenkinsfile committed to your GitHub repo. The pipeline definition is version-controlled alongside the code. If Jenkins is wiped and rebuilt, just point it at the repo and the pipeline recreates itself. Always use Pipeline/Jenkinsfile in production."
    },
    {
      "num": 3,
      "question": "Where do you look first when a Jenkins build fails?",
      "options": [
        {
          "text": "A) Jenkins system logs (/var/log/jenkins/jenkins.log)",
          "isCorrect": false
        },
        {
          "text": "B) The job configuration page",
          "isCorrect": false
        },
        {
          "text": "C) The build's Console Output — the full stdout/stderr of every step that ran",
          "isCorrect": true
        },
        {
          "text": "D) The GitHub repository for recent commits",
          "isCorrect": false
        }
      ],
      "explanation": "Console Output (click build number → Console Output) shows every command executed and its output. The error is almost always clearly visible in red. Jenkins system logs are for Jenkins itself failing to start — not for build failures. This is the single most important Jenkins debugging habit."
    },
    {
      "num": 4,
      "question": "What is the initial admin password in Jenkins and where is it stored?",
      "options": [
        {
          "text": "A) It's \"admin\" by default",
          "isCorrect": false
        },
        {
          "text": "B) A randomly generated password stored at /var/lib/jenkins/secrets/initialAdminPassword on the server",
          "isCorrect": true
        },
        {
          "text": "C) It's emailed to you during installation",
          "isCorrect": false
        },
        {
          "text": "D) It's set during the apt install step",
          "isCorrect": false
        }
      ],
      "explanation": "Jenkins generates a random password on first install and writes it to /var/lib/jenkins/secrets/initialAdminPassword. You read it with sudo cat and paste it into the browser to unlock Jenkins. Once you create your admin user through the setup wizard, this file is no longer needed — but the admin user you create IS your permanent login."
    },
    {
      "num": 5,
      "question": "Why should you store GitHub credentials in Jenkins Credentials Manager instead of in build scripts?",
      "options": [
        {
          "text": "A) Build scripts don't support environment variables",
          "isCorrect": false
        },
        {
          "text": "B) Credentials Manager encrypts and masks secrets — they never appear in build logs or are visible to users browsing job configs",
          "isCorrect": true
        },
        {
          "text": "C) Credentials Manager is required for GitHub webhooks to work",
          "isCorrect": false
        },
        {
          "text": "D) Jenkins can't access GitHub without Credentials Manager",
          "isCorrect": false
        }
      ],
      "explanation": "Jenkins Credentials Manager stores secrets encrypted on disk. When used in a pipeline via credentials() binding, the secret value is masked in Console Output — shown as ****. If you hardcode a password in a shell script, it appears in plaintext in every build log, visible to any Jenkins user with read access to that job. Credentials Manager is not optional — it's mandatory for any production Jenkins instance."
    }
  ],
  "github": {
    "filename": "devops-90days/day-08/README.md",
    "commitMessage": "docs: Add Day 08 — Jenkins install on EC2, first freestyle job",
    "template": "# Day 08 — Jenkins Install + First Freestyle Job\n**Date:** YYYY-MM-DD | **Difficulty:** Medium | **Status:** ✅ Complete\n\n## Roadmap Position\nDeveloper → Git → GitHub → **[Jenkins ← HERE]** → Maven → SonarQube → JFrog → Docker → K8s → Prometheus → Grafana\n\n## What I Built\n- Jenkins running on EC2 t2.medium at http://EC2_IP:8080\n- Java 17 installed (Jenkins requirement)\n- Plugins: git, maven-plugin, workflow-aggregator, pipeline-stage-view, github, sonar\n- GitHub credentials stored in Credentials Manager (not hardcoded)\n- Freestyle job \"hello-jenkins\" clones devops-90days repo — BUILD SUCCESS ✓\n\n## Key Commands\n```bash\n# Check Jenkins status\nsudo systemctl status jenkins\n\n# View Jenkins logs (startup issues)\nsudo tail -f /var/log/jenkins/jenkins.log\n\n# Get initial admin password\nsudo cat /var/lib/jenkins/secrets/initialAdminPassword\n\n# Jenkins CLI (install plugins, etc.)\njava -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:PASSWORD COMMAND\n\n# Jenkins workspace location (where repo is cloned)\nls /var/lib/jenkins/workspace/JOB_NAME/\n```\n\n## Jenkins Environment Variables (available in every build)\n- BUILD_NUMBER — increments each build\n- JOB_NAME — name of the job\n- WORKSPACE — path where repo was cloned\n- BUILD_URL — full URL to this build's page\n- GIT_COMMIT — SHA of the commit that triggered the build\n\n## Key Mental Models\n- Jenkins = orchestrator. It doesn't build, test, or deploy — it calls tools that do.\n- Freestyle job = UI config (learning tool). Pipeline job = Jenkinsfile in repo (production).\n- Console Output = first debugging step. Always. Every time.\n- Credentials Manager = where all secrets live. Never in scripts.\n- t2.medium minimum. t2.micro = OOM kills on real builds.\n\n## Tomorrow — Day 9\nSpring Boot app as pipeline target. Write first Jenkinsfile. Pipeline job with stages. GitHub webhook trigger."
  },
  "pdfUrl": "/pdfs/day8.pdf",
  "images": []
};
