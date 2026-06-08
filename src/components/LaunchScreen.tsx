import React, { useEffect, useRef, useState } from 'react';

export const LaunchScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Launch video autoplay was prevented or interrupted:", err);
        });
      }
    }

    // Safety fallback: transition to app after 5 seconds if video gets stuck or fails to load
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleVideoEnded = () => {
    setFadeOut(true);
    setTimeout(onComplete, 500); // Wait for the fade-out transition to complete
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#ffffff', // White background matching the video splash design
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: "'Outfit', sans-serif",
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-in-out',
      pointerEvents: fadeOut ? 'none' : 'auto'
    }}>
      <video
        ref={videoRef}
        src="/Naya-animation.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        style={{
          width: '100%',
          maxWidth: '640px',
          height: 'auto',
          maxHeight: '85vh',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};
