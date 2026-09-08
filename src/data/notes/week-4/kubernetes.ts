import { BootcampDay } from '../types';

export const kubernetesModule: BootcampDay = {
  day: 19,
  title: "Kubernetes — Container Orchestration Mastery",
  subtitle: "Architecture · Pods · Deployments · Services · ConfigMaps · Secrets · PV/PVC · RBAC · Helm",
  color: "#326CE5",
  trainerNote: "Kubernetes is where the industry actually runs production workloads. Docker got your app into a container — Kubernetes answers what happens when that container crashes at 2am, traffic spikes, or you need to deploy 50 microservices. Every concept here maps directly to real production incidents.",
  engineerNote: "I have seen teams spend weeks firefighting because they did not understand liveness vs readiness probes, or why pods were evicted, or how a missing resource request caused a node to OOM. Learn the concepts, then build muscle memory on kubectl. The interviewer will ask you to debug a broken deployment on the spot.",
  goal: {
    icon: "☸️",
    title: "Kubernetes Module Goal",
    description: "By the end of this module: you can deploy a Spring Boot application to Kubernetes with a Deployment + Service, manage configuration with ConfigMaps and Secrets, persist data with PersistentVolumeClaims, roll out and roll back deployments, debug crashing pods without needing SSH access, and wire the entire workflow into your Jenkins CI/CD pipeline. Expected output: kubectl get pods shows your app Running with 3 replicas, kubectl get svc shows a NodePort exposing the app, curl to EC2_IP:NodePort returns HTTP 200."
  },
  schedule: [
    { time: "09:00-09:20", phase: "RECALL", activity: "Cold-start: draw the Docker to K8s mental model", why: "Docker runs ONE container on ONE host. K8s runs MANY containers across MANY hosts, auto-healing, auto-scaling. If you cannot articulate why K8s exists, you are not ready for the interview question why not just use Docker Compose in production?" },
    { time: "09:20-10:30", phase: "THEORY", activity: "K8s Architecture — Control Plane + Worker Nodes", why: "You must know what runs on the Control Plane (API Server, etcd, Scheduler, Controller Manager) vs Worker Nodes (kubelet, kube-proxy, container runtime). Interviewers ask this in the first 5 minutes." },
    { time: "10:30-10:45", phase: "BREAK", activity: "Break", why: "" },
    { time: "10:45-12:30", phase: "HANDS-ON", activity: "kubectl basics — Pods, Deployments, Services, YAML manifests", why: "Write every manifest by hand. Do not copy-paste. kubectl create, apply, get, describe, logs, exec. Scale, roll out, roll back. These commands appear in technical interviews as live coding exercises." },
    { time: "12:30-13:15", phase: "BREAK", activity: "Lunch", why: "" },
    { time: "13:15-15:00", phase: "HANDS-ON", activity: "ConfigMaps, Secrets, Volumes, PV/PVC, RBAC", why: "Every production app externalises config. ConfigMap for non-sensitive config, Secret for passwords and tokens. PV/PVC for databases. RBAC is mandatory in every real cluster." },
    { time: "15:00-15:15", phase: "BREAK", activity: "Break", why: "" },
    { time: "15:15-16:30", phase: "HANDS-ON", activity: "Helm, Ingress, HPA and Jenkins pipeline integration", why: "Helm packages your app for repeatable deployments. HPA auto-scales pods on CPU/memory. Wire it all into Jenkins: mvn, Docker build, Trivy, kubectl apply." },
    { time: "16:30-17:00", phase: "DOCUMENT", activity: "GitHub notes + Quiz + commit manifests", why: "Push your YAML manifests. Write your own explanation of the difference between a Deployment and a StatefulSet. Score below 70% on quiz? Re-read before sleep." }
  ],
  concepts: [
    {
      icon: "☸️",
      title: "Why Kubernetes Exists",
      description: "Docker runs containers on a single host. In production you have 50+ microservices, each needing auto-restart on crash, auto-scaling on traffic spikes, rolling updates with zero downtime, and cross-host networking. Docker Compose cannot do this. Kubernetes is an open-source container orchestration platform originally built by Google (based on Borg), donated to CNCF in 2014. It treats your cluster of machines as one compute pool and handles scheduling, healing, scaling, and networking automatically.",
      analogy: "Docker is a single chef cooking one dish at a time. Kubernetes is a restaurant management system that schedules 50 chefs across 10 kitchens, replaces a sick chef automatically, adds more chefs during dinner rush, and coordinates the entire menu being served simultaneously."
    },
    {
      icon: "🏗️",
      title: "K8s Architecture — Control Plane vs Worker Nodes",
      description: "CONTROL PLANE: kube-apiserver (single REST entry point for all cluster operations), etcd (distributed key-value store, all cluster state), kube-scheduler (decides which node a new pod runs on), kube-controller-manager (runs control loops: ReplicaSet, Node, Job controllers). WORKER NODES: kubelet (agent on every node, manages pod lifecycle), kube-proxy (manages iptables/IPVS rules for Service networking), Container Runtime (containerd — K8s 1.24+ dropped Docker as runtime, uses containerd directly via CRI).",
      analogy: "Control Plane = restaurant manager office: the brain that makes all decisions. Worker Nodes = the kitchen stations: where the actual work (containers) runs. The manager never cooks. The kitchen never decides what to cook."
    },
    {
      icon: "📦",
      title: "Pod — The Smallest Deployable Unit",
      description: "A Pod wraps one or more containers that share: network namespace (same IP, port space), storage volumes, and lifecycle. Containers in a pod communicate via localhost. Pods are ephemeral — they die and are replaced, never restarted in-place. Never run a naked Pod in production. Always use a Deployment which manages Pods via a ReplicaSet. Pod phases: Pending, Running, Succeeded, Failed, Unknown.",
      analogy: "A Pod is like a shipping container on a ship. It holds your app. Multiple items can share one shipping container (sidecar pattern). But the container itself is disposable — if it falls off the ship, the logistics system immediately puts a new one on."
    },
    {
      icon: "🔄",
      title: "Deployment — Self-Healing and Rolling Updates",
      description: "A Deployment manages a ReplicaSet which manages Pods. You declare desired state (3 replicas of image:v2) and the Deployment controller continuously reconciles actual state toward it. Key capabilities: Rolling updates (replace pods one-by-one, zero downtime), Rollback (revert to previous ReplicaSet instantly), Scale up/down, Self-heal (crashed pods replaced automatically). The Deployment owns multiple ReplicaSets — one per version — enabling instant rollback by switching traffic back to the previous ReplicaSet.",
      analogy: "A Deployment is like a franchise manager. You say: I want 3 outlets running version 2 of the menu. The manager opens new outlets with the new menu one at a time, closes old ones, and if customers complain, instantly reverts all outlets to the previous menu. If an outlet burns down, the manager immediately opens a replacement."
    },
    {
      icon: "🌐",
      title: "Services — Stable Network Endpoint",
      description: "Pods have dynamic IPs that change every restart. A Service provides a stable IP and DNS name that routes to healthy pods via label selectors. Service types: ClusterIP (default, internal only), NodePort (exposes on every node IP at 30000-32767), LoadBalancer (provisions cloud load balancer), ExternalName (maps to external DNS), Headless (clusterIP: None, for StatefulSets).",
      analogy: "Pods are like restaurant staff with personal mobile numbers that change when they get a new phone. A Service is the restaurant main number — it never changes, the call gets routed to whoever is on shift. If a staff member is sick (pod crashed), calls go to someone else."
    },
    {
      icon: "⚙️",
      title: "ConfigMap and Secret — Externalised Configuration",
      description: "ConfigMap: stores non-sensitive configuration as key-value pairs (DB_HOST, feature flags). Mounted as environment variables or files inside pods. Secret: stores sensitive data base64-encoded. IMPORTANT: base64 is encoding, NOT encryption. Real security requires RBAC on the Secret resource plus etcd encryption at rest. For production, use External Secrets Operator pulling from AWS Secrets Manager or HashiCorp Vault.",
      analogy: "ConfigMap is the restaurant menu board: public, readable, configures what gets served. Secret is the safe behind the counter: restricted access. base64 is just a different writing system, not a lock."
    },
    {
      icon: "💾",
      title: "PersistentVolume and PersistentVolumeClaim",
      description: "Container storage is ephemeral: data dies with the pod. PersistentVolume (PV): pre-provisioned storage (AWS EBS, EFS, NFS). PersistentVolumeClaim (PVC): a request for storage by a pod. K8s matches PVCs to PVs based on size, access mode, and StorageClass. StorageClass enables Dynamic Provisioning: PVs are created automatically when a PVC is created. Access modes: ReadWriteOnce (single node), ReadOnlyMany, ReadWriteMany (needs NFS/EFS).",
      analogy: "PV is a parking space. PVC is a parking ticket request. The car park manager (K8s) assigns the right space. StorageClass is valet parking: submit your ticket and a space is automatically created for you."
    },
    {
      icon: "🔒",
      title: "RBAC — Role-Based Access Control",
      description: "K8s RBAC controls who can do what in the cluster. Four objects: ServiceAccount (identity for pods), Role (namespaced permissions: verbs get/list/create/delete on resources pods/deployments/secrets), RoleBinding (binds a Role to a ServiceAccount within a namespace), ClusterRole + ClusterRoleBinding (cluster-wide). Principle of least privilege: Jenkins CI/CD ServiceAccount should only deploy to staging, never read production secrets.",
      analogy: "ServiceAccount = employee badge. Role = job description (permissions list). RoleBinding = HR assigning the job description to the badge. A junior developer badge opens the office but not the server room."
    },
    {
      icon: "🏥",
      title: "Probes — Liveness, Readiness, Startup",
      description: "Liveness Probe: is the container still alive? Failure causes kubelet to RESTART the container. Use to detect deadlocks. Readiness Probe: is the container ready to serve traffic? Failure REMOVES the pod from Service endpoints — no traffic, no restart. Use for slow-starting apps. Startup Probe: disables liveness/readiness until the app has started. Probe types: httpGet, tcpSocket, exec (run a command inside the container).",
      analogy: "Liveness = is the chef conscious? If collapsed, replace immediately. Readiness = is the chef station ready to take orders? Even if alive, they might not be ready. Startup = allow extra time for a new chef to finish orientation before checking their station."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 7,
      sessionTitle: "STEP 1 — kubectl Fundamentals",
      sections: [
        {
          label: "Cluster info and namespace operations",
          lines: [
            { type: "cmd", prompt: "$", text: "kubectl version --client" },
            { type: "cmd", prompt: "$", text: "kubectl cluster-info" },
            { type: "cmd", prompt: "$", text: "kubectl get nodes" },
            { type: "cmd", prompt: "$", text: "kubectl get nodes -o wide" },
            { type: "cmd", prompt: "$", text: "kubectl config get-contexts" },
            { type: "cmd", prompt: "$", text: "kubectl config use-context my-cluster" },
            { type: "cmd", prompt: "$", text: "kubectl get namespaces" },
            { type: "cmd", prompt: "$", text: "kubectl create namespace devops" },
            { type: "cmd", prompt: "$", text: "kubectl config set-context --current --namespace=devops" },
            { type: "cmd", prompt: "$", text: "kubectl get all -n devops" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 7,
      sessionTitle: "STEP 2 — Pods and Deployments",
      sections: [
        {
          label: "Deployment manifest — currency-conversion-deployment.yaml",
          lines: [
            { type: "output", text: "apiVersion: apps/v1" },
            { type: "output", text: "kind: Deployment" },
            { type: "output", text: "metadata:" },
            { type: "output", text: "  name: currency-conversion" },
            { type: "output", text: "  namespace: devops" },
            { type: "output", text: "spec:" },
            { type: "output", text: "  replicas: 3" },
            { type: "output", text: "  selector:" },
            { type: "output", text: "    matchLabels:" },
            { type: "output", text: "      app: currency-conversion" },
            { type: "output", text: "  strategy:" },
            { type: "output", text: "    type: RollingUpdate" },
            { type: "output", text: "    rollingUpdate:" },
            { type: "output", text: "      maxSurge: 1" },
            { type: "output", text: "      maxUnavailable: 0" },
            { type: "output", text: "  template:" },
            { type: "output", text: "    metadata:" },
            { type: "output", text: "      labels:" },
            { type: "output", text: "        app: currency-conversion" },
            { type: "output", text: "    spec:" },
            { type: "output", text: "      containers:" },
            { type: "output", text: "      - name: currency-conversion" },
            { type: "output", text: "        image: nayagk/currency-conversion:latest" },
            { type: "output", text: "        ports:" },
            { type: "output", text: "        - containerPort: 8100" },
            { type: "output", text: "        livenessProbe:" },
            { type: "output", text: "          httpGet:" },
            { type: "output", text: "            path: /actuator/health" },
            { type: "output", text: "            port: 8100" },
            { type: "output", text: "          initialDelaySeconds: 60" },
            { type: "output", text: "          periodSeconds: 15" },
            { type: "output", text: "        readinessProbe:" },
            { type: "output", text: "          httpGet:" },
            { type: "output", text: "            path: /actuator/health" },
            { type: "output", text: "            port: 8100" },
            { type: "output", text: "          initialDelaySeconds: 30" },
            { type: "output", text: "          periodSeconds: 10" },
            { type: "output", text: "        resources:" },
            { type: "output", text: "          requests:" },
            { type: "output", text: "            memory: \"256Mi\"" },
            { type: "output", text: "            cpu: \"250m\"" },
            { type: "output", text: "          limits:" },
            { type: "output", text: "            memory: \"512Mi\"" },
            { type: "output", text: "            cpu: \"500m\"" }
          ]
        },
        {
          label: "Deployment operations",
          lines: [
            { type: "cmd", prompt: "$", text: "kubectl apply -f currency-conversion-deployment.yaml" },
            { type: "cmd", prompt: "$", text: "kubectl get pods -n devops -o wide" },
            { type: "cmd", prompt: "$", text: "kubectl describe pod <pod-name> -n devops" },
            { type: "cmd", prompt: "$", text: "kubectl scale deployment currency-conversion --replicas=5 -n devops" },
            { type: "comment", text: "Rolling update — update the image tag" },
            { type: "cmd", prompt: "$", text: "kubectl set image deployment/currency-conversion currency-conversion=nayagk/currency-conversion:v2 -n devops" },
            { type: "cmd", prompt: "$", text: "kubectl rollout status deployment/currency-conversion -n devops" },
            { type: "cmd", prompt: "$", text: "kubectl rollout history deployment/currency-conversion -n devops" },
            { type: "comment", text: "Rollback to previous version" },
            { type: "cmd", prompt: "$", text: "kubectl rollout undo deployment/currency-conversion -n devops" },
            { type: "cmd", prompt: "$", text: "kubectl rollout undo deployment/currency-conversion --to-revision=2 -n devops" }
          ]
        }
      ]
    },
    {
      sessionNumber: 3,
      totalSessions: 7,
      sessionTitle: "STEP 3 — Services",
      sections: [
        {
          label: "NodePort Service manifest",
          lines: [
            { type: "output", text: "apiVersion: v1" },
            { type: "output", text: "kind: Service" },
            { type: "output", text: "metadata:" },
            { type: "output", text: "  name: currency-conversion-svc" },
            { type: "output", text: "  namespace: devops" },
            { type: "output", text: "spec:" },
            { type: "output", text: "  type: NodePort" },
            { type: "output", text: "  selector:" },
            { type: "output", text: "    app: currency-conversion" },
            { type: "output", text: "  ports:" },
            { type: "output", text: "  - protocol: TCP" },
            { type: "output", text: "    port: 80" },
            { type: "output", text: "    targetPort: 8100" },
            { type: "output", text: "    nodePort: 30100" },
            { type: "warn", text: "nodePort must be 30000-32767. EC2 Security Group must allow inbound TCP on 30100." },
            { type: "cmd", prompt: "$", text: "kubectl apply -f currency-conversion-svc.yaml" },
            { type: "cmd", prompt: "$", text: "kubectl get svc -n devops" },
            { type: "cmd", prompt: "$", text: "kubectl get endpoints currency-conversion-svc -n devops" },
            { type: "comment", text: "If endpoints is empty, label selector does not match any Ready pod" },
            { type: "cmd", prompt: "$", text: "curl http://<NODE_EXTERNAL_IP>:30100/actuator/health" },
            { type: "ok", text: "{\"status\":\"UP\"}" }
          ]
        }
      ]
    },
    {
      sessionNumber: 4,
      totalSessions: 7,
      sessionTitle: "STEP 4 — ConfigMap and Secret",
      sections: [
        {
          label: "ConfigMap and Secret manifests",
          lines: [
            { type: "output", text: "apiVersion: v1" },
            { type: "output", text: "kind: ConfigMap" },
            { type: "output", text: "metadata:" },
            { type: "output", text: "  name: app-config" },
            { type: "output", text: "  namespace: devops" },
            { type: "output", text: "data:" },
            { type: "output", text: "  SPRING_PROFILES_ACTIVE: \"prod\"" },
            { type: "output", text: "  DB_HOST: \"mysql-svc\"" },
            { type: "output", text: "  DB_PORT: \"3306\"" },
            { type: "output", text: "---" },
            { type: "comment", text: "Create base64 values: echo -n mypassword | base64" },
            { type: "output", text: "apiVersion: v1" },
            { type: "output", text: "kind: Secret" },
            { type: "output", text: "metadata:" },
            { type: "output", text: "  name: app-secret" },
            { type: "output", text: "  namespace: devops" },
            { type: "output", text: "type: Opaque" },
            { type: "output", text: "data:" },
            { type: "output", text: "  DB_PASSWORD: bXlwYXNzd29yZA==" }
          ]
        },
        {
          label: "Reference ConfigMap and Secret in Deployment container spec",
          lines: [
            { type: "output", text: "        envFrom:" },
            { type: "output", text: "        - configMapRef:" },
            { type: "output", text: "            name: app-config" },
            { type: "output", text: "        - secretRef:" },
            { type: "output", text: "            name: app-secret" },
            { type: "cmd", prompt: "$", text: "kubectl apply -f app-config.yaml" },
            { type: "cmd", prompt: "$", text: "kubectl apply -f app-secret.yaml" },
            { type: "cmd", prompt: "$", text: "kubectl get configmap app-config -n devops -o yaml" }
          ]
        }
      ]
    },
    {
      sessionNumber: 5,
      totalSessions: 7,
      sessionTitle: "STEP 5 — PersistentVolume and PVC",
      sections: [
        {
          label: "PVC with dynamic provisioning (gp2 StorageClass on AWS)",
          lines: [
            { type: "output", text: "apiVersion: v1" },
            { type: "output", text: "kind: PersistentVolumeClaim" },
            { type: "output", text: "metadata:" },
            { type: "output", text: "  name: mysql-pvc" },
            { type: "output", text: "  namespace: devops" },
            { type: "output", text: "spec:" },
            { type: "output", text: "  accessModes:" },
            { type: "output", text: "  - ReadWriteOnce" },
            { type: "output", text: "  resources:" },
            { type: "output", text: "    requests:" },
            { type: "output", text: "      storage: 10Gi" },
            { type: "output", text: "  storageClassName: gp2" },
            { type: "comment", text: "Mount in MySQL Deployment under volumes:" },
            { type: "output", text: "      volumes:" },
            { type: "output", text: "      - name: mysql-data" },
            { type: "output", text: "        persistentVolumeClaim:" },
            { type: "output", text: "          claimName: mysql-pvc" },
            { type: "cmd", prompt: "$", text: "kubectl get pvc -n devops" },
            { type: "cmd", prompt: "$", text: "kubectl get pv" }
          ]
        }
      ]
    },
    {
      sessionNumber: 6,
      totalSessions: 7,
      sessionTitle: "STEP 6 — Essential Debug Commands",
      sections: [
        {
          label: "Debug toolkit — memorise these",
          lines: [
            { type: "comment", text: "Pod not starting — check logs from crashed instance" },
            { type: "cmd", prompt: "$", text: "kubectl logs <pod-name> -n devops --previous" },
            { type: "comment", text: "Events section in describe shows most K8s errors" },
            { type: "cmd", prompt: "$", text: "kubectl describe pod <pod-name> -n devops" },
            { type: "cmd", prompt: "$", text: "kubectl logs -f <pod-name> -n devops" },
            { type: "cmd", prompt: "$", text: "kubectl exec -it <pod-name> -n devops -- /bin/sh" },
            { type: "cmd", prompt: "$", text: "kubectl get events -n devops --sort-by=.lastTimestamp" },
            { type: "cmd", prompt: "$", text: "kubectl top pods -n devops" },
            { type: "cmd", prompt: "$", text: "kubectl top nodes" },
            { type: "cmd", prompt: "$", text: "kubectl port-forward svc/currency-conversion-svc 8080:80 -n devops" },
            { type: "comment", text: "Force rolling restart without changing spec (workaround for :latest tag)" },
            { type: "cmd", prompt: "$", text: "kubectl rollout restart deployment/currency-conversion -n devops" }
          ]
        }
      ]
    },
    {
      sessionNumber: 7,
      totalSessions: 7,
      sessionTitle: "STEP 7 — HPA and Helm",
      sections: [
        {
          label: "HPA — Horizontal Pod Autoscaler",
          lines: [
            { type: "output", text: "apiVersion: autoscaling/v2" },
            { type: "output", text: "kind: HorizontalPodAutoscaler" },
            { type: "output", text: "metadata:" },
            { type: "output", text: "  name: currency-conversion-hpa" },
            { type: "output", text: "  namespace: devops" },
            { type: "output", text: "spec:" },
            { type: "output", text: "  scaleTargetRef:" },
            { type: "output", text: "    apiVersion: apps/v1" },
            { type: "output", text: "    kind: Deployment" },
            { type: "output", text: "    name: currency-conversion" },
            { type: "output", text: "  minReplicas: 2" },
            { type: "output", text: "  maxReplicas: 10" },
            { type: "output", text: "  metrics:" },
            { type: "output", text: "  - type: Resource" },
            { type: "output", text: "    resource:" },
            { type: "output", text: "      name: cpu" },
            { type: "output", text: "      target:" },
            { type: "output", text: "        type: Utilization" },
            { type: "output", text: "        averageUtilization: 70" },
            { type: "warn", text: "HPA requires metrics-server in the cluster. Install: kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml" }
          ]
        },
        {
          label: "Helm — K8s package manager",
          lines: [
            { type: "cmd", prompt: "$", text: "curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash" },
            { type: "cmd", prompt: "$", text: "helm version" },
            { type: "cmd", prompt: "$", text: "helm repo add bitnami https://charts.bitnami.com/bitnami" },
            { type: "cmd", prompt: "$", text: "helm repo update" },
            { type: "cmd", prompt: "$", text: "helm install mysql bitnami/mysql --namespace devops --set auth.rootPassword=Admin123" },
            { type: "cmd", prompt: "$", text: "helm list -n devops" },
            { type: "cmd", prompt: "$", text: "helm upgrade mysql bitnami/mysql --namespace devops --set auth.rootPassword=NewPass" },
            { type: "cmd", prompt: "$", text: "helm rollback mysql 1 -n devops" },
            { type: "cmd", prompt: "$", text: "helm uninstall mysql -n devops" }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "Pod stuck in CrashLoopBackOff",
      steps: [
        { num: 1, title: "Check previous container crash logs", cmd: "kubectl logs <pod-name> -n devops --previous" },
        { num: 2, title: "Describe pod and read Events section at the bottom", cmd: "kubectl describe pod <pod-name> -n devops" },
        { num: 3, title: "Image pull failure", description: "Events show: Failed to pull image. Fix: check image name and tag, ensure imagePullSecret is configured for private registries." },
        { num: 4, title: "Liveness probe firing before Spring Boot starts", description: "Fix: increase initialDelaySeconds on livenessProbe to 60-90s. Spring Boot takes time to start." },
        { num: 5, title: "Missing required environment variable", description: "App logs show: ERROR null value for required config. Fix: add the variable to ConfigMap or Secret and reference it in the Deployment." },
        { num: 6, title: "OOMKilled — container exceeds memory limit", description: "kubectl describe pod shows: Terminated Reason: OOMKilled. Fix: increase memory limits or fix a memory leak." }
      ]
    },
    {
      title: "Pod stuck in Pending state",
      steps: [
        { num: 1, title: "Check scheduler failure message in Events", cmd: "kubectl describe pod <pod-name> -n devops" },
        { num: 2, title: "Insufficient resources on nodes", description: "Events: 0/3 nodes available: insufficient memory. Fix: reduce resource requests, add more nodes, or remove other workloads." },
        { num: 3, title: "PVC not bound", description: "Events: persistentvolumeclaim not found. Fix: check kubectl get pvc. If Pending, the StorageClass may not exist or EBS volume limit reached." },
        { num: 4, title: "Taint and toleration mismatch", description: "Events: node(s) had taint that the pod did not tolerate. Fix: add tolerations to pod spec or remove the taint from the target node." }
      ]
    },
    {
      title: "Service not routing traffic to pods",
      steps: [
        { num: 1, title: "Check if endpoints list has pod IPs", cmd: "kubectl get endpoints currency-conversion-svc -n devops" },
        { num: 2, title: "If endpoints is empty — label selector mismatch", cmd: "kubectl get pods --show-labels -n devops" },
        { num: 3, title: "Compare pod labels to service selector", description: "kubectl describe svc shows the Selector field. A single typo in a label key breaks routing silently." },
        { num: 4, title: "Pods exist but are not Ready — readiness probe failing", cmd: "kubectl describe pod <pod-name> -n devops | grep -A 10 Readiness" },
        { num: 5, title: "Test connectivity from inside the cluster", cmd: "kubectl exec -it <any-pod> -n devops -- curl http://currency-conversion-svc.devops.svc.cluster.local/actuator/health" }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Running naked Pods instead of Deployments",
      description: "If you kubectl apply a Pod and it crashes or the node dies, the pod is GONE — nothing restarts it. Students coming from Docker Compose think pods auto-restart. They do not.",
      fix: "Always use a Deployment in production. The Deployment ReplicaSet controller replaces crashed pods automatically. Naked Pods are only for learning and debugging."
    },
    {
      mistake: "Not setting resource requests and limits",
      description: "Without requests, the scheduler cannot make informed placement decisions. Without limits, one runaway container can consume all node memory and OOM-kill other pods including kube-system components, bringing down the entire node.",
      fix: "Always set both resources.requests and resources.limits on every container. Start with requests cpu=250m memory=256Mi, limits cpu=500m memory=512Mi. Tune from actual kubectl top pods data."
    },
    {
      mistake: "Liveness probe initialDelaySeconds too short for Spring Boot",
      description: "Spring Boot takes 30-90 seconds to start. If initialDelaySeconds is too short, the liveness probe fails, kubelet restarts the container, and it gets stuck in CrashLoopBackOff.",
      fix: "Set initialDelaySeconds=60 or higher for liveness. Use a separate readiness probe with initialDelaySeconds=30 to delay traffic until ready. For very slow apps, add a startupProbe."
    },
    {
      mistake: "Treating base64-encoded Secrets as encrypted",
      description: "kubectl get secret app-secret -o yaml shows the base64 values. Anyone can decode them: echo bXlwYXNzd29yZA== | base64 -d. The default etcd storage is also not encrypted at rest.",
      fix: "Enable etcd encryption at rest. Use RBAC to restrict Secret read access. For production, use External Secrets Operator pulling from AWS Secrets Manager, HashiCorp Vault, or GCP Secret Manager."
    },
    {
      mistake: "Using kubectl create instead of kubectl apply in CI/CD",
      description: "kubectl create fails if the resource already exists. In a CI/CD pipeline, the first run succeeds, every subsequent run fails with AlreadyExists error.",
      fix: "Always use kubectl apply -f in CI/CD pipelines. kubectl apply is idempotent: creates if missing, patches if existing. Use kubectl create only for one-off imperative commands."
    },
    {
      mistake: "Hardcoding image tag as latest in Deployments",
      description: "When you push a new latest to Docker Hub and run kubectl apply, K8s sees no spec change (tag is still latest) and does NOT restart pods. The cluster keeps running the old image silently.",
      fix: "Tag images with the Git commit SHA or build number: nayagk/currency-conversion:${BUILD_NUMBER}. Every push produces a unique tag. kubectl set image or kubectl apply with a new tag triggers the rolling update."
    }
  ],
  project: {
    tag: "K8s Module Project",
    title: "Deploy Full Stack App to Kubernetes — Spring Boot + MySQL",
    timeEstimate: "120 min",
    goal: "Deploy the currency-conversion Spring Boot app to Kubernetes with 3 replicas, a MySQL StatefulSet with PVC, a NodePort Service, ConfigMap for app config, Secrets for DB password, and liveness + readiness probes. Wire kubectl apply steps into your Jenkins pipeline after Docker Push.",
    checklist: [
      "Namespace devops created: kubectl get namespaces shows devops",
      "ConfigMap app-config applied: DB_HOST, DB_PORT, SPRING_PROFILES_ACTIVE visible",
      "Secret app-secret applied: DB_PASSWORD stored base64-encoded",
      "MySQL StatefulSet running with PVC bound: kubectl get pvc shows Bound",
      "currency-conversion Deployment with 3 replicas: kubectl get pods shows 3/3 Running",
      "Liveness probe: initialDelaySeconds=60, httpGet /actuator/health",
      "Readiness probe: initialDelaySeconds=30, httpGet /actuator/health",
      "NodePort Service on port 30100: kubectl get svc shows TYPE=NodePort",
      "curl http://<NODE_IP>:30100/actuator/health returns {status: UP}",
      "Rolling update tested: kubectl set image updates image tag, rollout status complete",
      "Rollback tested: kubectl rollout undo reverts to previous version",
      "kubectl top pods shows resource usage within limits",
      "Jenkins pipeline has K8s Deploy stage with kubectl apply"
    ],
    codeBlock: {
      title: "Jenkins K8s Deploy Stage (add after Docker Push)",
      lines: [
        "stage('Deploy to Kubernetes') {",
        "    steps {",
        "        withKubeConfig([credentialsId: 'k8s-kubeconfig']) {",
        "            sh 'kubectl apply -f k8s/configmap.yaml'",
        "            sh 'kubectl apply -f k8s/secret.yaml'",
        "            sh \"kubectl set image deployment/currency-conversion currency-conversion=nayagk/currency-conversion:${env.BUILD_NUMBER} -n devops\"",
        "            sh 'kubectl rollout status deployment/currency-conversion -n devops'",
        "        }",
        "    }",
        "}"
      ]
    },
    expectedOutput: "kubectl get pods -n devops: 3/3 Running | curl NODE_IP:30100/actuator/health: {status: UP}"
  },
  interview: [
    {
      question: "What is the difference between a Pod, ReplicaSet, and Deployment?",
      answer: "A Pod is the smallest deployable unit — wraps one or more containers sharing a network namespace and storage. A naked Pod is not self-healing: if it crashes, nothing restarts it. A ReplicaSet ensures a specified number of Pod replicas are running at all times via label-selector watching. A Deployment manages ReplicaSets. When you update a Deployment (new image tag), it creates a new ReplicaSet alongside the old one and gradually shifts pods from old to new — that is a rolling update. For rollback, it shifts pods back to the previous ReplicaSet. In practice: never touch ReplicaSets directly. Declare a Deployment and let K8s manage everything beneath it."
    },
    {
      question: "Explain liveness vs readiness probes. When does each trigger?",
      answer: "Liveness probe answers: is the application still alive and functional? If it fails, kubelet kills and restarts the container. Use it to detect deadlocks or zombie states where the process is running but stuck. Readiness probe answers: is the application ready to receive traffic? If it fails, the pod is removed from the Service endpoint list — no new requests are routed to it. The pod is NOT restarted. The critical difference: a failing liveness probe causes a restart. A failing readiness probe causes traffic removal. In production I use both: liveness with initialDelaySeconds=90, readiness starting at 30s to signal when the app is ready."
    },
    {
      question: "How does K8s networking work — how does a Service route traffic to pods?",
      answer: "Each Pod gets its own IP from the cluster CIDR. Pod IPs are ephemeral — they change when pods restart. A Service has a stable ClusterIP that never changes. When you create a Service, K8s adds iptables or IPVS rules (managed by kube-proxy on each node) that intercept traffic to the ClusterIP and forward it to one of the healthy pod IPs matched by the label selector. kube-proxy watches the Endpoints object and updates rules when pods come and go. For NodePort, kube-proxy adds a rule forwarding traffic from NodeIP:NodePort to the ClusterIP. DNS: CoreDNS resolves service names to ClusterIPs automatically."
    },
    {
      question: "What happens step by step when you run kubectl apply -f deployment.yaml?",
      answer: "kubectl serialises the YAML to JSON and sends a PATCH to kube-apiserver. The API server authenticates (mTLS), authorises (RBAC), validates against the OpenAPI schema, and runs admission controllers. The desired state is stored in etcd. The Deployment controller watches etcd for Deployment changes, computes the diff, and creates a new ReplicaSet if the pod template changed. The ReplicaSet controller creates Pod objects. The Scheduler watches for unscheduled Pods, selects a node based on resources, taints, and affinity, and binds the Pod to that node. The kubelet on that node watches for pods bound to it, pulls the image via containerd, and starts the container."
    },
    {
      question: "Why was Docker removed as a Kubernetes runtime in 1.24? Is Docker still relevant?",
      answer: "K8s communicates with container runtimes via the Container Runtime Interface (CRI). Docker was never CRI-compliant — K8s used an internal shim called dockershim to translate. That shim added maintenance burden and lagged behind K8s releases. K8s 1.24 removed dockershim. K8s now talks directly to containerd which was always the actual runtime inside Docker anyway. For developers, Docker is still 100% relevant: docker build, docker push, Dockerfile, Docker Hub, Docker Compose for local dev. OCI images built by Docker run on K8s without any changes. The change only affects the K8s runtime layer."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "A pod is in CrashLoopBackOff. Which command gives you the most useful information first?",
      options: [
        { text: "A) kubectl get pod <name>", isCorrect: false },
        { text: "B) kubectl logs <name> --previous", isCorrect: true },
        { text: "C) kubectl delete pod <name>", isCorrect: false },
        { text: "D) kubectl top pod <name>", isCorrect: false }
      ],
      explanation: "CrashLoopBackOff means the container started, crashed, and K8s is restarting it. --previous retrieves logs from the most recent crashed instance — that crash log tells you WHY it crashed. kubectl get pod only shows status. kubectl describe pod also helps (check Events), but the crash log is the most direct signal."
    },
    {
      num: 2,
      question: "What is the difference between a liveness probe failure and a readiness probe failure?",
      options: [
        { text: "A) They behave identically — both restart the container", isCorrect: false },
        { text: "B) Liveness failure restarts the container. Readiness failure removes the pod from Service endpoints but does NOT restart it.", isCorrect: true },
        { text: "C) Readiness failure restarts the container. Liveness failure removes the pod from load balancing.", isCorrect: false },
        { text: "D) Both only log a warning — neither causes a restart", isCorrect: false }
      ],
      explanation: "Liveness = is the app alive? Failure causes restart. Readiness = is the app ready for traffic? Failure removes from endpoints, pod stays alive. A Spring Boot app should have readiness with initialDelaySeconds=30 to block traffic and liveness with initialDelaySeconds=90 to avoid premature restart."
    },
    {
      num: 3,
      question: "You have a Service with selector app=currency-conversion but kubectl get endpoints shows empty. Most likely cause?",
      options: [
        { text: "A) The Service port is wrong", isCorrect: false },
        { text: "B) The pods do not have a label matching the selector, or the pods are not Ready", isCorrect: true },
        { text: "C) The namespace is wrong in the curl command", isCorrect: false },
        { text: "D) NodePort is out of the 30000-32767 range", isCorrect: false }
      ],
      explanation: "Empty endpoints means the Service selector is finding no Ready pods. Either pod labels do not match (kubectl get pods --show-labels to verify), pods exist but are not Ready (readiness probe failing), or pods are in a different namespace. Always check endpoints first when Service routing breaks."
    },
    {
      num: 4,
      question: "What happens if you do NOT set resource requests on a pod?",
      options: [
        { text: "A) The pod will not schedule — requests are required", isCorrect: false },
        { text: "B) The scheduler places the pod anywhere and the pod gets QoS class BestEffort — first evicted under memory pressure", isCorrect: true },
        { text: "C) The pod gets unlimited resources automatically", isCorrect: false },
        { text: "D) The pod uses the cluster default of 1 CPU and 1Gi memory", isCorrect: false }
      ],
      explanation: "QoS classes: Guaranteed (requests == limits), Burstable (requests < limits), BestEffort (no requests or limits). BestEffort pods are first to be evicted when a node runs low on memory. Without requests, the scheduler also cannot make informed placement decisions. Always set requests and limits."
    },
    {
      num: 5,
      question: "You pushed a new Docker image with tag latest and ran kubectl apply. The pods are not updated. Why?",
      options: [
        { text: "A) kubectl apply does not trigger rolling updates", isCorrect: false },
        { text: "B) K8s compares the pod template spec hash — tag still latest so no rolling update was triggered", isCorrect: true },
        { text: "C) The latest tag is blocked by Kubernetes policy", isCorrect: false },
        { text: "D) You need to delete the deployment first", isCorrect: false }
      ],
      explanation: "K8s triggers a rolling update when the pod template spec changes. If the image tag is still latest in the YAML, the spec hash is identical — no update. Use unique tags per build (commit SHA or BUILD_NUMBER). As a workaround: kubectl rollout restart deployment/<name> forces a rolling restart without spec changes."
    }
  ],
  github: {
    filename: "devops-90days/week-4-kubernetes/README.md",
    commitMessage: "feat: Add Kubernetes notes — architecture, manifests, debugging, and interview prep",
    template: "# Week 4 — Kubernetes: Container Orchestration\n**Date:** YYYY-MM-DD | **Status:** Complete\n\n## Roadmap Position\nDocker Build -> Trivy -> Docker Push -> [K8s Deploy HERE]\n\n## Architecture\n- Control Plane: API Server, etcd, Scheduler, Controller Manager\n- Worker Nodes: kubelet, kube-proxy, containerd\n\n## What I Deployed\n- Namespace: devops\n- Deployment: 3 replicas with liveness + readiness probes\n- Service: NodePort on 30100\n- ConfigMap + Secret: externalised app config and DB password\n- MySQL StatefulSet with PVC (10Gi gp2)\n- HPA: min 2 / max 10 replicas at 70% CPU\n\n## Pipeline Stage Order\nMaven -> SonarQube -> JFrog -> Docker Build -> Trivy -> Docker Push -> K8s Deploy"
  }
};
