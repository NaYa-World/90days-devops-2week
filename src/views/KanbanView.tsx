import React, { useState } from 'react';

import { PHASES } from '../data/phases';
import { days as notesDays } from '../data/notes';
import { UseAppStateReturnType } from '../hooks/useAppState';

interface KanbanViewProps {
  appState: UseAppStateReturnType;
  switchView: (view: string) => void;
  setFocusDay: (day: string) => void;
}

interface KanbanItem {
  ph?: any;
  pi?: number;
  d: any;
  di: number;
  type: 'v1' | 'notes';
}

function loadV1State(key: string): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function v1key(pi: number, di: number, ti: number) { return `v1_${pi}_${di}_${ti}`; }

function loadNotesState(username: string | null): Record<string, boolean> {
  const user = username ? username.toLowerCase() : 'guest';
  const key = `devops90_notes_completed_${user}`;
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  appState,
  switchView,
  setFocusDay,
}) => {
  const { dayStatus, dayDone, dayTotal, currentUser } = appState;
  const [boardType, setBoardType] = useState<'v1' | 'notes'>('v1');
  const [kbPhase, setKbPhase] = useState<string>('all');

  const userKey = `devops90_v1_tasks_${(currentUser || 'guest').toLowerCase()}`;
  const v1state = loadV1State(userKey);

  const notesState = loadNotesState(currentUser);

  const cols: Record<'backlog' | 'inprogress' | 'review' | 'done', KanbanItem[]> = {
    backlog: [],
    inprogress: [],
    review: [],
    done: [],
  };

  // Populate Kanban columns depending on active board type
  if (boardType === 'v1') {
    PHASES.forEach((ph, pi) => {
      if (kbPhase !== 'all' && kbPhase !== String(pi)) return;
      ph.data.forEach((d, di) => {
        const status = dayStatus(pi, di) as keyof typeof cols;
        cols[status].push({ ph, pi, d, di, type: 'v1' });
      });
    });
  } else if (boardType === 'v2') {
    PHASES_V2.forEach((ph, pi) => {
      if (kbPhase !== 'all' && kbPhase !== String(pi)) return;
      ph.data.forEach((d, di) => {
        const dDone = d.tasks.filter((_: any, ti: any) => !!v1state[v1key(pi, di, ti)]).length;
        const dTotal = d.tasks.length;
        const status = dDone === 0 ? 'backlog' : dDone === dTotal ? 'done' : (dDone / dTotal >= 0.5 ? 'review' : 'inprogress');
        cols[status].push({ ph, pi, d, di, type: 'v2' });
      });
    });
  } else if (boardType === 'notes') {
    notesDays.forEach((d, idx) => {
      const isDone = !!notesState[`day_${d.day}`];
      const status = isDone ? 'done' : 'backlog';
      cols[status].push({ d, di: idx, type: 'notes' });
    });
  }

  const handleCardClick = (item: KanbanItem) => {
    if (item.type === 'v1') {
      setFocusDay(`${item.pi}_${item.di}`);
      switchView('focus');
    } else if (item.type === 'v2') {
      localStorage.setItem('devops90_v1_active_day', `${item.pi}_${item.di}`);
      switchView('roadmap-v2');
    } else if (item.type === 'notes') {
      localStorage.setItem('devops90_active_notes_day', String(item.di));
      switchView('notes');
    }
  };

  const columnsDef = [
    { key: 'backlog' as const, label: 'Backlog', emoji: '○' },
    { key: 'inprogress' as const, label: 'In Progress', emoji: '◑' },
    { key: 'review' as const, label: 'Review', emoji: '◕' },
    { key: 'done' as const, label: 'Done', emoji: '●' },
  ];

  return (
    <div className="wrap" style={{ maxWidth: '1600px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">Task Board</div>
        <h2 className="page-title">Day Progress Kanban</h2>
        <p className="page-sub">Visualize your 90 days of DevOps as active task lanes.</p>
      </div>

      {/* Board Selector & Phase Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div>
          <label className="v4-label" style={{ fontSize: '11px', marginBottom: '5px' }}>Active Board</label>
          <select 
            value={boardType} 
            onChange={e => {
              setBoardType(e.target.value as any);
              setKbPhase('all');
            }}
            className="v4-select"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <option value="v1">DevOps Roadmap</option>
            <option value="notes">Bootcamp Notes (Days 1–4)</option>
          </select>
        </div>

        {boardType !== 'notes' && (
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label className="v4-label" style={{ fontSize: '11px', marginBottom: '5px' }}>Filter by Phase</label>
            <div className="filter-bar" style={{ marginBottom: 0 }}>
              <button 
                className={`fpill ${kbPhase === 'all' ? 'active' : ''}`} 
                onClick={() => setKbPhase('all')}
              >
                All Phases
              </button>
              {PHASES.map((ph, pi) => (
                <button 
                  key={pi}
                  className={`fpill ${kbPhase === String(pi) ? 'active' : ''}`}
                  onClick={() => setKbPhase(String(pi))}
                >
                  {ph.title.split(' — ')[1] || ph.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Kanban Grid */}
      <div className="kanban-grid">
        {columnsDef.map(col => {
          const items = cols[col.key];

          // Hide In Progress & Review columns for notes board type to keep visual clarity
          if (boardType === 'notes' && (col.key === 'inprogress' || col.key === 'review')) {
            return null;
          }

          return (
            <div 
              key={col.key} 
              className="k-col"
              style={boardType === 'notes' ? { gridColumn: 'span 2' } : undefined}
            >
              <div className="k-col-hdr">
                <span className="k-col-title">{col.emoji} {col.label}</span>
                <span className="k-count">{items.length}</span>
              </div>
              <div className="k-body">
                {items.length === 0 ? (
                  <div className="k-empty">Empty</div>
                ) : (
                  items.map(item => {
                    let dDone = 0;
                    let dTotal = 0;
                    let pct = 0;
                    let dayNumStr = '';
                    let labelStr = '';
                    let accentColor = '#888';

                    if (item.type === 'v1') {
                      dDone = dayDone(item.pi!, item.di);
                      dTotal = dayTotal(item.pi!, item.di);
                      pct = dTotal ? Math.round((dDone / dTotal) * 100) : 0;
                      dayNumStr = item.d.day;
                      labelStr = item.d.label;
                      accentColor = item.ph.color;
                    } else if (item.type === 'v2') {
                      dDone = item.d.tasks.filter((_: any, ti: any) => !!v1state[v1key(item.pi!, item.di, ti)]).length;
                      dTotal = item.d.tasks.length;
                      pct = dTotal ? Math.round((dDone / dTotal) * 100) : 0;
                      dayNumStr = item.d.day;
                      labelStr = item.d.label;
                      accentColor = item.ph.color;
                    } else if (item.type === 'notes') {
                      const isDone = !!notesState[`day_${item.d.day}`];
                      dDone = isDone ? 1 : 0;
                      dTotal = 1;
                      pct = isDone ? 100 : 0;
                      dayNumStr = `Day ${item.d.day}`;
                      labelStr = item.d.title.split('+')[0].split('—')[0].trim();
                      accentColor = item.d.color;
                    }

                    return (
                      <div 
                        key={item.type === 'notes' ? `notes_${item.di}` : `${item.type}_${item.pi}_${item.di}`} 
                        className="k-card" 
                        style={{ ['--kc' as any]: accentColor } as React.CSSProperties}
                        onClick={() => handleCardClick(item)}
                      >
                        <div className="k-card-day">{dayNumStr}</div>
                        <div className="k-card-label">{labelStr}</div>
                        <div className="k-card-pct">{item.type === 'notes' ? (pct === 100 ? 'Completed ✓' : 'Backlog') : `${dDone}/${dTotal} (${pct}%)`}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default KanbanView;
