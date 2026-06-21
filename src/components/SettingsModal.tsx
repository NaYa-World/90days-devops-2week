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
  triggerSync?: () => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeProvider,
  setActiveProviderState,
  providerKeys,
  setProviderKeys,
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
  handleTestNotification,
  triggerSync
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleForceSync = async () => {
    setSyncing(true);
    setSyncMessage('Syncing data...');
    try {
      const success = triggerSync 
        ? await triggerSync() 
        : await GitHubSyncService.autoSyncToGitHub();
      if (success) {
        setSyncMessage('✅ Sync successful!');
      } else {
        setSyncMessage('❌ Sync failed!');
      }
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
        <div style={{ padding: '22px 22px 14px', position: 'relative', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
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

        {/* Scrollable Content Part */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Provider Selector */}
          <div>
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
          <div>
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
          <div>
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
              <option value="0.85">Small (85%)</option>
              <option value="1">Normal (100%)</option>
              <option value="1.15">Large (115%)</option>
              <option value="1.3">Extra Large (130%)</option>
            </select>
          </div>

          {/* Study Reminders */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="v4-label" style={{ margin: 0 }}>Study Reminders</span>
              <button
                onClick={toggleStudyReminders}
                style={{
                  background: notificationsEnabled ? 'var(--green)' : 'rgba(255,255,255,0.08)',
                  color: notificationsEnabled ? '#000' : 'var(--sub)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--mono)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {notificationsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

          {/* GitHub Sync Status */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
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
                    Logged in as <strong>{currentUser}</strong>. Your progress is automatically syncing to your private GitHub repository '90days-devops-my-notes'.
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

        {/* Fixed Footer */}
        <div style={{ padding: '12px 22px 20px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', gap: '8px', justifyContent: 'flex-end', background: 'var(--s1)' }}>
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
    </div>
  );
};
