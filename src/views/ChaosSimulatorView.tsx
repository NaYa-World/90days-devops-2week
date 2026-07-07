import React, { useState, useRef, useEffect } from 'react';
import { AIService } from '../components/AIService';
import { ApiKeySetupModal } from '../components/ApiKeySetupModal';

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
  const [retryCommand, setRetryCommand] = useState<string | null>(null);
  
  const endOfTerminalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);
  
  const handleStartScenario = () => {
    setHistory([
      { type: 'system', content: `Initializing scenario: ${scenarioId}...` },
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
    
    await executeCommand(cmd);
  };
  
  const executeCommand = async (cmd: string) => {
    try {
      const output = await AIService.simulateK8sCommand(cmd, scenarioId);
      
      setHistory(prev => [
        ...prev, 
        { type: output.toLowerCase().includes('error') ? 'error' : 'output', content: output }
      ]);
    } catch (err: any) {
      if (err.message === 'NO_API_KEY' || err.message?.includes('API key')) {
        setRetryCommand(cmd);
      } else {
        setHistory(prev => [...prev, { type: 'error', content: 'Simulator connection error. Please try again.' }]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#e8eaf0', display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 80px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <span style={{ fontSize: '28px', color: '#7c6fff' }}>☸️</span>
          Kubernetes Chaos Simulator
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600, background: '#ff5f5f22', color: '#ff5f5f', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ff5f5f44' }}>BETA</span>
        </h1>
      </div>
      
      <div style={{ background: '#111318', border: '1px solid #2a2d38', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '8px', color: '#e8eaf0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', color: '#f5a623' }}>⚠️</span> Active Incident
        </h3>
        <p style={{ color: '#7a7d8a', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
          You are the on-call engineer. PagerDuty just went off. A critical service in the cluster is failing. 
          Use the terminal below to diagnose the issue using standard <code>kubectl</code> commands. The cluster state is simulated via AI based on the scenario.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={scenarioId} 
            onChange={(e) => setScenarioId(e.target.value)}
            disabled={isProcessing}
            style={{ background: '#1a1d25', color: '#e8eaf0', border: '1px solid #3a3d4a', padding: '8px 12px', borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', outline: 'none' }}
          >
            {SCENARIOS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button 
            onClick={handleStartScenario} 
            disabled={isProcessing}
            style={{ background: '#1a1d25', color: '#e8eaf0', border: '1px solid #3a3d4a', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            🔄 Restart Scenario
          </button>
        </div>
      </div>
      
      <div style={{ background: '#0a0c10', border: '1px solid #2a2d38', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ background: '#111318', padding: '12px 16px', borderBottom: '1px solid #2a2d38', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7a7d8a' }}>
          <div style={{ display: 'flex', gap: '6px', marginRight: '12px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f5f' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f5a623' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4cde8a' }} />
          </div>
          kube-admin@cluster-ops
        </div>
        <div 
          onClick={() => document.getElementById('term-input')?.focus()}
          style={{ padding: '16px', flex: 1, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', lineHeight: '1.5', color: '#a0aabf' }}
        >
          {history.map((entry, idx) => (
            <div key={idx} style={{
              marginBottom: entry.type === 'command' ? '4px' : '12px',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
              color: entry.type === 'command' ? '#e8eaf0' : 
                     entry.type === 'error' ? '#ff5f5f' : 
                     entry.type === 'system' ? '#7c6fff' : '#a0aabf',
              fontStyle: entry.type === 'system' ? 'italic' : 'normal'
            }}>
              {entry.type === 'command' && <span style={{ color: '#2dd4a0', marginRight: '8px' }}>root@k8s:~$</span>}
              {entry.content}
            </div>
          ))}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ color: '#2dd4a0', marginRight: '8px' }}>root@k8s:~$</span>
            <input
              id="term-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing}
              autoComplete="off"
              spellCheck="false"
              autoFocus
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#e8eaf0', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', outline: 'none' }}
            />
          </form>
          {isProcessing && (
            <div style={{ color: '#7c6fff', fontStyle: 'italic', marginBottom: '12px' }}>Executing command in simulated cluster...</div>
          )}
          <div ref={endOfTerminalRef} />
        </div>
      </div>
      
      <ApiKeySetupModal 
        isOpen={!!retryCommand} 
        onClose={() => setRetryCommand(null)} 
        onSuccess={() => {
          const cmd = retryCommand;
          setRetryCommand(null);
          if (cmd) {
            setIsProcessing(true);
            executeCommand(cmd);
          }
        }} 
      />
    </div>
  );
};
