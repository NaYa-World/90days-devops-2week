import React, { useState } from 'react';
import { GitHubOAuthService, DeviceFlowResponse } from '../components/GitHubOAuthService';

interface LoginScreenProps {
  loginUser: (username: string, token: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ loginUser }) => {
  const [loading, setLoading] = useState(false);
  const [deviceFlow, setDeviceFlow] = useState<DeviceFlowResponse | null>(null);
  const [error, setError] = useState('');

  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const flowInfo = await GitHubOAuthService.initiateDeviceFlow();
      setDeviceFlow(flowInfo);
      
      // Start polling for token
      const token = await GitHubOAuthService.pollForAccessToken(flowInfo.device_code, flowInfo.interval, flowInfo.expires_in);
      
      // We got the token! Fetch user profile
      const profile = await GitHubOAuthService.getUserProfile(token);
      
      // Login the user in the app state
      loginUser(profile.login, token);
      
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
      setDeviceFlow(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #0d111a 0%, #07090f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: '#e6edf3',
      fontFamily: "var(--body)"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#0d131f',
        border: '1px solid #222d42',
        borderRadius: '20px',
        padding: '32px 24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        position: 'relative',
        textAlign: 'center'
      }}>
        {/* Brand */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
            90 Days DevOps v4
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
            Apprentice Portal
          </h2>
          <p style={{ color: 'var(--sub)', fontSize: '12px', marginTop: '6px' }}>
            Authenticate with GitHub to sync your progress securely.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,95,95,0.08)',
            border: '1px solid rgba(255,95,95,0.2)',
            color: '#ff5f5f',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            marginBottom: '24px',
            fontFamily: 'monospace'
          }}>
            ⚠ {error}
          </div>
        )}

        {!deviceFlow ? (
          <>
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              style={{
                width: '100%',
                background: '#2ea043',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                opacity: loading ? 0.7 : 1
              }}
              onMouseOver={e => !loading && (e.currentTarget.style.background = '#2c974b')}
              onMouseOut={e => !loading && (e.currentTarget.style.background = '#2ea043')}
            >
              {loading ? (
                <span>Initiating Auth Flow...</span>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                  </svg>
                  Continue with GitHub
                </>
              )}
            </button>

            {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
              <button
                onClick={() => loginUser('local_dev_user', 'dummy_token')}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: 'var(--sub)',
                  border: '1px solid #222d42',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '13px',
                  marginTop: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--body)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#38bdf8';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = 'var(--sub)';
                  e.currentTarget.style.borderColor = '#222d42';
                }}
              >
                🛠 Bypass Login (Localhost)
              </button>
            )}
          </>
        ) : (
          <div style={{
            background: '#141b26',
            border: '1px solid #222d42',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Action Required</h3>
            <p style={{ fontSize: '14px', color: 'var(--sub)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              1. Open <a href={deviceFlow.verification_uri} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>{deviceFlow.verification_uri}</a>
              <br/>
              2. Enter the code below to authorize this app:
            </p>
            
            <div style={{
              background: '#07090f',
              border: '2px dashed #222d42',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '4px',
              color: 'var(--green)',
              marginBottom: '20px',
              fontFamily: 'monospace'
            }}>
              {deviceFlow.user_code}
            </div>
            
            <div style={{ fontSize: '12px', color: '#7d8fa8' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ffc850', marginRight: '6px', animation: 'pulse 1.5s infinite' }}></span>
              Waiting for authorization...
            </div>
            <style>{`
              @keyframes pulse {
                0% { opacity: 0.4; }
                50% { opacity: 1; }
                100% { opacity: 0.4; }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};
