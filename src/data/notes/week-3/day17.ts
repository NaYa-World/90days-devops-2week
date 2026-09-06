import { BootcampDay } from '../types';

export const day17: BootcampDay = {
  "day": 17,
  "title": "Docker — Containerisation, Dockerfile & Core Commands",
  "subtitle": "VM vs Container · Architecture · Install · Dockerfile Instructions · docker build · docker run · Lifecycle",
  "color": "#2496ED",
  "trainerNote": "Docker is not just a tool — it is a mental model shift. Stop thinking about servers. Start thinking about immutable, portable processes. Every concept here maps directly to Kubernetes next week.",
  "engineerNote": "Run Docker on Amazon Linux 2023. The Dockerfile you write today is the same artifact your Jenkins pipeline will build tomorrow and Kubernetes will deploy next week. Get it right.",
  "goal": {
    "icon": "🐳",
    "title": "🐳 Day 17 Goal",
    "description": "By end of Day 17: Docker installed on your EC2, a production-quality Dockerfile written for your Spring Boot app, image built and running as a container with port mapping. Expected output: docker ps shows your running container, curl http://EC2_IP:8100/actuator/health returns HTTP 200, docker logs -f shows Spring Boot startup. You understand the difference between RUN, CMD, and ENTRYPOINT without looking at notes."
  },
  "schedule": [
    { "time": "09:00-09:20", "phase": "RECALL", "activity": "Jenkins pipeline cold check", "why": "From memory: the 5 Jenkins pipeline stages for your Java app. If you cannot name them, review Day 10-11 before Docker." },
    { "time": "09:20-10:15", "phase": "THEORY", "activity": "VM vs Container, Docker Architecture, Key Terms", "why": "The interview question what is Docker is answered by understanding what problem it solves: dependency hell, environment mismatch." },
    { "time": "10:15-10:30", "phase": "BREAK", "activity": "Break", "why": "" },
    { "time": "10:30-12:00", "phase": "INSTALL", "activity": "Install Docker on Amazon Linux 2023 and verify", "why": "yum install, systemctl enable, usermod. Three commands to memorise. usermod -aG docker ec2-user is the step everyone forgets." },
    { "time": "12:00-12:45", "phase": "BREAK", "activity": "Lunch", "why": "" },
    { "time": "12:45-14:30", "phase": "HANDS-ON", "activity": "Write Dockerfile — all instructions, layer caching", "why": "FROM, WORKDIR, COPY, RUN, EXPOSE, ENTRYPOINT. Each instruction is a layer. Order matters for cache." },
    { "time": "14:30-15:30", "phase": "HANDS-ON", "activity": "docker build and docker run — all flags, port mapping, lifecycle", "why": "Build with -t tag, run with -d -p, exec into shell, check logs, stop gracefully." },
    { "time": "15:30-15:45", "phase": "BREAK", "activity": "Break", "why": "" },
    { "time": "15:45-16:45", "phase": "PROJECT", "activity": "Mini Project: Containerise the currency-conversion Spring Boot app", "why": "" },
    { "time": "16:45-17:00", "phase": "COMMIT", "activity": "Day 17 notes and quiz and commit Dockerfile to repo", "why": "" }
  ],
  "concepts": [
    {
      "icon": "🐳",
      "title": "What Docker Actually Is",
      "description": "Docker is an open-source platform for OS-level virtualisation, written in Go, released 2013. It packages an application with ALL its dependencies into a container so it runs identically on any machine. Key terms: Image = read-only blueprint (OS + app + deps). Container = running instance of an image (writable layer on top). Registry = storage for images (Docker Hub, JFrog, ECR). Daemon = dockerd background service.",
      "analogy": "Docker solves the works on my machine problem. Dev laptop, CI server, and production server all run the exact same container image — same OS packages, same Java version, same config."
    },
    {
      "icon": "🖥",
      "title": "VM vs Container — The Core Distinction",
      "description": "VM: Hypervisor → Full Guest OS per VM → App. Each VM boots a complete OS (GBs, minutes to start, RAM-heavy). Container: Host OS → Docker Engine → Container shares host kernel → App. Containers start in milliseconds, use MBs. Docker performs OS-level virtualisation. VMware performs hardware-level virtualisation.",
      "analogy": "VMs are houses — each has its own foundation, plumbing, wiring. Containers are apartments — they share the building infrastructure but have isolated living space."
    },
    {
      "icon": "🏗",
      "title": "Docker Architecture — Client-Server",
      "description": "CLI (docker commands) sends REST API calls to Docker Daemon (dockerd) which manages Images, Containers, Networks, Volumes and communicates with the Registry (Docker Hub / ECR / GHCR). When you run docker run, the CLI sends a REST request to dockerd, which pulls the image from the registry, creates a container using Linux namespaces and cgroups, and starts the process.",
      "analogy": "The Docker CLI is your remote control. dockerd is the TV. The registry is the streaming service. You press a button (docker run), the TV fetches the content (pull image), and plays it (run container)."
    },
    {
      "icon": "📋",
      "title": "Dockerfile Layer Caching",
      "description": "Each Dockerfile instruction (RUN, COPY, ADD) creates a layer. Docker caches each layer. On rebuild, if an instruction and everything before it is unchanged, Docker reuses the cached layer instantly. Put things that change RARELY at the top (base image, dependency installs). Put things that change OFTEN at the bottom (your app code). Chain RUN commands with && to reduce layers.",
      "analogy": "Layers are like a stack of pancakes. If you change the bottom pancake (base image), all above must be remade. Put the most stable ingredients at the bottom, most frequently changed at the top."
    },
    {
      "icon": "⚡",
      "title": "RUN vs CMD vs ENTRYPOINT — Interview Critical",
      "description": "RUN: at IMAGE BUILD time. Baked into layer. Use for: installing packages, creating dirs, compiling. CMD: at CONTAINER START time. Default command. Overridden by passing a command to docker run. ENTRYPOINT: at CONTAINER START time. Fixed executable. Only overridable with --entrypoint flag. Best pattern: ENTRYPOINT ['java', '-jar'] + CMD ['app.jar'] — java -jar is fixed, app.jar is the swappable default arg.",
      "analogy": "RUN = kitchen prep before the dish is served. CMD = suggested serving method (customer can ask for different). ENTRYPOINT = chef signature technique (non-negotiable)."
    },
    {
      "icon": "📁",
      "title": "COPY vs ADD",
      "description": "COPY: copies files from host to container. Simple and predictable. Use for everything. ADD: like COPY but also auto-extracts .tar.gz files and accepts remote URLs. Use ONLY when you need these specific extras. The implicit auto-extraction behaviour of ADD causes hard-to-debug surprises. Prefer COPY for clarity.",
      "analogy": "COPY is a simple file transfer. ADD is a file transfer with magic powers (auto-extraction). Use the simple tool unless you need the magic."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 6,
      "sessionTitle": "STEP 1 — Install Docker on Amazon Linux 2023",
      "sections": [
        {
          "label": "Switch to root, install, enable, verify",
          "lines": [
            { "type": "comment", "text": "Switch to root (on Amazon Linux 2023, sudo su - = you are root, no sudo needed after)" },
            { "type": "cmd", "prompt": "$", "text": "sudo su -" },
            { "type": "cmd", "prompt": "#", "text": "yum install docker -y" },
            { "type": "cmd", "prompt": "#", "text": "systemctl start docker" },
            { "type": "cmd", "prompt": "#", "text": "systemctl enable docker" },
            { "type": "cmd", "prompt": "#", "text": "systemctl status docker" },
            { "type": "ok", "text": "Active: active (running) since ..." },
            { "type": "cmd", "prompt": "#", "text": "docker --version" },
            { "type": "ok", "text": "Docker version 25.0.3, build 4debf41" },
            { "type": "comment", "text": "Allow ec2-user to run docker without sudo (MUST logout and login after)" },
            { "type": "cmd", "prompt": "#", "text": "usermod -aG docker ec2-user" },
            { "type": "warn", "text": "logout and SSH back in for the group change to take effect" },
            { "type": "comment", "text": "For Jenkins EC2: add jenkins user to docker group too" },
            { "type": "cmd", "prompt": "#", "text": "usermod -aG docker jenkins" },
            { "type": "cmd", "prompt": "#", "text": "systemctl restart jenkins" }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 6,
      "sessionTitle": "STEP 2 — Write a Production Dockerfile",
      "sections": [
        {
          "label": "Complete Dockerfile — currency-conversion Spring Boot app",
          "lines": [
            { "type": "comment", "text": "Dockerfile: capital D, no extension, at project root" },
            { "type": "output", "text": "FROM amazoncorretto:21-alpine" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "LABEL maintainer="nayagk"" },
            { "type": "output", "text": "LABEL app="currency-conversion"" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "WORKDIR /app" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "COPY target/currency-conversion*.jar app.jar" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "EXPOSE 8100" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:8100/actuator/health || exit 1" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "ENTRYPOINT ["java", "-jar"]" },
            { "type": "output", "text": "CMD ["app.jar"]" }
          ]
        },
        {
          "label": "All Dockerfile instructions — quick reference",
          "lines": [
            { "type": "comment", "text": "FROM — sets base image. MUST be first." },
            { "type": "output", "text": "FROM amazoncorretto:21-alpine" },
            { "type": "comment", "text": "RUN — at BUILD time, bakes into layer. Chain with && to reduce layers." },
            { "type": "output", "text": "RUN apt update -y && apt install -y git && rm -rf /var/lib/apt/lists/*" },
            { "type": "comment", "text": "WORKDIR — sets working dir (creates if missing)" },
            { "type": "output", "text": "WORKDIR /app" },
            { "type": "comment", "text": "COPY — copies from host to container (prefer over ADD)" },
            { "type": "output", "text": "COPY target/app.jar app.jar" },
            { "type": "comment", "text": "ADD — like COPY but also auto-extracts .tar.gz and accepts URLs" },
            { "type": "output", "text": "ADD archive.tar.gz /opt/" },
            { "type": "comment", "text": "ENV — runtime variable (available when container runs)" },
            { "type": "output", "text": "ENV SPRING_PROFILES_ACTIVE=prod" },
            { "type": "comment", "text": "ARG — build-time variable only (NOT available at runtime)" },
            { "type": "output", "text": "ARG JAR_FILE=target/*.jar" },
            { "type": "comment", "text": "EXPOSE — documents port only. Does NOT publish. Needs -p in docker run." },
            { "type": "output", "text": "EXPOSE 8100" },
            { "type": "comment", "text": "USER — sets non-root user. Security best practice." },
            { "type": "output", "text": "USER appuser" },
            { "type": "comment", "text": "LABEL — metadata key-value pairs" },
            { "type": "output", "text": "LABEL maintainer="team@example.com"" },
            { "type": "comment", "text": "VOLUME — declares anonymous mount point" },
            { "type": "output", "text": "VOLUME ["/data"]" },
            { "type": "comment", "text": "HEALTHCHECK — tests container health on schedule" },
            { "type": "output", "text": "HEALTHCHECK --interval=30s CMD curl -f http://localhost:8080/health || exit 1" },
            { "type": "comment", "text": "CMD — default command at start. Overridden by docker run." },
            { "type": "output", "text": "CMD ["java", "-jar", "app.jar"]" },
            { "type": "comment", "text": "ENTRYPOINT — fixed executable. CMD becomes its default args." },
            { "type": "output", "text": "ENTRYPOINT ["java", "-jar"]" }
          ]
        }
      ]
    },
    {
      "sessionNumber": 3,
      "totalSessions": 6,
      "sessionTitle": "STEP 3 — docker build",
      "sections": [
        {
          "label": "Build commands with all flags",
          "lines": [
            { "type": "comment", "text": "Basic build" },
            { "type": "cmd", "prompt": "$", "text": "docker build ." },
            { "type": "comment", "text": "-t: tag the image as name:tag" },
            { "type": "cmd", "prompt": "$", "text": "docker build -t nayagk/currency-conversion:latest ." },
            { "type": "ok", "text": "Successfully tagged nayagk/currency-conversion:latest" },
            { "type": "comment", "text": "-f: use a different Dockerfile name" },
            { "type": "cmd", "prompt": "$", "text": "docker build -f Dockerfile.prod -t myapp:prod ." },
            { "type": "comment", "text": "--build-arg: pass ARG values defined in Dockerfile" },
            { "type": "cmd", "prompt": "$", "text": "docker build --build-arg APP_VERSION=2.0 -t myapp:2.0 ." },
            { "type": "comment", "text": "--no-cache: force full rebuild" },
            { "type": "cmd", "prompt": "$", "text": "docker build --no-cache -t nayagk/currency-conversion:latest ." },
            { "type": "cmd", "prompt": "$", "text": "docker images" },
            { "type": "ok", "text": "nayagk/currency-conversion   latest   a1b2c3d4   5 seconds ago   208MB" }
          ]
        }
      ]
    },
    {
      "sessionNumber": 4,
      "totalSessions": 6,
      "sessionTitle": "STEP 4 — docker run",
      "sections": [
        {
          "label": "docker run flags",
          "lines": [
            { "type": "comment", "text": "-d: detached (background). -p: host_port:container_port. --name: named container." },
            { "type": "cmd", "prompt": "$", "text": "docker run -d -p 8100:8100 --name currency-app nayagk/currency-conversion:latest" },
            { "type": "ok", "text": "7e3f9a2b1c4d8e5f6a7b8c9d0e1f2a3b" },
            { "type": "cmd", "prompt": "$", "text": "docker ps" },
            { "type": "ok", "text": "currency-app   nayagk/currency-conversion:latest   Up 3 seconds   0.0.0.0:8100->8100/tcp" },
            { "type": "comment", "text": "-it: interactive terminal. Use -itd for ubuntu/alpine containers." },
            { "type": "cmd", "prompt": "$", "text": "docker run -itd ubuntu" },
            { "type": "comment", "text": "-e: pass environment variable into container" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d -e SPRING_PROFILES_ACTIVE=prod -p 8100:8100 nayagk/currency-conversion:latest" },
            { "type": "comment", "text": "-v: bind mount (host_path:container_path)" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d -v /home/ec2-user/data:/app/data nayagk/currency-conversion:latest" },
            { "type": "comment", "text": "--memory and --cpus: resource limits" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d --memory=512m --cpus=1.0 -p 8100:8100 nayagk/currency-conversion:latest" },
            { "type": "comment", "text": "--rm: auto-remove container when it exits" },
            { "type": "cmd", "prompt": "$", "text": "docker run --rm ubuntu echo hello" },
            { "type": "comment", "text": "Multiple ports" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d -p 8080:8080 -p 9090:9090 myimage" }
          ]
        }
      ]
    },
    {
      "sessionNumber": 5,
      "totalSessions": 6,
      "sessionTitle": "STEP 5 — Container Lifecycle and docker exec",
      "sections": [
        {
          "label": "Start, stop, kill, remove",
          "lines": [
            { "type": "cmd", "prompt": "$", "text": "docker ps" },
            { "type": "comment", "text": "All containers (running + stopped + exited)" },
            { "type": "cmd", "prompt": "$", "text": "docker ps -a" },
            { "type": "comment", "text": "IDs only. Use -q in bulk operations." },
            { "type": "cmd", "prompt": "$", "text": "docker ps -q" },
            { "type": "cmd", "prompt": "$", "text": "docker ps -aq" },
            { "type": "comment", "text": "Stop gracefully: SIGTERM then wait 10s then SIGKILL" },
            { "type": "cmd", "prompt": "$", "text": "docker stop currency-app" },
            { "type": "comment", "text": "Kill immediately: SIGKILL (no cleanup)" },
            { "type": "cmd", "prompt": "$", "text": "docker kill currency-app" },
            { "type": "cmd", "prompt": "$", "text": "docker start currency-app" },
            { "type": "cmd", "prompt": "$", "text": "docker restart currency-app" },
            { "type": "cmd", "prompt": "$", "text": "docker rm currency-app" },
            { "type": "cmd", "prompt": "$", "text": "docker rm -f currency-app" },
            { "type": "warn", "text": "CORRECT bulk ops — must use -q flag for IDs only" },
            { "type": "cmd", "prompt": "$", "text": "docker stop " },
            { "type": "cmd", "prompt": "$", "text": "docker rm " },
            { "type": "cmd", "prompt": "$", "text": "docker rmi -f " },
            { "type": "err", "text": "WRONG: docker rmi  — returns formatted table text not IDs" }
          ]
        },
        {
          "label": "docker exec — shell inside running container",
          "lines": [
            { "type": "comment", "text": "Open bash shell (non-alpine images)" },
            { "type": "cmd", "prompt": "$", "text": "docker exec -it currency-app /bin/bash" },
            { "type": "comment", "text": "Alpine images — use sh (no bash)" },
            { "type": "cmd", "prompt": "$", "text": "docker exec -it currency-app /bin/sh" },
            { "type": "comment", "text": "Run single command without interactive shell" },
            { "type": "cmd", "prompt": "$", "text": "docker exec currency-app ls -la /app" },
            { "type": "comment", "text": "Check environment variables inside container" },
            { "type": "cmd", "prompt": "$", "text": "docker exec currency-app env" },
            { "type": "warn", "text": "exec = run command in ALREADY RUNNING container. run = create NEW container from image." }
          ]
        }
      ]
    },
    {
      "sessionNumber": 6,
      "totalSessions": 6,
      "sessionTitle": "STEP 6 — Logs, Inspect, Stats and Image Management",
      "sections": [
        {
          "label": "Logs inspect stats",
          "lines": [
            { "type": "cmd", "prompt": "$", "text": "docker logs -f currency-app" },
            { "type": "cmd", "prompt": "$", "text": "docker logs --tail 100 currency-app" },
            { "type": "cmd", "prompt": "$", "text": "docker inspect currency-app" },
            { "type": "cmd", "prompt": "$", "text": "docker inspect currency-app | grep -i ipaddress" },
            { "type": "cmd", "prompt": "$", "text": "docker stats" }
          ]
        },
        {
          "label": "Image management",
          "lines": [
            { "type": "cmd", "prompt": "$", "text": "docker images" },
            { "type": "cmd", "prompt": "$", "text": "docker images -q" },
            { "type": "cmd", "prompt": "$", "text": "docker rmi nayagk/currency-conversion:latest" },
            { "type": "comment", "text": "CORRECT: remove all images" },
            { "type": "cmd", "prompt": "$", "text": "docker rmi -f " },
            { "type": "cmd", "prompt": "$", "text": "docker image prune" },
            { "type": "cmd", "prompt": "$", "text": "docker system prune -a" }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "Got Permission Denied Connecting to Docker Daemon",
      "steps": [
        { "num": 1, "title": "Add user to docker group", "cmd": "sudo usermod -aG docker karthikganji" },
        { "num": 2, "title": "Logout and log back in — group changes require new session", "cmd": "exit  # then SSH back in" },
        { "num": 3, "title": "Verify group membership", "cmd": "groups" },
        { "num": 4, "title": "For Jenkins: add jenkins user and restart", "cmd": "sudo usermod -aG docker jenkins && sudo systemctl restart jenkins" }
      ]
    },
    {
      "title": "Common Docker Errors and Fixes",
      "steps": [
        { "num": 1, "title": "Cannot connect to Docker daemon", "description": "Fix: systemctl start docker" },
        { "num": 2, "title": "COPY failed: file not found in build context", "description": "Fix: Run mvn package first. Confirm you are in the project root when running docker build." },
        { "num": 3, "title": "Port is already allocated", "description": "Fix: docker ps to find conflicting container. docker stop it, or use a different host port." },
        { "num": 4, "title": "/bin/bash: No such file or directory", "description": "Fix: Alpine has no bash. Use /bin/sh instead." },
        { "num": 5, "title": "No space left on device during build", "description": "Fix: docker system prune -a" },
        { "num": 6, "title": "Container exits immediately — Exited (1), docker logs empty", "description": "Fix: docker run --entrypoint /bin/sh -it image to get a shell, then manually run the CMD to see the actual error." },
        { "num": 7, "title": "Lombok compilation errors with Java 21", "description": "Fix: Upgrade lombok to 1.18.30 or higher in pom.xml." },
        { "num": 8, "title": "docker rmi fails — container is using the image", "description": "Fix: docker rm the container first, then docker rmi the image. Or use docker rmi -f." }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Putting app startup in RUN instead of CMD or ENTRYPOINT",
      "description": "RUN only executes during IMAGE BUILD. If you write RUN java -jar app.jar, it tries to start your app during the build and fails.",
      "fix": "Use CMD or ENTRYPOINT for startup commands. Use RUN only for build-time setup: installing packages, creating directories, compiling."
    },
    {
      "mistake": "Using docker rmi  to remove all images",
      "description": "docker images returns a formatted table with headers (REPOSITORY TAG IMAGE_ID SIZE). Passing that text to docker rmi causes errors. This is in almost every student notebook and it is wrong.",
      "fix": "Use docker rmi -f . The -q flag returns ONLY image IDs. Same for containers: docker rm  not docker rm ."
    },
    {
      "mistake": "Thinking EXPOSE actually publishes the port",
      "description": "EXPOSE 8080 is documentation only. Students write EXPOSE and then wonder why they cannot access the app.",
      "fix": "EXPOSE is metadata. To actually publish: docker run -p 8080:8080. On EC2, also open port 8080 in the Security Group Inbound Rules."
    },
    {
      "mistake": "Running containers as root",
      "description": "By default containers run as root. If the app is compromised, the attacker has root inside the container.",
      "fix": "Add USER instruction. RUN adduser -D appuser then USER appuser. Most base images include a built-in non-root user. Use it."
    },
    {
      "mistake": "Not using .dockerignore",
      "description": "Without .dockerignore the Maven target/ folder (hundreds of MBs) is sent to the Docker daemon on every build.",
      "fix": "Create .dockerignore at project root: target/ on one line then !target/*.jar to include only the jar."
    }
  ],
  "project": {
    "tag": "Day 17 Project",
    "title": "Containerise the Currency-Conversion Spring Boot App",
    "timeEstimate": "80 min",
    "goal": "Write a Dockerfile, build the image, run the container with port mapping, exec into it, check logs, and verify the app responds. This Dockerfile goes into Jenkins tomorrow.",
    "checklist": [
      "Maven build successful: mvn package -DskipTests produces target/*.jar",
      "Dockerfile created at project root using amazoncorretto:21-alpine base",
      "Image built: docker build -t nayagk/currency-conversion:latest . exits 0",
      "docker images shows your image with correct name and tag",
      "Container running: docker run -d -p 8100:8100 --name currency-app",
      "docker ps shows container STATUS = Up",
      "curl http://localhost:8100/actuator/health returns status UP",
      "docker logs -f currency-app shows Spring Boot started successfully",
      "docker exec -it currency-app /bin/sh gets you a shell inside",
      "docker stop currency-app stops the container gracefully",
      ".dockerignore created excluding target/ but including target/*.jar"
    ],
    "codeBlock": {
      "title": "Dockerfile",
      "lines": [
        "FROM amazoncorretto:21-alpine",
        "",
        "LABEL maintainer=nayagk",
        "",
        "WORKDIR /app",
        "",
        "COPY target/currency-conversion*.jar app.jar",
        "",
        "EXPOSE 8100",
        "",
        "HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:8100/actuator/health || exit 1",
        "",
        "ENTRYPOINT [java, -jar]",
        "CMD [app.jar]"
      ]
    },
    "expectedOutput": "docker ps STATUS: Up | curl localhost:8100/actuator/health returns status UP"
  },
  "interview": [
    {
      "question": "What is Docker and how does it differ from a Virtual Machine?",
      "answer": "Docker is a containerisation platform that packages an application with all its dependencies into a container. Containers perform OS-level virtualisation — they share the host Linux kernel and are isolated using Linux namespaces and cgroups. A VM uses hardware-level virtualisation — it boots a complete guest OS per VM. The practical difference: a container starts in milliseconds and uses MBs; a VM takes minutes and uses GBs. Docker solves the works on my machine problem — the container image includes the exact runtime environment, so dev, staging, and production run the exact same binary."
    },
    {
      "question": "What is the difference between RUN, CMD, and ENTRYPOINT?",
      "answer": "RUN executes at image build time and bakes the result into an image layer — I use it to install packages, create directories, or compile code. CMD and ENTRYPOINT both execute at container start time. CMD is the default command that runs when the container starts but can be overridden by passing a command to docker run. ENTRYPOINT is the fixed executable — it always runs. The pattern I use in production: ENTRYPOINT ['java', '-jar'] with CMD ['app.jar']. java -jar always runs and app.jar is the default argument that can be swapped. The most common beginner mistake is putting application startup in RUN — that fails because RUN only runs during the build."
    },
    {
      "question": "Why use amazoncorretto:21-alpine instead of ubuntu?",
      "answer": "Three reasons. Size: alpine-based images are 5MB vs 80MB for Ubuntu base layer — final image is 200MB vs 600MB. Security: Alpine is minimal with almost no packages, smaller attack surface, far fewer CVEs. Match: Amazon Corretto on Alpine matches our AWS EC2 deployment environment, Amazon's maintained JDK with security patches and no licensing fees. I explicitly match Java 21 in the base image to the version in pom.xml to avoid runtime surprises."
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "Which instruction runs at CONTAINER START time and can be overridden by passing a command to docker run?",
      "options": [
        { "text": "A) RUN", "isCorrect": false },
        { "text": "B) CMD", "isCorrect": true },
        { "text": "C) ENTRYPOINT", "isCorrect": false },
        { "text": "D) COPY", "isCorrect": false }
      ],
      "explanation": "CMD sets the default command for container startup and is overridden when you pass a command to docker run. RUN runs at build time only. ENTRYPOINT also runs at startup but arguments from docker run are passed TO ENTRYPOINT instead of replacing it."
    },
    {
      "num": 2,
      "question": "What does EXPOSE 8080 in a Dockerfile actually do?",
      "options": [
        { "text": "A) Publishes port 8080 on the host", "isCorrect": false },
        { "text": "B) Documents that the container application listens on 8080 — does NOT publish the port", "isCorrect": true },
        { "text": "C) Opens port 8080 in the EC2 Security Group", "isCorrect": false },
        { "text": "D) Blocks all other ports", "isCorrect": false }
      ],
      "explanation": "EXPOSE is metadata only. To actually make it reachable from the host: docker run -p 8080:8080. On AWS, you also need the EC2 Security Group inbound rule."
    },
    {
      "num": 3,
      "question": "What is wrong with: docker rmi ?",
      "options": [
        { "text": "A) docker images is not a valid command", "isCorrect": false },
        { "text": "B) Nothing — this is correct", "isCorrect": false },
        { "text": "C) docker images returns formatted table text not image IDs — rmi fails to parse it", "isCorrect": true },
        { "text": "D) You need sudo to remove images", "isCorrect": false }
      ],
      "explanation": "docker images returns a human-readable table. Correct: docker rmi -f . The -q flag returns ONLY image IDs."
    },
    {
      "num": 4,
      "question": "After usermod -aG docker ec2-user, docker commands still need sudo. Why?",
      "options": [
        { "text": "A) Docker is not installed correctly", "isCorrect": false },
        { "text": "B) The user has not logged out and back in — group changes only take effect in new sessions", "isCorrect": true },
        { "text": "C) Amazon Linux 2023 does not support user groups", "isCorrect": false },
        { "text": "D) You need to restart Docker daemon", "isCorrect": false }
      ],
      "explanation": "Linux group membership changes are read when a new session starts. The user must logout and SSH back in."
    },
    {
      "num": 5,
      "question": "What is the difference between docker stop and docker kill?",
      "options": [
        { "text": "A) They are identical", "isCorrect": false },
        { "text": "B) docker stop sends SIGTERM gracefully, waits 10s, then SIGKILL. docker kill sends SIGKILL immediately.", "isCorrect": true },
        { "text": "C) docker kill only works on paused containers", "isCorrect": false },
        { "text": "D) docker stop removes the container after stopping", "isCorrect": false }
      ],
      "explanation": "docker stop sends SIGTERM — the app can catch it and perform graceful shutdown. After 10 seconds, Docker sends SIGKILL. docker kill skips the grace period entirely. Always prefer docker stop unless the container is frozen."
    }
  ],
  "github": {
    "filename": "devops-90days/day-17/README.md",
    "commitMessage": "feat: Add Docker Dockerfile and containerise currency-conversion app",
    "template": "# Day 17 — Docker
**Date:** YYYY-MM-DD | **Status:** Complete

## Roadmap Position
Jenkins → Maven → SonarQube → JFrog → [Docker HERE] → K8s

## Key Commands
\\\"
  }
};
