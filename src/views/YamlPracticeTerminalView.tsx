import React, { useState, useRef, useEffect } from 'react';
import * as yaml from 'js-yaml';
import { Terminal, CheckCircle, AlertTriangle, Play, FileCode2 } from 'lucide-react';

interface TerminalLine {
  type: 'prompt' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

export const YamlPracticeTerminalView: React.FC<{ switchView?: (v: string) => void }> = ({ switchView }) => {
  const [yamlInput, setYamlInput] = useState<string>('apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-app\nspec:\n  containers:\n  - name: web\n    image: nginx\n');
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: 'YAML Validation Terminal started. Ready for input.' },
    { type: 'info', text: 'Click "Validate & Apply" to check your YAML.' }
  ]);
  const endOfTerminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleValidate = () => {
    // 1. Clear previous run output, add prompt
    setLines(prev => [
      ...prev,
      { type: 'prompt', text: 'kubectl apply -f input.yaml' }
    ]);

    if (!yamlInput.trim()) {
      setLines(prev => [...prev, { type: 'error', text: 'error: no objects passed to apply' }]);
      return;
    }

    try {
      // 2. Parse YAML
      // We use loadAll in case there are multiple documents separated by ---
      const docs = yaml.loadAll(yamlInput);
      
      let hasError = false;

      // 3. Structural Validation
      docs.forEach((doc: any, index: number) => {
        if (!doc || typeof doc !== 'object') return; // Skip empty documents

        const missingFields = [];
        if (!doc.apiVersion) missingFields.push('apiVersion');
        if (!doc.kind) missingFields.push('kind');
        if (!doc.metadata) missingFields.push('metadata');
        
        // Some objects (like ConfigMap, Secret) don't strictly require a spec, but Pod/Deployment do.
        // We will just do a soft warning if spec is missing for certain kinds.
        const kindsRequiringSpec = ['Pod', 'Deployment', 'Service', 'StatefulSet', 'DaemonSet'];
        if (kindsRequiringSpec.includes(doc.kind) && !doc.spec) {
           missingFields.push('spec');
        }

        if (missingFields.length > 0) {
          hasError = true;
          setLines(prev => [...prev, { 
            type: 'error', 
            text: `error: error validating data: ValidationError(Document ${index + 1}): missing required field(s): ${missingFields.join(', ')}` 
          }]);
        }
      });

      if (!hasError) {
        // Build success message based on kinds
        const createdResources = docs
          .filter((d: any) => d && typeof d === 'object' && d.kind && d.metadata?.name)
          .map((d: any) => `${d.kind.toLowerCase()}/${d.metadata.name} created`);

        if (createdResources.length > 0) {
          createdResources.forEach((msg: string) => {
            setLines(prev => [...prev, { type: 'success', text: msg }]);
          });
        } else {
          setLines(prev => [...prev, { type: 'success', text: 'yaml parsed successfully (but no valid kubernetes resources found)' }]);
        }
      }

    } catch (e: any) {
      // Catch YAML Syntax Errors (e.g. indentation, bad characters)
      const errorLine = e.mark?.line !== undefined ? e.mark.line + 1 : 'unknown';
      const errorCol = e.mark?.column !== undefined ? e.mark.column + 1 : 'unknown';
      const reason = e.reason || e.message;
      
      setLines(prev => [
        ...prev, 
        { type: 'error', text: `error: error parsing YAML at line ${errorLine}, column ${errorCol}: ${reason}` }
      ]);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 200, display: 'flex', flexDirection: 'column',
      background: '#07090f', color: '#fff', fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#0d0d0d', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => switchView?.('dashboard')}
            style={{ background: '#111111', border: '1px solid #1f1f1f', color: '#8f9bb3', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '20px', fontSize: '13px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#111111'; e.currentTarget.style.color = '#8f9bb3'; }}
          >
            &larr; Back to Dashboard
          </button>
          <Terminal size={20} color="#00d2ff" style={{ marginRight: '10px' }} />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>YAML Practice Terminal</h2>
        </div>
        <button
          onClick={handleValidate}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}
        >
          <Play size={16} /> Validate & Apply
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left: Editor Pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1f1f1f' }}>
          <div style={{ padding: '12px 16px', background: '#0a0a0a', borderBottom: '1px solid #1f1f1f', fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <FileCode2 size={14} color="#60a5fa" /> Editor: deployment.yaml
          </div>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            spellCheck="false"
            style={{
              flex: 1, width: '100%', padding: '16px', background: '#111111', color: '#e2e8f0',
              border: 'none', outline: 'none', resize: 'none',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', lineHeight: 1.6
            }}
          />
        </div>

        {/* Right: Terminal Pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#050505' }}>
          <div style={{ padding: '12px 16px', background: '#0a0a0a', borderBottom: '1px solid #1f1f1f', fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Terminal size={14} color="#4ade80" /> Output Console
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: 1.6 }}>
            {lines.map((line, i) => (
              <div key={i} style={{ marginBottom: '6px' }}>
                {line.type === 'prompt' && (
                  <div><span style={{ color: '#4ade80', fontWeight: 'bold' }}>user@eks-cluster:~$</span> {line.text}</div>
                )}
                {line.type === 'output' && <div style={{ color: '#e2e8f0' }}>{line.text}</div>}
                {line.type === 'error' && (
                  <div style={{ color: '#f87171', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={14} style={{ marginTop: '3px', flexShrink: 0 }} />
                    <span>{line.text}</span>
                  </div>
                )}
                {line.type === 'success' && (
                  <div style={{ color: '#4ade80', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <CheckCircle size={14} style={{ marginTop: '3px', flexShrink: 0 }} />
                    <span>{line.text}</span>
                  </div>
                )}
                {line.type === 'info' && <div style={{ color: '#60a5fa' }}>{line.text}</div>}
              </div>
            ))}
            <div ref={endOfTerminalRef} />
          </div>
        </div>

      </div>
    </div>
  );
};
