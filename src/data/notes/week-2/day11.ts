import { BootcampDay } from '../types';

export const day11: BootcampDay = {
  "day": 11,
  "title": "SonarQube — Code Quality Scanning",
  "subtitle": "Install on EC2 · Quality Gates · Metrics · Jenkins Integration · Pipeline Stage",
  "color": "#4a90d9",
  "trainerNote": "Quality gates prevent technical debt from reaching production. If SonarQube fails its analysis, the pipeline must fail immediately.",
  "engineerNote": "Run SonarQube analysis inside the Jenkins pipeline using the SonarQube Scanner plugin. Set quality gates to fail builds with low test coverage.",
  "goal": {
    "icon": "🎯",
    "title": "🎯 Day 11 Goal",
    "description": "By end of Day 11: SonarQube running on a dedicated EC2, your Spring Boot project scanned and showing quality\n          metrics (bugs, code smells, coverage, duplications), and your Jenkins pipeline includes a SonarQube analysis\n          stage that fails the build if quality gate is not met. Expected output: push code → Jenkins → Maven build →\n          SonarQube scan → quality gate passes → pipeline continues to package."
  },
  "schedule": [
    {
      "time": "09:00–09:20",
      "phase": "RECALL",
      "activity": "Day 10 check",
      "why": "Push a change. Pipeline triggers. All stages green. Test\n                report visible in Jenkins. If not working — fix before SonarQube."
    },
    {
      "time": "09:20–10:15",
      "phase": "THEORY",
      "activity": "What SonarQube measures and why it matters",
      "why": "Bugs vs Code Smells vs\n                Vulnerabilities vs Security Hotspots. Quality Gate concept. Technical debt. Coverage metrics. Why\n                companies require a passing quality gate before merging code."
    },
    {
      "time": "10:15–10:30",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "10:30–12:00",
      "phase": "INSTALL",
      "activity": "Launch EC2 + Install SonarQube + PostgreSQL",
      "why": "SonarQube needs a database.\n                PostgreSQL is the production choice. Install both, configure SonarQube to use PostgreSQL, start the\n                service."
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
      "activity": "SonarQube UI setup + Jenkins plugin + SonarQube token",
      "why": "Configure\n                SonarQube server in Jenkins. Create analysis token. Add sonar properties to pom.xml."
    },
    {
      "time": "14:15–15:30",
      "phase": "JENKINS",
      "activity": "Add SonarQube stage to Jenkinsfile + Quality Gate wait",
      "why": "Add\n                withSonarQubeEnv block. Add waitForQualityGate step. Push and watch pipeline scan your code."
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
      "activity": "Mini Project: pipeline fails on quality gate breach",
      "why": ""
    },
    {
      "time": "16:45–17:00",
      "phase": "COMMIT",
      "activity": "Day 11 notes + quiz",
      "why": ""
    }
  ],
  "concepts": [
    {
      "icon": "🔍",
      "title": "What SonarQube Measures",
      "description": "Bugs: code that will likely fail at runtime. Vulnerabilities: security\n            issues (SQL injection risk, exposed secrets). Code Smells: maintainability issues (overly\n            complex methods, duplicate code). Security Hotspots: code that needs manual security\n            review.",
      "analogy": "\"SonarQube performs static analysis — it reads your source code without running it\n            and identifies defects, security risks, and maintainability problems before they reach production.\""
    },
    {
      "icon": "🚦",
      "title": "Quality Gate",
      "description": "A Quality Gate is a pass/fail threshold that your code must meet. Default gate: no new bugs, no new\n            vulnerabilities, code coverage on new code ≥ 80%, duplicated lines ≤ 3%. If the gate fails, the Jenkins\n            pipeline stops — broken quality code cannot proceed to JFrog or deployment.",
      "analogy": "The quality gate is the enforcement mechanism. Without it, SonarQube is just a report — code\n            can still be deployed regardless of quality. The gate makes quality mandatory."
    },
    {
      "icon": "📊",
      "title": "Technical Debt",
      "description": "SonarQube calculates how long it would take a developer to fix all code smells. This is \"technical debt.\" A\n            project with 3 days of technical debt is manageable. 6 months of debt means the codebase is costly to\n            change. Teams track this over time to prevent it accumulating.",
      "analogy": "When a manager asks \"why does adding a feature take so long?\" — technical debt is often the\n            answer. SonarQube makes it visible and measurable."
    },
    {
      "icon": "📈",
      "title": "Code Coverage",
      "description": "What percentage of your source code is executed when your unit tests run. 80% coverage means 80% of your\n            code lines are tested. SonarQube works with the JaCoCo plugin to display coverage. Low coverage = code that\n            breaks silently because no test catches it.",
      "analogy": "Coverage without quality is meaningless — you can write bad tests that touch every line. But\n            zero coverage is always a red flag. Target 70–80% meaningful coverage."
    },
    {
      "icon": "🔑",
      "title": "SonarQube Token",
      "description": "Jenkins authenticates to SonarQube using an analysis token — a long random string generated in SonarQube\n            UI. This token is stored in Jenkins Credentials Manager and injected into the pipeline via\n            withSonarQubeEnv(). Never hardcode tokens in Jenkinsfiles.",
      "analogy": "Same pattern as GitHub PAT: generate a token in the tool, store in Jenkins Credentials,\n            reference by ID in pipeline. Credentials never in source code."
    },
    {
      "icon": "🔌",
      "title": "sonar-maven-plugin",
      "description": "SonarQube analysis is triggered from Maven: mvn sonar:sonar. This runs the sonar-maven-plugin\n            which analyzes your compiled code, runs tests to collect coverage, and sends results to the SonarQube\n            server. The server URL and token are passed as properties.",
      "analogy": "In your pipeline: the SonarQube stage runs mvn sonar:sonar inside a withSonarQubeEnv() block\n            that automatically injects the server URL and token from Jenkins credentials."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 3,
      "sessionTitle": "STEP 1 — Launch t2.medium EC2 for SonarQube",
      "sections": [
        {
          "label": "From your laptop — launch dedicated SonarQube EC2",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "SQ_SG=$(aws ec2\n              create-security-group \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--group-name\n              sonarqube-sg \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--description\n              \"SonarQube server\" \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--query 'GroupId'\n              --output text)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "aws ec2\n              authorize-security-group-ingress --group-id $SQ_SG --protocol tcp --port 22 --cidr 0.0.0.0/0"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "aws ec2\n              authorize-security-group-ingress --group-id $SQ_SG --protocol tcp --port 9000 --cidr 0.0.0.0/0"
            },
            {
              "type": "output",
              "text": "# Port 9000 = SonarQube web UI"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "aws ec2 run-instances\n              \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--image-id $AMI_ID\n              --instance-type t2.medium \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--key-name\n              YOUR_KEY_NAME \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--security-group-ids\n              $SQ_SG \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--tag-specifications\n              'ResourceType=instance,Tags=[{Key=Name,Value=sonarqube-server}]'"
            },
            {
              "type": "output",
              "text": "# SSH into the SonarQube EC2 before continuing"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 3,
      "sessionTitle": "STEP 2 — Install PostgreSQL + SonarQube on the EC2",
      "sections": [
        {
          "label": "Install Java 17 and PostgreSQL",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt update &&\n              sudo apt install -y openjdk-17-jdk postgresql postgresql-contrib"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl enable\n              postgresql && sudo systemctl start postgresql"
            }
          ]
        },
        {
          "label": "Create SonarQube database and user in PostgreSQL",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo -u postgres psql\n              << 'SQL'"
            },
            {
              "type": "output",
              "text": "CREATE USER sonar WITH ENCRYPTED PASSWORD 'sonar123';"
            },
            {
              "type": "output",
              "text": "CREATE DATABASE sonarqube OWNER sonar;"
            },
            {
              "type": "output",
              "text": "GRANT ALL PRIVILEGES ON DATABASE sonarqube TO sonar;"
            },
            {
              "type": "output",
              "text": "\\q"
            },
            {
              "type": "output",
              "text": "SQL"
            },
            {
              "type": "ok",
              "text": "CREATE ROLE / CREATE DATABASE / GRANT"
            }
          ]
        },
        {
          "label": "Install SonarQube Community Edition",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cd /opt"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo wget\n              https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.4.1.88267.zip"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt install -y\n              unzip"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo unzip\n              sonarqube-10.4.1.88267.zip"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo mv\n              sonarqube-10.4.1.88267 sonarqube"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo useradd -r -s\n              /bin/false sonar # SonarQube cannot run as root"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo chown -R\n              sonar:sonar /opt/sonarqube"
            }
          ]
        },
        {
          "label": "Configure SonarQube to use PostgreSQL",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo nano\n              /opt/sonarqube/conf/sonar.properties"
            },
            {
              "type": "output",
              "text": "# Uncomment and set these lines:"
            },
            {
              "type": "output",
              "text": "sonar.jdbc.username=sonar"
            },
            {
              "type": "output",
              "text": "sonar.jdbc.password=sonar123"
            },
            {
              "type": "output",
              "text": "sonar.jdbc.url=jdbc:postgresql://localhost/sonarqube"
            },
            {
              "type": "output",
              "text": "sonar.web.host=0.0.0.0"
            },
            {
              "type": "output",
              "text": "sonar.web.port=9000"
            }
          ]
        },
        {
          "label": "Set system limits (SonarQube/Elasticsearch requirement)",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo\n              \"vm.max_map_count=524288\" | sudo tee -a /etc/sysctl.conf"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo\n              \"fs.file-max=131072\" | sudo tee -a /etc/sysctl.conf"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo sysctl -p"
            },
            {
              "type": "ok",
              "text": "vm.max_map_count = 524288"
            },
            {
              "type": "output",
              "text": "# Without vm.max_map_count=524288 Elasticsearch crashes immediately on start"
            },
            {
              "type": "output",
              "text": "# This is the #1 reason SonarQube fails to start on a fresh EC2"
            }
          ]
        },
        {
          "label": "Create systemd service for SonarQube",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo tee\n              /etc/systemd/system/sonarqube.service << 'EOF'"
            },
            {
              "type": "output",
              "text": "[Unit]"
            },
            {
              "type": "output",
              "text": "Description=SonarQube service"
            },
            {
              "type": "output",
              "text": "After=network.target postgresql.service"
            },
            {
              "type": "output",
              "text": "[Service]"
            },
            {
              "type": "output",
              "text": "Type=forking"
            },
            {
              "type": "output",
              "text": "ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start"
            },
            {
              "type": "output",
              "text": "ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop"
            },
            {
              "type": "output",
              "text": "User=sonar"
            },
            {
              "type": "output",
              "text": "Group=sonar"
            },
            {
              "type": "output",
              "text": "Restart=always"
            },
            {
              "type": "output",
              "text": "[Install]"
            },
            {
              "type": "output",
              "text": "WantedBy=multi-user.target"
            },
            {
              "type": "output",
              "text": "EOF"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl\n              daemon-reload"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl enable\n              sonarqube && sudo systemctl start sonarqube"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo tail -f\n              /opt/sonarqube/logs/sonar.log"
            },
            {
              "type": "output",
              "text": "# Wait 2-3 minutes. Look for:"
            },
            {
              "type": "ok",
              "text": "SonarQube is operational"
            },
            {
              "type": "output",
              "text": "# Then open browser: http://SONARQUBE_EC2_IP:9000"
            },
            {
              "type": "output",
              "text": "# Default login: admin / admin → change password immediately"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 3,
      "totalSessions": 3,
      "sessionTitle": "Configure Jenkins ↔ SonarQube Connection",
      "sections": [
        {
          "label": "Step 1: Generate SonarQube analysis token",
          "lines": [
            {
              "type": "output",
              "text": "# In SonarQube UI: My Account (top right) → Security → Generate Tokens"
            },
            {
              "type": "output",
              "text": "# Name: jenkins-pipeline-token"
            },
            {
              "type": "output",
              "text": "# Type: Global Analysis Token"
            },
            {
              "type": "output",
              "text": "# Expiry: No expiration (for learning)"
            },
            {
              "type": "output",
              "text": "# Click Generate → COPY THE TOKEN — shown only once"
            }
          ]
        },
        {
          "label": "Step 2: Add SonarQube token to Jenkins Credentials",
          "lines": [
            {
              "type": "output",
              "text": "# Jenkins UI: Manage Jenkins → Credentials → System → Global → Add Credentials"
            },
            {
              "type": "output",
              "text": "# Kind: Secret text"
            },
            {
              "type": "output",
              "text": "# Secret: paste the SonarQube token"
            },
            {
              "type": "output",
              "text": "# ID: sonarqube-token"
            },
            {
              "type": "output",
              "text": "# Description: SonarQube analysis token for Jenkins pipeline"
            }
          ]
        },
        {
          "label": "Step 3: Configure SonarQube server in Jenkins",
          "lines": [
            {
              "type": "output",
              "text": "# Jenkins UI: Manage Jenkins → System → SonarQube servers section"
            },
            {
              "type": "output",
              "text": "# ✓ Enable injection of SonarQube server configuration as build environment\n            variables"
            },
            {
              "type": "output",
              "text": "# Name: SonarQube (this name goes in withSonarQubeEnv('SonarQube') in Jenkinsfile)"
            },
            {
              "type": "output",
              "text": "# Server URL: http://SONARQUBE_EC2_IP:9000"
            },
            {
              "type": "output",
              "text": "# Server authentication token: sonarqube-token (select from credentials)"
            },
            {
              "type": "output",
              "text": "# Save"
            }
          ]
        },
        {
          "label": "Step 4: Add sonar properties to pom.xml",
          "lines": [
            {
              "type": "output",
              "text": "# Add inside <properties> in pom.xml:"
            },
            {
              "type": "output",
              "text": "<sonar.projectKey>devops-app</sonar.projectKey>"
            },
            {
              "type": "output",
              "text": "<sonar.projectName>DevOps Pipeline App</sonar.projectName>"
            },
            {
              "type": "output",
              "text": "<sonar.java.source>17</sonar.java.source>"
            }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "⚡ SonarQube Fails to Start",
      "steps": [
        {
          "num": 1,
          "title": "Check Elasticsearch requirement — vm.max_map_count",
          "description": "This is the #1\n              SonarQube startup failure. Elasticsearch needs this kernel parameter.",
          "cmd": "sysctl\n              vm.max_map_count → must be ≥524288. If not: sudo sysctl -w vm.max_map_count=524288"
        },
        {
          "num": 2,
          "title": "Check SonarQube log for the actual error",
          "description": "sudo tail -100\n              /opt/sonarqube/logs/sonar.log",
          "cmd": "sudo tail -100\n              /opt/sonarqube/logs/sonar.log"
        },
        {
          "num": 3,
          "title": "Check PostgreSQL connection is working",
          "description": "sudo -u postgres psql\n              -c \"\\l\" → verify sonarqube database exists",
          "cmd": "sudo -u postgres psql\n              -c \"\\l\" → verify sonarqube database exists"
        },
        {
          "num": 4,
          "title": "Check SonarQube is not running as root (it will refuse)",
          "description": "ps\n              aux | grep sonar → user must be sonar, not root",
          "cmd": "ps\n              aux | grep sonar → user must be sonar, not root"
        }
      ]
    },
    {
      "title": "Common Errors & Troubleshooting",
      "steps": [
        {
          "num": 1,
          "title": "waitForQualityGate times out in pipeline",
          "description": "Cause: SonarQube webhook not configured — Jenkins never receives the gate result | Fix: SonarQube UI: Administration → Configuration → Webhooks → Create | Fix: Name: Jenkins URL: http://JENKINS_IP:8080/sonarqube-webhook/ (trailing slash)"
        },
        {
          "num": 2,
          "title": "\"Could not find or load main class SonarScanner\" in Maven",
          "description": "Cause: sonar-maven-plugin not found or Maven can't reach SonarQube | Fix: Verify SONAR_HOST_URL is set: echo $SONAR_HOST_URL inside the withSonarQubeEnv block"
        }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Installing SonarQube on the same t2.medium as Jenkins",
      "description": "Both Jenkins and SonarQube are memory-intensive JVM applications. On 4GB RAM they will fight for memory,\n              causing random OOM kills and mysterious failures.",
      "fix": "Separate EC2s for Jenkins\n              and SonarQube. t2.medium each minimum. Share data via network, not by co-locating."
    },
    {
      "mistake": "Not configuring the SonarQube webhook — quality gate hangs forever",
      "description": "waitForQualityGate in Jenkins waits for SonarQube to POST the result back to Jenkins. Without the webhook\n              configured in SonarQube, this POST never happens and the pipeline hangs until timeout.",
      "fix": "SonarQube UI → Administration → Webhooks → Create → URL:\n              http://JENKINS_IP:8080/sonarqube-webhook/"
    },
    {
      "mistake": "Using H2 embedded database instead of PostgreSQL",
      "description": "SonarQube's default embedded H2 database works for initial setup but is not supported for production.\n              Data is lost on restart and it can't handle concurrent analysis.",
      "fix": "Always\n              configure PostgreSQL from Day 1. The setup takes 10 extra minutes and prevents hours of data loss\n              later."
    }
  ],
  "project": {
    "tag": "📁 Day 11 Project",
    "title": "Pipeline Includes SonarQube Scan — Quality Gate Enforced",
    "timeEstimate": "⏱ ~75 min",
    "goal": "SonarQube running at http://SQ_IP:9000. Pipeline runs SonarQube\n            analysis after tests. Quality gate passes. Then deliberately introduce a critical bug — verify quality gate\n            fails and pipeline stops before Package stage.",
    "checklist": [
      "SonarQube running on dedicated t2.medium EC2 at port 9000",
      "PostgreSQL database configured (not H2 embedded)",
      "Analysis token created in SonarQube, stored in Jenkins Credentials as sonarqube-token",
      "SonarQube server configured in Jenkins System settings (name: SonarQube)",
      "SonarQube webhook configured: http://JENKINS_IP:8080/sonarqube-webhook/",
      "Jenkinsfile updated with SonarQube Analysis + Quality Gate stages",
      "Full pipeline green: Checkout → Build → Test → SonarQube Analysis → Quality Gate → Package",
      "SonarQube dashboard shows project devops-app with quality metrics",
      "Deliberately break quality gate: add a method with 15+ nested conditions → verify pipeline fails at\n              Quality Gate stage"
    ],
    "expectedOutput": "Expected: Pipeline Stage View with SonarQube\n            Checkout ✓ → Build ✓ → Test ✓ → SonarQube Analysis ✓ → Quality Gate ✓ → Package ✓\n            SonarQube dashboard shows:\n            devops-app | Passed ✓\n            Bugs: 0 | Vulnerabilities: 0 | Code Smells: 2 | Coverage: 78%"
  },
  "interview": [
    {
      "question": "\"What is a SonarQube quality gate and how does it affect your CI\n          pipeline?\"",
      "answer": "\"A quality gate is a pass/fail\n          threshold defined in SonarQube that code must meet before it can be considered acceptable. The default quality\n          gate checks new code for: zero new bugs, zero new vulnerabilities, code coverage on new code above 80%, and\n          duplicated lines below 3%. In the Jenkins pipeline, after the SonarQube analysis stage runs, the\n          waitForQualityGate step pauses the pipeline and waits for SonarQube to POST the gate result back via webhook.\n          If the gate passes, the pipeline continues to the Package stage. If it fails, abortPipeline: true causes\n          Jenkins to mark the build as failed and stop execution — the broken-quality code never reaches JFrog or\n          deployment. This is how quality gates enforce standards: not as a suggestion but as a hard gate that broken\n          code cannot pass through.\""
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "SonarQube fails to start. The log shows \"max virtual memory areas\n          vm.max_map_count is too low.\" What do you do?",
      "options": [
        {
          "text": "A) Increase EC2 instance type",
          "isCorrect": false
        },
        {
          "text": "B) Run: sudo sysctl -w vm.max_map_count=524288 and add to\n            /etc/sysctl.conf for persistence",
          "isCorrect": true
        },
        {
          "text": "C) Reinstall SonarQube",
          "isCorrect": false
        },
        {
          "text": "D) Restart PostgreSQL",
          "isCorrect": false
        }
      ],
      "explanation": "SonarQube embeds Elasticsearch which requires vm.max_map_count ≥ 524288. The default Ubuntu\n          value is 65530 — too low. sysctl -w sets it for the current session. Adding to /etc/sysctl.conf makes it\n          permanent across reboots. This is the most common SonarQube startup failure."
    },
    {
      "num": 2,
      "question": "What is the difference between a Bug and a Code Smell in SonarQube?",
      "options": [
        {
          "text": "A) Bugs are Java-only; Code Smells affect all languages",
          "isCorrect": false
        },
        {
          "text": "B) Bugs will likely cause incorrect behaviour at runtime; Code Smells\n            are maintainability issues that make code harder to understand and change",
          "isCorrect": true
        },
        {
          "text": "C) Code Smells are more severe than Bugs",
          "isCorrect": false
        },
        {
          "text": "D) They are the same thing with different names",
          "isCorrect": false
        }
      ],
      "explanation": "Bugs: code that is wrong and will likely fail at runtime (null pointer risk, resource leak).\n          Vulnerabilities: security flaws. Code Smells: not wrong but problematic — overly complex methods, duplicate\n          logic, poor naming. Code Smells create technical debt — they make future changes harder. Bugs must be fixed.\n          Smells should be fixed over time."
    },
    {
      "num": 3,
      "question": "The pipeline hangs at the Quality Gate stage for 5 minutes then\n          times out. What is missing?",
      "options": [
        {
          "text": "A) SonarQube token is wrong",
          "isCorrect": false
        },
        {
          "text": "B) The SonarQube webhook is not configured — SonarQube never POSTs\n            the gate result back to Jenkins",
          "isCorrect": true
        },
        {
          "text": "C) The Quality Gate threshold is too strict",
          "isCorrect": false
        },
        {
          "text": "D) Maven version is incompatible with SonarQube",
          "isCorrect": false
        }
      ],
      "explanation": "waitForQualityGate is a callback mechanism. Jenkins pauses and waits for SonarQube to send the\n          result via webhook POST to /sonarqube-webhook/. If the webhook is not created in SonarQube Administration →\n          Webhooks pointing to Jenkins, this POST never happens and the step times out. Always configure the webhook\n          immediately after setting up SonarQube."
    },
    {
      "num": 4,
      "question": "Why should SonarQube run AFTER tests but BEFORE the Package stage?",
      "options": [
        {
          "text": "A) SonarQube needs the JAR file to scan",
          "isCorrect": false
        },
        {
          "text": "B) SonarQube uses test coverage data generated by tests; placing it\n            before Package means quality-failing code never becomes a deployable artifact",
          "isCorrect": true
        },
        {
          "text": "C) Package stage breaks SonarQube if run first",
          "isCorrect": false
        },
        {
          "text": "D) Order doesn't matter for SonarQube",
          "isCorrect": false
        }
      ],
      "explanation": "SonarQube collects coverage data from the test run (via JaCoCo or Surefire reports). Running\n          tests first generates this data. Placing SonarQube before Package means if the quality gate fails, the Package\n          stage is skipped — no JAR artifact is created, nothing can be uploaded to JFrog or deployed. This enforces:\n          only quality code becomes an artifact."
    },
    {
      "num": 5,
      "question": "How does Jenkins receive the SonarQube quality gate result?",
      "options": [
        {
          "text": "A) Jenkins polls SonarQube every 30 seconds",
          "isCorrect": false
        },
        {
          "text": "B) SonarQube sends an HTTP POST to Jenkins /sonarqube-webhook/ after\n            analysis completes",
          "isCorrect": true
        },
        {
          "text": "C) Maven reads the result and fails the build directly",
          "isCorrect": false
        },
        {
          "text": "D) Jenkins reads the SonarQube database directly",
          "isCorrect": false
        }
      ],
      "explanation": "The webhook is a push mechanism — SonarQube notifies Jenkins when analysis is complete.\n          waitForQualityGate registers a listener in Jenkins at /sonarqube-webhook/. When SonarQube finishes analysis,\n          it POSTs the quality gate status (OK or ERROR) to that URL. Jenkins receives it, parses the result, and either\n          continues the pipeline or aborts it. No polling needed."
    }
  ],
  "github": {
    "filename": "devops-90days/day-11/README.md",
    "commitMessage": "docs: Add Day 11 — SonarQube\n            install, quality gates, Jenkins integration",
    "template": "# Day 11 — SonarQube Code Quality Scanning\n**Date:** YYYY-MM-DD | **Difficulty:** Hard | **Status:** ✅ Complete\n\n## Roadmap Position\nJenkins ✓ → Maven ✓ → SonarQube ← HERE → JFrog → Docker → K8s\n\n## What I Set Up\n- SonarQube 10.x on dedicated t2.medium EC2 at port 9000\n- PostgreSQL as SonarQube database (not H2 embedded)\n- vm.max_map_count=524288 in /etc/sysctl.conf (Elasticsearch requirement)\n- SonarQube analysis token → Jenkins Credentials Manager\n- Jenkins ↔ SonarQube server configuration (Manage Jenkins → System)\n- Webhook: SonarQube → http://JENKINS_IP:8080/sonarqube-webhook/\n- Pipeline: Checkout → Build → Test → SonarQube Analysis → Quality Gate → Package\n\n## Key SonarQube Metrics\n- Bugs: runtime failures. Vulnerabilities: security. Code Smells: maintainability.\n- Quality Gate: pass/fail. waitForQualityGate abortPipeline:true enforces it.\n- Technical debt: time to fix all code smells.\n\n## Critical Setup Steps (in order)\n```bash\n# 1. Set kernel parameter FIRST (or Elasticsearch crashes)\nsudo sysctl -w vm.max_map_count=524288\necho \"vm.max_map_count=524288\" | sudo tee -a /etc/sysctl.conf\n\n# 2. PostgreSQL setup\nsudo -u postgres psql -c \"CREATE USER sonar WITH ENCRYPTED PASSWORD 'sonar123';\"\nsudo -u postgres psql -c \"CREATE DATABASE sonarqube OWNER sonar;\"\n\n# 3. Configure sonar.properties (PostgreSQL JDBC URL)\n# 4. Run as sonar user (not root)\n# 5. Configure webhook in SonarQube UI BEFORE testing waitForQualityGate\n```\n\n## Tomorrow — Day 12\nJFrog Artifactory: install, create repository, push JAR from Jenkins pipeline"
  },
  "pdfUrl": "/pdfs/day11.pdf",
  "images": []
};
