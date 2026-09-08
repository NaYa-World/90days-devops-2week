import { BootcampDay } from '../types';

export const day18: BootcampDay = {
  "day": 18,
  "title": "Docker — Volumes, Networking, Multi-Stage, Compose & CI/CD",
  "subtitle": "Named Volumes · Bridge Networks · Multi-Stage Builds · Docker Hub · Docker Compose v2 · Jenkins Pipeline Integration · Trivy Scan",
  "color": "#0db7ed",
  "trainerNote": "Day 18 is where Docker goes from toy to production tool. Multi-stage cuts your image size by 60%. Compose orchestrates your local stack. Jenkins integration makes the whole pipeline real. Do not skip any of these.",
  "engineerNote": "Everything on Day 18 maps directly to real interview questions: 'how do you persist data in containers', 'how do containers communicate', 'how do you reduce image size', 'how do you integrate Docker into CI/CD'. Know all of them cold.",
  "goal": {
    "icon": "🔧",
    "title": "🔧 Day 18 Goal",
    "description": "By end of Day 18: multi-stage Dockerfile cuts your image from 600MB to under 200MB, Docker Compose brings up the full app stack with one command, and Jenkins pipeline has Docker Build + Trivy Scan + Docker Push stages running end to end. Expected output: docker images shows your slim multi-stage image, docker compose up -d shows all services healthy, Jenkins stage view shows all stages green."
  },
  "schedule": [
    { "time": "09:00-09:20", "phase": "RECALL", "activity": "Day 17 cold check", "why": "From memory: docker run flags, the three Dockerfile startup instructions, correct bulk delete commands. If you need notes, Day 17 is not solid enough." },
    { "time": "09:20-10:15", "phase": "THEORY", "activity": "Volumes — why container data is ephemeral, 3 volume types", "why": "Without volumes, every container restart loses all data. This is the most common Docker production mistake." },
    { "time": "10:15-10:30", "phase": "BREAK", "activity": "Break", "why": "" },
    { "time": "10:30-12:00", "phase": "HANDS-ON", "activity": "Networking — bridge, host, none + custom networks + docker compose", "why": "Default bridge has no DNS. Custom bridge does. This single fact is the most common reason containers in Compose cannot talk to each other." },
    { "time": "12:00-12:45", "phase": "BREAK", "activity": "Lunch", "why": "" },
    { "time": "12:45-14:00", "phase": "HANDS-ON", "activity": "Multi-stage builds + .dockerignore + Docker Hub push", "why": "Multi-stage is non-negotiable for production. A 600MB image pulling on every deployment is unacceptable." },
    { "time": "14:00-15:30", "phase": "HANDS-ON", "activity": "Jenkins pipeline — Docker Build, Trivy Scan, Docker Push stages", "why": "This completes your CI pipeline. After today: push code, Jenkins builds, scans, and pushes to Docker Hub automatically." },
    { "time": "15:30-15:45", "phase": "BREAK", "activity": "Break", "why": "" },
    { "time": "15:45-16:45", "phase": "PROJECT", "activity": "Mini Project: Full pipeline — push code, Jenkins builds and pushes image", "why": "" },
    { "time": "16:45-17:00", "phase": "COMMIT", "activity": "Day 18 notes + commit Jenkinsfile and docker-compose.yml", "why": "" }
  ],
  "concepts": [
    {
      "icon": "💾",
      "title": "Docker Volumes — Why Containers Lose Data",
      "description": "Containers are ephemeral by design. Every file written inside a running container is stored in the container's writable layer (OverlayFS). When the container is removed with docker rm, that writable layer is deleted. The image layers are untouched. Three volume types: 1) Anonymous volumes (VOLUME instruction in Dockerfile — random name, rarely used). 2) Bind mounts (-v /host/path:/container/path — you control the host path, great for dev). 3) Named volumes (docker volume create mydata — Docker manages location, best for production databases).",
      "analogy": "Containers are hotel rooms. Anything left in the room (writable layer) is thrown away at checkout (docker rm). Volumes are the hotel safe — they persist across guests (container restarts). Named volumes are the hotel vault — managed, persistent, backed up."
    },
    {
      "icon": "🌐",
      "title": "Docker Networking — The DNS Gotcha",
      "description": "Docker has four network drivers. Bridge: default. Containers get private IPs. DEFAULT bridge network does NOT support DNS by name — you cannot ping containers by name on docker0. CUSTOM bridge network DOES support automatic DNS — containers find each other by service name. Host: container shares host's network stack, no isolation, fastest. None: completely isolated, no network. Overlay: multi-host, used with Swarm or Kubernetes.",
      "analogy": "Default bridge is like being in the same apartment building but without a directory — you can only reach people if you know their exact apartment number (IP). Custom bridge is like having a building intercom system — you can call any tenant by name (container name resolves automatically)."
    },
    {
      "icon": "🏗",
      "title": "Multi-Stage Builds — 600MB to 180MB",
      "description": "Use multiple FROM statements. Earlier stages build and compile. The final stage copies ONLY the artifact — no build tools, no source code, no dev dependencies in the production image. For Java: Stage 1 uses maven:3.9-amazoncorretto-21 to build the JAR. Stage 2 uses amazoncorretto:21-alpine (JRE only) and copies just the JAR with COPY --from=builder. Build tools (Maven ~200MB), source code, test classes, and dependencies not needed at runtime are all excluded.",
      "analogy": "Multi-stage builds are like a factory production line. The first floor (builder stage) has all the heavy machinery (compiler, build tools) to manufacture the product. The warehouse (final stage) only needs the finished product — not the factory equipment. You ship the product, not the factory."
    },
    {
      "icon": "📦",
      "title": "Docker Compose v2 — One Command to Rule Them All",
      "description": "Docker Compose defines and runs multi-container applications from a single YAML file. v2 critical: the command is 'docker compose' (no hyphen, built-in plugin). v1 used 'docker-compose' (separate Python binary, now deprecated). The 'version:' key in the YAML is obsolete in v2. Compose handles: starting services in dependency order with depends_on, shared networks (services find each other by name), named volumes, environment variables from .env files.",
      "analogy": "Without Compose, running a 3-service stack means 3 docker run commands with the right flags, right order, right network. You would never remember them all. Compose is the recipe card — run docker compose up and everything starts correctly, in order, connected."
    },
    {
      "icon": "🔒",
      "title": "Trivy — Security Scanning in the Pipeline",
      "description": "Trivy scans Docker images for known CVEs (Common Vulnerabilities and Exposures) in OS packages and application dependencies. In Jenkins: --exit-code 0 means the pipeline does NOT fail when vulnerabilities are found (report only). --exit-code 1 means the pipeline FAILS if vulnerabilities at the specified severity are found (enforce). Use HIGH,CRITICAL for severity filters. Start with exit-code 0 while learning. Switch to exit-code 1 when ready to enforce security gates.",
      "analogy": "Trivy is the security X-ray at the airport gate. Exit-code 0 is the airport flagging your bag but still letting you through (report only). Exit-code 1 is the airport refusing to let you board (pipeline fails). Start permissive, tighten over time."
    },
    {
      "icon": "📁",
      "title": ".dockerignore — Keep the Build Context Clean",
      "description": "Like .gitignore — tells Docker what to exclude from the build context sent to the daemon. The build context is the directory sent to dockerd for every docker build. Without .dockerignore, Maven's target/ folder (hundreds of MBs of compiled classes, test reports, temp files) is sent to the daemon on every build. This is slow and can accidentally include secrets or IDE config. Rule: target/ to exclude all, then !target/*.jar to whitelist only the final jar.",
      "analogy": ".dockerignore is the packing list in reverse — it tells the courier (Docker daemon) what NOT to include in the shipment. Without it, you ship the entire warehouse instead of just the package."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 6,
      "sessionTitle": "STEP 1 — Docker Volumes (All 3 Methods)",
      "sections": [
        {
          "label": "Method 2: Bind Mount (-v host:container)",
          "lines": [
            { "type": "comment", "text": "Bind mount: you control the host path. Great for dev." },
            { "type": "cmd", "prompt": "$", "text": "docker run -d -v /home/ec2-user/data:/app/data myimage" },
            { "type": "comment", "text": "Files created in /app/data inside container appear at /home/ec2-user/data on host" },
            { "type": "warn", "text": "Bind mounts are brittle in production — path must exist, permissions must match, specific to one machine." }
          ]
        },
        {
          "label": "Method 3: Named Volume (production standard)",
          "lines": [
            { "type": "comment", "text": "Create a named volume (Docker manages the location)" },
            { "type": "cmd", "prompt": "$", "text": "docker volume create mydata" },
            { "type": "comment", "text": "Use named volume in docker run" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d -v mydata:/app/data myimage" },
            { "type": "comment", "text": "Volume persists across docker stop, docker rm, and docker run" },
            { "type": "comment", "text": "Volume management commands" },
            { "type": "cmd", "prompt": "$", "text": "docker volume ls" },
            { "type": "cmd", "prompt": "$", "text": "docker volume inspect mydata" },
            { "type": "ok", "text": "Mountpoint: /var/lib/docker/volumes/mydata/_data" },
            { "type": "cmd", "prompt": "$", "text": "docker volume rm mydata" },
            { "type": "cmd", "prompt": "$", "text": "docker volume prune" },
            { "type": "comment", "text": "Share volume between containers" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d --name c1 -v mydata:/data ubuntu" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d --name c2 --volumes-from c1 ubuntu" },
            { "type": "warn", "text": "Named volumes persist after docker rm. Anonymous volumes are removed with docker rm -v. This is intentional." }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 6,
      "sessionTitle": "STEP 2 — Docker Networking",
      "sections": [
        {
          "label": "Network commands and custom bridge",
          "lines": [
            { "type": "cmd", "prompt": "$", "text": "docker network ls" },
            { "type": "ok", "text": "NETWORK ID   NAME      DRIVER   SCOPE" },
            { "type": "ok", "text": "a1b2c3d4     bridge    bridge   local" },
            { "type": "ok", "text": "b5c6d7e8     host      host     local" },
            { "type": "ok", "text": "c9d0e1f2     none      null     local" },
            { "type": "comment", "text": "Create a custom bridge network (has automatic DNS)" },
            { "type": "cmd", "prompt": "$", "text": "docker network create mynet" },
            { "type": "comment", "text": "Run containers on the custom network" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d --network mynet --name app nayagk/currency-conversion:latest" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d --network mynet --name db mysql:8.0" },
            { "type": "comment", "text": "Now 'app' can reach 'db' by name — automatic DNS on custom networks" },
            { "type": "cmd", "prompt": "$", "text": "docker exec app ping db" },
            { "type": "ok", "text": "PING db (172.20.0.3): 56 data bytes" },
            { "type": "comment", "text": "Inspect network — see all containers and their IPs" },
            { "type": "cmd", "prompt": "$", "text": "docker network inspect mynet" },
            { "type": "cmd", "prompt": "$", "text": "docker network connect mynet existing-container" },
            { "type": "cmd", "prompt": "$", "text": "docker network disconnect mynet existing-container" },
            { "type": "cmd", "prompt": "$", "text": "docker network rm mynet" },
            { "type": "err", "text": "The DEFAULT bridge network does NOT support DNS by name. You MUST create a custom bridge for name-based discovery." }
          ]
        },
        {
          "label": "Port mapping and EC2 traffic flow",
          "lines": [
            { "type": "comment", "text": "-p host_port:container_port" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d -p 8100:8100 nayagk/currency-conversion:latest" },
            { "type": "comment", "text": "Random host port (Docker picks)" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d -P nayagk/currency-conversion:latest" },
            { "type": "comment", "text": "Check what port was assigned" },
            { "type": "cmd", "prompt": "$", "text": "docker port container_id" },
            { "type": "output", "text": "Traffic flow: Browser -> EC2 Public IP:8100 (Security Group allows 8100)" },
            { "type": "output", "text": "  -> Host port 8100 -> (port mapping) -> Container port 8100 -> Spring Boot" }
          ]
        }
      ]
    },
    {
      "sessionNumber": 3,
      "totalSessions": 6,
      "sessionTitle": "STEP 3 — Multi-Stage Builds and .dockerignore",
      "sections": [
        {
          "label": "Multi-stage Dockerfile — Spring Boot (Maven build in CI)",
          "lines": [
            { "type": "comment", "text": "Stage 1: Build with Maven (includes full JDK + Maven + source)" },
            { "type": "output", "text": "FROM maven:3.9-amazoncorretto-21 AS builder" },
            { "type": "output", "text": "WORKDIR /build" },
            { "type": "output", "text": "COPY pom.xml ." },
            { "type": "output", "text": "RUN mvn dependency:go-offline" },
            { "type": "output", "text": "COPY src ./src" },
            { "type": "output", "text": "RUN mvn package -DskipTests" },
            { "type": "output", "text": "" },
            { "type": "comment", "text": "Stage 2: Runtime — only JRE + jar (no Maven, no source, no test classes)" },
            { "type": "output", "text": "FROM amazoncorretto:21-alpine" },
            { "type": "output", "text": "WORKDIR /app" },
            { "type": "output", "text": "COPY --from=builder /build/target/*.jar app.jar" },
            { "type": "output", "text": "EXPOSE 8100" },
            { "type": "output", "text": "ENTRYPOINT [\"java\", \"-jar\"]" },
            { "type": "output", "text": "CMD [\"app.jar\"]" },
            { "type": "ok", "text": "Result: builder stage ~650MB (never shipped) | final image ~200MB (what gets deployed)" },
            { "type": "warn", "text": "In your Jenkins pipeline, Maven already built the jar before docker build. You do NOT need Stage 1 in that case. Multi-stage is for when Docker itself should build the project." }
          ]
        },
        {
          "label": ".dockerignore — keep build context clean",
          "lines": [
            { "type": "comment", "text": "Create .dockerignore at project root" },
            { "type": "output", "text": "# Exclude Maven target except the final jar" },
            { "type": "output", "text": "target/" },
            { "type": "output", "text": "!target/*.jar" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "# Git" },
            { "type": "output", "text": ".git" },
            { "type": "output", "text": ".gitignore" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "# IDE" },
            { "type": "output", "text": ".idea/" },
            { "type": "output", "text": "*.iml" },
            { "type": "output", "text": ".vscode/" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "# Tests" },
            { "type": "output", "text": "src/test/" },
            { "type": "ok", "text": "Without this: hundreds of MBs sent to daemon. With this: only the jar is sent." }
          ]
        }
      ]
    },
    {
      "sessionNumber": 4,
      "totalSessions": 6,
      "sessionTitle": "STEP 4 — Docker Hub Push/Pull Workflow",
      "sections": [
        {
          "label": "Full push and pull workflow",
          "lines": [
            { "type": "comment", "text": "1. Build with username/repo:tag format" },
            { "type": "cmd", "prompt": "$", "text": "docker build -t nayagk/currency-conversion:latest ." },
            { "type": "comment", "text": "2. Tag an existing image (if already built without username prefix)" },
            { "type": "cmd", "prompt": "$", "text": "docker tag local-image:tag nayagk/currency-conversion:latest" },
            { "type": "comment", "text": "3. Login to Docker Hub" },
            { "type": "cmd", "prompt": "$", "text": "docker login" },
            { "type": "comment", "text": "Non-interactive login (for CI/CD)" },
            { "type": "cmd", "prompt": "$", "text": "docker login -u nayagk -p " },
            { "type": "comment", "text": "4. Push to Docker Hub" },
            { "type": "cmd", "prompt": "$", "text": "docker push nayagk/currency-conversion:latest" },
            { "type": "ok", "text": "The push refers to repository [docker.io/nayagk/currency-conversion]" },
            { "type": "ok", "text": "latest: digest: sha256:abc123... size: 2048" },
            { "type": "comment", "text": "5. Pull on another machine" },
            { "type": "cmd", "prompt": "$", "text": "docker pull nayagk/currency-conversion:latest" },
            { "type": "comment", "text": "Run directly from registry" },
            { "type": "cmd", "prompt": "$", "text": "docker run -d -p 8100:8100 nayagk/currency-conversion:latest" },
            { "type": "warn", "text": "Tag format: username/repository:tag. If you omit the tag, Docker uses 'latest' automatically." }
          ]
        }
      ]
    },
    {
      "sessionNumber": 5,
      "totalSessions": 6,
      "sessionTitle": "STEP 5 — Docker Compose v2",
      "sections": [
        {
          "label": "docker-compose.yml — production-quality with healthchecks",
          "lines": [
            { "type": "comment", "text": "docker-compose.yml at project root" },
            { "type": "output", "text": "services:" },
            { "type": "output", "text": "  app:" },
            { "type": "output", "text": "    image: nayagk/currency-conversion:latest" },
            { "type": "output", "text": "    ports:" },
            { "type": "output", "text": "      - '8100:8100'" },
            { "type": "output", "text": "    environment:" },
            { "type": "output", "text": "      - SPRING_PROFILES_ACTIVE=prod" },
            { "type": "output", "text": "    depends_on:" },
            { "type": "output", "text": "      db:" },
            { "type": "output", "text": "        condition: service_healthy" },
            { "type": "output", "text": "    restart: unless-stopped" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "  db:" },
            { "type": "output", "text": "    image: mysql:8.0" },
            { "type": "output", "text": "    environment:" },
            { "type": "output", "text": "      MYSQL_ROOT_PASSWORD: password" },
            { "type": "output", "text": "      MYSQL_DATABASE: mydb" },
            { "type": "output", "text": "    volumes:" },
            { "type": "output", "text": "      - dbdata:/var/lib/mysql" },
            { "type": "output", "text": "    healthcheck:" },
            { "type": "output", "text": "      test: [CMD, mysqladmin, ping, -h, localhost]" },
            { "type": "output", "text": "      interval: 10s" },
            { "type": "output", "text": "      timeout: 5s" },
            { "type": "output", "text": "      retries: 5" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "volumes:" },
            { "type": "output", "text": "  dbdata:" },
            { "type": "warn", "text": "depends_on without condition: service_healthy only waits for container to START, not for the service to be READY. Always use condition: service_healthy for database dependencies." }
          ]
        },
        {
          "label": "Docker Compose v2 commands",
          "lines": [
            { "type": "comment", "text": "v2 command: docker compose (no hyphen). v1 deprecated: docker-compose" },
            { "type": "cmd", "prompt": "$", "text": "docker compose up -d" },
            { "type": "ok", "text": "[+] Running 2/2" },
            { "type": "ok", "text": " Container project-db-1   Healthy" },
            { "type": "ok", "text": " Container project-app-1  Started" },
            { "type": "cmd", "prompt": "$", "text": "docker compose down" },
            { "type": "cmd", "prompt": "$", "text": "docker compose down -v" },
            { "type": "comment", "text": "Teardown including named volumes (clean for CI testing)" },
            { "type": "cmd", "prompt": "$", "text": "docker compose ps" },
            { "type": "cmd", "prompt": "$", "text": "docker compose logs -f" },
            { "type": "cmd", "prompt": "$", "text": "docker compose logs -f app" },
            { "type": "cmd", "prompt": "$", "text": "docker compose stop" },
            { "type": "cmd", "prompt": "$", "text": "docker compose start" },
            { "type": "cmd", "prompt": "$", "text": "docker compose restart" },
            { "type": "cmd", "prompt": "$", "text": "docker compose pull" },
            { "type": "cmd", "prompt": "$", "text": "docker compose build" },
            { "type": "comment", "text": "Custom file name" },
            { "type": "cmd", "prompt": "$", "text": "docker compose -f prod.yml up -d" },
            { "type": "comment", "text": "Validate docker compose config before applying" },
            { "type": "cmd", "prompt": "$", "text": "docker compose config" }
          ]
        }
      ]
    },
    {
      "sessionNumber": 6,
      "totalSessions": 6,
      "sessionTitle": "STEP 6 — Jenkins Pipeline: Docker Build, Trivy Scan, Docker Push",
      "sections": [
        {
          "label": "Install Trivy on the Jenkins EC2",
          "lines": [
            { "type": "comment", "text": "Install Trivy on Amazon Linux 2023 via yum repo" },
            { "type": "cmd", "prompt": "#", "text": "cat > /etc/yum.repos.d/trivy.repo << EOF" },
            { "type": "output", "text": "[trivy]" },
            { "type": "output", "text": "name=Trivy repository" },
            { "type": "output", "text": "baseurl=https://aquasecurity.github.io/trivy-repo/rpm/releases/\/" },
            { "type": "output", "text": "gpgcheck=1" },
            { "type": "output", "text": "enabled=1" },
            { "type": "output", "text": "gpgkey=https://aquasecurity.github.io/trivy-repo/rpm/public.key" },
            { "type": "output", "text": "EOF" },
            { "type": "cmd", "prompt": "#", "text": "yum install trivy -y" },
            { "type": "cmd", "prompt": "#", "text": "trivy --version" },
            { "type": "ok", "text": "Version: 0.50.0" }
          ]
        },
        {
          "label": "Jenkins Credentials — add Docker Hub credentials",
          "lines": [
            { "type": "output", "text": "Jenkins UI path: Manage Jenkins -> Credentials -> System -> Global -> Add Credentials" },
            { "type": "output", "text": "Kind: Username with password" },
            { "type": "output", "text": "Username: nayagk" },
            { "type": "output", "text": "Password: your Docker Hub password or access token" },
            { "type": "output", "text": "ID: dockerhub-creds" },
            { "type": "output", "text": "Description: Docker Hub credentials for pipeline push" }
          ]
        },
        {
          "label": "Jenkinsfile — Docker stages to add after JFrog",
          "lines": [
            { "type": "output", "text": "stage('Docker Build') {" },
            { "type": "output", "text": "    steps {" },
            { "type": "output", "text": "        sh 'docker build -t nayagk/currency-conversion:latest .'" },
            { "type": "output", "text": "    }" },
            { "type": "output", "text": "}" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "stage('Trivy Image Scan') {" },
            { "type": "output", "text": "    steps {" },
            { "type": "output", "text": "        sh '''" },
            { "type": "output", "text": "            trivy image \\" },
            { "type": "output", "text": "              --exit-code 0 \\" },
            { "type": "output", "text": "              --severity HIGH,CRITICAL \\" },
            { "type": "output", "text": "              --format table \\" },
            { "type": "output", "text": "              nayagk/currency-conversion:latest" },
            { "type": "output", "text": "        '''" },
            { "type": "output", "text": "    }" },
            { "type": "output", "text": "}" },
            { "type": "output", "text": "" },
            { "type": "output", "text": "stage('Docker Push') {" },
            { "type": "output", "text": "    steps {" },
            { "type": "output", "text": "        withCredentials([usernamePassword(" },
            { "type": "output", "text": "            credentialsId: 'dockerhub-creds'," },
            { "type": "output", "text": "            usernameVariable: 'DOCKER_USER'," },
            { "type": "output", "text": "            passwordVariable: 'DOCKER_PASS'" },
            { "type": "output", "text": "        )]) {" },
            { "type": "output", "text": "            sh 'docker login -u  -p '" },
            { "type": "output", "text": "            sh 'docker push nayagk/currency-conversion:latest'" },
            { "type": "output", "text": "        }" },
            { "type": "output", "text": "    }" },
            { "type": "output", "text": "}" },
            { "type": "warn", "text": "Jenkins runs as the jenkins user. If docker commands fail with permission denied: sudo usermod -aG docker jenkins then systemctl restart jenkins" },
            { "type": "warn", "text": "exit-code 0 means pipeline does NOT fail on vulnerabilities. Switch to exit-code 1 when ready to enforce security gates." }
          ]
        },
        {
          "label": "Complete pipeline stage order",
          "lines": [
            { "type": "output", "text": "Maven Build  ->  SonarQube  ->  JFrog Push  ->  Docker Build  ->  Trivy Scan  ->  Docker Push" },
            { "type": "comment", "text": "Trivy scan commands for reference" },
            { "type": "cmd", "prompt": "$", "text": "trivy image nayagk/currency-conversion:latest" },
            { "type": "cmd", "prompt": "$", "text": "trivy image --severity HIGH,CRITICAL nayagk/currency-conversion:latest" },
            { "type": "cmd", "prompt": "$", "text": "trivy image --format json -o trivy-report.json nayagk/currency-conversion:latest" }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "Docker Compose Service Cannot Connect to Database",
      "steps": [
        { "num": 1, "title": "Check if you are using the default bridge network (no DNS) or a custom network", "cmd": "docker network inspect bridge" },
        { "num": 2, "title": "Verify both services are on the same network in compose file", "description": "All services in a docker-compose.yml are automatically on a shared network named after the project. Service names resolve as DNS hostnames." },
        { "num": 3, "title": "Check if depends_on uses condition: service_healthy (not just depends_on: db)", "description": "depends_on: db without condition waits for container start, not DB readiness. Add healthcheck to DB service." },
        { "num": 4, "title": "Check logs of the failing service", "cmd": "docker compose logs -f app" },
        { "num": 5, "title": "Test connectivity from inside the container", "cmd": "docker exec -it project-app-1 /bin/sh" }
      ]
    },
    {
      "title": "Jenkins Pipeline Docker Permission Denied",
      "steps": [
        { "num": 1, "title": "Add jenkins user to docker group", "cmd": "sudo usermod -aG docker jenkins" },
        { "num": 2, "title": "Restart Jenkins service", "cmd": "sudo systemctl restart jenkins" },
        { "num": 3, "title": "Verify jenkins user is in docker group", "cmd": "id jenkins" },
        { "num": 4, "title": "Re-run the failed pipeline stage", "description": "Trigger a new build. The docker commands in the pipeline should now work." }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Using docker-compose (v1 with hyphen) on Amazon Linux 2023",
      "description": "Amazon Linux 2023 ships with Docker Compose v2 as a plugin. The command is docker compose (space, no hyphen). docker-compose was v1, a separate Python binary now deprecated. Students copy old tutorials and get 'command not found'.",
      "fix": "Use docker compose (space). If you ever need to verify: docker compose version. Never install the old docker-compose binary alongside the v2 plugin."
    },
    {
      "mistake": "depends_on without condition: service_healthy for databases",
      "description": "depends_on: db tells Compose to start db before app. It does NOT wait for the database to be ready for connections. Postgres/MySQL take 2-5 seconds after start to accept connections. The app starts, tries to connect, fails, and crashes.",
      "fix": "Add a HEALTHCHECK to the db service using mysqladmin ping or pg_isready. Then use depends_on with condition: service_healthy."
    },
    {
      "mistake": "Including the version: key in docker-compose.yml for Compose v2",
      "description": "The version: '3.8' (or any version) key at the top of docker-compose.yml is obsolete in Compose v2. It is silently ignored. Students from older tutorials add it thinking it selects the schema version.",
      "fix": "Simply omit the version: key entirely. Start your file directly with services:."
    },
    {
      "mistake": "Hardcoding Docker Hub password in Jenkinsfile",
      "description": "sh 'docker login -u nayagk -p mypassword' in a Jenkinsfile commits your Docker Hub password to Git and prints it in the build log. Anyone with Jenkins access or GitHub access can see it.",
      "fix": "Store credentials in Jenkins Credentials Manager with ID 'dockerhub-creds'. Use withCredentials([usernamePassword(...)]) in the pipeline. The password is masked as **** in console output."
    }
  ],
  "project": {
    "tag": "Day 18 Project",
    "title": "Full CI/CD Pipeline: Code Push to Docker Hub",
    "timeEstimate": "90 min",
    "goal": "Push code to GitHub. Jenkins webhook triggers. Pipeline runs: Maven Build -> SonarQube -> JFrog -> Docker Build -> Trivy Scan -> Docker Push. Image appears on Docker Hub. You verify it by running docker pull nayagk/currency-conversion:latest on a clean machine.",
    "checklist": [
      "docker-compose.yml created with app and db services using named volumes and healthchecks",
      "docker compose up -d starts both services and app shows Healthy",
      "Trivy installed on Jenkins EC2: trivy --version shows output",
      "dockerhub-creds credential added in Jenkins Credentials Manager",
      "Jenkinsfile has Docker Build stage that runs docker build",
      "Jenkinsfile has Trivy Scan stage with --exit-code 0 --severity HIGH,CRITICAL",
      "Jenkinsfile has Docker Push stage using withCredentials",
      "Jenkins pipeline runs end-to-end with all stages green",
      "Docker Hub shows your image at nayagk/currency-conversion:latest",
      "docker pull nayagk/currency-conversion:latest on a new EC2 pulls the image",
      ".dockerignore at project root with target/ and !target/*.jar"
    ],
    "codeBlock": {
      "title": "docker-compose.yml",
      "lines": [
        "services:",
        "  app:",
        "    image: nayagk/currency-conversion:latest",
        "    ports:",
        "      - '8100:8100'",
        "    depends_on:",
        "      db:",
        "        condition: service_healthy",
        "    restart: unless-stopped",
        "",
        "  db:",
        "    image: mysql:8.0",
        "    environment:",
        "      MYSQL_ROOT_PASSWORD: password",
        "      MYSQL_DATABASE: mydb",
        "    volumes:",
        "      - dbdata:/var/lib/mysql",
        "    healthcheck:",
        "      test: [CMD, mysqladmin, ping, -h, localhost]",
        "      interval: 10s",
        "      retries: 5",
        "",
        "volumes:",
        "  dbdata:"
      ]
    },
    "expectedOutput": "Jenkins stage view: all 6 stages green | Docker Hub: nayagk/currency-conversion:latest updated"
  },
  "interview": [
    {
      "question": "How do you persist data in Docker containers?",
      "answer": "Container data is ephemeral by design — the writable layer is deleted when the container is removed. To persist data I use named volumes: docker volume create mydata, then docker run -v mydata:/var/lib/mysql. Docker manages the volume location at /var/lib/docker/volumes/. Named volumes survive docker rm and can be shared between containers. For development, I use bind mounts (-v /host/path:/container/path) to inject config or code from the host. In production with Kubernetes, I use PersistentVolumeClaims backed by EBS or EFS — the same concept, Kubernetes-native."
    },
    {
      "question": "Why can two containers on the default bridge network not communicate by name?",
      "answer": "The default bridge network (docker0) does not support automatic DNS resolution. Containers on the default bridge can only communicate by IP address, which is dynamic. If you create a custom bridge network with docker network create mynet and connect containers to it, Docker's embedded DNS server automatically resolves container names. In Docker Compose, all services are automatically placed on a custom network named after the project, which is why service names resolve correctly in Compose files. This is the most common Docker networking mistake and the answer is always: use a custom bridge network."
    },
    {
      "question": "What is the security concern with --exit-code 0 in Trivy, and when do you switch to --exit-code 1?",
      "answer": "--exit-code 0 means the pipeline never fails due to vulnerabilities — Trivy reports them but your deployment proceeds. This is appropriate when onboarding security scanning: you want visibility without breaking every build immediately. Once the team has reviewed the scan reports and remediated or accepted known false positives, you switch to --exit-code 1 which fails the pipeline if any CRITICAL vulnerabilities are found. The severity filter --severity HIGH,CRITICAL is important — LOW and MEDIUM vulnerabilities are often in transitive dependencies you cannot control. In production, I use exit-code 1 for CRITICAL and treat HIGH as a warning via exit-code 0 with a separate reporting job."
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "Why does depends_on: db in Docker Compose NOT guarantee your app can connect to the database?",
      "options": [
        { "text": "A) depends_on is broken in Docker Compose v2", "isCorrect": false },
        { "text": "B) depends_on only waits for the db container to START, not for the database process inside to be ready for connections", "isCorrect": true },
        { "text": "C) MySQL always starts before any other service", "isCorrect": false },
        { "text": "D) depends_on does not work with named volumes", "isCorrect": false }
      ],
      "explanation": "The container starts in milliseconds (the OS boots). The database process inside takes 2-5 more seconds to initialize before accepting connections. depends_on without condition: service_healthy only checks container start, not process readiness. Add a HEALTHCHECK with mysqladmin ping or pg_isready to the db service, then use depends_on with condition: service_healthy."
    },
    {
      "num": 2,
      "question": "What does COPY --from=builder do in a multi-stage Dockerfile?",
      "options": [
        { "text": "A) Copies files from the Docker build cache", "isCorrect": false },
        { "text": "B) Copies files from a previous build stage named 'builder' into the current stage", "isCorrect": true },
        { "text": "C) Downloads files from a Docker Hub image named 'builder'", "isCorrect": false },
        { "text": "D) Copies from the host filesystem into builder stage", "isCorrect": false }
      ],
      "explanation": "COPY --from=builder references a stage named in a previous FROM instruction (FROM maven:3.9 AS builder). It copies artifacts from that stage into the current stage without including the entire stage. This is how multi-stage builds eliminate build tools from the final image — only the compiled artifact crosses the stage boundary."
    },
    {
      "num": 3,
      "question": "What is the correct Docker Compose v2 command to start services in background?",
      "options": [
        { "text": "A) docker-compose up -d", "isCorrect": false },
        { "text": "B) docker compose up -d", "isCorrect": true },
        { "text": "C) docker-compose start", "isCorrect": false },
        { "text": "D) docker run-compose up", "isCorrect": false }
      ],
      "explanation": "Docker Compose v2 is a built-in plugin. The command is docker compose (space, no hyphen). docker-compose (with hyphen) was v1, a separate Python binary that is now deprecated and not installed by default on Amazon Linux 2023. The -d flag runs services in detached (background) mode."
    },
    {
      "num": 4,
      "question": "Which network driver should you use for containers in Docker Compose to resolve each other by service name?",
      "options": [
        { "text": "A) host — shares the host network stack", "isCorrect": false },
        { "text": "B) none — fully isolated", "isCorrect": false },
        { "text": "C) custom bridge — supports automatic DNS resolution by container name", "isCorrect": true },
        { "text": "D) default bridge — the docker0 network", "isCorrect": false }
      ],
      "explanation": "Custom bridge networks have Docker's embedded DNS server. Containers on a custom bridge can reach each other using the container name or Compose service name. Docker Compose automatically creates a custom bridge network for all services in a compose file, which is why service names work as hostnames in Compose. The default bridge (docker0) does NOT support DNS by name."
    },
    {
      "num": 5,
      "question": "In a Jenkins pipeline, why should Docker Hub credentials never be written directly in the Jenkinsfile?",
      "options": [
        { "text": "A) Jenkins cannot process string literals in shell steps", "isCorrect": false },
        { "text": "B) The Jenkinsfile is committed to Git — hardcoded credentials are visible to anyone with repo access and appear in build logs in plaintext", "isCorrect": true },
        { "text": "C) Docker Hub rejects logins from pipeline automation", "isCorrect": false },
        { "text": "D) Pipeline environment variables cannot hold special characters in passwords", "isCorrect": false }
      ],
      "explanation": "Jenkinsfile lives in the Git repository. Anything written there is version-controlled and visible to anyone with repo access. Passwords in shell steps appear in build logs in plaintext. Jenkins Credentials Manager stores secrets encrypted on disk. When used via withCredentials([usernamePassword(...)]), the value is masked as **** in all console output and never exposed in Jenkinsfile or logs."
    }
  ],
  "github": {
    "filename": "devops-90days/day-18/README.md",
    "commitMessage": "feat: Add Docker Compose, multi-stage build, and Jenkins Docker pipeline stages",
    "template": "# Day 18 — Docker: Volumes, Networking, Compose & Jenkins CI/CD\n**Date:** YYYY-MM-DD | **Status:** Complete\n\n## Roadmap Position\nMaven -> SonarQube -> JFrog -> Docker Build -> **[Trivy + Docker Push HERE]** -> K8s\n\n## What I Built\n- docker-compose.yml with app, db (MySQL), named volumes, healthchecks\n- Multi-stage Dockerfile (maven:3.9 builder -> amazoncorretto:21-alpine runtime)\n- Trivy installed on Jenkins EC2\n- Jenkinsfile extended: Docker Build -> Trivy Scan -> Docker Push stages\n- Image at Docker Hub: nayagk/currency-conversion:latest\n\n## Key Commands\n\n\n## Pipeline Stage Order\nMaven Build -> SonarQube -> JFrog -> Docker Build -> Trivy Scan -> Docker Push"
  }
};
