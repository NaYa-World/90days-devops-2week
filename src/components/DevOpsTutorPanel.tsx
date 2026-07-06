import React, { useState, useRef, useEffect } from 'react';
import { AIService } from './AIService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface DevOpsTutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  taskContext: any;
  onRequestApiKey?: () => void;
}

export const DevOpsTutorPanel: React.FC<DevOpsTutorPanelProps> = ({ isOpen, onClose, taskContext, onRequestApiKey }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Reset messages when context changes
  useEffect(() => {
    if (taskContext) {
      setMessages([
        {
          id: 'initial',
          role: 'assistant',
          content: `I see you're working on **${taskContext.title}**. Need a hint or stuck on a specific part?`
        }
      ]);
    } else {
      setMessages([
        {
          id: 'initial',
          role: 'assistant',
          content: "Select a task on the roadmap first so I know what you're working on."
        }
      ]);
    }
  }, [taskContext?.id]);

  const handleSend = async () => {
    if (!input.trim() || !taskContext) return;

    const userText = input.trim();
    setInput('');
    
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, content: userText }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Send chat history without the IDs
      const historyToSend = newMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await AIService.tutorChat(historyToSend, taskContext);
      
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('api key') || err.message?.toLowerCase().includes('configured')) {
        if (onRequestApiKey) {
          onRequestApiKey();
        }
        setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: 'assistant', content: `Please configure your API key to continue.` }]);
      } else {
        setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: 'assistant', content: `Error: ${err.message}` }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      width: '350px',
      height: '500px',
      background: 'rgba(13, 19, 31, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #222d42',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      fontFamily: 'var(--body)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #222d42',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.2)',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'var(--green)',
            color: '#000',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>🤖</div>
          <span style={{ fontWeight: 600, color: '#e6edf3' }}>AI Mentor</span>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--sub)',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >×</button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(m => (
          <div key={m.id} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            background: m.role === 'user' ? '#1f6feb' : '#161b22',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '12px',
            borderBottomRightRadius: m.role === 'user' ? '4px' : '12px',
            borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '12px',
            fontSize: '14px',
            lineHeight: 1.4,
            border: m.role === 'assistant' ? '1px solid #222d42' : 'none'
          }}>
            {m.content}
          </div>
        ))}
        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            background: '#161b22',
            padding: '10px 14px',
            borderRadius: '12px',
            borderBottomLeftRadius: '4px',
            border: '1px solid #222d42',
            display: 'flex',
            gap: '4px',
            alignItems: 'center'
          }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sub)', animation: 'pulse 1s infinite' }} />
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sub)', animation: 'pulse 1s infinite 0.2s' }} />
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sub)', animation: 'pulse 1s infinite 0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #222d42',
        background: 'rgba(0,0,0,0.2)',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '20px',
          padding: '4px 4px 4px 16px'
        }}>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={taskContext ? "Ask for a hint..." : "Select a task first..."}
            disabled={!taskContext || isTyping}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#e6edf3',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!taskContext || !input.trim() || isTyping}
            style={{
              background: '#2ea043',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!taskContext || !input.trim() || isTyping) ? 'not-allowed' : 'pointer',
              opacity: (!taskContext || !input.trim() || isTyping) ? 0.5 : 1
            }}
          >
            ↑
          </button>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
