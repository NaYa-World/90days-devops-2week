import React, { useState } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { showToast } from '../components/Toast';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface FlowStep {
  id: string;
  title: string;
  role: string;
  type: 'terminal' | 'process' | 'decision' | 'database' | 'cloud' | 'capsule';
  color: string;
  x: number;
  y: number;
  explanation: string;
}

interface FlowConnection {
  from: string;
  to: string;
}

interface FlowData {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: FlowStep[];
  connections: FlowConnection[];
  overallExplanation: string;
}

interface DevOpsFlowsViewProps {
  appState: UseAppStateReturnType;
  switchView: (view: string) => void;
}

const FLOWS_DATABASE: FlowData[] = [
  {
    id: 'devops_structure',
    title: 'DevOps Lifecycle & Structure',
    icon: '🗺️',
    description: 'The overall working structure and loop of standard DevOps operations, bridging Planning and Monitoring.',
    overallExplanation: 'DevOps is not a single tool, but a continuous loop of collaboration, integration, deployment, and feedback. Here is the operational working lifecycle:',
    steps: [
      { id: '1', title: 'Plan & Collaborate', role: 'Jira / Slack / Notion', type: 'terminal', color: '#ff9f43', x: 50, y: 150, explanation: 'Teams align on requirements, define user stories, and track deliverables in backlogs.' },
      { id: '2', title: 'Write & Verify Code', role: 'VS Code / Git Branching', type: 'capsule', color: '#ffffff', x: 250, y: 150, explanation: 'Developers implement changes and commit code using version control systems like GitHub.' },
      { id: '3', title: 'CI Build & Run Tests', role: 'GitHub Actions / Jenkins', type: 'process', color: '#38bdf8', x: 450, y: 150, explanation: 'Continuous Integration compiles application packages and runs lint, unit, and integration tests.' },
      { id: '4', title: 'SonarQube Analysis', role: 'Quality Gate scan', type: 'decision', color: '#e040fb', x: 650, y: 150, explanation: 'Decides if the changes pass safety standards, checking for security bugs, coverage, and code smells.' },
      { id: '5', title: 'Deploy to Staging', role: 'Terraform / AWS ECS', type: 'cloud', color: '#4fa8ff', x: 850, y: 80, explanation: 'Automated staging environment deploy. Used for QA validation and user acceptance testing.' },
      { id: '6', title: 'Deploy to Production', role: 'ArgoCD GitOps / EKS', type: 'cloud', color: '#00d9a0', x: 850, y: 220, explanation: 'Gradual or blue-green rollout of containerized apps to live servers for general user access.' },
      { id: '7', title: 'Continuous Monitoring', role: 'Prometheus & Grafana', type: 'database', color: '#f05060', x: 1050, y: 150, explanation: 'Watches app availability, error rates, and CPU load. Incidents trigger feedback loops back to the Plan phase.' }
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' },
      { from: '4', to: '6' },
      { from: '5', to: '7' },
      { from: '6', to: '7' }
    ]
  },
  {
    id: 'cicd_pipeline',
    title: 'Automated CI/CD Pipeline',
    icon: '🚀',
    description: 'Continuous Integration & Continuous Deployment pipeline mapping changes directly from push to Kubernetes pods.',
    overallExplanation: 'A modern CI/CD pipeline ensures that manual production deployments are obsolete. Code moves dynamically through automated checkpoints.',
    steps: [
      { id: '1', title: 'git push origin main', role: 'Code Push', type: 'terminal', color: '#ffffff', x: 60, y: 150, explanation: 'Developer pushes tested code modification to GitHub, initiating webhook events.' },
      { id: '2', title: 'GitHub Actions Runner', role: 'Pipeline Trigger', type: 'process', color: '#ff9f43', x: 260, y: 150, explanation: 'Runner receives push events and runs containerized pipelines mapping tests and dependencies.' },
      { id: '3', title: 'Quality Gate Analysis', role: 'SonarQube / Security Scan', type: 'decision', color: '#e040fb', x: 460, y: 150, explanation: 'Checks for hardcoded keys, vulnerabilities, and validates that test coverage is greater than 80%.' },
      { id: '4', title: 'Docker Build & ECR Push', role: 'Registry Store', type: 'database', color: '#38bdf8', x: 660, y: 150, explanation: 'Builds application package into an immutable Docker image and registers it in Amazon ECR.' },
      { id: '5', title: 'ArgoCD Deployment sync', role: 'GitOps Controller', type: 'process', color: '#4fa8ff', x: 860, y: 150, explanation: 'ArgoCD scans the k8s repo, notices the new ECR image tag, and applies changes.' },
      { id: '6', title: 'K8s Pod Rollout', role: 'AWS EKS Deployment', type: 'cloud', color: '#00d9a0', x: 1060, y: 150, explanation: 'EKS spins up new pods, switches routing via target groups, and stops old containers.' }
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' },
      { from: '5', to: '6' }
    ]
  },
  {
    id: 'docker_flow',
    title: 'Docker Image & Container Flow',
    icon: '🐳',
    description: 'The lifecycle of Docker containerization: from writing Dockerfile layers to pulling and running containers.',
    overallExplanation: 'Docker separates the app from OS dependencies, creating package files that run identically across dev, test, and production hosts.',
    steps: [
      { id: '1', title: 'Write Dockerfile', role: 'Source Configuration', type: 'terminal', color: '#ffffff', x: 100, y: 150, explanation: 'Define the instructions (FROM node:18, COPY, RUN npm install, CMD) to containerize the app.' },
      { id: '2', title: 'docker build', role: 'Build Image Layers', type: 'process', color: '#38bdf8', x: 320, y: 150, explanation: 'Compiles the Dockerfile into a static, read-only Docker Image containing code and configuration files.' },
      { id: '3', title: 'docker push registry', role: 'Image Registry Store', type: 'database', color: '#ff9f43', x: 540, y: 150, explanation: 'Pushes the image tag to Docker Hub, Amazon ECR, or GitHub Container Registry (GHCR).' },
      { id: '4', title: 'docker pull on Host', role: 'Pull to Server Target', type: 'process', color: '#4fa8ff', x: 760, y: 150, explanation: 'The target server logs in to the registry and downloads the exact version-tagged image package.' },
      { id: '5', title: 'docker run -d -p 80:80', role: 'Running Container instance', type: 'cloud', color: '#00d9a0', x: 980, y: 150, explanation: 'Launches a live isolated container process of the image with mapped environment files and ports.' }
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' }
    ]
  },
  {
    id: 'k8s_workflow',
    title: 'Kubernetes Pod Deployment Flow',
    icon: '☸️',
    description: 'Step-by-step flow showing how K8s API server, etcd, Scheduler, and Kubelet launch containers inside pods.',
    overallExplanation: 'Kubernetes orchestrates multi-host container clusters. Manifest configurations are processed continuously by control controllers to reach the target state.',
    steps: [
      { id: '1', title: 'kubectl apply -f dep.yaml', role: 'Submit Manifest', type: 'terminal', color: '#ffffff', x: 60, y: 150, explanation: 'Developer sends declarative deployment configuration details via CLI to cluster.' },
      { id: '2', title: 'API Server & etcd Store', role: 'Control Gateway', type: 'process', color: '#ff9f43', x: 260, y: 150, explanation: 'API server validates manifest syntax and saves the desired state inside the etcd database.' },
      { id: '3', title: 'K8s Scheduler check', role: 'Node Allocator Decision', type: 'decision', color: '#e040fb', x: 460, y: 150, explanation: 'Locates nodes with available CPU/RAM, affinity rules, and schedules the Pod onto the target host.' },
      { id: '4', title: 'Kubelet Node Daemon', role: 'Worker Agent', type: 'process', color: '#4fa8ff', x: 660, y: 150, explanation: 'Agent running on selected Node detects scheduling, pulls manifests, and triggers pod creation.' },
      { id: '5', title: 'containerd engine', role: 'Container Runtime', type: 'database', color: '#38bdf8', x: 860, y: 150, explanation: 'Downloads docker/OCI images and creates host container namespaces and loop adapters.' },
      { id: '6', title: 'Active Pod & Service endpoint', role: 'Live Cluster Pod', type: 'cloud', color: '#00d9a0', x: 1060, y: 150, explanation: 'Pod is live, cluster proxy exposes it to LoadBalancer, and health monitors verify readiness.' }
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' },
      { from: '5', to: '6' }
    ]
  },
  {
    id: 'ansible_flow',
    title: 'Ansible Configuration Management',
    icon: '🛡️',
    description: 'Declarative configuration mapping across servers using playbooks, inventories, and agentless SSH connections.',
    overallExplanation: 'Ansible connects to server fleets via SSH, executing declarative tasks idempotently without requiring dedicated client software.',
    steps: [
      { id: '1', title: 'ansible-playbook site.yml', role: 'Playbook Execution', type: 'terminal', color: '#ffffff', x: 100, y: 150, explanation: 'User runs configuration playbook listing target tasks (e.g. create users, update configs).' },
      { id: '2', title: 'Inventory lookup (hosts.ini)', role: 'Node Registry', type: 'database', color: '#ff9f43', x: 320, y: 150, explanation: 'Locates target hosts IP list, variables, and private SSH key path associations.' },
      { id: '3', title: 'Agentless SSH Connect', role: 'Secure Connection', type: 'process', color: '#38bdf8', x: 540, y: 150, explanation: 'Ansible connects to multiple target servers in parallel over SSH port 22.' },
      { id: '4', title: 'Gather Facts module', role: 'Fact Discovery', type: 'process', color: '#e040fb', x: 760, y: 150, explanation: 'Queries CPU architecture, memory, host OS distributions, and networking facts.' },
      { id: '5', title: 'Idempotent Task Run', role: 'State Enforcement', type: 'cloud', color: '#00d9a0', x: 980, y: 150, explanation: 'Executes config commands ONLY if host state differs from playbook specification. Shows "Changed" or "OK".' }
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' }
    ]
  },
  {
    id: 'sonarqube_flow',
    title: 'SonarQube Code Review & Gate',
    icon: '📊',
    description: 'Integrating SonarQube scanner triggers in your CI loops to enforce Quality Gate rules, bugs, and security coverage.',
    overallExplanation: 'SonarQube acts as a automated gatekeeper, preventing faulty, untested, or unsecure code from merging into master branches.',
    steps: [
      { id: '1', title: 'Developer Pull Request', role: 'Code Integration Request', type: 'terminal', color: '#ffffff', x: 100, y: 150, explanation: 'Developer opens PR to merge code, starting the integration review pipeline.' },
      { id: '2', title: 'sonar-scanner trigger', role: 'Source File Scan', type: 'process', color: '#38bdf8', x: 320, y: 150, explanation: 'Build pipeline wraps scanner utility, parses directory files, and creates scan report.' },
      { id: '3', title: 'Submit to SonarQube Server', role: 'Metrics Engine analysis', type: 'database', color: '#ff9f43', x: 540, y: 150, explanation: 'Sends report zip to SonarQube. Server analyzes duplicates, bugs, security debt, and test coverage.' },
      { id: '4', title: 'Verify Quality Gate Rules', role: 'Enforce thresholds decision', type: 'decision', color: '#e040fb', x: 760, y: 150, explanation: 'Determines if PR code passes rules: 0 critical vulnerabilities, <3% duplicated blocks, >80% test coverage.' },
      { id: '5', title: 'PR Merge Allowed / Blocked', role: 'Gate Result loop', type: 'cloud', color: '#00d9a0', x: 980, y: 150, explanation: 'Reports status back to GitHub. Pass allows merging; Fail blocks build and requests edits.' }
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' }
    ]
  }
];

export const DevOpsFlowsView: React.FC<DevOpsFlowsViewProps> = ({ switchView }) => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>(FLOWS_DATABASE[0].id);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const activeFlow = FLOWS_DATABASE.find(f => f.id === selectedFlowId) || FLOWS_DATABASE[0];

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style }).catch(() => {});
    }
  };

  const handleFlowSelect = (id: string) => {
    triggerHaptic();
    setSelectedFlowId(id);
    setSelectedStepId(null);
  };

  // Convert flowchart to standard canvas diagram and load in diagram builder
  const handleEditInBuilder = () => {
    triggerHaptic(ImpactStyle.Medium);

    // Load saved diagrams list
    const saved = localStorage.getItem('devops90_saved_diagrams');
    let diagramsList = [];
    if (saved) {
      diagramsList = JSON.parse(saved);
    } else {
      diagramsList = [
        {
          id: 'default_cicd',
          name: 'My CI/CD Flow',
          nodes: activeFlow.steps.map(s => ({
            id: s.id,
            x: s.x,
            y: s.y,
            text: s.title,
            type: s.type,
            color: s.color
          })),
          connections: activeFlow.connections.map((c, idx) => ({
            id: `c_${idx}`,
            from: c.from,
            to: c.to
          })),
          createdAt: Date.now()
        }
      ];
    }

    // Prepare new custom diagram
    const newDiagId = `flow_${activeFlow.id}_${Date.now()}`;
    const newDiag = {
      id: newDiagId,
      name: `${activeFlow.title} (Editable)`,
      nodes: activeFlow.steps.map(s => ({
        id: s.id,
        x: s.x,
        y: s.y,
        text: s.title,
        type: s.type,
        color: s.color
      })),
      connections: activeFlow.connections.map((c, idx) => ({
        id: `c_${idx}`,
        from: c.from,
        to: c.to
      })),
      createdAt: Date.now()
    };

    // Save and switch
    const updatedDiagrams = [...diagramsList, newDiag];
    localStorage.setItem('devops90_saved_diagrams', JSON.stringify(updatedDiagrams));
    localStorage.setItem('devops90_active_diagram_id', newDiagId);

    showToast(`🛠️ Exported to Diagram Builder: ${newDiag.name}`);
    switchView('diagram');
  };

  const nodeWidth = 160;
  const nodeHeight = 70;

  // Calculation for connection edge points
  const getConnectionPoints = (from: FlowStep, to: FlowStep) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    let startX = from.x + nodeWidth / 2;
    let startY = from.y + nodeHeight / 2;
    let endX = to.x + nodeWidth / 2;
    let endY = to.y + nodeHeight / 2;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        startX = from.x + nodeWidth;
        endX = to.x;
      } else {
        startX = from.x;
        endX = to.x + nodeWidth;
      }
    } else {
      if (dy > 0) {
        startY = from.y + nodeHeight;
        endY = to.y;
      } else {
        startY = from.y;
        endY = to.y + nodeHeight;
      }
    }

    return { startX, startY, endX, endY };
  };

  const selectedStep = activeFlow.steps.find(s => s.id === selectedStepId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--nav-h))', background: 'var(--bg)', color: 'var(--text)', overflow: 'hidden' }}>
      {/* Stylesheet injector */}
      <style>{`
        .flow-grid-bg {
          background-color: #07070d;
          background-image: 
            radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0),
            radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0);
          background-size: 24px 24px, 120px 120px;
        }
        [data-theme="light"] .flow-grid-bg {
          background-color: var(--bg);
          background-image: 
            radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 0),
            radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0);
          background-size: 24px 24px, 120px 120px;
        }
        .pulse-line {
          stroke-dasharray: 6, 6;
          animation: flowPulse 1.8s linear infinite;
        }
        @keyframes flowPulse {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .flow-node {
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.5);
          cursor: pointer;
        }
        .flow-node:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.7);
          transform: translateY(-2px);
        }
        .flow-node.active-step {
          box-shadow: 0 0 15px var(--glow-col);
          border-color: #fff !important;
        }
        .topic-tab {
          padding: 10px 14px;
          font-size: 12.5px;
          border-radius: 8px;
          background: var(--s2);
          border: 1px solid var(--border);
          color: var(--text);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .topic-tab:hover {
          border-color: var(--muted);
          background: var(--s3);
        }
        .topic-tab.active {
          border-color: var(--green);
          background: rgba(0, 217, 160, 0.08);
          color: var(--green);
          font-weight: bold;
        }
      `}</style>

      {/* Topics Top Bar */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 18px', background: 'var(--s1)', borderBottom: '1px solid var(--border)', overflowX: 'auto', zIndex: 10, flexShrink: 0 }}>
        {FLOWS_DATABASE.map(f => (
          <button
            key={f.id}
            onClick={() => handleFlowSelect(f.id)}
            className={`topic-tab ${f.id === selectedFlowId ? 'active' : ''}`}
          >
            <span>{f.icon}</span>
            <span>{f.title}</span>
          </button>
        ))}
      </div>

      {/* Main content layout split */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* Canvas Display */}
        <div 
          className="flow-grid-bg"
          onClick={() => setSelectedStepId(null)}
          style={{ 
            flex: 1, 
            overflow: 'auto', 
            position: 'relative'
          }}
        >
          {/* SVG Connector Lines */}
          <svg 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '1250px', 
              height: '500px', 
              pointerEvents: 'none' 
            }}
          >
            <defs>
              <marker id="arrow-flow-glow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="context-stroke" />
              </marker>
            </defs>

            {activeFlow.connections.map((conn, idx) => {
              const fromStep = activeFlow.steps.find(s => s.id === conn.from);
              const toStep = activeFlow.steps.find(s => s.id === conn.to);
              if (!fromStep || !toStep) return null;

              const { startX, startY, endX, endY } = getConnectionPoints(fromStep, toStep);
              const cp1x = startX + (endX - startX) * 0.4;
              const cp1y = startY;
              const cp2x = startX + (endX - startX) * 0.6;
              const cp2y = endY;

              const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

              return (
                <g key={idx}>
                  <path 
                    d={pathD} 
                    stroke={toStep.color} 
                    strokeWidth="3" 
                    fill="none" 
                    opacity="0.25" 
                  />
                  <path 
                    className="pulse-line"
                    d={pathD} 
                    stroke={toStep.color} 
                    strokeWidth="2" 
                    fill="none" 
                    markerEnd="url(#arrow-flow-glow)"
                    opacity="0.85"
                  />
                </g>
              );
            })}
          </svg>

          {/* Render nodes */}
          {activeFlow.steps.map((step) => {
            const isActive = step.id === selectedStepId;
            let borderRadius = '8px';
            let borderStyle = 'solid';

            if (step.type === 'database') {
              borderRadius = '14px';
            } else if (step.type === 'cloud') {
              borderRadius = '24px';
            } else if (step.type === 'terminal') {
              borderRadius = '4px';
              borderStyle = 'dashed';
            } else if (step.type === 'capsule') {
              borderRadius = '9999px';
            }

            return (
              <div
                key={step.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStepId(step.id);
                  triggerHaptic();
                }}
                className={`flow-node ${isActive ? 'active-step' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${step.x}px`,
                  top: `${step.y}px`,
                  width: `${nodeWidth}px`,
                  height: `${nodeHeight}px`,
                  background: 'rgba(14, 14, 24, 0.9)',
                  border: `2.5px ${borderStyle} ${step.color}`,
                  borderRadius,
                  color: '#dde0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  fontSize: '11px',
                  fontWeight: 650,
                  textAlign: 'center',
                  userSelect: 'none',
                  zIndex: isActive ? 5 : 2,
                  ['--glow-col' as any]: step.color
                }}
              >
                {step.type === 'terminal' && <span style={{ marginRight: '4px', color: step.color }}>&gt;_</span>}
                {step.type === 'database' && <span style={{ marginRight: '4px' }}>🛢</span>}
                {step.type === 'cloud' && <span style={{ marginRight: '4px' }}>☁</span>}
                <span>{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Sidebar Info/Explanation Panel */}
        <div 
          style={{ 
            width: '320px', 
            background: 'var(--s1)', 
            borderLeft: '1px solid var(--border)', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '16px',
            gap: '16px',
            overflowY: 'auto',
            zIndex: 8,
            flexShrink: 0
          }}
        >
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 4px 0' }}>{activeFlow.title}</h3>
            <p style={{ fontSize: '11.5px', color: 'var(--sub)', margin: 0 }}>{activeFlow.description}</p>
          </div>

          <button 
            onClick={handleEditInBuilder}
            className="v4-btn-primary"
            style={{ width: '100%', padding: '8px', fontSize: '11.5px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}
          >
            🛠️ Open & Edit in Builder
          </button>

          <div style={{ height: '1px', background: 'var(--border)' }} />

          {selectedStep ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: selectedStep.color, fontWeight: 'bold', letterSpacing: '0.5px' }}>
                📍 Step {selectedStep.id}: {selectedStep.role}
              </span>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>{selectedStep.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--sub)', lineHeight: 1.5, margin: 0 }}>
                {selectedStep.explanation}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--green)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                📖 Operational Summary
              </span>
              <p style={{ fontSize: '12px', color: 'var(--sub)', lineHeight: 1.5, margin: 0 }}>
                {activeFlow.overallExplanation}
              </p>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic', marginTop: '10px', textAlign: 'center' }}>
                💡 Click on any node in the flowchart above to view details, tools, and roles for that step.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
