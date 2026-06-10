import { BootcampDay } from '../types';

export const day15: BootcampDay = {
  "day": 15,
  "title": "Kubernetes — Namespaces, ConfigMaps, Secrets",
  "subtitle": "Namespace Isolation · ConfigMap for App Config · Secret for Credentials · Updated Deployment\n            YAML",
  "color": "#f89820",
  "trainerNote": "Kubernetes configurations must separate code from settings. Use ConfigMaps for environment variables and Secrets for API keys.",
  "engineerNote": "Mount ConfigMaps and Secrets as volumes or inject them as env variables. Never commit secret values to your Git repository.",
  "goal": {
    "icon": "🎯",
    "title": "🎯 Day 15 Goal",
    "description": "By end of Day 15: you have created three namespaces (dev, staging, prod), deployed your devops-app to the dev\n          namespace using a ConfigMap for app config and a Secret for sensitive values. Your deployment.yaml reads from\n          both. Expected output: kubectl get pods -n dev shows your app running, kubectl describe pod shows environment\n          variables injected from ConfigMap and Secret — no hardcoded values in YAML."
  },
  "schedule": [
    {
      "time": "09:00–09:20",
      "phase": "RECALL",
      "activity": "Day 14 cold check",
      "why": "From memory: kubectl apply, get pods, describe, logs,\n                exec, delete. If you cannot recall these six commands, review Day 14 before continuing."
    },
    {
      "time": "09:20–10:15",
      "phase": "THEORY",
      "activity": "Namespaces, ConfigMaps, Secrets — why they exist",
      "why": "The production\n                problem: how do you run the same app in dev, staging, prod with different config without separate YAML\n                files for everything? Namespaces + ConfigMaps + Secrets is the answer."
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
      "activity": "Create namespaces + deploy app to dev namespace",
      "why": "kubectl create\n                namespace for dev/staging/prod. Move your Day 14 deployment to dev namespace. Verify isolation."
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
      "activity": "ConfigMap — inject non-sensitive config into pods",
      "why": "Create ConfigMap with\n                app settings. Mount as environment variables in deployment. Verify pod reads them correctly."
    },
    {
      "time": "14:30–15:30",
      "phase": "HANDS-ON",
      "activity": "Secret — inject sensitive data safely",
      "why": "Create Secret with base64-encoded\n                values. Inject into pod. Understand how Secrets differ from ConfigMaps and why they still need\n                additional protection."
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
      "activity": "Mini Project: environment-aware deployment using namespace + ConfigMap +\n                Secret",
      "why": ""
    },
    {
      "time": "16:45–17:00",
      "phase": "COMMIT",
      "activity": "Day 15 notes + quiz + commit updated YAMLs",
      "why": ""
    }
  ],
  "concepts": [
    {
      "icon": "🗂",
      "title": "Namespaces",
      "description": "A Namespace is a virtual cluster within your K8s cluster. Resources (Pods, Services, ConfigMaps) in one\n            namespace are isolated from another by default. One cluster can host dev, staging, prod workloads\n            simultaneously — each in its own namespace with its own config and access controls.",
      "analogy": "\"Namespaces provide logical isolation. The same cluster runs dev and prod, but dev\n            cannot accidentally talk to prod services because they are in different namespaces with network policies\n            applied.\""
    },
    {
      "icon": "⚙️",
      "title": "ConfigMap",
      "description": "A ConfigMap stores non-sensitive configuration as key-value pairs. Your pod reads from it at runtime —\n            either as environment variables or mounted as files. Change the ConfigMap → restart the pod → new config\n            applied. No image rebuild needed.",
      "analogy": "Without ConfigMap: APP_ENV=production is hardcoded in your deployment.yaml. To change it for\n            dev, you edit the YAML. With ConfigMap: the YAML stays the same across environments, only the ConfigMap\n            changes. This is the correct pattern."
    },
    {
      "icon": "🔐",
      "title": "Secret",
      "description": "A Secret stores sensitive data (passwords, tokens, keys). Values are base64-encoded (not encrypted by\n            default — encryption at rest needs additional configuration). Kubernetes restricts which pods can mount\n            which secrets via RBAC. Never put passwords in ConfigMaps or in YAML files.",
      "analogy": "Secrets vs ConfigMaps: same mechanics, different intent. K8s can apply additional controls to\n            Secrets (audit logging, encryption, RBAC restrictions). Use ConfigMap for config, Secret for credentials.\n            Never the other way around."
    },
    {
      "icon": "🌍",
      "title": "Environment Variables from ConfigMap/Secret",
      "description": "Two ways to inject: envFrom — inject all key-value pairs from a ConfigMap/Secret as env\n            vars. env.valueFrom — inject specific keys selectively. envFrom is simpler. valueFrom gives\n            finer control — useful when a ConfigMap has 20 keys but your pod only needs 3.",
      "analogy": "In Spring Boot: the injected environment variables override application.properties values.\n            SPRING_DATASOURCE_URL env var overrides spring.datasource.url in the properties file. Spring Boot convention\n            automatically maps these."
    },
    {
      "icon": "🔄",
      "title": "ConfigMap as Volume Mount",
      "description": "Instead of env vars, a ConfigMap can be mounted as a file inside the container. Key = filename, value =\n            file content. This is used for config files (nginx.conf, application.properties, log4j.xml). The pod reads\n            the file at the path you specify.",
      "analogy": "For your Spring Boot app: mount application.properties from a ConfigMap. Change ConfigMap →\n            restart pod → new properties file. No image rebuild — this is how configuration changes are managed in\n            production without redeployments."
    },
    {
      "icon": "📋",
      "title": "Resource Quotas + LimitRange",
      "description": "Namespaces can have ResourceQuota (maximum total CPU/memory the namespace can use) and LimitRange (default\n            and maximum per-pod limits). This prevents one team's dev workload from starving another team's prod\n            workload in a shared cluster.",
      "analogy": "In your learning setup you won't hit quotas. In an enterprise shared cluster, quotas are\n            mandatory. Understanding them is an interview differentiator — shows you think about multi-tenancy."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 2,
      "sessionTitle": "Namespace Commands — Create, Use, Isolate",
      "sections": [
        {
          "label": "Create namespaces for each environment",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl create\n              namespace dev"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl create\n              namespace staging"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl create\n              namespace prod"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get\n              namespaces"
            },
            {
              "type": "ok",
              "text": "NAME STATUS AGE"
            },
            {
              "type": "ok",
              "text": "default Active 2d"
            },
            {
              "type": "ok",
              "text": "dev Active 5s"
            },
            {
              "type": "ok",
              "text": "staging Active 4s"
            },
            {
              "type": "ok",
              "text": "prod Active 3s"
            },
            {
              "type": "ok",
              "text": "kube-system Active 2d"
            },
            {
              "type": "output",
              "text": "# kube-system = K8s internals. Never deploy your apps there."
            }
          ]
        },
        {
          "label": "Set default namespace to dev (so you don't type -n dev every command)",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl config\n              set-context --current --namespace=dev"
            },
            {
              "type": "ok",
              "text": "Context \"minikube\" modified."
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl config view\n              --minify | grep namespace"
            },
            {
              "type": "ok",
              "text": "namespace: dev"
            },
            {
              "type": "output",
              "text": "# Now kubectl get pods means kubectl get pods -n dev"
            },
            {
              "type": "output",
              "text": "# Always verify your current namespace before applying YAMLs"
            }
          ]
        },
        {
          "label": "Verify namespace isolation — resources in dev are not visible in staging",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get pods -n\n              dev # shows dev pods"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get pods -n\n              staging # empty — staging has nothing yet"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get pods\n              --all-namespaces # see ALL pods across ALL namespaces"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get all -n\n              dev # pods, deployments, services, replicasets in dev"
            }
          ]
        }
      ]
    },
    {
      "sessionNumber": 2,
      "totalSessions": 2,
      "sessionTitle": "Apply ConfigMap + Secret + Deployment + Verify",
      "sections": [
        {
          "label": "Apply in correct order — ConfigMap and Secret before Deployment",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl apply -f\n              k8s/dev/configmap.yaml"
            },
            {
              "type": "ok",
              "text": "configmap/devops-app-config created"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl apply -f\n              k8s/dev/secret.yaml"
            },
            {
              "type": "ok",
              "text": "secret/devops-app-secret created"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl apply -f\n              k8s/dev/deployment.yaml"
            },
            {
              "type": "ok",
              "text": "deployment.apps/devops-app created"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl get pods -n\n              dev"
            },
            {
              "type": "ok",
              "text": "NAME READY STATUS RESTARTS AGE"
            },
            {
              "type": "ok",
              "text": "devops-app-7d9f8c6b5-x2jkp 1/1 Running 0 30s"
            },
            {
              "type": "ok",
              "text": "devops-app-7d9f8c6b5-m8nqr 1/1 Running 0 30s"
            }
          ]
        },
        {
          "label": "Verify environment variables were injected from ConfigMap and Secret",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl exec -it\n              devops-app-7d9f8c6b5-x2jkp -n dev -- env | grep -E \"APP_ENV|LOG_LEVEL|DB_PASSWORD\""
            },
            {
              "type": "ok",
              "text": "APP_ENV=development"
            },
            {
              "type": "ok",
              "text": "LOG_LEVEL=DEBUG"
            },
            {
              "type": "ok",
              "text": "DB_PASSWORD=mysecretpassword"
            },
            {
              "type": "output",
              "text": "# ConfigMap values injected as plain env vars"
            },
            {
              "type": "output",
              "text": "# Secret value decodes automatically — pod sees plaintext"
            }
          ]
        },
        {
          "label": "Verify ConfigMap mounted as file",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl exec -it\n              devops-app-7d9f8c6b5-x2jkp -n dev -- ls /app/config/"
            },
            {
              "type": "ok",
              "text": "application.properties"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl exec -it\n              devops-app-7d9f8c6b5-x2jkp -n dev -- cat /app/config/application.properties"
            },
            {
              "type": "ok",
              "text": "server.port=8080"
            },
            {
              "type": "ok",
              "text": "spring.application.name=devops-app"
            },
            {
              "type": "ok",
              "text": "logging.level.root=DEBUG"
            },
            {
              "type": "ok",
              "text": "management.endpoints.web.exposure.include=health,info,prometheus"
            }
          ]
        },
        {
          "label": "Update ConfigMap — change LOG_LEVEL to INFO — see rolling update",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl edit\n              configmap devops-app-config -n dev"
            },
            {
              "type": "output",
              "text": "# Change LOG_LEVEL: \"DEBUG\" to LOG_LEVEL: \"INFO\" → save → :wq"
            },
            {
              "type": "ok",
              "text": "configmap/devops-app-config edited"
            },
            {
              "type": "output",
              "text": "# ConfigMap change does NOT auto-restart pods. Must restart deployment:"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl rollout\n              restart deployment/devops-app -n dev"
            },
            {
              "type": "ok",
              "text": "deployment.apps/devops-app restarted"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "kubectl rollout\n              status deployment/devops-app -n dev"
            },
            {
              "type": "ok",
              "text": "deployment \"devops-app\" successfully rolled out"
            }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "⚡ Pod fails to start after adding ConfigMap reference",
      "steps": [
        {
          "num": 1,
          "title": "ConfigMap or Secret doesn't exist in the correct namespace",
          "description": "Pods in dev\n              namespace can only reference ConfigMaps/Secrets in the dev namespace.",
          "cmd": "kubectl get\n              configmap -n dev → verify devops-app-config exists there"
        },
        {
          "num": 2,
          "title": "Check pod events for the exact error",
          "description": "kubectl describe pod\n              POD_NAME -n dev → look at Events section at the bottom",
          "cmd": "kubectl describe pod\n              POD_NAME -n dev → look at Events section at the bottom"
        },
        {
          "num": 3,
          "title": "ConfigMapRef name in deployment doesn't match actual ConfigMap name",
          "description": "Case\n              sensitive — devops-app-config ≠ devops-app-Config.",
          "cmd": "kubectl get configmap -n dev →\n              compare exact name to deployment YAML"
        }
      ]
    },
    {
      "title": "Common Errors & Troubleshooting",
      "steps": [
        {
          "num": 1,
          "title": "\"configmap 'devops-app-config' not found\" when pod starts",
          "description": "Cause: Applied deployment before creating the ConfigMap | Fix: Always apply ConfigMap and Secret BEFORE the Deployment that references them"
        },
        {
          "num": 2,
          "title": "Pod running but env variable not showing updated value after ConfigMap edit",
          "description": "Cause: ConfigMap changes don't auto-restart pods — must trigger a rollout | Fix: kubectl rollout restart deployment/devops-app -n dev"
        },
        {
          "num": 3,
          "title": "Secret value looks wrong inside the pod",
          "description": "Cause: Base64 encoding was incorrect when creating the Secret | Fix: echo -n 'yourvalue' | base64 → use -n flag (no newline) or encoding includes newline\n          character"
        }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Putting passwords in ConfigMaps instead of Secrets",
      "description": "ConfigMaps have no access controls, no audit logging, and are shown in plain text by kubectl get\n              configmap -o yaml. Anyone with kubectl read access sees them.",
      "fix": "Rule — if it is\n              sensitive (password, token, key, certificate), it goes in a Secret. If it is configuration (log level,\n              port, env name), it goes in ConfigMap."
    },
    {
      "mistake": "Committing secret.yaml with real values to Git",
      "description": "Your secret.yaml has base64-encoded values that decode trivially. Committing to Git = credentials in\n              version history forever.",
      "fix": "Add secret.yaml to .gitignore. Commit\n              secret.yaml.example with placeholder values. In production use Sealed Secrets or HashiCorp Vault to manage\n              secrets safely in Git."
    },
    {
      "mistake": "Forgetting to restart deployment after ConfigMap change",
      "description": "ConfigMap changes are not detected by running pods. The old value stays until pods restart. This catches\n              people off-guard — they edited the ConfigMap, app still uses old value, confusion follows.",
      "fix": "kubectl rollout restart deployment/NAME -n NAMESPACE after every ConfigMap change. Or\n              use a tool like Reloader (watches ConfigMaps and auto-restarts deployments)."
    }
  ],
  "project": {
    "tag": "📁 Day 15 Project",
    "title": "Environment-Aware Deployment: dev namespace with ConfigMap + Secret",
    "timeEstimate": "⏱ ~70 min",
    "goal": "Deploy devops-app to dev namespace. ConfigMap injects LOG_LEVEL,\n            APP_ENV, and mounts application.properties as a file. Secret injects DB_PASSWORD. Verify all values inside\n            the pod. Then update ConfigMap LOG_LEVEL from DEBUG to INFO and confirm rollout picks it up.",
    "checklist": [
      "Three namespaces created: dev, staging, prod",
      "Current context set to dev namespace",
      "k8s/dev/configmap.yaml created and applied",
      "k8s/dev/secret.yaml created (gitignored), applied",
      "k8s/dev/deployment.yaml updated with envFrom + env.valueFrom + volumeMount",
      "kubectl get pods -n dev shows 2/2 Running",
      "kubectl exec → env shows APP_ENV=development, LOG_LEVEL=DEBUG, DB_PASSWORD injected",
      "kubectl exec → cat /app/config/application.properties shows mounted file",
      "Edit ConfigMap LOG_LEVEL to INFO → rollout restart → verify new value in pod",
      "k8s/dev/configmap.yaml and deployment.yaml committed to GitHub",
      "k8s/dev/secret.yaml.example committed with placeholder values"
    ]
  },
  "interview": [
    {
      "question": "\"What is the difference between a Kubernetes ConfigMap and a\n          Secret?\"",
      "answer": "\"Both ConfigMap and Secret store\n          key-value data that pods consume as environment variables or mounted files. The difference is intent and\n          access control. ConfigMaps store non-sensitive configuration — log levels, port numbers, feature flags — and\n          are stored in plain text in etcd. Secrets store sensitive data — passwords, API tokens, TLS certificates — and\n          are stored base64-encoded in etcd. Base64 is not encryption, it is encoding. For real security you need etcd\n          encryption at rest enabled and RBAC policies restricting which service accounts can read which secrets. In\n          production I would also use Sealed Secrets or HashiCorp Vault so that secret values are never committed to Git\n          in any form. The practical rule I follow: if you would be embarrassed if a colleague saw the value in a\n          kubectl get configmap output, it belongs in a Secret.\""
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "You update a ConfigMap value. The pod is still using the old value.\n          Why?",
      "options": [
        {
          "text": "A) ConfigMap changes require deleting and recreating the namespace",
          "isCorrect": false
        },
        {
          "text": "B) Running pods do not detect ConfigMap changes automatically — you\n            must restart the deployment",
          "isCorrect": true
        },
        {
          "text": "C) Only Secrets update automatically",
          "isCorrect": false
        },
        {
          "text": "D) You need to re-apply the deployment YAML",
          "isCorrect": false
        }
      ],
      "explanation": "Pods read ConfigMap values at startup — they are injected as environment variables when the\n          container starts. A ConfigMap change does not trigger pod restarts. You must trigger a rolling restart:\n          kubectl rollout restart deployment/NAME -n NAMESPACE. The new pods start with the updated ConfigMap values.\n          Old pods are terminated after new ones are ready."
    },
    {
      "num": 2,
      "question": "What command shows you the current namespace your kubectl context is\n          using?",
      "options": [
        {
          "text": "A) kubectl get namespace current",
          "isCorrect": false
        },
        {
          "text": "B) kubectl config view --minify | grep namespace",
          "isCorrect": true
        },
        {
          "text": "C) kubectl namespace --current",
          "isCorrect": false
        },
        {
          "text": "D) kubectl get context",
          "isCorrect": false
        }
      ],
      "explanation": "kubectl config view --minify shows only the current context settings including the active\n          namespace. Always verify your namespace before applying YAMLs — applying to the wrong namespace (e.g., prod\n          instead of dev) is a common and potentially damaging mistake. Alternatively: kubectl config get-contexts shows\n          all contexts with the current one marked."
    },
    {
      "num": 3,
      "question": "Why is base64 encoding in a Secret not the same as encryption?",
      "options": [
        {
          "text": "A) Base64 uses a different algorithm than encryption",
          "isCorrect": false
        },
        {
          "text": "B) Base64 is reversible by anyone — echo 'encoded' | base64 -d\n            reveals the original value. Encryption requires a key.",
          "isCorrect": true
        },
        {
          "text": "C) Base64 only works for ASCII characters",
          "isCorrect": false
        },
        {
          "text": "D) Kubernetes Secrets are actually encrypted by default",
          "isCorrect": false
        }
      ],
      "explanation": "base64 is an encoding scheme, not encryption. Any person or program can decode it instantly\n          without a key. kubectl get secret NAME -o yaml shows the base64 value, and base64 -d decodes it. Kubernetes\n          Secrets are only \"more secure\" than ConfigMaps in that K8s can apply RBAC to restrict who can read them. For\n          actual encryption, you need etcd encryption at rest or an external secrets manager like Vault."
    },
    {
      "num": 4,
      "question": "What is the correct order to apply these Kubernetes resources?",
      "options": [
        {
          "text": "A) Deployment → ConfigMap → Secret",
          "isCorrect": false
        },
        {
          "text": "B) ConfigMap → Secret → Deployment",
          "isCorrect": true
        },
        {
          "text": "C) Secret → Deployment → ConfigMap",
          "isCorrect": false
        },
        {
          "text": "D) Order doesn't matter in Kubernetes",
          "isCorrect": false
        }
      ],
      "explanation": "The Deployment references the ConfigMap and Secret by name. If you apply the Deployment first,\n          the pod will fail to start because the referenced ConfigMap or Secret doesn't exist yet. Apply dependencies\n          first: ConfigMap and Secret → then Deployment. Kubernetes will mark the pod as failed with \"configmap not\n          found\" if you get this wrong."
    },
    {
      "num": 5,
      "question": "What does kubectl rollout status deployment/devops-app -n dev show\n          you?",
      "options": [
        {
          "text": "A) The deployment's resource limits",
          "isCorrect": false
        },
        {
          "text": "B) Real-time progress of a rolling update — whether new pods are up\n            and old ones terminated, and if the rollout completed successfully",
          "isCorrect": true
        },
        {
          "text": "C) The CPU and memory usage of the deployment",
          "isCorrect": false
        },
        {
          "text": "D) The list of ConfigMaps used by the deployment",
          "isCorrect": false
        }
      ],
      "explanation": "kubectl rollout status watches the deployment and reports progress: \"Waiting for rollout to\n          finish: 1 of 2 updated replicas are available...\" until it finishes with \"successfully rolled out\". It blocks\n          your terminal until complete — useful in scripts and pipelines to wait for a deployment to finish before\n          proceeding. Exit code 0 = success, non-zero = failed rollout."
    }
  ],
  "github": {
    "filename": "devops-90days/day-15/README.md",
    "commitMessage": "docs: Add Day 15 — K8s namespaces,\n            ConfigMaps, Secrets",
    "template": "# Day 15 — Kubernetes Namespaces, ConfigMaps, Secrets\n**Date:** YYYY-MM-DD | **Difficulty:** Medium | **Status:** ✅ Complete\n\n## Key Commands\n```bash\nkubectl create namespace dev\nkubectl config set-context --current --namespace=dev\nkubectl config view --minify | grep namespace\nkubectl apply -f k8s/dev/configmap.yaml\nkubectl apply -f k8s/dev/secret.yaml\nkubectl apply -f k8s/dev/deployment.yaml\nkubectl exec -it POD -n dev -- env | grep APP_ENV\nkubectl edit configmap devops-app-config -n dev\nkubectl rollout restart deployment/devops-app -n dev\nkubectl rollout status deployment/devops-app -n dev\nkubectl get all -n dev\n```\n\n## Rules\n- ConfigMap = non-sensitive config. Secret = sensitive data. Never swap them.\n- Apply ConfigMap + Secret BEFORE Deployment\n- ConfigMap changes require rollout restart — not automatic\n- Never commit secret.yaml with real values to Git\n- echo -n 'value' | base64 (the -n flag is critical — omitting adds a newline to encoding)\n\n## Tomorrow — Day 16\nKubernetes Ingress: replace NodePort with Ingress controller, path-based routing, host-based routing"
  },
  "pdfUrl": "/pdfs/day15.pdf",
  "images": []
};
