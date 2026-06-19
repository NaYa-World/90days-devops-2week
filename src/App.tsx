import React, { useState, useEffect, Suspense } from 'react';
import { useAppState } from './hooks/useAppState';
import { PomodoroModal } from './components/PomodoroModal';
import {
  AIProvider,
  getActiveProvider,
  setActiveProvider,
  clearAllKeys
} from './components/AIService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
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
// import { NotificationService } from './components/NotificationService';
import { AppShortcuts } from '@capawesome/capacitor-app-shortcuts';
import { Network } from '@capacitor/network';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { showToast } from './components/Toast';


// Lazy load views for optimal code splitting & bundle size reduction
const RoadmapView = React.lazy(() => import('./views/RoadmapView').then(m => ({ default: m.RoadmapView })));
const RoadmapV2View = React.lazy(() => import('./views/RoadmapV2View').then(m => ({ default: m.RoadmapV2View })));
const RoadmapV3View = React.lazy(() => import('./views/RoadmapV3View').then(m => ({ default: m.RoadmapV3View })));
const KanbanView = React.lazy(() => import('./views/KanbanView').then(m => ({ default: m.KanbanView })));
const FocusView = React.lazy(() => import('./views/FocusView').then(m => ({ default: m.FocusView })));
const JobsView = React.lazy(() => import('./views/JobsView').then(m => ({ default: m.JobsView })));
const QbankView = React.lazy(() => import('./views/QbankView').then(m => ({ default: m.QbankView })));
const StatsView = React.lazy(() => import('./views/StatsView').then(m => ({ default: m.StatsView })));
const WeeklyView = React.lazy(() => import('./views/WeeklyView').then(m => ({ default: m.WeeklyView })));
const ProjectsView = React.lazy(() => import('./views/ProjectsView').then(m => ({ default: m.ProjectsView })));
const GithubRewriterView = React.lazy(() => import('./views/GithubRewriterView').then(m => ({ default: m.GithubRewriterView })));
const ResumeView = React.lazy(() => import('./views/ResumeView').then(m => ({ default: m.ResumeView })));
const MockInterviewView = React.lazy(() => import('./views/MockInterviewView').then(m => ({ default: m.MockInterviewView })));
const SkillGapView = React.lazy(() => import('./views/SkillGapView').then(m => ({ default: m.SkillGapView })));
const BuildLogView = React.lazy(() => import('./views/BuildReviewComboView').then(m => ({ default: m.BuildReviewComboView })));
const LinkedInView = React.lazy(() => import('./views/LinkedInView').then(m => ({ default: m.LinkedInView })));
// const ReviewsView = React.lazy(() => import('./views/ReviewsView').then(m => ({ default: m.ReviewsView })));
const NotesView = React.lazy(() => import('./views/NotesView').then(m => ({ default: m.NotesView })));
const ReadinessView = React.lazy(() => import('./views/ReadinessView').then(m => ({ default: m.ReadinessView })));

// New Advanced DevOps views
const DevOpsSandboxView = React.lazy(() => import('./views/DevOpsSandboxView').then(m => ({ default: m.DevOpsSandboxView })));
const DiagramBuilderView = React.lazy(() => import('./views/DiagramBuilderView').then(m => ({ default: m.DiagramBuilderView })));
const DevOpsFlowsView = React.lazy(() => import('./views/DevOpsFlowsView').then(m => ({ default: m.DevOpsFlowsView })));

export const App: React.FC = () => {
  const appState = useAppState();
  const {
    state,
    incrementPomoSessions,
    studyHours,
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    getAccounts,
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem('devops90_reminder_time') || '09:00');
  const [uiScale, setUiScale] = useState(() => parseFloat(localStorage.getItem('devops90_ui_scale') || '1.0'));
  const [activeProvider, setActiveProviderState] = useState<AIProvider>('claude');

  const [providerKeys, setProviderKeys] = useState<Record<AIProvider, string>>({
    claude: '',
    chatgpt: '',
    gemini: '',
    grok: ''
  });
  const [githubSettings, setGithubSettings] = useState({ pat: '', username: '', repo: '', branch: 'main' });

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


      // NotificationService.init(); // Commented out to prevent Firebase startup crash (requires google-services.json)

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

  // Check initial notification status
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.getPending().then(res => {
        if (res.notifications.some(n => (n.id >= 9001 && n.id <= 9007) || (n.id >= 9101 && n.id <= 9107))) {
          setNotificationsEnabled(true);
        }
      }).catch(() => {});
    }
  }, []);

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

  // Run native state backup when app goes to background
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const sub = CapacitorApp.addListener('appStateChange', (state) => {
        if (!state.isActive) {
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
  }, []);

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


  const handleReminderTimeChange = async (newTime: string) => {
    setReminderTime(newTime);
    localStorage.setItem('devops90_reminder_time', newTime);
    
    if (notificationsEnabled && Capacitor.isNativePlatform()) {
      try {
        const ids = [
          ...Array.from({ length: 7 }, (_, i) => ({ id: 9000 + i + 1 })),
          ...Array.from({ length: 7 }, (_, i) => ({ id: 9100 + i + 1 }))
        ];
        await LocalNotifications.cancel({ notifications: ids });
        
        const [hourStr, minStr] = newTime.split(':');
        const hr = parseInt(hourStr, 10);
        const hr2 = (hr + 12) % 24;
        const mn = parseInt(minStr, 10);
        
        const notifications = [];
        const challengeNotifications = CHALLENGES.map(ch => {
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const dayName = daysOfWeek[ch.weekday - 1];
          return {
            weekday: ch.weekday,
            title: `🏆 DevOps Daily Challenge (${dayName})`,
            body: `Today's challenge: ${ch.question.substring(0, 90)}...`
          };
        });

        for (const msg of challengeNotifications) {
          notifications.push({
            id: 9000 + msg.weekday,
            title: msg.title,
            body: msg.body,
            schedule: {
              on: {
                weekday: msg.weekday,
                hour: hr,
                minute: mn
              },
              every: 'week' as any
            },
            channelId: 'study-reminders',
            sound: 'default'
          });

          notifications.push({
            id: 9100 + msg.weekday,
            title: msg.title + ' (Evening Reminder)',
            body: msg.body,
            schedule: {
              on: {
                weekday: msg.weekday,
                hour: hr2,
                minute: mn
              },
              every: 'week' as any
            },
            channelId: 'study-reminders',
            sound: 'default'
          });
        }

        await LocalNotifications.schedule({ notifications });
        showToast(`Study reminders updated to ${newTime}!`);
      } catch (err) {
        console.error('Failed to reschedule notifications:', err);
      }
    }
  };

  const toggleStudyReminders = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert('Study reminders are only supported on native Android/iOS devices.');
      return;
    }
    try {
      if (!notificationsEnabled) {
        let permStatus = await LocalNotifications.checkPermissions();
        if (permStatus.display !== 'granted') {
          permStatus = await LocalNotifications.requestPermissions();
        }
        if (permStatus.display === 'granted') {
          if (Capacitor.isNativePlatform()) {
            await LocalNotifications.createChannel({
              id: 'study-reminders',
              name: 'Study Reminders',
              description: 'DevOps study reminders scheduled daily',
              importance: 5,
              visibility: 1,
              vibration: true,
              sound: 'default'
            });
          }

          const [hourStr, minStr] = reminderTime.split(':');
          const hr = parseInt(hourStr || '9', 10);
          const hr2 = (hr + 12) % 24;
          const mn = parseInt(minStr || '0', 10);

          const notifications = [];
          const challengeNotifications = CHALLENGES.map(ch => {
            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = daysOfWeek[ch.weekday - 1];
            return {
              weekday: ch.weekday,
              title: `🏆 DevOps Daily Challenge (${dayName})`,
              body: `Today's challenge: ${ch.question.substring(0, 90)}...`
            };
          });

          for (const msg of challengeNotifications) {
            notifications.push({
              id: 9000 + msg.weekday,
              title: msg.title,
              body: msg.body,
              schedule: {
                on: {
                  weekday: msg.weekday,
                  hour: hr,
                  minute: mn
                },
                every: 'week' as any
              },
              channelId: 'study-reminders',
              sound: 'default'
            });

            notifications.push({
              id: 9100 + msg.weekday,
              title: msg.title + ' (Evening Reminder)',
              body: msg.body,
              schedule: {
                on: {
                  weekday: msg.weekday,
                  hour: hr2,
                  minute: mn
                },
                every: 'week' as any
              },
              channelId: 'study-reminders',
              sound: 'default'
            });
          }

          await LocalNotifications.schedule({ notifications });
          setNotificationsEnabled(true);
          alert(`Study reminders enabled! You will receive a daily DevOps challenge notification at ${reminderTime}.`);
        } else {
          alert('Notification permission denied.');
        }
      } else {
        const ids = [
          ...Array.from({ length: 7 }, (_, i) => ({ id: 9000 + i + 1 })),
          ...Array.from({ length: 7 }, (_, i) => ({ id: 9100 + i + 1 }))
        ];
        await LocalNotifications.cancel({ notifications: ids });
        setNotificationsEnabled(false);
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
    const active = getActiveProvider();
    setActiveProviderState(active);

    const claudeKey = await SecurityService.getSecureCredential('devops90_anthropic_api_key');
    const chatgptKey = await SecurityService.getSecureCredential('devops90_openai_api_key');
    const geminiKey = await SecurityService.getSecureCredential('devops90_gemini_api_key');
    const grokKey = await SecurityService.getSecureCredential('devops90_grok_api_key');
    const githubPat = await SecurityService.getSecureCredential('devops90_github_pat');

    setProviderKeys({
      claude: claudeKey,
      chatgpt: chatgptKey,
      gemini: geminiKey,
      grok: grokKey
    });
    setGithubSettings({
      pat: githubPat,
      username: localStorage.getItem('devops90_github_username') || '',
      repo: localStorage.getItem('devops90_github_repo') || '',
      branch: localStorage.getItem('devops90_github_branch') || 'main'
    });
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    setActiveProvider(activeProvider);
    await SecurityService.saveSecureCredential('devops90_anthropic_api_key', providerKeys.claude);
    await SecurityService.saveSecureCredential('devops90_openai_api_key', providerKeys.chatgpt);
    await SecurityService.saveSecureCredential('devops90_gemini_api_key', providerKeys.gemini);
    await SecurityService.saveSecureCredential('devops90_grok_api_key', providerKeys.grok);
    
    // Save GitHub settings
    await SecurityService.saveSecureCredential('devops90_github_pat', githubSettings.pat.trim());
    localStorage.setItem('devops90_github_username', githubSettings.username.trim());
    localStorage.setItem('devops90_github_repo', githubSettings.repo.trim());
    localStorage.setItem('devops90_github_branch', githubSettings.branch.trim() || 'main');
    setIsSettingsOpen(false);

    if (Capacitor.isNativePlatform()) {
      await BackupService.autoBackup();
    }
  };

  const handleLogout = () => {
    clearAllKeys();
    logoutUser();
  };

  const handleExportBackup = async () => {
    try {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('devops90')) {
          data[key] = localStorage.getItem(key) || '';
        }
      }
      const dataStr = JSON.stringify(data, null, 2);
      
      if (Capacitor.isNativePlatform()) {
        const fileName = `devops90_backup_${Date.now()}.json`;
        await Filesystem.writeFile({
          path: fileName,
          data: dataStr,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        
        const fileUri = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache
        });
        
        await Share.share({
          title: 'DevOps90 Progress Backup',
          text: 'Here is my DevOps90 progress backup file.',
          url: fileUri.uri,
          dialogTitle: 'Export Backup'
        });
      } else {
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devops90_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('❌ Export failed: ' + err);
    }
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const data = JSON.parse(text);
        if (data && typeof data === 'object') {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('devops90')) {
              localStorage.removeItem(key);
            }
          }
          Object.keys(data).forEach(k => {
            localStorage.setItem(k, data[k]);
          });
          
          if (Capacitor.isNativePlatform()) {
            await BackupService.autoBackup();
          }
          
          alert('✅ Progress successfully imported! Reloading...');
          window.location.reload();
        } else {
          alert('❌ Invalid backup file format.');
        }
      } catch (err) {
        alert('❌ Failed to parse backup file: ' + err);
      }
    };
    reader.readAsText(file);
  };

  const renderView = () => {
    switch (currentView) {
      case 'roadmap':
        return (
          <RoadmapView
            appState={appState}
            switchView={setCurrentView}
            setFocusDay={setFocusDay}
          />
        );
      case 'roadmap-v2':
        return (
          <React.Suspense fallback={<div style={{ padding: 40, color: 'var(--sub)', textAlign: 'center' }}>Loading original v2 roadmap...</div>}>
            <RoadmapV2View appState={appState} switchView={setCurrentView} />
          </React.Suspense>
        );
      case 'kanban':
        return (
          <KanbanView
            appState={appState}
            switchView={setCurrentView}
            setFocusDay={setFocusDay}
          />
        );
      case 'focus':
        return (
          <FocusView
            appState={appState}
            focusDay={focusDay}
            setFocusDay={setFocusDay}
          />
        );
      case 'labs':
        return (
          <DevOpsSandboxView 
            appState={appState} 
            sandboxSection="labs"
            setSandboxSection={setSandboxSection}
          />
        );
      // case 'certs':
      //   return <CertsView appState={appState} />;
      case 'jobs':
        return <JobsView appState={appState} />;
      case 'qbank':
        return <QbankView appState={appState} />;
      case 'stats':
        return <StatsView appState={appState} />;
      case 'weekly':
        return <WeeklyView appState={appState} />;
      // case 'report':
      //   return <ReportView appState={appState} />;
      case 'projects':
        return <ProjectsView appState={appState} switchView={setCurrentView} />;
        case 'roadmap-v3':
          return (
            <React.Suspense fallback={<div style={{ padding: 40, color: 'var(--sub)', textAlign: 'center' }}>Loading notes-driven roadmap...</div>}>
              <RoadmapV3View appState={appState} switchView={setCurrentView} />
            </React.Suspense>
          );
      case 'github-rewriter':
        return <GithubRewriterView appState={appState} />;
      case 'resume':
        return <ResumeView appState={appState} />;
      case 'mock':
        return <MockInterviewView appState={appState} switchView={setCurrentView} />;
      case 'skillgap':
        return (
          <SkillGapView
            appState={appState}
            setFocusDay={setFocusDay}
            switchView={setCurrentView}
          />
        );
      case 'buildlog':
        return <BuildLogView appState={appState} />;
      case 'linkedin':
        return <LinkedInView appState={appState} />;
      case 'readiness':
        return <ReadinessView appState={appState} />;
      // case 'reviews':
      //   return <ReviewsView appState={appState} />;
      case 'notes':
        return <NotesView appState={appState} />;
      case 'sandbox':
        return (
          <DevOpsSandboxView 
            appState={appState} 
            sandboxSection={sandboxSection}
            setSandboxSection={setSandboxSection}
          />
        );
      case 'diagram':
        return <DiagramBuilderView appState={appState} theme={theme} />;
      case 'devops-flows':
        return <DevOpsFlowsView appState={appState} switchView={setCurrentView} />;
      // case 'cloud-planner':
      //   return <CloudPlannerView appState={appState} />;
      default:
        return (
          <RoadmapView
            appState={appState}
            switchView={setCurrentView}
            setFocusDay={setFocusDay}
          />
        );
    }
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
          title: 'My 90 Days DevOps Journey 🚀',
          text: `I'm learning DevOps! Current study stats: ${studyHours} hours of focus sessions. Join me in the 90 Days DevOps Challenge!`,
          url: 'https://github.com/NaYaGK/sitecore-ww',
          dialogTitle: 'Share your DevOps Progress',
        });
      } else {
        if (navigator.share) {
          await navigator.share({
            title: 'My 90 Days DevOps Journey 🚀',
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
        registerUser={registerUser}
        getAccounts={getAccounts}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div className={`offline-banner ${isOffline ? 'visible' : ''}`}>
        🔌 Offline Mode. AI-powered features require internet and are temporarily disabled.
      </div>
      {/* Navigation Top Bar */}
      <nav id="nav" style={{ top: isOffline ? '33px' : '0' }}>
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
          >
            ☑ Roadmap
          </button>
          <button
            className={`nav-tab ${currentView === 'roadmap-v2' ? 'active' : ''}`}
            onClick={() => handleNavItemClick('roadmap-v2')}
            style={{ background: currentView === 'roadmap-v2' ? 'rgba(0,217,160,.15)' : undefined, color: currentView === 'roadmap-v2' ? 'var(--green)' : undefined }}
          >
            💥 v2 Roadmap
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

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="nav-btn"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                markNotificationsRead();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🔔
              {state.notifications && state.notifications.filter(n => !n.read).length > 0 && (
                <span style={{ background: 'var(--red)', color: '#fff', borderRadius: '50%', padding: '1px 5px', fontSize: '9px', fontWeight: 'bold' }}>
                  {state.notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div style={{
                position: 'absolute',
                top: '38px',
                right: 0,
                width: '280px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                zIndex: 500,
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text)' }}>🔔 Notifications</span>
                  <button
                    onClick={clearNotifications}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '10px', cursor: 'pointer', fontFamily: 'monospace' }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(!state.notifications || state.notifications.length === 0) ? (
                    <div style={{ color: 'var(--muted)', fontSize: '11px', textAlign: 'center', padding: '12px 0' }}>
                      No notifications yet.
                    </div>
                  ) : (
                    state.notifications.map((n, idx) => (
                      <div key={idx} style={{ fontSize: '11.5px', padding: '6px 8px', background: 'var(--s2)', borderRadius: '8px', borderLeft: n.read ? 'none' : '3px solid var(--green)' }}>
                        <div style={{ color: 'var(--text)', lineHeight: '1.4' }}>{n.text}</div>
                        <div style={{ fontSize: '8px', color: 'var(--muted)', marginTop: '3px', textAlign: 'right' }}>{n.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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

      {/* Side Hamburger Drawer Backdrop */}
      {isDrawerOpen && (
        <div
          id="ham-overlay"
          className="open"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* Side Hamburger Drawer */}
      <div
        id="ham-drawer"
        className={isDrawerOpen ? 'open' : ''}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="ham-section">
          <div 
            className="ham-label" 
            onClick={() => toggleHamSection('study')} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--s2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <span>📚 Study</span>
            <span style={{ 
              fontSize: '8px', 
              transition: 'transform 0.2s', 
              transform: openHamSections.study ? 'rotate(90deg)' : 'rotate(0deg)',
              color: 'var(--sub)' 
            }}>▶</span>
          </div>
          {openHamSections.study && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button className={`ham-item ${currentView === 'roadmap-v2' ? 'active' : ''}`} onClick={() => handleNavItemClick('roadmap-v2')}
                style={{ color: currentView === 'roadmap-v2' ? 'var(--green)' : undefined }}>
                <span className="ham-ico">💥</span>v2 Roadmap
              </button>
              <button className={`ham-item ${currentView === 'roadmap-v3' ? 'active' : ''}`} onClick={() => handleNavItemClick('roadmap-v3')}
                style={{ color: currentView === 'roadmap-v3' ? 'var(--purple)' : undefined }}>
                <span className="ham-ico">🚀</span>v3 Roadmap
              </button>
              <button className={`ham-item ${currentView === 'qbank' ? 'active' : ''}`} onClick={() => handleNavItemClick('qbank')}>
                <span className="ham-ico">❓</span>Q-Bank
              </button>
              <button className={`ham-item ${currentView === 'notes' ? 'active' : ''}`} onClick={() => handleNavItemClick('notes')}>
                <span className="ham-ico">📝</span>Notes
                <span className="ham-badge hot">new</span>
              </button>
              <button className={`ham-item ${currentView === 'sandbox' && sandboxSection === 'labs' ? 'active' : ''}`} onClick={() => {
                setSandboxSection('labs');
                handleNavItemClick('sandbox');
              }}>
                <span className="ham-ico">⌨</span>Labs
                <span className="ham-badge hot">new</span>
              </button>
              <button className="ham-item" onClick={() => {
                const currentWd = new Date().getDay() + 1;
                setChallengeWeekday(currentWd);
                setIsChallengeOpen(true);
                setIsDrawerOpen(false);
              }}>
                <span className="ham-ico">🏆</span>Daily Challenge
              </button>
            </div>
          )}
        </div>

        <div className="ham-section">
          <div 
            className="ham-label" 
            onClick={() => toggleHamSection('tracking')} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--s2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <span>📋 Tracking</span>
            <span style={{ 
              fontSize: '8px', 
              transition: 'transform 0.2s', 
              transform: openHamSections.tracking ? 'rotate(90deg)' : 'rotate(0deg)',
              color: 'var(--sub)' 
            }}>▶</span>
          </div>
          {openHamSections.tracking && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button className={`ham-item ${currentView === 'buildlog' ? 'active' : ''}`} onClick={() => handleNavItemClick('buildlog')}>
                <span className="ham-ico">🔨</span>Build Log & Reviews
              </button>
              <button className={`ham-item ${currentView === 'weekly' ? 'active' : ''}`} onClick={() => handleNavItemClick('weekly')}>
                <span className="ham-ico">🎯</span>Goals
              </button>
              <button className={`ham-item ${currentView === 'stats' ? 'active' : ''}`} onClick={() => handleNavItemClick('stats')}>
                <span className="ham-ico">◈</span>Stats
              </button>
            </div>
          )}
        </div>

        <div className="ham-section">
          <div 
            className="ham-label" 
            onClick={() => toggleHamSection('career')} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--s2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <span>🏆 Career</span>
            <span style={{ 
              fontSize: '8px', 
              transition: 'transform 0.2s', 
              transform: openHamSections.career ? 'rotate(90deg)' : 'rotate(0deg)',
              color: 'var(--sub)' 
            }}>▶</span>
          </div>
          {openHamSections.career && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button className={`ham-item ${currentView === 'jobs' ? 'active' : ''}`} onClick={() => handleNavItemClick('jobs')}>
                <span className="ham-ico">💼</span>Jobs
              </button>
              <button className={`ham-item ${currentView === 'linkedin' ? 'active' : ''}`} onClick={() => handleNavItemClick('linkedin')}>
                <span className="ham-ico">📢</span>LinkedIn
              </button>
              <button className={`ham-item ${currentView === 'readiness' ? 'active' : ''}`} onClick={() => handleNavItemClick('readiness')}>
                <span className="ham-ico">✅</span>Readiness
              </button>
            </div>
          )}
        </div>

        <div className="ham-section">
          <div 
            className="ham-label" 
            onClick={() => toggleHamSection('ai')} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--s2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <span>🔥 AI Tools</span>
            <span style={{ 
              fontSize: '8px', 
              transition: 'transform 0.2s', 
              transform: openHamSections.ai ? 'rotate(90deg)' : 'rotate(0deg)',
              color: 'var(--sub)' 
            }}>▶</span>
          </div>
          {openHamSections.ai && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button className={`ham-item ${currentView === 'projects' ? 'active' : ''}`} onClick={() => handleNavItemClick('projects')}>
                <span className="ham-ico">🚀</span>Projects
                <span className="ham-badge hot">hot</span>
              </button>
              <button className={`ham-item ${currentView === 'github-rewriter' ? 'active' : ''}`} onClick={() => handleNavItemClick('github-rewriter')}>
                <span className="ham-ico">🐙</span>GitHub
                <span className="ham-badge hot">hot</span>
              </button>
              <button className={`ham-item ${currentView === 'resume' ? 'active' : ''}`} onClick={() => handleNavItemClick('resume')}>
                <span className="ham-ico">📄</span>Resume
                <span className="ham-badge hot">hot</span>
              </button>
              <button className={`ham-item ${currentView === 'mock' ? 'active' : ''}`} onClick={() => handleNavItemClick('mock')}>
                <span className="ham-ico">🎤</span>Mock Interview
                <span className="ham-badge hot">hot</span>
              </button>
              <button className={`ham-item ${currentView === 'skillgap' ? 'active' : ''}`} onClick={() => handleNavItemClick('skillgap')}>
                <span className="ham-ico">🎯</span>Skill Gap
                <span className="ham-badge hot">hot</span>
              </button>
              <button className={`ham-item ${currentView === 'diagram' ? 'active' : ''}`} onClick={() => handleNavItemClick('diagram')}>
                <span className="ham-ico">🎨</span>MindMap
                <span className="ham-badge hot">new</span>
              </button>
              <button className={`ham-item ${currentView === 'devops-flows' ? 'active' : ''}`} onClick={() => handleNavItemClick('devops-flows')}>
                <span className="ham-ico">🗺️</span>DevOps Flowcharts
                <span className="ham-badge hot">new</span>
              </button>
            </div>
          )}
        </div>

        <div className="ham-section" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div 
            className="ham-label" 
            onClick={() => toggleHamSection('settings')} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              userSelect: 'none',
              padding: '6px 8px',
              borderRadius: 'var(--r8)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--s2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <span>⚙️ Settings & Profile</span>
            <span style={{ 
              fontSize: '8px', 
              transition: 'transform 0.2s', 
              transform: openHamSections.settings ? 'rotate(90deg)' : 'rotate(0deg)',
              color: 'var(--sub)' 
            }}>▶</span>
          </div>
          {openHamSections.settings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <button className="ham-item" onClick={() => { setIsDrawerOpen(false); handleOpenSettings(); }}>
                <span className="ham-ico">⚙️</span>Settings & Profile
              </button>
              <div className="ham-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', cursor: 'default' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span className="ham-ico">🔔</span>Study Reminders
                </span>
                <button
                  onClick={toggleStudyReminders}
                  style={{
                    background: notificationsEnabled ? 'var(--blue)' : 'var(--border)',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    transition: 'background 0.2s'
                  }}
                >
                  {notificationsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <button className="ham-item" onClick={() => { setIsDrawerOpen(false); toggleTheme(); }} style={{ marginTop: '8px' }}>
                <span className="ham-ico">◑</span>Theme: {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
              <button className="ham-item" onClick={() => { setIsDrawerOpen(false); handleShareProgress(); }} style={{ marginTop: '8px' }}>
                <span className="ham-ico">📤</span>Share Progress
              </button>
              <button className="ham-item" onClick={() => { setIsDrawerOpen(false); handleLogout(); }} style={{ color: 'var(--red)', marginTop: '8px' }}>
                <span className="ham-ico">🚪</span>Logout ({currentUser})
              </button>
            </div>
          )}
        </div>
      </div>

      <main style={{ paddingBottom: '80px' }}>
        <Suspense fallback={<div className="wrap" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="ai-spinner"></div></div>}>
          {renderView()}
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div id="bottom-bar">
        <button
          className={`btab ${currentView === 'roadmap' ? 'active' : ''}`}
          onClick={() => handleNavItemClick('roadmap')}
        >
          <span className="bico">☑</span>Map
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

      {isSettingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 600,
            background: 'rgba(0,0,0,.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '32px 16px',
            overflowY: 'auto'
          }}
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '22px',
              width: 'min(440px, 96vw)',
              position: 'relative',
              margin: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSettingsOpen(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: '16px' }}
            >
              ✕
            </button>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
              ⚙️ Settings & Profile
            </div>

            {/* Active Provider Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label className="v4-label">Active AI Provider</label>
              <select
                value={activeProvider}
                onChange={e => setActiveProviderState(e.target.value as AIProvider)}
                className="v4-select"
                style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none', fontSize: '13px' }}
              >
                <option value="claude">Claude (Anthropic)</option>
                <option value="chatgpt">ChatGPT (OpenAI)</option>
                <option value="gemini">Gemini (Google)</option>
                <option value="grok">Grok (xAI)</option>
              </select>
            </div>

            {/* Provider API Key Input */}
            <div style={{ marginBottom: '16px' }}>
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
                  activeProvider === 'claude' ? 'sk-ant-...' :
                    activeProvider === 'chatgpt' ? 'sk-...' :
                      activeProvider === 'gemini' ? 'AIzaSy...' :
                        'xai-...'
                }
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '13px', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '6px', lineHeight: '1.4' }}>
                {activeProvider === 'claude' && (
                  <span>
                    Used directly in the browser to connect to Claude. Cleared when you log out.{' '}
                    <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                      Get Anthropic API Key
                    </a>
                  </span>
                )}
                {activeProvider === 'chatgpt' && (
                  <span>
                    Used directly in the browser to connect to ChatGPT (OpenAI). Cleared when you log out.{' '}
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                      Get OpenAI API Key
                    </a>
                  </span>
                )}
                {activeProvider === 'gemini' && (
                  <span>
                    Used directly in the browser to connect to Gemini (Google). Cleared when you log out.{' '}
                    <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                      Get Google Gemini API Key
                    </a>
                  </span>
                )}
                {activeProvider === 'grok' && (
                  <span>
                    Used directly in the browser to connect to Grok (xAI). Cleared when you log out.{' '}
                    <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                      Get Grok API Key
                    </a>
                  </span>
                )}
                <div style={{ marginTop: '4px' }}>Safe, client-side only.</div>
              </div>
            </div>

            {/* App UI Scaling (Font Size) */}
            <div style={{ marginBottom: '16px' }}>
              <label className="v4-label">App Text Size (Zoom)</label>
              <select
                value={uiScale}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setUiScale(val);
                  localStorage.setItem('devops90_ui_scale', val.toString());
                }}
                className="v4-select"
                style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 11px', borderRadius: 'var(--r8)', outline: 'none', fontSize: '13px' }}
              >
                <option value={1.0}>Normal (100%)</option>
                <option value={1.1}>Large (110%)</option>
                <option value={1.25}>Extra Large (125%)</option>
                <option value={1.5}>Huge (150%)</option>
              </select>
            </div>

            {/* Android Notifications Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <label className="v4-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Study Reminders</span>
                <button
                  onClick={toggleStudyReminders}
                  style={{
                    background: notificationsEnabled ? 'var(--blue)' : 'var(--border)',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {notificationsEnabled ? 'ON' : 'OFF'}
                </button>
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Reminder Time</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => handleReminderTimeChange(e.target.value)}
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

              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                Receive background notifications on your Android device daily at {reminderTime}.
              </div>
            </div>


            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="v4-btn-secondary" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </button>
              <button className="v4-btn-primary" onClick={handleSaveSettings} style={{ padding: '8px 16px', background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.4)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}>
                Save Key
              </button>
            </div>

            {/* GitHub Sync Settings */}
            <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
                🐙 GitHub Notes Sync
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--sub)', marginBottom: '12px', lineHeight: '1.5' }}>
                Configure these to sync Bootcamp Notes directly to your GitHub repository.
                You need a <a href="https://github.com/settings/tokens/new?scopes=repo&description=DevOps90-Notes-Sync" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>GitHub Personal Access Token</a> with <code style={{ background: 'var(--s2)', padding: '1px 4px', borderRadius: '3px', fontSize: '10px' }}>repo</code> scope.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label className="v4-label" style={{ fontSize: '10px' }}>GitHub Username</label>
                  <input
                    type="text"
                    value={githubSettings.username}
                    onChange={e => setGithubSettings({ ...githubSettings, username: e.target.value })}
                    placeholder="your-username"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', padding: '6px 9px', borderRadius: 'var(--r8)', outline: 'none', fontFamily: 'var(--mono)' }}
                  />
                </div>
                <div>
                  <label className="v4-label" style={{ fontSize: '10px' }}>Repository Name</label>
                  <input
                    type="text"
                    value={githubSettings.repo}
                    onChange={e => setGithubSettings({ ...githubSettings, repo: e.target.value })}
                    placeholder="devops-notes"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', padding: '6px 9px', borderRadius: 'var(--r8)', outline: 'none', fontFamily: 'var(--mono)' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label className="v4-label" style={{ fontSize: '10px' }}>GitHub Personal Access Token (PAT)</label>
                <input
                  type="password"
                  value={githubSettings.pat}
                  onChange={e => setGithubSettings({ ...githubSettings, pat: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', padding: '6px 9px', borderRadius: 'var(--r8)', outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label className="v4-label" style={{ fontSize: '10px' }}>Branch (default: main)</label>
                <input
                  type="text"
                  value={githubSettings.branch}
                  onChange={e => setGithubSettings({ ...githubSettings, branch: e.target.value })}
                  placeholder="main"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', padding: '6px 9px', borderRadius: 'var(--r8)', outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="v4-btn-primary" onClick={handleSaveSettings} style={{ padding: '7px 14px', background: 'rgba(79,168,255,.1)', border: '1px solid rgba(79,168,255,.3)', color: '#4fa8ff', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}>
                  Save All Settings
                </button>
              </div>
            </div>

            {/* Theme Settings */}
            <div style={{ marginBottom: '18px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <label className="v4-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0 }}>
                <span>Sync with System Theme</span>
                <input 
                  type="checkbox"
                  checked={syncWithSystemTheme}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSyncWithSystemTheme(checked);
                    localStorage.setItem('devops90_theme_sync', checked ? 'true' : 'false');
                    if (!checked) {
                      // Fallback to active state theme
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

            {/* Device Backup & Restore */}
            <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
                💾 Progress Backup & Restore
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--sub)', marginBottom: '12px', lineHeight: '1.5' }}>
                Save your study progress, notes, and keys. On mobile, this writes files natively to your device sandbox. You can also export/import custom JSON backup files.
              </div>
              
              <input 
                type="file" 
                id="import-backup-file" 
                style={{ display: 'none' }} 
                accept=".json" 
                onChange={handleImportBackupFile} 
              />
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {Capacitor.isNativePlatform() && (
                  <button 
                    className="v4-btn-secondary" 
                    onClick={async () => {
                      await BackupService.autoBackup();
                      alert('💾 Progress successfully backed up to native storage!');
                    }}
                    style={{ padding: '6px 12px', fontSize: '10px' }}
                  >
                    Auto-Backup Now
                  </button>
                )}
                <button 
                  className="v4-btn-secondary" 
                  onClick={handleExportBackup}
                  style={{ padding: '6px 12px', fontSize: '10px', background: 'rgba(0,217,160,.05)', borderColor: 'rgba(0,217,160,.2)', color: 'var(--green)' }}
                >
                  📤 Export File
                </button>
                <button 
                  className="v4-btn-secondary" 
                  onClick={() => document.getElementById('import-backup-file')?.click()}
                  style={{ padding: '6px 12px', fontSize: '10px', background: 'rgba(79,168,255,.05)', borderColor: 'rgba(79,168,255,.2)', color: '#4fa8ff' }}
                >
                  📥 Import File
                </button>
                {Capacitor.isNativePlatform() && (
                  <button 
                    className="v4-btn-primary" 
                    onClick={async () => {
                      if (confirm('Are you sure you want to restore? This will overwrite your current session with the device backup data.')) {
                        const restored = await BackupService.forceRestore();
                        if (restored) {
                          alert('✅ Backup restored successfully! Reloading...');
                          window.location.reload();
                        } else {
                          alert('❌ No backup found on this device to restore.');
                        }
                      }
                    }}
                    style={{ padding: '7px 14px', background: 'rgba(255,168,0,.1)', border: '1px solid rgba(255,168,0,.3)', color: '#ffb03a', fontFamily: 'var(--mono)', fontSize: '10px', borderRadius: 'var(--r8)', cursor: 'pointer' }}
                  >
                    Restore Native
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DevOps Daily Challenge Slide-up Modal */}
      {isChallengeOpen && (
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
          onClick={() => setIsChallengeOpen(false)}
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
                onClick={() => setIsChallengeOpen(false)}
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

            {(() => {
              const ch = CHALLENGES.find(c => c.weekday === challengeWeekday) || CHALLENGES[0];
              const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              const dayName = daysOfWeek[ch.weekday - 1];
              
              const answerKey = `devops90_challenge_answered_${ch.weekday}`;
              const selectKey = `devops90_challenge_selected_${ch.weekday}`;
              
              const [status, setStatus] = useState<string | null>(() => localStorage.getItem(answerKey));
              const [selectedIdx, setSelectedIdx] = useState<number | null>(() => {
                const stored = localStorage.getItem(selectKey);
                return stored !== null ? parseInt(stored, 10) : null;
              });

              const handleOptionClick = (idx: number) => {
                if (status) return;
                
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
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

interface ChallengeQuestion {
  weekday: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

const CHALLENGES: ChallengeQuestion[] = [
  {
    weekday: 1,
    question: "Which file format is most commonly used for writing Kubernetes manifests and Ansible playbooks?",
    options: ["JSON", "XML", "YAML", "TOML"],
    answerIndex: 2,
    explanation: "YAML (Yet Another Markup Language) is the industry standard for Kubernetes manifests, Ansible playbooks, and many CI/CD pipelines due to its readability."
  },
  {
    weekday: 2,
    question: "In Git, which command allows you to save your uncommitted changes temporarily and revert back to a clean working directory?",
    options: ["git reset --hard", "git stash", "git checkout", "git clean"],
    answerIndex: 1,
    explanation: "git stash shelves your local modifications so you can work on something else, and you can re-apply them later with git stash pop."
  },
  {
    weekday: 3,
    question: "Which Docker instruction specifies the default command to execute when a container starts, but can be overridden by command-line arguments?",
    options: ["ENTRYPOINT", "RUN", "CMD", "EXPOSE"],
    answerIndex: 2,
    explanation: "CMD defines the default execution command for a container. If the user specifies arguments on docker run, CMD is completely overridden, whereas ENTRYPOINT is not."
  },
  {
    weekday: 4,
    question: "What is the primary purpose of a CI/CD pipeline stage called 'Linting'?",
    options: ["Running load tests", "Analyzing code for programmatic and stylistic errors", "Deploying code to staging", "Compiling code into binaries"],
    answerIndex: 1,
    explanation: "Linting is static code analysis that flags syntax, stylistic, and potential runtime errors before the code is compiled or run."
  },
  {
    weekday: 5,
    question: "Which Kubernetes resource is typically used to expose a set of Pods as a network service, providing a stable IP address and DNS name?",
    options: ["Service", "Ingress", "ConfigMap", "Deployment"],
    answerIndex: 0,
    explanation: "A Kubernetes Service defines a logical set of Pods and a policy by which to access them, ensuring clients have a stable endpoint even as Pods are rescheduled."
  },
  {
    weekday: 6,
    question: "Which of the following describes an SSH key pair used for secure authentication?",
    options: ["Both private and public keys are shared with the server", "The private key stays on your local machine; the public key is placed on the server", "The public key stays on your local machine; the private key is placed on the server", "Only a single shared key is used for both encryption and decryption"],
    answerIndex: 1,
    explanation: "SSH uses asymmetric cryptography: your private key remains strictly on your local machine, and your public key is added to authorized_keys on the remote server."
  },
  {
    weekday: 7,
    question: "In continuous integration, what does the term 'Idempotency' mean regarding deployment or automation scripts?",
    options: ["The script runs faster each time it is executed", "The script can run multiple times without changing the result beyond the initial application", "The script must only be run once; subsequent runs will fail", "The script runs concurrently on multiple nodes without locking"],
    answerIndex: 1,
    explanation: "Idempotency means that applying an operation multiple times has the same outcome as applying it once, which is a core principle in DevOps and Infrastructure as Code (IaC)."
  }
];

export default App;
