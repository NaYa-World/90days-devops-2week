import { BootcampDay } from '../types';

export const day16: BootcampDay = {
  "day": 16,
  "title": "Kubernetes Ingress — Production Traffic Routing",
  "subtitle": "Ingress Controller · Path-Based Routing · Host-Based Routing · TLS · Replace NodePort",
  "color": "#4a90d9",
  "trainerNote": "Ingress is the traffic controller of your Kubernetes cluster. It routes external HTTP/HTTPS traffic to the correct internal services.",
  "engineerNote": "Configure an Ingress controller like Nginx. Use ingress rules to map domain names and paths directly to service ports.",
  "goal": {
    "icon": "🎯",
    "title": "🎯 Day 16 Goal",
    "description": "By end of Day 16: nginx Ingress controller running in your cluster, your devops-app exposed via Ingress (not\n          NodePort), path-based routing working so /app and /health route correctly, and you understand why NodePort is\n          never used in production. Expected output: curl http://devops.local/ returns app response routed through the\n          Ingress controller."
  },
  "schedule": [
    {
      "time": "09:00–09:20",
      "phase": "RECALL",
      "activity": "Day 15 cold check",
      "why": "From memory: create a ConfigMap, create a Secret,\n                inject both into a deployment. kubectl rollout restart. If you need notes, review Day 15 before\n                Ingress."
    },
    {
      "time": "09:20–10:15",
      "phase": "THEORY",
      "activity": "Ingress architecture — controller, resource, rules",
      "why": "What an Ingress\n                controller is vs an Ingress resource. How nginx Ingress handles routing. Why ClusterIP + Ingress beats\n                NodePort. TLS termination at the Ingress layer."
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
      "activity": "Enable nginx Ingress controller in minikube + verify",
      "why": "minikube addons\n                enable ingress. Verify controller pod running in ingress-nginx namespace. Get minikube IP for\n                testing."
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
      "activity": "Convert service from NodePort to ClusterIP + write Ingress\n                resource",
      "why": "Update service.yaml type to ClusterIP. Write ingress.yaml with path rules. Apply.\n                Verify routing works."
    },
    {
      "time": "14:30–15:30",
      "phase": "HANDS-ON",
      "activity": "Path-based routing + host-based routing",
      "why": "Add a second service. Route\n                /app to devops-app, /health to a health-check service. Then configure host-based routing: devops.local →\n                devops-app."
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
      "activity": "Mini Project: devops-app fully exposed via Ingress",
      "why": ""
    },
    {
      "time": "16:45–17:00",
      "phase": "COMMIT",
      "activity": "Day 16 notes + quiz",
      "why": ""
    }
  ],
  "concepts": [
    {
      "icon": "🚪",
      "title": "Ingress Controller vs Ingress Resource",
      "description": "Two separate things. The Ingress Controller is a pod running inside the cluster (nginx,\n            Traefik, HAProxy) that watches for Ingress resources and configures routing rules. The Ingress\n              Resource is a YAML file you write that defines the routing rules. Without a controller, an\n            Ingress resource does nothing.",
      "analogy": "Common mistake: writing an ingress.yaml, applying it, nothing works. Reason: no Ingress\n            controller is installed. In minikube: minikube addons enable ingress installs the controller."
    },
    {
      "icon": "🗺",
      "title": "Path-Based Routing",
      "description": "One Ingress can route different URL paths to different services: /app → devops-app:80,\n            /api → api-service:8080, /admin → admin-service:3000. All on the same hostname,\n            same port 80. The Ingress controller reads the path and forwards to the correct backend service.",
      "analogy": "This is how microservices architectures work in production — one load balancer IP, different\n            services behind different paths. No separate ports per service."
    },
    {
      "icon": "🌐",
      "title": "Host-Based Routing",
      "description": "Route based on the hostname: app.devops.local → devops-app,\n            admin.devops.local → admin-app. Both resolve to the same Ingress IP. The Ingress controller\n            reads the Host header and routes accordingly. Used when different applications share a cluster but need\n            separate domains.",
      "analogy": "In production: api.company.com and app.company.com both point to the same ALB/Ingress IP.\n            Routing is done inside the cluster by host header — no separate load balancers needed per app."
    },
    {
      "icon": "🔒",
      "title": "TLS Termination",
      "description": "HTTPS is terminated at the Ingress controller. You provide a TLS certificate as a Kubernetes Secret. The\n            Ingress rule references it. External traffic hits the Ingress on port 443 (encrypted). The Ingress decrypts\n            and forwards to backend services on port 80 (plain HTTP inside the cluster). Backend services don't need to\n            handle TLS.",
      "analogy": "This is the standard production pattern. Your Spring Boot app does not deal with certificates.\n            The Ingress layer handles all SSL — one certificate, one renewal, many services behind it."
    },
    {
      "icon": "⚖️",
      "title": "ClusterIP Service Type",
      "description": "ClusterIP is the default service type — only reachable from inside the cluster. No external access. This is\n            what you use when the service is accessed via Ingress (Ingress → ClusterIP service → pods). NodePort adds\n            external access directly — bypassing Ingress. LoadBalancer creates a cloud load balancer — expensive and not\n            needed when you have Ingress.",
      "analogy": "Production pattern: all services use ClusterIP. One Ingress controller is the single entry\n            point. This centralises routing, SSL, rate limiting, and logging in one place."
    },
    {
      "icon": "📋",
      "title": "Ingress Annotations",
      "description": "Annotations customise Ingress controller behaviour: rewrite URL paths, set timeouts, configure rate\n            limiting, force HTTPS redirect. Different controllers use different annotation prefixes. nginx Ingress uses\n            nginx.ingress.kubernetes.io/.",
      "analogy": "nginx.ingress.kubernetes.io/rewrite-target: / — strips the path prefix before forwarding.\n            Without it, /app/hello forwards /app/hello to the backend which only knows /hello — causing 404s."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 2,
      "sessionTitle": "Enable nginx Ingress in minikube + Verify",
      "sections": [
        {
          "label": "Enable the nginx Ingress addon in minikube",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "minikube addons\n              enable ingress"
            },
            {
              "type": "ok",
              "text": "💡 ingress is an addon maintained by Kubernetes. For any concerns contact minikube on\n            GitHub."
            },
            {
              "type": "ok",
              "text": "🔎 After the addon is enabled, please run \"minikube tunnel\" in another terminal."
            },
            {
              "type": "ok",
              "text": "▪ Using image registry.k8s.io/ingress-nginx/controller:v1.9.4"
            },
            {
              "type": "ok",
              "text": "🌟 The 'ingress' addon is enabled"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get pods -n\n              ingress-nginx"
            },
            {
              "type": "ok",
              "text": "NAME READY STATUS RESTARTS AGE"
            },
            {
              "type": "ok",
              "text": "ingress-nginx-controller-7799c6795f-xk2t9 1/1 Running 0 60s"
            },
            {
              "type": "output",
              "text": "# The Ingress controller pod is running — it watches for Ingress resources"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get\n              ingressclass"
            },
            {
              "type": "ok",
              "text": "NAME CONTROLLER PARAMETERS AGE"
            },
            {
              "type": "ok",
              "text": "nginx k8s.io/ingress-nginx <none> 2m"
            },
            {
              "type": "output",
              "text": "# IngressClass 'nginx' is registered — reference it in ingress.yaml"
            }
          ]
        },
        {
          "label": "Get minikube IP — this is where Ingress traffic enters the cluster",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "minikube ip"
            },
            {
              "type": "ok",
              "text": "192.168.49.2"
            },
            {
              "type": "output",
              "text": "# All Ingress rules resolve to this IP in minikube"
            },
            {
              "type": "output",
              "text": "# Add to /etc/hosts for hostname-based routing:"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "echo \"$(minikube ip)\n              devops.local\" | sudo tee -a /etc/hosts"
            },
            {
              "type": "ok",
              "text": "192.168.49.2 devops.local"
            }
          ]
        },
        {
          "label": "Run minikube tunnel in a SEPARATE terminal (needed for LoadBalancer + Ingress)",
          "lines": [
            {
              "type": "output",
              "text": "# In a new terminal session:"
            },
            {
              "type": "output",
              "text": "# minikube tunnel"
            },
            {
              "type": "output",
              "text": "# Leave this running — it routes traffic into the minikube cluster"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 2,
      "sessionTitle": "Apply Ingress + Verify Routing",
      "sections": [
        {
          "label": "Apply updated service and ingress",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl apply -f\n              k8s/dev/service.yaml"
            },
            {
              "type": "ok",
              "text": "service/devops-app-service configured"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl apply -f\n              k8s/dev/ingress.yaml"
            },
            {
              "type": "ok",
              "text": "ingress.networking.k8s.io/devops-app-ingress created"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get ingress\n              -n dev"
            },
            {
              "type": "ok",
              "text": "NAME CLASS HOSTS ADDRESS PORTS AGE"
            },
            {
              "type": "ok",
              "text": "devops-app-ingress nginx devops.local 192.168.49.2 80 30s"
            },
            {
              "type": "output",
              "text": "# ADDRESS shows the minikube IP — Ingress is live"
            }
          ]
        },
        {
          "label": "Test routing via hostname",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl\n              http://devops.local/"
            },
            {
              "type": "ok",
              "text": "Hello from DevOps Pipeline! Built by Jenkins."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl\n              http://devops.local/health"
            },
            {
              "type": "ok",
              "text": "{\"status\":\"healthy\",\"app\":\"devops-app\"}"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "curl\n              http://devops.local/app/"
            },
            {
              "type": "ok",
              "text": "Hello from DevOps Pipeline! Built by Jenkins."
            },
            {
              "type": "output",
              "text": "# /app/ rewritten to / before reaching Spring Boot — rewrite-target annotation\n            working"
            }
          ]
        },
        {
          "label": "Describe ingress — see all rules and backend assignments",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl describe\n              ingress devops-app-ingress -n dev"
            },
            {
              "type": "ok",
              "text": "Name: devops-app-ingress"
            },
            {
              "type": "ok",
              "text": "Namespace: dev"
            },
            {
              "type": "ok",
              "text": "Address: 192.168.49.2"
            },
            {
              "type": "ok",
              "text": "Ingress Class: nginx"
            },
            {
              "type": "ok",
              "text": "Rules:"
            },
            {
              "type": "ok",
              "text": "Host Path Backends"
            },
            {
              "type": "ok",
              "text": "---- ---- --------"
            },
            {
              "type": "ok",
              "text": "devops.local /app(/|$)(.*) devops-app-service:80\n            (10.244.0.5:8080,10.244.0.6:8080)"
            },
            {
              "type": "ok",
              "text": "/()(.*) devops-app-service:80 (10.244.0.5:8080,10.244.0.6:8080)"
            },
            {
              "type": "output",
              "text": "# Backend shows both pod IPs — load balancing across 2 replicas"
            }
          ]
        },
        {
          "label": "View nginx Ingress controller logs — see each request routed",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl logs -n\n              ingress-nginx \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "$(kubectl get pods\n              -n ingress-nginx -o name) \\"
            },
            {
              "type": "cmd",
              "prompt": "",
              "text": "--tail=10"
            },
            {
              "type": "ok",
              "text": "192.168.49.1 - - \"GET / HTTP/1.1\" 200 43 devops.local"
            },
            {
              "type": "ok",
              "text": "192.168.49.1 - - \"GET /health HTTP/1.1\" 200 38 devops.local"
            }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "⚡ Ingress not routing — curl returns 404 or connection refused",
      "steps": [
        {
          "num": 1,
          "title": "Ingress controller pod not running",
          "description": "kubectl get pods -n\n              ingress-nginx → must show Running. If not: minikube addons enable ingress",
          "cmd": "kubectl get pods -n\n              ingress-nginx → must show Running. If not: minikube addons enable ingress"
        },
        {
          "num": 2,
          "title": "Ingress ADDRESS field is empty",
          "description": "Controller hasn't assigned the IP yet —\n              or minikube tunnel is not running.",
          "cmd": "kubectl get ingress -n dev → wait for ADDRESS\n              to populate. Run minikube tunnel in separate terminal."
        },
        {
          "num": 3,
          "title": "devops.local not resolving — DNS not set up",
          "description": "echo \"$(minikube\n              ip) devops.local\" | sudo tee -a /etc/hosts → then retry",
          "cmd": "echo \"$(minikube\n              ip) devops.local\" | sudo tee -a /etc/hosts → then retry"
        },
        {
          "num": 4,
          "title": "Service still NodePort — Ingress cannot route to NodePort services",
          "description": "kubectl get service devops-app-service -n dev → type must be ClusterIP not NodePort",
          "cmd": "kubectl get service devops-app-service -n dev → type must be ClusterIP not NodePort"
        }
      ]
    },
    {
      "title": "Common Errors & Troubleshooting",
      "steps": [
        {
          "num": 1,
          "title": "curl http://devops.local/app/ returns 404 from Spring Boot",
          "description": "Cause: rewrite-target annotation missing or wrong — /app/ is forwarded as /app/ to Spring Boot\n          which has no such endpoint | Fix: Verify annotation: nginx.ingress.kubernetes.io/rewrite-target: /$2 and path pattern:\n          /app(/|$)(.*)"
        },
        {
          "num": 2,
          "title": "\"ingressClassName: nginx\" causes error \"no IngressClass named nginx\"",
          "description": "Cause: Ingress controller addon not fully started yet | Fix: kubectl get ingressclass → wait for nginx to appear. Takes 60-90s after addon enable."
        },
        {
          "num": 3,
          "title": "Ingress works for one path but 503 for another",
          "description": "Cause: Backend service for that path has no healthy pods — service selector doesn't match pod\n          labels | Fix: kubectl describe ingress -n dev → check Backends section shows pod IPs not \"< error>\""
        }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Using NodePort services with Ingress",
      "description": "Ingress routes to ClusterIP services, not NodePort. Using NodePort with Ingress creates confusion —\n              external traffic hits both the random NodePort directly AND through Ingress, bypassing your routing rules.",
      "fix": "When using Ingress, all services behind it should be type ClusterIP. Only the\n              Ingress controller needs external access."
    },
    {
      "mistake": "Forgetting the rewrite-target annotation when using path prefixes",
      "description": "/app/health routed to Spring Boot becomes a 404 because Spring Boot only knows /health — it has no /app\n              prefix. Without rewrite-target the path prefix reaches the backend.",
      "fix": "If routing\n              /app/* to a service whose endpoints start at /, always add the rewrite-target annotation to strip the\n              prefix before forwarding."
    },
    {
      "mistake": "Not specifying ingressClassName in ingress.yaml",
      "description": "In newer Kubernetes versions (1.18+), you must specify which IngressClass to use. Without it, no\n              controller picks up the Ingress resource and routing never works — no error, just silence.",
      "fix": "Always add spec.ingressClassName: nginx (or whatever your controller's class name is).\n              Check with kubectl get ingressclass."
    }
  ],
  "project": {
    "tag": "📁 Day 16 Project",
    "title": "devops-app Exposed via Ingress — Path + Host Routing Working",
    "timeEstimate": "⏱ ~70 min",
    "goal": "Replace NodePort service with ClusterIP. Expose devops-app via nginx\n            Ingress controller on devops.local. Both path-based (/ and /app/) and host-based routing working. Verify in\n            Ingress controller logs that requests are being routed correctly.",
    "checklist": [
      "minikube addons enable ingress — controller pod Running in ingress-nginx namespace",
      "192.168.49.2 devops.local added to /etc/hosts",
      "minikube tunnel running in a separate terminal",
      "k8s/dev/service.yaml updated: type ClusterIP (not NodePort)",
      "k8s/dev/ingress.yaml created with host devops.local and path rules",
      "kubectl get ingress -n dev shows ADDRESS populated",
      "curl http://devops.local/ → app response ✓",
      "curl http://devops.local/health → {\"status\":\"healthy\"} ✓",
      "curl http://devops.local/app/ → app response (rewrite working) ✓",
      "kubectl describe ingress shows both pod IPs in Backends",
      "Bonus: add TLS with self-signed cert, verify https://devops.local works",
      "Commit ingress.yaml and updated service.yaml to GitHub"
    ],
    "expectedOutput": "Expected: kubectl get ingress -n dev\n            NAME CLASS HOSTS ADDRESS PORTS AGE\n            devops-app-ingress nginx devops.local 192.168.49.2 80 5m"
  },
  "interview": [
    {
      "question": "\"Why is NodePort not used in production and what replaces it?\"",
      "answer": "\"NodePort exposes a service on a\n          random port between 30000 and 32767 on every node's IP. In production this has three problems. First, you\n          cannot give users a URL like myapp.company.com:31245 — it's unusable and unmemorable. Second, NodePort\n          provides no SSL termination — you would need to handle TLS in each application. Third, every new service needs\n          a new random port, and managing dozens of ports quickly becomes unmanageable. In production we use an Ingress\n          controller — typically nginx Ingress or a cloud provider's Ingress like AWS ALB Ingress Controller. All\n          services are ClusterIP. The Ingress controller is the single entry point on standard ports 80 and 443. It\n          reads Ingress resources — YAML files defining routing rules — and routes traffic to the correct ClusterIP\n          service based on hostname or path. TLS is terminated at the Ingress layer using a certificate stored in a\n          Kubernetes Secret. Every application team writes their own Ingress resource without touching the central load\n          balancer configuration.\""
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "What is the difference between an Ingress Controller and an Ingress\n          Resource?",
      "options": [
        {
          "text": "A) They are the same thing with different names",
          "isCorrect": false
        },
        {
          "text": "B) The controller is a running pod that implements routing logic. The\n            resource is a YAML file defining the routing rules. The controller reads and acts on resources.",
          "isCorrect": true
        },
        {
          "text": "C) The controller handles HTTPS; the resource handles HTTP",
          "isCorrect": false
        },
        {
          "text": "D) Resources are cluster-scoped; controllers are namespace-scoped",
          "isCorrect": false
        }
      ],
      "explanation": "This is a common source of confusion. The Ingress Resource (kind: Ingress in YAML) defines WHAT\n          to route and WHERE. It does nothing by itself. The Ingress Controller is a pod running nginx/traefik/etc that\n          watches for Ingress resources and configures itself to implement those rules. Without a controller, Ingress\n          resources are ignored. In minikube, minikube addons enable ingress installs the nginx controller."
    },
    {
      "num": 2,
      "question": "Why do you need the nginx.ingress.kubernetes.io/rewrite-target\n          annotation when routing /app/* to your Spring Boot service?",
      "options": [
        {
          "text": "A) Spring Boot requires this annotation to start",
          "isCorrect": false
        },
        {
          "text": "B) Without it, /app/health is forwarded as /app/health to Spring Boot\n            which only has /health — causing a 404",
          "isCorrect": true
        },
        {
          "text": "C) The annotation enables HTTPS for that path only",
          "isCorrect": false
        },
        {
          "text": "D) It sets the request timeout for that path",
          "isCorrect": false
        }
      ],
      "explanation": "When nginx routes /app/health to the backend, it forwards the full path by default. Your Spring\n          Boot app only knows about /health — it has no route registered for /app/health. rewrite-target: /$2 strips the\n          /app prefix and rewrites the path to /health before forwarding. The backend receives /health and responds\n          correctly."
    },
    {
      "num": 3,
      "question": "Where is a TLS certificate stored in Kubernetes for use by an\n          Ingress?",
      "options": [
        {
          "text": "A) In a ConfigMap",
          "isCorrect": false
        },
        {
          "text": "B) In a Secret of type kubernetes.io/tls containing tls.crt and\n            tls.key",
          "isCorrect": true
        },
        {
          "text": "C) In the Ingress YAML directly as base64",
          "isCorrect": false
        },
        {
          "text": "D) In the nginx Ingress controller configuration",
          "isCorrect": false
        }
      ],
      "explanation": "TLS certificates are stored as Kubernetes Secrets of type kubernetes.io/tls. The Secret has two\n          keys: tls.crt (the certificate) and tls.key (the private key). Create it with kubectl create secret tls NAME\n          --cert=file.crt --key=file.key. The Ingress resource references this Secret by name in the spec.tls.secretName\n          field. The Ingress controller loads the certificate from the Secret automatically."
    },
    {
      "num": 4,
      "question": "Your Ingress resource is applied but kubectl get ingress shows no\n          ADDRESS. What is the likely cause?",
      "options": [
        {
          "text": "A) The namespace is wrong",
          "isCorrect": false
        },
        {
          "text": "B) Either the Ingress controller is not running or minikube tunnel is\n            not running in a separate terminal",
          "isCorrect": true
        },
        {
          "text": "C) The service type must be LoadBalancer not ClusterIP",
          "isCorrect": false
        },
        {
          "text": "D) ingressClassName is missing from the resource",
          "isCorrect": false
        }
      ],
      "explanation": "ADDRESS is assigned by the Ingress controller when it processes the Ingress resource. If the\n          controller pod is not running (check kubectl get pods -n ingress-nginx), no ADDRESS is assigned. In minikube\n          specifically, the ADDRESS also requires minikube tunnel to be running in a separate terminal — without it the\n          IP assignment doesn't propagate. Run minikube tunnel and wait 30 seconds."
    },
    {
      "num": 5,
      "question": "What service type should all services behind an Ingress controller\n          use?",
      "options": [
        {
          "text": "A) NodePort — Ingress requires NodePort to route traffic",
          "isCorrect": false
        },
        {
          "text": "B) LoadBalancer — one load balancer per service",
          "isCorrect": false
        },
        {
          "text": "C) ClusterIP — internal only, Ingress controller forwards to it from\n            inside the cluster",
          "isCorrect": true
        },
        {
          "text": "D) ExternalName — maps to external DNS",
          "isCorrect": false
        }
      ],
      "explanation": "ClusterIP services are only reachable from inside the cluster. The Ingress controller runs\n          inside the cluster, so it can reach ClusterIP services directly. Using NodePort or LoadBalancer alongside\n          Ingress creates redundant external access paths — traffic can bypass Ingress by hitting the NodePort directly.\n          ClusterIP + Ingress = one entry point, centralised control of routing, TLS, and rate limiting."
    }
  ],
  "github": {
    "filename": "devops-90days/day-16/README.md",
    "commitMessage": "docs: Add Day 16 — K8s Ingress\n            controller, path routing, host routing",
    "template": "# Day 16 — Kubernetes Ingress\n**Date:** YYYY-MM-DD | **Difficulty:** Hard | **Status:** ✅ Complete\n\n## Key Commands\n```bash\nminikube addons enable ingress\nminikube tunnel                          # run in separate terminal\nminikube ip                              # get cluster IP for /etc/hosts\nkubectl get pods -n ingress-nginx        # verify controller running\nkubectl get ingressclass                 # verify nginx IngressClass exists\nkubectl apply -f k8s/dev/ingress.yaml\nkubectl get ingress -n dev               # check ADDRESS is populated\nkubectl describe ingress NAME -n dev     # see rules + backend pod IPs\nkubectl logs -n ingress-nginx $(kubectl get pods -n ingress-nginx -o name)\n```\n\n## Architecture After Day 16\n```\nExternal traffic (port 80/443)\n  ↓\nnginx Ingress Controller (pod in ingress-nginx namespace)\n  ↓ reads Ingress resource rules\n  ├─ devops.local/         → devops-app-service (ClusterIP) → pods\n  └─ devops.local/app/*    → devops-app-service (rewrite: strip /app prefix)\n```\n\n## Rules\n- Services behind Ingress = ClusterIP (not NodePort)\n- Always specify spec.ingressClassName\n- rewrite-target annotation needed when backend paths differ from Ingress paths\n- TLS cert stored as kubernetes.io/tls Secret, referenced in spec.tls.secretName\n- minikube tunnel must run for ADDRESS to populate in minikube\n\n## Tomorrow — Day 17\nHelm: K8s package manager — create chart for devops-app, values.yaml, helm install/upgrade/rollback"
  },
  "pdfUrl": "/pdfs/day16.pdf",
  "images": []
};
