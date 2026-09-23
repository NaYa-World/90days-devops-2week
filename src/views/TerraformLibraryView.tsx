import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export const TerraformLibraryView: React.FC<{ switchView: (v: string) => void }> = ({ switchView }) => {
  const [guideHtml, setGuideHtml] = useState<string>('');

  useEffect(() => {
    // Fetch the raw HTML content from the public folder or src/data
    fetch('/src/data/guides/terraform-guide.html')
      .then(res => res.text())
      .then(html => setGuideHtml(html))
      .catch(err => console.error('Failed to load Terraform guide:', err));
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: '#0f1117' }}>
      
      {/* Top Navigation Bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '60px',
        background: '#151822', borderBottom: '1px solid #2d3748',
        display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 101
      }}>
        <button 
          onClick={() => switchView('dashboard')}
          style={{
            background: 'transparent', border: '1px solid #4fd1c5', color: '#4fd1c5',
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4fd1c5'; e.currentTarget.style.color = '#151822'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4fd1c5'; }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Guide Content iframe */}
      <div style={{ position: 'absolute', top: '60px', left: 0, right: 0, bottom: 0 }}>
        {guideHtml ? (
          <iframe 
            srcDoc={guideHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Terraform Guide"
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#a0aec0' }}>
            Loading Terraform Guide...
          </div>
        )}
      </div>

    </div>
  );
};
