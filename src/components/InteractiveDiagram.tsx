import React, { useState, useRef } from 'react';
import { DiagramData, DiagramNode } from '../data/diagrams';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface InteractiveDiagramProps {
  data: DiagramData;
  onNodeClick?: (targetDay: number) => void;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({ data, onNodeClick }) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

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
        {onNodeClick && <span style={{ fontSize: '11px', color: 'var(--muted)' }}>💡 Drag to pan, scroll to zoom</span>}
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
    </div>
  );
};
