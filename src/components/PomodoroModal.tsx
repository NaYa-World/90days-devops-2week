import React, { useState, useEffect, useRef } from 'react';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  pomoSessions: number;
  incrementSessions: () => void;
  studyHours: string;
  addNotification: (text: string) => void;
}

type TimerMode = 'focus' | 'short' | 'long';

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  pomoSessions,
  incrementSessions,
  studyHours,
  addNotification
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [focusMins, setFocusMins] = useState<number>(25);
  const [shortMins, setShortMins] = useState<number>(5);
  const [longMins, setLongMins] = useState<number>(15);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getDuration = (m: TimerMode) => {
    if (m === 'focus') return focusMins * 60;
    if (m === 'short') return shortMins * 60;
    return longMins * 60;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getDuration(newMode));
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    // Sync time left when durations change and timer is NOT running
    if (!isRunning) {
      setTimeLeft(getDuration(mode));
    }
  }, [focusMins, shortMins, longMins]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            
            // Finished session!
            if (mode === 'focus') {
              incrementSessions();
              addNotification('🏆 Focus session complete! Time for a break.');
            } else {
              addNotification('⏱ Break finished! Ready to focus?');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, incrementSessions, addNotification, focusMins, shortMins, longMins]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // SVG ring variables
  const r = 70;
  const circ = 2 * Math.PI * r; // ~439.8
  const totalDur = getDuration(mode);
  const strokeDashoffset = circ - (timeLeft / totalDur) * circ;

  return (
    <div 
      className={`modal ${isOpen ? 'open' : ''}`} 
      id="pomo-modal"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="modal-box">
        <button className="modal-close" id="pomo-close" onClick={onClose}>✕</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div className="modal-title" style={{ margin: 0 }}>⏱ Focus Timer</div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'var(--s2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--sub)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ⚙ Setup
          </button>
        </div>

        {/* CUSTOM SETUP PANELS */}
        {showSettings && (
          <div style={{
            marginTop: '8px',
            marginBottom: '16px',
            padding: '12px',
            background: 'var(--s2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r8)',
            fontSize: '12.5px',
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Timer Durations (Minutes)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--sub)', fontSize: '10px', marginBottom: '4px' }}>Focus</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={focusMins} 
                  onChange={e => setFocusMins(Math.max(1, Math.min(60, parseInt(e.target.value) || 25)))} 
                  style={{ width: '100%', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 6px', borderRadius: '4px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--sub)', fontSize: '10px', marginBottom: '4px' }}>Short Break</label>
                <input 
                  type="number" 
                  min="1" 
                  max="30" 
                  value={shortMins} 
                  onChange={e => setShortMins(Math.max(1, Math.min(30, parseInt(e.target.value) || 5)))} 
                  style={{ width: '100%', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 6px', borderRadius: '4px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--sub)', fontSize: '10px', marginBottom: '4px' }}>Long Break</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={longMins} 
                  onChange={e => setLongMins(Math.max(1, Math.min(60, parseInt(e.target.value) || 15)))} 
                  style={{ width: '100%', background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 6px', borderRadius: '4px', outline: 'none' }} 
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="pomo-mode-row">
          <button 
            className={`pomo-mode-btn ${mode === 'focus' ? 'active' : ''}`} 
            onClick={() => handleModeChange('focus')}
          >
            {focusMins}m
          </button>
          <button 
            className={`pomo-mode-btn ${mode === 'short' ? 'active' : ''}`} 
            onClick={() => handleModeChange('short')}
          >
            {shortMins}m
          </button>
          <button 
            className={`pomo-mode-btn ${mode === 'long' ? 'active' : ''}`} 
            onClick={() => handleModeChange('long')}
          >
            {longMins}m
          </button>
        </div>

        <div className="pomo-ring">
          <svg className="pomo-svg" width="140" height="140" viewBox="0 0 170 170">
            <circle className="pomo-track" cx="85" cy="85" r={r} />
            <circle 
              className="pomo-prog" 
              id="pomo-prog" 
              cx="85" 
              cy="85" 
              r={r} 
              style={{
                strokeDasharray: `${circ}`,
                strokeDashoffset: `${strokeDashoffset}`
              }}
            />
          </svg>
          <div className="pomo-time">
            <div className="pomo-time-num" id="pomo-num">
              {formatTime(timeLeft)}
            </div>
            <div className="pomo-time-lbl" id="pomo-lbl">
              {mode === 'focus' ? 'FOCUS' : 'BREAK'}
            </div>
          </div>
        </div>

        <div className="pomo-controls">
          <button className="pomo-ctrl-btn reset" id="pomo-reset" onClick={resetTimer}>↺</button>
          <button className="pomo-ctrl-btn main" id="pomo-play" onClick={toggleTimer}>
            {isRunning ? '⏸' : '▶'}
          </button>
        </div>

        <div className="pomo-sessions" id="pomo-sessions">
          Sessions: {pomoSessions} · {studyHours} hrs
        </div>
      </div>
    </div>
  );
};
export default PomodoroModal;
