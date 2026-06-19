import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { CHALLENGES } from '../data/challenges';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeWeekday: number;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  challengeWeekday
}) => {
  const ch = CHALLENGES.find(c => c.weekday === challengeWeekday) || CHALLENGES[0];
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = daysOfWeek[ch.weekday - 1];

  const [status, setStatus] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const answerKey = `devops90_challenge_answered_${ch.weekday}`;
      const selectKey = `devops90_challenge_selected_${ch.weekday}`;
      setStatus(localStorage.getItem(answerKey));
      const stored = localStorage.getItem(selectKey);
      setSelectedIdx(stored !== null ? parseInt(stored, 10) : null);
    }
  }, [isOpen, challengeWeekday, ch.weekday]);

  if (!isOpen) return null;

  const handleOptionClick = (idx: number) => {
    if (status) return;

    const answerKey = `devops90_challenge_answered_${ch.weekday}`;
    const selectKey = `devops90_challenge_selected_${ch.weekday}`;

    setSelectedIdx(idx);
    localStorage.setItem(selectKey, idx.toString());

    if (idx === ch.answerIndex) {
      setStatus('correct');
      localStorage.setItem(answerKey, 'correct');

      import('canvas-confetti').then((conf) => {
        conf.default({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      });

      if (Capacitor.isNativePlatform()) {
        Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      }
    } else {
      setStatus('incorrect');
      localStorage.setItem(answerKey, 'incorrect');

      if (Capacitor.isNativePlatform()) {
        Haptics.notification({ type: NotificationType.Error }).catch(() => {});
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 700,
        background: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(15, 20, 35, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px 24px 0 0',
          padding: '24px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
          color: '#fff',
          maxHeight: '85vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: '40px', height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', margin: '0 auto 8px auto' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏆</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--green)' }}>DevOps Daily Challenge</h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--sub)' }}>Test your knowledge & maintain your streak</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>
              {dayName}'s Challenge
            </div>
            <div style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.5 }}>
              {ch.question}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ch.options.map((opt, idx) => {
              let btnBg = 'rgba(255,255,255,0.04)';
              let border = '1px solid rgba(255,255,255,0.08)';
              let badge = null;

              if (status) {
                if (idx === ch.answerIndex) {
                  btnBg = 'rgba(0, 217, 160, 0.15)';
                  border = '1px solid var(--green)';
                  badge = <span style={{ color: 'var(--green)', fontSize: '12px' }}>✓ Correct</span>;
                } else if (selectedIdx === idx) {
                  btnBg = 'rgba(255, 95, 95, 0.15)';
                  border = '1px solid var(--red)';
                  badge = <span style={{ color: 'var(--red)', fontSize: '12px' }}>✗ Your Answer</span>;
                }
              }

              return (
                <button
                  key={idx}
                  disabled={!!status}
                  onClick={() => handleOptionClick(idx)}
                  style={{
                    background: btnBg,
                    border: border,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    textAlign: 'left',
                    color: '#fff',
                    fontSize: '13.5px',
                    cursor: status ? 'default' : 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{opt}</span>
                  {badge}
                </button>
              );
            })}
          </div>

          {status && (
            <div style={{
              background: status === 'correct' ? 'rgba(0,217,160,0.06)' : 'rgba(255,95,95,0.06)',
              border: `1px dashed ${status === 'correct' ? 'var(--green)' : 'var(--red)'}`,
              borderRadius: '16px',
              padding: '16px',
              marginTop: '8px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: status === 'correct' ? 'var(--green)' : 'var(--red)', marginBottom: '4px' }}>
                {status === 'correct' ? '🎉 Brilliant! Correct Answer' : '😔 Oops! That was incorrect'}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--sub)', lineHeight: 1.5 }}>
                {ch.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
