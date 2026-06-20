import React, { useState, useEffect, Suspense } from 'react';
import { useAppState } from './hooks/useAppState';
import { PomodoroModal } from './components/PomodoroModal';
import { SettingsModal } from './components/SettingsModal';
import { NotificationDropdown } from './components/NotificationDropdown';
import { NavigationDrawer } from './components/NavigationDrawer';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import {
  AIProvider,
  getActiveProvider,
  setActiveProvider,
  clearAllKeys
} from './components/AIService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { LoginScreen } from './views/LoginScreen';
import { BackToTop } from './components/BackToTop';
import { LaunchScreen } from './components/LaunchScreen';
import { BackupService } from './components/BackupService';
import { SecurityService } from './components/SecurityService';
import { MonitoringService } from './components/MonitoringService';
import { OTAService } from './components/OTAService';
import { NotificationService } from './components/NotificationService';
import { AppShortcuts } from '@capawesome/capacitor-app-shortcuts';
import { Network } from '@capacitor/network';
import { showToast } from './components/Toast';


import { AppViews } from './components/AppViews';

export const App: React.FC = () => {
  const appState = useAppState();
  const {
    state,
    incrementPomoSessions,
    studyHours,
    currentUser,
    loginUser,
    logoutUser,
    addNotification,
    clearNotifications,
    markNotificationsRead
  } = appState;

  const [currentView, setCurrentView] = useState<string>('roadmap');
  const [focusDay, setFocusDay] = useState<string>('0_0');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showAnim, setShowAnim] = useState<boolean>(true);
  const [isChallengeOpen, setIsChallengeOpen] = useState<boolean>(false);
  const [challengeWeekday, setChallengeWeekday] = useState<number>(1);
  const [sandboxSection, setSandboxSection] = useState<'scenarios' | 'labs' | 'free' | null>(null);
  
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [syncWithSystemTheme, setSyncWithSystemTheme] = useState<boolean>(() => {
    return localStorage.getItem('devops90_theme_sync') === 'true';
  });

  // Modals visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPomoOpen, setIsPomoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('devops90_notifications_enabled') === 'true';
  });
  const [morningTime, setMorningTime] = useState(() => localStorage.getItem('devops90_morning_time') || '09:00');
  const [eveningTime, setEveningTime] = useState(() => localStorage.getItem('devops90_evening_time') || '20:00');
  const [uiScale, setUiScale] = useState(() => parseFloat(localStorage.getItem('devops90_ui_scale') || '1.0'));
  const [activeProvider, setActiveProviderState] = useState<AIProvider>('claude');

  const [providerKeys, setProviderKeys] = useState<Record<AIProvider, string>>({
    claude: '',
    chatgpt: '',
    gemini: '',
    grok: ''
  });

  const [openHamSections, setOpenHamSections] = useState<Record<string, boolean>>({
    study: true,
    tracking: false,
    career: false,
    ai: false,
    settings: false,
  });

  const toggleHamSection = (section: string) => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }
    setOpenHamSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Initialize native services (Sentry, OTA, Push, Shortcuts)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add('native-platform');
      MonitoringService.init();
      OTAService.init();

      // Prevent pinch-to-zoom gestures on native platform
      document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });

      // Prevent iOS gesture zoom
      document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
      });


      // Check notification permission and sync state to avoid UI mismatch if permissions were manually revoked
      LocalNotifications.checkPermissions().then(perm => {
        if (perm.display !== 'granted' && notificationsEnabled) {
          setNotificationsEnabled(false);
          localStorage.setItem('devops90_notifications_enabled', 'false');
          NotificationService.sync(false, morningTime, eveningTime);
        } else {
          NotificationService.init(notificationsEnabled, morningTime, eveningTime);
        }
      }).catch(() => {
        NotificationService.init(notificationsEnabled, morningTime, eveningTime);
      });

      // Configure native App Shortcuts (Home screen quick actions)
      AppShortcuts.set({
        shortcuts: [
          { id: 'roadmap', title: 'Roadmap', description: 'Open study roadmap' },
          { id: 'notes', title: 'Notes', description: 'Open study notes' },
          { id: 'focus', title: 'Focus Timer', description: 'Start a Pomodoro session' },
          { id: 'qbank', title: 'QBank', description: 'Practice interview questions' }
        ]
      }).catch(() => {});

      const shortcutListener = AppShortcuts.addListener('click', (e) => {
        if (e.shortcutId === 'roadmap' || e.shortcutId === 'notes' || e.shortcutId === 'focus' || e.shortcutId === 'qbank') {
          setCurrentView(e.shortcutId as any);
        }
      });

      return () => {
        shortcutListener.then(sub => sub.remove());
      };
    }
    return undefined;
  }, []);

  // Register Daily Challenge listener for local notification clicks
  useEffect(() => {
    let notifListener: any = null;
    if (Capacitor.isNativePlatform()) {
      notifListener = LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (action) => {
          console.log('devops90 [Tapped]:', action.notification);
          const id = action.notification.id;
          if ((id >= 9001 && id <= 9007) || (id >= 9101 && id <= 9107)) {
            const weekday = id >= 9101 ? id - 9100 : id - 9000;
            setChallengeWeekday(weekday);
            setIsChallengeOpen(true);
          }
        }
      );
    }
    return () => {
      if (notifListener) {
        notifListener.then((l: any) => l.remove());
      }
    };
  }, []);

  // Monitor network status on all platforms
  useEffect(() => {
    Network.getStatus().then(status => {
      setIsOffline(!status.connected);
    }).catch(() => {});

    const networkListener = Network.addListener('networkStatusChange', (status) => {
      setIsOffline(!status.connected);
    });

    return () => {
      networkListener.then(sub => sub.remove());
    };
  }, []);

  // System Theme Sync logic
  useEffect(() => {
    if (syncWithSystemTheme) {
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const nextTheme = e.matches ? 'dark' : 'light';
        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
      };
      handleThemeChange(darkQuery);
      darkQuery.addEventListener('change', handleThemeChange);
      return () => darkQuery.removeEventListener('change', handleThemeChange);
    }
    return undefined;
  }, [syncWithSystemTheme]);

  // Sync notification service on status or time changes
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      NotificationService.init(notificationsEnabled, morningTime, eveningTime);
    }
  }, [notificationsEnabled, morningTime, eveningTime]);

  // Theme the native status bar on launch
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#07090f' }).catch(() => {});
    }
  }, []);

  // Apply UI Scale for Font Size Increase
  useEffect(() => {
    (document.documentElement.style as any).zoom = uiScale.toString();
  }, [uiScale]);

  // On native mobile devices, run auto-restore on startup
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      BackupService.autoRestore().then(restored => {
        if (restored) {
          console.log("devops90: Auto-restored backup on startup. Reloading app.");
          window.location.reload();
        }
      }).catch(err => {
        console.error("devops90: Auto-restore on startup failed:", err);
      });
    }
  }, []);

  // Run native state backup when app goes to background, or check permissions when resuming
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const sub = CapacitorApp.addListener('appStateChange', (state) => {
        if (state.isActive) {
          LocalNotifications.checkPermissions().then(perm => {
            if (perm.display !== 'granted' && notificationsEnabled) {
              setNotificationsEnabled(false);
              localStorage.setItem('devops90_notifications_enabled', 'false');
              NotificationService.sync(false, morningTime, eveningTime);
            }
          }).catch(() => {});
        } else {
          BackupService.autoBackup().catch(err => {
            console.error("devops90: App background backup failed:", err);
          });
        }
      });
      return () => {
        sub.then(listener => listener.remove());
      };
    }
    return undefined;
  }, [notificationsEnabled, morningTime, eveningTime]);

  // Prevent background scrolling when settings or pomo modal is open
  useEffect(() => {
    if (isSettingsOpen || isPomoOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isSettingsOpen, isPomoOpen]);

  // Native hardware back button & keyboard handling
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});
      
      let lastBackPress = 0;
      const backListener = CapacitorApp.addListener('backButton', () => {
        if (isSettingsOpen) { setIsSettingsOpen(false); return; }
        if (isPomoOpen) { setIsPomoOpen(false); return; }
        if (isDrawerOpen) { setIsDrawerOpen(false); return; }

        setCurrentView(prevView => {
          if (prevView !== 'roadmap') {
            return 'roadmap';
          }
          const now = Date.now();
          if (now - lastBackPress < 2000) {
            CapacitorApp.exitApp();
          } else {
            lastBackPress = now;
            showToast("Press back again to exit");
          }
          return prevView;
        });
      });

      return () => {
        backListener.then(listener => listener.remove());
      };
    }
    return undefined;
  }, [isSettingsOpen, isPomoOpen, isDrawerOpen]);


  const handleMorningTimeChange = async (newTime: string) => {
    setMorningTime(newTime);
    localStorage.setItem('devops90_morning_time', newTime);
    if (Capacitor.isNativePlatform()) {
      await NotificationService.sync(notificationsEnabled, newTime, eveningTime);
      showToast(`Morning reminder updated to ${newTime}`);
    }
  };

  const handleEveningTimeChange = async (newTime: string) => {
    setEveningTime(newTime);
    localStorage.setItem('devops90_evening_time', newTime);
    if (Capacitor.isNativePlatform()) {
      await NotificationService.sync(notificationsEnabled, morningTime, newTime);
      showToast(`Evening reminder updated to ${newTime}`);
    }
  };

  const toggleStudyReminders = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert('Study reminders are only supported on native Android/iOS devices.');
      return;
    }
    const nextEnabled = !notificationsEnabled;
    try {
      if (nextEnabled) {
        let permStatus = await LocalNotifications.checkPermissions();
        if (permStatus.display !== 'granted') {
          permStatus = await LocalNotifications.requestPermissions();
        }
        if (permStatus.display === 'granted') {
          await NotificationService.sync(true, morningTime, eveningTime);
          setNotificationsEnabled(true);
          localStorage.setItem('devops90_notifications_enabled', 'true');
          alert(`Study reminders enabled! You will receive daily check-ins at ${morningTime} and ${eveningTime}.`);
        } else {
          alert('Notification permission denied.');
        }
      } else {
        await NotificationService.sync(false, morningTime, eveningTime);
        setNotificationsEnabled(false);
        localStorage.setItem('devops90_notifications_enabled', 'false');
        alert('Study reminders disabled.');
      }
    } catch (err) {
      console.error('Local notifications error:', err);
    }
  };


  // Handle Theme Initialisation
  useEffect(() => {
    const savedTheme = localStorage.getItem('devops90_theme') || 'dark';
    setTheme(savedTheme as any);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Daily login & finish tasks desktop notification reminder
  useEffect(() => {
    if (!currentUser) return;

    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      const today = new Date().toDateString();
      const lastNotif = localStorage.getItem(`devops90_last_desktop_notif_${currentUser.toLowerCase()}`);
      if (lastNotif !== today && Notification.permission === 'granted') {
        new Notification('📅 DevOps Daily Reminder', {
          body: `Hi ${currentUser}, time to log in and work on your 90-day DevOps roadmap tasks!`,
          icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        });
        localStorage.setItem(`devops90_last_desktop_notif_${currentUser.toLowerCase()}`, today);
      }
    }
  }, [currentUser]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('devops90_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleOpenSettings = async () => {
    const claudeKey = await SecurityService.getSecureCredential('devops90_anthropic_api_key');
    const chatgptKey = await SecurityService.getSecureCredential('devops90_openai_api_key');
    const geminiKey = await SecurityService.getSecureCredential('devops90_gemini_api_key');
    const grokKey = await SecurityService.getSecureCredential('devops90_grok_api_key');

    setProviderKeys({
      claude: claudeKey,
      chatgpt: chatgptKey,
      gemini: geminiKey,
      grok: grokKey
    });
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    setActiveProvider(activeProvider);
    await SecurityService.saveSecureCredential('devops90_anthropic_api_key', providerKeys.claude);
    await SecurityService.saveSecureCredential('devops90_openai_api_key', providerKeys.chatgpt);
    await SecurityService.saveSecureCredential('devops90_gemini_api_key', providerKeys.gemini);
    await SecurityService.saveSecureCredential('devops90_grok_api_key', providerKeys.grok);
    
    setIsSettingsOpen(false);

    if (Capacitor.isNativePlatform()) {
      await BackupService.autoBackup();
    }
  };

  const handleLogout = () => {
    clearAllKeys();
    logoutUser();
  };





  // const primaryViews = ['roadmap', 'kanban', 'focus', 'labs'];

  const handleNavItemClick = (view: string) => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }
    setCurrentView(view);
    setIsDrawerOpen(false);
    if (view !== 'sandbox') {
      setSandboxSection(null);
    }
  };

  const handleShareProgress = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
        await Share.share({
          title: 'My 90 Days DevOps Notes 🚀',
          text: `I'm learning DevOps! Current study stats: ${studyHours} hours of focus sessions. Join me in the 90 Days DevOps Challenge!`,
          url: 'https://github.com/NaYaGK/sitecore-ww',
          dialogTitle: 'Share your DevOps Progress',
        });
      } else {
        if (navigator.share) {
          await navigator.share({
            title: 'My 90 Days DevOps Notes 🚀',
            text: `I'm learning DevOps! Current study stats: ${studyHours} hours of focus sessions. Join me in the 90 Days DevOps Challenge!`,
            url: 'https://github.com/NaYaGK/sitecore-ww',
          });
        } else {
          await navigator.clipboard.writeText(`I'm learning DevOps! Current study stats: ${studyHours} hours of focus sessions. Join me in the 90 Days DevOps Challenge!`);
          alert('🚀 Progress copied to clipboard!');
        }
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };


  // Guard routing for Local Authentication system (unconditional hooks first)
  if (showAnim) {
    return <LaunchScreen onComplete={() => setShowAnim(false)} />;
  }

  if (!currentUser) {
    return (
      <LoginScreen
        loginUser={loginUser}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', '--offline-h': isOffline ? 'calc(33px + env(safe-area-inset-top, 0px))' : '0px' } as React.CSSProperties}>
      <div className={`offline-banner ${isOffline ? 'visible' : ''}`}>
        🔌 Offline Mode. AI-powered features require internet and are temporarily disabled.
      </div>
      {/* Navigation Top Bar */}
      <nav id="nav">
        <button
          id="ham-btn"
          className={isDrawerOpen ? 'open' : ''}
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          aria-label="Menu"
          aria-expanded={isDrawerOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="nav-brand" onClick={() => handleNavItemClick('roadmap')} style={{ cursor: 'pointer' }}>
          <span className="g">DEV</span>
          <span className="p">OPS</span>
          <span className="v">BY GK</span>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${currentView === 'roadmap' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('roadmap')}
            style={{ background: currentView === 'roadmap' ? 'rgba(0,217,160,.15)' : undefined, color: currentView === 'roadmap' ? 'var(--green)' : undefined }}
          >
            💥 DevOps Roadmap
          </button>
          <button
            className={`nav-tab ${currentView === 'roadmap-v3' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('roadmap-v3')}
            style={{ background: currentView === 'roadmap-v3' ? 'rgba(168,85,247,.15)' : undefined, color: currentView === 'roadmap-v3' ? 'var(--purple)' : undefined }}
          >
            🚀 v3 Roadmap
          </button>
          <button
            className={`nav-tab ${currentView === 'kanban' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('kanban')}
          >
            ⊞ Kanban
          </button>
          <button
            className={`nav-tab ${currentView === 'focus' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('focus')}
          >
            ◎ Focus
          </button>
          <button
            className={`nav-tab ${currentView === 'sandbox' && sandboxSection !== 'labs' ? 'active' : ''}`}
            onClick={() => {
              setSandboxSection(null);
              handleNavItemClick('sandbox');
            }}
          >
            🧑‍💻 Sandbox
          </button>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => handleNavItemClick('notes')}>📝 Notes</button>
          <button className="nav-btn hi" onClick={() => setIsPomoOpen(true)}>⏱</button>
          <button className="nav-btn" onClick={handleShareProgress} title="Share Progress">📤 Share</button>

          <NotificationDropdown
            isNotifOpen={isNotifOpen}
            setIsNotifOpen={setIsNotifOpen}
            notifications={state.notifications || []}
            markNotificationsRead={markNotificationsRead}
            clearNotifications={clearNotifications}
          />

          <button className="nav-btn" onClick={toggleTheme}>◑ Theme</button>
          <button className="nav-btn" onClick={handleOpenSettings}>⚙️ Settings</button>
          <button
            className="nav-btn"
            onClick={handleLogout}
            style={{
              borderColor: 'rgba(255,95,95,.4)',
              color: 'var(--red)',
              background: 'rgba(255,95,95,.05)'
            }}
          >
            👤 {currentUser} (Logout)
          </button>
        </div>
      </nav>

      <NavigationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        currentView={currentView}
        handleNavItemClick={handleNavItemClick}
        openHamSections={openHamSections}
        toggleHamSection={toggleHamSection}
        setChallengeWeekday={setChallengeWeekday}
        setIsChallengeOpen={setIsChallengeOpen}
        handleOpenSettings={handleOpenSettings}
        notificationsEnabled={notificationsEnabled}
        toggleStudyReminders={toggleStudyReminders}
        theme={theme}
        toggleTheme={toggleTheme}
        handleShareProgress={handleShareProgress}
        handleLogout={handleLogout}
        currentUser={currentUser}
        sandboxSection={sandboxSection}
        setSandboxSection={setSandboxSection}
      />

      <main style={{ paddingBottom: '80px' }}>
        <Suspense fallback={<div className="wrap" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="ai-spinner"></div></div>}>
          <AppViews
            currentView={currentView}
            setCurrentView={setCurrentView}
            appState={appState}
            focusDay={focusDay}
            setFocusDay={setFocusDay}
            sandboxSection={sandboxSection}
            setSandboxSection={setSandboxSection}
            theme={theme}
          />
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div id="bottom-bar">
        <button
          className={`btab ${currentView === 'roadmap' ? 'active' : ''}`}
          onClick={() => handleNavItemClick('roadmap')}
        >
          <span className="bico">💥</span>Roadmap
        </button>
        <button
          className={`btab ${currentView === 'kanban' ? 'active' : ''}`}
          onClick={() => handleNavItemClick('kanban')}
        >
          <span className="bico">⊞</span>Kanban
        </button>
        <button
          className={`btab ${currentView === 'focus' ? 'active' : ''}`}
          onClick={() => handleNavItemClick('focus')}
        >
          <span className="bico">◎</span>Focus
        </button>
        <button
          className={`btab ${currentView === 'sandbox' && sandboxSection !== 'labs' ? 'active' : ''}`}
          onClick={() => {
            setSandboxSection(null);
            handleNavItemClick('sandbox');
          }}
        >
          <span className="bico">🧑‍💻</span>Sandbox
        </button>
        <button
          className="btab"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <span className="bico">☰</span>More
        </button>
      </div>

      {/* Pomodoro Timer Modal */}
      <PomodoroModal
        isOpen={isPomoOpen}
        onClose={() => setIsPomoOpen(false)}
        pomoSessions={state.pomoSessions}
        incrementSessions={incrementPomoSessions}
        studyHours={studyHours()}
        addNotification={addNotification}
      />

      {/* Back to Top button */}
      <BackToTop />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeProvider={activeProvider}
        setActiveProviderState={setActiveProviderState}
        providerKeys={providerKeys}
        setProviderKeys={setProviderKeys}
        uiScale={uiScale}
        setUiScale={setUiScale}
        notificationsEnabled={notificationsEnabled}
        toggleStudyReminders={toggleStudyReminders}
        morningTime={morningTime}
        handleMorningTimeChange={handleMorningTimeChange}
        eveningTime={eveningTime}
        handleEveningTimeChange={handleEveningTimeChange}
        handleSaveSettings={handleSaveSettings}
        syncWithSystemTheme={syncWithSystemTheme}
        setSyncWithSystemTheme={setSyncWithSystemTheme}
        theme={theme}
        currentUser={currentUser}
        handleTestNotification={async () => {
          if (Capacitor.isNativePlatform()) {
            await NotificationService.testFireNow();
            showToast('Test notification scheduled in 10 seconds. Close the app to see it!');
          }
        }}
      />

      <DailyChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        challengeWeekday={challengeWeekday}
      />
    </div>
  );
};

export default App;
