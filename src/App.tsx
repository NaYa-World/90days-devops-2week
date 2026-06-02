import React, { useState, useEffect, Suspense } from 'react';
import { useAppState } from './hooks/useAppState';
import { PomodoroModal } from './components/PomodoroModal';
import { 
  AIProvider, 
  getActiveProvider, 
  setActiveProvider, 
  getProviderKey, 
  saveProviderKey, 
  clearAllKeys 
} from './components/AIService';
import { LoginScreen } from './views/LoginScreen';
import { BackToTop } from './components/BackToTop';

// Lazy load views for optimal code splitting & bundle size reduction
const RoadmapView = React.lazy(() => import('./views/RoadmapView').then(m => ({ default: m.RoadmapView })));
const RoadmapV2View = React.lazy(() => import('./views/RoadmapV2View').then(m => ({ default: m.RoadmapV2View })));
const KanbanView = React.lazy(() => import('./views/KanbanView').then(m => ({ default: m.KanbanView })));
const FocusView = React.lazy(() => import('./views/FocusView').then(m => ({ default: m.FocusView })));
const LabsView = React.lazy(() => import('./views/LabsView').then(m => ({ default: m.LabsView })));
const JobsView = React.lazy(() => import('./views/JobsView').then(m => ({ default: m.JobsView })));
const QbankView = React.lazy(() => import('./views/QbankView').then(m => ({ default: m.QbankView })));
const StatsView = React.lazy(() => import('./views/StatsView').then(m => ({ default: m.StatsView })));
const WeeklyView = React.lazy(() => import('./views/WeeklyView').then(m => ({ default: m.WeeklyView })));
const ProjectsView = React.lazy(() => import('./views/ProjectsView').then(m => ({ default: m.ProjectsView })));
const GithubRewriterView = React.lazy(() => import('./views/GithubRewriterView').then(m => ({ default: m.GithubRewriterView })));
const ResumeView = React.lazy(() => import('./views/ResumeView').then(m => ({ default: m.ResumeView })));
const MockInterviewView = React.lazy(() => import('./views/MockInterviewView').then(m => ({ default: m.MockInterviewView })));
const SkillGapView = React.lazy(() => import('./views/SkillGapView').then(m => ({ default: m.SkillGapView })));
const BuildLogView = React.lazy(() => import('./views/BuildReviewComboView').then(m => ({ default: m.BuildReviewComboView })));
const LinkedInView = React.lazy(() => import('./views/LinkedInView').then(m => ({ default: m.LinkedInView })));
// const ReviewsView = React.lazy(() => import('./views/ReviewsView').then(m => ({ default: m.ReviewsView })));
const NotesView = React.lazy(() => import('./views/NotesView').then(m => ({ default: m.NotesView })));
const ReadinessView = React.lazy(() => import('./views/ReadinessView').then(m => ({ default: m.ReadinessView })));

// New Advanced DevOps views
const DevOpsSandboxView = React.lazy(() => import('./views/DevOpsSandboxView').then(m => ({ default: m.DevOpsSandboxView })));

export const App: React.FC = () => {
  const appState = useAppState();
  const {
    state,
    incrementPomoSessions,
    studyHours,
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    getAccounts,
    addNotification,
    clearNotifications,
    markNotificationsRead
  } = appState;

  const [currentView, setCurrentView] = useState<string>('roadmap');
  const [focusDay, setFocusDay] = useState<string>('0_0');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Modals visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPomoOpen, setIsPomoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeProvider, setActiveProviderState] = useState<AIProvider>('claude');
  const [providerKeys, setProviderKeys] = useState<Record<AIProvider, string>>({
    claude: '',
    chatgpt: '',
    gemini: '',
    grok: ''
  });
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [githubSettings, setGithubSettings] = useState({ pat: '', username: '', repo: '', branch: 'main' });

  // Handle Theme Initialisation
  useEffect(() => {
    const savedTheme = localStorage.getItem('devops90_theme') || 'dark';
    setTheme(savedTheme as any);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Daily login & finish tasks desktop notification reminder
  useEffect(() => {
    if (!currentUser) return;

    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      const today = new Date().toDateString();
      const lastNotif = localStorage.getItem(`devops90_last_desktop_notif_${currentUser.toLowerCase()}`);
      if (lastNotif !== today && Notification.permission === 'granted') {
        new Notification('📅 DevOps Daily Reminder', {
          body: `Hi ${currentUser}, time to log in and work on your 90-day DevOps roadmap tasks!`,
          icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        });
        localStorage.setItem(`devops90_last_desktop_notif_${currentUser.toLowerCase()}`, today);
      }
    }
  }, [currentUser]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('devops90_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleOpenSettings = () => {
    const active = getActiveProvider();
    setActiveProviderState(active);
    setProviderKeys({
      claude: getProviderKey('claude'),
      chatgpt: getProviderKey('chatgpt'),
      gemini: getProviderKey('gemini'),
      grok: getProviderKey('grok')
    });
    setGithubSettings({
      pat: localStorage.getItem('devops90_github_pat') || '',
      username: localStorage.getItem('devops90_github_username') || '',
      repo: localStorage.getItem('devops90_github_repo') || '',
      branch: localStorage.getItem('devops90_github_branch') || 'main'
    });
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    setActiveProvider(activeProvider);
    saveProviderKey('claude', providerKeys.claude);
    saveProviderKey('chatgpt', providerKeys.chatgpt);
    saveProviderKey('gemini', providerKeys.gemini);
    saveProviderKey('grok', providerKeys.grok);
    // Save GitHub settings
    localStorage.setItem('devops90_github_pat', githubSettings.pat.trim());
    localStorage.setItem('devops90_github_username', githubSettings.username.trim());
    localStorage.setItem('devops90_github_repo', githubSettings.repo.trim());
    localStorage.setItem('devops90_github_branch', githubSettings.branch.trim() || 'main');
    setIsSettingsOpen(false);
  };

  const handleLogout = () => {
    clearAllKeys();
    logoutUser();
  };

  const renderView = () => {
    switch (currentView) {
      case 'roadmap':
        return (
          <RoadmapView
            appState={appState}
            switchView={setCurrentView}
            setFocusDay={setFocusDay}
          />
        );
      case 'roadmap-v2':
        return (
          <RoadmapV2View
            appState={appState}
            switchView={setCurrentView}
          />
        );
      case 'kanban':
        return (
          <KanbanView
            appState={appState}
            switchView={setCurrentView}
            setFocusDay={setFocusDay}
          />
        );
      case 'focus':
        return (
          <FocusView
            appState={appState}
            focusDay={focusDay}
            setFocusDay={setFocusDay}
          />
        );
      case 'labs':
        return <LabsView appState={appState} />;
      // case 'certs':
      //   return <CertsView appState={appState} />;
      case 'jobs':
        return <JobsView appState={appState} />;
      case 'qbank':
        return <QbankView appState={appState} />;
      case 'stats':
        return <StatsView appState={appState} />;
      case 'weekly':
        return <WeeklyView appState={appState} />;
      // case 'report':
      //   return <ReportView appState={appState} />;
      case 'projects':
        return <ProjectsView appState={appState} switchView={setCurrentView} />;
      case 'github-rewriter':
        return <GithubRewriterView appState={appState} />;
      case 'resume':
        return <ResumeView appState={appState} />;
      case 'mock':
        return <MockInterviewView appState={appState} switchView={setCurrentView} />;
      case 'skillgap':
        return (
          <SkillGapView
            appState={appState}
            setFocusDay={setFocusDay}
            switchView={setCurrentView}
          />
        );
      case 'buildlog':
        return <BuildLogView appState={appState} />;
      case 'linkedin':
        return <LinkedInView appState={appState} />;
      case 'readiness':
        return <ReadinessView appState={appState} />;
      // case 'reviews':
      //   return <ReviewsView appState={appState} />;
      case 'notes':
        return <NotesView appState={appState} />;
      case 'sandbox':
        return <DevOpsSandboxView appState={appState} />;
      // case 'cloud-planner':
      //   return <CloudPlannerView appState={appState} />;
      default:
        return (
          <RoadmapView
            appState={appState}
            switchView={setCurrentView}
            setFocusDay={setFocusDay}
          />
        );
    }
  };

  const primaryViews = ['roadmap', 'kanban', 'focus', 'labs'];

  const handleNavItemClick = (view: string) => {
    setCurrentView(view);
    setIsDrawerOpen(false);
  };

  // Guard routing for Local Authentication system (unconditional hooks first)
  if (!currentUser) {
    return (
      <LoginScreen
        loginUser={loginUser}
        registerUser={registerUser}
        getAccounts={getAccounts}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navigation Top Bar */}
      <nav id="nav">
        <button
          id="ham-btn"
          className={isDrawerOpen ? 'open' : ''}
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          aria-label="Menu"
          aria-expanded={isDrawerOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="nav-brand" onClick={() => handleNavItemClick('roadmap')} style={{ cursor: 'pointer' }}>
          <span className="g">DEV</span>
          <span className="p">OPS</span>
          <span className="v">v4</span>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${currentView === 'roadmap' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('roadmap')}
          >
            ☑ Roadmap
          </button>
          <button
            className={`nav-tab ${currentView === 'roadmap-v2' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('roadmap-v2')}
            style={{ background: currentView === 'roadmap-v2' ? 'rgba(0,217,160,.15)' : undefined, color: currentView === 'roadmap-v2' ? 'var(--green)' : undefined }}
          >
            💥 v2 Roadmap
          </button>
          <button
            className={`nav-tab ${currentView === 'kanban' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('kanban')}
          >
            ⊞ Kanban
          </button>
          <button
            className={`nav-tab ${currentView === 'focus' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('focus')}
          >
            ◎ Focus
          </button>
          <button
            className={`nav-tab ${currentView === 'labs' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('labs')}
          >
            ⌨ Labs
          </button>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => handleNavItemClick('notes')}>📝 Notes</button>
          <button className="nav-btn hi" onClick={() => setIsPomoOpen(true)}>⏱</button>
          
          {/* Notifications Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button 
              className="nav-btn" 
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                markNotificationsRead();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🔔
              {state.notifications && state.notifications.filter(n => !n.read).length > 0 && (
                <span style={{ background: 'var(--red)', color: '#fff', borderRadius: '50%', padding: '1px 5px', fontSize: '9px', fontWeight: 'bold' }}>
                  {state.notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {isNotifOpen && (
              <div style={{
                position: 'absolute',
                top: '38px',
                right: 0,
                width: '280px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                zIndex: 500,
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text)' }}>🔔 Notifications</span>
                  <button 
                    onClick={clearNotifications}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '10px', cursor: 'pointer', fontFamily: 'monospace' }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(!state.notifications || state.notifications.length === 0) ? (
                    <div style={{ color: 'var(--muted)', fontSize: '11px', textAlign: 'center', padding: '12px 0' }}>
                      No notifications yet.
                    </div>
                  ) : (
                    state.notifications.map((n, idx) => (
                      <div key={idx} style={{ fontSize: '11.5px', padding: '6px 8px', background: 'var(--s2)', borderRadius: '8px', borderLeft: n.read ? 'none' : '3px solid var(--green)' }}>
                        <div style={{ color: 'var(--text)', lineHeight: '1.4' }}>{n.text}</div>
                        <div style={{ fontSize: '8px', color: 'var(--muted)', marginTop: '3px', textAlign: 'right' }}>{n.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="nav-btn" onClick={toggleTheme}>◑ Theme</button>
          <button className="nav-btn" onClick={handleOpenSettings}>🔑 Keys</button>
          <button 
            className="nav-btn" 
            onClick={handleLogout} 
            style={{ 
              borderColor: 'rgba(255,95,95,.4)', 
              color: 'var(--red)',
              background: 'rgba(255,95,95,.05)'
            }}
          >
            👤 {currentUser} (Logout)
          </button>
        </div>
      </nav>

      {/* Side Hamburger Drawer Backdrop */}
      {isDrawerOpen && (
        <div 
          id="ham-overlay" 
          className="open"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* Side Hamburger Drawer */}
      <div 
        id="ham-drawer" 
        className={isDrawerOpen ? 'open' : ''}
        role="dialog" 
        aria-label="Navigation menu"
      >
        <div className="ham-section">
          <div className="ham-label">📚 Study</div>
          <button className={`ham-item ${currentView === 'qbank' ? 'active' : ''}`} onClick={() => handleNavItemClick('qbank')}>
            <span className="ham-ico">❓</span>Q-Bank
          </button>
          <button className={`ham-item ${currentView === 'notes' ? 'active' : ''}`} onClick={() => handleNavItemClick('notes')}>
            <span className="ham-ico">📝</span>Notes
            <span className="ham-badge hot">new</span>
          </button>
          <button className={`ham-item ${currentView === 'sandbox' ? 'active' : ''}`} onClick={() => handleNavItemClick('sandbox')}>
            <span className="ham-ico">🧑‍💻</span>Sandbox
            <span className="ham-badge hot">new</span>
          </button>
        </div>
        <div className="ham-section">
          <div className="ham-label">📋 Tracking</div>
          <button className={`ham-item ${currentView === 'buildlog' ? 'active' : ''}`} onClick={() => handleNavItemClick('buildlog')}>
            <span className="ham-ico">🔨</span>Build Log & Reviews
          </button>
          {/* <button className={`ham-item ${currentView === 'reviews' ? 'active' : ''}`} onClick={() => handleNavItemClick('reviews')}>
            <span className="ham-ico">🔁</span>Reviews
          </button> */}
          <button className={`ham-item ${currentView === 'weekly' ? 'active' : ''}`} onClick={() => handleNavItemClick('weekly')}>
            <span className="ham-ico">🎯</span>Goals
          </button>
          {/* <button className={`ham-item ${currentView === 'report' ? 'active' : ''}`} onClick={() => handleNavItemClick('report')}>
            <span className="ham-ico">📊</span>Report
          </button> */}
          <button className={`ham-item ${currentView === 'stats' ? 'active' : ''}`} onClick={() => handleNavItemClick('stats')}>
            <span className="ham-ico">◈</span>Stats
          </button>
        </div>
        <div className="ham-section">
          <div className="ham-label">🏆 Career</div>
          {/* 
          <button className={`ham-item ${currentView === 'certs' ? 'active' : ''}`} onClick={() => handleNavItemClick('certs')}>
            <span className="ham-ico">🏆</span>Certs
          </button>
          */}
          <button className={`ham-item ${currentView === 'jobs' ? 'active' : ''}`} onClick={() => handleNavItemClick('jobs')}>
            <span className="ham-ico">💼</span>Jobs
          </button>
          <button className={`ham-item ${currentView === 'linkedin' ? 'active' : ''}`} onClick={() => handleNavItemClick('linkedin')}>
            <span className="ham-ico">📢</span>LinkedIn
          </button>
          <button className={`ham-item ${currentView === 'readiness' ? 'active' : ''}`} onClick={() => handleNavItemClick('readiness')}>
            <span className="ham-ico">✅</span>Readiness
          </button>
        </div>
        <div className="ham-section">
          <div className="ham-label">🔥 AI Tools</div>
          <button className={`ham-item ${currentView === 'roadmap-v2' ? 'active' : ''}`} onClick={() => handleNavItemClick('roadmap-v2')}
            style={{ color: currentView === 'roadmap-v2' ? 'var(--green)' : undefined }}>
            <span>💥</span><span>v2 Roadmap</span>
          </button>
          <button className={`ham-item ${currentView === 'projects' ? 'active' : ''}`} onClick={() => handleNavItemClick('projects')}>
            <span className="ham-ico">🚀</span>Projects
            <span className="ham-badge hot">hot</span>
          </button>
          <button className={`ham-item ${currentView === 'github-rewriter' ? 'active' : ''}`} onClick={() => handleNavItemClick('github-rewriter')}>
            <span className="ham-ico">🐙</span>GitHub
            <span className="ham-badge hot">hot</span>
          </button>
          <button className={`ham-item ${currentView === 'resume' ? 'active' : ''}`} onClick={() => handleNavItemClick('resume')}>
            <span className="ham-ico">📄</span>Resume
            <span className="ham-badge hot">hot</span>
          </button>
          <button className={`ham-item ${currentView === 'mock' ? 'active' : ''}`} onClick={() => handleNavItemClick('mock')}>
            <span className="ham-ico">🎤</span>Mock Interview
            <span className="ham-badge hot">hot</span>
          </button>
          <button className={`ham-item ${currentView === 'skillgap' ? 'active' : ''}`} onClick={() => handleNavItemClick('skillgap')}>
            <span className="ham-ico">🎯</span>Skill Gap
            <span className="ham-badge hot">hot</span>
          </button>
          {/* 
          <button className={`ham-item ${currentView === 'cloud-planner' ? 'active' : ''}`} onClick={() => handleNavItemClick('cloud-planner')}>
            <span className="ham-ico">☁️</span>Cloud Planner
            <span className="ham-badge hot">new</span>
          </button>
          */}
        </div>
        <div className="ham-section" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div className="ham-label">⚙️ Settings & Profile</div>
          <button className="ham-item" onClick={() => { setIsDrawerOpen(false); handleOpenSettings(); }}>
            <span className="ham-ico">🔑</span>API Keys
          </button>
          <button className="ham-item" onClick={() => { setIsDrawerOpen(false); handleLogout(); }} style={{ color: 'var(--red)', marginTop: '8px' }}>
            <span className="ham-ico">🚪</span>Logout ({currentUser})
          </button>
        </div>
      </div>

      <main style={{ paddingBottom: '80px' }}>
        <Suspense fallback={<div className="wrap" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="ai-spinner"></div></div>}>
          {renderView()}
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div id="bottom-bar">
        <button 
          className={`btab ${currentView === 'roadmap' ? 'active' : ''}`} 
          onClick={() => handleNavItemClick('roadmap')}
        >
          <span className="bico">☑</span>Map
        </button>
        <button 
          className={`btab ${currentView === 'kanban' ? 'active' : ''}`} 
          onClick={() => handleNavItemClick('kanban')}
        >
          <span className="bico">⊞</span>Kanban
        </button>
        <button 
          className={`btab ${currentView === 'focus' ? 'active' : ''}`} 
          onClick={() => handleNavItemClick('focus')}
        >
          <span className="bico">◎</span>Focus
        </button>
        <button 
          className={`btab ${currentView === 'labs' ? 'active' : ''}`} 
          onClick={() => handleNavItemClick('labs')}
        >
          <span className="bico">⌨</span>Labs
        </button>
        <button 
          className="btab" 
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <span className="bico">☰</span>More
        </button>
      </div>

      {/* Pomodoro Timer Modal */}
      <PomodoroModal
        isOpen={isPomoOpen}
        onClose={() => setIsPomoOpen(false)}
        pomoSessions={state.pomoSessions}
        incrementSessions={incrementPomoSessions}
        studyHours={studyHours()}
        addNotification={addNotification}
      />

      {/* Back to Top button */}
      <BackToTop />

      {/* Settings Modal (Multi-Provider API Keys) */}
      {isSettingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 600,
            background: 'rgba(0,0,0,.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '22px',
              width: 'min(440px, 96vw)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSettingsOpen(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: '16px' }}
            >
              ✕
            </button>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
              🔑 API Settings
            </div>
            
            {/* Active Provider Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label className="v4-label">Active AI Provider</label>
              <select
                value={activeProvider}
                onChange={e => setActiveProviderState(e.target.value as AIProvider)}
                className="v4-select"
                style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none', fontSize: '13px' }}
              >
                <option value="claude">Claude (Anthropic)</option>
                <option value="chatgpt">ChatGPT (OpenAI)</option>
                <option value="gemini">Gemini (Google)</option>
                <option value="grok">Grok (xAI)</option>
              </select>
            </div>

            {/* Provider API Key Input */}
            <div style={{ marginBottom: '16px' }}>
              <label className="v4-label">
                {activeProvider === 'claude' && 'Anthropic API Key'}
                {activeProvider === 'chatgpt' && 'OpenAI API Key'}
                {activeProvider === 'gemini' && 'Google Gemini API Key'}
                {activeProvider === 'grok' && 'xAI Grok API Key'}
              </label>
              <input
                type="password"
                className="v4-input"
                value={providerKeys[activeProvider]}
                onChange={e => setProviderKeys({ ...providerKeys, [activeProvider]: e.target.value })}
                placeholder={
                  activeProvider === 'claude' ? 'sk-ant-...' :
                  activeProvider === 'chatgpt' ? 'sk-...' :
                  activeProvider === 'gemini' ? 'AIzaSy...' :
                  'xai-...'
                }
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '13px', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '6px', lineHeight: '1.4' }}>
                {activeProvider === 'claude' && (
                  <span>
                    Used directly in the browser to connect to Claude. Cleared when you log out.{' '}
                    <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                      Get Anthropic API Key
                    </a>
                  </span>
                )}
                {activeProvider === 'chatgpt' && (
                  <span>
                    Used directly in the browser to connect to ChatGPT (OpenAI). Cleared when you log out.{' '}
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                      Get OpenAI API Key
                    </a>
                  </span>
                )}
                {activeProvider === 'gemini' && (
                  <span>
                    Used directly in the browser to connect to Gemini (Google). Cleared when you log out.{' '}
                    <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                      Get Google Gemini API Key
                    </a>
                  </span>
                )}
                {activeProvider === 'grok' && (
                  <span>
                    Used directly in the browser to connect to Grok (xAI). Cleared when you log out.{' '}
                    <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                      Get Grok API Key
                    </a>
                  </span>
                )}
                <div style={{ marginTop: '4px' }}>Safe, client-side only.</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="v4-btn-secondary" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </button>
              <button className="v4-btn-primary" onClick={handleSaveSettings} style={{ padding: '8px 16px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}>
                Save Key
              </button>
            </div>

            {/* GitHub Sync Settings */}
            <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
                🐙 GitHub Notes Sync
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--sub)', marginBottom: '12px', lineHeight: '1.5' }}>
                Configure these to sync Bootcamp Notes directly to your GitHub repository.
                You need a <a href="https://github.com/settings/tokens/new?scopes=repo&description=DevOps90-Notes-Sync" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>GitHub Personal Access Token</a> with <code style={{ background: 'var(--s2)', padding: '1px 4px', borderRadius: '3px', fontSize: '10px' }}>repo</code> scope.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label className="v4-label" style={{ fontSize: '10px' }}>GitHub Username</label>
                  <input
                    type="text"
                    value={githubSettings.username}
                    onChange={e => setGithubSettings({ ...githubSettings, username: e.target.value })}
                    placeholder="your-username"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', padding: '6px 9px', borderRadius: 'var(--r8)', outline: 'none', fontFamily: 'var(--mono)' }}
                  />
                </div>
                <div>
                  <label className="v4-label" style={{ fontSize: '10px' }}>Repository Name</label>
                  <input
                    type="text"
                    value={githubSettings.repo}
                    onChange={e => setGithubSettings({ ...githubSettings, repo: e.target.value })}
                    placeholder="devops-notes"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', padding: '6px 9px', borderRadius: 'var(--r8)', outline: 'none', fontFamily: 'var(--mono)' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label className="v4-label" style={{ fontSize: '10px' }}>GitHub Personal Access Token (PAT)</label>
                <input
                  type="password"
                  value={githubSettings.pat}
                  onChange={e => setGithubSettings({ ...githubSettings, pat: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', padding: '6px 9px', borderRadius: 'var(--r8)', outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label className="v4-label" style={{ fontSize: '10px' }}>Branch (default: main)</label>
                <input
                  type="text"
                  value={githubSettings.branch}
                  onChange={e => setGithubSettings({ ...githubSettings, branch: e.target.value })}
                  placeholder="main"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', padding: '6px 9px', borderRadius: 'var(--r8)', outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="v4-btn-primary" onClick={handleSaveSettings} style={{ padding: '7px 14px', background: 'rgba(79,168,255,.1)', border: '1px solid rgba(79,168,255,.3)', color: '#4fa8ff', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}>
                  Save All Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
