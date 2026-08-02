import React, { useState } from 'react';

// ─────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────
interface Resource {
  title: string;
  type: string;
  url: string;
}

interface ModuleData {
  id: number;
  title: string;
  description: string;
  lessons: number;
  topics: { title: string; subtitle?: string }[];
  labs: string[];
  resources: Resource[];
  authored: number;
  isBookReferenced?: boolean;
}

const MODULES: ModuleData[] = [
  {
    id: 1,
    title: 'Linux Commands',
    description: 'Core Linux administration for DevOps: file systems, permissions, processes, and networking.',
    lessons: 13,
    authored: 13,
    topics: [
      { title: 'What is Linux', subtitle: 'Understand the kernel and shell' },
      { title: 'File system structure', subtitle: 'FHS and critical directories' },
      { title: 'File & directory commands', subtitle: 'ls, cd, mkdir, rm, cp, mv' },
      { title: 'Permissions & ownership', subtitle: 'chmod, chown, and umask' },
      { title: 'User management', subtitle: 'useradd, groupadd, /etc/passwd' },
      { title: 'Process management', subtitle: 'ps, top, kill, systemctl' },
      { title: 'Networking commands', subtitle: 'ping, netstat, ss, curl, ip' },
      { title: 'Text processing', subtitle: 'grep, awk, sed, cut' },
      { title: 'SSH access', subtitle: 'Keys, config, and tunneling' },
      { title: 'Package management', subtitle: 'apt, yum, dnf, rpm' },
      { title: 'Environment variables', subtitle: 'export, .bashrc, .profile' },
      { title: 'Cron jobs', subtitle: 'Scheduling with crontab' },
      { title: 'Disk management (LVM, fdisk, mount)', subtitle: 'Partitions and volumes' },
    ],
    labs: ['Lab A: Basic File Ops', 'Lab B: User & Permissions'],
    resources: [
      { title: 'Linux Journey', type: 'COURSE', url: '#' },
      { title: 'The Linux Command Line', type: 'BOOK', url: '#' },
      { title: 'Ubuntu Documentation', type: 'DOCS', url: '#' },
    ],
  },
  {
    id: 2,
    title: 'Git',
    description: 'Version control workflows, branching, merging, and collaboration.',
    lessons: 11,
    authored: 11,
    topics: [
      { title: 'Version Control & Git', subtitle: 'Why use VCS?' },
      { title: 'Git installation & configuration', subtitle: 'git config' },
      { title: 'Staging & commits', subtitle: 'git add, commit, status, log' },
      { title: 'Branching', subtitle: 'create, switch, delete, merge' },
      { title: 'Stashing', subtitle: 'git stash, pop, list, drop' },
      { title: 'Remote workflows', subtitle: 'git remote, fetch, pull, push' },
      { title: 'Rebase vs Merge', subtitle: 'Keeping history clean' },
      { title: 'Cherry pick', subtitle: 'Selectively applying commits' },
      { title: 'Reverting & resetting', subtitle: 'Undoing mistakes' },
      { title: 'Tags', subtitle: 'Releasing versions' },
      { title: '.gitignore', subtitle: 'Excluding files' },
    ],
    labs: [],
    resources: [
      { title: 'Pro Git Book', type: 'BOOK', url: '#' },
      { title: 'Learn Git Branching', type: 'COURSE', url: '#' },
    ],
  },
  {
    id: 3,
    title: 'GitHub / SCM',
    description: 'Source code management, PRs, Git Flow, and GitHub Actions basics.',
    lessons: 9,
    authored: 9,
    topics: [
      { title: 'GitHub vs GitLab vs Bitbucket', subtitle: 'Comparing platforms' },
      { title: 'Creating & managing repositories', subtitle: 'Settings and access' },
      { title: 'Branching strategy (Git Flow)', subtitle: 'Feature branches, releases' },
      { title: 'Pull requests & code review', subtitle: 'Collaborating safely' },
      { title: 'Branch protection rules', subtitle: 'Enforcing reviews' },
      { title: 'GitHub Webhooks', subtitle: 'Event integrations' },
      { title: 'Enterprise security', subtitle: 'Auditing and compliance' },
      { title: 'GitHub Actions basics', subtitle: 'Triggers, workflows, jobs, steps' },
    ],
    labs: ['Lab A', 'Lab B', 'Lab C'],
    resources: [
      { title: 'GitHub Docs', type: 'DOCS', url: '#' },
      { title: 'Git Flow Cheatsheet', type: 'GUIDE', url: '#' },
    ],
  },
  {
    id: 4,
    title: 'Maven',
    description: 'Production-grade Maven build automation for DevOps engineers. Learn POM, lifecycle, plugins, dependency management, multi-module projects, and CI integration.',
    lessons: 12,
    authored: 12,
    topics: [
      { title: 'What is Maven?', subtitle: 'Build automation & roles', anchor: '#concept' },
      { title: 'Installation & Setup', subtitle: 'JDK and Maven on Linux', anchor: '#installation' },
      { title: 'POM — Project Object Model', subtitle: 'The single source of truth', anchor: '#pom' },
      { title: 'Build Lifecycle', subtitle: 'Clean, Default, Site phases', anchor: '#lifecycle' },
      { title: 'Dependency Management', subtitle: 'Scopes and conflict resolution', anchor: '#dependencies' },
      { title: 'Plugins & Goals', subtitle: 'Extending Maven capabilities', anchor: '#plugins' },
      { title: 'Repositories', subtitle: 'Local, Central, and Remote', anchor: '#repositories' },
      { title: 'Profiles', subtitle: 'Environment-specific builds', anchor: '#profiles' },
      { title: 'Multi-Module Projects', subtitle: 'Parent and child POMs', anchor: '#multi-module' },
      { title: 'Properties & Filtering', subtitle: 'Dynamic variable injection', anchor: '#properties' },
      { title: 'Test Management', subtitle: 'Surefire and Failsafe plugins', anchor: '#testing' },
      { title: 'CI/CD Integration', subtitle: 'Jenkins pipelines and caching', anchor: '#ci-integration' },
    ],
    labs: [
      'Easy Challenge: Add Guava Dependency',
      'Medium Challenge: Create Multi-Module Project',
      'Hard Challenge: Jenkins Pipeline + Maven'
    ],
    resources: [
      { title: 'Maven Fundamentals Guide', type: 'INTERACTIVE', url: '/maven-fundamentals.html' },
      { title: 'Apache Maven Docs', type: 'DOCS', url: 'https://maven.apache.org/guides/' },
    ],
  },
  {
    id: 5,
    title: 'Jenkins',
    description: 'Continuous Integration server setup, declarative pipelines, and plugins.',
    lessons: 8,
    authored: 8,
    topics: [
      { title: 'CI/CD Fundamentals', subtitle: 'Why automate?' },
      { title: 'Jenkins Installation on AWS EC2', subtitle: 'Deploying the master' },
      { title: 'Jenkins Architecture (Master/Agent)', subtitle: 'Scaling builds' },
      { title: 'Essential Plugins', subtitle: 'Extending Jenkins' },
      { title: 'Declarative Pipeline', subtitle: 'Jenkinsfile syntax' },
      { title: 'GitHub Integration', subtitle: 'Webhooks and SCM polling' },
      { title: 'Shared Libraries', subtitle: 'vars/, src/, structure' },
      { title: 'P1 Incident Simulation', subtitle: 'Troubleshooting failed builds' },
    ],
    labs: [
      'Lab A: Install Jenkins on EC2, configure plugins',
      'Lab B: Connect GitHub repo with Jenkinsfile',
      'Lab C: Trigger pipeline on code push',
      'Lab D: Simulate P1 incident and rollback'
    ],
    resources: [
      { title: 'Jenkins User Documentation', type: 'DOCS', url: '#' },
      { title: 'Pipeline Syntax Guide', type: 'GUIDE', url: '#' },
    ],
  },
  {
    id: 6,
    title: 'SonarCloud',
    description: 'Static Code Analysis, quality gates, and automated code review.',
    lessons: 6,
    authored: 6,
    topics: [
      { title: 'Static Code Analysis', subtitle: 'Finding bugs early' },
      { title: 'SonarCloud account setup', subtitle: 'Connecting to GitHub' },
      { title: 'Project & Token Management', subtitle: 'Secure authentication' },
      { title: 'Jenkins Integration', subtitle: 'SonarQube Scanner' },
      { title: 'Quality Gates & Tollgates', subtitle: 'Blocking bad code' },
      { title: 'Rules & Profiles Management', subtitle: 'Customizing analysis' },
    ],
    labs: [
      'Lab A: Create SonarCloud account, connect GitHub repo',
      'Lab B: Run analysis on Java project',
      'Lab C: Configure Quality Gate to block on 0% coverage',
      'Lab D: Fix issues to pass Quality Gate'
    ],
    resources: [
      { title: 'SonarCloud Docs', type: 'DOCS', url: '#' },
    ],
  },
  {
    id: 7,
    title: 'Artifact Repository',
    description: 'Managing build artifacts, Docker images, and package registries.',
    lessons: 6,
    authored: 6,
    topics: [
      { title: 'Artifact Repository Concept', subtitle: 'Why store binaries?' },
      { title: 'GitHub Packages setup', subtitle: 'Publishing packages' },
      { title: 'Repository Types', subtitle: 'Local/Remote/Virtual' },
      { title: 'Jenkins–GitHub Packages Integration', subtitle: 'Authenticating push' },
      { title: 'Docker Images in GitHub Packages', subtitle: 'GHCR usage' },
      { title: 'Artifact Promotion & Rollback', subtitle: 'Release management' },
    ],
    labs: [],
    resources: [
      { title: 'GitHub Packages Docs', type: 'DOCS', url: '#' },
      { title: 'JFrog Artifactory Guide', type: 'ARTICLE', url: '#' },
    ],
  },
  {
    id: 8,
    title: 'Docker',
    description: 'Containerization, Dockerfiles, Compose, and AWS ECR.',
    lessons: 9,
    authored: 9,
    topics: [
      { title: 'VMs vs Containers', subtitle: 'Understanding the difference' },
      { title: 'Docker Architecture', subtitle: 'Daemon, CLI, Registry' },
      { title: 'Docker Installation', subtitle: 'Setting up the engine' },
      { title: 'Core Docker Commands', subtitle: 'run, ps, images, rm, rmi' },
      { title: 'Writing Dockerfiles', subtitle: 'Instructions and layers' },
      { title: 'Multi-Stage Builds', subtitle: 'Optimizing image size' },
      { title: 'Docker Compose', subtitle: 'Multi-container apps' },
      { title: 'Docker Networking', subtitle: 'bridge, host, overlay, none' },
      { title: 'AWS ECR Integration', subtitle: 'Pushing to cloud registries' },
    ],
    labs: [
      'Lab A: Install Docker on EC2, run nginx container',
      'Lab B: Write Dockerfile for Java Spring Boot app',
      'Lab C: Build multi-stage Docker image',
      'Lab D: Push image to AWS ECR'
    ],
    resources: [
      { title: 'Docker Official Docs', type: 'DOCS', url: '#' },
      { title: 'Best practices for writing Dockerfiles', type: 'GUIDE', url: '#' },
    ],
  },
  {
    id: 9,
    title: 'Trivy',
    description: 'Vulnerability scanning for containers and integrating with CI pipelines.',
    lessons: 6,
    authored: 6,
    topics: [
      { title: 'CVE & Vulnerability Scanning', subtitle: 'Security basics' },
      { title: 'Trivy Installation', subtitle: 'Setup and config' },
      { title: 'Running Trivy Scans', subtitle: 'Scanning images and fs' },
      { title: 'Understanding Vulnerability Reports', subtitle: 'Severity levels' },
      { title: 'Jenkins–Trivy Integration', subtitle: 'Failing builds on CVEs' },
      { title: 'P1 Scenario: Security Issues', subtitle: 'Zero-day response' },
    ],
    labs: [
      'Lab A: Install Trivy on EC2',
      'Lab B: Scan public Docker image',
      'Lab C: Scan payment-service image',
      'Lab D: Fix highest severity vulnerability'
    ],
    resources: [
      { title: 'Aqua Trivy Docs', type: 'DOCS', url: '#' },
    ],
  },
  {
    id: 10,
    title: 'Kubernetes',
    description: 'Container orchestration: Pods, Deployments, Services, and Helm on EKS.',
    lessons: 12,
    authored: 12,
    topics: [
      { title: 'K8s Architecture', subtitle: 'Control plane and worker nodes' },
      { title: 'Core Objects', subtitle: 'Pods, Deployments, Services' },
      { title: 'ConfigMaps & Secrets', subtitle: 'Configuration injection' },
      { title: 'Namespaces', subtitle: 'Dev/Test/Prod separation' },
      { title: 'kubectl Commands', subtitle: 'Interacting with clusters' },
      { title: 'YAML Configuration', subtitle: 'Declarative manifests' },
      { title: 'HPA', subtitle: 'Horizontal Pod Autoscaler' },
      { title: 'RBAC', subtitle: 'Role-Based Access Control' },
      { title: 'Helm', subtitle: 'Charts, values.yaml, install/upgrade' },
      { title: 'Network Policies', subtitle: 'Ingress/egress rules' },
      { title: 'Setting up EKS', subtitle: 'AWS Managed Kubernetes' },
      { title: 'Rolling Updates & Rollbacks', subtitle: 'Zero-downtime deploys' },
    ],
    labs: [
      'Lab A: Create EKS cluster with eksctl',
      'Lab B: Deploy payment-service to dev namespace',
      'Lab C: Configure HPA and simulate load',
      'Lab D: Deploy broken version and rollback',
      'Lab E: Set up Ingress with AWS ALB'
    ],
    resources: [
      { title: 'Kubernetes Official Docs', type: 'DOCS', url: '#' },
      { title: 'Helm Docs', type: 'DOCS', url: '#' },
    ],
  },
  {
    id: 11,
    title: 'Splunk & Grafana',
    description: 'Monitoring, logging, dashboarding, and alerting for infrastructure.',
    lessons: 7,
    authored: 7,
    topics: [
      { title: 'Grafana + Prometheus Setup', subtitle: 'Metrics stack' },
      { title: 'Metrics Collection', subtitle: 'Exporters and scraping' },
      { title: 'Dashboard Creation', subtitle: 'Visualizing data' },
      { title: 'Alerting Configuration', subtitle: 'Alertmanager setup' },
      { title: 'Splunk Log Management', subtitle: 'Centralized logging' },
      { title: 'SPL', subtitle: 'Splunk Processing Language' },
      { title: 'Real-time Incident Investigation', subtitle: 'Finding root causes' },
    ],
    labs: [
      'Lab A: Install Prometheus + Grafana on EKS using Helm',
      'Lab B: Import Kubernetes cluster dashboard',
      'Lab C: Create custom panel for payment-service HTTP errors',
      'Lab D: Configure Slack alerts for CPU spikes'
    ],
    resources: [
      { title: 'Prometheus Docs', type: 'DOCS', url: '#' },
      { title: 'Grafana Tutorials', type: 'COURSE', url: '#' },
    ],
  },
  {
    id: 12,
    title: 'AWS Core Services',
    description: 'Foundational AWS networking, IAM, compute, and observability.',
    lessons: 8,
    authored: 8,
    topics: [
      { title: 'IAM', subtitle: 'Users, Groups, Roles, Policies' },
      { title: 'IAM Roles for EKS (IRSA)', subtitle: 'Pod identity' },
      { title: 'VPC', subtitle: 'CIDR, Subnets, Gateways' },
      { title: 'Security Groups & NACLs', subtitle: 'Network firewalls' },
      { title: 'Route53 DNS', subtitle: 'Domain routing' },
      { title: 'EKS Integration', subtitle: 'Connecting VPCs and clusters' },
      { title: 'CloudWatch', subtitle: 'Logs, metrics, alarms, log groups' },
      { title: 'Real-World Architecture', subtitle: 'Putting it together' },
    ],
    labs: [
      'Lab A: Create VPC with public/private subnets',
      'Lab B: Create ALB, configure listener rules',
      'Lab C: Deploy containerized app to ECS Fargate'
    ],
    resources: [
      { title: 'AWS Well-Architected', type: 'GUIDE', url: '#' },
    ],
  },
  {
    id: 13,
    title: 'Terraform',
    description: 'Infrastructure as Code, HCL, remote state, modules, and AWS provider.',
    lessons: 10,
    authored: 10,
    topics: [
      { title: 'IaC concepts', subtitle: 'Why Terraform over manual provisioning' },
      { title: 'Terraform installation & CLI', subtitle: 'init, plan, apply, destroy' },
      { title: 'HCL syntax', subtitle: 'Providers, resources, variables, outputs' },
      { title: 'Terraform state', subtitle: 'S3 + DynamoDB locking' },
      { title: 'Modules', subtitle: 'Writing reusable components' },
      { title: 'Workspaces', subtitle: 'Dev/staging/prod separation' },
      { title: 'Terraform with AWS', subtitle: 'EC2, VPC, S3, IAM' },
      { title: 'Jenkins–Terraform integration', subtitle: 'Plan in PR, apply on merge' },
      { title: 'Import existing infrastructure', subtitle: 'terraform import' },
      { title: 'Drift detection & remediation', subtitle: 'Keeping state consistent' },
    ],
    labs: [
      'Lab A: Write Terraform to provision EC2 + Security Group',
      'Lab B: Create VPC with public/private subnets',
      'Lab C: Store state in S3 with DynamoDB locking',
      'Lab D: Write reusable module for EC2',
      'Lab E: Integrate Terraform plan into Jenkins pipeline'
    ],
    resources: [
      { title: 'HashiCorp Learn', type: 'COURSE', url: '#' },
      { title: 'Terraform AWS Provider', type: 'DOCS', url: '#' },
    ],
  },
  {
    id: 14,
    title: 'Ansible',
    description: 'Configuration management, playbooks, roles, and vault for provisioning.',
    lessons: 9,
    authored: 9,
    topics: [
      { title: 'Configuration management concepts', subtitle: 'Push vs pull' },
      { title: 'Ansible installation & architecture', subtitle: 'Control node, managed nodes' },
      { title: 'Inventory files', subtitle: 'Static & dynamic' },
      { title: 'Ad-hoc commands', subtitle: 'Quick execution' },
      { title: 'Playbooks', subtitle: 'Tasks, handlers, variables, loops' },
      { title: 'Roles', subtitle: 'Structure, defaults, tasks, templates' },
      { title: 'Ansible Vault', subtitle: 'Encrypting secrets' },
      { title: 'Jenkins–Ansible integration', subtitle: 'Pipeline execution' },
      { title: 'Ansible for Docker & Kubernetes', subtitle: 'Provisioning' },
    ],
    labs: [
      'Lab A: Install Ansible, configure SSH to EC2 nodes',
      'Lab B: Write playbook to install Java + Jenkins on EC2',
      'Lab C: Create role for application deployment',
      'Lab D: Encrypt secrets with Ansible Vault',
      'Lab E: Trigger Ansible playbook from Jenkins pipeline'
    ],
    resources: [
      { title: 'Ansible Documentation', type: 'DOCS', url: '#' },
    ],
  },
  {
    id: 15,
    title: 'AWS DevOps Services',
    description: 'Native AWS CI/CD tools: CodeCommit, CodeBuild, CodeDeploy, CodePipeline.',
    lessons: 7,
    authored: 7,
    topics: [
      { title: 'AWS CodeCommit', subtitle: 'Git hosting' },
      { title: 'AWS CodeBuild', subtitle: 'Build server' },
      { title: 'AWS CodeDeploy', subtitle: 'Rolling, blue/green, canary' },
      { title: 'AWS CodePipeline', subtitle: 'End-to-end pipeline orchestration' },
      { title: 'AWS Elastic Beanstalk', subtitle: 'PaaS deployments' },
      { title: 'Parameter Store & Secrets Manager', subtitle: 'Secrets in pipelines' },
      { title: 'End-to-end pipeline', subtitle: 'CodePipeline + CodeBuild + CodeDeploy' },
    ],
    labs: [
      'Lab A: Create CodeBuild project for a Java app',
      'Lab B: Configure CodeDeploy blue/green deployment',
      'Lab C: Build full CodePipeline from source to deploy',
      'Lab D: Pull secrets from Parameter Store inside pipeline'
    ],
    resources: [
      { title: 'AWS Developer Tools', type: 'DOCS', url: '#' },
    ],
  },
  {
    id: 16,
    title: 'Incident Management',
    description: 'On-call practices, SLAs, runbooks, blameless postmortems.',
    lessons: 8,
    authored: 8,
    topics: [
      { title: 'Incident lifecycle', subtitle: 'Detect → triage → mitigate → resolve → postmortem' },
      { title: 'Severity classification', subtitle: 'P1/P2/P3/P4 definitions and SLAs' },
      { title: 'Runbooks & playbooks', subtitle: 'Writing and maintaining them' },
      { title: 'On-call practices', subtitle: 'Escalation chains, handoffs' },
      { title: 'Blameless postmortems', subtitle: 'Structure, 5-whys, action items' },
      { title: 'MTTR, MTTD, MTTF', subtitle: 'Availability SLAs (99.9% vs 99.99%)' },
      { title: 'Communication during incidents', subtitle: 'Status pages, stakeholder updates' },
      { title: 'Tools', subtitle: 'PagerDuty, OpsGenie, Slack war rooms' },
    ],
    labs: [
      'Lab A: Write a runbook for a Kubernetes pod crash scenario',
      'Lab B: Simulate P1 — app down, trace through logs, rollback',
      'Lab C: Write a blameless postmortem for Lab B incident',
      'Lab D: Configure PagerDuty-style alert routing in Grafana'
    ],
    resources: [
      { title: 'Google SRE Book', type: 'BOOK', url: '#' },
      { title: 'Atlassian Incident Management', type: 'GUIDE', url: '#' },
    ],
  },
  {
    id: 17,
    title: 'Cloud Cost Optimization',
    description: 'FinOps practices, AWS Cost Explorer, spot instances, right-sizing.',
    lessons: 7,
    authored: 7,
    topics: [
      { title: 'AWS pricing model', subtitle: 'On-demand vs reserved vs spot' },
      { title: 'EC2 right-sizing', subtitle: 'CloudWatch metrics to decisions' },
      { title: 'Spot instances in CI/CD pipelines', subtitle: 'Jenkins agents on spot' },
      { title: 'S3 storage classes & lifecycle policies', subtitle: 'Cost effective storage' },
      { title: 'Cost allocation tags', subtitle: 'AWS Cost Explorer usage' },
      { title: 'EKS cost optimization', subtitle: 'Node groups, Fargate vs EC2' },
      { title: 'Identifying waste', subtitle: 'Idle resources, oversized instances' },
    ],
    labs: [
      'Lab A: Enable Cost Explorer, set billing alarm in CloudWatch',
      'Lab B: Configure Jenkins agent on EC2 spot instance',
      'Lab C: Add lifecycle policy to S3 bucket (move to Glacier after 90 days)',
      'Lab D: Tag all Terraform-provisioned resources for cost tracking'
    ],
    resources: [
      { title: 'AWS Cost Management', type: 'DOCS', url: '#' },
    ],
  },
];

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const ArrowUpRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

export const MaterialView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedModule = MODULES.find(m => m.id === selectedId);

  // Detail View
  if (selectedModule) {
    return (
      <div style={{
        flex: 1, overflowY: 'auto', padding: '40px 60px', color: '#fff', boxSizing: 'border-box'
      }}>
        {/* Detail Header */}
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button
            onClick={() => setSelectedId(null)}
            style={{
              background: 'none', border: 'none', color: '#888', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 24,
              fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600
            }}
          >
            <span style={{ transform: 'rotate(180deg)' }}><ChevronRight /></span>
            Back to Curriculum
          </button>

          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>
            MODULE {selectedModule.id} • AUTHORED
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: '0 0 12px 0', color: '#fff' }}>
            {selectedModule.title}
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: '0 0 40px 0', maxWidth: 600, lineHeight: 1.5 }}>
            {selectedModule.description}
          </p>

          {/* 2-Column Layout */}
          <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
            {/* Left Column (Topics/Lessons) */}
            <div style={{ flex: '1 1 0%' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#888', marginBottom: 16, textTransform: 'uppercase' }}>
                LESSONS • {selectedModule.authored} AUTHORED OF {selectedModule.lessons} PLANNED
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedModule.topics.map((topic, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const guide = selectedModule.resources?.find(r => r.type === 'INTERACTIVE' || r.type === 'GUIDE' || r.type === 'DOCS');
                      if (guide && guide.url !== '#') {
                        const urlToOpen = (topic as any).anchor ? `${guide.url}${(topic as any).anchor}` : guide.url;
                        window.open(urlToOpen, '_blank');
                      }
                    }}
                    style={{
                      border: '1px solid #1f1f1f',
                      borderRadius: 12,
                      padding: '20px',
                      background: '#0a0a0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#333')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1f1f1f')}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, background: '#1c1c1c', border: '1px solid #2a2a2a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#e53e3e', fontSize: 11, fontWeight: 700, flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                        {topic.title}
                      </div>
                      <div style={{ fontSize: 13, color: '#666' }}>
                        {topic.subtitle || 'Learn the fundamentals'}
                      </div>
                    </div>
                    <div style={{ color: '#444' }}>
                      <ChevronRight />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (Labs & Resources) */}
            <div style={{ width: 340, flexShrink: 0 }}>
              {/* Labs */}
              {selectedModule.labs.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#888', marginBottom: 16, textTransform: 'uppercase' }}>
                    LAB EXERCISES
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedModule.labs.map((lab, idx) => (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid #1f1f1f',
                          borderRadius: 8,
                          padding: '16px',
                          background: '#0a0a0b',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: '#e53e3e', marginTop: 2 }}>⬡</span>
                          {lab}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#888', marginBottom: 16, textTransform: 'uppercase' }}>
                OPEN RESOURCES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedModule.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      border: '1px solid #1f1f1f',
                      borderRadius: 8,
                      padding: '16px',
                      background: '#0a0a0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#333')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1f1f1f')}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                        {res.title}
                      </div>
                      <div style={{ fontSize: 10, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {res.type}
                      </div>
                    </div>
                    <div style={{ color: '#444' }}>
                      <ArrowUpRight />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview Grid
  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '40px 60px', color: '#fff', boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>
          KNOWLEDGE LIBRARY
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 600, margin: '0 0 12px 0', color: '#fff' }}>
          The full curriculum
        </h1>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 40px 0', maxWidth: 600 }}>
          17 modules • {MODULES.reduce((acc, m) => acc + m.lessons, 0)} planned lessons, sequenced for real DevOps workflows.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
        }}>
          {MODULES.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              style={{
                border: '1px solid #1f1f1f',
                borderRadius: 12,
                padding: '24px',
                background: '#0a0a0b',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#333')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1f1f1f')}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: '#1c1c1c', border: '1px solid #2a2a2a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#e53e3e', fontSize: 11, fontWeight: 700, flexShrink: 0
                }}>
                  {m.id}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                  {m.title}
                </h3>
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px 0', lineHeight: 1.5, flex: 1 }}>
                {m.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {m.isBookReferenced && (
                  <span style={{
                    background: '#1c1c1c', border: '1px solid #2a2a2a', color: '#aaa',
                    fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', padding: '4px 8px', borderRadius: 12
                  }}>
                    BOOK-REFERENCED
                  </span>
                )}
                <span style={{
                  background: '#1c1c1c', border: '1px solid #2a2a2a', color: '#aaa',
                  fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', padding: '4px 8px', borderRadius: 12
                }}>
                  AUTHORED
                </span>
                <span style={{
                  background: '#1c1c1c', border: '1px solid #2a2a2a', color: '#aaa',
                  fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', padding: '4px 8px', borderRadius: 12
                }}>
                  {m.lessons} LESSONS
                </span>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', marginBottom: 6 }}>
                  <span>{m.authored} authored</span>
                  <span>{m.authored}/{m.lessons}</span>
                </div>
                <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(m.authored / m.lessons) * 100}%`, height: '100%', background: '#e53e3e' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
