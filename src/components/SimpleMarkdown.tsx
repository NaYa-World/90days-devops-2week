import React from 'react';

// A simple local Markdown renderer to avoid installing external packages
export const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const blocks = extractCodeBlocks(text);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <pre key={idx} style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '12px',
              borderRadius: '6px',
              overflowX: 'auto',
              border: '1px solid rgba(255,255,255,0.1)',
              margin: '8px 0',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#38bdf8'
            }}>
              <code>{block.content}</code>
            </pre>
          );
        } else {
          return renderMarkdownText(block.content, idx);
        }
      })}
    </div>
  );
};

function extractCodeBlocks(text: string) {
  const lines = text.split('\n');
  const blocks: { type: 'text' | 'code', content: string }[] = [];
  let currentBlockType: 'text' | 'code' = 'text';
  let currentBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('\`\`\`')) {
      if (currentBlockType === 'text') {
        if (currentBlockContent.length > 0) {
          blocks.push({ type: 'text', content: currentBlockContent.join('\n') });
        }
        currentBlockType = 'code';
        currentBlockContent = [];
      } else {
        blocks.push({ type: 'code', content: currentBlockContent.join('\n') });
        currentBlockType = 'text';
        currentBlockContent = [];
      }
    } else {
      currentBlockContent.push(line);
    }
  }

  if (currentBlockContent.length > 0) {
    blocks.push({ type: currentBlockType, content: currentBlockContent.join('\n') });
  }

  return blocks;
}

function renderMarkdownText(text: string, blockIdx: number) {
  const lines = text.split('\n');
  return (
    <React.Fragment key={blockIdx}>
      {lines.map((line, idx) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: '4px' }} />;
        
        // Headers
        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#fff' }}>{trimmed.replace('### ', '')}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} style={{ margin: '12px 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#fff' }}>{trimmed.replace('## ', '')}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} style={{ margin: '16px 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#fff' }}>{trimmed.replace('# ', '')}</h2>;
        }

        // List items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          return (
            <li key={idx} style={{ marginLeft: '16px', fontSize: '13px', color: '#d1d5db', listStyleType: 'disc' }}>
              {renderBoldAndCodeText(content)}
            </li>
          );
        }
        
        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', marginLeft: '8px', fontSize: '13px', color: '#d1d5db' }}>
              <span style={{ fontWeight: 700, color: '#7c6fff' }}>{numMatch[1]}.</span>
              <span>{renderBoldAndCodeText(numMatch[2])}</span>
            </div>
          );
        }

        if (trimmed === '---') {
            return <hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />;
        }

        return <p key={idx} style={{ margin: '4px 0', fontSize: '13px', color: '#d1d5db', lineHeight: '1.6' }}>{renderBoldAndCodeText(trimmed)}</p>;
      })}
    </React.Fragment>
  );
}

// Helper to replace **bold** and `code` with React elements
function renderBoldAndCodeText(text: string) {
  const boldParts = text.split(/\*\*(.*?)\*\*/g);
  return boldParts.map((boldPart, i) => {
    const isBold = i % 2 === 1;
    
    const codeParts = boldPart.split(/`(.*?)`/g);
    const content = codeParts.map((codePart, j) => {
      const isCode = j % 2 === 1;
      if (isCode) {
        return (
          <code 
            key={j} 
            style={{ 
              fontFamily: 'monospace', 
              background: 'rgba(255,255,255,0.08)', 
              padding: '2px 4px', 
              borderRadius: '4px',
              color: '#38bdf8',
              fontSize: '11px'
            }}
          >
            {codePart}
          </code>
        );
      }
      return codePart;
    });

    if (isBold) {
      return <strong key={i} style={{ fontWeight: 700, color: '#fff' }}>{content}</strong>;
    }
    return <React.Fragment key={i}>{content}</React.Fragment>;
  });
}
