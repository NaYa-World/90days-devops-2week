import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {

  async init() {
    if (!Capacitor.isNativePlatform()) return;

    // Step 1: Create channel FIRST
    await LocalNotifications.createChannel({
      id: 'devops90-reminders',
      name: 'Daily Reminders',
      description: 'Twice-daily DevOps progress nudges',
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#3B82F6',
    });

    // Step 2: Attach listener BEFORE requesting permission
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      console.log('devops90 [Tapped]:', action.notification);
    });

    // Step 3: Request permission
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== 'granted') {
        console.warn('devops90: Permission denied');
        return;
      }
    }

    // Step 4: Cancel old, schedule fresh
    await this.cancelAll();
    await this.scheduleDailyReminders();
  },

  async scheduleDailyReminders() {
    const now = new Date();

    const morning = new Date(now);
    morning.setHours(3, 0, 0, 0);
    if (morning <= now) morning.setDate(morning.getDate() + 1);

    const evening = new Date(now);
    evening.setHours(20, 0, 0, 0);
    if (evening <= now) evening.setDate(evening.getDate() + 1);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: '🔧 DevOps Morning Check-in',
          body: "Your 90-day streak doesn't build itself. What's today's task?",
          schedule: { at: morning, every: 'day', allowWhileIdle: true },
          channelId: 'devops90-reminders',
        },
        {
          id: 1002,
          title: '📊 Evening Progress Check',
          body: 'Did you log today? Day skipped = streak broken.',
          schedule: { at: evening, every: 'day', allowWhileIdle: true },
          channelId: 'devops90-reminders',
        },
      ],
    });

    console.log('devops90: Reminders scheduled ✅');
  },

  async cancelAll() {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  },

  // Temporary test — fire in 1 minute, then delete this method
  async testFireNow() {
    await LocalNotifications.schedule({
      notifications: [{
        id: 9999,
        title: '✅ Notification Test',
        body: 'Close the app — if you see this, it works.',
        schedule: { at: new Date(Date.now() + 60_000), allowWhileIdle: true },
        channelId: 'devops90-reminders',
      }],
    });
  }
};