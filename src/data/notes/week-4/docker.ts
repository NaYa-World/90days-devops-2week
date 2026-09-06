import { BootcampDay } from '../types';

export const dockerModule: BootcampDay = {
  day: 17,
  title: "Docker — Containerisation Mastery",
  subtitle: "Dockerfile · Images · Containers · Volumes · Compose · CI/CD Integration · Security",
  color: "#2496ED",
  trainerNote: "Docker is the foundation of every modern DevOps pipeline. You cannot do Kubernetes, CI/CD, or cloud deployments without understanding containers at this level. Every instruction here comes from real production mistakes.",
  engineerNote: "I've debugged 2am incidents where the root cause was a missing ENTRYPOINT, a container running as root, or a volume that silently lost data. Understand the why behind every command — not just the command itself.",
  goal: {
    icon: "🐳",
    title: "Docker Module Goal",
    description: "By the end of this module: you can write a production-grade multi-stage Dockerfile, run and debug containers confidently, manage volumes and networking, deploy a multi-service stack with Docker Compose, push images to a registry, and integrate Docker into a Jenkins pipeline with Trivy scanning. Expected output: a working Docker Compose stack with Spring Boot + MySQL, image pushed to Docker Hub, Trivy scan passing."
  },
  schedule: [
    {
      time: "09:00–09:30",
      phase: "RECALL",
      activity: "Cold-start: draw the Docker architecture from memory",
      why: "Client (CLI) → dockerd → containerd → runc → container. If you cannot draw this, you are operating a black box. Every production issue gets clearer when you know which layer broke."
    },
    {
      time: "09:30–10:30",
      phase: "THEORY",
      activity: "What is Docker — OS-level virtualisation, VM vs Container",
      why: "The interviewer's first Docker question is always 'explain Docker vs VM'. Know the kernel-sharing model, startup time difference, and why containers are measured in MB not GB."
    },
    {
      time: "10:30–10:45",
      phase: "BREAK",
      activity: "Break",
      why: ""
    },
    {
      time: "10:45–12:30",
      phase: "HANDS-ON",
      activity: "Install Docker on Amazon Linux 2023 + Dockerfile instructions deep-dive",
      why: "Type every install command. Do not paste. Write your first Dockerfile for the Spring Boot app — FROM, WORKDIR, COPY, EXPOSE, ENTRYPOINT. Understand what each instruction does at the layer level."
    },
    {
      time: "12:30–13:15",
      phase: "BREAK",
      activity: "Lunch",
      why: ""
    },
    {
      time: "13:15–15:00",
      phase: "HANDS-ON",
      activity: "docker build, docker run, container lifecycle + volumes + networking",
      why: "Build your image, run it, exec into it, check logs, inspect it, kill it. Then do volumes (bind mount + named) and network DNS. The bulk commands with -q flag — understand why $(docker images) is wrong."
    },
    {
      time: "15:00–15:15",
      phase: "BREAK",
      activity: "Break",
      why: ""
    },
    {
      time: "15:15–16:30",
      phase: "HANDS-ON",
      activity: "Multi-stage builds + Docker Compose v2 + Registry push",
      why: "Reduce your image from 600MB to 180MB with multi-stage. Write docker-compose.yml with healthchecks. Push to Docker Hub. Add Trivy scan. Wire it into your Jenkins pipeline."
    },
    {
      time: "16:30–17:00",
      phase: "DOCUMENT",
      activity: "GitHub notes + Quiz",
      why: "Open your notes repo. Write your own explanation of RUN vs CMD vs ENTRYPOINT. Score below 70% on the quiz? Re-read the Dockerfile sections before tomorrow."
    }
  ],
  concepts: [
    {
      icon: "🐳",
      title: "What is Docker?",
      description: "Docker is an open-source platform for OS-level virtualisation — packaging an app with all its dependencies so it runs identically anywhere. Written in Go, released March 2013. Containers share the HOST OS kernel — no full OS boot per container. That is why they start in milliseconds. Solves the 'works on my machine' problem permanently.",
      analogy: "A VM is a house (its own foundation, walls, electricity). A container is a shipping container — standardised box, runs on any ship (host), shares the ship's engine (kernel). Much lighter, much faster to deploy."
    },
    {
      icon: "⚔️",
      title: "VM vs Container",
      description: "VM: Hypervisor → Full Guest OS per VM → App. RAM-heavy (GBs), slow start (minutes), isolated at hardware level. Container: Host OS → Docker Engine → Container (shares kernel) → App. Lightweight (MBs), fast start (milliseconds), isolated at process level using Linux namespaces and cgroups.",
      analogy: "VM = a separate apartment with its own kitchen, bathroom, walls. Container = a room in a shared flat — own space, shared building infrastructure. Much cheaper to spin up a new room than build a new flat."
    },
    {
      icon: "🏗️",
      title: "Docker Architecture (Client–Server)",
      description: "CLI sends commands via REST API → dockerd (daemon) manages images, containers, networks, volumes → containerd (OCI runtime) → runc creates Linux namespaces and cgroups → container process. Registry (Docker Hub / ECR / GHCR) stores images. Kubernetes bypasses dockerd and talks directly to containerd — which is why Docker was deprecated as a K8s runtime in 1.24.",
      analogy: "docker CLI is like a TV remote. dockerd is the smart TV OS. containerd is the display driver. runc is the actual pixel renderer. You operate the remote — you don't need to know how pixels work, but seniors understand every layer."
    },
    {
      icon: "📋",
      title: "Dockerfile Instructions — The Critical 3",
      description: "RUN: Executes at IMAGE BUILD time. Baked into an image layer permanently. Use for: install packages, create dirs, compile. CMD: Runs at CONTAINER START time. Can be OVERRIDDEN by passing a command to docker run. Sets the default command. ENTRYPOINT: Runs at CONTAINER START time. Cannot be overridden by regular docker run args — args become parameters to ENTRYPOINT. Only overridable with --entrypoint flag. Pattern: ENTRYPOINT = executable, CMD = default args.",
      analogy: "RUN = installing apps on a new laptop (happens once, baked in). CMD = the default browser that opens on startup (you can change it by clicking a different browser). ENTRYPOINT = the locked-down kiosk OS that always runs a specific app — you can only change the input, not the app itself."
    },
    {
      icon: "📦",
      title: "Image Layers & Caching",
      description: "Every RUN, COPY, ADD instruction creates a new read-only layer. Layers are cached — if nothing changed since last build, Docker reuses the cached layer (massive speed improvement). Order instructions from least-changing to most-changing: system packages first, application dependencies second, source code last. Chain RUN commands with && to reduce layer count. Use .dockerignore to exclude files from build context (like target/ dir).",
      analogy: "Image layers are like a Git commit history — each layer is a diff on top of the previous. If you change the last line of code, only the last layer rebuilds. If you put COPY . . before RUN npm install, every code change triggers a full npm install. Wrong order = slow builds."
    },
    {
      icon: "🌐",
      title: "Docker Networking",
      description: "bridge (default): Containers get private IPs. Custom bridge networks support DNS resolution by container name — default bridge does NOT. host: Container shares host's network stack, no port mapping needed, Linux only. none: Completely isolated, no network. KEY: EXPOSE in Dockerfile is documentation only — it does NOT publish the port. Publishing requires -p host:container at docker run time. On AWS EC2, you also need to allow the port in Security Group Inbound Rules.",
      analogy: "EXPOSE is like writing the apartment number on a door. The door is still locked. -p is giving someone the actual key AND unlocking it. Security Group is the building entrance security guard — even with a key, you need their approval."
    },
    {
      icon: "💾",
      title: "Docker Volumes — 3 Methods",
      description: "1. Anonymous (VOLUME in Dockerfile): Docker manages path, random name, rarely used in production. 2. Bind Mount (-v /host/path:/container/path): You control the host path. Good for dev (inject configs). Brittle in prod — host path must exist, permissions must match, machine-specific. 3. Named Volume (docker volume create mydata + -v mydata:/app/data): Docker manages storage, survives container deletion, portable. Always use named volumes in production — never bind mounts. tmpfs: in-memory mount for secrets/tokens — never written to disk.",
      analogy: "Anonymous = hotel room safe (auto-assigned). Bind mount = bringing your own USB drive from home (works, but specific to your machine). Named volume = renting a storage unit by name (portable, survives hotel checkout, Docker manages the location)."
    },
    {
      icon: "🔧",
      title: "Docker Compose v2",
      description: "Defines and runs multi-container apps via YAML. v2 is built-in to Docker CLI: command is 'docker compose' (no hyphen). v1 was a separate Python binary using 'docker-compose' — now deprecated. The 'version:' key at the top of compose files is obsolete in v2. Key: depends_on without condition: service_healthy only waits for container to START, not service to be READY. Always pair HEALTHCHECK + depends_on condition: service_healthy for databases.",
      analogy: "docker compose is like a recipe card for a full meal — it lists every ingredient (service), how long to cook each (healthcheck), what depends on what (depends_on), and the storage containers to use (volumes). docker run is cooking one dish manually."
    },
    {
      icon: "🔍",
      title: "Trivy Image Scanning",
      description: "Trivy scans Docker images for CVEs in OS packages and app dependencies. --exit-code 0: pipeline continues even if vulnerabilities found (use while learning). --exit-code 1: pipeline FAILS if vulnerabilities found (use in production gates). --severity HIGH,CRITICAL: only report high/critical issues. In Jenkins: run Trivy BEFORE docker push. Never push an unscanned image to a registry. Using Alpine base images dramatically reduces your CVE count — fewer packages = fewer vulnerabilities.",
      analogy: "Trivy is the airport security scanner for your image. exit-code 0 = scanner reports what it finds but lets everyone through (training mode). exit-code 1 = scanner blocks dangerous items (production mode). Alpine images = packing only what you need — fewer items to scan, fewer alerts."
    },
    {
      icon: "🚨",
      title: "Common Beginner Traps",
      description: "1. docker rmi $(docker images) is WRONG — returns formatted table, not IDs. Correct: docker rmi -f $(docker images -q). 2. docker rm $(docker ps -a) is WRONG. Correct: docker rm $(docker ps -aq). 3. EXPOSE does NOT open ports — use -p at docker run. 4. Running as root inside containers is a security vulnerability. 5. Putting application startup in RUN — wrong, use CMD/ENTRYPOINT. 6. centos:7 is EOL (June 2024) — never use for new projects. 7. docker-compose (hyphen) is deprecated — use docker compose.",
      analogy: "These are the DevOps equivalent of not wearing a seatbelt. Each looks fine until the moment it costs you a production incident or a failed security audit."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 4,
      sessionTitle: "Install Docker on Amazon Linux 2023 + Core Lifecycle",
      sections: [
        {
          label: "Install Docker (run as root on Amazon Linux 2023)",
          lines: [
            { type: 'comment', text: "Switch to root — on Amazon Linux 2023 you are already root after this" },
            { type: 'cmd', prompt: "#", text: "sudo su -" },
            { type: 'comment', text: "Install Docker via yum" },
            { type: 'cmd', prompt: "#", text: "yum install docker -y" },
            { type: 'comment', text: "Start Docker service now" },
            { type: 'cmd', prompt: "#", text: "systemctl start docker" },
            { type: 'comment', text: "Enable: auto-start Docker on every reboot" },
            { type: 'cmd', prompt: "#", text: "systemctl enable docker" },
            { type: 'cmd', prompt: "#", text: "systemctl status docker" },
            { type: 'ok', text: "● docker.service - Docker Application Container Engine" },
            { type: 'ok', text: "   Active: active (running) since Sat 2026-08-16 09:00:00 UTC" },
            { type: 'comment', text: "Verify Docker version" },
            { type: 'cmd', prompt: "#", text: "docker version" },
            { type: 'cmd', prompt: "#", text: "docker --version" },
            { type: 'ok', text: "Docker version 25.0.3, build 4debf41" },
            { type: 'comment', text: "Allow ec2-user to run Docker without sudo — then logout and re-login" },
            { type: 'cmd', prompt: "#", text: "usermod -aG docker ec2-user" },
            { type: 'warn', text: "Jenkins also needs this: usermod -aG docker jenkins && systemctl restart jenkins" }
          ]
        },
        {
          label: "Container Lifecycle — run, stop, kill, start, rm",
          lines: [
            { type: 'comment', text: "Pull and run Ubuntu interactively in detached mode" },
            { type: 'cmd', prompt: "$", text: "docker run -itd ubuntu" },
            { type: 'output', text: "a3f2c1d8b9e4..." },
            { type: 'comment', text: "List RUNNING containers" },
            { type: 'cmd', prompt: "$", text: "docker ps" },
            { type: 'ok', text: "CONTAINER ID   IMAGE    COMMAND   CREATED   STATUS    PORTS   NAMES" },
            { type: 'ok', text: "a3f2c1d8b9e4   ubuntu   bash      5s ago    Up 4s             hopeful_morse" },
            { type: 'comment', text: "List ALL containers including stopped and exited" },
            { type: 'cmd', prompt: "$", text: "docker ps -a" },
            { type: 'comment', text: "List IDs of running containers only (-q = quiet, IDs only)" },
            { type: 'cmd', prompt: "$", text: "docker ps -q" },
            { type: 'comment', text: "List IDs of ALL containers" },
            { type: 'cmd', prompt: "$", text: "docker ps -aq" },
            { type: 'comment', text: "Graceful stop: sends SIGTERM, waits 10s, then SIGKILL if needed" },
            { type: 'cmd', prompt: "$", text: "docker stop a3f2c1d8b9e4" },
            { type: 'comment', text: "Immediate kill: sends SIGKILL — no cleanup, use only if frozen" },
            { type: 'cmd', prompt: "$", text: "docker kill a3f2c1d8b9e4" },
            { type: 'comment', text: "Start a stopped container without creating a new one" },
            { type: 'cmd', prompt: "$", text: "docker start a3f2c1d8b9e4" },
            { type: 'comment', text: "Restart (stop + start in one command)" },
            { type: 'cmd', prompt: "$", text: "docker restart a3f2c1d8b9e4" },
            { type: 'comment', text: "Remove a STOPPED container" },
            { type: 'cmd', prompt: "$", text: "docker rm a3f2c1d8b9e4" },
            { type: 'comment', text: "Force remove a RUNNING container" },
            { type: 'cmd', prompt: "$", text: "docker rm -f a3f2c1d8b9e4" }
          ]
        },
        {
          label: "CORRECT Bulk Operations (most notes get this wrong)",
          lines: [
            { type: 'err', text: "WRONG: docker rmi $(docker images)   — returns formatted table, not IDs" },
            { type: 'err', text: "WRONG: docker rm $(docker ps -a)     — same error, returns table text" },
            { type: 'comment', text: "CORRECT: Use -q flag to get IDs only" },
            { type: 'cmd', prompt: "$", text: "docker stop $(docker ps -q)" },
            { type: 'comment', text: "Stop all RUNNING containers" },
            { type: 'cmd', prompt: "$", text: "docker rm $(docker ps -aq)" },
            { type: 'comment', text: "Remove ALL containers (all IDs)" },
            { type: 'cmd', prompt: "$", text: "docker kill $(docker ps -q)" },
            { type: 'comment', text: "Kill all running containers" },
            { type: 'cmd', prompt: "$", text: "docker rmi -f $(docker images -q)" },
            { type: 'comment', text: "Remove ALL images (force)" },
            { type: 'comment', text: "Nuclear cleanup — stop all, remove all containers, remove all images" },
            { type: 'cmd', prompt: "$", text: "docker stop $(docker ps -q) 2>/dev/null; docker rm $(docker ps -aq) 2>/dev/null; docker rmi -f $(docker images -q) 2>/dev/null" },
            { type: 'warn', text: "2>/dev/null silences 'no containers' errors when lists are empty" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 4,
      sessionTitle: "Dockerfile — Build & Run Spring Boot App",
      sections: [
        {
          label: "Write the Dockerfile — currency-conversion Spring Boot app",
          lines: [
            { type: 'comment', text: "Dockerfile must be exactly: capital D, no extension, in project root" },
            { type: 'cmd', prompt: "$", text: "cat Dockerfile" },
            { type: 'output', text: "FROM amazoncorretto:21-alpine" },
            { type: 'output', text: "" },
            { type: 'output', text: "LABEL maintainer=\"nayagk\"" },
            { type: 'output', text: "LABEL app=\"currency-conversion\"" },
            { type: 'output', text: "" },
            { type: 'output', text: "WORKDIR /app" },
            { type: 'output', text: "" },
            { type: 'output', text: "# Copy only the final jar (not entire target/)" },
            { type: 'output', text: "COPY target/currency-conversion*.jar app.jar" },
            { type: 'output', text: "" },
            { type: 'output', text: "# EXPOSE is documentation only — does NOT publish the port" },
            { type: 'output', text: "EXPOSE 8100" },
            { type: 'output', text: "" },
            { type: 'output', text: "# ENTRYPOINT = fixed executable (always java -jar)" },
            { type: 'output', text: "ENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]" },
            { type: 'comment', text: "Why amazoncorretto:21-alpine? Matches Java 21, Alpine keeps image ~200MB vs ~600MB for full JDK" }
          ]
        },
        {
          label: "docker build — all essential flags",
          lines: [
            { type: 'comment', text: "Basic build — . is the build context (current dir)" },
            { type: 'cmd', prompt: "$", text: "docker build ." },
            { type: 'comment', text: "Tag the image: name:tag — ALWAYS tag your builds" },
            { type: 'cmd', prompt: "$", text: "docker build -t nayagk/currency-conversion:latest ." },
            { type: 'comment', text: "Tag with a specific version" },
            { type: 'cmd', prompt: "$", text: "docker build -t nayagk/currency-conversion:1.0 ." },
            { type: 'comment', text: "Use a different Dockerfile name (e.g. Dockerfile.prod)" },
            { type: 'cmd', prompt: "$", text: "docker build -f Dockerfile.prod -t myapp:prod ." },
            { type: 'comment', text: "Pass a build-time argument (received by ARG instruction)" },
            { type: 'cmd', prompt: "$", text: "docker build --build-arg APP_VERSION=2.0 -t myapp:2.0 ." },
            { type: 'comment', text: "Force full rebuild — skip all cached layers" },
            { type: 'cmd', prompt: "$", text: "docker build --no-cache -t nayagk/currency-conversion:latest ." },
            { type: 'ok', text: "Step 1/5 : FROM amazoncorretto:21-alpine" },
            { type: 'ok', text: "Step 2/5 : LABEL maintainer=nayagk" },
            { type: 'ok', text: "Step 3/5 : WORKDIR /app" },
            { type: 'ok', text: "Step 4/5 : COPY target/currency-conversion*.jar app.jar" },
            { type: 'ok', text: "Step 5/5 : ENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]" },
            { type: 'ok', text: "Successfully built d4e9f2a1b3c8" },
            { type: 'ok', text: "Successfully tagged nayagk/currency-conversion:latest" }
          ]
        },
        {
          label: "docker run — all essential flags",
          lines: [
            { type: 'comment', text: "Run with port mapping: -p host_port:container_port" },
            { type: 'cmd', prompt: "$", text: "docker run -d -p 8100:8100 nayagk/currency-conversion:latest" },
            { type: 'comment', text: "-d = detached (background), -p = publish port" },
            { type: 'comment', text: "Named container + memory/CPU limits" },
            { type: 'cmd', prompt: "$", text: "docker run -d --name currency-conversion --memory=512m --cpus=1.0 -p 8100:8100 nayagk/currency-conversion:latest" },
            { type: 'comment', text: "Pass environment variable" },
            { type: 'cmd', prompt: "$", text: "docker run -d -e SPRING_PROFILES_ACTIVE=prod -p 8100:8100 nayagk/currency-conversion:latest" },
            { type: 'comment', text: "Auto-remove container when it exits (for one-off tasks)" },
            { type: 'cmd', prompt: "$", text: "docker run --rm nayagk/currency-conversion:latest" },
            { type: 'comment', text: "Override CMD at docker run time" },
            { type: 'cmd', prompt: "$", text: "docker run -it nayagk/currency-conversion:latest /bin/sh" },
            { type: 'comment', text: "This passes /bin/sh as the argument to ENTRYPOINT — or replaces CMD if no ENTRYPOINT" },
            { type: 'comment', text: "Random host port (-P = auto-assign)" },
            { type: 'cmd', prompt: "$", text: "docker run -d -P nayagk/currency-conversion:latest" },
            { type: 'cmd', prompt: "$", text: "docker port currency-conversion" },
            { type: 'ok', text: "8100/tcp -> 0.0.0.0:49153" }
          ]
        },
        {
          label: "exec, logs, inspect, stats",
          lines: [
            { type: 'comment', text: "Open shell inside running container" },
            { type: 'cmd', prompt: "$", text: "docker exec -it currency-conversion /bin/sh" },
            { type: 'comment', text: "Alpine images: no bash — always use /bin/sh" },
            { type: 'comment', text: "Run a single command without interactive shell" },
            { type: 'cmd', prompt: "$", text: "docker exec currency-conversion env" },
            { type: 'comment', text: "Follow live logs (Ctrl+C to exit)" },
            { type: 'cmd', prompt: "$", text: "docker logs -f currency-conversion" },
            { type: 'comment', text: "Last 100 lines only" },
            { type: 'cmd', prompt: "$", text: "docker logs --tail 100 currency-conversion" },
            { type: 'comment', text: "Full JSON details: IPs, env vars, mounts, port bindings" },
            { type: 'cmd', prompt: "$", text: "docker inspect currency-conversion" },
            { type: 'comment', text: "Extract just the IP address" },
            { type: 'cmd', prompt: "$", text: "docker inspect currency-conversion | grep -i ipaddress" },
            { type: 'ok', text: "\"IPAddress\": \"172.17.0.2\"" },
            { type: 'comment', text: "Live CPU + RAM per container" },
            { type: 'cmd', prompt: "$", text: "docker stats" },
            { type: 'ok', text: "CONTAINER   CPU %   MEM USAGE / LIMIT    MEM %   NET I/O" },
            { type: 'ok', text: "cc-app      0.2%    185MiB / 512MiB      36%     1.2MB / 340kB" }
          ]
        },
        {
          label: "Image Management",
          lines: [
            { type: 'cmd', prompt: "$", text: "docker images" },
            { type: 'ok', text: "REPOSITORY                      TAG       IMAGE ID       SIZE" },
            { type: 'ok', text: "nayagk/currency-conversion      latest    d4e9f2a1b3c8   198MB" },
            { type: 'cmd', prompt: "$", text: "docker images -q" },
            { type: 'ok', text: "d4e9f2a1b3c8" },
            { type: 'cmd', prompt: "$", text: "docker rmi nayagk/currency-conversion:latest" },
            { type: 'cmd', prompt: "$", text: "docker rmi -f d4e9f2a1b3c8" },
            { type: 'comment', text: "Remove dangling (untagged <none>) images" },
            { type: 'cmd', prompt: "$", text: "docker image prune" },
            { type: 'comment', text: "Remove ALL unused images — careful: removes base layers too" },
            { type: 'cmd', prompt: "$", text: "docker image prune -a" },
            { type: 'comment', text: "See disk usage before pruning" },
            { type: 'cmd', prompt: "$", text: "docker system df" },
            { type: 'comment', text: "Full cleanup — use when EC2 disk is full" },
            { type: 'cmd', prompt: "$", text: "docker system prune -a" }
          ]
        }
      ],
      expectedOutput: {
        label: "✅ Expected Output After Session 2",
        text: "You can: write a Dockerfile from scratch, build an image with -t flag, run a container with port mapping, exec into it with /bin/sh, read logs with -f, inspect IP and env vars, and remove containers/images correctly using -q subshell commands."
      }
    },
    {
      sessionNumber: 3,
      totalSessions: 4,
      sessionTitle: "Volumes, Networking & Multi-Stage Builds",
      sections: [
        {
          label: "Volumes — Named Volume (production pattern)",
          lines: [
            { type: 'comment', text: "Create a named volume — Docker manages the location" },
            { type: 'cmd', prompt: "$", text: "docker volume create mydata" },
            { type: 'cmd', prompt: "$", text: "docker volume ls" },
            { type: 'ok', text: "DRIVER    VOLUME NAME" },
            { type: 'ok', text: "local     mydata" },
            { type: 'cmd', prompt: "$", text: "docker volume inspect mydata" },
            { type: 'ok', text: "\"Mountpoint\": \"/var/lib/docker/volumes/mydata/_data\"" },
            { type: 'comment', text: "Use named volume — data persists after container rm" },
            { type: 'cmd', prompt: "$", text: "docker run -d -v mydata:/app/data nayagk/currency-conversion:latest" },
            { type: 'comment', text: "Verify: stop + remove container, data still exists" },
            { type: 'cmd', prompt: "$", text: "docker stop currency-conversion && docker rm currency-conversion" },
            { type: 'cmd', prompt: "$", text: "docker volume ls" },
            { type: 'ok', text: "local     mydata  ← still here, data safe" },
            { type: 'comment', text: "Share volume between two containers" },
            { type: 'cmd', prompt: "$", text: "docker run -d --name c1 -v mydata:/data ubuntu" },
            { type: 'cmd', prompt: "$", text: "docker run -d --name c2 --volumes-from c1 ubuntu" }
          ]
        },
        {
          label: "Volumes — Bind Mount (dev pattern)",
          lines: [
            { type: 'comment', text: "Mount a host directory into the container — files visible on both sides" },
            { type: 'cmd', prompt: "$", text: "docker run -d -v /home/ec2-user/data:/app/data nayagk/currency-conversion:latest" },
            { type: 'warn', text: "Bind mounts are host-path specific — not portable across machines. Never in production orchestration." },
            { type: 'cmd', prompt: "$", text: "docker volume prune" },
            { type: 'comment', text: "Remove all unused volumes" }
          ]
        },
        {
          label: "Networking — Custom Bridge Network (required for container DNS)",
          lines: [
            { type: 'comment', text: "Default bridge network (docker0) does NOT support DNS by container name" },
            { type: 'comment', text: "Create a custom bridge network — automatic DNS included" },
            { type: 'cmd', prompt: "$", text: "docker network create mynet" },
            { type: 'cmd', prompt: "$", text: "docker network ls" },
            { type: 'ok', text: "NETWORK ID     NAME      DRIVER    SCOPE" },
            { type: 'ok', text: "a1b2c3d4e5f6   bridge    bridge    local" },
            { type: 'ok', text: "f7g8h9i0j1k2   mynet     bridge    local" },
            { type: 'comment', text: "Run two containers on the same custom network" },
            { type: 'cmd', prompt: "$", text: "docker run -d --name app --network mynet nayagk/currency-conversion:latest" },
            { type: 'cmd', prompt: "$", text: "docker run -d --name db --network mynet mysql:8.0" },
            { type: 'comment', text: "app container can reach db by name — 'db' resolves via Docker DNS" },
            { type: 'cmd', prompt: "$", text: "docker exec -it app ping db" },
            { type: 'ok', text: "PING db (172.20.0.3) 56 bytes of data." },
            { type: 'cmd', prompt: "$", text: "docker network inspect mynet" },
            { type: 'cmd', prompt: "$", text: "docker network rm mynet" }
          ]
        },
        {
          label: "Multi-Stage Build — Spring Boot (600MB → 180MB)",
          lines: [
            { type: 'comment', text: "Stage 1: Build with Maven (JDK + Maven — only in this stage)" },
            { type: 'output', text: "FROM maven:3.9-amazoncorretto-21 AS builder" },
            { type: 'output', text: "WORKDIR /build" },
            { type: 'output', text: "COPY pom.xml ." },
            { type: 'output', text: "# Download dependencies separately — cached if pom.xml unchanged" },
            { type: 'output', text: "RUN mvn dependency:go-offline" },
            { type: 'output', text: "COPY src ./src" },
            { type: 'output', text: "RUN mvn package -DskipTests" },
            { type: 'output', text: "" },
            { type: 'output', text: "# Stage 2: Runtime — only JRE + compiled jar" },
            { type: 'output', text: "FROM amazoncorretto:21-alpine" },
            { type: 'output', text: "WORKDIR /app" },
            { type: 'output', text: "COPY --from=builder /build/target/*.jar app.jar" },
            { type: 'output', text: "EXPOSE 8100" },
            { type: 'output', text: "ENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]" },
            { type: 'comment', text: "Build the multi-stage image" },
            { type: 'cmd', prompt: "$", text: "docker build -t nayagk/currency-conversion:slim ." },
            { type: 'cmd', prompt: "$", text: "docker images | grep currency-conversion" },
            { type: 'ok', text: "nayagk/currency-conversion   latest   d4e9f2   621MB  ← single stage" },
            { type: 'ok', text: "nayagk/currency-conversion   slim     b7c3a1   178MB  ← multi-stage" }
          ]
        }
      ]
    },
    {
      sessionNumber: 4,
      totalSessions: 4,
      sessionTitle: "Docker Compose v2 + Registry + Jenkins Pipeline",
      sections: [
        {
          label: "docker-compose.yml — Spring Boot + MySQL (v2 style)",
          lines: [
            { type: 'comment', text: "No 'version:' key — obsolete in v2. No hyphen in command: docker compose" },
            { type: 'output', text: "services:" },
            { type: 'output', text: "  app:" },
            { type: 'output', text: "    image: nayagk/currency-conversion:latest" },
            { type: 'output', text: "    ports:" },
            { type: 'output', text: "      - \"8100:8100\"" },
            { type: 'output', text: "    environment:" },
            { type: 'output', text: "      - SPRING_PROFILES_ACTIVE=prod" },
            { type: 'output', text: "    depends_on:" },
            { type: 'output', text: "      db:" },
            { type: 'output', text: "        condition: service_healthy   # waits for HEALTHY, not just started" },
            { type: 'output', text: "    restart: unless-stopped" },
            { type: 'output', text: "" },
            { type: 'output', text: "  db:" },
            { type: 'output', text: "    image: mysql:8.0" },
            { type: 'output', text: "    environment:" },
            { type: 'output', text: "      MYSQL_ROOT_PASSWORD: password" },
            { type: 'output', text: "      MYSQL_DATABASE: mydb" },
            { type: 'output', text: "    volumes:" },
            { type: 'output', text: "      - dbdata:/var/lib/mysql" },
            { type: 'output', text: "    healthcheck:" },
            { type: 'output', text: "      test: [\"CMD\", \"mysqladmin\", \"ping\", \"-h\", \"localhost\"]" },
            { type: 'output', text: "      interval: 10s" },
            { type: 'output', text: "      timeout: 5s" },
            { type: 'output', text: "      retries: 5" },
            { type: 'output', text: "" },
            { type: 'output', text: "volumes:" },
            { type: 'output', text: "  dbdata:" }
          ]
        },
        {
          label: "Docker Compose v2 Commands",
          lines: [
            { type: 'comment', text: "Start all services in background" },
            { type: 'cmd', prompt: "$", text: "docker compose up -d" },
            { type: 'comment', text: "Stop + remove containers AND networks (keeps volumes)" },
            { type: 'cmd', prompt: "$", text: "docker compose down" },
            { type: 'comment', text: "Stop + remove containers, networks AND volumes (clean slate)" },
            { type: 'cmd', prompt: "$", text: "docker compose down -v" },
            { type: 'cmd', prompt: "$", text: "docker compose ps" },
            { type: 'ok', text: "NAME   IMAGE               STATUS              PORTS" },
            { type: 'ok', text: "app    currency-conversion  Up (healthy)        0.0.0.0:8100->8100" },
            { type: 'ok', text: "db     mysql:8.0           Up (healthy)        3306/tcp" },
            { type: 'cmd', prompt: "$", text: "docker compose logs -f app" },
            { type: 'cmd', prompt: "$", text: "docker compose logs -f" },
            { type: 'comment', text: "Validate compose file without starting (dry-run)" },
            { type: 'cmd', prompt: "$", text: "docker compose config" },
            { type: 'comment', text: "Rebuild images and restart" },
            { type: 'cmd', prompt: "$", text: "docker compose build && docker compose up -d" }
          ]
        },
        {
          label: "Docker Hub — Build, Tag, Push, Pull",
          lines: [
            { type: 'comment', text: "Login to Docker Hub (interactive)" },
            { type: 'cmd', prompt: "$", text: "docker login" },
            { type: 'comment', text: "Login non-interactive (for CI/CD — use env vars, never hardcode)" },
            { type: 'cmd', prompt: "$", text: "docker login -u $DOCKER_USER -p $DOCKER_PASS" },
            { type: 'comment', text: "Tag format: username/repository:tag" },
            { type: 'cmd', prompt: "$", text: "docker build -t nayagk/currency-conversion:latest ." },
            { type: 'comment', text: "Retag an existing local image" },
            { type: 'cmd', prompt: "$", text: "docker tag local-image:v1 nayagk/currency-conversion:1.0" },
            { type: 'comment', text: "Push to Docker Hub" },
            { type: 'cmd', prompt: "$", text: "docker push nayagk/currency-conversion:latest" },
            { type: 'ok', text: "latest: digest: sha256:abc123... size: 528" },
            { type: 'comment', text: "Pull on another machine" },
            { type: 'cmd', prompt: "$", text: "docker pull nayagk/currency-conversion:latest" },
            { type: 'comment', text: "Run directly from registry" },
            { type: 'cmd', prompt: "$", text: "docker run -d -p 8100:8100 nayagk/currency-conversion:latest" }
          ]
        },
        {
          label: "Trivy Security Scan",
          lines: [
            { type: 'comment', text: "Install Trivy on Amazon Linux 2023" },
            { type: 'cmd', prompt: "#", text: "rpm -ivh https://github.com/aquasecurity/trivy/releases/download/v0.50.0/trivy_0.50.0_Linux-64bit.rpm" },
            { type: 'cmd', prompt: "$", text: "trivy --version" },
            { type: 'ok', text: "Version: 0.50.0" },
            { type: 'comment', text: "Scan image — all severities" },
            { type: 'cmd', prompt: "$", text: "trivy image nayagk/currency-conversion:latest" },
            { type: 'comment', text: "High and Critical only" },
            { type: 'cmd', prompt: "$", text: "trivy image --severity HIGH,CRITICAL nayagk/currency-conversion:latest" },
            { type: 'comment', text: "--exit-code 0: report but don't fail pipeline (use while learning)" },
            { type: 'comment', text: "--exit-code 1: fail pipeline if vulnerabilities found (production gate)" },
            { type: 'cmd', prompt: "$", text: "trivy image --exit-code 0 --severity HIGH,CRITICAL --format table nayagk/currency-conversion:latest" },
            { type: 'comment', text: "Save scan results to JSON for reporting" },
            { type: 'cmd', prompt: "$", text: "trivy image --format json -o trivy-report.json nayagk/currency-conversion:latest" }
          ]
        }
      ],
      expectedOutput: {
        label: "✅ Expected Output After Session 4",
        text: "You can: write a complete docker-compose.yml with healthchecks and depends_on, run the full stack with docker compose up -d, push an image to Docker Hub, run a Trivy scan, and add the Docker build/scan/push stages to a Jenkins Declarative Pipeline."
      }
    }
  ],
  debugTrees: [
    {
      title: "🚨 Container exits immediately — Exited (1), docker logs empty",
      steps: [
        {
          num: 1,
          title: "Check exit code and status",
          cmd: "docker ps -a --format 'table {{.Names}}\\t{{.Status}}\\t{{.ExitCode}}'"
        },
        {
          num: 2,
          title: "Try docker logs even if empty",
          cmd: "docker logs <container_id>"
        },
        {
          num: 3,
          title: "Override entrypoint to get a shell — most powerful debug technique",
          cmd: "docker run --entrypoint /bin/sh -it nayagk/currency-conversion:latest"
        },
        {
          num: 4,
          title: "Inside the shell: manually run the CMD command to see the actual error",
          description: "java -jar app.jar — you will see the exact error: missing file, missing env var, wrong class"
        },
        {
          num: 5,
          title: "Check if required files exist in the image",
          cmd: "docker run --entrypoint /bin/sh -it nayagk/currency-conversion:latest -c 'ls -la /app/'"
        },
        {
          num: 6,
          title: "Check environment variables",
          cmd: "docker run --entrypoint /bin/sh -it nayagk/currency-conversion:latest -c 'env'"
        }
      ]
    },
    {
      title: "Common Errors Quick Fix",
      steps: [
        {
          num: 1,
          title: "Permission denied connecting to Docker daemon",
          description: "User not in docker group",
          cmd: "usermod -aG docker $USER  →  logout and login (for Jenkins: usermod -aG docker jenkins && systemctl restart jenkins)"
        },
        {
          num: 2,
          title: "Cannot connect to Docker daemon — is daemon running?",
          cmd: "systemctl start docker  →  systemctl enable docker"
        },
        {
          num: 3,
          title: "COPY failed: file not found in build context",
          description: "File not in build context dir, or .dockerignore excluded it, or you ran docker build from wrong directory",
          cmd: "ls target/*.jar  →  confirm file exists  →  check .dockerignore"
        },
        {
          num: 4,
          title: "Port is already allocated",
          description: "Another process or container is using that host port",
          cmd: "docker ps  →  find the container using that port  →  docker stop <id>  →  or use a different host port"
        },
        {
          num: 5,
          title: "/bin/bash: No such file or directory on Alpine images",
          cmd: "Use /bin/sh instead: docker exec -it container /bin/sh"
        },
        {
          num: 6,
          title: "No space left on device",
          cmd: "docker system df  →  docker system prune -a  →  or increase EC2 root volume"
        }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Using docker images (no -q) in a subshell to get IDs",
      description: "docker rmi $(docker images) fails because docker images returns a formatted table with headers and columns — not just IDs. The subshell passes the entire table text as arguments to docker rmi, which cannot parse it.",
      fix: "Always use the -q flag: docker rmi -f $(docker images -q). The -q flag returns only image IDs, one per line — exactly what subshell substitution needs."
    },
    {
      mistake: "Using docker-compose (hyphen) instead of docker compose",
      description: "docker-compose is the old v1 binary written in Python, now end-of-life. Amazon Linux 2023 does not install it by default. Scripts using docker-compose will fail with 'command not found'.",
      fix: "Use docker compose (no hyphen, built-in plugin). Also remove the 'version:' key from compose files — it is obsolete and generates a warning in v2."
    },
    {
      mistake: "Putting app startup command in RUN",
      description: "RUN java -jar app.jar only runs at BUILD time. During the build, the JAR has not been built yet and the database is not available. The app starts, fails, and the image build breaks.",
      fix: "RUN is for build-time operations: install packages, create directories, compile code. Use CMD or ENTRYPOINT for container startup commands. Rule: if it should run when the container starts, it is not RUN."
    },
    {
      mistake: "EXPOSE means the port is published and accessible",
      description: "EXPOSE is metadata only — it documents which port the app listens on. It does nothing to the network. External traffic still cannot reach the container.",
      fix: "Use -p host_port:container_port at docker run time to actually publish. On EC2, also open the port in Security Group Inbound Rules."
    },
    {
      mistake: "depends_on without condition: service_healthy",
      description: "depends_on without a condition only waits for the container to START — not for the service inside to be ready. A MySQL container starts in ~1 second but takes 5+ seconds to be ready for connections. Your Spring Boot app crashes on startup connecting to an initialising database.",
      fix: "Add a HEALTHCHECK to MySQL and use depends_on with condition: service_healthy. This makes Docker Compose wait until MySQL passes its health check before starting the app."
    },
    {
      mistake: "Running containers as root (default if USER not set)",
      description: "If the container process is compromised, the attacker has root access to the container filesystem and can potentially escalate privileges to the host. This is a critical security vulnerability.",
      fix: "Always create a non-root user in the Dockerfile and switch to it before CMD/ENTRYPOINT: RUN addgroup -S appgroup && adduser -S appuser -G appgroup && USER appuser"
    }
  ],
  project: {
    tag: "🐳 Docker Module Project",
    title: "Spring Boot + MySQL Stack — Dockerised End-to-End",
    timeEstimate: "⏱ ~90 min",
    goal: "Build a production-grade multi-stage Docker image for the currency-conversion Spring Boot app. Deploy a full stack with Docker Compose (app + MySQL with healthchecks). Push the image to Docker Hub. Run a Trivy security scan. Verify the entire stack runs with a single command.",
    checklist: [
      "Dockerfile written using amazoncorretto:21-alpine base image",
      "Multi-stage build: maven builder stage + runtime stage",
      "Image size under 250MB (compare before/after multi-stage)",
      ".dockerignore created — excludes target/, .git, .idea/",
      "docker build -t nayagk/currency-conversion:latest . succeeds",
      "docker run -d -p 8100:8100 starts the app — curl http://localhost:8100 responds",
      "docker-compose.yml with app + MySQL, healthcheck on MySQL",
      "depends_on with condition: service_healthy — app waits for healthy MySQL",
      "docker compose up -d brings full stack up with zero manual steps",
      "docker push nayagk/currency-conversion:latest succeeds",
      "trivy image --exit-code 0 --severity HIGH,CRITICAL scan completes",
      "Commit Dockerfile, docker-compose.yml, .dockerignore to GitHub"
    ],
    codeBlock: {
      title: "Verify the stack is running correctly",
      lines: [
        "docker compose ps          # Both app and db should show 'Up (healthy)'",
        "docker compose logs app    # Spring Boot startup logs — no connection errors",
        "curl http://localhost:8100  # App responds",
        "docker compose down -v     # Clean teardown including volumes"
      ]
    },
    expectedOutput: "docker compose ps\nNAME    IMAGE                           STATUS          PORTS\napp     nayagk/currency-conversion:latest  Up (healthy)    0.0.0.0:8100->8100/tcp\ndb      mysql:8.0                          Up (healthy)    3306/tcp"
  },
  interview: [
    {
      question: "\"What is the difference between RUN, CMD, and ENTRYPOINT in a Dockerfile?\"",
      answer: "\"RUN executes commands at IMAGE BUILD time — the result is permanently baked into an image layer. It is used to install packages, create directories, and compile code. CMD and ENTRYPOINT both execute at CONTAINER START time. The difference: CMD sets the default command and can be completely replaced by passing a command to docker run. ENTRYPOINT sets a fixed executable that always runs — arguments passed to docker run become parameters to ENTRYPOINT, not replacements for it. The production pattern is ENTRYPOINT for the fixed executable and CMD for its default arguments: ENTRYPOINT [java, -jar] and CMD [app.jar]. A docker run with a different jar name replaces only CMD, not ENTRYPOINT.\""
    },
    {
      question: "\"Why would you use a multi-stage Docker build?\"",
      answer: "\"Multi-stage builds eliminate build tooling from the final production image. For a Java application: the first stage uses a Maven + JDK image to compile and package the JAR — this stage contains Maven, the full JDK, source code, and test dependencies. The second stage uses only a minimal JRE Alpine image and copies the compiled JAR using COPY --from=builder. The final image has no Maven, no JDK, no source code — only the JRE and the JAR. The result: image size drops from 700MB to 180MB. Smaller image means faster pull times, faster container startup, and dramatically reduced attack surface — fewer OS packages means fewer CVEs that Trivy will report.\""
    },
    {
      question: "\"A container worked fine yesterday but now exits with code 1 and docker logs shows nothing. How do you debug this?\"",
      answer: "\"The classic empty-logs problem means the process crashes before writing any output. My first step is to override the entrypoint: docker run --entrypoint /bin/sh -it <image>. This drops me into a shell inside the container filesystem. I then manually run the CMD command — for example, java -jar app.jar — and see the actual error before the process exits. Common root causes: a required environment variable is missing, a config file doesn't exist at the expected path, or a binary the CMD references has a wrong path. A HEALTHCHECK instruction would have caught this earlier — the container would have shown 'unhealthy' status before failing, giving time to read the logs.\""
    }
  ],
  quiz: [
    {
      num: 1,
      question: "What is the correct command to remove ALL Docker images on a system?",
      options: [
        { text: "A) docker rmi $(docker images)", isCorrect: false },
        { text: "B) docker rmi -f $(docker images -q)", isCorrect: true },
        { text: "C) docker image rm all", isCorrect: false },
        { text: "D) docker rmi $(docker images -a)", isCorrect: false }
      ],
      explanation: "docker images without -q returns a formatted table with headers and multiple columns — not just IDs. Passing this table text to docker rmi fails. The -q flag (quiet) returns ONLY the image IDs, one per line. docker rmi -f $(docker images -q) correctly passes all IDs for force removal. Same principle applies to containers: docker rm $(docker ps -aq) works, docker rm $(docker ps -a) does not."
    },
    {
      num: 2,
      question: "You have: ENTRYPOINT [\"java\", \"-jar\"] and CMD [\"app.jar\"] in your Dockerfile. What runs when you execute: docker run myimage other.jar?",
      options: [
        { text: "A) other.jar replaces ENTRYPOINT — java is not executed", isCorrect: false },
        { text: "B) java -jar other.jar — CMD is replaced by other.jar, ENTRYPOINT stays fixed", isCorrect: true },
        { text: "C) java -jar app.jar — docker run arguments are ignored when ENTRYPOINT exists", isCorrect: false },
        { text: "D) Error — you cannot pass arguments when ENTRYPOINT is set", isCorrect: false }
      ],
      explanation: "ENTRYPOINT is the fixed executable that always runs. Arguments passed to docker run (other.jar) replace CMD, not ENTRYPOINT. So java -jar (ENTRYPOINT) + other.jar (replaces CMD default) = java -jar other.jar. To replace ENTRYPOINT itself, you must use --entrypoint flag: docker run --entrypoint /bin/sh myimage."
    },
    {
      num: 3,
      question: "What does EXPOSE 8100 in a Dockerfile actually do?",
      options: [
        { text: "A) Publishes port 8100 and makes it accessible from outside the host", isCorrect: false },
        { text: "B) Opens a firewall rule on the host for port 8100", isCorrect: false },
        { text: "C) Documents that the container listens on 8100 — no network effect whatsoever", isCorrect: true },
        { text: "D) Makes port 8100 accessible from other containers on the same network", isCorrect: false }
      ],
      explanation: "EXPOSE is metadata only — it signals intent, like a comment. It does nothing to the actual network. To publish a port: use -p host_port:container_port at docker run time. On AWS EC2, you also need to allow the port in Security Group Inbound Rules. EXPOSE is useful for docker run -P (random port mapping) which maps all EXPOSEd ports to random host ports, but even then it is the -P flag doing the work."
    },
    {
      num: 4,
      question: "What is wrong with this docker-compose.yml: depends_on: - db?",
      options: [
        { text: "A) Nothing — depends_on correctly waits for MySQL to be ready for connections", isCorrect: false },
        { text: "B) depends_on only waits for the db CONTAINER to start, not for MySQL to be ready for connections", isCorrect: true },
        { text: "C) depends_on is not valid in Docker Compose v2", isCorrect: false },
        { text: "D) You must list service names in quotes", isCorrect: false }
      ],
      explanation: "depends_on without condition: service_healthy waits for the container process to start — which happens in about 1 second for MySQL. But MySQL needs 5-10 seconds after starting before it accepts connections. Without a healthcheck, your Spring Boot app starts and immediately tries to connect to a MySQL that is still initialising — causing a startup crash. The fix: add a HEALTHCHECK to the db service (e.g. mysqladmin ping) and use depends_on with condition: service_healthy."
    },
    {
      num: 5,
      question: "You run trivy image --exit-code 1 --severity CRITICAL myapp:latest in your Jenkins pipeline. The scan finds 3 CRITICAL vulnerabilities. What happens?",
      options: [
        { text: "A) Trivy prints the report but the pipeline stage succeeds (exit 0)", isCorrect: false },
        { text: "B) Jenkins skips the next stage automatically", isCorrect: false },
        { text: "C) The pipeline stage fails (non-zero exit code) — Jenkins marks the build as FAILED and stops", isCorrect: true },
        { text: "D) Trivy pushes the image anyway and attaches the report as a Jenkins artifact", isCorrect: false }
      ],
      explanation: "Trivy exits with code 1 when it finds vulnerabilities matching the severity filter — and a non-zero exit code causes a Jenkins shell step to fail, which marks the stage and build as FAILED. This is the security gate pattern: --exit-code 0 is training mode (report but don't block), --exit-code 1 is enforcement mode (fail the build if CRITICAL found). Using Alpine base images dramatically reduces your CRITICAL count because fewer OS packages = fewer CVEs."
    }
  ],
  github: {
    filename: "devops-90days/docker-module/README.md",
    commitMessage: "docs: Add Docker module — Dockerfile, Compose, Volumes, Networking, Trivy",
    template: "# Docker Module — Containerisation Mastery\n**Date:** YYYY-MM-DD | **Module:** 09 | **Status:** ✅ Complete\n\n## Key Concepts\n- Docker = OS-level virtualisation (shares host kernel, not full OS)\n- VM: hypervisor → Guest OS → App (minutes, GBs)\n- Container: Host OS → Docker Engine → App (milliseconds, MBs)\n- Architecture: CLI → dockerd → containerd → runc\n\n## Critical Dockerfile Rules\n| Instruction | When it runs | Overridable? | Use for |\n|---|---|---|---|\n| RUN | Build time | N/A (baked in) | Install, compile |\n| CMD | Start time | Yes — docker run <cmd> | Default command/args |\n| ENTRYPOINT | Start time | Only with --entrypoint | Fixed executable |\n\n## Key Commands\n```bash\n# Build\ndocker build -t nayagk/currency-conversion:latest .\ndocker build --no-cache -t myapp:latest .\n\n# Run\ndocker run -d --name cc -p 8100:8100 nayagk/currency-conversion:latest\ndocker run -d -e SPRING_PROFILES_ACTIVE=prod -p 8100:8100 myimage\n\n# Exec\ndocker exec -it cc /bin/sh             # Alpine: no bash, use sh\ndocker logs -f cc\ndocker inspect cc | grep -i ipaddress\ndocker stats\n\n# CORRECT bulk ops\ndocker stop $(docker ps -q)           # stop all running\ndocker rm $(docker ps -aq)            # remove all containers\ndocker rmi -f $(docker images -q)     # remove all images\n\n# Compose v2 (no hyphen)\ndocker compose up -d\ndocker compose down -v\ndocker compose logs -f app\ndocker compose config\n\n# Registry\ndocker login\ndocker push nayagk/currency-conversion:latest\ndocker pull nayagk/currency-conversion:latest\n\n# Security\ntrivy image --exit-code 0 --severity HIGH,CRITICAL myapp:latest\n```\n\n## Common Mistakes\n- `docker rmi $(docker images)` ❌ → `docker rmi -f $(docker images -q)` ✅\n- `docker-compose` (hyphen) ❌ → `docker compose` ✅\n- EXPOSE ≠ publish. Use -p flag at docker run.\n- depends_on alone ≠ service ready. Add healthcheck + condition: service_healthy.\n\n## Tomorrow\nKubernetes: Deployments, Services, ReplicaSets — taking containers to orchestration."
  },
  pdfUrl: "/pdfs/docker-module.pdf",
  images: []
};
