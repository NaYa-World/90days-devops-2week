import { BootcampDay } from '../types';

export const day13: BootcampDay = {
  "day": 13,
  "title": "Docker — Fundamentals + Jenkins Build + JFrog Registry",
  "subtitle": "Containers · Images · Dockerfile · Spring Boot Container · Jenkins Builds Image · JFrog\n            Docker Registry",
  "color": "#00e5ff",
  "trainerNote": "Docker standardizes runtime environments. By packaging our Spring Boot application as an image, it runs identically everywhere.",
  "engineerNote": "Use multi-stage builds in your Dockerfile to compile and package. This keeps production images small and secure.",
  "goal": {
    "icon": "🎯",
    "title": "🎯 Day 13 Goal",
    "description": "By end of Day 13: you understand Docker from zero (containers, images, Dockerfile), you have containerised\n          your Spring Boot app, and your Jenkins pipeline builds the Docker image and pushes it to JFrog's Docker\n          Registry. Expected output: push code → Jenkins builds JAR → runs tests → SonarQube scan → deploys JAR to JFrog\n          Maven repo → builds Docker image → pushes image to JFrog Docker Registry."
  },
  "schedule": [
    {
      "time": "09:00–09:20",
      "phase": "RECALL",
      "activity": "Day 12 check",
      "why": "JAR visible in Artifactory devops-maven-local. Pipeline\n                all stages green. If not — fix before Docker."
    },
    {
      "time": "09:20–10:30",
      "phase": "THEORY",
      "activity": "Docker fundamentals from zero",
      "why": "Containers vs VMs. Images and layers.\n                Docker Hub. Dockerfile instructions. Container lifecycle. Why Docker matters in your pipeline: \"works on\n                my machine\" problem solved."
    },
    {
      "time": "10:30–10:45",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "10:45–12:00",
      "phase": "INSTALL",
      "activity": "Install Docker on Jenkins EC2 + first containers",
      "why": "Install Docker, run\n                hello-world, run nginx, exec into container, understand logs. All on the Jenkins EC2 — Jenkins will use\n                Docker from the same machine."
    },
    {
      "time": "12:00–12:45",
      "phase": "BREAK",
      "activity": "Lunch",
      "why": ""
    },
    {
      "time": "12:45–14:15",
      "phase": "DOCKERFILE",
      "activity": "Write Dockerfile for Spring Boot app",
      "why": "FROM, RUN, COPY, EXPOSE,\n                ENTRYPOINT. Build image. Run container. Verify app accessible at port 8080. Layer caching\n                explained."
    },
    {
      "time": "14:15–15:15",
      "phase": "JFROG",
      "activity": "Create Docker Repository in JFrog + configure access",
      "why": "Create local\n                Docker repository in Artifactory. Generate access token. Configure Docker CLI to push to JFrog."
    },
    {
      "time": "15:15–15:30",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "15:30–16:30",
      "phase": "JENKINS",
      "activity": "Update Jenkinsfile: Docker build + push to JFrog Docker Registry",
      "why": "Add\n                Docker stage after Artifactory deploy. Jenkins builds image tagged with version. Pushes to JFrog."
    },
    {
      "time": "16:30–17:00",
      "phase": "COMMIT",
      "activity": "Day 13 notes + quiz + commit Dockerfile",
      "why": ""
    }
  ],
  "concepts": [
    {
      "icon": "📦",
      "title": "Container vs Virtual Machine",
      "description": "A VM virtualises hardware — it runs a full operating system (kernel + libraries) inside another OS. A\n            container shares the host kernel. It only isolates the filesystem, network, and process space. Containers\n            start in milliseconds and use MBs of memory. VMs take minutes and use GBs.",
      "analogy": "Your Spring Boot JAR + its Java runtime + its dependencies = a container image. Run it anywhere\n            with Docker installed — same result every time. This solves \"it works on my machine.\""
    },
    {
      "icon": "🖼",
      "title": "Image vs Container",
      "description": "An image is a read-only blueprint — like a class definition. It contains your app code,\n            runtime, libraries, config. A container is a running instance of an image — like an object.\n            One image can run as many containers as you need. Deleting a container does not delete the image.",
      "analogy": "In your pipeline: Jenkins builds the image once. That same image runs in dev, test, staging,\n            production — identical environment every time."
    },
    {
      "icon": "🍰",
      "title": "Image Layers + Caching",
      "description": "Each Dockerfile instruction creates a read-only layer. Layers are cached. If you change only your app code\n            (COPY), Docker reuses all the earlier layers (FROM, RUN). Put frequently changing instructions last, rarely\n            changing ones first — faster builds.",
      "analogy": "Wrong order: COPY code → RUN apt-get install → every code change reinstalls packages (slow).\n            Right order: RUN installs → COPY code → code changes use cached install layer (fast)."
    },
    {
      "icon": "📋",
      "title": "Key Dockerfile Instructions",
      "description": "FROM: base image to start from. WORKDIR: set working directory in\n            container. COPY: copy files from host into image. RUN: execute command\n            during build (creates layer). EXPOSE: document which port the app listens on.\n            ENTRYPOINT: command that always runs when container starts.",
      "analogy": "ENTRYPOINT vs CMD: ENTRYPOINT defines the main process. CMD provides default arguments. For a\n            Spring Boot JAR: ENTRYPOINT [\"java\", \"-jar\"] CMD [\"app.jar\"]"
    },
    {
      "icon": "🔄",
      "title": "Container Lifecycle",
      "description": "docker run = pull image + create container + start it. docker stop = send SIGTERM (graceful shutdown).\n            docker rm = delete stopped container. docker rmi = delete image. Stopped containers still exist and use\n            disk. Always clean up.",
      "analogy": "In your pipeline: Jenkins creates a new image on every build. Tag it with the version. Push to\n            JFrog. The pipeline does not run the container — Kubernetes does that in Week 3."
    },
    {
      "icon": "🏪",
      "title": "JFrog Docker Registry",
      "description": "JFrog Artifactory supports hosting Docker images in addition to Maven JARs. You create a local Docker\n            repository in Artifactory. Docker CLI is configured to push to ARTIFACTORY_IP:8083. Images are\n            stored with full metadata — build info, version, who pushed, when.",
      "analogy": "This is your private Docker registry. Instead of Docker Hub (public) or ECR (AWS-specific),\n            JFrog keeps your images alongside your JARs — one tool managing all artifact types."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 3,
      "sessionTitle": "Install Docker on Jenkins EC2 + Essential Commands",
      "sections": [
        {
          "label": "Install Docker (official method — not the snap version)",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt update &&\n              sudo apt install -y ca-certificates curl gnupg"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo install -m 0755\n              -d /etc/apt/keyrings"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl -fsSL\n              https://download.docker.com/linux/ubuntu/gpg | \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "sudo gpg --dearmor\n              -o /etc/apt/keyrings/docker.gpg"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo \"deb\n              [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "https://download.docker.com/linux/ubuntu \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "$(. /etc/os-release\n              && echo \"$VERSION_CODENAME\") stable\" | \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "sudo tee\n              /etc/apt/sources.list.d/docker.list"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo apt update &&\n              sudo apt install -y docker-ce docker-ce-cli containerd.io"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl enable\n              docker && sudo systemctl start docker"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo usermod -aG\n              docker ubuntu # ubuntu user can run docker without sudo"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo usermod -aG\n              docker jenkins # CRITICAL: jenkins user needs docker access for pipeline"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "newgrp docker"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker\n              --version"
            },
            {
              "type": "ok",
              "text": "Docker version 26.1.0, build a0b0b2a"
            },
            {
              "type": "output",
              "text": "# IMPORTANT: After adding jenkins to docker group, restart Jenkins service:"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo systemctl\n              restart jenkins"
            }
          ]
        },
        {
          "label": "First containers — understand the lifecycle",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker run\n              hello-world"
            },
            {
              "type": "ok",
              "text": "Hello from Docker! Your installation appears to be working correctly."
            },
            {
              "type": "output",
              "text": "# What happened: pulled hello-world image → created container → ran → exited"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker ps # running containers (empty — hello-world exited)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker ps\n              -a # ALL containers including stopped"
            },
            {
              "type": "output",
              "text": "CONTAINER ID IMAGE STATUS NAMES"
            },
            {
              "type": "output",
              "text": "a1b2c3d4e5f6 hello-world Exited (0) 10 seconds quirky_turing"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker\n              images # all local images"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker run -d -p\n              80:80 --name test-nginx nginx"
            },
            {
              "type": "output",
              "text": "# -d = detached (background). -p host:container port map. --name = readable name"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl\n              http://localhost"
            },
            {
              "type": "ok",
              "text": "Welcome to nginx!"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker logs\n              test-nginx # container stdout/stderr"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker exec -it\n              test-nginx bash # interactive shell INSIDE container"
            },
            {
              "type": "ok",
              "text": "root@a1b2c3d4:/# ls /etc/nginx/"
            },
            {
              "type": "output",
              "text": "# You are inside the container filesystem. exit to leave."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker stop\n              test-nginx && docker rm test-nginx"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker system prune\n              -f # remove stopped containers + unused images"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 3,
      "sessionTitle": "Build + Run + Verify Docker Image",
      "sections": [
        {
          "label": "Build the Docker image from devops-app directory",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cd\n              ~/devops-90days/devops-app"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker build -t\n              devops-app:1.0.0 ."
            },
            {
              "type": "output",
              "text": "[+] Building 95.3s (12/12) FINISHED"
            },
            {
              "type": "output",
              "text": "=> [builder 1/6] FROM eclipse-temurin:17-jdk-alpine"
            },
            {
              "type": "output",
              "text": "=> [builder 4/6] RUN ./mvnw dependency:go-offline ← downloads deps into layer"
            },
            {
              "type": "output",
              "text": "=> [builder 5/6] COPY src ./src"
            },
            {
              "type": "output",
              "text": "=> [builder 6/6] RUN ./mvnw clean package -DskipTests"
            },
            {
              "type": "ok",
              "text": "=> [stage-2 4/4] COPY --from=builder /build/target/*.jar app.jar"
            },
            {
              "type": "ok",
              "text": "=> exporting to image: devops-app:1.0.0"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker images\n              devops-app"
            },
            {
              "type": "ok",
              "text": "REPOSITORY TAG IMAGE ID CREATED SIZE"
            },
            {
              "type": "ok",
              "text": "devops-app 1.0.0 a1b2c3d4e5f6 10 seconds ago 217MB"
            },
            {
              "type": "output",
              "text": "# 217MB vs 18MB JAR — the JRE runtime adds the rest"
            },
            {
              "type": "output",
              "text": "# Compare to JDK image (~400MB) — using JRE saves 180MB per image"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker run -d -p\n              8090:8080 --name devops-container devops-app:1.0.0"
            },
            {
              "type": "output",
              "text": "# -p 8090:8080 = EC2 port 8090 → container port 8080 (Jenkins uses 8080)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker ps"
            },
            {
              "type": "ok",
              "text": "CONTAINER ID IMAGE STATUS PORTS"
            },
            {
              "type": "ok",
              "text": "b2c3d4e5f6a7 devops-app:1.0.0 Up 10s (healthy) 0.0.0.0:8090->8080/tcp"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl\n              http://localhost:8090"
            },
            {
              "type": "ok",
              "text": "Hello from DevOps Pipeline! Built by Jenkins."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl\n              http://localhost:8090/health"
            },
            {
              "type": "ok",
              "text": "{\"status\":\"healthy\",\"app\":\"devops-app\"}"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker stop\n              devops-container && docker rm devops-container"
            }
          ]
        },
        {
          "label": "Test layer caching — make code change, rebuild",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo \"// comment\" >>\n              src/main/java/com/devops/devopsapp/HelloController.java"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker build -t\n              devops-app:1.0.1 ."
            },
            {
              "type": "output",
              "text": "[+] Building 18.2s (12/12) FINISHED"
            },
            {
              "type": "output",
              "text": "=> CACHED [builder 1/6] FROM eclipse-temurin:17-jdk-alpine"
            },
            {
              "type": "output",
              "text": "=> CACHED [builder 4/6] RUN ./mvnw dependency:go-offline ← CACHED (pom.xml\n            unchanged)"
            },
            {
              "type": "output",
              "text": "=> [builder 5/6] COPY src ./src ← rebuilds from here (source changed)"
            },
            {
              "type": "output",
              "text": "=> [builder 6/6] RUN ./mvnw clean package -DskipTests ← 12s (no dep download)"
            },
            {
              "type": "ok",
              "text": "# 95s → 18s — layer caching works correctly"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 3,
      "totalSessions": 3,
      "sessionTitle": "Configure JFrog Docker Registry + Docker Login",
      "sections": [
        {
          "label": "Create Docker repository in Artifactory UI",
          "lines": [
            {
              "type": "output",
              "text": "# Artifactory UI → Administration → Repositories → Add Repository → Local"
            },
            {
              "type": "output",
              "text": "# Package Type: Docker"
            },
            {
              "type": "output",
              "text": "# Repository Key: devops-docker-local"
            },
            {
              "type": "output",
              "text": "# Docker API Version: V2"
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
              "text": "# Enable Docker subdomains in Artifactory:"
            },
            {
              "type": "output",
              "text": "# Administration → Artifactory → General → Custom URL Base:\n            http://ARTIFACTORY_IP:8082"
            },
            {
              "type": "output",
              "text": "# Note the Docker registry port: Artifactory serves Docker on port 8083 by default (or\n            8082/v2)"
            }
          ]
        },
        {
          "label": "Configure Artifactory to listen for Docker on port 8083",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "aws ec2\n              authorize-security-group-ingress \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--group-id $ART_SG\n              --protocol tcp --port 8083 --cidr 0.0.0.0/0"
            },
            {
              "type": "output",
              "text": "# Port 8083 = Artifactory Docker registry endpoint"
            }
          ]
        },
        {
          "label": "Login to JFrog Docker registry from Jenkins EC2",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker login\n              ARTIFACTORY_IP:8083"
            },
            {
              "type": "output",
              "text": "Username: jenkins-ci"
            },
            {
              "type": "output",
              "text": "Password: YOUR_ACCESS_TOKEN"
            },
            {
              "type": "ok",
              "text": "Login Succeeded"
            }
          ]
        },
        {
          "label": "Tag and push your image to JFrog",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker tag\n              devops-app:1.0.0 ARTIFACTORY_IP:8083/devops-docker-local/devops-app:1.0.0"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "docker push\n              ARTIFACTORY_IP:8083/devops-docker-local/devops-app:1.0.0"
            },
            {
              "type": "ok",
              "text": "The push refers to repository [ARTIFACTORY_IP:8083/devops-docker-local/devops-app]"
            },
            {
              "type": "ok",
              "text": "1.0.0: digest: sha256:abc123... size: 1234"
            },
            {
              "type": "output",
              "text": "# Verify in Artifactory UI: Artifacts → devops-docker-local → devops-app → 1.0.0"
            },
            {
              "type": "output",
              "text": "# You should see the image manifest and layer blobs"
            }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "⚡ Docker Build/Push Failures in Jenkins",
      "steps": [
        {
          "num": 1,
          "title": "\"docker: command not found\" in Jenkins pipeline",
          "description": "Docker is installed but\n              the jenkins user doesn't have access or PATH doesn't include docker.",
          "cmd": "sudo usermod\n              -aG docker jenkins → sudo systemctl restart jenkins → retry build"
        },
        {
          "num": 2,
          "title": "\"Got permission denied while trying to connect to Docker daemon\"",
          "description": "Jenkins\n              user not in docker group, or Jenkins service not restarted after adding.",
          "cmd": "sudo\n              systemctl restart jenkins (must restart, not reload) → check: sudo -u jenkins docker ps"
        },
        {
          "num": 3,
          "title": "Docker push fails with \"http: server gave HTTP response to HTTPS\n              client\"",
          "description": "Docker by default expects HTTPS. Your JFrog registry on port 8083 is HTTP. Must\n              configure as insecure registry.",
          "cmd": "sudo nano /etc/docker/daemon.json → add:\n              {\"insecure-registries\": [\"ARTIFACTORY_IP:8083\"]} → sudo systemctl restart docker"
        },
        {
          "num": 4,
          "title": "Dockerfile build fails: \"pom.xml not found\"",
          "description": "Build context is wrong.\n              docker build . runs from devops-app/ directory where pom.xml is. In Jenkins, use dir('devops-app') before\n              docker build."
        }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Not cleaning up Docker images after push — Jenkins EC2 disk fills up",
      "description": "Every pipeline run builds a new image and keeps it on the Jenkins EC2. After 20 builds you have 20 images\n              using 4GB+ of disk. Builds start failing with \"no space left on device.\"",
      "fix": "After\n              pushing, remove local images: docker rmi IMAGE:TAG || true. The image is safe in JFrog — no need to keep a\n              local copy."
    },
    {
      "mistake": "Running Spring Boot app as root user inside the container",
      "description": "FROM eclipse-temurin, ENTRYPOINT — by default runs as root. If the container is compromised, the attacker\n              has root inside the container which can be leveraged.",
      "fix": "Create a non-root user\n              in Dockerfile: RUN adduser -S appuser → USER appuser. Always run applications as non-root in\n              containers."
    },
    {
      "mistake": "Not using multi-stage build — shipping JDK in the runtime image",
      "description": "A single-stage Dockerfile that uses JDK as the base image creates a 400MB+ image. The JDK is only needed\n              for building — not running. Runtime only needs the JRE.",
      "fix": "Multi-stage\n              Dockerfile: Stage 1 uses JDK to build. Stage 2 uses JRE to run. Image size drops from ~400MB to ~217MB.\n              Less attack surface too."
    }
  ],
  "project": {
    "tag": "📁 Day 13 Project",
    "title": "Full Pipeline with Docker: JAR + Docker Image Both in JFrog",
    "timeEstimate": "⏱ ~80 min",
    "goal": "Push code → complete 8-stage pipeline runs → JAR in\n            devops-maven-local AND Docker image in devops-docker-local. Pull the Docker image from JFrog and run it\n            locally to verify it works.",
    "checklist": [
      "Docker installed on Jenkins EC2 — jenkins user in docker group, service restarted",
      "insecure-registries configured in /etc/docker/daemon.json for Artifactory IP:8083",
      "Dockerfile in devops-app/ using multi-stage build (JDK builder → JRE runtime)",
      "Non-root user created in Dockerfile (appuser)",
      "HEALTHCHECK instruction in Dockerfile",
      "docker build locally first — verify image runs and /health returns healthy",
      "devops-docker-local repository created in Artifactory",
      "Jenkinsfile: Docker Build stage + Push to JFrog Docker Registry stage added",
      "Full 8-stage pipeline green in Jenkins",
      "JFrog shows: devops-app:1.0.0 and devops-app:latest in devops-docker-local",
      "Pull and run from JFrog: docker pull ARTIFACTORY_IP:8083/devops-docker-local/devops-app:1.0.0 && docker\n              run -p 8090:8080 ... → verify at localhost:8090"
    ]
  },
  "interview": [
    {
      "question": "\"What is a multi-stage Docker build and why do you use it for a\n          Spring Boot app?\"",
      "answer": "\"A multi-stage build uses multiple\n          FROM instructions in a single Dockerfile. The first stage uses a full JDK image to compile and package the\n          Java application. The second stage starts fresh from a minimal JRE image — just enough to run Java, not build\n          it — and copies only the compiled JAR from the builder stage. The result: your final Docker image contains\n          only the JRE and the JAR, not Maven, not the JDK, not the source code. For a Spring Boot app this reduces the\n          image from around 400MB using a JDK base to around 217MB using a JRE base. Beyond size, it improves security —\n          the JDK has more attack surface than the JRE, and your source code is not shipped in the production image. In\n          your pipeline, Jenkins builds this multi-stage image, pushes it to JFrog Docker Registry, and Kubernetes pulls\n          it for deployment.\""
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "What is the key difference between a Docker image and a container?",
      "options": [
        {
          "text": "A) Images run on Windows; containers run on Linux",
          "isCorrect": false
        },
        {
          "text": "B) An image is a read-only blueprint; a container is a running\n            instance of an image with a writable layer on top",
          "isCorrect": true
        },
        {
          "text": "C) Containers are smaller than images",
          "isCorrect": false
        },
        {
          "text": "D) They are identical — just different terminology",
          "isCorrect": false
        }
      ],
      "explanation": "Image = read-only, layered filesystem snapshot. It never changes. Container = running process\n          with a thin writable layer on top of the image's read-only layers. Multiple containers can run from the same\n          image simultaneously. Deleting a container removes its writable layer but leaves the image intact."
    },
    {
      "num": 2,
      "question": "Your pipeline fails with \"docker: Got permission denied while trying\n          to connect to the Docker daemon.\" What is the fix?",
      "options": [
        {
          "text": "A) Run docker as root in the pipeline",
          "isCorrect": false
        },
        {
          "text": "B) Add the jenkins user to the docker group and restart the Jenkins\n            service",
          "isCorrect": true
        },
        {
          "text": "C) Reinstall Docker",
          "isCorrect": false
        },
        {
          "text": "D) Change the pipeline to use sudo docker",
          "isCorrect": false
        }
      ],
      "explanation": "The Docker daemon socket (/var/run/docker.sock) is owned by the docker group. The jenkins user\n          needs to be in that group to use Docker without sudo. After: sudo usermod -aG docker jenkins, you MUST restart\n          Jenkins (not reload) for the group change to take effect for the jenkins process: sudo systemctl restart\n          jenkins."
    },
    {
      "num": 3,
      "question": "Why should you put COPY pom.xml and RUN dependency:go-offline BEFORE\n          COPY src in a Java Dockerfile?",
      "options": [
        {
          "text": "A) Docker requires pom.xml before source code for compilation",
          "isCorrect": false
        },
        {
          "text": "B) Layer caching — if only source code changes, the dependency\n            download layer is cached and doesn't re-execute",
          "isCorrect": true
        },
        {
          "text": "C) Security requirement for Java applications",
          "isCorrect": false
        },
        {
          "text": "D) Maven requires pom.xml to be in its own layer",
          "isCorrect": false
        }
      ],
      "explanation": "Dockerfile layers are cached. If pom.xml hasn't changed, the layer containing\n          dependency:go-offline (which downloads all dependencies) is reused from cache — saving 60+ seconds. If you\n          COPY src first, every code change invalidates the pom.xml layer too and triggers a full dependency\n          re-download. This ordering is the single most impactful Dockerfile optimisation for Java projects."
    },
    {
      "num": 4,
      "question": "Docker push fails: \"http: server gave HTTP response to HTTPS\n          client.\" How do you fix it?",
      "options": [
        {
          "text": "A) Enable HTTPS on Artifactory",
          "isCorrect": false
        },
        {
          "text": "B) Add Artifactory's IP:port to Docker's insecure-registries in\n            /etc/docker/daemon.json",
          "isCorrect": true
        },
        {
          "text": "C) Use docker push --http flag",
          "isCorrect": false
        },
        {
          "text": "D) Change Artifactory port to 443",
          "isCorrect": false
        }
      ],
      "explanation": "Docker defaults to HTTPS for any registry that isn't localhost. Your Artifactory is on HTTP\n          port 8083. You must tell Docker to allow HTTP for that address. Add to /etc/docker/daemon.json:\n          {\"insecure-registries\": [\"ARTIFACTORY_IP:8083\"]} then sudo systemctl restart docker. In production you would\n          use HTTPS with a certificate — insecure-registries is for development/learning only."
    },
    {
      "num": 5,
      "question": "What does ENTRYPOINT [\"java\", \"-jar\", \"app.jar\"] do in a Dockerfile,\n          and why use exec form (JSON array)?",
      "options": [
        {
          "text": "A) It documents which Java version is required",
          "isCorrect": false
        },
        {
          "text": "B) It defines the command that runs when the container starts. Exec\n            form means signals (SIGTERM) go directly to java, enabling graceful shutdown",
          "isCorrect": true
        },
        {
          "text": "C) Shell form and exec form are identical in behaviour",
          "isCorrect": false
        },
        {
          "text": "D) ENTRYPOINT runs during build; CMD runs at start",
          "isCorrect": false
        }
      ],
      "explanation": "ENTRYPOINT defines the main process. Shell form (ENTRYPOINT java -jar app.jar) wraps in /bin/sh\n          -c — signals like SIGTERM (docker stop) don't reach the java process, preventing graceful shutdown. Exec form\n          [\"java\", \"-jar\", \"app.jar\"] runs java directly as PID 1 — signals reach it properly, Spring Boot can shut down\n          gracefully, connections drain cleanly."
    }
  ],
  "github": {
    "filename": "devops-90days/day-13/README.md",
    "commitMessage": "docs: Add Day 13 — Docker\n            fundamentals, Dockerfile, Jenkins pipeline, JFrog Docker Registry",
    "template": "# Day 13 — Docker + Jenkins Build + JFrog Docker Registry\n**Date:** YYYY-MM-DD | **Difficulty:** Hard | **Status:** ✅ Complete\n\n## Roadmap Position\nJenkins ✓ → Maven ✓ → SonarQube ✓ → JFrog JAR ✓ → Docker + JFrog Docker Registry ← HERE → K8s\n\n## Docker Fundamentals Summary\n- Container = isolated process sharing host kernel (not a VM)\n- Image = read-only layered blueprint. Container = running instance.\n- Layer caching: rarely-changing layers first (deps), frequently-changing last (code)\n- Multi-stage build: JDK stage for build, JRE stage for runtime (smaller + safer)\n- Never run as root in container. Use USER instruction.\n\n## Key Docker Commands\n```bash\ndocker build -t name:tag .         # build image from Dockerfile\ndocker images                       # list local images\ndocker run -d -p hostPort:containerPort --name NAME IMAGE\ndocker ps / docker ps -a            # running / all containers\ndocker logs CONTAINER               # stdout/stderr\ndocker exec -it CONTAINER bash      # shell inside running container\ndocker stop CONTAINER && docker rm CONTAINER\ndocker rmi IMAGE                    # remove image\ndocker system prune -f              # clean all unused\n\n# Tag for JFrog registry\ndocker tag devops-app:1.0.0 ARTIFACTORY_IP:8083/devops-docker-local/devops-app:1.0.0\ndocker push ARTIFACTORY_IP:8083/devops-docker-local/devops-app:1.0.0\n```\n\n## insecure-registries Fix\n```json\n// /etc/docker/daemon.json\n{\"insecure-registries\": [\"ARTIFACTORY_IP:8083\"]}\n```\n\n## Tomorrow — Day 14\nFull pipeline capstone + Kubernetes introduction + mini project connecting all tools"
  },
  "pdfUrl": "/pdfs/day13.pdf",
  "images": []
};
