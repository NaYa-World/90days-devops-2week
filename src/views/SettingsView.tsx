import React, { useState } from 'react';
import { AIProvider } from '../components/AIService';
import { Capacitor } from '@capacitor/core';
import { GitHubSyncService } from '../components/GitHubSyncService';

interface SettingsViewProps {
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

export const SettingsView: React.FC<SettingsViewProps> = ({
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
  const [resetStep, setResetStep] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetText, setResetText] = useState('');

  const handleFinalReset = async () => {
    if (!currentUser) return;
    setSyncing(true);
    setSyncMessage('Resetting all progress and syncing to cloud...');
    try {
      const userLower = currentUser.toLowerCase();
      const userKey = `devops90_v4_${userLower}`;
      const stateKey = `devops90_v4_tasks_${userLower}`;
      const artifactsKey = `devops90_v4_artifacts_${userLower}`;
      const metaKey = `devops90_meta_timestamps_${userLower}`;
      
      const blankAppState = {
        _pomoSessions: 0,
        _history: {},
        _lastDay: '',
        _streak: 0,
        _streakFreezeUsedOn: '',
        _freezeUsedWeek: '',
        _jobs: [],
        _ghUser: '',
        _qdone: {},
        _savedJDs: [],
        _buildLogs: [],
        _mockHistory: [],
        _weekGoal: 35,
        _notifications: [
          { id: 1, text: "👋 Welcome to DevOps v4! Select a day to start learning.", date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), read: false }
        ]
      };

      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('devops90_') && !key.startsWith('devops90_github_') && key !== 'devops90_current_user' && key !== 'devops90_theme' && key !== 'devops90_theme_sync' && key !== 'devops90_notifications_enabled' && key !== 'devops90_morning_time' && key !== 'devops90_evening_time' && key !== 'devops90_ui_scale') {
          if (key !== userKey && key !== stateKey && key !== artifactsKey && key !== metaKey) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      localStorage.setItem(userKey, JSON.stringify(blankAppState));
      localStorage.setItem(stateKey, '{}');
      localStorage.setItem(artifactsKey, '{}');

      const now = Date.now();
      const localMeta: Record<string, number> = {};
      const props = ['_pomoSessions', '_history', '_lastDay', '_streak', '_streakFreezeUsedOn', '_freezeUsedWeek', '_jobs', '_ghUser', '_qdone', '_savedJDs', '_buildLogs', '_mockHistory', '_weekGoal', '_notifications'];
      props.forEach(prop => {
        localMeta[`${userKey}::_${prop}`] = now;
      });
      localMeta[`${stateKey}`] = now;
      localMeta[`${artifactsKey}`] = now;
      localStorage.setItem(metaKey, JSON.stringify(localMeta));

      await GitHubSyncService.autoSyncToGitHub();

      setSyncMessage('✅ Reset complete!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setSyncMessage('❌ Reset sync failed: ' + (err.message || err));
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } finally {
      setSyncing(false);
    }
  };

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

  const cardStyle = {
    border: '1px solid #1f1f1f',
    borderRadius: '12px',
    padding: '24px',
    background: '#0a0a0b',
    marginBottom: '20px'
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1200px', margin: '0 auto', color: '#fff', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>SETTINGS</div>
        <h1 style={{ fontSize: '32px', fontWeight: 600, margin: '0 0 8px 0', color: '#fff' }}>Settings</h1>
        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Storage, theme, optional AI tutor key, and data export or reset.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Storage */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', fontWeight: 600, color: '#fff' }}>Storage</h3>
          <p style={{ color: '#888', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>Your data is stored locally in this browser (IndexedDB). It works offline, costs nothing, and never leaves your device. Cross-device sync is an optional future extension.</p>
        </div>

        {/* Theme */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', fontWeight: 600, color: '#fff' }}>Theme</h3>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5 }}>Dark (crimson) is the built-in theme. Additional themes may arrive in a later wave.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></span>
              Dark · Crimson
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888', cursor: 'pointer', marginLeft: '12px' }}>
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
              />
              Sync with System Theme
            </label>
          </div>
        </div>

        {/* Optional AI Tutor */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', fontWeight: 600, color: '#fff' }}>Optional AI Tutor</h3>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5 }}>Bring your own API key to enable an in-lesson tutor. It's stored locally and only ever sent to your chosen provider — the platform incurs no API cost and never sees your key.</p>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={activeProvider}
              onChange={e => setActiveProviderState(e.target.value as AIProvider)}
              style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', outline: 'none', minWidth: '150px' }}
            >
              <option value="claude">Claude (Anthropic)</option>
              <option value="chatgpt">ChatGPT (OpenAI)</option>
              <option value="gemini">Gemini (Google)</option>
              <option value="grok">Grok (xAI)</option>
            </select>

            <input
              type="password"
              value={providerKeys[activeProvider]}
              onChange={e => setProviderKeys({ ...providerKeys, [activeProvider]: e.target.value })}
              placeholder={
                activeProvider === 'claude' ? 'sk-ant-...' :
                activeProvider === 'chatgpt' ? 'sk-...' :
                activeProvider === 'gemini' ? 'AIzaSy...' : 'xai-...'
              }
              style={{ background: '#000', border: '1px solid #1f1f1f', color: '#fff', padding: '10px 14px', borderRadius: '8px', outline: 'none', flex: 1, minWidth: '200px' }}
            />

            <button onClick={handleSaveSettings} style={{ background: '#ef4444', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save key</button>
          </div>
        </div>

        {/* App UI Scaling */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', fontWeight: 600, color: '#fff' }}>UI Scaling</h3>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5 }}>Adjust the global text and layout size of the application.</p>
          <select
            value={uiScale}
            onChange={e => {
              const val = parseFloat(e.target.value);
              setUiScale(val);
              localStorage.setItem('devops90_ui_scale', val.toString());
            }}
            style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', outline: 'none', minWidth: '200px' }}
          >
            <option value="0.85">Small (85%)</option>
            <option value="1">Normal (100%)</option>
            <option value="1.15">Large (115%)</option>
            <option value="1.3">Extra Large (130%)</option>
          </select>
        </div>

        {/* Study Reminders */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', fontWeight: 600, color: '#fff' }}>Study Reminders</h3>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5 }}>Configure daily morning and evening push notifications on native devices.</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={toggleStudyReminders}
              style={{
                background: notificationsEnabled ? '#00d9a0' : 'transparent',
                color: notificationsEnabled ? '#000' : '#fff',
                border: notificationsEnabled ? 'none' : '1px solid #333',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reminders {notificationsEnabled ? 'ON' : 'OFF'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Morning:</span>
              <input type="time" value={morningTime} onChange={e => handleMorningTimeChange(e.target.value)} style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '6px', padding: '6px 10px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Evening:</span>
              <input type="time" value={eveningTime} onChange={e => handleEveningTimeChange(e.target.value)} style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '6px', padding: '6px 10px' }} />
            </div>
          </div>
        </div>

        {/* GitHub Sync */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', fontWeight: 600, color: '#fff' }}>GitHub Cloud Sync</h3>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5 }}>Logged in as <strong>{currentUser}</strong>. Your progress is synced to '90days-devops-my-notes'.</p>
          <button
            onClick={handleForceSync}
            disabled={syncing || resetStep > 0}
            style={{ background: 'rgba(0, 217, 160, 0.1)', color: '#00d9a0', border: '1px solid rgba(0, 217, 160, 0.3)', padding: '8px 16px', borderRadius: '8px', cursor: (syncing || resetStep > 0) ? 'not-allowed' : 'pointer' }}
          >
            {syncing ? '🔄 Syncing...' : '🔄 Force Sync Now'}
          </button>
          {syncMessage && !syncMessage.includes('Reset') && (
            <span style={{ marginLeft: '12px', fontSize: '13px', color: syncMessage.includes('❌') ? '#ff5f5f' : '#00d9a0' }}>{syncMessage}</span>
          )}
        </div>

        {/* Your Data */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', fontWeight: 600, color: '#fff' }}>Your data</h3>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5 }}>Export a JSON backup, or reset all local progress.</p>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button style={{ background: 'transparent', color: '#fff', border: '1px solid #333', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Export data</button>
            <button onClick={() => setResetStep(1)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #333', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Reset all data</button>
          </div>

          {resetStep === 1 && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255, 95, 95, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 95, 95, 0.3)' }}>
              <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 12px 0' }}>Warning: Are you sure you want to reset all your data? This will clear all local progress.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setResetStep(2)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Proceed</button>
                <button onClick={() => setResetStep(0)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {resetStep === 2 && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255, 95, 95, 0.1)', borderRadius: '8px', border: '1px solid #ef4444' }}>
              <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 12px 0', fontWeight: 'bold' }}>Final Warning: This action cannot be undone. All data will be permanently deleted.</p>
              <input 
                type="text" 
                placeholder="Type 'delete' to confirm" 
                value={resetText}
                onChange={e => setResetText(e.target.value)}
                style={{ background: '#000', border: '1px solid rgba(255, 95, 95, 0.4)', color: '#fff', padding: '8px 12px', borderRadius: '6px', width: '100%', marginBottom: '12px', outline: 'none' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fff', cursor: 'pointer', marginBottom: '12px' }}>
                <input type="checkbox" checked={resetConfirm} onChange={e => setResetConfirm(e.target.checked)} />
                I confirm I want to reset total data
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleFinalReset} disabled={!resetConfirm || resetText !== 'delete'} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: (resetConfirm && resetText === 'delete') ? 'pointer' : 'not-allowed', opacity: (resetConfirm && resetText === 'delete') ? 1 : 0.5, fontWeight: 'bold' }}>Reset Data Now</button>
                <button onClick={() => { setResetStep(0); setResetConfirm(false); setResetText(''); }} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
          
          {syncMessage && syncMessage.includes('Reset') && (
            <p style={{ marginTop: '12px', fontSize: '13px', color: syncMessage.includes('❌') ? '#ef4444' : '#00d9a0' }}>{syncMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};
