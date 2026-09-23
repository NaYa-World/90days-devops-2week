import React from 'react';
import terraformHtml from '../data/guides/terraform-guide.html?raw';

export const TerraformLibraryView: React.FC<{ switchView?: (v: string) => void }> = ({ switchView }) => {
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
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Terraform Knowledge Library</h2>
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
        <iframe 
          srcDoc={terraformHtml} 
          title="Terraform Guide" 
          style={{ width: '100%', height: '100%', border: 'none', background: '#0f1117' }} 
        />
      </div>
    </div>
  );
};
