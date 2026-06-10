import { BootcampDay } from '../types';

export const day9: BootcampDay = {
  "day": 9,
  "title": "Jenkinsfile + Pipeline Job + GitHub Webhook",
  "subtitle": "Spring Boot App · Declarative Pipeline · Stages · Jenkinsfile · Webhook Trigger · Pipeline View",
  "color": "#e040fb",
  "trainerNote": "UI-configured jobs are for amateurs. Real DevOps engineers write Pipelines as Code (declarative Jenkinsfiles) and version them in Git.",
  "engineerNote": "Declarative pipelines allow us to define environments and stages as code. Webhooks from GitHub ensure that every push runs this pipeline automatically.",
  "goal": {
    "icon": "🎯",
    "title": "🎯 Day 9 Goal",
    "description": "By end of Day 9: you have a Spring Boot Java app in your GitHub repo, a Jenkinsfile that defines a multi-stage pipeline (Checkout → Build → Test → Archive), a Pipeline job in Jenkins that reads that Jenkinsfile, and a GitHub webhook that triggers the pipeline automatically on every push. Expected output: push any code change → webhook fires → Jenkins pipeline runs all stages → green build in under 3 minutes."
  },
  "schedule": [
    {
      "time": "09:00–09:20",
      "phase": "RECALL",
      "activity": "Day 8 cold check",
      "why": "From memory: SSH to Jenkins EC2, run sudo systemctl status jenkins, open browser, create a new Freestyle job. If you need notes for this, do it before continuing."
    },
    {
      "time": "09:20–10:15",
      "phase": "THEORY",
      "activity": "Declarative Pipeline syntax + Jenkinsfile anatomy",
      "why": "pipeline block, agent, stages, stage, steps. The structure is rigid — understand it before writing it. One syntax error breaks the entire file."
    },
    {
      "time": "10:15–10:30",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "10:30–12:00",
      "phase": "HANDS-ON",
      "activity": "Create Spring Boot app + install Maven on Jenkins EC2",
      "why": "Use Spring Initializr to generate the app. Push to GitHub. Install Maven on the EC2. Manually verify the Maven build works before putting it in a Jenkinsfile."
    },
    {
      "time": "12:00–12:45",
      "phase": "BREAK",
      "activity": "Lunch",
      "why": ""
    },
    {
      "time": "12:45–14:30",
      "phase": "HANDS-ON",
      "activity": "Write Jenkinsfile + create Pipeline job in Jenkins",
      "why": "Jenkinsfile written line by line with explanation. Pipeline job configured to read Jenkinsfile from repo. First run — watch the stage view."
    },
    {
      "time": "14:30–15:30",
      "phase": "HANDS-ON",
      "activity": "Configure GitHub Webhook",
      "why": "GitHub repo settings → Webhooks → add Jenkins URL. Test delivery. Push a commit. Watch Jenkins trigger automatically."
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
      "activity": "End-to-end test: push code → webhook → Jenkins pipeline → green",
      "why": ""
    },
    {
      "time": "16:45–17:00",
      "phase": "COMMIT",
      "activity": "Day 9 notes + quiz + commit Jenkinsfile to repo",
      "why": ""
    }
  ],
  "concepts": [
    {
      "icon": "📋",
      "title": "Declarative Pipeline Syntax",
      "description": "Jenkinsfile uses a Groovy-based DSL (Domain Specific Language). Declarative pipelines use a structured format: pipeline → agent → stages → stage → steps. Every element has a specific position. Put a step outside steps and the whole file breaks.",
      "analogy": "Always use Declarative syntax (not Scripted). Declarative is easier to read, has better validation, and is the modern standard. Scripted pipeline is legacy."
    },
    {
      "icon": "🤖",
      "title": "agent any",
      "description": "agent any means \"run this pipeline on any available Jenkins agent (executor).\" In your setup, the agent is the Jenkins server itself — same machine. In larger setups, agents are separate machines that do the actual build work while the Jenkins master just coordinates.",
      "analogy": "For now: agent any is correct. Week 5 introduces dedicated build agents when your pipeline needs specific tools (Maven, Docker, SonarQube scanner) in isolated environments."
    },
    {
      "icon": "🎭",
      "title": "Stages and Stage View",
      "description": "Each stage is a logical step in the pipeline. Checkout → Build → Test → Archive. In the Jenkins Pipeline Stage View plugin, each stage shows as a column with green (success) or red (failed) indicators. You see at a glance which stage failed and how long each took.",
      "analogy": "Stages are not just visual. When a stage fails, all subsequent stages are skipped. This prevents broken code from reaching later stages (like deployment)."
    },
    {
      "icon": "🔧",
      "title": "Maven in a Pipeline",
      "description": "Maven is a Java build tool. mvn clean package — clean removes old build files, package compiles + runs tests + creates a JAR file. The JAR (Java ARchive) is the deployable artifact. If any test fails, Maven exits with non-zero code → Jenkins marks stage as failed.",
      "analogy": "You don't need to understand Java to run Maven. Understand what mvn clean package does: compile + test + package. That's all your pipeline needs to know."
    },
    {
      "icon": "🌐",
      "title": "GitHub Webhook",
      "description": "A webhook is a URL GitHub calls when an event happens (a push). Your Jenkins URL + /github-webhook/ receives the POST. Jenkins sees it, identifies the matching job, and triggers a build. The flow: you push → GitHub fires HTTP POST to Jenkins → Jenkins starts pipeline.",
      "analogy": "This is what makes CI automatic. Without a webhook, you have to manually click \"Build Now\" every time. The webhook removes the human step — code pushed = build starts. Every CI system works this way."
    },
    {
      "icon": "📦",
      "title": "archiveArtifacts",
      "description": "After Maven builds the JAR, archiveArtifacts in the Jenkinsfile copies it to Jenkins's artifact storage. You can then download the JAR from the Jenkins UI, or pass it to downstream jobs (like JFrog upload in Day 12). This is how the build artifact travels through your pipeline.",
      "analogy": "In your roadmap: Jenkins archives the JAR → next day you push it to JFrog Artifactory instead of just storing it in Jenkins. archiveArtifacts is the starting point of artifact management."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 4,
      "sessionTitle": "STEP 1 — Generate Spring Boot App via Spring Initializr CLI",
      "sections": [
        {
          "label": "On your Jenkins EC2 — generate a Spring Boot project using curl",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cd ~"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl https://start.spring.io/starter.tgz \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "-d dependencies=web \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "-d type=maven-project \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "-d language=java \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "-d bootVersion=3.2.5 \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "-d baseDir=devops-app \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "-d groupId=com.devops \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "-d artifactId=devops-app \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "-d javaVersion=17 | tar -xzf -"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "ls devops-app/"
            },
            {
              "type": "ok",
              "text": "HELP.md  mvnw  mvnw.cmd  pom.xml  src/"
            },
            {
              "type": "output",
              "text": "# mvnw = Maven Wrapper — runs Maven without needing Maven installed globally"
            },
            {
              "type": "output",
              "text": "# pom.xml = Project Object Model — Maven's config file describing dependencies and build"
            },
            {
              "type": "output",
              "text": "# src/ = your Java source code"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cat devops-app/pom.xml | head -20"
            },
            {
              "type": "output",
              "text": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
            },
            {
              "type": "output",
              "text": "<project>"
            },
            {
              "type": "output",
              "text": "<groupId>com.devops</groupId>"
            },
            {
              "type": "output",
              "text": "<artifactId>devops-app</artifactId>"
            },
            {
              "type": "output",
              "text": "<version>0.0.1-SNAPSHOT</version>"
            },
            {
              "type": "output",
              "text": "...</project>"
            },
            {
              "type": "output",
              "text": "# pom.xml = Maven's instruction file. groupId = your organisation. artifactId = app name."
            },
            {
              "type": "output",
              "text": "# version = 0.0.1-SNAPSHOT. SNAPSHOT means \"work in progress\" — not a release version."
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 4,
      "sessionTitle": "STEP 2 — Install Maven + Verify Build Works Manually",
      "sections": [
        {
          "label": "Install Maven on the Jenkins EC2",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt install -y maven"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn -version"
            },
            {
              "type": "ok",
              "text": "Apache Maven 3.8.7"
            },
            {
              "type": "ok",
              "text": "Maven home: /usr/share/maven"
            },
            {
              "type": "ok",
              "text": "Java version: 17.0.11, vendor: Ubuntu"
            },
            {
              "type": "output",
              "text": "# Maven is installed. Note the Maven home path — you'll need it in Jenkins Tools config."
            }
          ]
        },
        {
          "label": "Build the app manually FIRST — before putting it in a pipeline",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cd ~/devops-app"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn clean package -DskipTests"
            },
            {
              "type": "output",
              "text": "# -DskipTests = skip running tests for now (we'll run them in the pipeline)"
            },
            {
              "type": "output",
              "text": "# First run: downloads dependencies from Maven Central (2-5 min on first run)"
            },
            {
              "type": "output",
              "text": "# Subsequent runs: uses local cache (~/.m2/repository), much faster"
            },
            {
              "type": "output",
              "text": "[INFO] Downloading from central: https://repo.maven.apache.org/maven2/..."
            },
            {
              "type": "output",
              "text": "[INFO] Building devops-app 0.0.1-SNAPSHOT"
            },
            {
              "type": "output",
              "text": "[INFO] --- maven-compiler-plugin:3.11.0:compile ---"
            },
            {
              "type": "output",
              "text": "[INFO] Compiling 2 source files"
            },
            {
              "type": "ok",
              "text": "[INFO] BUILD SUCCESS"
            },
            {
              "type": "ok",
              "text": "[INFO] Total time: 45.321 s (first run with dependency downloads)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "ls target/"
            },
            {
              "type": "ok",
              "text": "devops-app-0.0.1-SNAPSHOT.jar  classes/  generated-sources/  maven-status/"
            },
            {
              "type": "output",
              "text": "# devops-app-0.0.1-SNAPSHOT.jar = your deployable artifact"
            },
            {
              "type": "output",
              "text": "# This JAR is what will go to JFrog Artifactory in Day 12"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn clean test # Run with tests this time"
            },
            {
              "type": "ok",
              "text": "[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0"
            },
            {
              "type": "ok",
              "text": "[INFO] BUILD SUCCESS"
            },
            {
              "type": "output",
              "text": "# Spring Boot generates one default test. It passes. This is your test gate."
            }
          ]
        },
        {
          "label": "Configure Maven in Jenkins Tools",
          "lines": [
            {
              "type": "output",
              "text": "# Jenkins UI: Manage Jenkins → Tools → Maven installations → Add Maven"
            },
            {
              "type": "output",
              "text": "# Name: Maven-3.8   (you reference this name in Jenkinsfile)"
            },
            {
              "type": "output",
              "text": "# MAVEN_HOME: /usr/share/maven"
            },
            {
              "type": "output",
              "text": "# Save."
            }
          ]
        },
        {
          "label": "Push the Spring Boot app to GitHub",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cd ~/devops-90days"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cp -r ~/devops-app ./devops-app"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cat > devops-app/.gitignore << 'EOF'"
            },
            {
              "type": "output",
              "text": "target/"
            },
            {
              "type": "output",
              "text": ".mvn/"
            },
            {
              "type": "output",
              "text": "*.class"
            },
            {
              "type": "output",
              "text": "*.jar"
            },
            {
              "type": "output",
              "text": "EOF"
            },
            {
              "type": "output",
              "text": "# ALWAYS gitignore the target/ directory — it's built output, not source code"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git add devops-app/"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git commit -m \"feat: Add Spring Boot devops-app for Jenkins pipeline\""
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git push"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 3,
      "totalSessions": 4,
      "sessionTitle": "Commit Jenkinsfile + Create Pipeline Job in Jenkins",
      "sections": [
        {
          "label": "Commit Jenkinsfile to repo root",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cd ~/devops-90days"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git add Jenkinsfile"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git commit -m \"ci: Add Jenkinsfile with Checkout-Build-Test-Package stages\""
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git push"
            }
          ]
        },
        {
          "label": "Create Pipeline job in Jenkins UI",
          "lines": [
            {
              "type": "output",
              "text": "# Jenkins Dashboard → New Item"
            },
            {
              "type": "output",
              "text": "# Name: devops-pipeline"
            },
            {
              "type": "output",
              "text": "# Type: Pipeline  (NOT Freestyle)"
            },
            {
              "type": "output",
              "text": "# Click OK"
            },
            {
              "type": "output",
              "text": ""
            },
            {
              "type": "output",
              "text": "# General: Description = \"Spring Boot pipeline — Jenkins roadmap Day 9\""
            },
            {
              "type": "output",
              "text": ""
            },
            {
              "type": "output",
              "text": "# Build Triggers: ✓ GitHub hook trigger for GITScm polling"
            },
            {
              "type": "output",
              "text": "# (This enables webhook triggering — required for Day 9 webhook setup)"
            },
            {
              "type": "output",
              "text": ""
            },
            {
              "type": "output",
              "text": "# Pipeline section:"
            },
            {
              "type": "output",
              "text": "# Definition: Pipeline script from SCM"
            },
            {
              "type": "output",
              "text": "# SCM: Git"
            },
            {
              "type": "output",
              "text": "# Repository URL: https://github.com/YOURNAME/devops-90days.git"
            },
            {
              "type": "output",
              "text": "# Credentials: github-credentials"
            },
            {
              "type": "output",
              "text": "# Branch: */main"
            },
            {
              "type": "output",
              "text": "# Script Path: Jenkinsfile  (this is where Jenkins looks for the Jenkinsfile)"
            },
            {
              "type": "output",
              "text": ""
            },
            {
              "type": "output",
              "text": "# Save → Build Now"
            },
            {
              "type": "output",
              "text": "# Watch the Stage View appear: Checkout → Build → Test → Package"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 4,
      "totalSessions": 4,
      "sessionTitle": "Webhook Configuration — GitHub UI + Jenkins Verification",
      "sections": [
        {
          "label": "Step 1: Add webhook in GitHub repo settings",
          "lines": [
            {
              "type": "output",
              "text": "# Go to: github.com/YOURNAME/devops-90days"
            },
            {
              "type": "output",
              "text": "# Settings → Webhooks → Add webhook"
            },
            {
              "type": "output",
              "text": ""
            },
            {
              "type": "output",
              "text": "# Payload URL:  http://YOUR_EC2_IP:8080/github-webhook/"
            },
            {
              "type": "output",
              "text": "#              ↑ MUST end with trailing slash ↑"
            },
            {
              "type": "output",
              "text": "# Content type: application/json"
            },
            {
              "type": "output",
              "text": "# Secret: leave blank (add in production)"
            },
            {
              "type": "output",
              "text": "# Which events: Just the push event ← select this"
            },
            {
              "type": "output",
              "text": "# Active: ✓ checked"
            },
            {
              "type": "output",
              "text": "# Click: Add webhook"
            },
            {
              "type": "output",
              "text": ""
            },
            {
              "type": "output",
              "text": "# GitHub immediately sends a PING to verify Jenkins is reachable"
            },
            {
              "type": "output",
              "text": "# You see a green ✓ next to the webhook if Jenkins responded correctly"
            },
            {
              "type": "output",
              "text": "# You see a red ✗ if Jenkins isn't reachable — check port 8080 in security group"
            }
          ]
        },
        {
          "label": "Step 2: Test the webhook — push a trivial change",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo \"# Webhook test $(date)\" >> README.md"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git add README.md && git commit -m \"test: Verify webhook triggers Jenkins pipeline\""
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git push"
            },
            {
              "type": "ok",
              "text": "# Go to Jenkins → devops-pipeline"
            },
            {
              "type": "ok",
              "text": "# You should see a new build starting within 5-10 seconds of the push"
            },
            {
              "type": "ok",
              "text": "# Build History shows: #2 (started by GitHub push event)"
            },
            {
              "type": "output",
              "text": "# In GitHub: Settings → Webhooks → your webhook → Recent Deliveries"
            },
            {
              "type": "output",
              "text": "# Shows each delivery with request + response — useful for debugging"
            }
          ]
        },
        {
          "label": "Step 3: Verify webhook delivery in GitHub",
          "lines": [
            {
              "type": "output",
              "text": "# GitHub → Repo Settings → Webhooks → click your webhook"
            },
            {
              "type": "output",
              "text": "# Recent Deliveries tab shows:"
            },
            {
              "type": "ok",
              "text": "# ● 200 OK — Jenkins received and processed the push event"
            },
            {
              "type": "err",
              "text": "# ● Connection refused — Jenkins not reachable (check port 8080 in SG)"
            },
            {
              "type": "err",
              "text": "# ● 403 Forbidden — Jenkins security rejecting anonymous POST (enable webhook auth)"
            }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "⚡ Jenkinsfile Syntax Error — Pipeline Won't Load",
      "steps": [
        {
          "num": 1,
          "title": "Jenkins shows \"Errors\" when saving or running — click the error for detail",
          "description": "Groovy syntax errors are shown inline. The error message includes the line number."
        },
        {
          "num": 2,
          "title": "Use Jenkins Pipeline Linter before committing",
          "description": "Jenkins UI → your Pipeline job → Pipeline Syntax (left sidebar) → Declarative Directive Generator and Snippet Generator tools"
        },
        {
          "num": 3,
          "title": "Most common syntax mistakes in Jenkinsfiles:",
          "description": "Missing closing brace }. stage name not matching (case sensitive). dir() block not closed. sh command not in quotes.",
          "cmd": "Count your opening { and closing } — they must match exactly"
        }
      ]
    },
    {
      "title": "⚡ Maven Build Fails: \"Could not find or load main class\"",
      "steps": [
        {
          "num": 1,
          "title": "Maven not found in the pipeline",
          "description": "tools { maven 'Maven-3.8' } name must match exactly what you configured in Manage Jenkins → Tools → Maven installations.",
          "cmd": "Check: Manage Jenkins → Tools → Maven → note the exact Name field value → use that in Jenkinsfile"
        },
        {
          "num": 2,
          "title": "Wrong directory — pom.xml not found",
          "description": "Jenkins runs from repo root. If pom.xml is in devops-app/, you need dir('devops-app') { sh 'mvn ...' }",
          "cmd": "ls in build step → confirm pom.xml location → adjust dir() accordingly"
        }
      ]
    },
    {
      "title": "Common Errors & Troubleshooting",
      "steps": [
        {
          "num": 1,
          "title": "Webhook fires but Jenkins doesn't trigger the build",
          "description": "Cause: Job doesn't have \"GitHub hook trigger for GITScm polling\" checkbox enabled | Fix: Jenkins → devops-pipeline → Configure → Build Triggers → ✓ GitHub hook trigger for GITScm polling"
        },
        {
          "num": 2,
          "title": "GitHub webhook shows \"Connection refused\" on delivery",
          "description": "Cause: Jenkins EC2 port 8080 not open in security group, OR Jenkins is down | Fix: Check: aws ec2 describe-security-groups → port 8080 must allow 0.0.0.0/0 | Fix: Check: sudo systemctl status jenkins → must be active"
        },
        {
          "num": 3,
          "title": "Tests fail: \"Application failed to start\" in test output",
          "description": "Cause: Spring Boot test tries to start the full application — a port may already be in use on the build machine | Fix: Add to pom.xml test configuration: use random ports. Or check what's using port 8080 on the Jenkins server."
        },
        {
          "num": 4,
          "title": "\"mvn: command not found\" in Pipeline but works manually",
          "description": "Cause: Maven tool not configured in Jenkins, or tools { maven } name mismatch | Fix: Manage Jenkins → Tools → Maven installations → verify Name. Match it exactly in Jenkinsfile tools block."
        }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Writing the Jenkinsfile without testing the Maven build manually first",
      "description": "You write a complex Jenkinsfile, run the pipeline, and Maven fails. You don't know if it's a Jenkinsfile syntax issue or a Maven issue. Now you're debugging two things at once.",
      "fix": "ALWAYS manually verify mvn clean package works on the EC2 before writing a Jenkinsfile. Fix Maven issues first, then put it in the pipeline."
    },
    {
      "mistake": "Committing the target/ directory to Git",
      "description": "The target/ directory contains all compiled classes and JAR files — hundreds of MB of generated files that don't belong in version control. Committing them bloats your repo permanently.",
      "fix": "Add target/ to .gitignore before your first commit in any Maven project. This is the equivalent of node_modules/ in JavaScript projects."
    },
    {
      "mistake": "Forgetting the trailing slash in the webhook URL",
      "description": "http://IP:8080/github-webhook (no slash) returns 404. http://IP:8080/github-webhook/ (with slash) works correctly. This is a Jenkins-specific requirement and causes hours of confusion.",
      "fix": "Webhook Payload URL must end with /github-webhook/ — always with trailing slash."
    },
    {
      "mistake": "Using sh 'mvn ...' without a dir() block when pom.xml is in a subdirectory",
      "description": "Jenkins runs the sh step from the workspace root. If pom.xml is in devops-app/, running mvn from root fails with \"The specified POM file was not found\".",
      "fix": "Always use dir('devops-app') { sh 'mvn clean package' } to change into the correct directory before running Maven."
    }
  ],
  "project": {
    "tag": "📁 Day 9 Project",
    "title": "Full Pipeline: GitHub Push → Webhook → Jenkins Builds Spring Boot App",
    "timeEstimate": "⏱ ~80 min",
    "goal": "End-to-end automation. Push any change to main → GitHub webhook fires → Jenkins pipeline runs Checkout → Build → Test → Package → Stage view shows all green. The JAR artifact is archived in Jenkins and downloadable. This is the first half of your roadmap pipeline working.",
    "checklist": [
      "Spring Boot app in devops-90days/devops-app/ with .gitignore for target/",
      "Jenkinsfile in repo root with 4 stages: Checkout, Build, Test, Package",
      "Maven configured in Jenkins Tools (name matches Jenkinsfile tools block)",
      "Pipeline job \"devops-pipeline\" in Jenkins using \"Pipeline script from SCM\"",
      "First manual run: all 4 stages green, JAR archived",
      "GitHub webhook configured: Payload URL = http://EC2_IP:8080/github-webhook/",
      "Webhook test: push a commit → build starts in Jenkins within 10 seconds",
      "GitHub webhook shows green ✓ in Recent Deliveries",
      "Screenshot: Jenkins Stage View with all 4 stages green",
      "Screenshot: GitHub webhook Recent Deliveries showing 200 OK"
    ],
    "expectedOutput": "Complete Flow — Prove It Works\n$ echo \"trigger\" >> README.md && git commit -am \"test: trigger pipeline\" && git push\n\nWithin 10 seconds in Jenkins:\ndevops-pipeline #3 → Started by GitHub push by YOURNAME\n\nStage View:\nCheckout ✓ → Build ✓ → Test ✓ → Package ✓\n\nArtifacts: devops-app-0.0.1-SNAPSHOT.jar (downloadable from Jenkins UI)\nPost: ✅ Pipeline SUCCESS — devops-app built and packaged"
  },
  "interview": [
    {
      "question": "\"What is a Jenkinsfile and why is it better than configuring jobs in the Jenkins UI?\"",
      "answer": "\"A Jenkinsfile is a text file committed to the root of your source code repository that defines your entire Jenkins pipeline as code. It uses Jenkins's Declarative Pipeline syntax — a structured Groovy DSL with pipeline, stages, stage, and steps blocks. The key advantage over UI-configured Freestyle jobs is that the pipeline definition lives alongside the code it builds, so it's version-controlled, reviewed in pull requests, and reproducible. If your Jenkins server is wiped and rebuilt, you point a new Pipeline job at the same repo and the pipeline recreates itself from the Jenkinsfile — no manual reconfiguration. It also allows the pipeline to evolve with the code: when a developer adds a new tool or test framework, they update the Jenkinsfile in the same PR as the code change. UI-based configuration has no such history or review process.\""
    },
    {
      "question": "\"Explain how a GitHub webhook triggers a Jenkins pipeline.\"",
      "answer": "\"When you push code to GitHub, GitHub can notify external services via a webhook — an HTTP POST request sent to a configured URL. In Jenkins, that URL is http://JENKINS_IP:8080/github-webhook/. I configure this URL in the GitHub repository settings under Webhooks. On the Jenkins side, I enable the 'GitHub hook trigger for GITScm polling' option in the Pipeline job configuration. When the developer pushes, GitHub immediately fires a POST to that Jenkins URL containing a JSON payload describing the push — which branch, which commit, who pushed. Jenkins receives it, identifies all jobs configured to watch that repository and branch, and starts those jobs automatically. This removes the human step from CI: push code, build starts, results are known within minutes — without anyone clicking anything.\""
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "What does mvn clean package do — what are the three phases in order?",
      "options": [
        {
          "text": "A) Download → Compile → Deploy",
          "isCorrect": false
        },
        {
          "text": "B) Clean (delete old build output) → Compile + Test → Package into JAR",
          "isCorrect": true
        },
        {
          "text": "C) Validate → Install → Package",
          "isCorrect": false
        },
        {
          "text": "D) Clean → Download dependencies → Upload artifact",
          "isCorrect": false
        }
      ],
      "explanation": "clean: deletes the target/ directory — removes any leftover files from previous builds ensuring a clean state. Then Maven runs through its lifecycle: compile (convert .java to .class), test (run unit tests — build fails here if tests fail), package (bundle compiled classes into a JAR file). The JAR in target/ is the deployable artifact."
    },
    {
      "num": 2,
      "question": "In a Jenkinsfile, what is the purpose of the post { always { cleanWs() } } block?",
      "options": [
        {
          "text": "A) Cleans up the GitHub repository after a build",
          "isCorrect": false
        },
        {
          "text": "B) Deletes the build workspace on the Jenkins server after every build — success or failure — to free disk space",
          "isCorrect": true
        },
        {
          "text": "C) Resets Maven's local dependency cache",
          "isCorrect": false
        },
        {
          "text": "D) Removes old build records from Jenkins history",
          "isCorrect": false
        }
      ],
      "explanation": "Jenkins keeps a workspace directory for each job (in /var/lib/jenkins/workspace/JOB_NAME/) containing the cloned repo and build output. Without cleanWs(), these accumulate across every build — potentially using gigabytes of disk. The always block runs regardless of build result, so the workspace is always cleaned up. On a small EC2, this prevents disk-full failures after a few dozen builds."
    },
    {
      "num": 3,
      "question": "GitHub webhook shows a red ✗ with \"Connection refused.\" What do you check first?",
      "options": [
        {
          "text": "A) Recreate the GitHub webhook",
          "isCorrect": false
        },
        {
          "text": "B) Verify EC2 security group allows inbound traffic on port 8080 from 0.0.0.0/0",
          "isCorrect": true
        },
        {
          "text": "C) Restart the Spring Boot application",
          "isCorrect": false
        },
        {
          "text": "D) Check if Git is installed on the Jenkins server",
          "isCorrect": false
        }
      ],
      "explanation": "\"Connection refused\" means GitHub's servers cannot reach Jenkins at all — the TCP connection never established. This is always a network issue: either port 8080 is not open in the EC2 security group, or Jenkins is down. Check the security group inbound rules first (aws ec2 describe-security-groups) then verify Jenkins is running (sudo systemctl status jenkins)."
    },
    {
      "num": 4,
      "question": "What is the dir('devops-app') block doing in your Jenkinsfile?",
      "options": [
        {
          "text": "A) Creates a new directory called devops-app on the Jenkins server",
          "isCorrect": false
        },
        {
          "text": "B) Changes the working directory to devops-app/ for all steps inside the block — so Maven can find pom.xml",
          "isCorrect": true
        },
        {
          "text": "C) Specifies which GitHub branch to clone",
          "isCorrect": false
        },
        {
          "text": "D) Sets the Docker build context to devops-app/",
          "isCorrect": false
        }
      ],
      "explanation": "Jenkins runs pipeline steps from the workspace root (the cloned repo root). If pom.xml lives in devops-app/ rather than the root, Maven needs to be run from inside that directory. dir('devops-app') { sh 'mvn ...' } is equivalent to cd devops-app && mvn ... in a shell script. Everything inside the dir() block runs with devops-app/ as the working directory."
    },
    {
      "num": 5,
      "question": "A developer pushes a commit that breaks a unit test. What happens in your pipeline?",
      "options": [
        {
          "text": "A) Jenkins skips the test and continues to Package",
          "isCorrect": false
        },
        {
          "text": "B) The Test stage fails → pipeline stops → Package stage is skipped → build marked FAILURE",
          "isCorrect": true
        },
        {
          "text": "C) Jenkins retries the test 3 times before failing",
          "isCorrect": false
        },
        {
          "text": "D) Jenkins emails the developer but continues the pipeline",
          "isCorrect": false
        }
      ],
      "explanation": "When mvn test runs a test that fails, Maven exits with a non-zero code. Jenkins interprets any non-zero exit code from sh as a step failure. The Test stage is marked failed (red). Jenkins stops executing subsequent stages — Package, Docker, deploy — nothing else runs. The pipeline is marked FAILURE. This is the fundamental CI guarantee: broken code stops the pipeline and never reaches production."
    }
  ],
  "github": {
    "filename": "devops-90days/day-09/README.md",
    "commitMessage": "docs: Add Day 09 — Jenkinsfile, Pipeline job, GitHub webhook",
    "template": "# Day 09 — Jenkinsfile + Pipeline Job + GitHub Webhook\n**Date:** YYYY-MM-DD | **Difficulty:** Hard | **Status:** ✅ Complete\n\n## Roadmap Position\nDeveloper → Git → GitHub → **[Jenkins ← Webhook trigger configured]** → **[Maven ← integrated]** → SonarQube → ...\n\n## What I Built\n- Spring Boot app in devops-app/ (generated via Spring Initializr)\n- Jenkinsfile with 4 stages: Checkout → Build → Test → Package\n- Pipeline job \"devops-pipeline\" reading Jenkinsfile from GitHub\n- GitHub webhook triggering Jenkins automatically on every push\n- JAR artifact archived in Jenkins after each successful build\n\n## Jenkinsfile Anatomy\n```groovy\npipeline {\n  agent any                          // run on Jenkins server\n  tools { maven 'Maven-3.8' }        // must match Jenkins Tools config name\n  environment { APP_NAME = 'app' }   // available in all stages as env.APP_NAME\n  stages {\n    stage('Checkout') { steps { checkout scm } }\n    stage('Build')    { steps { dir('devops-app') { sh 'mvn clean compile -DskipTests' } } }\n    stage('Test')     { steps { dir('devops-app') { sh 'mvn test'; junit '**/target/surefire-reports/*.xml' } } }\n    stage('Package')  { steps { dir('devops-app') { sh 'mvn package -DskipTests'; archiveArtifacts 'target/*.jar' } } }\n  }\n  post {\n    success { echo \"BUILD SUCCESS\" }\n    failure { echo \"BUILD FAILED — check Console Output\" }\n    always  { cleanWs() }\n  }\n}\n```\n\n## Maven Commands Reference\n```bash\nmvn clean compile        # delete old output + compile Java\nmvn test                 # compile + run unit tests (fails build if tests fail)\nmvn clean package        # clean + compile + test + create JAR in target/\nmvn clean package -DskipTests  # skip tests (use in Build stage, not Test stage)\nmvn -version             # verify Maven installation\n```\n\n## Webhook Configuration\n- GitHub → Repo → Settings → Webhooks → Add webhook\n- Payload URL: http://EC2_IP:8080/github-webhook/  ← trailing slash mandatory\n- Content type: application/json\n- Events: Just the push event\n- Jenkins job → Build Triggers → ✓ GitHub hook trigger for GITScm polling\n\n## Tomorrow — Day 10\nMaven deep-dive: pom.xml structure, dependencies, build lifecycle. Jenkins + Maven full integration with test reports."
  },
  "pdfUrl": "/pdfs/day9.pdf",
  "images": []
};
