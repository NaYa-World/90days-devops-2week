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
  const [selectedRingIdx, setSelectedRingIdx] = useState<number | null>(null);
  
  // Get date range for calendar
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(now.toDateString());

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[currentMonth];

  // Calendar Math
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday ...
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

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

  // Padding cells for heatmap
  for (let pad = 0; pad < startDayOfWeek; pad++) {
    heatmapCells.push(<div key={`pad-${pad}`} className="heat-cell" style={{ visibility: 'hidden' }}></div>);
  }

  // Active cells for heatmap
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

  // SVG Rings configuration
  const conceptTotal = tot.concept || 0;
  const conceptDone = don.concept || 0;
  const conceptPct = conceptTotal ? conceptDone / conceptTotal : 0;

  const codeTotal = tot.code || 0;
  const codeDone = don.code || 0;
  const codePct = codeTotal ? codeDone / codeTotal : 0;

  const quizTotal = tot.quiz || 0;
  const quizDone = don.quiz || 0;
  const quizPct = quizTotal ? quizDone / quizTotal : 0;

  const projectTotal = tot.project || 0;
  const projectDone = don.project || 0;
  const projectPct = projectTotal ? projectDone / projectTotal : 0;

  const rings = [
    { label: 'Concepts', pct: conceptPct, color: 'var(--blue)', done: conceptDone, total: conceptTotal, radius: 70, strokeWidth: 10 },
    { label: 'Code', pct: codePct, color: 'var(--green)', done: codeDone, total: codeTotal, radius: 55, strokeWidth: 10 },
    { label: 'Quizzes', pct: quizPct, color: 'var(--amber)', done: quizDone, total: quizTotal, radius: 40, strokeWidth: 10 },
    { label: 'Projects', pct: projectPct, color: 'var(--purple)', done: projectDone, total: projectTotal, radius: 25, strokeWidth: 10 },
  ];

  // Build current month calendar cells
  const calendarCells = [];
  // Padding cells for month start
  for (let pad = 0; pad < startDay; pad++) {
    calendarCells.push(<div key={`mpad-${pad}`} style={{ opacity: 0.15, fontSize: '11px', textAlign: 'center', padding: '6px' }}>—</div>);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(currentYear, currentMonth, d);
    const cellDateStr = cellDate.toDateString();
    const cellCount = hist[cellDateStr] || 0;
    const isSelected = selectedCalDate === cellDateStr;
    const isToday = new Date().toDateString() === cellDateStr;

    calendarCells.push(
      <div
        key={`mday-${d}`}
        onClick={() => setSelectedCalDate(cellDateStr)}
        style={{
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isSelected ? 'rgba(0, 217, 160, 0.12)' : 'var(--s2)',
          border: isSelected 
            ? '1.5px solid var(--green)' 
            : isToday 
              ? '1px dashed var(--blue)' 
              : '1px solid var(--border)',
          borderRadius: '10px',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: isToday || isSelected ? 700 : 500, color: isToday ? 'var(--blue)' : 'var(--text)' }}>
          {d}
        </span>
        {cellCount > 0 && (
          <span 
            style={{ 
              fontSize: '10px', 
              position: 'absolute', 
              bottom: '2px', 
              animation: 'pulse 2s infinite ease-in-out',
              filter: 'drop-shadow(0 0 4px var(--green))' 
            }}
            title={`${cellCount} tasks`}
          >
            🔥
          </span>
        )}
      </div>
    );
  }

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

      {/* SVG Rings Card */}
      <div className="report-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '20px', marginBottom: '20px' }}>
        <div className="report-section-title" style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '14px' }}>
          Interactive Activity Rings
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="180" height="180" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.45))' }}>
              {rings.map((ring, idx) => {
                const C = 2 * Math.PI * ring.radius;
                const offset = C * (1 - Math.min(1, Math.max(0, ring.pct)));
                const isSelected = selectedRingIdx === idx;
                
                return (
                  <g key={ring.label} style={{ cursor: 'pointer' }} onClick={() => setSelectedRingIdx(isSelected ? null : idx)}>
                    <circle
                      cx="80"
                      cy="80"
                      r={ring.radius}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth={ring.strokeWidth}
                      opacity="0.08"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={ring.radius}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth={ring.strokeWidth}
                      strokeDasharray={C}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      opacity={selectedRingIdx === null || isSelected ? 1 : 0.3}
                      style={{ transition: 'stroke-dashoffset 0.6s ease, opacity 0.2s' }}
                    />
                  </g>
                );
              })}
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                {progressPct}%
              </span>
              <span style={{ fontSize: '9px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Overall
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
              {selectedRingIdx !== null ? rings[selectedRingIdx].label : 'DevOps Activity Rings'}
            </h3>
            {selectedRingIdx !== null ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: rings[selectedRingIdx].color }}>
                    {Math.round(rings[selectedRingIdx].pct * 100)}%
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--sub)' }}>completed</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--sub)', marginTop: '4px' }}>
                  {rings[selectedRingIdx].done} of {rings[selectedRingIdx].total} tasks check-marked
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedRingIdx(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '11px', cursor: 'pointer', padding: 0, marginTop: '10px', textDecoration: 'underline' }}
                >
                  Reset View
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--sub)', lineHeight: '1.6' }}>
                  Tap on individual rings in the chart to inspect completion counts for Concepts, Code, Quizzes, and Projects.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                  {rings.map((r, i) => (
                    <div 
                      key={r.label} 
                      onClick={() => setSelectedRingIdx(i)} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        cursor: 'pointer', 
                        background: 'var(--s2)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '12px', 
                        padding: '6px 12px', 
                        fontSize: '11.5px',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = r.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color }} />
                      <span style={{ color: 'var(--text)' }}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID */}
      <div id="stats-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Side: Progress Stats */}
        <div className="stat-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Readiness Score Card */}
          <div className="stat-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px' }}>
            <div className="stat-card-title" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Readiness Score</div>
            <div
              style={{
                fontSize: '46px',
                fontWeight: 800,
                fontFamily: 'var(--mono)',
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
          <div className="stat-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px' }}>
            <div className="stat-card-title" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>XP & Level</div>
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
          <div className="stat-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px' }}>
            <div className="stat-card-title" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Task Types</div>
            {taskTypes.map(type => {
              const t = tot[type.k] || 0;
              const d = don[type.k] || 0;
              const pct = t ? Math.round((d / t) * 100) : 0;

              return (
                <div key={type.k} className="type-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="type-label" style={{ color: type.color, width: '60px', textTransform: 'uppercase', fontSize: '9px', fontFamily: 'var(--mono)' }}>
                    {type.label}
                  </span>
                  <div className="type-bar-track" style={{ flex: 1, height: '6px', background: 'var(--s3)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div className="type-bar-fill" style={{ height: '100%', width: `${pct}%`, background: type.color, borderRadius: '3px' }}></div>
                  </div>
                  <span className="type-count" style={{ width: '45px', textAlign: 'right', fontSize: '11px', fontFamily: 'var(--mono)' }}>
                    {d}/{t}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Phase Progress Card */}
          <div className="stat-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px' }}>
            <div className="stat-card-title" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Phase Progress</div>
            {PHASES.map((ph, pi) => {
              const phTotal = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
              const phDone = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
              const pct = phTotal ? Math.round((phDone / phTotal) * 100) : 0;
              const shortName = `P${pi + 1}`;

              return (
                <div key={pi} className="type-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="type-label" style={{ color: ph.color, width: '30px', fontSize: '10px', fontFamily: 'var(--mono)' }}>
                    {shortName}
                  </span>
                  <div className="type-bar-track" style={{ flex: 1, height: '6px', background: 'var(--s3)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div className="type-bar-fill" style={{ height: '100%', width: `${pct}%`, background: ph.color, borderRadius: '3px' }}></div>
                  </div>
                  <span className="type-count" style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'var(--mono)' }}>{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Low Confidence Tasks Card */}
          {lowConf.length > 0 && (
            <div className="stat-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px' }}>
              <div className="stat-card-title" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>⚠ Low Confidence Tasks (★1–2) — Scheduled for Review</div>
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
          <div className="report-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '15px' }}>
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

        {/* Right Side: Heatmap Card & Month Streak Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Month Streak Calendar */}
          <div className="stat-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '20px' }}>
            <div className="stat-card-title" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>
              Streak Calendar ({currentMonthName} {currentYear})
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '12px' }}>
              {daysOfWeek.map((day, idx) => (
                <div key={`mlbl-${idx}`} style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textAlign: 'center', fontWeight: 600 }}>
                  {day}
                </div>
              ))}
              {calendarCells}
            </div>

            {/* Daily summary panel */}
            {selectedCalDate && (
              <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', marginTop: '12px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Daily Summary Log
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>
                  {new Date(selectedCalDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--sub)', marginTop: '6px', lineHeight: 1.5 }}>
                  {hist[selectedCalDate] ? (
                    <div>
                      🔥 You completed <strong style={{ color: 'var(--green)' }}>{hist[selectedCalDate]} tasks</strong> on this day!
                      <br />
                      Keep up the fantastic momentum on your DevOps journey.
                    </div>
                  ) : (
                    <div style={{ color: 'var(--muted)' }}>
                      No tasks completed on this date.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="stat-card" style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '20px' }}>
            <div className="stat-card-title" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px' }}>
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
