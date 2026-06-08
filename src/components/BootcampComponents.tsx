import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { 
  ScheduleBlock, 
  ConceptBlock, 
  TerminalSession, 
  DebugTree, 
  MistakeItem, 
  MiniProject, 
  InterviewPrompt, 
  QuizQuestion, 
  GithubTemplate 
} from '../data/notes/types';

export const ScheduleTable: React.FC<{ schedule: ScheduleBlock[]; color: string }> = ({ schedule, color }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className="schedule">
      <thead>
        <tr>
          <th>Time Block</th>
          <th>Phase</th>
          <th>Activity + Why</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((item, idx) => (
          <tr key={idx}>
            <td className="time-col">{item.time}</td>
            <td className="phase-col" style={{ color }}>{item.phase}</td>
            <td className="activity-col">
              <strong>{item.activity}</strong>
              <span>{item.why}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ConceptCards: React.FC<{ concepts: ConceptBlock[]; color: string }> = ({ concepts, color }) => (
  <div className="concept-grid">
    {concepts.map((concept, idx) => (
      <div className="concept-card" key={idx}>
        <div className="icon">{concept.icon}</div>
        <h4>{concept.title}</h4>
        <p>{concept.description}</p>
        <p className="analogy" style={{ color }}>{concept.analogy}</p>
      </div>
    ))}
  </div>
);

export const TerminalBlock: React.FC<{ session: TerminalSession; color: string }> = ({ session, color }) => (
  <div className="terminal">
    <div className="terminal-bar">
      <span className="dot r"></span>
      <span className="dot y"></span>
      <span className="dot g"></span>
      <span className="label">
        SESSION {session.sessionNumber} of {session.totalSessions} — {session.sessionTitle}
      </span>
    </div>
    <div className="terminal-body">
      {session.sections.map((section, sIdx) => (
        <div className="cmd-section" key={sIdx}>
          <div className="cmd-section-label">{section.label}</div>
          {section.lines.map((line, lIdx) => {
            if (line.type === 'cmd') {
              return (
                <div className="cmd-line" key={lIdx}>
                  <span className="prompt" style={{ color }}>{line.prompt || '$'}</span>
                  <span className="cmd">{line.text}</span>
                </div>
              );
            } else if (line.type === 'comment') {
              return (
                <div className="cmd-line" key={lIdx}>
                  <span className="comment"># {line.text}</span>
                </div>
              );
            } else {
              let className = 'output-line';
              if (line.type === 'ok') className += ' output-ok';
              else if (line.type === 'warn') className += ' output-warn';
              else if (line.type === 'err') className += ' output-err';

              if (line.text.startsWith('#')) {
                className += ' comment';
              }

              return (
                <div 
                  className={className} 
                  key={lIdx} 
                  style={line.type === 'ok' ? { color } : undefined}
                >
                  {line.text}
                </div>
              );
            }
          })}
        </div>
      ))}
    </div>
    {session.expectedOutput && (
      <div className="expected-output">
        <span className="label" style={{ color }}>{session.expectedOutput.label}</span>
        <div style={{ whiteSpace: 'pre-wrap' }}>{session.expectedOutput.text}</div>
      </div>
    )}
  </div>
);

export const DebugFlow: React.FC<{ tree: DebugTree; color: string }> = ({ tree, color }) => (
  <div className="debug-tree">
    <h4 style={{ color }}>⚡ {tree.title}</h4>
    {tree.steps.map((step, idx) => (
      <div className="debug-step" key={idx}>
        <div className="debug-num" style={{ borderColor: color, color }}>{step.num}</div>
        <div className="debug-content">
          <strong>{step.title}</strong>
          {step.description && <span>{step.description}</span>}
          {step.cmd && (
            <span className="debug-cmd" style={{ color, borderColor: `${color}44`, background: `${color}0c` }}>
              {step.cmd}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);

export const MistakesBlock: React.FC<{ mistakes: MistakeItem[]; color: string }> = ({ mistakes, color }) => (
  <div className="mistakes">
    <div className="mistakes-header" style={{ color, background: `${color}14`, borderBottomColor: `${color}2e` }}>
      ⚠ Mistakes Senior Engineers See Every Week
    </div>
    {mistakes.map((item, idx) => (
      <div className="mistake-item" key={idx}>
        <div className="mistake-x" style={{ color }}>✗</div>
        <div className="mistake-content">
          <strong>{item.mistake}</strong>
          <span>{item.description}</span>
          <span className="mistake-fix" style={{ color: '#00ff9d' }}>{item.fix}</span>
        </div>
      </div>
    ))}
  </div>
);

export const MiniProjectBlock: React.FC<{ project: MiniProject; color: string }> = ({ project, color }) => (
  <div className="mini-project">
    <div className="project-header">
      <div className="meta">
        <div className="tag" style={{ color }}>{project.tag}</div>
        <h3>{project.title}</h3>
      </div>
      <div className="time-est">{project.timeEstimate}</div>
    </div>
    <div className="project-body">
      <div className="project-goal" style={{ borderLeftColor: color }}>
        <strong>Goal:</strong> {project.goal}
      </div>
      <ul className="checklist">
        {project.checklist.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>

      {project.codeBlock && (
        <div className="terminal" style={{ marginTop: '16px' }}>
          <div className="terminal-bar">
            <span className="dot r"></span>
            <span className="dot y"></span>
            <span className="dot g"></span>
            <span className="label">{project.codeBlock.title}</span>
          </div>
          <div className="terminal-body" style={{ background: '#09090f' }}>
            {project.codeBlock.lines.map((line, idx) => {
              const isComment = line.trim().startsWith('#');
              const isCommand = line.trim().startsWith('chmod') || line.trim().startsWith('bash') || line.trim().startsWith('nano') || line.trim().startsWith('$');
              
              if (isCommand) {
                return (
                  <div className="cmd-line" key={idx}>
                    <span className="prompt" style={{ color }}>$</span>
                    <span className="cmd">{line.replace(/^\$\s*/, '')}</span>
                  </div>
                );
              }
              return (
                <div key={idx} className={isComment ? 'output-line comment' : 'output-line'} style={{ marginLeft: 0 }}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {project.expectedOutput && (
        <div className="expected-output" style={{ borderLeftColor: color }}>
          <span className="label" style={{ color }}>Expected Output</span>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>{project.expectedOutput}</div>
        </div>
      )}
    </div>
  </div>
);

export const InterviewPrep: React.FC<{ interview: InterviewPrompt[]; color: string }> = ({ interview, color }) => (
  <div>
    {interview.map((item, idx) => (
      <div className="interview-block" key={idx}>
        <div className="interview-q" style={{ color, background: `${color}0d`, borderBottomColor: `${color}33` }}>
          <span className="label">INT Q →</span> {item.question}
        </div>
        <div className="interview-a">
          <strong>Your answer structure:</strong> {item.answer}
        </div>
      </div>
    ))}
  </div>
);

export const InteractiveQuiz: React.FC<{ questions: QuizQuestion[]; color: string }> = ({ questions, color }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  
  const handleSelectOption = (questionNum: number, optionIdx: number) => {
    if (selectedOptions[questionNum] !== undefined) return;
    
    const question = questions.find(q => q.num === questionNum);
    const selectedOption = question?.options[optionIdx];
    const isCorrect = selectedOption?.isCorrect;

    if (Capacitor.isNativePlatform()) {
      if (isCorrect) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      } else {
        Haptics.notification({ type: NotificationType.Error }).catch(() => {});
      }
    }

    setSelectedOptions(prev => ({
      ...prev,
      [questionNum]: optionIdx
    }));
  };

  return (
    <div className="quiz">
      <div className="quiz-header" style={{ color }}>
        ⚡ Knowledge Check — Pass = 4/5 correct
      </div>
      {questions.map((q, qIdx) => {
        const selectedIdx = selectedOptions[q.num];
        const isAnswered = selectedIdx !== undefined;
        
        return (
          <div key={qIdx} style={{ marginBottom: '24px' }}>
            <div className="quiz-q">
              <span className="num">Q{q.num}.</span> {q.question}
            </div>
            <div className="quiz-options">
              {q.options.map((opt, oIdx) => {
                let optClass = 'quiz-opt';
                
                if (isAnswered) {
                  if (opt.isCorrect) {
                    optClass += ' correct';
                  } else if (selectedIdx === oIdx) {
                    optClass += ' wrong';
                  }
                }
                
                return (
                  <div 
                    key={oIdx} 
                    className={optClass}
                    onClick={() => handleSelectOption(q.num, oIdx)}
                    style={isAnswered ? { pointerEvents: 'none' } : undefined}
                  >
                    {opt.text}
                  </div>
                );
              })}
            </div>
            {isAnswered && (
              <div className="quiz-explain" style={{ borderLeftColor: color }}>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const GithubTemplateBlock: React.FC<{ github: GithubTemplate }> = ({ github }) => (
  <div className="doc-template">
    <div className="doc-template-bar">
      <span>{github.filename}</span>
      {github.commitMessage && <span>Commit: "{github.commitMessage}"</span>}
    </div>
    <pre style={{ margin: 0, padding: '18px', overflowX: 'auto', fontSize: '13px', lineHeight: '1.6' }}>{github.template}</pre>
  </div>
);

export const ReferenceMaterialsBlock: React.FC<{
  pdfUrl?: string;
  images?: { url: string; caption: string }[];
  color: string;
  onImageClick: (img: { url: string; caption: string }) => void;
}> = ({ pdfUrl, images, color, onImageClick }) => {
  return (
    <div className="reference-materials-block" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {pdfUrl && (
        <div className="pdf-viewer-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
            <h4 style={{ margin: 0, color: 'var(--text)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📄</span> Study Guide & PDF Material
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="v4-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', textDecoration: 'none' }}
              >
                <span>↗</span> Open in New Tab
              </a>
              <a 
                href={pdfUrl} 
                download 
                className="v4-btn-primary"
                style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: `${color}22`, color: color, border: `1px solid ${color}44`, borderRadius: '6px', textDecoration: 'none' }}
              >
                <span>📥</span> Download PDF
              </a>
            </div>
          </div>
          
          {/* Responsive PDF Embedded Iframe (Hidden on mobile via CSS) */}
          <div className="pdf-embed-wrapper" style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#0e0e15' }}>
            <iframe 
              src={`${pdfUrl}#toolbar=0`} 
              width="100%" 
              height="500px" 
              style={{ border: 'none' }}
              title="Study Notes PDF"
            />
          </div>
        </div>
      )}

      {images && images.length > 0 && (
        <div className="images-gallery-section" style={{ marginTop: pdfUrl ? '10px' : '0' }}>
          <h4 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🖼️</span> Visual Diagrams & Infographics
          </h4>
          <div className="notes-image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className="notes-image-card" 
                onClick={() => onImageClick(img)}
                style={{ 
                  background: 'var(--s1)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07070c' }}>
                  <img 
                    src={img.url} 
                    alt={img.caption} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    className="gallery-thumbnail"
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="gallery-overlay">
                    <span style={{ background: 'rgba(0,0,0,0.7)', padding: '8px 16px', borderRadius: '20px', color: '#fff', fontSize: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>🔍 Zoom Diagram</span>
                  </div>
                </div>
                <div style={{ padding: '10px 12px', fontSize: '12.5px', color: 'var(--sub)', lineHeight: '1.4', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                  {img.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
