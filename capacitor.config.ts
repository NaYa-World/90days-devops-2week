import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gk.devops',
  appName: '90 Days DevOps',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#07090f',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_notify',
      iconColor: '#3B82F6',
      sound: 'default',
      channels: [
        {
          id: 'devops90-reminders',
          name: 'Daily Reminders',
          description: 'Twice-daily DevOps progress nudges and daily challenges',
          importance: 5,
          visibility: 1,
          vibration: true,
          lights: true,
          lightColor: '#3B82F6',
          sound: 'default'
        }
      ]
    }
  }
};

export default config;