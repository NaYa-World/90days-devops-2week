export interface DiagramNode {
  id: string;
  label: string;
  x: number; // grid x coordinate
  y: number; // grid y coordinate
  type?: 'root' | 'category' | 'topic' | 'highlight';
  targetDay?: number; // target activeDay index to navigate to
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface DiagramData {
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export const devopsRoadmapMindmap: DiagramData = {
  title: "90 Days DevOps Mindmap",
  nodes: [
    { id: "root", label: "DevOps Roadmap 🚀", x: 180, y: 150, type: "root" },
    
    // Categories
    { id: "git", label: "Git & Linux", x: 60, y: 60, type: "category", targetDay: 0 },
    { id: "cicd", label: "CI/CD Pipelines", x: 300, y: 60, type: "category", targetDay: 4 },
    { id: "containers", label: "Containers", x: 60, y: 240, type: "category", targetDay: 12 },
    { id: "iac", label: "IaC (Terraform)", x: 300, y: 240, type: "category", targetDay: 20 },
    
    // Topics under Git
    { id: "git-basic", label: "Git Basics", x: 40, y: 20, type: "topic", targetDay: 0 },
    { id: "git-flow", label: "Branching", x: 100, y: 20, type: "topic", targetDay: 1 },
    
    // Topics under CI/CD
    { id: "jenkins", label: "Jenkins", x: 260, y: 20, type: "topic", targetDay: 4 },
    { id: "gha", label: "GitHub Actions", x: 340, y: 20, type: "topic", targetDay: 5 },
    
    // Topics under Containers
    { id: "docker", label: "Docker", x: 40, y: 280, type: "topic", targetDay: 12 },
    { id: "k8s", label: "Kubernetes", x: 100, y: 280, type: "topic", targetDay: 15 },
    
    // Topics under IaC
    { id: "tf-basics", label: "Terraform State", x: 260, y: 280, type: "topic", targetDay: 20 },
    { id: "ansible", label: "Ansible Config", x: 340, y: 280, type: "topic", targetDay: 25 }
  ],
  edges: [
    { from: "root", to: "git" },
    { from: "root", to: "cicd" },
    { from: "root", to: "containers" },
    { from: "root", to: "iac" },
    
    { from: "git", to: "git-basic" },
    { from: "git", to: "git-flow" },
    { from: "cicd", to: "jenkins" },
    { from: "cicd", to: "gha" },
    { from: "containers", to: "docker" },
    { from: "containers", to: "k8s" },
    { from: "iac", to: "tf-basics" },
    { from: "iac", to: "ansible" }
  ]
};

export const cicdPipelineDiagram: DiagramData = {
  title: "Continuous Integration & Deployment Pipeline Flow",
  nodes: [
    { id: "code", label: "Developer Push 💻", x: 40, y: 60, type: "highlight" },
    { id: "build", label: "Build & Lint ⚙️", x: 130, y: 60 },
    { id: "test", label: "Unit Tests 🧪", x: 220, y: 60 },
    { id: "security", label: "SAST Scan 🛡️", x: 310, y: 60 },
    { id: "deploy", label: "Deploy to Prod 🚀", x: 400, y: 60, type: "root" }
  ],
  edges: [
    { from: "code", to: "build" },
    { from: "build", to: "test" },
    { from: "test", to: "security" },
    { from: "security", to: "deploy" }
  ]
};
