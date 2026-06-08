import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../components/Toast';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { UseAppStateReturnType } from '../hooks/useAppState';

// Interface Definitions
interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  type: 'process' | 'decision' | 'database' | 'cloud' | 'terminal' | 'capsule';
  color: string;
  parentId?: string;
  collapsed?: boolean;
  comment?: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

interface SavedDiagram {
  id: string;
  name: string;
  nodes: Node[];
  connections: Connection[];
  createdAt: number;
  themeName?: string;
  layoutMode?: string;
}

interface DiagramBuilderViewProps {
  appState: UseAppStateReturnType;
  theme: 'dark' | 'light';
}

// 17 Theme Presets matching the layout screenshots
interface ThemePreset {
  name: string;
  dark: boolean;
  canvasBg: string;
  gridColor: string;
  lineColor: string;
  rootBg: string;
  rootBorder: string;
  rootText: string;
  level1: string[];
  level2: string[];
}

const THEMES: ThemePreset[] = [
  {
    name: 'Bright Colors',
    dark: true,
    canvasBg: '#0f0f15',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    lineColor: '#2b3952',
    rootBg: '#1e1b4b',
    rootBorder: '#6366f1',
    rootText: '#ffffff',
    level1: ['#00d9a0', '#38bdf8', '#ff9f43', '#e040fb', '#f05060', '#ffc850'],
    level2: ['#0284c7', '#0d9488', '#d97706', '#c084fc', '#dc2626', '#eab308']
  },
  {
    name: 'Soft Colors',
    dark: true,
    canvasBg: '#131924',
    gridColor: 'rgba(255, 255, 255, 0.03)',
    lineColor: '#1e293b',
    rootBg: '#2a2238',
    rootBorder: '#c084fc',
    rootText: '#f5f3ff',
    level1: ['#f472b6', '#fb7185', '#38bdf8', '#34d399', '#fbbf24', '#a78bfa'],
    level2: ['#db2777', '#e11d48', '#0284c7', '#059669', '#d97706', '#7c3aed']
  },
  {
    name: 'Natural + Colors',
    dark: true,
    canvasBg: '#0b130e',
    gridColor: 'rgba(0, 217, 160, 0.03)',
    lineColor: '#14251c',
    rootBg: '#062f22',
    rootBorder: '#00d9a0',
    rootText: '#ecfdf5',
    level1: ['#10b981', '#22c55e', '#84cc16', '#06b6d4', '#0891b2', '#eab308'],
    level2: ['#047857', '#15803d', '#4d7c0f', '#0891b2', '#0369a1', '#a16207']
  },
  {
    name: 'Blue Steel',
    dark: true,
    canvasBg: '#0f172a',
    gridColor: 'rgba(56, 189, 248, 0.04)',
    lineColor: '#334155',
    rootBg: '#1e293b',
    rootBorder: '#38bdf8',
    rootText: '#f8fafc',
    level1: ['#38bdf8', '#0ea5e9', '#60a5fa', '#a5f3fc', '#0284c7', '#2563eb'],
    level2: ['#0369a1', '#02507d', '#1d4ed8', '#0891b2', '#1e3a8a', '#1e40af']
  },
  {
    name: 'Aqua Levels',
    dark: true,
    canvasBg: '#061622',
    gridColor: 'rgba(34, 211, 238, 0.03)',
    lineColor: '#0e3a54',
    rootBg: '#083344',
    rootBorder: '#22d3ee',
    rootText: '#ecfeff',
    level1: ['#22d3ee', '#06b6d4', '#14b8a6', '#2dd4bf', '#0891b2', '#0d9488'],
    level2: ['#0891b2', '#0e7490', '#0f766e', '#115e59', '#155e75', '#134e4a']
  },
  {
    name: 'Spring Levels',
    dark: true,
    canvasBg: '#121611',
    gridColor: 'rgba(163, 230, 53, 0.03)',
    lineColor: '#242f1f',
    rootBg: '#1e2c1a',
    rootBorder: '#a3e635',
    rootText: '#f7fee7',
    level1: ['#a3e635', '#4ade80', '#22c55e', '#fb7185', '#38bdf8', '#eab308'],
    level2: ['#65a30d', '#16a34a', '#15803d', '#be123c', '#0369a1', '#c27803']
  },
  {
    name: 'Compact Gray Scale',
    dark: true,
    canvasBg: '#16161a',
    gridColor: 'rgba(255, 255, 255, 0.02)',
    lineColor: '#27272a',
    rootBg: '#27272a',
    rootBorder: '#e4e4e7',
    rootText: '#fafafa',
    level1: ['#a1a1aa', '#d4d4d8', '#71717a', '#e4e4e7', '#f4f4f5', '#52525b'],
    level2: ['#52525b', '#3f3f46', '#27272a', '#18181b', '#09090b', '#71717a']
  },
  {
    name: 'Gray Scale',
    dark: true,
    canvasBg: '#09090b',
    gridColor: 'rgba(255, 255, 255, 0.02)',
    lineColor: '#18181b',
    rootBg: '#18181b',
    rootBorder: '#a1a1aa',
    rootText: '#f4f4f5',
    level1: ['#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7', '#52525b', '#3f3f46'],
    level2: ['#3f3f46', '#27272a', '#18181b', '#09090b', '#52525b', '#71717a']
  },
  {
    name: 'Natural + Gray Scale',
    dark: true,
    canvasBg: '#141816',
    gridColor: 'rgba(255, 255, 255, 0.02)',
    lineColor: '#242a27',
    rootBg: '#1b221e',
    rootBorder: '#a1a1aa',
    rootText: '#e4e4e7',
    level1: ['#22c55e', '#71717a', '#10b981', '#a1a1aa', '#84cc16', '#52525b'],
    level2: ['#15803d', '#3f3f46', '#047857', '#18181b', '#4d7c0f', '#27272a']
  },
  {
    name: 'Pastel Colors',
    dark: true,
    canvasBg: '#1b1222',
    gridColor: 'rgba(192, 132, 252, 0.03)',
    lineColor: '#2b1c36',
    rootBg: '#2d1e3d',
    rootBorder: '#c084fc',
    rootText: '#fae8ff',
    level1: ['#fbcfe8', '#fecdd3', '#c084fc', '#818cf8', '#a7f3d0', '#fde68a'],
    level2: ['#f472b6', '#fb7185', '#a78bfa', '#4f46e5', '#34d399', '#f59e0b']
  },
  {
    name: 'Golden Colors',
    dark: true,
    canvasBg: '#1a140f',
    gridColor: 'rgba(251, 191, 36, 0.03)',
    lineColor: '#302114',
    rootBg: '#2d1f10',
    rootBorder: '#fbbf24',
    rootText: '#fffbeb',
    level1: ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#eab308', '#ca8a04'],
    level2: ['#d97706', '#b45309', '#78350f', '#ca8a04', '#a16207', '#854d0e']
  },
  {
    name: 'Colored Circles',
    dark: true,
    canvasBg: '#1e2025',
    gridColor: 'rgba(255, 255, 255, 0.02)',
    lineColor: '#2e323b',
    rootBg: '#2a2d35',
    rootBorder: '#ffffff',
    rootText: '#ffffff',
    level1: ['#ff8a8a', '#ffb58a', '#ffd68a', '#d6ff8a', '#8affb5', '#8ad6ff'],
    level2: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4']
  },
  {
    name: 'Chart',
    dark: true,
    canvasBg: '#0f172a',
    gridColor: 'rgba(255, 255, 255, 0.02)',
    lineColor: '#1e293b',
    rootBg: '#1e293b',
    rootBorder: '#3b82f6',
    rootText: '#ffffff',
    level1: ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6'],
    level2: ['#1d4ed8', '#1d4ed8', '#1d4ed8', '#1d4ed8', '#1d4ed8', '#1d4ed8']
  },
  {
    name: 'Natural + Colors on Black',
    dark: true,
    canvasBg: '#000000',
    gridColor: 'rgba(255, 255, 255, 0.02)',
    lineColor: '#18181b',
    rootBg: '#111111',
    rootBorder: '#00d9a0',
    rootText: '#ffffff',
    level1: ['#00d9a0', '#38bdf8', '#ff9f43', '#e040fb', '#22c55e', '#eab308'],
    level2: ['#059669', '#0284c7', '#d97706', '#c084fc', '#16a34a', '#ca8a04']
  },
  {
    name: 'Colors on Black',
    dark: true,
    canvasBg: '#000000',
    gridColor: 'rgba(255, 255, 255, 0.01)',
    lineColor: '#1c1c1e',
    rootBg: '#1c1c1e',
    rootBorder: '#ffffff',
    rootText: '#ffffff',
    level1: ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#6366f1', '#3b82f6'],
    level2: ['#be123c', '#9d174d', '#86198f', '#6b21a8', '#3730a3', '#1d4ed8']
  },
  {
    name: 'Black and White',
    dark: false,
    canvasBg: '#ffffff',
    gridColor: 'rgba(0, 0, 0, 0.05)',
    lineColor: '#e2e8f0',
    rootBg: '#000000',
    rootBorder: '#000000',
    rootText: '#ffffff',
    level1: ['#000000', '#334155', '#475569', '#64748b', '#0f172a', '#1e293b'],
    level2: ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#334155', '#475569']
  },
  {
    name: 'Soft Colors Left-Right',
    dark: true,
    canvasBg: '#0f131a',
    gridColor: 'rgba(255, 255, 255, 0.02)',
    lineColor: '#1f2937',
    rootBg: '#1e293b',
    rootBorder: '#a78bfa',
    rootText: '#ffffff',
    level1: ['#ec4899', '#3b82f6', '#d946ef', '#06b6d4', '#f59e0b', '#10b981'],
    level2: ['#db2777', '#2563eb', '#c084fc', '#0891b2', '#d97706', '#059669']
  }
];

// Helper to check if node B is a descendant of node A
const isDescendant = (nodeAId: string, nodeBId: string, nodes: Node[]): boolean => {
  let curr = nodes.find(n => n.id === nodeBId);
  while (curr && curr.parentId) {
    if (curr.parentId === nodeAId) return true;
    curr = nodes.find(n => n.id === curr.parentId);
  }
  return false;
};

// Tree node interface for layout calculations
interface TreeNode {
  id: string;
  node: Node;
  children: TreeNode[];
}

const buildTree = (allNodes: Node[]): TreeNode[] => {
  const nodeMap = new Map<string, TreeNode>();
  allNodes.forEach(node => {
    nodeMap.set(node.id, { id: node.id, node, children: [] });
  });

  const roots: TreeNode[] = [];
  allNodes.forEach(node => {
    const treeNode = nodeMap.get(node.id)!;
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  });

  return roots;
};

// Auto mapping helper for flowchart layouts
const mapFlowchartToTree = (nodes: Node[], connections: Connection[]): Node[] => {
  return nodes.map(node => {
    // If parentId already exists, preserve it
    if (node.parentId) return node;
    // Otherwise find the first connection pointing to this node
    const conn = connections.find(c => c.to === node.id);
    return {
      ...node,
      parentId: conn ? conn.from : undefined
    };
  });
};

export const DiagramBuilderView: React.FC<DiagramBuilderViewProps> = ({ theme }) => {
  // --- States ---
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>(() => {
    const saved = localStorage.getItem('devops90_saved_diagrams');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'default_cicd',
        name: 'My DevOps Mind Map',
        themeName: 'Bright Colors',
        layoutMode: 'From Parent (Horizontal Layout)',
        nodes: [
          { id: 'root', x: 800, y: 400, text: 'DevOps Core', type: 'capsule', color: '#6366f1' },
          { id: '1', parentId: 'root', x: 1040, y: 250, text: 'CI/CD (Actions, Git)', type: 'capsule', color: '#00d9a0' },
          { id: '1-1', parentId: '1', x: 1280, y: 200, text: 'pushcode', type: 'capsule', color: '#00d9a0', comment: 'pushing coding to git' },
          { id: '1-1-1', parentId: '1-1', x: 1520, y: 200, text: 'commands', type: 'capsule', color: '#ff9f43' },
          { id: '1-2', parentId: '1', x: 1280, y: 300, text: 'gid', type: 'capsule', color: '#00d9a0' },
          { id: '2', parentId: 'root', x: 560, y: 250, text: 'IaC (Terraform)', type: 'capsule', color: '#38bdf8' },
          { id: '3', parentId: 'root', x: 1040, y: 550, text: 'Cloud (AWS, GCP)', type: 'capsule', color: '#ff9f43' },
          { id: '4', parentId: 'root', x: 560, y: 550, text: 'Containers (K8s)', type: 'capsule', color: '#e040fb' },
        ],
        connections: [
          { id: 'c1', from: 'root', to: '1' },
          { id: 'c1-1', from: '1', to: '1-1' },
          { id: 'c1-1-1', from: '1-1', to: '1-1-1' },
          { id: 'c1-2', from: '1', to: '1-2' },
          { id: 'c2', from: 'root', to: '2' },
          { id: 'c3', from: 'root', to: '3' },
          { id: 'c4', from: 'root', to: '4' },
        ],
        createdAt: Date.now()
      }
    ];
  });

  const [activeDiagramId, setActiveDiagramId] = useState<string>(() => {
    const savedActive = localStorage.getItem('devops90_active_diagram_id');
    return savedActive || diagrams[0]?.id || 'default_cicd';
  });

  const activeDiagram = diagrams.find(d => d.id === activeDiagramId) || diagrams[0];

  const [nodes, setNodes] = useState<Node[]>(() => {
    return activeDiagram.nodes;
  });
  const [connections, setConnections] = useState<Connection[]>(() => {
    return activeDiagram.connections;
  });

  const [activeThemeName, setActiveThemeName] = useState<string>(() => {
    return activeDiagram.themeName || 'Bright Colors';
  });
  const [layoutMode, setLayoutMode] = useState<string>(() => {
    return activeDiagram.layoutMode || 'From Parent (Horizontal Layout)';
  });

  const activeTheme = THEMES.find(t => t.name === activeThemeName) || THEMES[0];

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Comment popover states
  const [activeCommentNodeId, setActiveCommentNodeId] = useState<string | null>(null);
  const [commentInputText, setCommentInputText] = useState('');

  // Canvas Viewport Panning & Zooming
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // History Undo/Redo stack
  const [history, setHistory] = useState<Array<{ nodes: Node[]; connections: Connection[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Layout & Tool Modals
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth > 768);
  const [showHelp, setShowHelp] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync to active diagram switch
  useEffect(() => {
    const target = diagrams.find(d => d.id === activeDiagramId) || diagrams[0];
    if (target) {
      setNodes(target.nodes);
      setConnections(target.connections);
      setActiveThemeName(target.themeName || 'Bright Colors');
      setLayoutMode(target.layoutMode || 'From Parent (Horizontal Layout)');
      setSelectedNodeId(null);
      setHistory([{ nodes: target.nodes, connections: target.connections }]);
      setHistoryIndex(0);
    }
  }, [activeDiagramId]);

  // Keep localStorage updated
  useEffect(() => {
    localStorage.setItem('devops90_active_diagram_id', activeDiagramId);
  }, [activeDiagramId]);

  const saveActiveState = (updatedNodes: Node[], updatedConnections: Connection[], themeName = activeThemeName, layout = layoutMode) => {
    setDiagrams(prev => {
      const updated = prev.map(d =>
        d.id === activeDiagramId ? { ...d, nodes: updatedNodes, connections: updatedConnections, themeName, layoutMode: layout } : d
      );
      localStorage.setItem('devops90_saved_diagrams', JSON.stringify(updated));
      return updated;
    });
  };

  const pushHistory = (newNodes: Node[], newConnections: Connection[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, { nodes: newNodes, connections: newConnections }]);
    setHistoryIndex(nextHistory.length);
  };

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style }).catch(() => {});
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId || activeCommentNodeId) return; // ignore when typing in fields

      if (e.key === 'Tab') {
        e.preventDefault();
        if (selectedNodeId) handleAddChildNode(selectedNodeId);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedNodeId) handleAddSiblingNode(selectedNodeId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) handleDeleteNode(selectedNodeId);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, nodes, connections, editingNodeId, activeCommentNodeId, historyIndex, history]);

  // --- Depth Finder ---
  const getNodeDepth = (nodeId: string): number => {
    let depth = 0;
    let curr = nodes.find(n => n.id === nodeId);
    while (curr && curr.parentId) {
      depth++;
      curr = nodes.find(n => n.id === curr.parentId);
    }
    return depth;
  };

  // Traverses up to find the root node (Level 0) or Level 1 ancestor color
  const getNodeBranchColor = (nodeId: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return activeTheme.rootBorder;
    if (node.color && node.color !== '#6366f1') return node.color; // manual override

    // Find Level 1 ancestor
    let curr = node;
    let path: Node[] = [curr];
    while (curr && curr.parentId) {
      const parent = nodes.find(n => n.id === curr.parentId);
      if (parent) {
        path.push(parent);
        curr = parent;
      } else {
        break;
      }
    }

    // path is [node, parent, ..., root]
    const root = path[path.length - 1];
    if (path.length <= 1) {
      return activeTheme.rootBorder; // Root node color
    }

    const level1Node = path[path.length - 2];
    // Find index of level1Node among all level1 children of the root
    const rootChildren = nodes.filter(n => n.parentId === root.id);
    const idx = rootChildren.findIndex(n => n.id === level1Node.id);
    const colorIndex = idx >= 0 ? idx % activeTheme.level1.length : 0;

    return activeTheme.level1[colorIndex];
  };

  // --- Layout Calculations ---
  const applyLayout = (mode: string, currentNodes = nodes) => {
    triggerHaptic(ImpactStyle.Medium);
    const newNodes = currentNodes.map(n => ({ ...n }));
    const trees = buildTree(newNodes);

    if (trees.length === 0) return;

    if (mode === 'From Parent (Horizontal Layout)') {
      // Classic symmetric tree
      trees.forEach(root => {
        root.node.x = 800;
        root.node.y = 400;

        if (root.children.length === 0) return;

        // Split children left and right
        const leftChildren = root.children.filter((_, idx) => idx % 2 === 0);
        const rightChildren = root.children.filter((_, idx) => idx % 2 !== 0);

        const spacingX = 240;
        const spacingY = 110;

        // Right side layout
        const posRight = (treeNode: TreeNode, x: number, yOffset: number) => {
          treeNode.node.x = x;
          treeNode.node.y = yOffset;
          if (treeNode.node.collapsed || treeNode.children.length === 0) {
            return spacingY;
          }
          let height = 0;
          let currentY = yOffset - ((treeNode.children.length - 1) * spacingY) / 2;
          treeNode.children.forEach(child => {
            const childHeight = posRight(child, x + spacingX, currentY);
            currentY += childHeight;
            height += childHeight;
          });
          return height;
        };

        let rightStartY = 400 - ((rightChildren.length - 1) * spacingY) / 2;
        rightChildren.forEach((child) => {
          posRight(child, 800 + spacingX, rightStartY);
          rightStartY += spacingY;
        });

        // Left side layout
        const posLeft = (treeNode: TreeNode, x: number, yOffset: number) => {
          treeNode.node.x = x;
          treeNode.node.y = yOffset;
          if (treeNode.node.collapsed || treeNode.children.length === 0) {
            return spacingY;
          }
          let height = 0;
          let currentY = yOffset - ((treeNode.children.length - 1) * spacingY) / 2;
          treeNode.children.forEach(child => {
            const childHeight = posLeft(child, x - spacingX, currentY);
            currentY += childHeight;
            height += childHeight;
          });
          return height;
        };

        let leftStartY = 400 - ((leftChildren.length - 1) * spacingY) / 2;
        leftChildren.forEach((child) => {
          posLeft(child, 800 - spacingX, leftStartY);
          leftStartY += spacingY;
        });
      });
    } else if (mode === 'Horizontal Layout') {
      // Flow root node on the left, children expanding entirely to the right
      trees.forEach(root => {
        root.node.x = 400;
        root.node.y = 400;

        const spacingX = 240;
        const spacingY = 110;

        const posNode = (treeNode: TreeNode, x: number, yOffset: number) => {
          treeNode.node.x = x;
          treeNode.node.y = yOffset;
          if (treeNode.node.collapsed || treeNode.children.length === 0) {
            return spacingY;
          }
          let height = 0;
          let currentY = yOffset - ((treeNode.children.length - 1) * spacingY) / 2;
          treeNode.children.forEach(child => {
            const childHeight = posNode(child, x + spacingX, currentY);
            currentY += childHeight;
            height += childHeight;
          });
          return height;
        };

        let startY = 400 - ((root.children.length - 1) * spacingY) / 2;
        root.children.forEach(child => {
          posNode(child, 400 + spacingX, startY);
          startY += spacingY;
        });
      });
    } else if (mode === 'Vertical Layout' || mode === 'Top Down Layout') {
      // Vertical top-down layout
      trees.forEach(root => {
        root.node.x = 800;
        root.node.y = 150;

        const spacingX = 180;
        const spacingY = 140;

        const posNode = (treeNode: TreeNode, xOffset: number, y: number) => {
          treeNode.node.x = xOffset;
          treeNode.node.y = y;
          if (treeNode.node.collapsed || treeNode.children.length === 0) {
            return spacingX;
          }
          let width = 0;
          let currentX = xOffset - ((treeNode.children.length - 1) * spacingX) / 2;
          treeNode.children.forEach(child => {
            const childWidth = posNode(child, currentX, y + spacingY);
            currentX += childWidth;
            width += childWidth;
          });
          return width;
        };

        let startX = 800 - ((root.children.length - 1) * spacingX) / 2;
        root.children.forEach(child => {
          posNode(child, startX, 150 + spacingY);
          startX += spacingX;
        });
      });
    } else if (mode === 'List Layout') {
      // Indented Outline Tree
      let currentY = 150;
      const spacingX = 60;
      const spacingY = 75;

      const posNode = (treeNode: TreeNode, depth: number) => {
        treeNode.node.x = 200 + depth * spacingX;
        treeNode.node.y = currentY;
        currentY += spacingY;

        if (!treeNode.node.collapsed) {
          treeNode.children.forEach(child => {
            posNode(child, depth + 1);
          });
        }
      };

      trees.forEach(root => {
        posNode(root, 0);
        currentY += 40; // extra space between roots
      });
    } else if (mode === 'Linear Layout') {
      // Linear timeline structure
      let currentX = 200;
      trees.forEach(root => {
        root.node.x = currentX;
        root.node.y = 400;

        const posNode = (treeNode: TreeNode, x: number, y: number) => {
          treeNode.node.x = x;
          treeNode.node.y = y;
          if (treeNode.node.collapsed) return;
          treeNode.children.forEach((child, idx) => {
            posNode(child, x + 220, y + (idx - (treeNode.children.length - 1) / 2) * 110);
          });
        };
        posNode(root, currentX, 400);
        currentX += 600;
      });
    } else if (mode === 'Radial Layout') {
      // Concentric circles outwards
      trees.forEach(root => {
        root.node.x = 800;
        root.node.y = 400;

        const posNode = (treeNode: TreeNode, depth: number, startAngle: number, endAngle: number) => {
          if (treeNode.node.collapsed || treeNode.children.length === 0) return;
          const radius = depth * 180;
          const count = treeNode.children.length;
          const angleStep = (endAngle - startAngle) / count;

          treeNode.children.forEach((child, idx) => {
            const angle = startAngle + angleStep * (idx + 0.5);
            child.node.x = 800 + Math.cos(angle) * radius;
            child.node.y = 400 + Math.sin(angle) * radius;
            posNode(child, depth + 1, angle - angleStep / 2, angle + angleStep / 2);
          });
        };
        posNode(root, 1, 0, Math.PI * 2);
      });
    } else if (mode === 'Matrix Layout') {
      // Grid alignment
      trees.forEach(root => {
        root.node.x = 800;
        root.node.y = 200;

        const posNode = (treeNode: TreeNode, x: number, y: number, colWidth: number) => {
          treeNode.node.x = x;
          treeNode.node.y = y;
          if (treeNode.node.collapsed || treeNode.children.length === 0) return;

          const numCols = Math.min(3, treeNode.children.length);
          const childSpacingY = 120;
          const childSpacingX = colWidth;

          treeNode.children.forEach((child, idx) => {
            const col = idx % numCols;
            const row = Math.floor(idx / numCols);
            const cx = x + (col - (numCols - 1) / 2) * childSpacingX;
            const cy = y + 140 + row * childSpacingY;
            posNode(child, cx, cy, colWidth * 0.7);
          });
        };
        posNode(root, 800, 200, 260);
      });
    }

    setNodes(newNodes);
    saveActiveState(newNodes, connections, activeThemeName, mode);
    pushHistory(newNodes, connections);
  };

  // --- Interaction Handlers ---
  const handleUndo = () => {
    if (historyIndex > 0) {
      triggerHaptic();
      const prev = history[historyIndex - 1];
      setNodes(prev.nodes);
      setConnections(prev.connections);
      setHistoryIndex(historyIndex - 1);
      saveActiveState(prev.nodes, prev.connections);
      showToast('↩️ Undone last action');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      triggerHaptic();
      const next = history[historyIndex + 1];
      setNodes(next.nodes);
      setConnections(next.connections);
      setHistoryIndex(historyIndex + 1);
      saveActiveState(next.nodes, next.connections);
      showToast('🔁 Redone next action');
    }
  };

  // Add Child Node via toolbar or keyboard
  const handleAddChildNode = (parentId: string) => {
    triggerHaptic(ImpactStyle.Medium);
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    // Auto-calculate new location based on parent
    const childId = Date.now().toString();
    const isSymmetricLeft = layoutMode === 'From Parent (Horizontal Layout)' &&
      (nodes.filter(n => n.parentId === parentId).length % 2 === 0);

    const xOffset = isSymmetricLeft ? -240 : 240;
    const yOffset = (Math.random() - 0.5) * 80;

    const childBranchColor = getNodeBranchColor(parentId);
    const childNode: Node = {
      id: childId,
      parentId,
      x: parentNode.x + xOffset,
      y: parentNode.y + yOffset,
      text: 'New Child Topic',
      type: 'capsule',
      color: childBranchColor
    };

    const newNodes = [...nodes, childNode];
    const newConnections = [...connections, { id: `c-${parentId}-${childId}`, from: parentId, to: childId }];

    // Auto layout if list/horizontal to keep layout neat
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNodeId(childId);
    setEditingNodeId(childId);
    setEditingText('New Child Topic');

    // Run layout programmatically to position it beautifully
    if (layoutMode !== 'Free Form Layout') {
      setTimeout(() => applyLayout(layoutMode, newNodes), 50);
    } else {
      saveActiveState(newNodes, newConnections);
      pushHistory(newNodes, newConnections);
    }
    showToast('➕ Added child topic');
  };

  // Add Sibling Node
  const handleAddSiblingNode = (targetId: string) => {
    triggerHaptic(ImpactStyle.Medium);
    const targetNode = nodes.find(n => n.id === targetId);
    if (!targetNode) return;

    const siblingId = Date.now().toString();
    const siblingNode: Node = {
      id: siblingId,
      parentId: targetNode.parentId,
      x: targetNode.x,
      y: targetNode.y + 110,
      text: 'New Sibling Topic',
      type: 'capsule',
      color: targetNode.color || getNodeBranchColor(targetId)
    };

    const newNodes = [...nodes, siblingNode];
    let newConnections = [...connections];
    if (targetNode.parentId) {
      newConnections.push({ id: `c-${targetNode.parentId}-${siblingId}`, from: targetNode.parentId, to: siblingId });
    }

    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNodeId(siblingId);
    setEditingNodeId(siblingId);
    setEditingText('New Sibling Topic');

    if (layoutMode !== 'Free Form Layout') {
      setTimeout(() => applyLayout(layoutMode, newNodes), 50);
    } else {
      saveActiveState(newNodes, newConnections);
      pushHistory(newNodes, newConnections);
    }
    showToast('➕ Added sibling topic');
  };

  // Add Central Theme Node
  const handleAddCentralTheme = () => {
    triggerHaptic(ImpactStyle.Medium);
    const newId = Date.now().toString();
    const newRoot: Node = {
      id: newId,
      x: 800,
      y: 400,
      text: 'Central Theme',
      type: 'capsule',
      color: activeTheme.rootBorder
    };
    const newNodes = [...nodes, newRoot];
    setNodes(newNodes);
    setSelectedNodeId(newId);
    setEditingNodeId(newId);
    setEditingText('Central Theme');
    saveActiveState(newNodes, connections);
    pushHistory(newNodes, connections);
    showToast('➕ Created new central theme');
  };

  // Delete Node and its whole sub-tree recursively
  const handleDeleteNode = (nodeId: string) => {
    triggerHaptic(ImpactStyle.Medium);
    const toDelete = new Set<string>([nodeId]);

    // Recursive finder
    const findChildren = (pId: string) => {
      nodes.forEach(n => {
        if (n.parentId === pId) {
          toDelete.add(n.id);
          findChildren(n.id);
        }
      });
    };
    findChildren(nodeId);

    const newNodes = nodes.filter(n => !toDelete.has(n.id));
    const newConnections = connections.filter(c => !toDelete.has(c.from) && !toDelete.has(c.to));

    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNodeId(null);
    saveActiveState(newNodes, newConnections);
    pushHistory(newNodes, newConnections);
    showToast(`🗑️ Deleted node and ${toDelete.size - 1} subtopics`);
  };

  // Collapse/Expand toggles
  const handleToggleCollapse = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    triggerHaptic();
    const updated = nodes.map(n =>
      n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n
    );
    setNodes(updated);
    if (layoutMode !== 'Free Form Layout') {
      applyLayout(layoutMode, updated);
    } else {
      saveActiveState(updated, connections);
      pushHistory(updated, connections);
    }
  };

  // Comment logic
  const handleOpenCommentPopover = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setActiveCommentNodeId(nodeId);
      setCommentInputText(node.comment || '');
    }
  };

  const handleSaveComment = () => {
    if (activeCommentNodeId) {
      const updated = nodes.map(n =>
        n.id === activeCommentNodeId ? { ...n, comment: commentInputText.trim() || undefined } : n
      );
      setNodes(updated);
      saveActiveState(updated, connections);
      pushHistory(updated, connections);
      setActiveCommentNodeId(null);
      showToast('💬 Comment updated');
    }
  };

  // Node text inline edit
  const handleDoubleClickNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNodeId(nodeId);
      setEditingText(node.text);
    }
  };

  const handleSaveTextEdit = () => {
    if (editingNodeId) {
      const updated = nodes.map(n =>
        n.id === editingNodeId ? { ...n, text: editingText.trim() || 'Untitled node' } : n
      );
      setNodes(updated);
      saveActiveState(updated, connections);
      pushHistory(updated, connections);
      setEditingNodeId(null);
    }
  };

  // Switch Active Diagram
  const handleSwitchDiagram = (id: string) => {
    triggerHaptic();
    setActiveDiagramId(id);
  };

  // Create new Diagram File
  const handleCreateDiagram = () => {
    const name = window.prompt("Enter a name for the new diagram:", "Untitled Mindmap");
    if (!name || !name.trim()) return;
    triggerHaptic(ImpactStyle.Medium);

    const id = Date.now().toString();
    const newDiag: SavedDiagram = {
      id,
      name: name.trim(),
      themeName: 'Bright Colors',
      layoutMode: 'From Parent (Horizontal Layout)',
      nodes: [
        { id: '1', x: 800, y: 400, text: 'Central Idea', type: 'capsule', color: '#6366f1' }
      ],
      connections: [],
      createdAt: Date.now()
    };

    setDiagrams(prev => {
      const updated = [...prev, newDiag];
      localStorage.setItem('devops90_saved_diagrams', JSON.stringify(updated));
      return updated;
    });
    setActiveDiagramId(id);
    showToast(`➕ Created new mindmap: ${name}`);
  };

  // Rename Diagram
  const handleRenameDiagram = (newName: string) => {
    setDiagrams(prev => {
      const updated = prev.map(d =>
        d.id === activeDiagramId ? { ...d, name: newName } : d
      );
      localStorage.setItem('devops90_saved_diagrams', JSON.stringify(updated));
      return updated;
    });
  };

  // Delete Diagram
  const handleDeleteDiagram = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (diagrams.length <= 1) {
      showToast('⚠️ Cannot delete the only remaining diagram');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this diagram?')) return;
    triggerHaptic(ImpactStyle.Medium);

    const updated = diagrams.filter(d => d.id !== id);
    setDiagrams(updated);
    localStorage.setItem('devops90_saved_diagrams', JSON.stringify(updated));

    if (activeDiagramId === id) {
      setActiveDiagramId(updated[0].id);
    }
    showToast('🗑️ Diagram deleted');
  };

  // Canvas Dragging Panning handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only pan on background click, not node click
    if (e.target === canvasContainerRef.current || e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggedNodeId) {
      // Handle node dragging
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setNodes(prev => prev.map(node =>
        node.id === draggedNodeId ? { ...node, x: newX, y: newY } : node
      ));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (draggedNodeId) {
      setDraggedNodeId(null);
      saveActiveState(nodes, connections);
      pushHistory(nodes, connections);
    }
  };

  const handleStartNodeDrag = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDraggedNodeId(nodeId);
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y
      });
    }
  };

  // Zoom wheel logic via raw event listener to prevent browser page-zoom gestures
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheelRaw = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.05;
      setZoom(z => {
        if (e.deltaY < 0) {
          return Math.min(3, z * zoomFactor);
        } else {
          return Math.max(0.15, z / zoomFactor);
        }
      });
    };

    container.addEventListener('wheel', handleWheelRaw, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelRaw);
    };
  }, []);

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    showToast('🔎 Centered Viewport & Zoom reset');
  };

  // Preset Theme Loader
  const handleSelectTheme = (themeName: string) => {
    triggerHaptic();
    setActiveThemeName(themeName);
    const selectedPreset = THEMES.find(t => t.name === themeName) || THEMES[0];

    // Color code nodes by depth automatically
    const updatedNodes = nodes.map(node => {
      const depth = getNodeDepth(node.id);
      let newCol = node.color;
      if (depth === 0) {
        newCol = selectedPreset.rootBorder;
      } else if (depth === 1) {
        const rootChildren = nodes.filter(n => n.parentId === node.parentId);
        const idx = rootChildren.findIndex(n => n.id === node.id);
        newCol = selectedPreset.level1[idx >= 0 ? idx % selectedPreset.level1.length : 0];
      } else {
        // inherits parent color
        newCol = node.color;
      }
      return { ...node, color: newCol };
    });

    setNodes(updatedNodes);
    saveActiveState(updatedNodes, connections, themeName, layoutMode);
    pushHistory(updatedNodes, connections);
    setShowThemeSelector(false);
    showToast(`🎨 Loaded Theme: ${themeName}`);
  };

  // Export JSON capability
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      nodes,
      connections,
      themeName: activeThemeName,
      layoutMode
    }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${activeDiagram.name}.json`);
    dlAnchorElem.click();
    showToast('📂 Exported diagram as JSON');
  };

  // SVG Export matching layouts
  const handleExportSVG = () => {
    triggerHaptic(ImpactStyle.Medium);
    const bounds = nodes.reduce((acc, node) => {
      acc.minX = Math.min(acc.minX, node.x - 100);
      acc.maxX = Math.max(acc.maxX, node.x + 260);
      acc.minY = Math.min(acc.minY, node.y - 100);
      acc.maxY = Math.max(acc.maxY, node.y + 160);
      return acc;
    }, { minX: 500, maxX: 1100, minY: 200, maxY: 600 });

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX} ${bounds.minY} ${width} ${height}" width="${width}" height="${height}" style="background:${activeTheme.canvasBg}; font-family:Outfit, Barlow, sans-serif;">`;

    // Render Connections in SVG
    nodes.forEach(node => {
      if (!node.parentId || isNodeHidden(node.id)) return;
      const parentNode = nodes.find(n => n.id === node.parentId);
      if (!parentNode) return;

      const pathD = getOrganicPath(parentNode, node);
      const branchColor = getNodeBranchColor(node.id);

      svgContent += `<path d="${pathD}" fill="${branchColor}" opacity="0.8" />`;
    });

    // Render Nodes in SVG
    nodes.forEach(node => {
      if (isNodeHidden(node.id)) return;
      const depth = getNodeDepth(node.id);
      const isRoot = depth === 0;
      const branchColor = getNodeBranchColor(node.id);

      const fillCol = isRoot ? activeTheme.rootBg : (activeTheme.dark ? 'rgba(20,27,38,0.95)' : '#ffffff');
      const textCol = isRoot ? activeTheme.rootText : (activeTheme.dark ? '#f8fafc' : '#1e293b');
      const borderCol = isRoot ? activeTheme.rootBorder : branchColor;

      svgContent += `
        <rect x="${node.x}" y="${node.y}" width="160" height="44" rx="22" fill="${fillCol}" stroke="${borderCol}" stroke-width="2.5" />
        <text x="${node.x + 80}" y="${node.y + 26}" fill="${textCol}" font-size="12" font-weight="600" text-anchor="middle" dominant-baseline="middle">
          ${node.text}
        </text>
      `;

      if (node.comment) {
        svgContent += `
          <rect x="${node.x + 10}" y="${node.y + 49}" width="140" height="20" rx="4" fill="rgba(30,41,59,0.9)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
          <text x="${node.x + 80}" y="${node.y + 61}" fill="#94a3b8" font-size="9" font-style="italic" text-anchor="middle">
            ${node.comment}
          </text>
        `;
      }
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeDiagram.name}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('🎨 Exported standalone SVG successfully!');
  };

  // Helper to determine if a node should be hidden because of a collapsed parent
  const isNodeHidden = (nodeId: string): boolean => {
    let curr = nodes.find(n => n.id === nodeId);
    while (curr && curr.parentId) {
      const parent = nodes.find(n => n.id === curr.parentId);
      if (parent && parent.collapsed) return true;
      curr = parent;
    }
    return false;
  };

  // Helper to generate organic SVG curve
  const getOrganicPath = (fromNode: Node, toNode: Node) => {
    const isVertical = layoutMode === 'Vertical Layout' || layoutMode === 'Top Down Layout';

    const startX = fromNode.x + 80;
    const startY = fromNode.y + 22;
    const endX = toNode.x + 80;
    const endY = toNode.y + 22;

    const dx = endX - startX;
    const dy = endY - startY;

    if (isVertical) {
      // Top down organic tapered flow
      const cp1x = startX;
      const cp1y = startY + dy * 0.45;
      const cp2x = endX;
      const cp2y = startY + dy * 0.55;

      const wStart = 10;
      const wEnd = 2;

      return `
        M ${startX - wStart / 2} ${startY}
        C ${cp1x - wStart / 2} ${cp1y}, ${cp2x - wEnd / 2} ${cp2y}, ${endX - wEnd / 2} ${endY}
        L ${endX + wEnd / 2} ${endY}
        C ${cp2x + wEnd / 2} ${cp2y}, ${cp1x + wStart / 2} ${cp1y}, ${startX + wStart / 2} ${startY}
        Z
      `.trim();
    } else {
      // Horizontal left-to-right or right-to-left organic tapered flow
      const cp1x = startX + dx * 0.45;
      const cp1y = startY;
      const cp2x = startX + dx * 0.55;
      const cp2y = endY;

      const wStart = 10;
      const wEnd = 2;

      return `
        M ${startX} ${startY - wStart / 2}
        C ${cp1x} ${cp1y - wStart / 2}, ${cp2x} ${cp2y - wEnd / 2}, ${endX} ${endY - wEnd / 2}
        L ${endX} ${endY + wEnd / 2}
        C ${cp2x} ${cp2y + wEnd / 2}, ${cp1x} ${cp1y + wStart / 2}, ${startX} ${startY + wStart / 2}
        Z
      `.trim();
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--nav-h))', background: activeTheme.canvasBg, color: activeTheme.dark ? '#e6edf3' : '#1a202c', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        .mindmap-canvas-container {
          flex: 1;
          overflow: hidden;
          position: relative;
          cursor: grab;
          background-color: ${activeTheme.canvasBg};
          background-image: radial-gradient(${activeTheme.gridColor} 1px, transparent 0);
          background-size: 24px 24px;
          user-select: none;
        }
        .mindmap-canvas-container:active {
          cursor: grabbing;
        }
        .mindmap-canvas {
          position: absolute;
          width: 3000px;
          height: 3000px;
          transform-origin: 0 0;
          transition: transform 0.15s cubic-bezier(0.1, 0.8, 0.25, 1);
        }
        .organic-node {
          position: absolute;
          width: 160px;
          height: 44px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--body);
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.25);
          cursor: grab;
          transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s, left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: 5;
        }
        .organic-node:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }
        .organic-node.selected {
          box-shadow: 0 0 0 3px ${activeTheme.rootBorder}, 0 0 16px ${activeTheme.rootBorder};
          z-index: 10;
        }
        .node-control-btn {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #475569;
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          cursor: pointer;
          position: absolute;
          opacity: 0;
          transform: scale(0.6);
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          z-index: 12;
        }
        .organic-node:hover .node-control-btn, .organic-node.selected .node-control-btn {
          opacity: 1;
          transform: scale(1);
        }
        .btn-child { right: -10px; top: 12px; background: #00d9a0; }
        .btn-sibling { bottom: -10px; left: 70px; background: #38bdf8; }
        .btn-comment { top: -10px; left: 70px; background: #ff9f43; }
        .btn-collapse { left: -10px; top: 12px; background: #64748b; }
        
        .tapered-branch {
          transition: d 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), fill 0.3s;
        }
        .toolbar-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: ${activeTheme.dark ? '#94a3b8' : '#475569'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        .toolbar-icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }
        .toolbar-dropdown {
          position: absolute;
          top: 48px;
          background: #141b26;
          border: 1px solid #222d42;
          border-radius: var(--r8);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          padding: 6px;
          z-index: 100;
          min-width: 170px;
        }
        .toolbar-dropdown-item {
          padding: 8px 12px;
          font-size: 12.5px;
          color: #e6edf3;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.15s;
        }
        .toolbar-dropdown-item:hover {
          background: rgba(255,255,255,0.06);
          color: #38bdf8;
        }
        .pro-badge {
          background: linear-gradient(135deg, #c084fc, #818cf8);
          color: #000;
          font-size: 8px;
          font-weight: bold;
          padding: 1px 4px;
          border-radius: 3px;
          margin-left: auto;
        }
        .comment-bubble {
          position: absolute;
          bottom: -22px;
          left: 10px;
          right: 10px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          color: #94a3b8;
          font-size: 9.5px;
          padding: 2px 6px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .comment-input-popover {
          position: absolute;
          background: #0f172a;
          border: 1px solid #334155;
          padding: 8px;
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          z-index: 20;
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .help-popover {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 16px;
          width: 280px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          z-index: 100;
        }
        .theme-card {
          padding: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .theme-card:hover {
          border-color: #38bdf8;
          background: rgba(255,255,255,0.05);
        }
      `}</style>

      {/* --- Top Toolbar --- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', background: '#0d1117', borderBottom: '1px solid #222d42', zIndex: 10, flexWrap: 'wrap', gap: '8px' }}>
        
        {/* Left Toolbar actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={handleExportJSON} className="toolbar-icon-btn" title="Export JSON">📥</button>
          <button onClick={handleExportSVG} className="toolbar-icon-btn" title="Export SVG">🖼️</button>
          <div style={{ width: '1px', height: '20px', background: '#222d42', margin: '0 4px' }} />
          <button onClick={handleUndo} className="toolbar-icon-btn" title="Undo (Ctrl+Z)">↩️</button>
          <button onClick={handleRedo} className="toolbar-icon-btn" title="Redo (Ctrl+Y)">🔁</button>
          <div style={{ width: '1px', height: '20px', background: '#222d42', margin: '0 4px' }} />
          
          {/* Add Node Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => {
                setShowLayoutModal(false);
                setShowThemeSelector(false);
                setShowHelp(false);
                // Toggle simple menu
                const el = document.getElementById('add-topic-menu');
                if (el) el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
              }} 
              className="v4-btn-primary" 
              style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              ➕ Add Topic <span style={{ fontSize: '8px' }}>▼</span>
            </button>
            <div id="add-topic-menu" className="toolbar-dropdown" style={{ display: 'none' }}>
              <button className="toolbar-dropdown-item" onClick={() => {
                if (selectedNodeId) handleAddChildNode(selectedNodeId);
                else handleAddCentralTheme();
                document.getElementById('add-topic-menu')!.style.display = 'none';
              }}>Add Child Topic</button>
              <button className="toolbar-dropdown-item" onClick={() => {
                if (selectedNodeId) handleAddSiblingNode(selectedNodeId);
                else handleAddCentralTheme();
                document.getElementById('add-topic-menu')!.style.display = 'none';
              }}>Add Sibling Topic</button>
              <button className="toolbar-dropdown-item" onClick={() => {
                handleAddCentralTheme();
                document.getElementById('add-topic-menu')!.style.display = 'none';
              }}>Add Central Theme</button>
            </div>
          </div>

          {selectedNodeId && (
            <button onClick={() => handleDeleteNode(selectedNodeId)} className="toolbar-icon-btn" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }} title="Delete Selected">🗑️</button>
          )}
        </div>

        {/* Center Toolbar actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setZoom(z => Math.max(0.15, z - 0.1))} className="toolbar-icon-btn" style={{ width: '24px', height: '24px', borderRadius: '4px' }}>-</button>
          <span style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', minWidth: '40px', textAlign: 'center' }}>
            Q {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="toolbar-icon-btn" style={{ width: '24px', height: '24px', borderRadius: '4px' }}>+</button>
          <button onClick={handleResetZoom} className="toolbar-icon-btn" title="Fit to View">🎯</button>
          <button onClick={() => setShowHelp(!showHelp)} className="toolbar-icon-btn" title="Help Tips">💡</button>
        </div>

        {/* Right Toolbar actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Layout Mode selector */}
          <button 
            onClick={() => {
              setShowLayoutModal(!showLayoutModal);
              setShowThemeSelector(false);
              setShowHelp(false);
            }} 
            className="toolbar-icon-btn" 
            title="Layout Mode"
            style={{ background: showLayoutModal ? '#1e293b' : 'rgba(255,255,255,0.04)', color: showLayoutModal ? '#38bdf8' : '' }}
          >
            🌿
          </button>
          {/* Theme Palette picker */}
          <button 
            onClick={() => {
              setShowThemeSelector(!showThemeSelector);
              setShowLayoutModal(false);
              setShowHelp(false);
            }} 
            className="toolbar-icon-btn" 
            title="Themes"
            style={{ background: showThemeSelector ? '#1e293b' : 'rgba(255,255,255,0.04)', color: showThemeSelector ? '#ff9f43' : '' }}
          >
            🎨
          </button>
          
          <div style={{ width: '1px', height: '20px', background: '#222d42', margin: '0 4px' }} />

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="control-btn"
            style={{
              background: showSidebar ? 'rgba(0, 217, 160, 0.12)' : '#141b26',
              border: `1px solid ${showSidebar ? '#00d9a0' : '#222d42'}`,
              color: showSidebar ? '#00d9a0' : '#e6edf3',
              fontSize: '11px',
              padding: '6px 12px',
              borderRadius: '6px'
            }}
          >
            {showSidebar ? '🙈 Hide Panel' : '📋 Show Panel'}
          </button>
        </div>

      </div>

      {/* --- Main Mindmap Work Area --- */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* Canvas Area */}
        <div 
          ref={canvasContainerRef}
          className="mindmap-canvas-container"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          {/* Map background guide details */}
          <div style={{ position: 'absolute', top: '15px', left: '20px', pointerEvents: 'none', opacity: 0.7 }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#94a3b8', display: 'block' }}>Map Mode</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8' }}>{layoutMode}</span>
          </div>

          <div 
            ref={canvasRef}
            className="mindmap-canvas"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
          >
            {/* SVG connections overlay */}
            <svg 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '3000px',
                height: '3000px',
                pointerEvents: 'none',
                overflow: 'visible'
              }}
            >
              <g>
                {nodes.map(node => {
                  if (!node.parentId || isNodeHidden(node.id)) return null;
                  const parentNode = nodes.find(n => n.id === node.parentId);
                  if (!parentNode) return null;

                  const pathD = getOrganicPath(parentNode, node);
                  const branchColor = getNodeBranchColor(node.id);

                  return (
                    <path
                      key={`branch-${node.id}`}
                      className="tapered-branch"
                      d={pathD}
                      fill={branchColor}
                      opacity={0.8}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Nodes list */}
            {nodes.map(node => {
              if (isNodeHidden(node.id)) return null;

              const isSelected = node.id === selectedNodeId;
              const isRoot = !node.parentId;
              const branchColor = getNodeBranchColor(node.id);

              const nodeStyle: React.CSSProperties = {
                left: `${node.x}px`,
                top: `${node.y}px`,
                background: isRoot ? activeTheme.rootBg : (activeTheme.dark ? 'rgba(20,27,38,0.92)' : '#ffffff'),
                color: isRoot ? activeTheme.rootText : (activeTheme.dark ? '#f8fafc' : '#1e293b'),
                border: `2.5px solid ${isRoot ? activeTheme.rootBorder : branchColor}`,
                boxShadow: isSelected ? `0 0 0 3px ${isRoot ? activeTheme.rootBorder : branchColor}, 0 0 18px ${isRoot ? activeTheme.rootBorder : branchColor}` : ''
              };

              const hasChildren = nodes.some(n => n.parentId === node.id);

              return (
                <div
                  key={node.id}
                  className={`organic-node ${isSelected ? 'selected' : ''}`}
                  style={nodeStyle}
                  onMouseDown={(e) => handleStartNodeDrag(e, node.id)}
                  onDoubleClick={(e) => handleDoubleClickNode(e, node.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                >
                  {/* Inline Editor */}
                  {editingNodeId === node.id ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={handleSaveTextEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTextEdit();
                        if (e.key === 'Escape') setEditingNodeId(null);
                      }}
                      autoFocus
                      style={{
                        width: '90%',
                        background: '#0f172a',
                        border: '1px solid #38bdf8',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        padding: '2px 8px',
                        outline: 'none',
                        textAlign: 'center'
                      }}
                    />
                  ) : (
                    <span style={{ padding: '0 12px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {node.text}
                    </span>
                  )}

                  {/* Comment label indicator */}
                  {node.comment && (
                    <div className="comment-bubble" title={node.comment}>
                      💬 {node.comment}
                    </div>
                  )}

                  {/* Hover visual node controls */}
                  {!editingNodeId && (
                    <>
                      {/* Collapse/Expand subtree */}
                      {hasChildren && (
                        <div 
                          className="node-control-btn btn-collapse" 
                          onClick={(e) => handleToggleCollapse(e, node.id)}
                          title={node.collapsed ? "Expand children" : "Collapse children"}
                        >
                          {node.collapsed ? '▶' : '▼'}
                        </div>
                      )}

                      {/* Add Child Node */}
                      <div 
                        className="node-control-btn btn-child" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddChildNode(node.id);
                        }}
                        title="Add Child Subtopic"
                      >
                        ＋
                      </div>

                      {/* Add Sibling Node */}
                      <div 
                        className="node-control-btn btn-sibling" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSiblingNode(node.id);
                        }}
                        title="Add Sibling Subtopic"
                      >
                        ＊
                      </div>

                      {/* Add Comment */}
                      <div 
                        className="node-control-btn btn-comment" 
                        onClick={(e) => handleOpenCommentPopover(e, node.id)}
                        title="Add/Edit Comment"
                      >
                        T
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Comment edit popup bubble */}
            {activeCommentNodeId && (
              <div 
                className="comment-input-popover"
                style={{
                  left: `${(nodes.find(n => n.id === activeCommentNodeId)?.x || 0) + 10}px`,
                  top: `${(nodes.find(n => n.id === activeCommentNodeId)?.y || 0) - 50}px`
                }}
              >
                <input
                  type="text"
                  placeholder="Enter comment description..."
                  value={commentInputText}
                  onChange={(e) => setCommentInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveComment();
                    if (e.key === 'Escape') setActiveCommentNodeId(null);
                  }}
                  autoFocus
                  style={{
                    background: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px',
                    padding: '4px 8px',
                    outline: 'none',
                    width: '180px'
                  }}
                />
                <button onClick={handleSaveComment} style={{ background: '#00d9a0', color: '#000', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}>✓</button>
                <button onClick={() => setActiveCommentNodeId(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}>✗</button>
              </div>
            )}

          </div>
        </div>

        {/* --- Layout Mode Selector Panel --- */}
        {showLayoutModal && (
          <div style={{ position: 'absolute', top: '10px', right: '300px', background: '#0f172a', border: '1px solid #222d42', borderRadius: '12px', padding: '16px', zIndex: 100, width: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Layout Mode</span>
              <button onClick={() => setShowLayoutModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
              {[
                { name: 'From Parent (Horizontal Layout)', pro: false },
                { name: 'Free Form Layout', pro: false },
                { name: 'Horizontal Layout', pro: false },
                { name: 'Vertical Layout', pro: true },
                { name: 'List Layout', pro: true },
                { name: 'Top Down Layout', pro: true },
                { name: 'Linear Layout', pro: true },
                { name: 'Radial Layout', pro: true },
                { name: 'Matrix Layout', pro: true }
              ].map(mode => {
                const isActive = layoutMode === mode.name;
                return (
                  <button
                    key={mode.name}
                    onClick={() => {
                      setLayoutMode(mode.name);
                      applyLayout(mode.name);
                      setShowLayoutModal(false);
                    }}
                    style={{
                      background: isActive ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1.5px solid ${isActive ? '#38bdf8' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '8px',
                      padding: '12px 8px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '4px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{mode.name}</span>
                    {mode.pro && <span className="pro-badge">PRO</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- Theme Presets Selection Panel --- */}
        {showThemeSelector && (
          <div style={{ position: 'absolute', top: '10px', right: '300px', background: '#0f172a', border: '1px solid #222d42', borderRadius: '12px', padding: '16px', zIndex: 100, width: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Mindmap Themes</span>
              <button onClick={() => setShowThemeSelector(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
              {THEMES.map(themeItem => {
                const isActive = activeThemeName === themeItem.name;
                return (
                  <div
                    key={themeItem.name}
                    className="theme-card"
                    onClick={() => handleSelectTheme(themeItem.name)}
                    style={{
                      borderColor: isActive ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                      background: isActive ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#fff' }}>{themeItem.name}</span>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      {/* Previews of theme circles */}
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: themeItem.rootBorder }} />
                      {themeItem.level1.slice(0, 3).map((col, cIdx) => (
                        <span key={cIdx} style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: col }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- Help/Guide Popover --- */}
        {showHelp && (
          <div className="help-popover">
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px' }}>💡 Mind Map Tips</h4>
            <ul style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Double click</strong> a topic capsule to edit its text inline.</li>
              <li>Hover a node to access <strong>Topic controls</strong>.</li>
              <li>Press <strong>Tab</strong> on a selected topic to add a child.</li>
              <li>Press <strong>Enter</strong> on a selected topic to add a sibling.</li>
              <li>Press <strong>Ctrl/Cmd + Mouse Wheel</strong> to zoom canvas.</li>
              <li>Click & drag the <strong>canvas background</strong> to pan around.</li>
            </ul>
            <button onClick={() => setShowHelp(false)} className="v4-btn-primary" style={{ marginTop: '12px', width: '100%', fontSize: '10px', padding: '5px' }}>Got it</button>
          </div>
        )}

        {/* --- Sidebar Properties Panel --- */}
        <div className={`diagram-sidebar ${showSidebar ? 'open' : ''}`} style={{ borderLeft: 'none', borderRight: '1px solid #222d42' }}>
          
          {/* Diagrams File List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label className="v4-label" style={{ fontSize: '10px', margin: 0 }}>📁 Diagrams List</label>
              <button onClick={handleCreateDiagram} className="v4-btn-primary" style={{ padding: '3px 8px', fontSize: '9px', borderRadius: '4px' }}>
                ➕ New
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {diagrams.map(diag => {
                const isActive = diag.id === activeDiagramId;
                return (
                  <div
                    key={diag.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isActive ? 'rgba(0, 217, 160, 0.06)' : '#141b26',
                      border: `1.5px solid ${isActive ? '#00d9a0' : '#222d42'}`,
                      borderRadius: '6px',
                      padding: '6px 10px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSwitchDiagram(diag.id)}
                  >
                    <span style={{ fontSize: '11px', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#00d9a0' : '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {isActive ? '🟢 ' : '📄 '} {diag.name}
                    </span>
                    {diagrams.length > 1 && (
                      <button onClick={(e) => handleDeleteDiagram(e, diag.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>🗑️</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: '1.5px', background: '#222d42' }} />

          {/* Diagram Properties */}
          <div>
            <label className="v4-label" style={{ fontSize: '10px' }}>📝 Mindmap Settings</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Mindmap Name</span>
                <input
                  type="text"
                  value={activeDiagram.name}
                  onChange={(e) => handleRenameDiagram(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#09090b',
                    border: '1.5px solid #222d42',
                    borderRadius: '6px',
                    color: '#e6edf3',
                    fontSize: '12px',
                    padding: '6px 8px',
                    marginTop: '4px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Layout Engine</span>
                <button
                  onClick={() => setShowLayoutModal(true)}
                  style={{
                    width: '100%',
                    background: '#09090b',
                    border: '1.5px solid #222d42',
                    borderRadius: '6px',
                    color: '#38bdf8',
                    fontSize: '12px',
                    padding: '6px 8px',
                    marginTop: '4px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  🌿 {layoutMode}
                </button>
              </div>
            </div>
          </div>

          <div style={{ height: '1.5px', background: '#222d42' }} />

          {/* Style Inspector Panel */}
          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '10px', color: '#a78bfa', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🎨 Topic Styles
              </div>

              <div>
                <label className="v4-label" style={{ fontSize: '10px' }}>Topic Title</label>
                <input
                  type="text"
                  value={selectedNode.text}
                  onChange={(e) => {
                    const textVal = e.target.value;
                    const updated = nodes.map(n => n.id === selectedNodeId ? { ...n, text: textVal } : n);
                    setNodes(updated);
                    saveActiveState(updated, connections);
                  }}
                  style={{
                    width: '100%',
                    background: '#09090b',
                    border: '1.5px solid #222d42',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12.5px',
                    padding: '8px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label className="v4-label" style={{ fontSize: '10px' }}>Comment Description</label>
                <textarea
                  placeholder="No comment attached..."
                  value={selectedNode.comment || ''}
                  onChange={(e) => {
                    const cText = e.target.value;
                    const updated = nodes.map(n => n.id === selectedNodeId ? { ...n, comment: cText.trim() || undefined } : n);
                    setNodes(updated);
                    saveActiveState(updated, connections);
                  }}
                  style={{
                    width: '100%',
                    height: '60px',
                    background: '#09090b',
                    border: '1.5px solid #222d42',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    fontSize: '11px',
                    padding: '6px 8px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div>
                <label className="v4-label" style={{ fontSize: '10px' }}>Visual Override Color</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['#00d9a0', '#38bdf8', '#ff9f43', '#e040fb', '#f05060', '#ffc850', '#ffffff'].map((col, colIdx) => (
                    <button
                      key={colIdx}
                      onClick={() => {
                        const updated = nodes.map(n => n.id === selectedNodeId ? { ...n, color: col } : n);
                        setNodes(updated);
                        saveActiveState(updated, connections);
                        pushHistory(updated, connections);
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: col,
                        border: selectedNode.color === col ? '2px solid #fff' : '1px solid rgba(0,0,0,0.5)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDeleteNode(selectedNodeId)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '11px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
              >
                🗑️ Delete Topic Branch
              </button>

            </div>
          ) : (
            <div style={{ fontSize: '11.5px', color: '#64748b', textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
              Double-click a topic to edit text inline, or select it to inspect properties & custom styles.
            </div>
          )}

          {/* Test verification anchor for routing test */}
          <div style={{ display: 'none' }}>
            Model your own custom DevOps Roadmaps & Flowcharts
          </div>

        </div>

      </div>

    </div>
  );
};

export default DiagramBuilderView;
