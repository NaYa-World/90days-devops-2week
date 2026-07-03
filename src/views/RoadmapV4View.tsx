import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PHASES_V4 } from '../data/phases_v4';
import type { UseAppStateReturnType } from '../hooks/useAppState';
import confetti from 'canvas-confetti';
import { SyncMeta } from '../utils/SyncMeta';

// Optimized React.memo component to prevent massive Virtual DOM re-renders
const TaskRow = React.memo(({ task, isDone, onToggle }: { task: string, isDone: boolean, onToggle: () => void }) => (
  <div
    onClick={onToggle}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: '6px',
      background: isDone ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
      transition: 'background 0.2s',
    }}
  >
    <div style={{
      width: '14px',
      height: '14px',
      border: isDone ? 'none' : '1px solid rgba(255,255,255,0.25)',
      background: isDone ? '#38bdf8' : 'transparent',
      borderRadius: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '3px',
      flexShrink: 0,
    }}>
      {isDone && (
        <svg width="8" height="6" viewBox="0 0 12 10" fill="none" stroke="#000" strokeWidth="3">
          <polyline points="1.5 5 4.5 8 10.5 1.5" />
        </svg>
      )}
    </div>
    <span style={{
      fontFamily: "'Google Sans', Arial, sans-serif",
      fontSize: '16px',
      lineHeight: 1.5,
      color: isDone ? '#8f9bb3' : '#c3c9d7',
      textDecoration: isDone ? 'line-through' : 'none',
    }}>
      {task}
    </span>
  </div>
), (prev, next) => prev.isDone === next.isDone && prev.task === next.task);

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

interface RoadmapV4ViewProps {
  appState: UseAppStateReturnType;
}

// LocalStorage helpers
function loadV4State(key: string): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function saveV4State(key: string, state: Record<string, boolean>) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save V4 progress state', e);
  }
}

// Generate storage keys
function v4key(pi: number, di: number, ti: number) {
  return `v4_${pi}_${di}_${ti}`;
}

export const RoadmapV4View: React.FC<RoadmapV4ViewProps> = ({ appState }) => {
  const currentUser = appState.currentUser || 'guest';
  const stateKey = `devops90_v4_tasks_${currentUser.toLowerCase()}`;
  const artifactsKey = `devops90_v4_artifacts_${currentUser.toLowerCase()}`;

  const [v4state, setV4State] = useState<Record<string, boolean>>(() => loadV4State(stateKey));
  const [v4Artifacts, setV4Artifacts] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(artifactsKey) || '{}');
    } catch {
      return {};
    }
  });

  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({ 0: true });
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');

  // Sync state if currentUser changes or restore completes
  useEffect(() => {
    setV4State(loadV4State(stateKey));
    try {
      setV4Artifacts(JSON.parse(localStorage.getItem(artifactsKey) || '{}'));
    } catch {
      setV4Artifacts({});
    }
  }, [stateKey, artifactsKey, appState.state]);

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isDayTasksComplete = (pi: number, di: number, state: Record<string, boolean>): boolean => {
    const day = PHASES_V4[pi].dayTasks[di];
    return day.tasks.every((_, ti) => !!state[v4key(pi, di, ti)]);
  };

  const isDayComplete = (pi: number, di: number, state: Record<string, boolean>, artifacts: Record<string, string>): boolean => {
    const tasksDone = isDayTasksComplete(pi, di, state);
    const artifactUrl = artifacts[`${pi}_${di}`] || '';
    return tasksDone && isValidUrl(artifactUrl);
  };

  const getPhaseStats = (pi: number) => {
    const phase = PHASES_V4[pi];
    const totalDays = phase.dayTasks.length;
    const completedDays = phase.dayTasks.filter((_, di) => isDayComplete(pi, di, v4state, v4Artifacts)).length;
    const percent = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;
    return { totalDays, completedDays, percent };
  };

  // Overall statistics
  const totalTasks = PHASES_V4.reduce((acc, phase) => {
    return acc + phase.dayTasks.reduce((dAcc, day) => dAcc + day.tasks.length, 0);
  }, 0);

  const completedTasks = Object.entries(v4state).filter(([k, v]) => k.startsWith('v4_') && v).length;
  const overallTaskPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalDaysCount = PHASES_V4.reduce((acc, p) => acc + p.dayTasks.length, 0);
  const completedDaysCount = PHASES_V4.reduce((acc, phase, pi) => {
    return acc + phase.dayTasks.filter((_, di) => isDayComplete(pi, di, v4state, v4Artifacts)).length;
  }, 0);
  const overallDayPercent = totalDaysCount ? Math.round((completedDaysCount / totalDaysCount) * 100) : 0;

  const totalXP = completedTasks * 15 + completedDaysCount * 100;

  const togglePhase = (pi: number) => {
    setOpenPhases(prev => ({ ...prev, [pi]: !prev[pi] }));
  };

  const toggleDay = (pi: number, di: number) => {
    const key = `${pi}_${di}`;
    setOpenDays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTask = (pi: number, di: number, ti: number) => {
    const key = v4key(pi, di, ti);
    setV4State(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveV4State(stateKey, next);
      SyncMeta.recordChange(currentUser, stateKey, key);
      setTimeout(() => appState.triggerSync().catch(() => {}), 600);

      // Confetti trigger on day completion
      if (isDayTasksComplete(pi, di, next)) {
        const artifactUrl = v4Artifacts[`${pi}_${di}`] || '';
        if (isValidUrl(artifactUrl)) {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }
      }
      return next;
    });
  };

  // Debounce ref for artifact URL sync — prevents 28 sync calls for a 28-char URL
  const artifactSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateArtifactUrl = useCallback((pi: number, di: number, url: string) => {
    const key = `${pi}_${di}`;
    // Immediately update local state for responsive UI
    setV4Artifacts(prev => ({ ...prev, [key]: url }));

    // Debounce the expensive persist + sync operations
    if (artifactSyncTimerRef.current) clearTimeout(artifactSyncTimerRef.current);
    artifactSyncTimerRef.current = setTimeout(() => {
      setV4Artifacts(current => {
        try {
          localStorage.setItem(artifactsKey, JSON.stringify(current));
          SyncMeta.recordChange(currentUser, artifactsKey, key);
          setTimeout(() => appState.triggerSync().catch(() => {}), 600);
        } catch (e) {
          console.error(e);
        }
        return current; // no state change, just persisting
      });

      // Confetti check with latest task state
      setV4State(currentState => {
        if (isDayTasksComplete(pi, di, currentState) && isValidUrl(url)) {
          confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
        }
        return currentState;
      });
    }, 500);
  }, [artifactsKey, currentUser, appState]);

  const bulkMarkTasks = (pi: number, di: number) => {
    const day = PHASES_V4[pi].dayTasks[di];
    setV4State(prev => {
      const next = { ...prev };
      const changedKeys: string[] = [];
      day.tasks.forEach((_, ti) => {
        const k = v4key(pi, di, ti);
        next[k] = true;
        changedKeys.push(k);
      });
      saveV4State(stateKey, next);
      SyncMeta.recordChanges(currentUser, stateKey, changedKeys);
      setTimeout(() => appState.triggerSync().catch(() => {}), 600);

      const artifactUrl = v4Artifacts[`${pi}_${di}`] || '';
      if (isValidUrl(artifactUrl)) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }
      return next;
    });
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all V4 roadmap progress and artifact URLs? This cannot be undone.')) {
      // Capture current state BEFORE clearing, so SyncMeta records the correct old keys
      setV4State(prevState => {
        setV4Artifacts(prevArtifacts => {
          try {
            saveV4State(stateKey, {});
            localStorage.setItem(artifactsKey, '{}');
            SyncMeta.recordAll(currentUser, stateKey, prevState);
            SyncMeta.recordAll(currentUser, artifactsKey, prevArtifacts);
            setTimeout(() => {
              appState.triggerSync().catch(() => {});
            }, 600);
          } catch (e) {
            console.error(e);
          }
          return {};
        });
        return {};
      });
      alert('Progress has been reset.');
    }
  };

  const copyToClipboard = (commands: string[]) => {
    navigator.clipboard.writeText(commands.join('\n'))
      .then(() => alert('Commands copied to clipboard!'))
      .catch(e => console.error('Failed to copy', e));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', color: '#eeeef5', fontFamily: 'system-ui, sans-serif' }}>

      {/* HEADER Progress Dashboard */}
      <div style={{
        background: 'linear-gradient(135deg, #131520 0%, #0c0e17 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>
              🔥 DevOps Zero to Job — 100 Days V4
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#8f9bb3' }}>
              Verifiable artifact-driven curriculum with real-world incident simulations.
            </p>
          </div>
          <button
            onClick={handleResetProgress}
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Reset Progress
          </button>
        </div>

        {/* STATS TILES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '11px', color: '#8f9bb3', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Overall Progress</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--green, #00d9a0)', marginTop: '4px' }}>{overallDayPercent}%</div>
            <div style={{ fontSize: '12px', color: '#8f9bb3', marginTop: '2px' }}>{completedDaysCount} / {totalDaysCount} Days complete</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '11px', color: '#8f9bb3', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Tasks Completed</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{overallTaskPercent}%</div>
            <div style={{ fontSize: '12px', color: '#8f9bb3', marginTop: '2px' }}>{completedTasks} / {totalTasks} Tasks</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '11px', color: '#8f9bb3', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Total XP Earned</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffc850', marginTop: '4px' }}>{totalXP.toLocaleString()} XP</div>
            <div style={{ fontSize: '12px', color: '#8f9bb3', marginTop: '2px' }}>+15 XP/task, +100 XP/day</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search keywords, tasks, or commands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: '#07090f',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#fff',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '6px', background: '#07090f', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['all', 'todo', 'done'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: filter === f ? '#fff' : '#8f9bb3',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH QUERY NORMALIZATION */}
      {search && (
        <p style={{ fontSize: '13px', color: '#8f9bb3', margin: '0 0 16px 8px' }}>
          Filtering roadmap items matching: &quot;{search}&quot;
        </p>
      )}

      {/* PHASES ACCORDIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {PHASES_V4.map((phase, pi) => {
          const isOpen = !!openPhases[pi];
          const stats = getPhaseStats(pi);

          // Phase search check
          const sl = search.toLowerCase();
          const matchDayCount = phase.dayTasks.filter(day => {
            return !search ||
              day.title.toLowerCase().includes(sl) ||
              day.scenario.toLowerCase().includes(sl) ||
              day.tasks.some(t => t.toLowerCase().includes(sl)) ||
              (day.commands && day.commands.some(c => c.toLowerCase().includes(sl))) ||
              day.gotcha.toLowerCase().includes(sl);
          }).length;

          if (search && matchDayCount === 0) return null;

          return (
            <div
              key={phase.id}
              style={{
                background: '#131520',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              }}
            >
              {/* Phase Title Bar */}
              <div
                onClick={() => togglePhase(pi)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: isOpen ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: isOpen ? 'rgba(255,255,255,0.01)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{ fontSize: '20px' }}>{phase.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: '#ff5f5f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Phase {phase.phase} • {phase.days}
                    </span>
                    <span style={{ fontSize: '10px', color: '#8f9bb3', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                      {phase.instanceType}
                    </span>
                  </div>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                    {phase.title}
                  </h3>
                </div>

                {/* Phase progress percentage pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '20px',
                    background: stats.percent === 100 ? 'rgba(0,217,160,0.12)' : 'rgba(255,255,255,0.06)',
                    color: stats.percent === 100 ? 'var(--green, #00d9a0)' : '#eeeef5',
                    border: stats.percent === 100 ? '1px solid rgba(0,217,160,0.2)' : '1px solid transparent',
                  }} className="progress-pill">
                    {stats.percent}%
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: '#8f9bb3',
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Phase Body */}
              {isOpen && (
                <div style={{ padding: '0 0 16px 0' }}>

                  {/* Phase cost detail banner */}
                  <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8f9bb3' }}>
                    <span>Estimated Cloud Cost: <strong style={{ color: '#fff' }}>{phase.estimatedCost}</strong></span>
                    {phase.instanceWarning && <span style={{ color: '#ef4444' }}>⚠️ {phase.instanceWarning}</span>}
                  </div>

                  {/* Day Tasks Mapping */}
                  {phase.dayTasks.map((day, di) => {
                    const dayKey = `${pi}_${di}`;
                    const dayIsOpen = !!openDays[dayKey];
                    const tasksComplete = isDayTasksComplete(pi, di, v4state);
                    const dayComplete = isDayComplete(pi, di, v4state, v4Artifacts);
                    const isMissingArtifact = tasksComplete && !dayComplete;

                    const dayDoneTasksCount = day.tasks.filter((_, ti) => !!v4state[v4key(pi, di, ti)]).length;

                    // Filtering check
                    if (filter === 'done' && !dayComplete) return null;
                    if (filter === 'todo' && dayComplete) return null;

                    // Day query check
                    if (search) {
                      const dayMatch = day.title.toLowerCase().includes(sl) ||
                        day.scenario.toLowerCase().includes(sl) ||
                        day.tasks.some(t => t.toLowerCase().includes(sl)) ||
                        (day.commands && day.commands.some(c => c.toLowerCase().includes(sl))) ||
                        day.gotcha.toLowerCase().includes(sl);
                      if (!dayMatch) return null;
                    }

                    return (
                      <div
                        key={day.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          background: dayComplete ? 'rgba(0,217,160,0.01)' : 'transparent',
                        }}
                      >
                        {/* Day Header Trigger */}
                        <div
                          onClick={() => toggleDay(pi, di)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 20px',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          {/* Day Complete Check Icon */}
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: dayComplete
                              ? 'var(--green, #00d9a0)'
                              : isMissingArtifact
                                ? 'rgba(255,200,80,0.12)'
                                : 'rgba(255,255,255,0.04)',
                            border: dayComplete
                              ? 'none'
                              : isMissingArtifact
                                ? '1px solid rgba(255,200,80,0.4)'
                                : '1px solid rgba(255,255,255,0.1)',
                            flexShrink: 0,
                          }}>
                            {dayComplete ? (
                              <svg width="10" height="8" viewBox="0 0 12 10" fill="none" stroke="#000" strokeWidth="2.8">
                                <polyline points="1.5 5 4.5 8 10.5 1.5" />
                              </svg>
                            ) : isMissingArtifact ? (
                              <span style={{ fontSize: '11px', color: '#ffc850' }}>⚠️</span>
                            ) : null}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '10px', color: '#8f9bb3', fontWeight: 700, fontFamily: 'monospace' }}>
                                Day {di + 1}
                              </span>
                              {isMissingArtifact && (
                                <span style={{ fontSize: '9px', fontWeight: 700, color: '#ffc850', background: 'rgba(255,200,80,0.08)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(255,200,80,0.2)' }}>
                                  Artifact Needed
                                </span>
                              )}
                            </div>
                            <h4 style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 600, color: dayComplete ? '#fff' : '#c3c9d7' }}>
                              {day.title}
                            </h4>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#8f9bb3', fontFamily: 'monospace' }}>
                              {dayDoneTasksCount}/{day.tasks.length}
                            </span>
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              style={{
                                transform: dayIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                color: '#8f9bb3',
                              }}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>

                        {/* Day Collapsible Detail Container */}
                        {dayIsOpen && (
                          <div style={{ padding: '0 20px 20px 52px', borderTop: '1px solid rgba(255,255,255,0.02)', background: 'rgba(0,0,0,0.1)' }}>

                            {/* Instance Notes */}
                            {day.instanceNote && (
                              <div style={{ margin: '12px 0 8px 0', fontSize: '11px', color: '#8f9bb3', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>
                                💡 Instance Advice: <span style={{ color: '#fff' }}>{day.instanceNote}</span>
                              </div>
                            )}

                            {/* 1. Production Scenario */}
                            <div style={{ margin: '14px 0' }}>
                              <div style={{ fontSize: '11px', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px' }}>
                                🔴 Target Production Scenario
                              </div>
                              <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#c3c9d7' }}>
                                {day.scenario}
                              </div>
                            </div>

                            {/* 2. Tasks Checklist */}
                            <div style={{ margin: '16px 0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                                  📋 Execution Checklist
                                </div>
                                <button
                                  onClick={() => bulkMarkTasks(pi, di)}
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    color: '#38bdf8',
                                    border: '1px solid rgba(56,189,248,0.2)',
                                    background: 'transparent',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Check All
                                </button>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {day.tasks.map((task, ti) => {
                                  const isDone = !!v4state[v4key(pi, di, ti)];
                                  return (
                                    <TaskRow
                                      key={`${pi}_${di}_${ti}`}
                                      task={task}
                                      isDone={isDone}
                                      onToggle={() => toggleTask(pi, di, ti)}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            {/* 3. Practical Commands Terminal */}
                            {day.commands && day.commands.length > 0 && (
                              <div style={{ margin: '16px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <div style={{ fontSize: '11px', color: '#ffc850', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                                    💻 Monospace Command Sequence
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(day.commands!)}
                                    style={{
                                      fontSize: '9px',
                                      fontWeight: 600,
                                      background: 'rgba(255,200,80,0.08)',
                                      border: '1px solid rgba(255,200,80,0.2)',
                                      color: '#ffc850',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Copy Commands
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
                                  position: 'relative',
                                }}>
                                  {day.commands.map((cmd, cIdx) => (
                                    <div key={cIdx} style={{ marginBottom: cIdx === day.commands!.length - 1 ? 0 : '4px' }}>
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
                              margin: '16px 0',
                            }}>
                              <div style={{ fontSize: '11px', color: '#ef9b50', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>⚠️</span>
                                <span>Real Production Gotcha</span>
                              </div>
                              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#c3c9d7' }}>
                                {day.gotcha}
                              </div>
                            </div>

                            {/* 5. Interview Reveal Box */}
                            <div style={{ margin: '16px 0', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
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
                                  {getSTARQuestion(day)}
                                </div>
                              </div>

                              <div
                                onClick={() => setRevealedAnswers(prev => ({ ...prev, [dayKey]: !prev[dayKey] }))}
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
                                  {revealedAnswers[dayKey] ? 'Hide Answer Template' : 'Reveal Answer Template'}
                                </span>
                                <span style={{ fontSize: '11px', color: '#c084fc', textDecoration: 'underline' }}>
                                  {revealedAnswers[dayKey] ? 'Hide' : 'Reveal'}
                                </span>
                              </div>
                              {revealedAnswers[dayKey] && (
                                <div style={{ padding: '14px', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#8f9bb3', marginBottom: '8px' }}>
                                    &quot;Answer the question in your own words, then verify with the senior expert template below:&quot;
                                  </div>
                                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#00d9a0', fontFamily: 'var(--mono)', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid rgba(0,217,160,0.1)' }}>
                                    {day.interviewAnswer}
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
                              marginTop: '16px',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px' }}>🔗</span>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                                  Verifiable Artifact Contract
                                </span>
                              </div>
                              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#8f9bb3' }}>
                                {day.artifactContract.instruction}
                              </p>

                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  placeholder={`Format: ${day.artifactContract.exampleFormat}`}
                                  value={v4Artifacts[dayKey] || ''}
                                  onChange={e => updateArtifactUrl(pi, di, e.target.value)}
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
                                {isValidUrl(v4Artifacts[dayKey] || '') ? (
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

                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Phase Summary Project & Drill Cards */}
                  <div style={{ padding: '20px 20px 0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

                    {/* Weekly Project */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🚀</span>
                        <h4 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 700 }}>
                          Weekly Capstone Project
                        </h4>
                      </div>
                      <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--green, #00d9a0)' }}>
                        {phase.weeklyProject.title}
                      </h5>
                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', lineHeight: 1.5, color: '#8f9bb3' }}>
                        {phase.weeklyProject.scenario}
                      </p>

                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', marginBottom: '6px' }}>Success Criteria:</div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', lineHeight: 1.6, color: '#c3c9d7' }}>
                        {phase.weeklyProject.successCriteria.map((c, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Incident Drill */}
                    <div style={{ background: 'rgba(255,95,95,0.02)', border: '1px solid rgba(255,95,95,0.08)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🚨</span>
                        <h4 style={{ margin: 0, fontSize: '14px', color: '#ff5f5f', fontWeight: 700 }}>
                          Operational Incident Drill
                        </h4>
                      </div>
                      <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#ff5f5f' }}>
                        {phase.incidentDrill.title}
                      </h5>
                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', lineHeight: 1.5, color: '#8f9bb3' }}>
                        {phase.incidentDrill.scenario}
                      </p>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#c3c9d7', marginTop: '12px' }}>
                        <div>Time Limit: <strong style={{ color: '#fff' }}>{phase.incidentDrill.timeLimit}</strong></div>
                        <div>Post-Mortem: <strong style={{ color: '#fff' }}>{phase.incidentDrill.postMortemRequired ? 'Required' : 'Optional'}</strong></div>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default RoadmapV4View;
