import React from 'react';

interface NavigationDrawerProps {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  currentView: string;
  handleNavItemClick: (view: string) => void;
  openHamSections: Record<string, boolean>;
  toggleHamSection: (section: string) => void;
  setChallengeWeekday: (weekday: number) => void;
  setIsChallengeOpen: (open: boolean) => void;
  handleOpenSettings: () => void;
  notificationsEnabled: boolean;
  toggleStudyReminders: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  handleShareProgress: () => void;
  handleLogout: () => void;
  currentUser: string | null;
  sandboxSection: 'scenarios' | 'labs' | 'free' | null;
  setSandboxSection: React.Dispatch<React.SetStateAction<'scenarios' | 'labs' | 'free' | null>>;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isDrawerOpen,
  setIsDrawerOpen,
  currentView,
  handleNavItemClick,
  openHamSections,
  toggleHamSection,
  setChallengeWeekday,
  setIsChallengeOpen,
  handleOpenSettings,
  notificationsEnabled,
  toggleStudyReminders,
  theme,
  toggleTheme,
  handleShareProgress,
  handleLogout,
  currentUser,
  sandboxSection,
  setSandboxSection
}) => {
  return (
    <>
      {/* Side Hamburger Drawer Backdrop */}
      {isDrawerOpen && (
        <div id="ham-overlay" className="open" onClick={() => setIsDrawerOpen(false)}></div>
      )}

      {/* Side Hamburger Drawer */}
      <div
        id="ham-drawer"
        className={isDrawerOpen ? 'open' : ''}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="ham-section">
          <div
            className="ham-label"
            onClick={() => toggleHamSection('study')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span>📚 Study</span>
            <span
              style={{
                fontSize: '8px',
                transition: 'transform 0.2s',
                transform: openHamSections.study ? 'rotate(90deg)' : 'rotate(0deg)',
                color: 'var(--sub)'
              }}
            >
              ▶
            </span>
          </div>
          {openHamSections.study && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button
                className={`ham-item ${currentView === 'roadmap' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('roadmap')}
                style={{ color: currentView === 'roadmap' ? 'var(--green)' : undefined }}
              >
                <span className="ham-ico">💥</span>DevOps Roadmap
              </button>
              <button
                className={`ham-item ${currentView === 'roadmap-v3' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('roadmap-v3')}
                style={{ color: currentView === 'roadmap-v3' ? 'var(--purple)' : undefined }}
              >
                <span className="ham-ico">🚀</span>v3 Roadmap
              </button>
              <button
                className={`ham-item ${currentView === 'qbank' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('qbank')}
              >
                <span className="ham-ico">❓</span>Q-Bank
              </button>
              <button
                className={`ham-item ${currentView === 'notes' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('notes')}
              >
                <span className="ham-ico">📝</span>Notes
                <span className="ham-badge hot">new</span>
              </button>
              <button
                className={`ham-item ${currentView === 'sandbox' && sandboxSection === 'labs' ? 'active' : ''}`}
                onClick={() => {
                  setSandboxSection('labs');
                  handleNavItemClick('sandbox');
                }}
              >
                <span className="ham-ico">⌨</span>Labs
                <span className="ham-badge hot">new</span>
              </button>
              <button
                className="ham-item"
                onClick={() => {
                  const currentWd = new Date().getDay() + 1;
                  setChallengeWeekday(currentWd);
                  setIsChallengeOpen(true);
                  setIsDrawerOpen(false);
                }}
              >
                <span className="ham-ico">🏆</span>Daily Challenge
              </button>
            </div>
          )}
        </div>

        <div className="ham-section">
          <div
            className="ham-label"
            onClick={() => toggleHamSection('tracking')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span>📋 Tracking</span>
            <span
              style={{
                fontSize: '8px',
                transition: 'transform 0.2s',
                transform: openHamSections.tracking ? 'rotate(90deg)' : 'rotate(0deg)',
                color: 'var(--sub)'
              }}
            >
              ▶
            </span>
          </div>
          {openHamSections.tracking && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button
                className={`ham-item ${currentView === 'buildlog' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('buildlog')}
              >
                <span className="ham-ico">🔨</span>Build Log & Reviews
              </button>
              <button
                className={`ham-item ${currentView === 'weekly' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('weekly')}
              >
                <span className="ham-ico">🎯</span>Goals
              </button>
              <button
                className={`ham-item ${currentView === 'stats' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('stats')}
              >
                <span className="ham-ico">◈</span>Stats
              </button>
            </div>
          )}
        </div>

        <div className="ham-section">
          <div
            className="ham-label"
            onClick={() => toggleHamSection('career')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span>🏆 Career</span>
            <span
              style={{
                fontSize: '8px',
                transition: 'transform 0.2s',
                transform: openHamSections.career ? 'rotate(90deg)' : 'rotate(0deg)',
                color: 'var(--sub)'
              }}
            >
              ▶
            </span>
          </div>
          {openHamSections.career && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button
                className={`ham-item ${currentView === 'jobs' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('jobs')}
              >
                <span className="ham-ico">💼</span>Jobs
              </button>
              <button
                className={`ham-item ${currentView === 'linkedin' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('linkedin')}
              >
                <span className="ham-ico">📢</span>LinkedIn
              </button>
              <button
                className={`ham-item ${currentView === 'readiness' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('readiness')}
              >
                <span className="ham-ico">✅</span>Readiness
              </button>
            </div>
          )}
        </div>

        <div className="ham-section">
          <div
            className="ham-label"
            onClick={() => toggleHamSection('ai')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span>🔥 AI Tools</span>
            <span
              style={{
                fontSize: '8px',
                transition: 'transform 0.2s',
                transform: openHamSections.ai ? 'rotate(90deg)' : 'rotate(0deg)',
                color: 'var(--sub)'
              }}
            >
              ▶
            </span>
          </div>
          {openHamSections.ai && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button
                className={`ham-item ${currentView === 'projects' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('projects')}
              >
                <span className="ham-ico">🚀</span>Projects
                <span className="ham-badge hot">hot</span>
              </button>
              <button
                className={`ham-item ${currentView === 'github-rewriter' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('github-rewriter')}
              >
                <span className="ham-ico">🐙</span>GitHub
                <span className="ham-badge hot">hot</span>
              </button>
              <button
                className={`ham-item ${currentView === 'resume' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('resume')}
              >
                <span className="ham-ico">📄</span>Resume
                <span className="ham-badge hot">hot</span>
              </button>
              <button
                className={`ham-item ${currentView === 'mock' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('mock')}
              >
                <span className="ham-ico">🎤</span>Mock Interview
                <span className="ham-badge hot">hot</span>
              </button>
              <button
                className={`ham-item ${currentView === 'skillgap' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('skillgap')}
              >
                <span className="ham-ico">🎯</span>Skill Gap
                <span className="ham-badge hot">hot</span>
              </button>
              <button
                className={`ham-item ${currentView === 'diagram' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('diagram')}
              >
                <span className="ham-ico">🎨</span>MindMap
                <span className="ham-badge hot">new</span>
              </button>
              <button
                className={`ham-item ${currentView === 'devops-flows' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('devops-flows')}
              >
                <span className="ham-ico">🗺️</span>DevOps Flowcharts
                <span className="ham-badge hot">new</span>
              </button>
            </div>
          )}
        </div>

        <div
          className="ham-section"
          style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}
        >
          <div
            className="ham-label"
            onClick={() => toggleHamSection('settings')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span>⚙️ Settings & Profile</span>
            <span
              style={{
                fontSize: '8px',
                transition: 'transform 0.2s',
                transform: openHamSections.settings ? 'rotate(90deg)' : 'rotate(0deg)',
                color: 'var(--sub)'
              }}
            >
              ▶
            </span>
          </div>
          {openHamSections.settings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button
                className="ham-item"
                onClick={() => {
                  setIsDrawerOpen(false);
                  handleOpenSettings();
                }}
              >
                <span className="ham-ico">⚙️</span>Settings & Profile
              </button>
              <div
                className="ham-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                  cursor: 'default'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span className="ham-ico">🔔</span>Study Reminders
                </span>
                <button
                  onClick={toggleStudyReminders}
                  style={{
                    background: notificationsEnabled ? 'var(--blue)' : 'var(--border)',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    transition: 'background 0.2s'
                  }}
                >
                  {notificationsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <button
                className="ham-item"
                onClick={() => {
                  setIsDrawerOpen(false);
                  toggleTheme();
                }}
                style={{ marginTop: '8px' }}
              >
                <span className="ham-ico">◑</span>Theme: {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
              <button
                className="ham-item"
                onClick={() => {
                  setIsDrawerOpen(false);
                  handleShareProgress();
                }}
                style={{ marginTop: '8px' }}
              >
                <span className="ham-ico">📤</span>Share Progress
              </button>
              <button
                className="ham-item"
                onClick={() => {
                  setIsDrawerOpen(false);
                  handleLogout();
                }}
                style={{ color: 'var(--red)', marginTop: '8px' }}
              >
                <span className="ham-ico">🚪</span>Logout ({currentUser})
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
