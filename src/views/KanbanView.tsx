import React, { useState } from 'react';

import { PHASES } from '../data/phases';
import { PHASES_V4 } from '../data/phases_v4';
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
  type: 'v4' | 'v1' | 'notes';
}



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
  const [boardType, setBoardType] = useState<'v4' | 'v1' | 'notes'>('v4');
  const [kbPhase, setKbPhase] = useState<string>('all');

  const v4stateKey = `devops90_v4_tasks_${(currentUser || 'guest').toLowerCase()}`;
  const v4artifactsKey = `devops90_v4_artifacts_${(currentUser || 'guest').toLowerCase()}`;
  const [v4state] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(v4stateKey) || '{}'); } catch { return {}; }
  });
  const [v4artifacts] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(v4artifactsKey) || '{}'); } catch { return {}; }
  });

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };



  const notesState = loadNotesState(currentUser);

  const cols: Record<'backlog' | 'inprogress' | 'review' | 'done', KanbanItem[]> = {
    backlog: [],
    inprogress: [],
    review: [],
    done: [],
  };

  // Populate Kanban columns depending on active board type
  if (boardType === 'v4') {
    PHASES_V4.forEach((ph, pi) => {
      if (kbPhase !== 'all' && kbPhase !== String(pi)) return;
      ph.dayTasks.forEach((d, di) => {
        const doneCount = d.tasks.filter((_, ti) => !!v4state[`v4_${pi}_${di}_${ti}`]).length;
        const totalCount = d.tasks.length;
        const url = v4artifacts[`${pi}_${di}`] || '';
        const urlValid = isValidUrl(url);

        let status: keyof typeof cols = 'backlog';
        if (doneCount === 0) {
          status = 'backlog';
        } else if (doneCount === totalCount) {
          status = urlValid ? 'done' : 'review';
        } else {
          status = 'inprogress';
        }

        cols[status].push({ ph, pi, d, di, type: 'v4' });
      });
    });
  } else if (boardType === 'v1') {
    PHASES.forEach((ph, pi) => {
      if (kbPhase !== 'all' && kbPhase !== String(pi)) return;
      ph.data.forEach((d, di) => {
        const status = dayStatus(pi, di) as keyof typeof cols;
        cols[status].push({ ph, pi, d, di, type: 'v1' });
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
    if (item.type === 'v4' || item.type === 'v1') {
      setFocusDay(`${item.pi}_${item.di}`);
      switchView('focus');
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
            <option value="v4">🔥 v4 Roadmap</option>
            <option value="v1">DevOps Roadmap (v1)</option>
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
              {(boardType === 'v4' ? PHASES_V4 : PHASES).map((ph, pi) => (
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
                    let pctStr = '';

                    if (item.type === 'v4') {
                      const doneCount = (item.d.tasks as string[]).filter((_: string, ti: number) => !!v4state[`v4_${item.pi}_${item.di}_${ti}`]).length;
                      const totalCount = item.d.tasks.length;
                      const hasUrl = isValidUrl(v4artifacts[`${item.pi}_${item.di}`] || '');
                      pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
                      dayNumStr = `Day ${item.di + 1}`;
                      labelStr = item.d.title;
                      accentColor = '#ef4444'; // Red-orange accent for V4
                      dDone = doneCount;
                      dTotal = totalCount;
                      pctStr = (doneCount === totalCount) 
                        ? (hasUrl ? 'Completed ✓' : 'Pending Link ⚠️') 
                        : `${doneCount}/${totalCount} (${pct}%)`;
                    } else if (item.type === 'v1') {
                      dDone = dayDone(item.pi!, item.di);
                      dTotal = dayTotal(item.pi!, item.di);
                      pct = dTotal ? Math.round((dDone / dTotal) * 100) : 0;
                      dayNumStr = item.d.day;
                      labelStr = item.d.label;
                      accentColor = item.ph.color;
                      pctStr = `${dDone}/${dTotal} (${pct}%)`;
                    } else if (item.type === 'notes') {
                      const isDone = !!notesState[`day_${item.d.day}`];
                      dDone = isDone ? 1 : 0;
                      dTotal = 1;
                      pct = isDone ? 100 : 0;
                      dayNumStr = `Day ${item.d.day}`;
                      labelStr = item.d.title.split('+')[0].split('—')[0].trim();
                      accentColor = item.d.color;
                      pctStr = isDone ? 'Completed ✓' : 'Backlog';
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
                        <div className="k-card-pct">{pctStr}</div>
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
