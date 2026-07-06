import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { AIService } from '../components/AIService';
import { Terminal, RefreshCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

const PageContainer = styled.div\`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  color: #e8eaf0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: calc(100vh - 80px);
\`;

const Header = styled.div\`
  display: flex;
  justify-content: space-between;
  align-items: center;
\`;

const Title = styled.h1\`
  font-family: 'Syne', sans-serif;
  font-size: 24px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    background: #ff5f5f22;
    color: #ff5f5f;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ff5f5f44;
  }
\`;

const ScenarioCard = styled.div\`
  background: #111318;
  border: 1px solid #2a2d38;
  border-radius: 12px;
  padding: 20px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 8px;
    color: #e8eaf0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  p {
    color: #7a7d8a;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
  }
  
  .scenario-actions {
    display: flex;
    gap: 12px;
  }
  
  select {
    background: #1a1d25;
    color: #e8eaf0;
    border: 1px solid #3a3d4a;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    outline: none;
    
    &:focus {
      border-color: #7c6fff;
    }
  }
  
  button {
    background: #1a1d25;
    color: #e8eaf0;
    border: 1px solid #3a3d4a;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    
    &:hover {
      background: #2a2d38;
    }
    
    &.primary {
      background: #7c6fff;
      border-color: #7c6fff;
      
      &:hover {
        background: #6a5eee;
      }
    }
  }
\`;

const TerminalContainer = styled.div\`
  background: #0a0c10;
  border: 1px solid #2a2d38;
  border-radius: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
\`;

const TerminalHeader = styled.div\`
  background: #111318;
  padding: 12px 16px;
  border-bottom: 1px solid #2a2d38;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #7a7d8a;
  
  .dots {
    display: flex;
    gap: 6px;
    margin-right: 12px;
    
    span {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #3a3d4a;
      
      &:nth-child(1) { background: #ff5f5f; }
      &:nth-child(2) { background: #f5a623; }
      &:nth-child(3) { background: #4cde8a; }
    }
  }
\`;

const TerminalBody = styled.div\`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #a0aabf;
\`;

const TerminalLine = styled.div\`
  margin-bottom: 4px;
  word-break: break-all;
  white-space: pre-wrap;
  
  &.command {
    color: #e8eaf0;
    .prompt {
      color: #2dd4a0;
      margin-right: 8px;
    }
  }
  
  &.output {
    color: #a0aabf;
    margin-bottom: 12px;
  }
  
  &.error {
    color: #ff5f5f;
    margin-bottom: 12px;
  }
  
  &.system {
    color: #7c6fff;
    font-style: italic;
    margin-bottom: 12px;
  }
\`;

const InputRow = styled.form\`
  display: flex;
  align-items: center;
  margin-top: 8px;
  
  .prompt {
    color: #2dd4a0;
    margin-right: 8px;
  }
  
  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e8eaf0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    outline: none;
  }
\`;

type HistoryEntry = {
  type: 'command' | 'output' | 'error' | 'system';
  content: string;
};

const SCENARIOS = [
  { id: 'OOMKilled', name: 'Scenario 1: The CrashLooping Pod' },
  { id: 'BrokenIngress', name: 'Scenario 2: The Missing Ingress' },
  { id: 'PendingPod', name: 'Scenario 3: The Pending Pod' },
];

export const ChaosSimulatorView: React.FC = () => {
  const [scenarioId, setScenarioId] = useState('OOMKilled');
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: 'system', content: 'Kubernetes Chaos Simulator Initialized.' },
    { type: 'system', content: 'Cluster connection established. You have cluster-admin privileges.' },
    { type: 'system', content: 'Type a kubectl command to investigate the issue. Example: kubectl get pods' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const endOfTerminalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);
  
  const handleStartScenario = () => {
    setHistory([
      { type: 'system', content: \`Initializing scenario: \${scenarioId}...\` },
      { type: 'system', content: 'Alert received: An issue has been detected in the cluster.' },
      { type: 'system', content: 'Use kubectl to diagnose the problem.' }
    ]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const cmd = input.trim();
    setInput('');
    setHistory(prev => [...prev, { type: 'command', content: cmd }]);
    
    if (cmd === 'clear') {
      setHistory([]);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const output = await AIService.simulateK8sCommand(cmd, scenarioId);
      
      setHistory(prev => [
        ...prev, 
        { type: output.toLowerCase().includes('error') ? 'error' : 'output', content: output }
      ]);
    } catch (err) {
      setHistory(prev => [...prev, { type: 'error', content: 'Simulator connection error. Please try again.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>
          <Terminal size={28} color="#7c6fff" />
          Kubernetes Chaos Simulator
          <span className="badge">BETA</span>
        </Title>
      </Header>
      
      <ScenarioCard>
        <h3><AlertTriangle size={18} color="#f5a623" /> Active Incident</h3>
        <p>
          You are the on-call engineer. PagerDuty just went off. A critical service in the cluster is failing. 
          Use the terminal below to diagnose the issue using standard <code>kubectl</code> commands. The cluster state is simulated via AI based on the scenario.
        </p>
        <div className="scenario-actions">
          <select 
            value={scenarioId} 
            onChange={(e) => setScenarioId(e.target.value)}
            disabled={isProcessing}
          >
            {SCENARIOS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button onClick={handleStartScenario} disabled={isProcessing}>
            <RefreshCcw size={14} /> Restart Scenario
          </button>
        </div>
      </ScenarioCard>
      
      <TerminalContainer>
        <TerminalHeader>
          <div className="dots">
            <span /><span /><span />
          </div>
          kube-admin@cluster-ops
        </TerminalHeader>
        <TerminalBody onClick={() => document.getElementById('term-input')?.focus()}>
          {history.map((entry, idx) => (
            <TerminalLine key={idx} className={entry.type}>
              {entry.type === 'command' && <span className="prompt">root@k8s:~$</span>}
              {entry.content}
            </TerminalLine>
          ))}
          
          <InputRow onSubmit={handleSubmit}>
            <span className="prompt">root@k8s:~$</span>
            <input
              id="term-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing}
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
          </InputRow>
          {isProcessing && (
            <TerminalLine className="system">Executing command in simulated cluster...</TerminalLine>
          )}
          <div ref={endOfTerminalRef} />
        </TerminalBody>
      </TerminalContainer>
    </PageContainer>
  );
};
