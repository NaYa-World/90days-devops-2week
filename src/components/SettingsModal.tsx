import React, { useState } from 'react';
import { AIProvider } from './AIService';
import { Capacitor } from '@capacitor/core';
import { GitHubSyncService } from './GitHubSyncService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProvider: AIProvider;
  setActiveProviderState: (provider: AIProvider) => void;
  providerKeys: Record<AIProvider, string>;
  setProviderKeys: React.Dispatch<React.SetStateAction<Record<AIProvider, string>>>;
  githubSettings: { pat: string; username: string; repo: string; branch: string };
  setGithubSettings: React.Dispatch<
    React.SetStateAction<{ pat: string; username: string; repo: string; branch: string }>
  >;
  uiScale: number;
  setUiScale: (scale: number) => void;
  notificationsEnabled: boolean;
  toggleStudyReminders: () => void;
  morningTime: string;
  handleMorningTimeChange: (time: string) => void;
  eveningTime: string;
  handleEveningTimeChange: (time: string) => void;
  handleSaveSettings: () => void;
  syncWithSystemTheme: boolean;
  setSyncWithSystemTheme: (sync: boolean) => void;
  theme: 'dark' | 'light';
  currentUser: string | null;
  handleTestNotification?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeProvider,
  setActiveProviderState,
  providerKeys,
  setProviderKeys,
  githubSettings,
  setGithubSettings,
  uiScale,
  setUiScale,
  notificationsEnabled,
  toggleStudyReminders,
  morningTime,
  handleMorningTimeChange,
  eveningTime,
  handleEveningTimeChange,
  handleSaveSettings,
  syncWithSystemTheme,
  setSyncWithSystemTheme,
  theme,
  currentUser,
  handleTestNotification
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleForceSync = async () => {
    setSyncing(true);
    setSyncMessage('Syncing with GitHub Gist...');
    try {
      await GitHubSyncService.autoSyncToGitHub();
      setSyncMessage('✅ Sync successful!');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (err: any) {
      setSyncMessage('❌ Sync failed: ' + (err.message || err));
      setTimeout(() => setSyncMessage(''), 5000);
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--s1)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          width: 'min(440px, 96vw)',
          position: 'relative',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'min(760px, 85vh)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div style={{ padding: '22px 22px 10px', position: 'relative', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--sub)',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>
            ⚙️ Settings & Profile
          </div>
        </div>

        {/* Fixed AI Provider Settings, Reminders & Save */}
        <div style={{ padding: '0 22px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {/* Active Provider Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label className="v4-label">Active AI Provider</label>
            <select
              value={activeProvider}
              onChange={e => setActiveProviderState(e.target.value as AIProvider)}
              className="v4-select"
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '8px 11px',
                borderRadius: 'var(--r8)',
                outline: 'none',
                fontSize: '13px'
              }}
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
                activeProvider === 'claude'
                  ? 'sk-ant-...'
                  : activeProvider === 'chatgpt'
                  ? 'sk-...'
                  : activeProvider === 'gemini'
                  ? 'AIzaSy...'
                  : 'xai-...'
              }
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: 'var(--body)',
                fontSize: '13px',
                padding: '8px 11px',
                borderRadius: 'var(--r8)',
                outline: 'none'
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '6px', lineHeight: '1.4' }}>
              {activeProvider === 'claude' && (
                <span>
                  Used directly in the browser to connect to Claude. Cleared when you log out.{' '}
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--green)', textDecoration: 'underline' }}
                  >
                    Get Anthropic API Key
                  </a>
                </span>
              )}
              {activeProvider === 'chatgpt' && (
                <span>
                  Used directly in the browser to connect to ChatGPT (OpenAI). Cleared when you log out.{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--green)', textDecoration: 'underline' }}
                  >
                    Get OpenAI API Key
                  </a>
                </span>
              )}
              {activeProvider === 'gemini' && (
                <span>
                  Used directly in the browser to connect to Gemini (Google). Cleared when you log out.{' '}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--green)', textDecoration: 'underline' }}
                  >
                    Get Google Gemini API Key
                  </a>
                </span>
              )}
              {activeProvider === 'grok' && (
                <span>
                  Used directly in the browser to connect to Grok (xAI). Cleared when you log out.{' '}
                  <a
                    href="https://console.x.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--green)', textDecoration: 'underline' }}
                  >
                    Get Grok API Key
                  </a>
                </span>
              )}
              <div style={{ marginTop: '4px' }}>Safe, client-side only.</div>
            </div>
          </div>

          {/* App UI Scaling (Font Size) */}
          <div style={{ marginBottom: '16px' }}>
            <label className="v4-label">App Text Size (Zoom)</label>
            <select
              value={uiScale}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setUiScale(val);
                localStorage.setItem('devops90_ui_scale', val.toString());
              }}
              className="v4-select"
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '8px 11px',
                borderRadius: 'var(--r8)',
                outline: 'none',
                fontSize: '13px'
              }}
            >
              <option value={1.0}>Normal (100%)</option>
              <option value={1.1}>Large (110%)</option>
              <option value={1.25}>Extra Large (125%)</option>
              <option value={1.5}>Huge (150%)</option>
            </select>
          </div>

          {/* Android Notifications Toggle */}
          <div style={{ marginBottom: '16px' }}>
            <label
              className="v4-label"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span>Study Reminders</span>
              <button
                onClick={toggleStudyReminders}
                style={{
                  background: notificationsEnabled ? 'var(--blue)' : 'var(--border)',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {notificationsEnabled ? 'ON' : 'OFF'}
              </button>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Morning Reminder</span>
              <input
                type="time"
                value={morningTime}
                onChange={e => handleMorningTimeChange(e.target.value)}
                style={{
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--mono)',
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Evening Reminder</span>
              <input
                type="time"
                value={eveningTime}
                onChange={e => handleEveningTimeChange(e.target.value)}
                style={{
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--mono)',
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
            
            {Capacitor.isNativePlatform() && (
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={handleTestNotification}
                  style={{
                    width: '100%',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#3B82F6',
                    padding: '6px 12px',
                    borderRadius: 'var(--r8)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'var(--mono)',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🧪 Test Notification (10s)
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button className="v4-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="v4-btn-primary"
              onClick={handleSaveSettings}
              style={{
                padding: '8px 16px',
                background: 'rgba(0,217,160,.1)',
                border: '1px solid rgba(0,217,160,.4)',
                color: 'var(--green)',
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                borderRadius: 'var(--r8)',
                cursor: 'pointer'
              }}
            >
              Save Key
            </button>
          </div>
        </div>

        {/* Scrollable Bottom Part */}
        <div style={{ padding: '16px 22px 22px', overflowY: 'auto', flex: 1 }}>
          {/* GitHub Notes Sync */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>🦑</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>GitHub Notes Sync</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sub)', marginBottom: '12px', lineHeight: '1.4' }}>
              Configure these to sync Bootcamp Notes directly to your GitHub repository. You need a{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--green)', textDecoration: 'underline' }}
              >
                GitHub Personal Access Token
              </a>{' '}
              with <code>repo</code> scope.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label className="v4-label" style={{ fontSize: '10px' }}>GitHub Username</label>
                <input
                  type="text"
                  className="v4-input"
                  value={githubSettings.username}
                  onChange={e => setGithubSettings({ ...githubSettings, username: e.target.value })}
                  placeholder="your-username"
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    padding: '6px 9px',
                    borderRadius: 'var(--r8)',
                    outline: 'none',
                    fontFamily: 'var(--mono)'
                  }}
                />
              </div>
              <div>
                <label className="v4-label" style={{ fontSize: '10px' }}>Repository Name</label>
                <input
                  type="text"
                  className="v4-input"
                  value={githubSettings.repo}
                  onChange={e => setGithubSettings({ ...githubSettings, repo: e.target.value })}
                  placeholder="devops-notes"
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    padding: '6px 9px',
                    borderRadius: 'var(--r8)',
                    outline: 'none',
                    fontFamily: 'var(--mono)'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label className="v4-label" style={{ fontSize: '10px' }}>GitHub Personal Access Token (PAT)</label>
              <input
                type="password"
                className="v4-input"
                value={githubSettings.pat}
                onChange={e => setGithubSettings({ ...githubSettings, pat: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '12px',
                  padding: '6px 9px',
                  borderRadius: 'var(--r8)',
                  outline: 'none',
                  fontFamily: 'var(--mono)'
                }}
              />
            </div>

            <div style={{ marginBottom: '4px' }}>
              <label className="v4-label" style={{ fontSize: '10px' }}>Branch (Default: main)</label>
              <input
                type="text"
                className="v4-input"
                value={githubSettings.branch}
                onChange={e => setGithubSettings({ ...githubSettings, branch: e.target.value })}
                placeholder="main"
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '12px',
                  padding: '6px 9px',
                  borderRadius: 'var(--r8)',
                  outline: 'none',
                  fontFamily: 'var(--mono)'
                }}
              />
            </div>
          </div>

          {/* GitHub Sync Status */}
          <div style={{ marginBottom: '18px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
              🐙 GitHub Sync Status
            </div>
            <div style={{
              background: 'rgba(0, 217, 160, 0.05)',
              border: '1px solid rgba(0, 217, 160, 0.2)',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>✅</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--green)' }}>Successfully Authenticated</div>
                  <div style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '2px' }}>
                    Logged in as <strong>{currentUser}</strong>. Your progress is automatically syncing to your private GitHub Gist.
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(0, 217, 160, 0.1)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={handleForceSync}
                  disabled={syncing}
                  style={{
                    width: 'fit-content',
                    padding: '6px 12px',
                    background: syncing ? 'rgba(255,255,255,0.05)' : 'rgba(0, 217, 160, 0.1)',
                    border: '1px solid rgba(0, 217, 160, 0.3)',
                    color: 'var(--green)',
                    fontFamily: 'var(--mono)',
                    fontSize: '11px',
                    borderRadius: '6px',
                    cursor: syncing ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    opacity: syncing ? 0.6 : 1
                  }}
                >
                  {syncing ? '🔄 Syncing...' : '🔄 Force Sync Now'}
                </button>

                {syncMessage && (
                  <div style={{
                    fontSize: '11px',
                    color: syncMessage.includes('❌') ? '#ff5f5f' : 'var(--green)',
                    fontFamily: 'var(--mono)',
                    marginTop: '4px'
                  }}>
                    {syncMessage}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <label
              className="v4-label"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0 }}
            >
              <span>Sync with System Theme</span>
              <input
                type="checkbox"
                checked={syncWithSystemTheme}
                onChange={e => {
                  const checked = e.target.checked;
                  setSyncWithSystemTheme(checked);
                  localStorage.setItem('devops90_theme_sync', checked ? 'true' : 'false');
                  if (!checked) {
                    localStorage.setItem('devops90_theme', theme);
                  }
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </label>
            <div style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '4px', lineHeight: '1.4' }}>
              Automatically match the application's appearance with your system's light/dark mode settings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
