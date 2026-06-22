import React, { useState } from 'react';
import { days } from '../data/notes';
import type { UseAppStateReturnType } from '../hooks/useAppState';
import confetti from 'canvas-confetti';

// Generate tasks from a single BootcampDay note
function extractTasks(dayData: typeof days[0]) {
  const tasks: { t: string; k: 'concept' | 'code' | 'quiz' | 'project' }[] = [];
  
  if (dayData.concepts) {
    dayData.concepts.forEach(c => tasks.push({ t: `📝 ${c.title}`, k: 'concept' }));
  }
  if (dayData.commands) {
    dayData.commands.forEach(c => tasks.push({ t: `💻 ${c.sessionTitle}`, k: 'code' }));
  }
  if (dayData.project?.checklist) {
    dayData.project.checklist.forEach(c => tasks.push({ t: `🚀 ${c}`, k: 'project' }));
  }
  if (dayData.interview) {
    dayData.interview.forEach(i => tasks.push({ t: `🎤 ${i.question}`, k: 'quiz' }));
  }
  if (dayData.quiz) {
    dayData.quiz.forEach(q => tasks.push({ t: `🤔 ${q.question}`, k: 'quiz' }));
  }
  
  // Ensure every day has at least one task so it's checkable
  if (tasks.length === 0) {
    tasks.push({ t: `Review ${dayData.title}`, k: 'concept' });
  }

  return tasks;
}

// Prepare weeks data from notes
const week1Days = days.filter(d => d.day <= 7.1).map(day => ({
  ...day,
  tasks: extractTasks(day)
}));

const WEEKS = [
  { 
    title: "Week 1", 
    daysCount: week1Days.length,
    color: "#00d4a3", 
    dim: "#00d4a318",
    data: week1Days,
    icon: "📅"
  }
];

function loadV3State(key: string): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function saveV3State(key: string, s: Record<string, boolean>) {
  try { localStorage.setItem(key, JSON.stringify(s)); } catch { /**/ }
}

function v3key(weekIndex: number, dayIndex: number, taskIndex: number) { 
  return `v3_${weekIndex}_${dayIndex}_${taskIndex}`; 
}

function weekDone(weekIndex: number, state: Record<string, boolean>) {
  const week = WEEKS[weekIndex];
  return week.data.reduce((acc, day, di) =>
    acc + day.tasks.filter((_, ti) => !!state[v3key(weekIndex, di, ti)]).length, 0);
}
function weekTotal(weekIndex: number) {
  return WEEKS[weekIndex].data.reduce((acc, day) => acc + day.tasks.length, 0);
}

interface Props {
  appState: UseAppStateReturnType;
  switchView: (v: string) => void;
}

export const RoadmapV3View: React.FC<Props> = ({ appState }) => {
  const userKey = `devops90_v3_state_${(appState.currentUser || 'guest').toLowerCase()}`;
  const [v3state, setV3State] = useState<Record<string, boolean>>(() => loadV3State(userKey));
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({ 0: true });
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');

  React.useEffect(() => {
    setV3State(loadV3State(userKey));
  }, [userKey, appState.state]);

  const totalDone = WEEKS.reduce((a, _, wi) => a + weekDone(wi, v3state), 0);
  const totalAll  = WEEKS.reduce((a, _, wi) => a + weekTotal(wi), 0);
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;
  const totalXP = Object.entries(v3state).filter(([, v]) => v).length * 15;

  function toggle(wi: number, di: number, ti: number) {
    const key = v3key(wi, di, ti);
    const next = { ...v3state, [key]: !v3state[key] };
    setV3State(next);
    saveV3State(userKey, next);
    appState.triggerSync().catch(() => {});
    
    const done = WEEKS[wi].data.reduce((acc, day, ddi) =>
      acc + day.tasks.filter((_, tti) => !!next[v3key(wi, ddi, tti)]).length, 0);
    if (done === weekTotal(wi)) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  }

  function bulkMarkDay(wi: number, di: number, type: 'concept' | 'code' | 'all') {
    const next = { ...v3state };
    const tasks = WEEKS[wi]?.data[di]?.tasks || [];
    tasks.forEach((task, ti) => {
      if (type === 'all' || task.k === type) {
        next[v3key(wi, di, ti)] = true;
      }
    });
    setV3State(next);
    saveV3State(userKey, next);
    appState.triggerSync().catch(() => {});

    const done = WEEKS[wi].data.reduce((acc, day, ddi) =>
      acc + day.tasks.filter((_, tti) => !!next[v3key(wi, ddi, tti)]).length, 0);
    if (done === weekTotal(wi)) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  }

  function toggleWeek(wi: number) {
    setOpenWeeks(p => ({ ...p, [wi]: !p[wi] }));
  }
  function toggleDay(wi: number, di: number) {
    const k = `${wi}_${di}`;
    setOpenDays(p => ({ ...p, [k]: !p[k] }));
  }
  function isDayOpen(wi: number, di: number) { return !!openDays[`${wi}_${di}`]; }

  const sl = search.toLowerCase();

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,.08) 0%, rgba(34,211,238,.06) 100%)',
        border: '1px solid rgba(168,85,247,.18)',
        borderRadius: 'var(--r12)',
        padding: '20px 22px',
        marginBottom: 20,
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>🚀</span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', color: 'var(--purple)', background: 'rgba(168,85,247,.1)',
              padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(168,85,247,.2)',
            }}>
              Notes-Driven Roadmap
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
            "Master the concepts, apply the code."
          </div>
          <div style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.7, maxWidth: 500 }}>
            This roadmap is auto-generated directly from the structured learning notes. 
            Grouped by week, it ensures you hit every concept, command, project, and interview question.
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Done', value: totalDone, color: 'var(--purple)' },
            { label: 'Left', value: totalAll - totalDone, color: 'var(--red)' },
            { label: 'Progress', value: overallPct + '%', color: 'var(--cyan)' },
            { label: 'XP', value: '~' + totalXP, color: 'var(--amber)' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r8)',
              padding: '12px 14px', textAlign: 'center', minWidth: 68,
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OVERALL PROGRESS BAR */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--sub)' }}>
          <span>overall progress</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{overallPct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--s3)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, var(--purple), var(--cyan))', width: overallPct + '%', transition: 'width .5s ease' }} />
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: .35, pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ width: '100%', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r8)', padding: '9px 12px 9px 36px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--body)', outline: 'none' }} />
        </div>
        {(['all', 'todo', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, padding: '8px 14px', borderRadius: 'var(--r8)', border: '1px solid var(--border)', background: filter === f ? 'var(--text)' : 'transparent', color: filter === f ? 'var(--bg)' : 'var(--sub)', cursor: 'pointer', transition: 'all .15s' }}>
            {f === 'all' ? 'All' : f === 'todo' ? '⬜ Todo' : '✅ Done'}
          </button>
        ))}
      </div>

      {/* WEEKS CARDS */}
      {WEEKS.map((week, wi) => {
        const wDone  = weekDone(wi, v3state);
        const wTotal = weekTotal(wi);
        const wPct   = wTotal ? Math.round(wDone / wTotal * 100) : 0;
        const complete = wDone === wTotal && wTotal > 0;
        const inProg   = wDone > 0 && !complete;
        const isOpen   = !!openWeeks[wi];

        const hasMatch = !search || week.title.toLowerCase().includes(sl) ||
          week.data.some(d => d.title.toLowerCase().includes(sl) || d.subtitle.toLowerCase().includes(sl) || d.tasks.some(t => t.t.toLowerCase().includes(sl)));
        if (!hasMatch) return null;
        if (filter === 'done' && wDone === 0) return null;
        if (filter === 'todo' && complete) return null;

        const r = 18, circ = 2 * Math.PI * r;
        const offset = circ - (wPct / 100) * circ;

        return (
          <div key={wi} style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', overflow: 'hidden', marginBottom: 10, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: week.color, borderRadius: '12px 0 0 12px' }} />

            {/* Week header */}
            <button onClick={() => toggleWeek(wi)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px 16px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}>
              <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="22" cy="22" r={r} fill="none" stroke="var(--s3)" strokeWidth="4" />
                  <circle cx="22" cy="22" r={r} fill="none" stroke={week.color} strokeWidth="4" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset .6s ease' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{week.icon}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>{week.daysCount} Days</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>{week.title}</div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 3 }}>{wDone}/{wTotal} tasks</div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0, ...(complete ? { background: 'rgba(168,85,247,.1)', color: 'var(--purple)', border: '1px solid rgba(168,85,247,.22)' } : inProg ? { background: week.dim, color: week.color, border: `1px solid ${week.color}30` } : { background: 'var(--s3)', color: 'var(--muted)' }) }}>
                {complete ? '✓ complete' : inProg ? wPct + '%' : 'not started'}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--muted)', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Week body */}
            <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows .32s cubic-bezier(.16,1,.3,1)' }}>
              <div style={{ overflow: 'hidden' }}>
                {week.data.map((day, di) => {
                  const dayMatch = !search || day.title.toLowerCase().includes(sl) || day.subtitle.toLowerCase().includes(sl) || day.tasks.some(t => t.t.toLowerCase().includes(sl));
                  if (!dayMatch) return null;

                  const dayDoneCount = day.tasks.filter((_, ti) => !!v3state[v3key(wi, di, ti)]).length;
                  const dayComplete  = dayDoneCount === day.tasks.length;
                  if (filter === 'done' && dayDoneCount === 0) return null;
                  if (filter === 'todo' && dayComplete) return null;

                  const dayIsOpen = isDayOpen(wi, di);

                  return (
                    <div key={di} style={{ borderTop: '1px solid var(--border)', background: dayComplete ? 'rgba(168,85,247,.025)' : 'transparent' }}>
                      <div onClick={() => toggleDay(wi, di)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px 12px 26px', cursor: 'pointer', userSelect: 'none' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: week.dim, color: week.color, flexShrink: 0 }}>Day {day.day}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{day.title}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: dayComplete ? 'var(--purple)' : 'var(--muted)', flexShrink: 0 }}>{dayDoneCount}/{day.tasks.length}{dayComplete ? ' ✓' : ''}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--muted)', flexShrink: 0, transform: dayIsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>

                      <div style={{ display: 'grid', gridTemplateRows: dayIsOpen ? '1fr' : '0fr', transition: 'grid-template-rows .25s cubic-bezier(.16,1,.3,1)' }}>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ padding: '0 20px 14px 26px' }}>
                            <div className="bulk-actions" style={{ marginBottom: '8px' }}>
                              <button className="bulk-btn" onClick={(e) => { e.stopPropagation(); bulkMarkDay(wi, di, 'concept'); }}>✓ All Concepts</button>
                              <button className="bulk-btn" onClick={(e) => { e.stopPropagation(); bulkMarkDay(wi, di, 'code'); }}>✓ All Code</button>
                              <button className="bulk-btn" style={{ color: 'var(--purple)' }} onClick={(e) => { e.stopPropagation(); bulkMarkDay(wi, di, 'all'); }}>✓ All Tasks</button>
                            </div>
                            
                            {day.tasks.map((task, ti) => {
                              const taskMatch = !search || task.t.toLowerCase().includes(sl);
                              if (!taskMatch && search) return null;
                              const done = !!v3state[v3key(wi, di, ti)];
                              if (filter === 'done' && !done) return null;
                              if (filter === 'todo' && done) return null;

                              const kindColors: Record<string, string> = { concept: '#38bdf8', code: '#00d9a0', quiz: '#ffc850', project: '#c084fc' };

                              return (
                                <div key={ti} onClick={() => toggle(wi, di, ti)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 10px', borderRadius: 'var(--r8)', cursor: 'pointer', marginBottom: 2, background: 'transparent', borderLeft: '2px solid transparent', transition: 'background .1s' }}>
                                  <div style={{ width: 16, height: 16, borderRadius: 4, border: done ? 'none' : '1.5px solid var(--muted)', background: done ? week.color : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s cubic-bezier(.34,1.56,.64,1)' }}>
                                    {done && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>}
                                  </div>
                                  <span style={{ flex: 1, fontSize: 12, lineHeight: 1.6, color: done ? 'var(--muted)' : 'var(--sub)', textDecoration: done ? 'line-through' : 'none', opacity: done ? .5 : 1 }}>{task.t}</span>
                                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: (kindColors[task.k] || '#888') + '18', color: kindColors[task.k] || '#888', border: '1px solid ' + (kindColors[task.k] || '#888') + '30', flexShrink: 0, marginTop: 2 }}>{task.k}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
