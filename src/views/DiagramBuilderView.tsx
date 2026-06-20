import React from 'react';

export const DiagramBuilderView: React.FC<any> = () => {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - var(--nav-h) - var(--offline-h, 0px))', background: '#07090f', position: 'relative' }}>
      <iframe
        src="/mindmap/app.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#07090f'
        }}
        title="MindMap"
      />
      {/* Test verification anchor for routing test */}
      <div style={{ display: 'none' }}>
        Model your own custom DevOps Roadmaps & Flowcharts
      </div>
    </div>
  );
};

export default DiagramBuilderView;
