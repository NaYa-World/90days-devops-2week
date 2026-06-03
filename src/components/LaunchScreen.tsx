import React, { useEffect } from 'react';

export const LaunchScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    // Total animation time is ~6 seconds.
    const timer = setTimeout(() => {
      onComplete();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: '#07090f', // Dark background to match app theme
      zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', fontFamily: "'Outfit', sans-serif"
    }}>
      <style>{`
        .naya-splash-img {
          width: 80%;
          max-width: 400px;
          height: auto;
          opacity: 0;
          animation: splashAnim 5.8s ease-in-out forwards;
        }

        @keyframes splashAnim {
          0% {
            opacity: 0;
            transform: scale(0.9);
            filter: drop-shadow(0 0 0 rgba(212, 175, 55, 0));
          }
          30% {
            opacity: 1;
            transform: scale(1.05);
            filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.4));
          }
          70% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 25px rgba(212, 175, 55, 0.6));
          }
          100% {
            opacity: 0;
            transform: scale(1.1);
            filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0));
          }
        }
      `}</style>

      <img 
        src="/naya-logo.png" 
        alt="NaYa Solutions" 
        className="naya-splash-img" 
      />
    </div>
  );
};
