import { BootcampDay } from '../types';

export const day12: BootcampDay = {
  "day": 12,
  "title": "JFrog Artifactory — Artifact Repository",
  "subtitle": "Install on EC2 · Maven Repository · Push JAR from Jenkins · Artifact Versioning · Retrieve\n            Artifacts",
  "color": "#40be5a",
  "trainerNote": "Never use GitHub to store compiled binaries (JARs, WARs). Artifact registries like JFrog are built to store versioned binaries reliably.",
  "engineerNote": "Push compiled JARs to JFrog using Jenkins integration. Always tag builds with release or snapshot indicators to manage lifecycle rules.",
  "goal": {
    "icon": "🎯",
    "title": "🎯 Day 12 Goal",
    "description": "By end of Day 12: JFrog Artifactory running on EC2, a Maven repository created inside it, and your Jenkins\n          pipeline pushes the JAR artifact to Artifactory after a successful quality gate. Expected output: push code →\n          pipeline runs → JAR lands in JFrog with version number, build info, and is downloadable from the Artifactory\n          UI."
  },
  "schedule": [
    {
      "time": "09:00–09:20",
      "phase": "RECALL",
      "activity": "Day 11 check",
      "why": "Push a commit. Pipeline runs all 6 stages including\n                SonarQube Analysis + Quality Gate. All green. If not — fix before JFrog."
    },
    {
      "time": "09:20–10:15",
      "phase": "THEORY",
      "activity": "What Artifactory does and why you need it",
      "why": "The problem: Maven downloads\n                dependencies from Maven Central every build. Artifactory is a local proxy + your own artifact store.\n                Caches externals, stores your JARs. Every company uses an artifact manager in production."
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
      "activity": "Install JFrog Artifactory OSS on EC2",
      "why": "Artifactory Open Source is free.\n                Install as a service. Create Maven local repository. Create a user for Jenkins access."
    },
    {
      "time": "12:00–12:45",
      "phase": "BREAK",
      "activity": "Lunch",
      "why": ""
    },
    {
      "time": "12:45–14:30",
      "phase": "CONFIGURE",
      "activity": "Configure Jenkins Artifactory plugin + credentials",
      "why": "Install Artifactory\n                plugin in Jenkins. Add Artifactory server URL. Store credentials. Configure Maven to deploy to\n                Artifactory."
    },
    {
      "time": "14:30–15:30",
      "phase": "JENKINS",
      "activity": "Update Jenkinsfile: Deploy stage pushes JAR to Artifactory",
      "why": "Replace\n                archiveArtifacts with rtMavenDeployer. Verify JAR appears in Artifactory UI with build info."
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
      "activity": "Mini Project: full pipeline with JFrog artifact storage",
      "why": ""
    },
    {
      "time": "16:45–17:00",
      "phase": "COMMIT",
      "activity": "Day 12 notes + quiz",
      "why": ""
    }
  ],
  "concepts": [
    {
      "icon": "🏪",
      "title": "What Artifactory Is",
      "description": "Artifactory is a universal artifact repository manager. It stores build outputs (JARs, WARs, Docker images,\n            npm packages, Python wheels) in one central location. It also acts as a proxy cache for public registries —\n            Maven Central, Docker Hub — reducing external network calls and improving build speed.",
      "analogy": "\"JFrog Artifactory is the artifact repository in the pipeline. After Jenkins builds\n            and tests the code, the JAR is published to Artifactory with version metadata. Later stages pull the exact\n            versioned artifact from Artifactory for deployment.\""
    },
    {
      "icon": "📚",
      "title": "Repository Types",
      "description": "Local: stores your own published artifacts (your JARs). Remote: proxy for\n            external registries (Maven Central). Virtual: combines local + remote into one URL — your\n            pom.xml points here, Maven gets everything from one place whether local or external.",
      "analogy": "In your roadmap: you create a local Maven repository for your JARs today. Day 13 adds a local\n            Docker repository for images. A virtual repo combines both for downstream consumers."
    },
    {
      "icon": "🏷",
      "title": "Artifact Versioning",
      "description": "Every artifact in Artifactory has a path: com/devops/devops-app/1.0.0/devops-app-1.0.0.jar.\n            This mirrors the GAV coordinate. With SNAPSHOT versions (1.0.0-SNAPSHOT), Artifactory appends a timestamp to\n            each upload so old snapshots are preserved. Release versions (1.0.0) are immutable — uploaded once, never\n            overwritten.",
      "analogy": "Never overwrite a release artifact. If you need to change it, bump the version number.\n            Immutability means you can always reproduce exactly what was deployed on any date."
    },
    {
      "icon": "🔑",
      "title": "Build Info",
      "description": "When Jenkins publishes to Artifactory via the JFrog plugin, it attaches build information: Jenkins build\n            number, git commit, who triggered the build, which tests passed. This creates full traceability — given any\n            artifact in Artifactory, you can trace it back to the exact git commit and Jenkins build that produced it.",
      "analogy": "This traceability is mandatory for compliance and incident response. \"Which version is running\n            in production and what code does it contain?\" — Artifactory build info answers this instantly."
    },
    {
      "icon": "🔐",
      "title": "Access Tokens",
      "description": "Artifactory uses user/password or access tokens for authentication. Create a dedicated CI user in\n            Artifactory (not admin), grant it deploy permissions on your repository, generate a token for that user.\n            Store the token in Jenkins Credentials Manager. Never use admin credentials for CI.",
      "analogy": "Same principle as IAM least privilege: the Jenkins user can deploy to your-repo, nothing else.\n            If compromised, damage is limited."
    },
    {
      "icon": "⚡",
      "title": "rtMaven (JFrog Jenkins Plugin)",
      "description": "The JFrog Jenkins plugin provides rtMavenRun and rtMavenDeployer steps.\n            rtMavenRun wraps mvn command and automatically collects build info. rtPublishBuildInfo sends that info to\n            Artifactory. This is the production way to deploy from Jenkins — not mvn deploy with credentials in pom.xml.",
      "analogy": "Never put Artifactory credentials in pom.xml. The JFrog Jenkins plugin injects credentials at\n            runtime from Jenkins Credentials Manager."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 2,
      "sessionTitle": "Install Artifactory OSS — Dedicated t2.medium EC2",
      "sections": [
        {
          "label": "Launch Artifactory EC2 (separate from Jenkins and SonarQube)",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "ART_SG=$(aws ec2\n              create-security-group \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--group-name\n              artifactory-sg \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--description \"JFrog\n              Artifactory server\" \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--query 'GroupId'\n              --output text)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "aws ec2\n              authorize-security-group-ingress --group-id $ART_SG --protocol tcp --port 22 --cidr 0.0.0.0/0"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "aws ec2\n              authorize-security-group-ingress --group-id $ART_SG --protocol tcp --port 8082 --cidr 0.0.0.0/0"
            },
            {
              "type": "output",
              "text": "# Port 8082 = Artifactory web UI and API"
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
              "text": "--security-group-ids\n              $ART_SG \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--tag-specifications\n              'ResourceType=instance,Tags=[{Key=Name,Value=artifactory-server}]'"
            }
          ]
        },
        {
          "label": "On the Artifactory EC2 — install Java 17 then Artifactory",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt update &&\n              sudo apt install -y openjdk-17-jdk"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "wget -qO -\n              https://releases.jfrog.io/artifactory/api/gpg/key/public | sudo apt-key add -"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo \"deb\n              https://releases.jfrog.io/artifactory/artifactory-debs xenial main\" | \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "sudo tee\n              /etc/apt/sources.list.d/artifactory.list"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt update &&\n              sudo apt install -y jfrog-artifactory-oss"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl enable\n              artifactory && sudo systemctl start artifactory"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl status\n              artifactory"
            },
            {
              "type": "ok",
              "text": "● artifactory.service - JFrog Artifactory"
            },
            {
              "type": "ok",
              "text": "Active: active (running)"
            },
            {
              "type": "output",
              "text": "# Wait 2-3 minutes for full startup"
            },
            {
              "type": "output",
              "text": "# Open browser: http://ARTIFACTORY_IP:8082"
            },
            {
              "type": "output",
              "text": "# Default login: admin / password → change immediately"
            }
          ]
        },
        {
          "label": "Create Maven repository in Artifactory UI",
          "lines": [
            {
              "type": "output",
              "text": "# Artifactory UI → Administration → Repositories → Add Repository → Local"
            },
            {
              "type": "output",
              "text": "# Package Type: Maven"
            },
            {
              "type": "output",
              "text": "# Repository Key: devops-maven-local"
            },
            {
              "type": "output",
              "text": "# Description: Maven artifacts from DevOps pipeline"
            },
            {
              "type": "output",
              "text": "# Save & Finish"
            },
            {
              "type": "output",
              "text": ""
            },
            {
              "type": "output",
              "text": "# Create CI user for Jenkins:"
            },
            {
              "type": "output",
              "text": "# Administration → User Management → Users → New User"
            },
            {
              "type": "output",
              "text": "# Username: jenkins-ci Password: strong_password Email: ci@devops.local"
            },
            {
              "type": "output",
              "text": "# Grant: deploy permissions on devops-maven-local"
            },
            {
              "type": "output",
              "text": ""
            },
            {
              "type": "output",
              "text": "# Generate access token for jenkins-ci user:"
            },
            {
              "type": "output",
              "text": "# User Profile → Access Tokens → Generate Token"
            },
            {
              "type": "output",
              "text": "# Copy token — used in Jenkins credentials next"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 2,
      "sessionTitle": "Configure Jenkins Artifactory Plugin + Update Jenkinsfile",
      "sections": [
        {
          "label": "Install JFrog plugin in Jenkins",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "java -jar\n              jenkins-cli.jar -s http://localhost:8080 -auth admin:PASSWORD \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "install-plugin\n              artifactory -restart"
            },
            {
              "type": "ok",
              "text": "# Jenkins restarts. After restart verify plugin: Manage Jenkins → Plugins → Installed →\n            search \"Artifactory\""
            }
          ]
        },
        {
          "label": "Add Artifactory credentials to Jenkins",
          "lines": [
            {
              "type": "output",
              "text": "# Manage Jenkins → Credentials → Global → Add Credentials"
            },
            {
              "type": "output",
              "text": "# Kind: Username with password"
            },
            {
              "type": "output",
              "text": "# Username: jenkins-ci"
            },
            {
              "type": "output",
              "text": "# Password: the access token you generated"
            },
            {
              "type": "output",
              "text": "# ID: artifactory-credentials"
            }
          ]
        },
        {
          "label": "Configure Artifactory server in Jenkins",
          "lines": [
            {
              "type": "output",
              "text": "# Manage Jenkins → System → JFrog section → Add JFrog Platform Instance"
            },
            {
              "type": "output",
              "text": "# Instance ID: artifactory-server (referenced in Jenkinsfile)"
            },
            {
              "type": "output",
              "text": "# JFrog Platform URL: http://ARTIFACTORY_IP:8082"
            },
            {
              "type": "output",
              "text": "# Credentials: artifactory-credentials"
            },
            {
              "type": "output",
              "text": "# Test Connection → should show \"Found Artifactory x.x.x\""
            },
            {
              "type": "output",
              "text": "# Save"
            }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "⚡ Artifactory Startup and Connection Issues",
      "steps": [
        {
          "num": 1,
          "title": "Artifactory not accessible at port 8082 — check startup log",
          "description": "sudo tail -f /var/opt/jfrog/artifactory/log/artifactory.log",
          "cmd": "sudo tail -f /var/opt/jfrog/artifactory/log/artifactory.log"
        },
        {
          "num": 2,
          "title": "Jenkins \"Test Connection\" fails — check URL and port",
          "description": "Artifactory listens\n              on 8082 by default in the OSS version. URL must be http://IP:8082 — not 8080 (that's Jenkins).",
          "cmd": "curl http://ARTIFACTORY_IP:8082/artifactory/api/system/ping → should return OK"
        },
        {
          "num": 3,
          "title": "Artifact not appearing in devops-maven-local after build",
          "description": "Check the\n              rtMaven.deployer releaseRepo name matches the repository key you created in Artifactory\n              exactly.",
          "cmd": "Artifactory UI → Repositories → confirm key is devops-maven-local (case\n              sensitive)"
        }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Using admin credentials for Jenkins instead of a dedicated CI user",
      "description": "If admin credentials are used in Jenkins and compromised, an attacker has full Artifactory admin access —\n              can delete repositories, disable security, access all artifacts.",
      "fix": "Create\n              jenkins-ci user with deploy-only permissions on specific repositories. Use access token not\n              password."
    },
    {
      "mistake": "Overwriting release artifacts by re-running the pipeline with the same\n              version",
      "description": "If pom.xml says 1.0.0 and you run the pipeline twice, the second run tries to overwrite the 1.0.0\n              artifact. Artifactory blocks this by default for release repos — but if you disabled that protection, you\n              now have a different artifact with the same name.",
      "fix": "Bump the version in pom.xml\n              for every release. Use SNAPSHOT for development builds (Artifactory allows overwriting SNAPSHOTs)."
    },
    {
      "mistake": "Putting Artifactory URL and credentials in pom.xml distributionManagement",
      "description": "Credentials in pom.xml go to Git. Artifactory URL is environment-specific — hardcoding it means the same\n              pom.xml can't be used in dev vs prod environments.",
      "fix": "Use the JFrog Jenkins\n              plugin's rtMavenDeployer. Credentials and URL are injected by Jenkins at runtime from credentials store —\n              nothing in pom.xml."
    }
  ],
  "project": {
    "tag": "📁 Day 12 Project",
    "title": "Full Pipeline with JFrog: JAR Stored with Build Info + Traceable",
    "timeEstimate": "⏱ ~70 min",
    "goal": "Complete pipeline: Checkout → Build → Test → SonarQube → Quality\n            Gate → Deploy to Artifactory. JAR appears in Artifactory devops-maven-local with full build info tracing it\n            to the Jenkins build and git commit.",
    "checklist": [
      "Artifactory OSS running on dedicated EC2 at port 8082",
      "devops-maven-local Maven repository created in Artifactory",
      "jenkins-ci user with deploy permissions created in Artifactory",
      "Access token stored in Jenkins Credentials as artifactory-credentials",
      "Artifactory server configured in Jenkins System (Instance ID: artifactory-server)",
      "Jenkinsfile updated: Deploy to Artifactory stage using rtMaven",
      "Pipeline runs fully green — all 6 stages pass",
      "Artifactory UI shows: devops-app-1.0.0.jar under devops-maven-local",
      "Build Info tab shows: build number, git commit, test results",
      "Download the JAR from Artifactory UI — verify it runs: java -jar devops-app-1.0.0.jar"
    ]
  },
  "interview": [
    {
      "question": "\"Why use JFrog Artifactory instead of just using Maven Central or\n          archiving in Jenkins?\"",
      "answer": "\"Three reasons. First, control:\n          Maven Central is public and external — your proprietary code doesn't belong there. Artifactory is your private\n          registry. Second, speed: Artifactory acts as a proxy cache for Maven Central and Docker Hub. The first\n          download is slow, but every subsequent build pulls from your local Artifactory rather than the internet —\n          faster builds and no dependency on external availability. Third, traceability: Jenkins's archiveArtifacts\n          stores JARs locally on the Jenkins server, which has no governance, versioning, or retention policy.\n          Artifactory gives you proper versioning, access control, retention policies, and build metadata — you can look\n          at any artifact and trace it back to the exact git commit, Jenkins build, and passing tests that produced it.\n          In a regulated environment like banking or healthcare, this traceability is a compliance requirement.\""
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "What is the difference between a Local, Remote, and Virtual\n          repository in Artifactory?",
      "options": [
        {
          "text": "A) They store different file types",
          "isCorrect": false
        },
        {
          "text": "B) Local stores your own artifacts; Remote proxies external\n            registries (Maven Central); Virtual combines both under one URL",
          "isCorrect": true
        },
        {
          "text": "C) Remote is for Docker, Local is for Maven only",
          "isCorrect": false
        },
        {
          "text": "D) Virtual repositories cost more",
          "isCorrect": false
        }
      ],
      "explanation": "Local: where your pipeline publishes to. Remote: proxy cache for Maven Central, Docker Hub etc.\n          Virtual: aggregated view that combines local + remote — your pom.xml points to the virtual repo and gets both\n          your internal artifacts and cached external ones transparently. In production you always point builds at a\n          virtual repo for maximum flexibility."
    },
    {
      "num": 2,
      "question": "What information does Artifactory Build Info contain?",
      "options": [
        {
          "text": "A) Only the artifact file size and checksum",
          "isCorrect": false
        },
        {
          "text": "B) Jenkins build number, git commit hash, who triggered the build,\n            test results, modules built, and timestamps",
          "isCorrect": true
        },
        {
          "text": "C) The SonarQube quality gate result only",
          "isCorrect": false
        },
        {
          "text": "D) Docker image layers",
          "isCorrect": false
        }
      ],
      "explanation": "Build Info creates full traceability between artifact and source. Given devops-app-1.0.0.jar in\n          Artifactory, you can see: which Jenkins build produced it, which git commit it was built from, which tests\n          passed, and when. This answers \"what exactly is running in production?\" — essential for incident response and\n          compliance audits."
    },
    {
      "num": 3,
      "question": "Why are SNAPSHOT versions treated differently from release versions\n          in Artifactory?",
      "options": [
        {
          "text": "A) SNAPSHOT versions are compressed differently",
          "isCorrect": false
        },
        {
          "text": "B) SNAPSHOTs can be overwritten (work in progress); release versions\n            are immutable — once published they cannot be overwritten",
          "isCorrect": true
        },
        {
          "text": "C) SNAPSHOTs are deleted after 24 hours automatically",
          "isCorrect": false
        },
        {
          "text": "D) Release versions require admin approval before publishing",
          "isCorrect": false
        }
      ],
      "explanation": "SNAPSHOT (1.0.0-SNAPSHOT) = work in progress. Each upload appends a timestamp so versions\n          accumulate. Release (1.0.0) = finished and immutable. Artifactory blocks re-publishing a release version by\n          default. This immutability is critical: if you could overwrite a release artifact, you could change what's \"in\n          production\" without changing the version number — breaking traceability entirely."
    },
    {
      "num": 4,
      "question": "Your Jenkins pipeline fails at the Deploy to Artifactory stage with\n          \"401 Unauthorized.\" What do you check?",
      "options": [
        {
          "text": "A) The Artifactory EC2 security group",
          "isCorrect": false
        },
        {
          "text": "B) The credentials stored in Jenkins for Artifactory — token may be\n            wrong, expired, or the user lacks deploy permissions",
          "isCorrect": true
        },
        {
          "text": "C) The pom.xml version number",
          "isCorrect": false
        },
        {
          "text": "D) SonarQube is not running",
          "isCorrect": false
        }
      ],
      "explanation": "401 Unauthorized = authentication failed. Check: 1) credentials ID in Jenkinsfile matches\n          what's in Jenkins Credentials Manager. 2) The token in credentials hasn't expired. 3) The jenkins-ci user in\n          Artifactory has deploy permissions on devops-maven-local — not just read. Test manually: curl -u\n          jenkins-ci:TOKEN http://ARTIFACTORY_IP:8082/artifactory/api/system/ping"
    },
    {
      "num": 5,
      "question": "Which command verifies that Artifactory is running and accessible on\n          the EC2?",
      "options": [
        {
          "text": "A) sudo systemctl status artifactory only",
          "isCorrect": false
        },
        {
          "text": "B) curl http://ARTIFACTORY_IP:8082/artifactory/api/system/ping —\n            returns OK if running and accessible",
          "isCorrect": true
        },
        {
          "text": "C) mvn artifactory:test",
          "isCorrect": false
        },
        {
          "text": "D) wget artifactory.local/ping",
          "isCorrect": false
        }
      ],
      "explanation": "The /artifactory/api/system/ping endpoint is Artifactory's health check URL. curl -s\n          http://IP:8082/artifactory/api/system/ping returns \"OK\" when Artifactory is fully started and accepting\n          requests. systemctl status shows the OS service is running but Artifactory may still be initialising\n          internally — the ping endpoint confirms it's actually ready to serve requests."
    }
  ],
  "github": {
    "filename": "devops-90days/day-12/README.md",
    "commitMessage": "docs: Add Day 12 — JFrog\n            Artifactory install, Maven repo, Jenkins deploy",
    "template": "# Day 12 — JFrog Artifactory Artifact Repository\n**Date:** YYYY-MM-DD | **Difficulty:** Hard | **Status:** ✅ Complete\n\n## Roadmap Position\nJenkins ✓ → Maven ✓ → SonarQube ✓ → JFrog Artifactory ← HERE → Docker → K8s\n\n## What I Set Up\n- Artifactory OSS on dedicated t2.medium EC2, port 8082\n- devops-maven-local: local Maven repository for pipeline JARs\n- jenkins-ci user with deploy permissions + access token\n- JFrog Jenkins plugin: rtMavenRun + publishBuildInfo\n- Full pipeline: Checkout → Build → Test → SonarQube → Quality Gate → Deploy to Artifactory\n\n## Repository Types\n- Local: stores YOUR artifacts (devops-maven-local)\n- Remote: proxy cache for Maven Central (automatic)\n- Virtual: combines local + remote under one URL (advanced)\n\n## Key Verification Commands\n```bash\n# Is Artifactory running and ready?\ncurl http://ARTIFACTORY_IP:8082/artifactory/api/system/ping\n\n# List artifacts in repository via API\ncurl -u jenkins-ci:TOKEN \\\n  http://ARTIFACTORY_IP:8082/artifactory/api/storage/devops-maven-local/com/devops/\n\n# Download artifact\ncurl -u jenkins-ci:TOKEN \\\n  http://ARTIFACTORY_IP:8082/artifactory/devops-maven-local/com/devops/devops-app/1.0.0/devops-app-1.0.0.jar \\\n  -o devops-app-1.0.0.jar\n```\n\n## Tomorrow — Day 13\nDocker fundamentals from zero + Dockerfile for Spring Boot + Jenkins builds Docker image + push to JFrog Docker Registry"
  },
  "pdfUrl": "/pdfs/day12.pdf",
  "images": []
};
