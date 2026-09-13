import { BootcampDay } from '../types';

export const eksModule: BootcampDay = {
  day: 20,
  title: "Amazon EKS — Managed Kubernetes in AWS",
  subtitle: "Control Plane · Node Groups · Fargate · IAM Roles for Service Accounts (IRSA) · ALB Ingress Controller",
  color: "#FF9900",
  trainerNote: "Running Kubernetes yourself (kubeadm/kops) is hard. EKS handles the control plane for you. But managing worker nodes, networking (VPC CNI), and security (IAM to RBAC mapping) is still your job. Real-world companies use managed services like EKS, GKE, or AKS.",
  engineerNote: "The hardest part of EKS is IAM integration. You must understand OIDC and IRSA (IAM Roles for Service Accounts). If your pod needs to read from S3, it shouldn't use access keys — it should assume an IAM role via IRSA.",
  goal: {
    icon: "☁️",
    title: "EKS Module Goal",
    description: "By the end of this module: you will understand EKS architecture, deploy a cluster using eksctl, configure a managed node group, set up OIDC provider, configure IAM Roles for Service Accounts (IRSA) for fine-grained pod access to AWS services, and expose your application using the AWS Load Balancer Controller."
  },
  schedule: [
    { time: "09:00-09:45", phase: "THEORY", activity: "EKS Architecture vs Self-Managed", why: "Understand what AWS manages (Control Plane) and what you manage (Worker nodes, VPC CNI, EBS CSI)." },
    { time: "09:45-11:00", phase: "HANDS-ON", activity: "Provisioning EKS with eksctl", why: "eksctl is the official CLI tool for EKS. Learn how it creates CloudFormation stacks under the hood." },
    { time: "11:00-11:15", phase: "BREAK", activity: "Break", why: "" },
    { time: "11:15-12:30", phase: "HANDS-ON", activity: "IAM and RBAC integration (aws-auth)", why: "AWS IAM authenticates users, but K8s RBAC authorizes them. You need to map IAM users/roles to K8s groups." },
    { time: "12:30-13:15", phase: "BREAK", activity: "Lunch", why: "" },
    { time: "13:15-15:00", phase: "HANDS-ON", activity: "IRSA (IAM Roles for Service Accounts)", why: "This is the most secure way to grant AWS permissions to Pods. Do not use EC2 Instance Profiles for Pods." },
    { time: "15:00-15:15", phase: "BREAK", activity: "Break", why: "" },
    { time: "15:15-16:30", phase: "HANDS-ON", activity: "AWS Load Balancer Controller", why: "To expose K8s Services externally using AWS ALBs/NLBs, you need this controller running in your cluster." },
    { time: "16:30-17:00", phase: "DOCUMENT", activity: "Tear down cluster & commit notes", why: "EKS control plane costs $0.10/hour. Don't leave it running. Tear it down." }
  ],
  concepts: [
    {
      icon: "☁️",
      title: "Managed Control Plane",
      description: "In EKS, AWS provisions, scales, and manages the Kubernetes control plane (API server, etcd) across multiple Availability Zones. You don't have SSH access to these nodes. You only pay a flat hourly fee per cluster for this.",
      analogy: "Like renting an office building where the landlord handles all the security, power, and maintenance of the common areas, but you just manage your own office space."
    },
    {
      icon: "🖥️",
      title: "Data Plane Options (Worker Nodes)",
      description: "1. Managed Node Groups: AWS manages EC2 instances for you (automates provisioning, updates). 2. Self-managed Nodes: You manage the ASG and instances entirely. 3. AWS Fargate: Serverless compute for containers. No EC2 instances to manage at all, but less control and no DaemonSets.",
      analogy: "Managed Nodes = Leasing a fleet of cars where the dealer does maintenance. Self-managed = Buying cars and doing maintenance yourself. Fargate = Taking Uber (no car to manage)."
    },
    {
      icon: "🔐",
      title: "IAM Authentication (aws-auth)",
      description: "When you run kubectl, it uses your AWS credentials to authenticate to the EKS API server. The API server checks a ConfigMap named 'aws-auth' in the 'kube-system' namespace to see which K8s RBAC groups your IAM identity maps to.",
      analogy: "IAM is the security guard at the building door checking your ID. aws-auth is the mapping that tells the floor manager (RBAC) what rooms you can enter."
    },
    {
      icon: "🔑",
      title: "IRSA (IAM Roles for Service Accounts)",
      description: "Instead of giving the EC2 node an IAM role (which gives ALL pods on that node the same permissions), IRSA uses OpenID Connect (OIDC) to allow a specific K8s ServiceAccount to assume a specific AWS IAM Role. This provides least-privilege security.",
      analogy: "IRSA is like giving an individual employee a keycard that only opens their specific locker, instead of giving a master key to everyone in the room."
    },
    {
      icon: "🕸️",
      title: "VPC CNI (Container Network Interface)",
      description: "The AWS VPC CNI plugin assigns native VPC IP addresses to Pods. This means Pods get IPs directly from the VPC subnet, allowing them to communicate natively with other AWS services like RDS or EC2 without NAT.",
      analogy: "VPC CNI gives every Pod its own direct phone line to the outside world, rather than routing everyone through a single company switchboard."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 4,
      sessionTitle: "STEP 1 — Provision EKS Cluster with eksctl",
      sections: [
        {
          label: "Create a cluster (takes 15-20 mins)",
          lines: [
            { type: "cmd", prompt: "$", text: "eksctl create cluster --name devops-cluster --region us-east-1 --nodegroup-name standard-workers --node-type t3.medium --nodes 2" },
            { type: "cmd", prompt: "$", text: "kubectl get nodes" },
            { type: "comment", text: "Update local kubeconfig if needed" },
            { type: "cmd", prompt: "$", text: "aws eks update-kubeconfig --region us-east-1 --name devops-cluster" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 4,
      sessionTitle: "STEP 2 — IAM roles for Service Accounts (IRSA)",
      sections: [
        {
          label: "Enable OIDC and create IAM Role",
          lines: [
            { type: "cmd", prompt: "$", text: "eksctl utils associate-iam-oidc-provider --cluster devops-cluster --approve" },
            { type: "cmd", prompt: "$", text: "eksctl create iamserviceaccount --name s3-reader --namespace default --cluster devops-cluster --attach-policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess --approve" },
            { type: "cmd", prompt: "$", text: "kubectl get serviceaccount s3-reader -o yaml" }
          ]
        }
      ]
    },
    {
      sessionNumber: 3,
      totalSessions: 4,
      sessionTitle: "STEP 3 — Install AWS Load Balancer Controller",
      sections: [
        {
          label: "Helm install",
          lines: [
            { type: "cmd", prompt: "$", text: "helm repo add eks https://aws.github.io/eks-charts" },
            { type: "cmd", prompt: "$", text: "helm repo update" },
            { type: "cmd", prompt: "$", text: "helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=devops-cluster --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller" }
          ]
        }
      ]
    },
    {
      sessionNumber: 4,
      totalSessions: 4,
      sessionTitle: "STEP 4 — Tear Down",
      sections: [
        {
          label: "Destroy the cluster to save costs",
          lines: [
            { type: "cmd", prompt: "$", text: "eksctl delete cluster --name devops-cluster --region us-east-1" }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "kubectl connection refused",
      steps: [
        { num: 1, title: "Check kubeconfig", cmd: "cat ~/.kube/config" },
        { num: 2, title: "Update kubeconfig", cmd: "aws eks update-kubeconfig --region us-east-1 --name devops-cluster" },
        { num: 3, title: "Check AWS identity", cmd: "aws sts get-caller-identity" },
        { num: 4, title: "Verify you are the cluster creator", description: "The IAM user/role that created the cluster is the ONLY one with admin access by default. If you used a different user, you must update the aws-auth ConfigMap." }
      ]
    },
    {
      title: "Pods stuck in Pending (Insufficient capacity)",
      steps: [
        { num: 1, title: "Describe pod", cmd: "kubectl describe pod <pod-name>" },
        { num: 2, title: "Check Nodes", cmd: "kubectl get nodes" },
        { num: 3, title: "Check ASG", description: "Go to AWS EC2 console -> Auto Scaling Groups. Ensure the desired capacity is met and there are no EC2 quota limits preventing new nodes from launching." }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Using Access Keys inside Pods",
      description: "Passing AWS_ACCESS_KEY_ID as environment variables or secrets into pods.",
      fix: "Use IRSA (IAM Roles for Service Accounts). It securely provides temporary STS credentials to the pod automatically via OIDC."
    },
    {
      mistake: "Forgetting to tear down the cluster",
      description: "EKS control plane costs $0.10 per hour (~$73/month), plus the cost of worker nodes and NAT gateways.",
      fix: "Always run `eksctl delete cluster --name <name>` when finished learning."
    }
  ],
  project: {
    tag: "EKS Project",
    title: "Deploy Nginx using AWS ALB Ingress",
    timeEstimate: "60 min",
    goal: "Provision an EKS cluster, deploy an Nginx application, and expose it to the internet using an AWS Application Load Balancer via the Ingress resource.",
    checklist: [
      "Provision EKS cluster using eksctl",
      "Deploy AWS Load Balancer Controller via Helm",
      "Create Nginx Deployment and Service (type NodePort)",
      "Create Ingress resource with alb ingress class",
      "Verify ALB is provisioned in AWS Console",
      "Access Nginx via ALB DNS name",
      "Tear down the cluster"
    ],
    codeBlock: {
      title: "Ingress YAML for AWS ALB",
      lines: [
        "apiVersion: networking.k8s.io/v1",
        "kind: Ingress",
        "metadata:",
        "  name: nginx-ingress",
        "  annotations:",
        "    alb.ingress.kubernetes.io/scheme: internet-facing",
        "    alb.ingress.kubernetes.io/target-type: ip",
        "spec:",
        "  ingressClassName: alb",
        "  rules:",
        "    - http:",
        "        paths:",
        "          - path: /",
        "            pathType: Prefix",
        "            backend:",
        "              service:",
        "                name: nginx-service",
        "                port:",
        "                  number: 80"
      ]
    },
    expectedOutput: "ALB DNS name resolves to Nginx welcome page."
  },
  interview: [
    {
      question: "How do pods in EKS get IP addresses?",
      answer: "EKS uses the AWS VPC CNI plugin. It attaches secondary IP addresses from the EC2 instance's ENI (Elastic Network Interface) directly to the Pods. This means Pods get native VPC IPs and can communicate seamlessly within the VPC without overlays."
    },
    {
      question: "Explain IAM Roles for Service Accounts (IRSA).",
      answer: "IRSA allows you to map an AWS IAM Role to a Kubernetes ServiceAccount using an OIDC identity provider. When a pod uses that ServiceAccount, the EKS mutating admission webhook injects temporary AWS STS credentials into the pod as environment variables and a token file. This achieves least privilege, replacing the need to give broad IAM permissions to the underlying EC2 node."
    },
    {
      question: "What is the aws-auth ConfigMap?",
      answer: "By default, Kubernetes uses RBAC. But EKS uses AWS IAM for authentication. The aws-auth ConfigMap in the kube-system namespace acts as the bridge. It maps AWS IAM Users or Roles to Kubernetes RBAC Groups (like system:masters). If you create a cluster, your IAM entity gets admin access implicitly, but to add other admins, you must edit this ConfigMap."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "Which component assigns native VPC IP addresses to Pods in EKS?",
      options: [
        { text: "A) kube-proxy", isCorrect: false },
        { text: "B) Calico", isCorrect: false },
        { text: "C) AWS VPC CNI", isCorrect: true },
        { text: "D) CoreDNS", isCorrect: false }
      ],
      explanation: "AWS VPC CNI is the default networking plugin for EKS. It assigns native VPC IPs directly to pods, allowing them to route natively in the VPC."
    },
    {
      num: 2,
      question: "How should you securely grant an EKS Pod access to read an S3 bucket?",
      options: [
        { text: "A) Attach an IAM policy to the worker node's EC2 role", isCorrect: false },
        { text: "B) Use IRSA (IAM Roles for Service Accounts)", isCorrect: true },
        { text: "C) Pass AWS_ACCESS_KEY_ID via a Kubernetes Secret", isCorrect: false },
        { text: "D) Hardcode the credentials in the application properties", isCorrect: false }
      ],
      explanation: "IRSA uses OIDC to provide fine-grained, temporary IAM credentials to a specific Pod via its ServiceAccount. Giving permissions to the EC2 node gives all pods on that node the same permissions, violating least privilege."
    }
  ],
  github: {
    filename: "devops-90days/week-4-eks/README.md",
    commitMessage: "feat: Add EKS notes - Architecture, eksctl, IRSA, and ALB Controller",
    template: "# Week 4 — Amazon EKS\n**Date:** YYYY-MM-DD | **Status:** Complete\n\n## Concepts Learned\n- Managed Control Plane vs Worker Nodes\n- IAM Authentication via aws-auth\n- IAM Roles for Service Accounts (IRSA)\n- VPC CNI\n\n## Hands-on Accomplishments\n- Provisioned EKS cluster using `eksctl`\n- Configured IRSA for S3 access\n- Installed AWS Load Balancer Controller via Helm\n- Deployed Nginx via ALB Ingress\n- Destroyed cluster to save costs"
  }
};
