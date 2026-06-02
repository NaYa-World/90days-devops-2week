import React, { useState } from 'react';

interface LoginScreenProps {
  loginUser: (username: string, password?: string) => boolean;
  registerUser: (username: string, password?: string) => boolean;
  getAccounts: () => { username: string; password?: string }[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ loginUser, registerUser, getAccounts }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const accounts = getAccounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (isLogin) {
      const success = loginUser(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } else {
      const success = registerUser(username, password);
      if (!success) {
        setError('Username already exists or is invalid');
      }
    }
  };

  const handleSelectAccount = (accUsername: string) => {
    setUsername(accUsername);
    setIsLogin(true);
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
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#0d131f',
        border: '1px solid #222d42',
        borderRadius: '20px',
        padding: '32px 24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
            90 Days DevOps v4
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
            Apprentice Portal
          </h2>
          <p style={{ color: 'var(--sub)', fontSize: '12px', marginTop: '6px' }}>
            Local-first account system. All progress is saved on your device.
          </p>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', background: '#141b26', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              background: isLogin ? '#1c2436' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: isLogin ? '#fff' : '#7d8fa8',
              padding: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              background: !isLogin ? '#1c2436' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: !isLogin ? '#fff' : '#7d8fa8',
              padding: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,95,95,0.08)',
            border: '1px solid rgba(255,95,95,0.2)',
            color: '#ff5f5f',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            marginBottom: '16px',
            fontFamily: 'monospace'
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#7d8fa8', marginBottom: '6px', fontFamily: 'monospace' }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. karthik"
              style={{
                width: '100%',
                background: '#07090f',
                border: '1px solid #222d42',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px',
                color: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--green)'}
              onBlur={e => e.currentTarget.style.borderColor = '#222d42'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#7d8fa8', marginBottom: '6px', fontFamily: 'monospace' }}>
              PASSWORD (OPTIONAL)
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: '#07090f',
                border: '1px solid #222d42',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px',
                color: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--green)'}
              onBlur={e => e.currentTarget.style.borderColor = '#222d42'}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: 'var(--green)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.1s'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isLogin ? 'Enter Workspace →' : 'Create Profile →'}
          </button>
        </form>

        {/* Saved Profiles Switcher */}
        {accounts.length > 0 && (
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #222d42' }}>
            <div style={{ fontSize: '11px', color: '#7d8fa8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontFamily: 'monospace' }}>
              Saved Profiles on Device
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
              {accounts.map((acc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectAccount(acc.username)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#141b26',
                    border: '1px solid #222d42',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#00d9a0'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#222d42'}
                >
                  <span style={{ fontWeight: 600 }}>👤 {acc.username}</span>
                  <span style={{ fontSize: '10px', color: '#4a5568', fontFamily: 'monospace' }}>Select</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
