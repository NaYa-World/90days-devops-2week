import React, { useState, useRef } from 'react';
import { DiagramData, DiagramNode } from '../data/diagrams';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { callAI, getProviderKey, getActiveProvider } from './AIService';
import { ApiKeySetupModal } from './ApiKeySetupModal';

interface InteractiveDiagramProps {
  data: DiagramData;
  onNodeClick?: (targetDay: number) => void;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({ data, onNodeClick }) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [iacFormat, setIacFormat] = useState('Terraform');

  const handleGenerateIaC = async () => {
    const provider = getActiveProvider();
    const key = await getProviderKey(provider);
    
    if (!key) {
      setShowApiKeyModal(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedCode('');

    try {
      const diagramJson = JSON.stringify(data, null, 2);
      const prompt = `You are a Principal Cloud Architect. Read this JSON array representing an architecture diagram and generate the production-ready Infrastructure-as-Code (IaC) in ${iacFormat} format.

Diagram Data:
${diagramJson}

Instructions:
- Output ONLY the raw ${iacFormat} code.
- Do NOT use markdown code blocks (\`\`\`).
- Do not add any explanations or conversational text.`;

      const code = await callAI(prompt, 1500);
      setGeneratedCode(code.trim());
    } catch (err: any) {
      setGeneratedCode(`// Error generating IaC:\n// ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine bounds of diagram to size the view box
  const minX = Math.min(...data.nodes.map(n => n.x)) - 60;
  const maxX = Math.max(...data.nodes.map(n => n.x)) + 80;
  const minY = Math.min(...data.nodes.map(n => n.y)) - 40;
  const maxY = Math.max(...data.nodes.map(n => n.y)) + 60;
  
  const width = Math.max(450, maxX - minX);
  const height = Math.max(300, maxY - minY);
  
  const handleNodeClick = (e: React.MouseEvent | React.TouchEvent, node: DiagramNode) => {
    e.stopPropagation();
    if (node.targetDay !== undefined && onNodeClick) {
      if (Capacitor.isNativePlatform()) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
      onNodeClick(node.targetDay);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    if (e.target instanceof Element) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (e.target instanceof Element) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomDelta = e.deltaY * -0.001;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + zoomDelta)));
  };

  const getNodeColor = (type?: string) => {
    switch (type) {
      case 'root':
        return {
          fill: 'rgba(0, 217, 160, 0.15)',
          stroke: 'var(--green)',
          text: 'var(--green)',
          radius: 12
        };
      case 'category':
        return {
          fill: 'rgba(157, 78, 221, 0.15)',
          stroke: 'var(--p1)',
          text: 'var(--p1)',
          radius: 8
        };
      case 'highlight':
        return {
          fill: 'rgba(255, 95, 95, 0.15)',
          stroke: 'var(--red)',
          text: 'var(--red)',
          radius: 8
        };
      default:
        return {
          fill: 'var(--s2)',
          stroke: 'var(--border)',
          text: 'var(--text)',
          radius: 6
        };
    }
  };

  return (
    <div style={{
      background: 'var(--s1)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      margin: '20px 0',
      touchAction: 'none'
    }}>
      <div style={{
        alignSelf: 'stretch',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '8px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)' }}>🧭 {data.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onNodeClick && <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'none' }}>💡 Drag to pan, scroll to zoom</span>}
          <select 
            value={iacFormat} 
            onChange={(e) => setIacFormat(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'var(--s2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '11px',
              outline: 'none'
            }}
          >
            <option value="Terraform">Terraform</option>
            <option value="Kubernetes YAML">Kubernetes</option>
            <option value="Ansible Playbook">Ansible</option>
            <option value="Docker Compose">Docker Compose</option>
            <option value="Pulumi TypeScript">Pulumi</option>
          </select>
          <button 
            onClick={handleGenerateIaC}
            disabled={isGenerating}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              background: 'var(--p1)',
              color: '#fff',
              border: 'none',
              fontSize: '11px',
              fontWeight: 600,
              cursor: isGenerating ? 'wait' : 'pointer',
              opacity: isGenerating ? 0.7 : 1
            }}
          >
            {isGenerating ? 'Generating...' : `Export IaC`}
          </button>
        </div>
      </div>
      
      <div 
        style={{ width: '100%', height: '400px', cursor: isDragging ? 'grabbing' : 'grab', position: 'relative' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <svg 
          viewBox={`${minX} ${minY} ${width} ${height}`} 
          style={{ 
            width: '100%', 
            height: '100%', 
            overflow: 'visible',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Arrowhead marker definition */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18" // push arrow back slightly so it doesn't overlap text boxes
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border)" />
            </marker>
          </defs>

          {/* Draw Edges/Lines */}
          <g>
            {data.edges.map((edge, idx) => {
              const fromNode = data.nodes.find(n => n.id === edge.from);
              const toNode = data.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              
              return (
                <line
                  key={`edge-${idx}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="var(--border)"
                  strokeWidth="2"
                  strokeDasharray={edge.style === 'dashed' ? '5,5' : undefined}
                  markerEnd="url(#arrow)"
                />
              );
            })}
          </g>

          {/* Draw Nodes */}
          <g>
            {data.nodes.map((node) => {
              const styles = getNodeColor(node.type);
              const hasLink = node.targetDay !== undefined;
              
              // Text dimensions/padding estimates
              const paddingX = 14;
              const paddingY = 8;
              const textWidth = node.label.length * 7.5; // simple width estimation
              const boxWidth = textWidth + paddingX * 2;
              const boxHeight = 16 + paddingY * 2;
              
              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x - boxWidth / 2}, ${node.y - boxHeight / 2})`}
                  onClick={(e) => handleNodeClick(e, node)}
                  style={{ cursor: hasLink ? 'pointer' : 'default' }}
                >
                  {/* Node Box with subtle glow */}
                  <rect
                    width={boxWidth}
                    height={boxHeight}
                    rx={styles.radius}
                    ry={styles.radius}
                    fill={styles.fill}
                    stroke={styles.stroke}
                    strokeWidth={node.type === 'root' ? '2.5' : '1.5'}
                    style={{
                      transition: 'all 0.2s ease',
                      filter: node.type === 'root' || node.type === 'category' ? 'drop-shadow(0px 0px 4px rgba(157,78,221,0.2))' : undefined
                    }}
                  />
                  
                  {/* Text Label */}
                  <text
                    x={boxWidth / 2}
                    y={boxHeight / 2 + 5}
                    textAnchor="middle"
                    fill={styles.text}
                    fontSize="11.5px"
                    fontFamily="system-ui, sans-serif"
                    fontWeight={node.type === 'root' || node.type === 'category' ? 'bold' : 'normal'}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {generatedCode && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Generated {iacFormat}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => navigator.clipboard.writeText(generatedCode)}
                style={{ padding: '4px 12px', borderRadius: '4px', background: 'var(--s2)', border: '1px solid var(--border)', color: '#fff', fontSize: '11px', cursor: 'pointer' }}
              >
                Copy
              </button>
              <button 
                onClick={() => setGeneratedCode('')}
                style={{ padding: '4px 12px', borderRadius: '4px', background: 'var(--red)', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
          <pre style={{
            flex: 1,
            margin: 0,
            background: '#0d1117',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#c9d1d9',
            fontSize: '12px',
            fontFamily: 'monospace',
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {generatedCode}
          </pre>
        </div>
      )}

      <ApiKeySetupModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={() => handleGenerateIaC()}
      />
    </div>
  );
};
