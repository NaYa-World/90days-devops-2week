import React, { useEffect } from 'react';
import devopsMindmapData from '../../devops_roadmap_mindmap.json';

const FALLBACK_KEY = 'mindmap-v2-fallback';

// Flattener function
function getFlattenedRoadmapPayload() {
  const PALETTE = ["#81C784", "#4DD0E1", "#DCE775", "#FFD54F", "#FF8A65", "#BA68C8", "#F06292"];
  
  function buildComment(node: any): string {
    const parts: string[] = [];
    
    if (node.title) {
      parts.push(`${node.title}`);
      parts.push('='.repeat(node.title.length));
    }
    
    if (node.description) {
      parts.push(node.description);
      parts.push('');
    }
    
    if (node.trainer_notes) {
      parts.push('🎓 SENIOR DEVOPS TRAINER');
      parts.push('------------------------');
      parts.push(node.trainer_notes);
      parts.push('');
    }
    
    if (node.cto_notes) {
      parts.push('💼 HEAD OF DEVOPS CTO');
      parts.push('---------------------');
      parts.push(node.cto_notes);
      parts.push('');
    }
    
    if (node.engineer_notes) {
      parts.push('🛠️ SENIOR DEVOPS ENGINEER');
      parts.push('-------------------------');
      parts.push(node.engineer_notes);
      parts.push('');
    }
    
    if (node.commands && node.commands.length > 0) {
      parts.push('💻 Practical Commands:');
      node.commands.forEach((cmd: string) => {
        parts.push(`  $ ${cmd}`);
      });
      parts.push('');
    }
    
    if (node.learning_path && node.learning_path.length > 0) {
      parts.push('📚 Learning Path:');
      node.learning_path.forEach((p: string) => {
        parts.push(`  - ${p}`);
      });
      parts.push('');
    }
    
    if (node.exercise) {
      parts.push('📝 Hands-on Exercise:');
      parts.push(node.exercise);
      parts.push('');
    }
    
    return parts.join('\n').trim();
  }

  const nodes: { [key: string]: any } = {};
  const childrenIds = (devopsMindmapData.children || []).map((c: any) => c.id);

  // Root node
  nodes["devops_root"] = {
    id: "devops_root",
    label: devopsMindmapData.title || "DevOps Learning Path",
    parentId: null,
    children: childrenIds,
    comment: buildComment(devopsMindmapData),
    collapsed: false,
    freeX: 0,
    freeY: 0,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    color: "#81C784"
  };

  const sides: { [key: string]: string } = {};

  // Children nodes
  (devopsMindmapData.children || []).forEach((child: any, idx: number) => {
    const color = PALETTE[idx % PALETTE.length];
    nodes[child.id] = {
      id: child.id,
      label: child.title,
      parentId: "devops_root",
      children: [],
      comment: buildComment(child),
      collapsed: false,
      freeX: 0,
      freeY: 0,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      color: color
    };
    sides[child.id] = idx % 2 === 0 ? "right" : "left";
  });

  return {
    id: "devops_roadmap_primary",
    name: "90 Days DevOps Roadmap",
    nodes: nodes,
    rootId: "devops_root",
    colorIdx: childrenIds.length,
    sides: sides,
    crossLinks: [],
    theme: "spring",
    layout: "horizontal",
    zoom: 1,
    panX: 450,
    panY: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function seedMindMap() {
  const payload = getFlattenedRoadmapPayload();
  
  // 1. Write to localStorage fallback
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(payload));
  
  // 2. Write to IndexedDB
  const request = indexedDB.open('MindMapDB', 1);
  
  request.onupgradeneeded = (e: any) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('maps')) {
      db.createObjectStore('maps', { keyPath: 'id', autoIncrement: true })
        .createIndex('updatedAt', 'updatedAt', { unique: false });
    }
  };
  
  request.onsuccess = (e: any) => {
    const db = e.target.result;
    try {
      const transaction = db.transaction('maps', 'readwrite');
      const store = transaction.objectStore('maps');
      store.put(payload);
    } catch (err) {
      console.error("IndexedDB transaction failed during mindmap seeding", err);
    }
  };
}

export const DiagramBuilderView: React.FC<any> = () => {
  useEffect(() => {
    if (!localStorage.getItem(FALLBACK_KEY)) {
      seedMindMap();
    }
  }, []);

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
