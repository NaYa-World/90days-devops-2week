import { BootcampDay } from '../types';

export const day14: BootcampDay = {
  "day": 14,
  "title": "Capstone + Kubernetes Introduction",
  "subtitle": "Full Pipeline Validation · K8s Concepts · kubectl · Deployment · Service · Mini Project",
  "color": "#e040fb",
  "trainerNote": "Your capstone wires everything end-to-end: Git -> Jenkins -> Maven -> Sonar -> JFrog -> Docker -> Kubernetes. It's proof of real competence.",
  "engineerNote": "Kubernetes orchestrates these containers. Deploying to K8s from a declarative pipeline is the ultimate goal of CI/CD.",
  "goal": {
    "icon": "🎯",
    "title": "🎯 Day 14 Goal",
    "description": "Two goals today. First: validate the complete pipeline end-to-end from git push to Docker image in JFrog —\n          every stage working, no manual steps. Second: understand Kubernetes core concepts, install kubectl + minikube,\n          deploy your Docker image to a local K8s cluster, and expose it as a service. Expected output: a running\n          8-stage pipeline + your Spring Boot app running inside a Kubernetes pod accessible via kubectl port-forward."
  },
  "schedule": [
    {
      "time": "09:00–09:45",
      "phase": "CAPSTONE AUDIT",
      "activity": "Full pipeline cold validation",
      "why": "From memory: push a commit. Describe what\n                each of the 8 stages does. Verify all 8 stages green. Check JAR in JFrog Maven repo. Check Docker image\n                in JFrog Docker repo. If anything broken — fix first."
    },
    {
      "time": "09:45–10:30",
      "phase": "THEORY",
      "activity": "Kubernetes — why it exists and what it solves",
      "why": "The problem Docker alone\n                doesn't solve: what happens when a container crashes? How do you update 10 containers with zero\n                downtime? How do you scale? K8s answers all three."
    },
    {
      "time": "10:30–10:45",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "10:45–12:00",
      "phase": "K8S INSTALL",
      "activity": "Install kubectl + minikube on Jenkins EC2",
      "why": "kubectl = CLI tool to talk to\n                Kubernetes. minikube = single-node K8s cluster for learning. Install both, start cluster, verify it's\n                running."
    },
    {
      "time": "12:00–12:45",
      "phase": "BREAK",
      "activity": "Lunch",
      "why": ""
    },
    {
      "time": "12:45–14:30",
      "phase": "K8S DEPLOY",
      "activity": "Deploy Spring Boot app to Kubernetes",
      "why": "Write Deployment YAML. Write\n                Service YAML. kubectl apply. Verify pods running. Port-forward to access app. Understand what happened\n                at each step."
    },
    {
      "time": "14:30–15:30",
      "phase": "K8S CONCEPTS",
      "activity": "Core K8s objects hands-on: Pod, Deployment, Service, Namespace",
      "why": "kubectl\n                get, describe, logs, exec. Delete a pod — watch it self-heal. Scale the deployment. These commands are\n                asked in every K8s interview."
    },
    {
      "time": "15:30–15:45",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "15:45–16:30",
      "phase": "PROJECT",
      "activity": "Mini Project: full capstone",
      "why": ""
    },
    {
      "time": "16:30–17:00",
      "phase": "COMMIT",
      "activity": "Final quiz + Week 2 notes + commit K8s YAMLs",
      "why": ""
    }
  ],
  "concepts": [
    {
      "icon": "❓",
      "title": "Why Kubernetes Exists",
      "description": "Docker solves \"how do I package and run my app in a container.\" But: what happens when the container\n            crashes? How do you run 10 copies for high traffic? How do you update them without downtime? Docker alone\n            has no answer. Kubernetes orchestrates containers — it manages their lifecycle, scaling, networking, and\n            updates across multiple servers.",
      "analogy": "K8s takes your Docker image and says: \"I'll make sure this always runs, always scales, and\n            always updates safely.\" This is why it comes after Docker in your roadmap."
    },
    {
      "icon": "🫛",
      "title": "Pod — Smallest Unit",
      "description": "A Pod is the smallest deployable unit in Kubernetes. It wraps one or more containers that share the same\n            network and storage. Usually one container per Pod. Pods are ephemeral — when they crash, Kubernetes creates\n            a new one. You never manage Pods directly — you manage Deployments which manage Pods.",
      "analogy": "\"A Pod is a wrapper around one or more containers, sharing a network namespace.\n            Kubernetes schedules Pods onto nodes and restarts them if they fail.\""
    },
    {
      "icon": "📦",
      "title": "Deployment — Manages Pods",
      "description": "A Deployment tells Kubernetes: \"run 3 replicas of this Pod, using this Docker image, with these resource\n            limits.\" If a Pod crashes, the Deployment controller notices the actual count (2) doesn't match desired (3)\n            and creates a new Pod. Deployments also manage rolling updates.",
      "analogy": "You will always use a Deployment, never a bare Pod in production. Deployment = desired state\n            declaration. K8s continuously reconciles actual state to match desired state."
    },
    {
      "icon": "🌐",
      "title": "Service — Stable Network Endpoint",
      "description": "Pods have dynamic IPs that change when Pods restart. A Service gives a stable DNS name and IP to a group of\n            Pods. ClusterIP: only reachable inside the cluster. NodePort: exposed on\n            each node's IP at a specific port. LoadBalancer: creates a cloud load balancer (AWS ALB).",
      "analogy": "The Service is how other Pods and external users reach your app. \"spring-boot-service\" → always\n            routes to healthy spring-boot pods, regardless of which pods are alive."
    },
    {
      "icon": "🗂",
      "title": "Namespace",
      "description": "A Namespace is a virtual cluster within a physical cluster. Isolates resources by team or environment.\n            default (what you use now), kube-system (K8s internals), prod, dev, staging. Resources in different\n            namespaces are isolated — Pod A in namespace dev cannot reach Pod B in namespace prod by default.",
      "analogy": "In your pipeline: Week 3 will deploy to different namespaces per environment. For now, use the\n            default namespace."
    },
    {
      "icon": "🔑",
      "title": "kubectl — K8s CLI",
      "description": "kubectl is the command-line tool for every Kubernetes operation. kubectl get pods lists pods.\n            kubectl apply -f file.yaml creates/updates resources. kubectl describe pod NAME\n            shows events and status. kubectl logs POD_NAME shows container logs.\n            kubectl exec -it POD -- bash opens a shell inside a pod.",
      "analogy": "All K8s interviews ask you to demonstrate kubectl commands. Know these 6 cold: get, describe,\n            logs, exec, apply, delete."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 3,
      "sessionTitle": "End-to-End Pipeline Verification — Every Stage Proven",
      "sections": [
        {
          "label": "Trigger a full pipeline run and validate each stage output",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cd\n              ~/devops-90days"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo \"# Capstone\n              validation $(date)\" >> README.md"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git add -A && git\n              commit -m \"test: Week 2 capstone full pipeline validation\""
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "git push"
            },
            {
              "type": "output",
              "text": "# Webhook fires → Jenkins starts pipeline"
            },
            {
              "type": "output",
              "text": "# Watch Stage View in Jenkins UI"
            },
            {
              "type": "output",
              "text": ""
            },
            {
              "type": "ok",
              "text": "Stage 1: Checkout ✓ — repo cloned, version read from pom.xml"
            },
            {
              "type": "ok",
              "text": "Stage 2: Build ✓ — mvn clean compile, no errors"
            },
            {
              "type": "ok",
              "text": "Stage 3: Test ✓ — 3 tests passed, surefire XML published"
            },
            {
              "type": "ok",
              "text": "Stage 4: SonarQube ✓ — analysis sent to SonarQube server"
            },
            {
              "type": "ok",
              "text": "Stage 5: Quality Gate ✓ — gate PASSED (no new bugs/vulnerabilities)"
            },
            {
              "type": "ok",
              "text": "Stage 6: Artifactory ✓ — devops-app-1.0.0.jar in devops-maven-local"
            },
            {
              "type": "ok",
              "text": "Stage 7: Docker Build ✓ — image devops-app:1.0.0 built locally"
            },
            {
              "type": "ok",
              "text": "Stage 8: JFrog Docker ✓ — image pushed to devops-docker-local"
            },
            {
              "type": "output",
              "text": ""
            }
          ]
        },
        {
          "label": "Verify artifacts in JFrog via API",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl -s -u\n              jenkins-ci:TOKEN \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "http://ARTIFACTORY_IP:8082/artifactory/api/storage/devops-maven-local/com/devops/devops-app/1.0.0/\n              \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "| grep uri"
            },
            {
              "type": "ok",
              "text": "\"uri\": \".../devops-app-1.0.0.jar\""
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl -s -u\n              jenkins-ci:TOKEN \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "http://ARTIFACTORY_IP:8082/artifactory/api/storage/devops-docker-local/devops-app/ \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "| grep\n              children"
            },
            {
              "type": "ok",
              "text": "\"children\": [{\"uri\": \"/1.0.0\"}, {\"uri\": \"/latest\"}]"
            },
            {
              "type": "output",
              "text": "# Both artifacts confirmed in JFrog ✓"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 3,
      "sessionTitle": "Install kubectl + minikube on Jenkins EC2",
      "sections": [
        {
          "label": "Install kubectl",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl -LO\n              \"https://dl.k8s.io/release/$(curl -L -s\n              https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl\""
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo install -o root\n              -g root -m 0755 kubectl /usr/local/bin/kubectl"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl version\n              --client"
            },
            {
              "type": "ok",
              "text": "Client Version: v1.30.0"
            }
          ]
        },
        {
          "label": "Install minikube (single-node K8s for learning)",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl -LO\n              https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "sudo install\n              minikube-linux-amd64 /usr/local/bin/minikube"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "minikube start\n              --driver=docker --memory=2048 --cpus=2"
            },
            {
              "type": "output",
              "text": "😄 minikube v1.33.0 on Ubuntu 22.04"
            },
            {
              "type": "output",
              "text": "✨ Using the docker driver"
            },
            {
              "type": "output",
              "text": "🏄 Done! kubectl is now configured to use \"minikube\" cluster"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get\n              nodes"
            },
            {
              "type": "ok",
              "text": "NAME STATUS ROLES AGE VERSION"
            },
            {
              "type": "ok",
              "text": "minikube Ready control-plane 30s v1.30.0"
            },
            {
              "type": "output",
              "text": "# One node cluster is running. Ready = K8s is operational."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl\n              cluster-info"
            },
            {
              "type": "ok",
              "text": "Kubernetes control plane is running at https://192.168.49.2:8443"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 3,
      "totalSessions": 3,
      "sessionTitle": "Deploy to Kubernetes + Essential kubectl Commands",
      "sections": [
        {
          "label": "Load Docker image into minikube (minikube uses its own Docker daemon)",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "minikube image load\n              devops-app:1.0.0"
            },
            {
              "type": "output",
              "text": "# Loads the locally built image into minikube's internal registry"
            },
            {
              "type": "output",
              "text": "# Required because minikube has a separate Docker daemon from the host"
            }
          ]
        },
        {
          "label": "Apply the YAML files — create the Deployment and Service",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl apply -f\n              k8s/deployment.yaml"
            },
            {
              "type": "ok",
              "text": "deployment.apps/devops-app created"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl apply -f\n              k8s/service.yaml"
            },
            {
              "type": "ok",
              "text": "service/devops-app-service created"
            }
          ]
        },
        {
          "label": "Essential kubectl commands — know these cold",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get\n              pods"
            },
            {
              "type": "ok",
              "text": "NAME READY STATUS RESTARTS AGE"
            },
            {
              "type": "ok",
              "text": "devops-app-5f7d9c8b6-x2jkp 1/1 Running 0 45s"
            },
            {
              "type": "ok",
              "text": "devops-app-5f7d9c8b6-m8nqr 1/1 Running 0 45s"
            },
            {
              "type": "output",
              "text": "# 2 replicas running as specified in deployment.yaml. 1/1 = 1 container of 1 ready."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get\n              deployments"
            },
            {
              "type": "ok",
              "text": "NAME READY UP-TO-DATE AVAILABLE AGE"
            },
            {
              "type": "ok",
              "text": "devops-app 2/2 2 2 1m"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get\n              services"
            },
            {
              "type": "ok",
              "text": "NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE"
            },
            {
              "type": "ok",
              "text": "devops-app-service NodePort 10.105.3.141 <none> 80:31245/TCP 1m"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl describe pod\n              devops-app-5f7d9c8b6-x2jkp"
            },
            {
              "type": "output",
              "text": "# Shows: image, node, events, readiness probe status, resource usage"
            },
            {
              "type": "output",
              "text": "# Events section is where startup failures are described"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl logs\n              devops-app-5f7d9c8b6-x2jkp"
            },
            {
              "type": "ok",
              "text": ". ____ _ __ _ _"
            },
            {
              "type": "ok",
              "text": "/\\\\ / ___'_ __ _ _(_)_ __ __ _"
            },
            {
              "type": "ok",
              "text": "Started DevopsAppApplication in 3.421 seconds (process running for 3.8)"
            },
            {
              "type": "output",
              "text": "# Spring Boot startup logs. Confirms app started successfully inside K8s."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl exec -it\n              devops-app-5f7d9c8b6-x2jkp -- sh"
            },
            {
              "type": "ok",
              "text": "/ $ wget -qO- http://localhost:8080/health"
            },
            {
              "type": "ok",
              "text": "{\"status\":\"healthy\",\"app\":\"devops-app\"}"
            },
            {
              "type": "output",
              "text": "# exit to leave the pod shell"
            }
          ]
        },
        {
          "label": "Access the app via port-forward",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl port-forward\n              service/devops-app-service 9090:80 &"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl\n              http://localhost:9090"
            },
            {
              "type": "ok",
              "text": "Hello from DevOps Pipeline! Built by Jenkins."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl\n              http://localhost:9090/health"
            },
            {
              "type": "ok",
              "text": "{\"status\":\"healthy\",\"app\":\"devops-app\"}"
            }
          ]
        },
        {
          "label": "K8s self-healing demo — delete a pod, watch it restart",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl delete pod\n              devops-app-5f7d9c8b6-x2jkp"
            },
            {
              "type": "ok",
              "text": "pod \"devops-app-5f7d9c8b6-x2jkp\" deleted"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get\n              pods # immediately after delete"
            },
            {
              "type": "ok",
              "text": "NAME READY STATUS RESTARTS AGE"
            },
            {
              "type": "ok",
              "text": "devops-app-5f7d9c8b6-m8nqr 1/1 Running 0 5m"
            },
            {
              "type": "output",
              "text": "devops-app-5f7d9c8b6-q9prt 0/1 ContainerCreating 0 2s ← NEW POD"
            },
            {
              "type": "output",
              "text": "# Deployment saw 1 pod instead of 2 — immediately created a replacement"
            },
            {
              "type": "output",
              "text": "# This is Kubernetes self-healing in action"
            }
          ]
        },
        {
          "label": "Scale the deployment",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl scale\n              deployment devops-app --replicas=4"
            },
            {
              "type": "ok",
              "text": "deployment.apps/devops-app scaled"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get\n              pods"
            },
            {
              "type": "ok",
              "text": "# 4 pods now running — K8s created 2 more automatically"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl scale\n              deployment devops-app --replicas=2 # scale back down"
            }
          ]
        },
        {
          "label": "Clean up",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl delete -f\n              k8s/deployment.yaml"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl delete -f\n              k8s/service.yaml"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "minikube\n              stop # stop cluster when done studying"
            }
          ]
        }
      ]
    }
  ],
  "debugTrees": [],
  "mistakes": [],
  "project": {
    "tag": "★ Week 2 Capstone",
    "title": "Full Pipeline + K8s Deployment — Everything Connected",
    "timeEstimate": "⏱ Full afternoon",
    "goal": "Rebuild the Day 14 state from scratch using only your own notes. Git\n            push → 8-stage Jenkins pipeline → JAR in JFrog Maven → Docker image in JFrog Docker → deploy image to local\n            Kubernetes → verify app running in Pod → demonstrate self-healing by deleting a Pod. Document everything in\n            GitHub README with architecture diagram.",
    "checklist": [
      "Full 8-stage pipeline green: Checkout → Build → Test → SonarQube → Quality Gate → Artifactory → Docker\n              Build → JFrog Docker Registry",
      "devops-app-1.0.0.jar in JFrog devops-maven-local ✓",
      "devops-app:1.0.0 image in JFrog devops-docker-local ✓",
      "minikube cluster running: kubectl get nodes shows Ready",
      "kubectl apply -f k8s/ deploys both Deployment and Service",
      "kubectl get pods shows 2/2 Running",
      "curl http://localhost:9090 returns app response",
      "Self-healing demo: delete one pod → K8s creates replacement",
      "Scale to 4 replicas → scale back to 2",
      "k8s/ directory with deployment.yaml and service.yaml committed to GitHub",
      "Week 2 README with complete ASCII architecture diagram"
    ],
    "expectedOutput": "Complete Week 2 Architecture\n            Developer → git push → GitHub Webhook\n            → Jenkins Pipeline (8 stages):\n            Checkout → Build (mvn compile) → Test (mvn test + JUnit report)\n            → SonarQube Analysis → Quality Gate (must pass)\n            → Deploy to JFrog Artifactory (devops-app-1.0.0.jar)\n            → Docker Build (multi-stage, non-root, healthcheck)\n            → Push to JFrog Docker Registry (devops-app:1.0.0)\n            → Kubernetes (minikube):\n            Deployment: 2 replicas of devops-app:1.0.0\n            Service: NodePort 80 → Pod 8080\n            Probes: livenessProbe + readinessProbe on /health\n            Self-healing: delete Pod → Deployment restarts automatically"
  },
  "interview": [],
  "quiz": [
    {
      "num": 1,
      "question": "What is the difference between mvn package and mvn deploy?",
      "options": [
        {
          "text": "A) They are identical",
          "isCorrect": false
        },
        {
          "text": "B) mvn package creates JAR locally in target/; mvn deploy also\n            uploads it to a remote repository (like JFrog Artifactory)",
          "isCorrect": true
        },
        {
          "text": "C) mvn deploy deploys the app to a server",
          "isCorrect": false
        },
        {
          "text": "D) mvn package skips tests; mvn deploy runs them",
          "isCorrect": false
        }
      ],
      "explanation": "mvn package: compile + test + create JAR in target/. Stays local. mvn deploy: everything\n          package does + uploads the artifact to the remote repository defined in pom.xml (or via the JFrog plugin). In\n          your pipeline you use the JFrog plugin's rtMaven instead of plain mvn deploy, which gives better credential\n          management and build info tracking."
    },
    {
      "num": 2,
      "question": "SonarQube's waitForQualityGate step hangs for 5 minutes. What is the\n          cause?",
      "options": [
        {
          "text": "A) SonarQube token has expired",
          "isCorrect": false
        },
        {
          "text": "B) The SonarQube webhook pointing to Jenkins /sonarqube-webhook/ is\n            not configured, so Jenkins never receives the quality gate result",
          "isCorrect": true
        },
        {
          "text": "C) Maven version is incompatible",
          "isCorrect": false
        },
        {
          "text": "D) Jenkins firewall blocks SonarQube",
          "isCorrect": false
        }
      ],
      "explanation": "waitForQualityGate registers a listener endpoint on Jenkins at /sonarqube-webhook/. After\n          analysis, SonarQube must POST the gate result to that URL. If the webhook is missing in SonarQube\n          Administration → Webhooks, the POST never happens. Jenkins waits until timeout. Fix: create webhook in\n          SonarQube pointing to http://JENKINS_IP:8080/sonarqube-webhook/ (trailing slash mandatory)."
    },
    {
      "num": 3,
      "question": "Why does the Dockerfile copy pom.xml before COPY src in the builder\n          stage?",
      "options": [
        {
          "text": "A) Docker requires this specific order for Java projects",
          "isCorrect": false
        },
        {
          "text": "B) Layer caching — if only source code changes, the dependency\n            download layer is reused from cache, saving 60+ seconds per build",
          "isCorrect": true
        },
        {
          "text": "C) Maven cannot find pom.xml if placed after src",
          "isCorrect": false
        },
        {
          "text": "D) It reduces the final image size",
          "isCorrect": false
        }
      ],
      "explanation": "Docker builds layers sequentially and caches each one. A cached layer is reused if neither the\n          instruction nor any file it depends on has changed. pom.xml changes rarely (dependency updates). Source code\n          changes constantly. By copying pom.xml first and running dependency:go-offline, that download layer is cached\n          for all code-only changes — dropping rebuild time from 90s to 18s."
    },
    {
      "num": 4,
      "question": "What is the difference between a Kubernetes Deployment and a Pod?",
      "options": [
        {
          "text": "A) Pods are for stateful apps; Deployments for stateless apps",
          "isCorrect": false
        },
        {
          "text": "B) A Pod is a single running container group; a Deployment manages\n            desired state — how many Pod replicas should run and restarts them if they fail",
          "isCorrect": true
        },
        {
          "text": "C) Deployments are only used in production",
          "isCorrect": false
        },
        {
          "text": "D) They are the same thing with different YAML structure",
          "isCorrect": false
        }
      ],
      "explanation": "A Pod is ephemeral — when it crashes, it's gone. A Deployment is a controller that says \"I want\n          2 replicas of this Pod spec running at all times.\" The Deployment controller continuously reconciles: actual\n          Pods → desired count. If a Pod dies, the Deployment creates a new one. You always use Deployments, never bare\n          Pods in production, because bare Pods are not self-healing."
    },
    {
      "num": 5,
      "question": "What is the difference between livenessProbe and readinessProbe in\n          Kubernetes?",
      "options": [
        {
          "text": "A) They are identical — just different names",
          "isCorrect": false
        },
        {
          "text": "B) livenessProbe: if it fails, K8s restarts the container.\n            readinessProbe: if it fails, K8s stops sending traffic to the Pod (but doesn't restart it)",
          "isCorrect": true
        },
        {
          "text": "C) livenessProbe checks disk; readinessProbe checks network",
          "isCorrect": false
        },
        {
          "text": "D) readinessProbe only runs at startup; livenessProbe runs\n            continuously",
          "isCorrect": false
        }
      ],
      "explanation": "livenessProbe: \"is this container still alive?\" If it fails repeatedly, K8s kills and restarts\n          the container. Use for detecting deadlocks or crashes. readinessProbe: \"is this container ready to serve\n          traffic?\" If it fails, the Pod is removed from the Service's load balancing — traffic goes only to healthy\n          Pods. Use for warm-up time (Spring Boot takes 30s to start) — don't send traffic until it's ready, but don't\n          restart it either."
    },
    {
      "num": 6,
      "question": "You delete a Pod manually. What happens next in Kubernetes?",
      "options": [
        {
          "text": "A) The Deployment is also deleted",
          "isCorrect": false
        },
        {
          "text": "B) The Deployment controller detects the actual replica count dropped\n            below desired, and immediately creates a replacement Pod",
          "isCorrect": true
        },
        {
          "text": "C) Nothing — Kubernetes only manages Pods it created itself",
          "isCorrect": false
        },
        {
          "text": "D) An alert is sent but no automatic action is taken",
          "isCorrect": false
        }
      ],
      "explanation": "The Deployment controller runs a continuous reconciliation loop: every few seconds it checks\n          \"do I have the desired number of healthy Pods?\" When you delete a Pod, actual count drops below desired. The\n          controller immediately creates a new Pod from the same spec. This is Kubernetes self-healing — the system\n          automatically repairs itself without human intervention."
    },
    {
      "num": 7,
      "question": "What is the purpose of a Kubernetes Service?",
      "options": [
        {
          "text": "A) To build Docker images",
          "isCorrect": false
        },
        {
          "text": "B) To give a stable network endpoint (DNS name + IP) to a group of\n            Pods, abstracting away their dynamic IPs",
          "isCorrect": true
        },
        {
          "text": "C) To monitor Pod health",
          "isCorrect": false
        },
        {
          "text": "D) To store persistent data",
          "isCorrect": false
        }
      ],
      "explanation": "Pod IPs change every time a Pod is created. A Service has a stable ClusterIP and DNS name that\n          never changes. It uses the selector to find Pods with matching labels and load-balances traffic across them.\n          Other Pods and external users always connect to the Service, never directly to Pod IPs. When Pods are replaced\n          (crash recovery, scaling, rolling update), the Service automatically routes to the new healthy Pods."
    },
    {
      "num": 8,
      "question": "Walk me through your Week 2 pipeline in 60 seconds for an\n          interviewer.",
      "options": [
        {
          "text": "A) \"I set up Jenkins, Maven, SonarQube, JFrog, Docker, and\n            Kubernetes.\"",
          "isCorrect": false
        },
        {
          "text": "B) \"A git push triggers a Jenkins pipeline via GitHub webhook.\n            Jenkins runs 8 stages: compile, test, SonarQube quality scan with quality gate, publish JAR to JFrog\n            Artifactory, build Docker image, push to JFrog Docker Registry. I verified self-healing in Kubernetes —\n            deleted a pod, Deployment replaced it automatically.\"",
          "isCorrect": true
        },
        {
          "text": "C) \"I learned Docker and Jenkins this week.\"",
          "isCorrect": false
        },
        {
          "text": "D) \"I built a CI/CD pipeline using various DevOps tools.\"",
          "isCorrect": false
        }
      ],
      "explanation": "Option B is correct because it: leads with the automation outcome (git push triggers pipeline),\n          names the specific stages and tools in order, mentions the quality gate (shows you understand gates not just\n          runs), covers both artifact types (JAR and Docker image), and ends with a concrete demonstration of K8s\n          self-healing. Option A just lists tools — no outcomes, no depth. This is the difference between a candidate\n          who passes the interview and one who doesn't."
    }
  ],
  "github": null,
  "pdfUrl": "/pdfs/day14.pdf",
  "images": []
};
