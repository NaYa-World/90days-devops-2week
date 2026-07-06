import React, { useState, useEffect } from 'react';
import { AIProvider, getActiveProvider, getProviderKey, saveProviderKey, setActiveProvider } from './AIService';

interface ApiKeySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApiKeySetupModal: React.FC<ApiKeySetupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [provider, setProvider] = useState<AIProvider>(getActiveProvider());
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProvider(getActiveProvider());
      getProviderKey(getActiveProvider()).then(k => setApiKey(k || ''));
      setError('');
    }
  }, [isOpen]);

  const handleProviderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AIProvider;
    setProvider(newProvider);
    const key = await getProviderKey(newProvider);
    setApiKey(key || '');
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API Key is required.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await saveProviderKey(provider, apiKey.trim());
      setActiveProvider(provider);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save key');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const providerLinks: Record<AIProvider, { url: string; label: string }> = {
    gemini: { url: 'https://aistudio.google.com/app/apikey', label: 'Google AI Studio' },
    claude: { url: 'https://console.anthropic.com/settings/keys', label: 'Anthropic Console' },
    chatgpt: { url: 'https://platform.openai.com/api-keys', label: 'OpenAI Platform' },
    grok: { url: 'https://console.x.ai/', label: 'xAI Console' },
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        background: '#131520',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>🧠 Configure AI Provider</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--sub)' }}>
          To use the AI Terminal Simulator and IaC Generator, please provide your own API key. Keys are securely stored locally on your device.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--sub)', marginBottom: '6px' }}>
            AI Provider
          </label>
          <select 
            value={provider} 
            onChange={handleProviderChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="gemini">Google Gemini (Recommended)</option>
            <option value="claude">Anthropic Claude</option>
            <option value="chatgpt">OpenAI ChatGPT</option>
            <option value="grok">xAI Grok</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--sub)', marginBottom: '6px' }}>
            <span>API Key</span>
            <a 
              href={providerLinks[provider].url} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--p1)', textDecoration: 'none' }}
            >
              Get a key from {providerLinks[provider].label} ↗
            </a>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${provider} API key...`}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          {error && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>{error}</div>}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--sub)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 16px'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading}
            style={{
              background: 'var(--p1)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Saving...' : 'Save & Enable AI'}
          </button>
        </div>
      </div>
    </div>
  );
};
