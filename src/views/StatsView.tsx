import React, { useState } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { PHASES } from '../data/phases';
import { showToast } from '../components/Toast';

interface StatsViewProps {
  appState: UseAppStateReturnType;
}

export const StatsView: React.FC<StatsViewProps> = ({ appState }) => {
  const {
    state,
    getLevelInfo,
    calcXP,
    readinessScore,
    typeCounts,
    lowConfTasks,
    dayDone,
    dayTotal,
    weekData,
    studyHours,
    cntDone,
    cntTotal,
    calcETA
  } = appState;

  const [reportWeekOffset, setReportWeekOffset] = useState(0);

  let maxOffset = 0;
  const histDates = Object.keys(state.history || {});
  if (histDates.length > 0) {
    const firstDateStr = histDates.reduce((a, b) => (new Date(a) < new Date(b) ? a : b));
    
    const startOfWeekNow = new Date();
    const dayNow = startOfWeekNow.getDay();
    const diffNow = startOfWeekNow.getDate() - dayNow + (dayNow === 0 ? -6 : 1);
    startOfWeekNow.setDate(diffNow);
    startOfWeekNow.setHours(0, 0, 0, 0);

    const firstDate = new Date(firstDateStr);
    const dayFirst = firstDate.getDay();
    const diffFirst = firstDate.getDate() - dayFirst + (dayFirst === 0 ? -6 : 1);
    const startOfWeekFirst = new Date(firstDate);
    startOfWeekFirst.setDate(diffFirst);
    startOfWeekFirst.setHours(0, 0, 0, 0);

    const diffTime = startOfWeekNow.getTime() - startOfWeekFirst.getTime();
    maxOffset = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)));
  }


  const levelInfo = getLevelInfo();
  const readiness = readinessScore();
  const xp = calcXP();
  const { tot, don } = typeCounts();
  const lowConf = lowConfTasks();

  const done = cntDone();
  const total = cntTotal();
  const progressPct = total ? Math.round((done / total) * 100) : 0;

  const wd = weekData(reportWeekOffset);
  const weekTasks = wd.reduce((a, d) => a + d.count, 0);
  const activeDays = wd.filter(d => d.count > 0 && !d.isFuture).length;
  const wLabel = reportWeekOffset === 0 ? 'This week' : reportWeekOffset === 1 ? 'Last week' : `${reportWeekOffset} weeks ago`;

  const eta = calcETA();

  const handleExport = () => {
    let text = `90 Days of DevOps v4 — Weekly Report\n==========================================\nGenerated: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    text += `OVERALL: ${done}/${total} tasks (${progressPct}%) | XP: ${calcXP()} | Readiness: ${readinessScore()}%\n`;
    text += `Level: ${levelInfo.lvl.title}\n\n`;
    text += `PHASE BREAKDOWN:\n`;
    PHASES.forEach((ph, pi) => {
      const phTotal = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
      const phDone = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
      text += `${ph.title}: ${phDone}/${phTotal}\n`;
    });
    
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'devops90-v4-report.txt';
      a.click();
      URL.revokeObjectURL(url);
      showToast('✓ Report exported successfully', 'rgba(0,217,160,.1)');
    } catch (_) {
      showToast('Export failed', 'var(--red)');
    }
  };

  const maxCount = Math.max(1, ...wd.map(d => d.count));

  // Heatmap rendering logic (last 84 days)
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const hist = state.history || {};

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 83);
  const startDayOfWeek = startDate.getDay();

  const heatmapCells: React.ReactNode[] = [];

  // Padding cells
  for (let pad = 0; pad < startDayOfWeek; pad++) {
    heatmapCells.push(<div key={`pad-${pad}`} className="heat-cell" style={{ visibility: 'hidden' }}></div>);
  }

  // Active cells
  for (let i = 0; i < 84; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toDateString();
    const count = hist[dateStr] || 0;

    let cellClass = 'heat-cell';
    if (count >= 15) cellClass += ' h4';
    else if (count >= 10) cellClass += ' h3';
    else if (count >= 5) cellClass += ' h2';
    else if (count > 0) cellClass += ' h1';

    heatmapCells.push(
      <div
        key={`cell-${i}`}
        className={cellClass}
        title={`${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${count} tasks`}
      ></div>
    );
  }

  const taskTypes = [
    { k: 'concept' as const, label: 'concept', color: '#4fa8ff' },
    { k: 'code' as const, label: 'code', color: '#00d9a0' },
    { k: 'quiz' as const, label: 'quiz', color: '#ffc850' },
    { k: 'project' as const, label: 'project', color: '#c084fc' },
  ];

  return (
    <div className="wrap">
      <div style={{ marginBottom: '14px' }}>
        <div className="eyebrow">Metrics & Reports</div>
        <h2 className="page-title">Progress & Weekly Report</h2>
      </div>

      {/* OVERALL STATS MODULE */}
      <div className="report-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '15px', marginBottom: '20px' }}>
        <div className="report-section-title" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px' }}>
          Overall Overview
        </div>
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          <div className="sc" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '10px 6px', textAlign: 'center' }}>
            <div className="sc-num" style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
              {done}
            </div>
            <div className="sc-lbl" style={{ fontSize: '9px', color: 'var(--sub)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
              Tasks Done
            </div>
          </div>
          <div className="sc" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '10px 6px', textAlign: 'center' }}>
            <div className="sc-num" style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
              {state.streak}
            </div>
            <div className="sc-lbl" style={{ fontSize: '9px', color: 'var(--sub)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
              🔥 Streak
            </div>
          </div>
          <div className="sc" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '10px 6px', textAlign: 'center' }}>
            <div className="sc-num" style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--teal)' }}>
              {studyHours()}h
            </div>
            <div className="sc-lbl" style={{ fontSize: '9px', color: 'var(--sub)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
              ⏱ Studied
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID */}
      <div id="stats-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Side: Progress Stats */}
        <div className="stat-grid">
          {/* Readiness Score Card */}
          <div className="stat-card">
            <div className="stat-card-title">Readiness Score</div>
            <div
              style={{
                fontSize: '46px',
                fontWeight: 800,
                family: 'var(--mono)',
                background: 'linear-gradient(135deg,var(--green),var(--blue))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {readiness}
              <span style={{ fontSize: '22px' }}>%</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--sub)', marginTop: '6px' }}>
              Quizzes 30% · Projects 30% · Code 25% · Concepts 15%
            </div>
          </div>

          {/* XP & Level Card */}
          <div className="stat-card">
            <div className="stat-card-title">XP & Level</div>
            <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
              {xp} <span style={{ fontSize: '16px' }}>XP</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, margin: '6px 0 4px', color: levelInfo.lvl.color }}>
              {levelInfo.lvl.title}
            </div>
            <div style={{ height: '5px', background: 'var(--s3)', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
              <div style={{ height: '100%', background: levelInfo.lvl.color, width: `${levelInfo.pct}%`, borderRadius: '3px', transition: 'width .5s' }}></div>
            </div>
            {levelInfo.next ? (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)' }}>
                {levelInfo.next.min - xp} XP → {levelInfo.next.title}
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)' }}>MAX LEVEL</div>
            )}
          </div>

          {/* Task Types Card */}
          <div className="stat-card">
            <div className="stat-card-title">Task Types</div>
            {taskTypes.map(type => {
              const t = tot[type.k] || 0;
              const d = don[type.k] || 0;
              const pct = t ? Math.round((d / t) * 100) : 0;

              return (
                <div key={type.k} className="type-row">
                  <span className="type-label" style={{ color: type.color }}>
                    {type.label}
                  </span>
                  <div className="type-bar-track">
                    <div className="type-bar-fill" style={{ width: `${pct}%`, background: type.color }}></div>
                  </div>
                  <span className="type-count">
                    {d}/{t}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Phase Progress Card */}
          <div className="stat-card">
            <div className="stat-card-title">Phase Progress</div>
            {PHASES.map((ph, pi) => {
              const phTotal = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
              const phDone = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
              const pct = phTotal ? Math.round((phDone / phTotal) * 100) : 0;
              const shortName = `P${pi + 1}`;

              return (
                <div key={pi} className="type-row">
                  <span className="type-label" style={{ color: ph.color, fontSize: '10px' }}>
                    {shortName}
                  </span>
                  <div className="type-bar-track">
                    <div className="type-bar-fill" style={{ width: `${pct}%`, background: ph.color }}></div>
                  </div>
                  <span className="type-count">{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Low Confidence Tasks Card */}
          {lowConf.length > 0 && (
            <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
              <div className="stat-card-title">⚠ Low Confidence Tasks (★1–2) — Scheduled for Review</div>
              {lowConf.slice(0, 10).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '12px',
                    color: 'var(--sub)',
                    marginBottom: '6px',
                    paddingBottom: '5px',
                    borderBottom: '1px solid var(--s3)'
                  }}
                >
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>★{item.conf}</span>{' '}
                  {item.d.day}: {item.task.t.substring(0, 80)}
                </div>
              ))}
            </div>
          )}

          {/* WEEKLY REPORT MODULE */}
          <div className="report-card" style={{ gridColumn: '1 / -1', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '15px' }}>
            <div className="report-week-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', justifyContent: 'center' }}>
              <button
                className="report-week-btn"
                disabled={reportWeekOffset >= maxOffset}
                onClick={() => setReportWeekOffset(prev => prev + 1)}
                style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: 'var(--r8)', cursor: reportWeekOffset >= maxOffset ? 'not-allowed' : 'pointer', opacity: reportWeekOffset >= maxOffset ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className="report-week-label" style={{ fontWeight: 600, fontSize: '13px', minWidth: '130px', textAlign: 'center' }}>
                {wLabel}
              </span>
              <button
                className="report-week-btn"
                disabled={reportWeekOffset === 0}
                onClick={() => setReportWeekOffset(prev => Math.max(0, prev - 1))}
                style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: 'var(--r8)', cursor: reportWeekOffset === 0 ? 'not-allowed' : 'pointer', opacity: reportWeekOffset === 0 ? 0.5 : 1 }}
              >
                →
              </button>
            </div>

            <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '7px', marginBottom: '12px' }}>
              <div className="report-stat" style={{ textAlign: 'center' }}>
                <div className="report-stat-num" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
                  {weekTasks}
                </div>
                <div className="report-stat-lbl" style={{ fontSize: '9px', color: 'var(--sub)', fontFamily: 'var(--mono)' }}>
                  Tasks
                </div>
              </div>
              <div className="report-stat" style={{ textAlign: 'center' }}>
                <div className="report-stat-num" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>
                  {activeDays}/7
                </div>
                <div className="report-stat-lbl" style={{ fontSize: '9px', color: 'var(--sub)', fontFamily: 'var(--mono)' }}>
                  Active days
                </div>
              </div>
              <div className="report-stat" style={{ textAlign: 'center' }}>
                <div className="report-stat-num" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
                  {studyHours()}h
                </div>
                <div className="report-stat-lbl" style={{ fontSize: '9px', color: 'var(--sub)', fontFamily: 'var(--mono)' }}>
                  Pomo hrs
                </div>
              </div>
              <div className="report-stat" style={{ textAlign: 'center' }}>
                <div className="report-stat-num" style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--purple)' }}>
                  {readinessScore()}%
                </div>
                <div className="report-stat-lbl" style={{ fontSize: '9px', color: 'var(--sub)', fontFamily: 'var(--mono)' }}>
                  Readiness
                </div>
              </div>
            </div>

            <div className="report-section-title" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '6px' }}>
              Day by day
            </div>
            <div id="report-day-bars">
              {wd.map((day, idx) => {
                const barPct = day.isFuture ? 0 : Math.round((day.count / maxCount) * 100);

                return (
                  <div key={idx} className="day-bar-row" style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                    <span className="day-bar-name" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', width: '28px' }}>
                      {day.name}
                    </span>
                    <div className="day-bar-track" style={{ flex: 1, height: '7px', background: 'var(--s3)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        className="day-bar-fill"
                        style={{
                          height: '100%',
                          background: day.isFuture ? 'var(--s3)' : 'var(--green)',
                          borderRadius: '4px',
                          width: `${barPct}%`,
                          transition: 'width .4s'
                        }}
                      ></div>
                    </div>
                    <span className="day-bar-count" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', width: '48px', textAlign: 'right' }}>
                      {day.isFuture ? '—' : `${day.count} tasks`}
                    </span>
                  </div>
                );
              })}
            </div>

            {eta && eta.etaBest && eta.etaWorst && (
              <div className="eta-band" id="eta-band" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r8)', padding: '8px 11px', marginTop: '7px' }}>
                <div className="eta-band-title" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', marginBottom: '4px' }}>
                  📅 ETA BAND
                </div>
                <div id="eta-band-content" style={{ fontSize: '12px', color: 'var(--sub)' }}>
                  Best case: <strong style={{ color: 'var(--green)' }}>{eta.etaBest}</strong> · Likely:{' '}
                  <strong style={{ color: 'var(--amber)' }}>{eta.eta}</strong> · Worst case:{' '}
                  <strong style={{ color: 'var(--red)' }}>{eta.etaWorst}</strong>
                  <br />
                  <span style={{ fontSize: '11px', fontFamily: 'var(--mono)' }}>
                    Based on {eta.avgPerDay} avg tasks/day over last 7 active days
                  </span>
                </div>
              </div>
            )}

            <button
              className="report-export-btn"
              onClick={handleExport}
              style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '10px', padding: '5px 12px', borderRadius: 'var(--r8)', cursor: 'pointer', marginTop: '10px', width: '100%' }}
            >
              ↓ Export Report
            </button>
          </div>
        </div>

        {/* Right Side: Heatmap Card */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
          
          <div className="stat-card" style={{ flexShrink: 0 }}>
            <div className="stat-card-title" style={{ marginBottom: '10px' }}>
              Activity Heatmap (last 84 days)
            </div>
            <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', maxWidth: '300px', margin: '0 auto' }}>
              {daysOfWeek.map((day, idx) => (
                <div key={`lbl-${idx}`} className="heat-day-lbl" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', textAlign: 'center', marginBottom: '4px' }}>
                  {day}
                </div>
              ))}
              {heatmapCells}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default StatsView;
