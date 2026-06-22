import React, { useState, useEffect } from 'react';
import { PHASES_V4 } from '../data/phases_v4';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { AIService } from '../components/AIService';
import { showToast } from '../components/Toast';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';


const getSTARQuestion = (day: { id: string; title: string }): string => {
  const questionMap: Record<string, string> = {
    'p1-d1': 'How do you secure SSH private keys for an EC2 instance, and how do you configure your local machine for convenient connection access?',
    'p1-d2': 'Explain the difference between SIGTERM and SIGKILL. Under what circumstances would you use each in a production environment?',
    'p1-d3': 'How do you diagnose and resolve a disk space exhaustion issue where df shows 100% usage but deleted log files are still occupying space?',
    'p1-d4': 'What is the difference between binding an application to 0.0.0.0 vs 127.0.0.1, and how does it impact external accessibility?',
    'p1-d5': 'Explain the difference between Restart=always and Restart=on-failure in a systemd service unit file, and when would you use each?',
    'p1-d6': 'What are the essential steps to harden an SSH daemon on a production Linux server to prevent unauthorized access?',
    'p1-d7': 'How do you configure log rotation for an application, and why is the postrotate directive critical in the configuration?',
    'p1-d8': 'What are the benefits of using set -euo pipefail at the beginning of a bash script, and what issues does each flag prevent?',
    'p1-d9': 'How do you handle a security finding regarding world-writable directories and files with excessive permissions in production?',
    'p1-d10': 'How do you handle and rotate an AWS Access Key or secret that was accidentally committed to a public Git repository?',
    'p1-d11': 'How do you diagnose an application crash caused by the Linux Out-Of-Memory (OOM) killer, and how do you prevent it?',
    'p1-d12': 'What is your systematic troubleshooting process to diagnose latency or connection failures for a microservice?',
    'p1-d13': 'What is the difference between RPO and RTO, and how do you calculate and verify them for an EC2-based disaster recovery setup?',
    'p1-d14': 'Summarize your experience with Linux and EC2 infrastructure management. What key skills have you built?',
  };

  return questionMap[day.id] || `In a production DevOps scenario, how do you handle configuration, troubleshooting, or deployment tasks related to "${day.title}"?`;
};

interface FocusViewProps {
  appState: UseAppStateReturnType;
  focusDay: string;
  setFocusDay: (day: string) => void;
}

export const FocusView: React.FC<FocusViewProps> = ({
  appState,
  focusDay,
  setFocusDay,
}) => {
  const currentUser = appState.currentUser || 'guest';
  const v4stateKey = `devops90_v4_tasks_${currentUser.toLowerCase()}`;
  const v4artifactsKey = `devops90_v4_artifacts_${currentUser.toLowerCase()}`;
  const v4notesKey = `devops90_v4_notes_${currentUser.toLowerCase()}`;

  const [v4state, setV4State] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(v4stateKey) || '{}'); } catch { return {}; }
  });
  const [v4artifacts, setV4Artifacts] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(v4artifactsKey) || '{}'); } catch { return {}; }
  });
  const [v4notes, setV4Notes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(v4notesKey) || '{}'); } catch { return {}; }
  });

  const [pi, setPi] = useState(0);
  const [di, setDi] = useState(0);
  const [starRevealed, setStarRevealed] = useState(false);

  // Sync state when focusDay prop changes
  useEffect(() => {
    if (focusDay) {
      const parts = focusDay.split('_');
      setPi(parseInt(parts[0]) || 0);
      setDi(parseInt(parts[1]) || 0);
      setStarRevealed(false);
    }
  }, [focusDay]);

  // Sync state if user changes or restore completes
  useEffect(() => {
    try {
      setV4State(JSON.parse(localStorage.getItem(v4stateKey) || '{}'));
      setV4Artifacts(JSON.parse(localStorage.getItem(v4artifactsKey) || '{}'));
      setV4Notes(JSON.parse(localStorage.getItem(v4notesKey) || '{}'));
    } catch {
      setV4State({});
      setV4Artifacts({});
      setV4Notes({});
    }
  }, [v4stateKey, v4artifactsKey, v4notesKey, appState.state]);

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getDayNumber = (dayId: string): string => {
    const match = dayId.match(/-d(\d+)$/);
    return match ? `Day ${match[1]}` : dayId;
  };

  const allDaysList: { pi: number; di: number; text: string }[] = [];
  PHASES_V4.forEach((ph, pIdx) => {
    ph.dayTasks.forEach((d, dIdx) => {
      allDaysList.push({
        pi: pIdx,
        di: dIdx,
        text: `Day ${dIdx + 1 + pIdx * 14} (Phase ${pIdx + 1}) — ${d.title}`
      });
    });
  });

  const curVal = `${pi}_${di}`;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFocusDay(e.target.value);
  };

  const handlePrev = () => {
    const idx = allDaysList.findIndex(x => x.pi === pi && x.di === di);
    if (idx > 0) {
      const prev = allDaysList[idx - 1];
      setFocusDay(`${prev.pi}_${prev.di}`);
    }
  };

  const handleNext = () => {
    const idx = allDaysList.findIndex(x => x.pi === pi && x.di === di);
    if (idx < allDaysList.length - 1) {
      const next = allDaysList[idx + 1];
      setFocusDay(`${next.pi}_${next.di}`);
    }
  };

  const handleFocusToday = () => {
    // Find the first day in V4 that is not complete
    for (let pIdx = 0; pIdx < PHASES_V4.length; pIdx++) {
      const ph = PHASES_V4[pIdx];
      for (let dIdx = 0; dIdx < ph.dayTasks.length; dIdx++) {
        const day = ph.dayTasks[dIdx];
        const doneCount = day.tasks.filter((_, ti) => !!v4state[`v4_${pIdx}_${dIdx}_${ti}`]).length;
        const url = v4artifacts[`${pIdx}_${dIdx}`] || '';
        const dayComplete = doneCount === day.tasks.length && isValidUrl(url);
        if (!dayComplete) {
          setFocusDay(`${pIdx}_${dIdx}`);
          return;
        }
      }
    }
    setFocusDay('0_0');
  };

  const currentPhase = PHASES_V4[pi];
  const currentDay = currentPhase?.dayTasks[di];
  
  if (!currentPhase || !currentDay) {
    return <div className="wrap">Select a valid day to start focusing.</div>;
  }

  const doneCount = currentDay.tasks.filter((_, ti) => !!v4state[`v4_${pi}_${di}_${ti}`]).length;
  const totalCount = currentDay.tasks.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const toggleV4Task = (pi: number, di: number, ti: number) => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }
    const key = `v4_${pi}_${di}_${ti}`;
    const next = { ...v4state, [key]: !v4state[key] };
    setV4State(next);
    localStorage.setItem(v4stateKey, JSON.stringify(next));
    appState.triggerSync().catch(() => {});
  };

  const updateV4ArtifactUrl = (pi: number, di: number, url: string) => {
    const key = `${pi}_${di}`;
    const next = { ...v4artifacts, [key]: url };
    setV4Artifacts(next);
    localStorage.setItem(v4artifactsKey, JSON.stringify(next));
    appState.triggerSync().catch(() => {});
  };

  const v4NoteKey = (pi: number, di: number) => `v4_note_${pi}_${di}`;
  const getV4Note = (pi: number, di: number): string => {
    return v4notes[v4NoteKey(pi, di)] || '';
  };
  const setV4Note = (pi: number, di: number, val: string) => {
    const next = { ...v4notes, [v4NoteKey(pi, di)]: val };
    setV4Notes(next);
    localStorage.setItem(v4notesKey, JSON.stringify(next));
    appState.triggerSync().catch(() => {});
  };

  return (
    <div className="wrap">
      {/* Focus Nav */}
      <div className="focus-nav">
        <select value={curVal} onChange={handleSelectChange}>
          {allDaysList.map(item => (
            <option key={`${item.pi}_${item.di}`} value={`${item.pi}_${item.di}`}>
              {item.text}
            </option>
          ))}
        </select>
        <button className="focus-btn" onClick={handlePrev}>← Prev</button>
        <button className="focus-btn" onClick={handleNext}>Next →</button>
        <button className="focus-btn primary" onClick={handleFocusToday}>🎯 Focus Today</button>
      </div>

      {/* Focus Content */}
      <div id="focus-content">
        <div className="focus-card">
          <div className="focus-day-tag">
            {getDayNumber(currentDay.id)} · Phase {currentPhase.phase}
          </div>
          <div className="focus-title">{currentDay.title}</div>
          <div className="focus-meta">
            {doneCount}/{totalCount} tasks · {pct}% done
          </div>
          
          <div className="focus-pct-bar">
            <div className="focus-pct-fill" style={{ width: `${pct}%` }}></div>
          </div>

          {/* 1. Production Scenario */}
          <div style={{ margin: '20px 0' }}>
            <div style={{ fontSize: '11px', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '6px' }}>
              🔴 Target Production Scenario
            </div>
            <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#c3c9d7' }}>
              {currentDay.scenario}
            </div>
          </div>

          {/* 2. Tasks List */}
          <div style={{ margin: '20px 0' }}>
            <div style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px' }}>
              📋 Execution Checklist
            </div>
            {currentDay.tasks.map((task, ti) => {
              const done = !!v4state[`v4_${pi}_${di}_${ti}`];

              return (
                <div key={ti} className="task-row" onClick={() => toggleV4Task(pi, di, ti)} style={{ cursor: 'pointer' }}>
                  <div className={`task-check ${done ? 'done' : ''}`}>
                    {done && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className={`task-text ${done ? 'done' : ''}`}>{task}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span className="task-xp" style={{ opacity: done ? 1 : 0, color: '#38bdf8' }}>
                      +15xp
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Practical Commands Terminal */}
          {currentDay.commands && currentDay.commands.length > 0 && (
            <div style={{ margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: '#ffc850', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                  💻 Monospace Command Sequence
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentDay.commands!.join('\n'))
                      .then(() => showToast('✓ Commands copied', 'rgba(255,200,80,.1)'))
                      .catch(e => console.error(e));
                  }}
                  className="focus-btn"
                  style={{ fontSize: '10px', padding: '2px 8px', height: 'auto', minHeight: 'auto' }}
                >
                  Copy
                </button>
              </div>
              <div style={{
                background: '#07090f',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: 1.6,
                color: '#00d9a0',
                whiteSpace: 'pre-wrap',
              }}>
                {currentDay.commands.map((cmd, cIdx) => (
                  <div key={cIdx} style={{ marginBottom: cIdx === currentDay.commands!.length - 1 ? 0 : '4px' }}>
                    <span style={{ color: '#8f9bb3', marginRight: '8px' }}>$</span>
                    {cmd}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Real-world Gotchas */}
          <div style={{
            background: 'rgba(239,155,80,0.03)',
            border: '1px solid rgba(239,155,80,0.15)',
            borderRadius: '8px',
            padding: '12px 14px',
            margin: '20px 0',
          }}>
            <div style={{ fontSize: '11px', color: '#ef9b50', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚠️</span>
              <span>Real Production Gotcha</span>
            </div>
            <div style={{ fontSize: '12.5px', lineHeight: 1.6, color: '#c3c9d7' }}>
              {currentDay.gotcha}
            </div>
          </div>

          {/* 5. Interview Reveal Box */}
          <div style={{ margin: '20px 0', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.01)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ fontSize: '11px', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '6px' }}>
                🎤 STAR Interview Preparation Question
              </div>
              <div style={{ fontSize: '13.5px', lineHeight: 1.5, color: '#fff', fontWeight: 500 }}>
                {getSTARQuestion(currentDay)}
              </div>
            </div>
            
            <div
              onClick={() => setStarRevealed(!starRevealed)}
              style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--sub)' }}>
                {starRevealed ? 'Hide Answer Template' : 'Reveal Answer Template'}
              </span>
              <span style={{ fontSize: '11px', color: '#c084fc', textDecoration: 'underline' }}>
                {starRevealed ? 'Hide' : 'Reveal'}
              </span>
            </div>
            {starRevealed && (
              <div style={{ padding: '14px', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8f9bb3', marginBottom: '8px' }}>
                  &quot;Answer the question in your own words, then verify with the senior expert template below:&quot;
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#00d9a0', fontFamily: 'var(--mono)', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid rgba(0,217,160,0.1)' }}>
                  {currentDay.interviewAnswer}
                </div>
              </div>
            )}
          </div>

          {/* 6. Artifact Verification Contract */}
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            padding: '14px',
            margin: '20px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px' }}>🔗</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                Verifiable Artifact Contract
              </span>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#8f9bb3' }}>
              {currentDay.artifactContract.instruction}
            </p>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={`Format: ${currentDay.artifactContract.exampleFormat}`}
                value={v4artifacts[`${pi}_${di}`] || ''}
                onChange={e => updateV4ArtifactUrl(pi, di, e.target.value)}
                style={{
                  flex: 1,
                  background: '#07090f',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#fff',
                  outline: 'none',
                }}
              />
              {isValidUrl(v4artifacts[`${pi}_${di}`] || '') ? (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--green, #00d9a0)',
                  background: 'rgba(0,217,160,0.08)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0,217,160,0.2)',
                }}>
                  ✓ Verified Link
                </span>
              ) : (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#ef4444',
                  background: 'rgba(239,68,68,0.08)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}>
                  Url Required
                </span>
              )}
            </div>
          </div>

          {/* Notes Widget */}
          <NotesWidget 
            pi={pi}
            di={di}
            getNote={getV4Note}
            setNote={setV4Note}
          />

          {/* AI Brief Widget */}
          <AIBriefWidget 
            pi={pi}
            di={di}
            day={getDayNumber(currentDay.id)}
            label={currentDay.title}
            phaseTitle={currentPhase.title}
            tasks={currentDay.tasks}
            note={getV4Note(pi, di)}
          />
        </div>
      </div>
    </div>
  );
};

// Sub-components replicated for self-containment
interface NotesWidgetProps {
  pi: number;
  di: number;
  getNote: (pi: number, di: number) => string;
  setNote: (pi: number, di: number, val: string) => void;
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ pi, di, getNote, setNote }) => {
  const [noteVal, setNoteVal] = useState(getNote(pi, di));
  const [saveLabel, setSaveLabel] = useState('Save note');

  useEffect(() => {
    setNoteVal(getNote(pi, di));
  }, [pi, di, getNote]);

  const handleSave = () => {
    setNote(pi, di, noteVal);
    setSaveLabel('✓ Saved');
    setTimeout(() => setSaveLabel('Save note'), 1500);
  };

  return (
    <div className="notes-widget">
      <div className="notes-label">📝 NOTES</div>
      <textarea 
        className="notes-ta"
        value={noteVal}
        onChange={(e) => setNoteVal(e.target.value)}
        placeholder="Add your notes, reflections, or codes..."
      />
      <button className="notes-save" onClick={handleSave}>{saveLabel}</button>
    </div>
  );
};

interface AIBriefWidgetProps {
  pi: number;
  di: number;
  day: string;
  label: string;
  phaseTitle: string;
  tasks: any[];
  note?: string;
}

interface QuizState {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const AIBriefWidget: React.FC<AIBriefWidgetProps> = ({
  pi,
  di,
  day,
  label,
  phaseTitle,
  tasks,
  note,
}) => {
  const [brief, setBrief] = useState<string>('');
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  // Reset widget when day changes
  useEffect(() => {
    setBrief('');
    setQuiz(null);
    setSelectedOpt(null);
  }, [pi, di]);

  const handleGenerateBrief = async () => {
    setLoadingBrief(true);
    setBrief('');
    try {
      const tasksText = tasks.map(t => typeof t === 'string' ? `- ${t}` : `- [${t.k}] ${t.t}`).join('\n');
      const text = await AIService.generateDailyBrief(day, label, phaseTitle, tasksText, note);
      setBrief(text);
    } catch (e: any) {
      setBrief(`⚠ Error: ${e.message || 'Could not connect. Configure your Anthropic Key.'}`);
    } finally {
      setLoadingBrief(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);
    setQuiz(null);
    setSelectedOpt(null);
    try {
      const tasksText = tasks.map(t => typeof t === 'string' ? t : t.t).join(', ');
      const q = await AIService.generateQuiz(label, tasksText);
      setQuiz(q);
    } catch (e: any) {
      showToast(`⚠ Quiz Error: ${e.message || 'Failed to generate.'}`, 'var(--red)');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const renderMarkdown = (txt: string) => {
    const lines = txt.split('\n');
    return lines.map((l, i) => {
      if (l.startsWith('## ')) {
        return <h3 key={i} style={{ fontSize: '13px', fontWeight: 700, margin: '14px 0 7px', color: 'var(--text)' }}>{l.slice(3)}</h3>;
      }
      if (l.startsWith('- ')) {
        return <li key={i} style={{ marginLeft: '12px', marginBottom: '4px' }}>{l.slice(2)}</li>;
      }
      return <p key={i} style={{ margin: '4px 0' }}>{l}</p>;
    });
  };

  return (
    <div className="ai-brief-wrap">
      <div className="ai-brief-hdr">
        <div className="ai-brief-title">✦ AI Daily Brief</div>
        <div className="ai-brief-btns">
          <button className="ai-btn ai-btn-brief" onClick={handleGenerateBrief}>
            Generate Brief
          </button>
          <button className="ai-btn ai-btn-quiz" onClick={handleGenerateQuiz}>
            AI Quiz
          </button>
        </div>
      </div>
      
      <div className="ai-brief-body">
        {loadingBrief ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sub)', fontSize: '13px' }}>
            <div className="ai-spinner"></div>Generating your daily brief…
          </div>
        ) : brief ? (
          <div>{renderMarkdown(brief)}</div>
        ) : (
          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
            Click "Generate Brief" for an AI-powered study plan for today's topics.
          </span>
        )}
      </div>

      {loadingQuiz && (
        <div style={{ padding: '0 14px 14px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sub)', fontSize: '13px' }}>
          <div className="ai-spinner"></div>Generating quiz question…
        </div>
      )}

      {quiz && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '12px', lineHeight: 1.5, color: 'var(--text)' }}>
            {quiz.question}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
            {quiz.options.map((opt, oIdx) => {
              const isSelected = selectedOpt === oIdx;
              const isCorrect = oIdx === quiz.answer;
              const hasAnswered = selectedOpt !== null;
              
              let style: React.CSSProperties = {
                textAlign: 'left',
                background: 'var(--s3)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '10px 14px',
                borderRadius: 'var(--r8)',
                cursor: hasAnswered ? 'default' : 'pointer',
                fontSize: '13px',
                fontFamily: 'var(--body)'
              };

              if (hasAnswered) {
                if (isCorrect) {
                  style.background = 'rgba(0, 217, 160, .12)';
                  style.borderColor = 'var(--green)';
                  style.color = 'var(--green)';
                } else if (isSelected) {
                  style.background = 'rgba(255, 95, 95, .08)';
                  style.borderColor = 'var(--red)';
                  style.color = 'var(--red)';
                } else {
                  style.color = 'var(--muted)';
                }
              }

              return (
                <button
                  key={oIdx}
                  disabled={hasAnswered}
                  onClick={() => {
                    setSelectedOpt(oIdx);
                    if (Capacitor.isNativePlatform()) {
                      if (oIdx === quiz.answer) {
                        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
                      } else {
                        Haptics.notification({ type: NotificationType.Error }).catch(() => {});
                      }
                    }
                  }}
                  style={style}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedOpt !== null && (
            <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r8)', padding: '12px 14px', fontSize: '13px', color: 'var(--sub)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>Explanation: </span>
              {quiz.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FocusView;
