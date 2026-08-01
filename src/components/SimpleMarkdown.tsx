import React from 'react';

// A simple local Markdown renderer to avoid installing external packages
export const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const blocks = extractBlocks(text);
  
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
        } else if (block.type === 'table') {
          return renderTable(block.content, idx);
        } else {
          return renderMarkdownText(block.content, idx);
        }
      })}
    </div>
  );
};

function extractBlocks(text: string) {
  const lines = text.split('\n');
  const blocks: { type: 'text' | 'code' | 'table', content: string }[] = [];
  let currentBlockType: 'text' | 'code' | 'table' = 'text';
  let currentBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('```')) {
      if (currentBlockContent.length > 0) {
        blocks.push({ type: currentBlockType, content: currentBlockContent.join('\n') });
      }
      currentBlockType = currentBlockType === 'code' ? 'text' : 'code';
      currentBlockContent = [];
      continue;
    }

    const isTable = /^\s*\|.*\|\s*$/.test(line);
    
    if (currentBlockType === 'code') {
      currentBlockContent.push(line);
    } else if (isTable) {
      if (currentBlockType !== 'table') {
        if (currentBlockContent.length > 0) {
          blocks.push({ type: currentBlockType, content: currentBlockContent.join('\n') });
        }
        currentBlockType = 'table';
        currentBlockContent = [line];
      } else {
        currentBlockContent.push(line);
      }
    } else {
      if (currentBlockType === 'table') {
        if (currentBlockContent.length > 0) {
          blocks.push({ type: currentBlockType, content: currentBlockContent.join('\n') });
        }
        currentBlockType = 'text';
        currentBlockContent = [line];
      } else {
        currentBlockContent.push(line);
      }
    }
  }

  if (currentBlockContent.length > 0) {
    blocks.push({ type: currentBlockType, content: currentBlockContent.join('\n') });
  }

  return blocks;
}

function renderTable(text: string, blockIdx: number) {
  const lines = text.split('\n')
    .filter(r => !/^\s*\|?\s*[-: ]+\s*\|/.test(r) || !r.replace(/[|\-: ]/g, '').trim() === false)
    .filter(r => r.trim().length > 0);
  
  const dataRows = lines.filter(r => !/^\s*\|?\s*[-: |]+\s*$/.test(r));
  const parsed = dataRows.map(r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
  
  if (parsed.length === 0) return null;
  const [header, ...body] = parsed;

  return (
    <div key={blockIdx} style={{ overflowX: 'auto', margin: '10px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            {header.map((h, hi) => (
              <th key={hi} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#38bdf8', fontWeight: 700 }}>
                {renderBoldAndCodeText(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '8px 12px', color: '#c3c9d7', verticalAlign: 'top' }}>
                  {renderBoldAndCodeText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
          return <h4 key={idx} style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>{renderBoldAndCodeText(trimmed.replace('### ', ''))}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} style={{ margin: '12px 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{renderBoldAndCodeText(trimmed.replace('## ', ''))}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} style={{ margin: '16px 0 8px 0', fontSize: '17px', fontWeight: 800, color: '#fff' }}>{renderBoldAndCodeText(trimmed.replace('# ', ''))}</h2>;
        }

        // List items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          const checkboxMatch = content.match(/^\[( |x|X)\]\s*(.*)$/);
          if (checkboxMatch) {
            const checked = checkboxMatch[1].toLowerCase() === 'x';
            return (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginLeft: '16px', fontSize: '13px', color: '#d1d5db', margin: '4px 0' }}>
                <span>{checked ? '✅' : '⬜'}</span>
                <span>{renderBoldAndCodeText(checkboxMatch[2])}</span>
              </div>
            );
          }

          return (
            <li key={idx} style={{ marginLeft: '16px', fontSize: '13px', color: '#d1d5db', listStyleType: 'disc', margin: '4px 0', lineHeight: 1.6 }}>
              {renderBoldAndCodeText(content)}
            </li>
          );
        }
        
        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', marginLeft: '8px', fontSize: '13px', color: '#d1d5db', margin: '4px 0', lineHeight: 1.6 }}>
              <span style={{ fontWeight: 700, color: '#7c6fff' }}>{numMatch[1]}.</span>
              <span>{renderBoldAndCodeText(numMatch[2])}</span>
            </div>
          );
        }

        if (trimmed === '---') {
            return <hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />;
        }

        return <p key={idx} style={{ margin: '6px 0', fontSize: '13px', color: '#c3c9d7', lineHeight: '1.7' }}>{renderBoldAndCodeText(trimmed)}</p>;
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
              padding: '2px 5px', 
              borderRadius: '4px',
              color: '#38bdf8',
              fontSize: '12px'
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
