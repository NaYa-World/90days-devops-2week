import React, { useState } from 'react';
import eksHtml from '../data/guides/eks-guide.html?raw';
import aksHtml from '../data/guides/aks-guide.html?raw';
import gkeHtml from '../data/guides/gke-guide.html?raw';
import localHtml from '../data/guides/local-k8s-guide.html?raw';
export const KubernetesLibraryView: React.FC<{ switchView?: (v: string) => void }> = ({ switchView }) => {
  const [activeTab, setActiveTab] = useState<'eks' | 'aks' | 'gke' | 'local'>('eks');

  const tabs = [
    { id: 'eks', label: 'EKS (AWS)' },
    { id: 'aks', label: 'AKS (Azure)' },
    { id: 'gke', label: 'GKE (Google)' },
    { id: 'local', label: 'Local K8s' },
  ];

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
          onClick={() => switchView?.('learning-system')}
          style={{ background: '#111111', border: '1px solid #1f1f1f', color: '#8f9bb3', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '20px', fontSize: '12px', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#111111'}
        >
          &larr; Back
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Kubernetes Knowledge Library</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '0 20px', borderBottom: '1px solid #1f1f1f', background: '#0a0a0a', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '14px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === t.id ? '#3b82f6' : '#8f9bb3',
              cursor: 'pointer',
              fontWeight: activeTab === t.id ? 'bold' : 'normal',
              fontSize: '14px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
        {activeTab === 'eks' && (
          <iframe srcDoc={eksHtml} title="EKS Guide" style={{ width: '100%', height: '100%', border: 'none', background: '#07090f' }} />
        )}
        {activeTab === 'aks' && (
          <iframe srcDoc={aksHtml} title="AKS Guide" style={{ width: '100%', height: '100%', border: 'none', background: '#07090f' }} />
        )}
        {activeTab === 'gke' && (
          <iframe srcDoc={gkeHtml} title="GKE Guide" style={{ width: '100%', height: '100%', border: 'none', background: '#07090f' }} />
        )}
        {activeTab === 'local' && (
          <iframe srcDoc={localHtml} title="Local K8s Guide" style={{ width: '100%', height: '100%', border: 'none', background: '#07090f' }} />
        )}
      </div>
    </div>
  );
};
