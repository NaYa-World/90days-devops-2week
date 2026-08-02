/**
 * LearningSystemView — Interactive node-graph learning map with all 17 curriculum modules.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface NodeDef {
  id: number;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  lessons: number;
  deps: number[];
  topics: string[];
  labs: string[];
}

interface TrackerState {
  currentTopicIndex: number;
  completedTopics: number[];
}

const ROW1_Y = 60;
const ROW2_Y = 220;
const COL_W  = 210;
const NODE_W = 175;
const NODE_H = 74;

const NODES: NodeDef[] = [
  {
    id: 0, label: 'Linux Commands', sublabel: 'Module 01', deps: [],
    x: COL_W * 0, y: ROW1_Y, lessons: 13,
    topics: ['What is Linux','File system structure','File & directory commands','Permissions & ownership','User management','Process management','Networking commands','Text processing','SSH access','Package management','Environment variables','Cron jobs','Disk management (LVM, fdisk, mount)'],
    labs: ['Lab A','Lab B'],
  },
  {
    id: 1, label: 'Git', sublabel: 'Module 02', deps: [0],
    x: COL_W * 1, y: ROW2_Y, lessons: 11,
    topics: ['Version Control & Git','Git installation & configuration','Staging & commits (git add, commit, status, log)','Branching (create, switch, delete, merge)','Stashing (git stash, pop, list, drop)','Remote workflows (git remote, fetch, pull, push)','Rebase vs Merge','Cherry pick','Reverting & resetting','Tags','.gitignore'],
    labs: [],
  },
  {
    id: 2, label: 'GitHub / SCM', sublabel: 'Module 03', deps: [1],
    x: COL_W * 2, y: ROW1_Y, lessons: 9,
    topics: ['GitHub vs GitLab vs Bitbucket','Creating & managing repositories','Branching strategy (Git Flow)','Pull requests & code review','Branch protection rules','GitHub Webhooks','Enterprise security','GitHub Actions basics (triggers, workflows, jobs, steps)'],
    labs: ['Lab A','Lab B','Lab C'],
  },
  {
    id: 3, label: 'Jenkins', sublabel: 'Module 04', deps: [2],
    x: COL_W * 3, y: ROW2_Y, lessons: 8,
    topics: ['CI/CD Fundamentals','Jenkins Installation on AWS EC2','Jenkins Architecture (Master/Agent)','Essential Plugins','Declarative Pipeline (Jenkinsfile)','GitHub Integration','Shared Libraries (vars/, src/, structure)','P1 Incident Simulation'],
    labs: ['Lab A: Install Jenkins on EC2, configure plugins','Lab B: Connect GitHub repo with Jenkinsfile','Lab C: Trigger pipeline on code push','Lab D: Simulate P1 incident and rollback'],
  },
  {
    id: 4, label: 'Maven', sublabel: 'Module 05', deps: [3],
    x: COL_W * 4, y: ROW1_Y, lessons: 7,
    topics: ['Maven vs Gradle','Maven Installation & Setup','Understanding pom.xml','Maven Build Lifecycle','Dependencies Management','Build Profiles','Jenkins–Maven Integration'],
    labs: ['Lab A: Clone Java Spring Boot project, run mvn clean package','Lab B: Add dependencies to pom.xml','Lab C: Integrate Maven into Jenkins pipeline','Lab D: Create Dev/Prod profiles'],
  },
  {
    id: 5, label: 'SonarCloud', sublabel: 'Module 06', deps: [4],
    x: COL_W * 5, y: ROW2_Y, lessons: 6,
    topics: ['Static Code Analysis','SonarCloud account setup & project creation','Project & Token Management','Jenkins Integration','Quality Gates & Tollgates','Rules & Profiles Management'],
    labs: ['Lab A: Create SonarCloud account, connect GitHub repo','Lab B: Run analysis on Java project','Lab C: Configure Quality Gate to block on 0% coverage','Lab D: Fix issues to pass Quality Gate'],
  },
  {
    id: 6, label: 'Artifact Repo', sublabel: 'Module 07', deps: [5],
    x: COL_W * 6, y: ROW1_Y, lessons: 6,
    topics: ['Artifact Repository Concept','GitHub Packages setup','Repository Types (Local/Remote/Virtual)','Jenkins–GitHub Packages Integration','Docker Images in GitHub Packages','Artifact Promotion & Rollback'],
    labs: [],
  },
  {
    id: 7, label: 'Docker', sublabel: 'Module 08', deps: [6],
    x: COL_W * 7, y: ROW2_Y, lessons: 9,
    topics: ['VMs vs Containers','Docker Architecture','Docker Installation','Core Docker Commands','Writing Dockerfiles','Multi-Stage Builds','Docker Compose','Docker Networking (bridge, host, overlay, none)','AWS ECR Integration'],
    labs: ['Lab A: Install Docker on EC2, run nginx container','Lab B: Write Dockerfile for Java Spring Boot app','Lab C: Build multi-stage Docker image','Lab D: Push image to AWS ECR'],
  },
  {
    id: 8, label: 'Trivy', sublabel: 'Module 09', deps: [7],
    x: COL_W * 8, y: ROW1_Y, lessons: 6,
    topics: ['CVE & Vulnerability Scanning','Trivy Installation','Running Trivy Scans','Understanding Vulnerability Reports','Jenkins–Trivy Integration','P1 Scenario: Security Issues'],
    labs: ['Lab A: Install Trivy on EC2','Lab B: Scan public Docker image','Lab C: Scan payment-service image','Lab D: Fix highest severity vulnerability'],
  },
  {
    id: 9, label: 'Kubernetes', sublabel: 'Module 10', deps: [7, 8],
    x: COL_W * 9, y: ROW2_Y, lessons: 12,
    topics: ['K8s Architecture','Core Objects: Pods, Deployments, Services','ConfigMaps & Secrets','Namespaces (Dev/Test/Prod)','kubectl Commands','YAML Configuration','HPA (Horizontal Pod Autoscaler)','RBAC','Helm (charts, values.yaml, install/upgrade/rollback)','Network Policies (ingress/egress)','Setting up EKS','Rolling Updates & Rollbacks'],
    labs: ['Lab A: Create EKS cluster with eksctl','Lab B: Deploy payment-service to dev namespace','Lab C: Configure HPA and simulate load','Lab D: Deploy broken version and rollback','Lab E: Set up Ingress with AWS ALB'],
  },
  {
    id: 10, label: 'Splunk & Grafana', sublabel: 'Module 11', deps: [9],
    x: COL_W * 10, y: ROW1_Y, lessons: 7,
    topics: ['Grafana + Prometheus Setup','Metrics Collection','Dashboard Creation','Alerting Configuration','Splunk Log Management','SPL (Splunk Processing Language)','Real-time Incident Investigation'],
    labs: ['Lab A: Install Prometheus + Grafana on EKS using Helm','Lab B: Import Kubernetes cluster dashboard','Lab C: Create custom panel for payment-service HTTP errors','Lab D: Configure Slack alerts for CPU spikes'],
  },
  {
    id: 11, label: 'AWS Core Services', sublabel: 'Module 12', deps: [9],
    x: COL_W * 11, y: ROW2_Y, lessons: 8,
    topics: ['IAM (Users, Groups, Roles, Policies)','IAM Roles for EKS (IRSA)','VPC (CIDR, Subnets, Gateways)','Security Groups & NACLs','Route53 DNS','EKS Integration','CloudWatch (logs, metrics, alarms)','Real-World Architecture'],
    labs: ['Lab A: Create VPC with public/private subnets','Lab B: Create ALB, configure listener rules','Lab C: Deploy containerized app to ECS Fargate'],
  },
  {
    id: 12, label: 'Terraform', sublabel: 'Module 13', deps: [11],
    x: COL_W * 12, y: ROW1_Y, lessons: 10,
    topics: ['IaC concepts (why Terraform over manual provisioning)','Terraform installation & CLI basics','HCL syntax (providers, resources, variables, outputs)','Terraform state (local vs remote — S3 + DynamoDB locking)','Modules (writing reusable modules)','Workspaces (dev/staging/prod separation)','Terraform with AWS (EC2, VPC, S3, IAM)','Jenkins–Terraform integration (plan in PR, apply on merge)','Import existing infrastructure','Drift detection & remediation'],
    labs: ['Lab A: Write Terraform to provision EC2 + Security Group','Lab B: Create VPC with public/private subnets','Lab C: Store state in S3 with DynamoDB locking','Lab D: Write reusable module for EC2','Lab E: Integrate Terraform plan into Jenkins pipeline'],
  },
  {
    id: 13, label: 'Ansible', sublabel: 'Module 14', deps: [12],
    x: COL_W * 13, y: ROW2_Y, lessons: 9,
    topics: ['Configuration management concepts (push vs pull)','Ansible installation & architecture','Inventory files (static & dynamic)','Ad-hoc commands','Playbooks (tasks, handlers, variables, loops)','Roles (structure, defaults, tasks, templates)','Ansible Vault (encrypting secrets)','Jenkins–Ansible integration','Ansible for Docker & Kubernetes provisioning'],
    labs: ['Lab A: Install Ansible, configure SSH to EC2 nodes','Lab B: Write playbook to install Java + Jenkins on EC2','Lab C: Create role for application deployment','Lab D: Encrypt secrets with Ansible Vault','Lab E: Trigger Ansible playbook from Jenkins pipeline'],
  },
  {
    id: 14, label: 'AWS DevOps Services', sublabel: 'Module 15', deps: [13],
    x: COL_W * 14, y: ROW1_Y, lessons: 7,
    topics: ['AWS CodeCommit (Git hosting)','AWS CodeBuild (build server)','AWS CodeDeploy (rolling, blue/green, canary)','AWS CodePipeline (end-to-end orchestration)','AWS Elastic Beanstalk (PaaS deployments)','Parameter Store & Secrets Manager','End-to-end pipeline: CodePipeline + CodeBuild + CodeDeploy'],
    labs: ['Lab A: Create CodeBuild project for a Java app','Lab B: Configure CodeDeploy blue/green deployment','Lab C: Build full CodePipeline from source to deploy','Lab D: Pull secrets from Parameter Store inside pipeline'],
  },
  {
    id: 15, label: 'Incident Management', sublabel: 'Module 16', deps: [14],
    x: COL_W * 15, y: ROW2_Y, lessons: 8,
    topics: ['Incident lifecycle (detect → triage → mitigate → resolve → postmortem)','Severity classification (P1/P2/P3/P4 — definitions and SLAs)','Runbooks & playbooks (writing and maintaining them)','On-call practices (escalation chains, handoffs)','Blameless postmortems (structure, 5-whys, action items)','MTTR, MTTD, MTTF, availability SLAs (99.9% vs 99.99%)','Communication during incidents (status pages, stakeholder updates)','Tools: PagerDuty, OpsGenie (concepts), Slack war rooms'],
    labs: ['Lab A: Write a runbook for a Kubernetes pod crash scenario','Lab B: Simulate P1 — app down, trace through logs, rollback','Lab C: Write a blameless postmortem for Lab B incident','Lab D: Configure PagerDuty-style alert routing in Grafana'],
  },
  {
    id: 16, label: 'Cloud Cost Optimization', sublabel: 'Module 17', deps: [15],
    x: COL_W * 16, y: ROW1_Y, lessons: 7,
    topics: ['AWS pricing model (on-demand vs reserved vs spot)','EC2 right-sizing (CloudWatch metrics → instance type decisions)','Spot instances in CI/CD pipelines (Jenkins agents on spot)','S3 storage classes & lifecycle policies','Cost allocation tags & AWS Cost Explorer','EKS cost optimization (node groups, Fargate vs EC2)','Identifying waste (idle resources, oversized instances)'],
    labs: ['Lab A: Enable Cost Explorer, set billing alarm in CloudWatch','Lab B: Configure Jenkins agent on EC2 spot instance','Lab C: Add lifecycle policy to S3 bucket (move to Glacier after 90 days)','Lab D: Tag all Terraform-provisioned resources for cost tracking'],
  },
];

const EDGES: [number, number][] = NODES.flatMap((n) =>
  n.deps.map((dep) => [dep, n.id] as [number, number])
);

function bezierPath(from: NodeDef, to: NodeDef): string {
  const x1 = from.x + NODE_W;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_H / 2;
  const cp = Math.abs(x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + cp} ${y1} ${x2 - cp} ${y2} ${x2} ${y2}`;
}

function loadTrackerState(): TrackerState {
  try {
    const raw = localStorage.getItem('devops_tracker_v1');
    if (raw) {
      const s = JSON.parse(raw);
      return {
        currentTopicIndex: s.currentTopicIndex ?? 0,
        completedTopics:   Array.isArray(s.completedTopics) ? s.completedTopics : [],
      };
    }
  } catch { /* ignore */ }
  return { currentTopicIndex: 0, completedTopics: [] };
}

type NodeStatus = 'done' | 'active' | 'locked';

function getStatus(nodeId: number, ts: TrackerState): NodeStatus {
  if (ts.completedTopics.includes(nodeId)) return 'done';
  if (nodeId === ts.currentTopicIndex) return 'active';
  return 'locked';
}

function progressFraction(nodeId: number, ts: TrackerState, lessons: number): number {
  const st = getStatus(nodeId, ts);
  if (st === 'done')   return 1;
  if (st === 'active') return Math.max(0.15, (ts.currentTopicIndex - nodeId) / lessons);
  return 0;
}

const C = {
  bg:         '#0a0a0a',
  canvas:     '#0d0d0d',
  border:     '#1f1f1f',
  cardBg:     '#111111',
  cardBgDim:  '#16161a',
  active:     '#e53e3e',
  done:       '#22c55e',
  locked:     '#3f3f46',
  edgeNormal: '#252525',
  edgeDone:   '#374151',
  textPrimary:'#ffffff',
  textMuted:  '#8f9bb3',
  textDim:    '#71717a',
};

interface NodeCardProps {
  node:     NodeDef;
  status:   NodeStatus;
  progress: number;
  selected: boolean;
  onClick:  () => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, status, progress, selected, onClick }) => {
  const isActive  = status === 'active';
  const isDone    = status === 'done';
  const isLocked  = status === 'locked';
  const doneCount = Math.round(progress * node.lessons);
  const borderColor = isActive ? C.active : isDone ? C.done : selected ? '#4b5563' : C.border;
  const badgeBg = isActive ? C.active : isDone ? C.done : '#1c1c1c';
  const labelColor = isLocked ? C.textDim : C.textPrimary;

  return (
    <div
      className="node-card"
      onClick={onClick}
      style={{
        position:'absolute', left:node.x, top:node.y,
        width:NODE_W, height:NODE_H,
        background:isLocked ? C.cardBgDim : C.cardBg,
        border:`1.5px solid ${borderColor}`,
        borderRadius:8, padding:'8px 10px',
        cursor:isLocked ? 'not-allowed' : 'pointer',
        boxShadow:isActive ? '0 0 18px rgba(229,62,62,0.4)' : selected ? '0 0 12px rgba(255,255,255,0.05)' : 'none',
        transition:'box-shadow 0.2s, border-color 0.2s',
        animation:isActive ? 'node-glow 2s ease-in-out infinite' : 'none',
        userSelect:'none', display:'flex', flexDirection:'column', gap:4, boxSizing:'border-box',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ background:badgeBg, border:`1px solid ${isActive ? C.active : isDone ? C.done : '#2a2a2a'}`, color:isActive ? '#fff' : isDone ? '#fff' : C.textDim, fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:4, fontFamily:'JetBrains Mono, monospace', flexShrink:0, letterSpacing:'0.04em' }}>
          {node.sublabel}
        </div>
        <span style={{ fontSize:9, fontFamily:'JetBrains Mono, monospace', fontWeight:700, letterSpacing:'0.06em', color:isActive ? C.active : isDone ? C.done : C.textDim, textTransform:'uppercase' }}>
          {isDone ? 'DONE' : isActive ? 'ACTIVE' : 'LOCKED'}
        </span>
      </div>
      <div style={{ fontSize:12, fontWeight:600, color:labelColor, fontFamily:'JetBrains Mono, monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3 }}>
        {node.label}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
        <div style={{ flex:1, height:3, background:'#1a1a1a', borderRadius:2, overflow:'hidden' }}>
          <div style={{ width:`${progress * 100}%`, height:'100%', background:isActive ? C.active : isDone ? C.done : 'transparent', borderRadius:2, transition:'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize:9, fontFamily:'JetBrains Mono, monospace', color:isLocked ? C.textDim : C.textMuted, flexShrink:0 }}>
          {doneCount}/{node.lessons}
        </span>
      </div>
    </div>
  );
};

interface DetailPanelProps {
  node:    NodeDef;
  status:  NodeStatus;
  onClose: () => void;
  onNavigate: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ node, status, onClose, onNavigate }) => {
  const isLocked = status === 'locked';
  const isDone   = status === 'done';
  const isActive = status === 'active';
  const [tab, setTab] = useState<'topics' | 'labs'>('topics');

  return (
    <div style={{
      position:'absolute', top:12, right:12, width:300,
      maxHeight:'calc(100% - 24px)',
      background:'#111111',
      border:`1px solid ${isActive ? C.active : C.border}`,
      borderRadius:12, zIndex:100,
      boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
      fontFamily:'JetBrains Mono, monospace',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      <div style={{ padding:'16px 16px 12px', flexShrink:0, borderBottom:`1px solid ${C.border}` }}>
        <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'none', border:'none', color:C.textMuted, cursor:'pointer', fontSize:16, lineHeight:1 }}>×</button>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <div style={{ background:isActive ? C.active : isDone ? C.done : '#1c1c1c', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:'0.04em', padding:'2px 7px', borderRadius:4 }}>{node.sublabel}</div>
          <span style={{ fontSize:10, letterSpacing:'0.08em', color:isActive ? C.active : isDone ? C.done : C.textMuted, textTransform:'uppercase' }}>
            {isDone ? '✓ COMPLETED' : isActive ? '▶ IN PROGRESS' : '🔒 LOCKED'}
          </span>
        </div>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#fff', margin:'0 0 12px', lineHeight:1.3 }}>{node.label}</h3>
        <div style={{ display:'flex', gap:8 }}>
          {[['Topics', node.topics.length],['Labs', node.labs.length],['Lessons', node.lessons]].map(([k,v]) => (
            <div key={String(k)} style={{ flex:1, background:'#0d0d0d', border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px' }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{v}</div>
              <div style={{ fontSize:9, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.06em' }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        {(['topics','labs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', padding:'8px 0', fontSize:10, fontFamily:'JetBrains Mono, monospace', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700, color:tab===t ? '#fff' : C.textDim, borderBottom:tab===t ? `2px solid ${isActive ? C.active : C.done}` : '2px solid transparent', transition:'color 0.15s' }}>
            {t === 'topics' ? 'Topics Covered' : 'Lab Exercises'}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
        {tab === 'topics' && (
          <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:6 }}>
            {node.topics.map((t, i) => (
              <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:7, fontSize:11, color:isLocked ? C.textDim : C.textMuted, lineHeight:1.5 }}>
                <span style={{ color:isActive ? C.active : isDone ? C.done : C.locked, marginTop:3, flexShrink:0 }}>▸</span>
                {t}
              </li>
            ))}
          </ul>
        )}
        {tab === 'labs' && (
          node.labs.length > 0 ? (
            <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
              {node.labs.map((l, i) => (
                <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:11, color:isLocked ? C.textDim : C.textMuted, lineHeight:1.5 }}>
                  <span style={{ background:isActive ? 'rgba(229,62,62,0.15)' : isDone ? 'rgba(34,197,94,0.15)' : '#1a1a1a', color:isActive ? C.active : isDone ? C.done : C.textDim, border:`1px solid ${isActive ? C.active : isDone ? C.done : C.border}`, borderRadius:4, padding:'1px 5px', fontSize:9, fontWeight:700, flexShrink:0 }}>LAB</span>
                  {l}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize:11, color:C.textDim, textAlign:'center', padding:'20px 0' }}>No lab exercises for this module.</div>
          )
        )}
      </div>

      <div style={{ padding:'12px 16px', flexShrink:0, borderTop:`1px solid ${C.border}` }}>
        {!isLocked ? (
          <button onClick={onNavigate} style={{ width:'100%', padding:'9px 0', background:isActive ? C.active : '#1a3a2a', border:`1px solid ${isActive ? C.active : C.done}`, borderRadius:8, color:'#fff', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', fontFamily:'JetBrains Mono, monospace' }}>
            {isDone ? '↩ REVIEW MODULE' : '▶ CONTINUE'}
          </button>
        ) : (
          <div style={{ fontSize:10, color:C.textDim, textAlign:'center', padding:'6px 0' }}>Complete prerequisites to unlock</div>
        )}
      </div>
    </div>
  );
};

export const LearningSystemView: React.FC<{ switchView?: (v: string) => void }> = ({ switchView }) => {
  const [ts, setTs]                 = useState<TrackerState>(loadTrackerState);
  const [pan, setPan]               = useState({ x: 40, y: 80 });
  const [zoom, setZoom]             = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTs(loadTrackerState()); }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-card')) return;
    setIsDragging(true);
    setDragOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.preventDefault();
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragOrigin.x, y: e.clientY - dragOrigin.y });
  }, [isDragging, dragOrigin]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  const zoomIn    = () => setZoom((z) => Math.min(2.5, z * 1.2));
  const zoomOut   = () => setZoom((z) => Math.max(0.2, z / 1.2));
  const resetView = () => { setZoom(1.0); setPan({ x: 40, y: 80 }); };

  const CANVAS_W = COL_W * 17 + NODE_W + 40;
  const CANVAS_H = ROW2_Y + NODE_H + 60;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0, fontFamily:'JetBrains Mono, monospace' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 0 16px', flexShrink:0 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:'#fff', margin:0 }}>Learning System</h2>
        <span style={{ fontSize:11, color:C.textMuted, letterSpacing:'0.03em' }}>
          Click a module to open it · Drag canvas to pan · Use buttons to zoom
        </span>
      </div>

      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ flex:'1 1 0', minHeight:0, position:'relative', background:C.canvas, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', cursor:isDragging ? 'grabbing' : 'grab' }}
      >
        <div style={{ position:'absolute', top:0, left:0, width:CANVAS_W, height:CANVAS_H, transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin:'0 0', willChange:'transform' }}>
          <svg style={{ position:'absolute', top:0, left:0, overflow:'visible', pointerEvents:'none' }} width={CANVAS_W} height={CANVAS_H}>
            <style>{`
              @keyframes edge-flow { from { stroke-dashoffset: 10; } to { stroke-dashoffset: 0; } }
              @keyframes node-glow {
                0%   { box-shadow: 0 0 12px rgba(229,62,62,0.4); }
                50%  { box-shadow: 0 0 28px rgba(229,62,62,0.9); }
                100% { box-shadow: 0 0 12px rgba(229,62,62,0.4); }
              }
            `}</style>
            <defs>
              <marker id="arrow-normal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill={C.edgeDone} />
              </marker>
              <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill={C.active} />
              </marker>
            </defs>
            {EDGES.map(([fromId, toId]) => {
              const fromNode = NODES[fromId];
              const toNode   = NODES[toId];
              const fromDone   = ts.completedTopics.includes(fromId);
              const fromActive = fromId === ts.currentTopicIndex;
              const toActive   = toId === ts.currentTopicIndex;
              const isPathToCurrent = fromDone && toActive;
              const isPathToNext    = fromActive;
              const stroke = isPathToCurrent ? C.active : isPathToNext ? C.active : fromDone ? C.edgeDone : C.edgeNormal;
              const isSolid  = fromDone;
              const markerId = isPathToCurrent ? 'url(#arrow-active)' : fromDone ? 'url(#arrow-normal)' : '';
              return (
                <path key={`${fromId}-${toId}`} d={bezierPath(fromNode, toNode)} fill="none" stroke={stroke} strokeWidth={isSolid ? 1.5 : 1.2} strokeDasharray={isSolid ? 'none' : '4 6'} markerEnd={markerId} style={{ transition:'stroke 0.3s', animation:isPathToNext ? 'edge-flow 0.5s linear infinite' : 'none' }} />
              );
            })}
          </svg>

          {NODES.map((node) => {
            const status   = getStatus(node.id, ts);
            const progress = progressFraction(node.id, ts, node.lessons);
            return (
              <NodeCard key={node.id} node={node} status={status} progress={progress} selected={selectedId === node.id} onClick={() => setSelectedId(selectedId === node.id ? null : node.id)} />
            );
          })}
        </div>

        {selectedId !== null && (
          <DetailPanel node={NODES[selectedId]} status={getStatus(selectedId, ts)} onClose={() => setSelectedId(null)} onNavigate={() => { setSelectedId(null); switchView?.('tracker'); }} />
        )}

        <div style={{ position:'absolute', bottom:16, left:16, display:'flex', flexDirection:'column', gap:2, background:'#111111', border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
          {[{label:'+',action:zoomIn,title:'Zoom in'},{label:'⊙',action:resetView,title:'Reset view'},{label:'−',action:zoomOut,title:'Zoom out'}].map(({label,action,title}) => (
            <button key={label} onClick={action} title={title} style={{ width:32, height:32, background:'none', border:'none', borderBottom:`1px solid ${C.border}`, color:C.textMuted, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'color 0.15s, background 0.15s', fontFamily:'JetBrains Mono, monospace' }} onMouseEnter={(e) => { e.currentTarget.style.color='#fff'; e.currentTarget.style.background='#1a1a1a'; }} onMouseLeave={(e) => { e.currentTarget.style.color=C.textMuted; e.currentTarget.style.background='none'; }}>{label}</button>
          ))}
        </div>

        <div style={{ position:'absolute', bottom:16, left:60, fontSize:9, color:C.textDim, fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.05em' }}>
          {Math.round(zoom * 100)}%
        </div>

        <div style={{ position:'absolute', bottom:16, right:selectedId !== null ? 328 : 16, display:'flex', alignItems:'center', gap:14, fontSize:9, color:C.textDim, fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.05em', transition:'right 0.2s' }}>
          {[{color:C.done,label:'DONE'},{color:C.active,label:'ACTIVE'},{color:C.locked,label:'LOCKED'}].map(({color,label}) => (
            <span key={label} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ width:8, height:8, borderRadius:2, background:color, display:'inline-block' }} />
              {label}
            </span>
          ))}
        </div>

        <div style={{ position:'absolute', top:12, left:12, background:'rgba(10,10,10,0.85)', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 10px', fontSize:9, color:C.textMuted, fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:C.active, fontWeight:700 }}>{ts.completedTopics.length}</span>
          <span>/</span>
          <span>{NODES.length} MODULES</span>
          <span style={{ color:C.border }}>|</span>
          <span style={{ color:ts.completedTopics.length === NODES.length ? C.done : C.textMuted }}>
            {Math.round((ts.completedTopics.length / NODES.length) * 100)}% COMPLETE
          </span>
        </div>
      </div>
    </div>
  );
};

export default LearningSystemView;
