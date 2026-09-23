import React, { useMemo } from 'react';
import dockerCheatsheet from '../data/guides/docker-cheatsheet.html?raw';
import k8sCheatsheet from '../data/guides/k8s-cheatsheet.html?raw';
import monitoringCheatsheet from '../data/guides/monitoring-cheatsheet.html?raw';
import eksCheatsheet from '../data/guides/eks-cheatsheet.html?raw';

type CheatsheetTopic = 'docker' | 'k8s' | 'monitoring' | 'eks';

interface CheatsheetViewProps {
  topic: CheatsheetTopic;
  switchView?: (v: string) => void;
}

export const CheatsheetView: React.FC<CheatsheetViewProps> = ({ topic, switchView }) => {
  const { html, title } = useMemo(() => {
    switch (topic) {
      case 'docker':
        return { html: dockerCheatsheet, title: 'Docker Cheatsheet' };
      case 'k8s':
        return { html: k8sCheatsheet, title: 'Kubernetes Cheatsheet' };
      case 'monitoring':
        return { html: monitoringCheatsheet, title: 'Monitoring Cheatsheet' };
      case 'eks':
        return { html: eksCheatsheet, title: 'EKS Cheatsheet' };
      default:
        return { html: '', title: 'Cheatsheet' };
    }
  }, [topic]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      background: '#07090f',
      color: '#fff',
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1f1f1f', background: '#0d0d0d' }}>
        <button 
          onClick={() => switchView?.('dashboard')}
          style={{ background: '#111111', border: '1px solid #1f1f1f', color: '#8f9bb3', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '20px', fontSize: '12px', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#111111'}
        >
          &larr; Back to Dashboard
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{title}</h2>
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
        <iframe 
          srcDoc={html} 
          title={title} 
          style={{ width: '100%', height: '100%', border: 'none', background: '#07090f' }} 
        />
      </div>
    </div>
  );
};
