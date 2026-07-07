import React, { useState } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { AIService, getActiveProvider, formatProviderName } from '../components/AIService';
import { showToast } from '../components/Toast';
import { ApiKeySetupModal } from '../components/ApiKeySetupModal';

// A simple local Markdown renderer to avoid installing external packages
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {lines.map((line, idx) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: '4px' }} />;
        
        // Headers
        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#fff' }}>{trimmed.replace('### ', '')}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} style={{ margin: '12px 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#fff' }}>{trimmed.replace('## ', '')}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} style={{ margin: '16px 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#fff' }}>{trimmed.replace('# ', '')}</h2>;
        }

        // List items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          return (
            <li key={idx} style={{ marginLeft: '16px', fontSize: '13px', color: '#d1d5db', listStyleType: 'disc' }}>
              {renderBoldAndCodeText(content)}
            </li>
          );
        }
        
        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', marginLeft: '8px', fontSize: '13px', color: '#d1d5db' }}>
              <span style={{ fontWeight: 700, color: '#7c6fff' }}>{numMatch[1]}.</span>
              <span>{renderBoldAndCodeText(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx} style={{ margin: 0, fontSize: '13px', color: '#d1d5db', lineHeight: '1.6' }}>{renderBoldAndCodeText(trimmed)}</p>;
      })}
    </div>
  );
};

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
              padding: '2px 4px', 
              borderRadius: '4px',
              color: '#38bdf8',
              fontSize: '11px'
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

interface DashboardViewProps {
  appState: UseAppStateReturnType;
  switchView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ appState, switchView }) => {
  const {
    state,
    getLevelInfo,
    calcXP,
    readinessScore,
    lowConfTasks,
    studyHours,
    cntDone,
    cntTotal,
    saveDashboardFeedback
  } = appState;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const levelInfo = getLevelInfo();
  const readiness = readinessScore();
  const xp = calcXP();
  const lowConf = lowConfTasks();
  const done = cntDone();
  const total = cntTotal();
  const progressPct = total ? Math.round((done / total) * 100) : 0;

  // Counts of artifacts
  const v4ArtifactsCount = Object.keys(state.v4Artifacts || {}).filter(k => state.v4Artifacts[k]).length;

  const handleGenerateFeedback = async () => {
    setIsGenerating(true);
    try {
      const stats = {
        tasksDone: done,
        totalTasks: total,
        streak: state.streak || 0,
        studyHours: Number(studyHours() || 0),
        readiness,
        xp,
        level: levelInfo.lvl.title,
        lowConfCount: lowConf.length,
        v4ArtifactsCount
      };

      const feedback = await AIService.generatePerformanceFeedback(stats);
      saveDashboardFeedback(feedback);
      showToast('✓ AI Feedback updated and auto-saved!', 'rgba(0,217,160,.1)');
    } catch (err: any) {
      if (err.message === 'NO_API_KEY' || err.message?.includes('API key')) {
        setIsApiKeyModalOpen(true);
      } else {
        showToast(err.message || 'Failed to generate feedback', 'var(--red)');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Heatmap rendering logic (last 84 days)
  const hist = state.history || {};
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 83);
  const startDayOfWeek = startDate.getDay();

  const heatmapCells: React.ReactNode[] = [];

  // Padding cells for heatmap alignment
  for (let pad = 0; pad < startDayOfWeek; pad++) {
    heatmapCells.push(
      <div 
        key={`pad-${pad}`} 
        style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '2px', 
          background: 'transparent' 
        }}
      />
    );
  }

  // Active cells for heatmap
  for (let i = 0; i < 84; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toDateString();
    const count = hist[dateStr] || 0;

    let cellColor = 'rgba(255, 255, 255, 0.05)';
    if (count >= 15) cellColor = '#22c55e'; // Deep green
    else if (count >= 10) cellColor = '#16a34a';
    else if (count >= 5) cellColor = '#15803d';
    else if (count > 0) cellColor = '#166534'; // Dull green

    heatmapCells.push(
      <div
        key={`cell-${i}`}
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '2px',
          backgroundColor: cellColor,
          border: '1px solid rgba(255, 255, 255, 0.02)',
          transition: 'transform 0.15s ease'
        }}
        title={`${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${count} tasks`}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      />
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', color: '#eeeef5', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>
          Overview
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>
          📊 Learning Dashboard
        </h2>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        {/* Level & XP */}
        <div style={{ background: '#131520', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#8f9bb3', textTransform: 'uppercase', fontWeight: 600 }}>Rank & Level</div>
          <div style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0 4px 0', color: levelInfo.lvl.color }}>
            {levelInfo.lvl.title}
          </div>
          <div style={{ fontSize: '12px', color: '#8f9bb3' }}>{xp} XP accumulated</div>
        </div>

        {/* Streak */}
        <div style={{ background: '#131520', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#8f9bb3', textTransform: 'uppercase', fontWeight: 600 }}>Active Streak</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#f5a623' }}>
            🔥 {state.streak} Days
          </div>
          <div style={{ fontSize: '12px', color: '#8f9bb3' }}>Keep learning daily!</div>
        </div>

        {/* Completion */}
        <div style={{ background: '#131520', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#8f9bb3', textTransform: 'uppercase', fontWeight: 600 }}>Progress Ratio</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#00d9a0' }}>
            {progressPct}%
          </div>
          <div style={{ fontSize: '12px', color: '#8f9bb3' }}>{done} / {total} tasks completed</div>
        </div>

        {/* Study Hours */}
        <div style={{ background: '#131520', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#8f9bb3', textTransform: 'uppercase', fontWeight: 600 }}>Time Invested</div>
          <div style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: '#38bdf8' }}>
            ⏱ {studyHours()} hrs
          </div>
          <div style={{ fontSize: '12px', color: '#8f9bb3' }}>Readiness: {readiness}%</div>
        </div>
      </div>

      {/* Quick Access Links */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
          Quick Access
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: '12px' 
        }}>
          <button 
            onClick={() => switchView('roadmap-v4')}
            style={{ background: '#1a1d2d', border: '1px solid #ff444444', borderRadius: '8px', padding: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', color: '#ff4444' }}
            onMouseEnter={e => e.currentTarget.style.background = '#2a1f2f'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1d2d'}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔥</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>v4 Roadmap</div>
          </button>
          
          <button 
            onClick={() => switchView('notes')}
            style={{ background: '#1a1d2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', color: '#e8eaf0' }}
            onMouseEnter={e => e.currentTarget.style.background = '#252838'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1d2d'}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📝</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Notes</div>
          </button>
          
          <button 
            onClick={() => switchView('sandbox')}
            style={{ background: '#1a1d2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', color: '#e8eaf0' }}
            onMouseEnter={e => e.currentTarget.style.background = '#252838'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1d2d'}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>⌨</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>AI Sandbox</div>
          </button>
          
          <button 
            onClick={() => switchView('pipeline-ref')}
            style={{ background: '#1a1d2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', color: '#e8eaf0' }}
            onMouseEnter={e => e.currentTarget.style.background = '#252838'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1d2d'}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🗺️</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Pipeline Map</div>
          </button>
          
          <button 
            onClick={() => switchView('chaos-sim')}
            style={{ background: '#1a1d2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', color: '#e8eaf0' }}
            onMouseEnter={e => e.currentTarget.style.background = '#252838'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1d2d'}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>☸️</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Chaos Sim</div>
          </button>
        </div>
      </div>
      
      <ApiKeySetupModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
        onSuccess={() => {
          setIsApiKeyModalOpen(false);
          handleGenerateFeedback();
        }} 
      />

      {/* Heatmap Card */}
      <div style={{ 
        background: '#131520', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '16px', 
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
          Activity Heatmap (Past 12 Weeks)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateRows: 'repeat(7, 10px)', 
            gridAutoFlow: 'column',
            gap: '3px',
            width: 'max-content',
            margin: '0 auto'
          }}>
            {heatmapCells}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8f9bb3', maxWidth: '160px', margin: '8px auto 0 auto' }}>
            <span>Less</span>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}></div>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#166534' }}></div>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#15803d' }}></div>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#16a34a' }}></div>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e' }}></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* AI Performance Feedback Panel */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1b162b 0%, #0d0c15 100%)',
        border: '1px solid rgba(124, 111, 255, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              🤖 {formatProviderName(getActiveProvider())} Mentor Evaluation & Feedback
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8f9bb3' }}>
              Synthesizes your roadmap progress, streak, and quiz scores to offer actionable guidance.
            </p>
          </div>
          <button
            onClick={handleGenerateFeedback}
            disabled={isGenerating}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(90deg, #7c6fff 0%, #a855f7 100%)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.7 : 1,
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => !isGenerating && (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => !isGenerating && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isGenerating ? 'Analyzing Progress...' : '🔄 Generate Review'}
          </button>
        </div>

        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          border: '1px solid rgba(255,255,255,0.03)', 
          borderRadius: '12px', 
          padding: '16px', 
          minHeight: '120px',
          fontSize: '14px',
          lineHeight: 1.6,
          color: '#d1d5db'
        }}>
          {state.dashboardFeedback ? (
            <div className="prose">
              <SimpleMarkdown text={state.dashboardFeedback} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', color: '#8f9bb3' }}>
              <span>No feedback generated yet. Click "Generate Review" above.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
