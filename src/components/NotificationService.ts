import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { CHALLENGES } from '../data/challenges';

export const NotificationService = {

  async init(enabled: boolean, morningTime: string, eveningTime: string) {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Step 1: Create channels
      await LocalNotifications.createChannel({
        id: 'devops90-reminders',
        name: 'Daily Reminders',
        description: 'Twice-daily DevOps progress nudges and daily challenges',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#3B82F6',
        sound: 'default'
      });
    } catch (err) {
      console.error('devops90: Failed to create notification channel:', err);
    }

    // Step 2: Check permissions and sync timings
    await this.sync(enabled, morningTime, eveningTime);
  },

  async sync(enabled: boolean, morningTime: string, eveningTime: string) {
    if (!Capacitor.isNativePlatform()) return;

    // Clear any previously scheduled notifications to avoid duplicates or overlaps
    await this.cancelAll();

    if (!enabled) {
      console.log('devops90: Notifications are disabled by the user.');
      return;
    }

    try {
      // Ensure we have display permission
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') {
          console.warn('devops90: Permission denied by user');
          return;
        }
      }

      // Parse morning time (e.g., "09:00")
      const [mHourStr, mMinStr] = morningTime.split(':');
      const mHour = parseInt(mHourStr || '9', 10);
      const mMin = parseInt(mMinStr || '0', 10);

      // Parse evening time (e.g., "20:00")
      const [eHourStr, eMinStr] = eveningTime.split(':');
      const eHour = parseInt(eHourStr || '20', 10);
      const eMin = parseInt(eMinStr || '0', 10);

      const notifications: any[] = [
        // 1. Daily Morning Check-in
        {
          id: 1001,
          title: '🔧 DevOps Morning Check-in',
          body: "Your 90-day streak doesn't build itself. What's today's task?",
          smallIcon: 'ic_stat_notify',
          sound: 'default',
          schedule: {
            on: { hour: mHour, minute: mMin }
          },
          channelId: 'devops90-reminders',
        },
        // 2. Daily Evening Progress Check
        {
          id: 1002,
          title: '📊 Evening Progress Check',
          body: 'Did you log today? Day skipped = streak broken.',
          smallIcon: 'ic_stat_notify',
          sound: 'default',
          schedule: {
            on: { hour: eHour, minute: eMin }
          },
          channelId: 'devops90-reminders',
        }
      ];

      // 3. Weekly Challenge Notifications
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      CHALLENGES.forEach(ch => {
        const dayName = daysOfWeek[ch.weekday - 1] || 'Today';
        
        // Morning Challenge notification
        notifications.push({
          id: 9000 + ch.weekday,
          title: `🏆 DevOps Daily Challenge (${dayName})`,
          body: `Today's challenge: ${ch.question.substring(0, 90)}...`,
          smallIcon: 'ic_stat_notify',
          sound: 'default',
          schedule: {
            on: {
              weekday: ch.weekday,
              hour: mHour,
              minute: mMin
            }
          },
          channelId: 'devops90-reminders',
        });

        // Evening Challenge reminder
        notifications.push({
          id: 9100 + ch.weekday,
          title: `🏆 DevOps Daily Challenge (${dayName}) (Evening Reminder)`,
          body: `Don't miss today's challenge: ${ch.question.substring(0, 90)}...`,
          smallIcon: 'ic_stat_notify',
          sound: 'default',
          schedule: {
            on: {
              weekday: ch.weekday,
              hour: eHour,
              minute: eMin
            }
          },
          channelId: 'devops90-reminders',
        });
      });

      await LocalNotifications.schedule({ notifications });
      console.log(`devops90: Scheduled daily reminders and challenges at ${morningTime} & ${eveningTime} ✅`);
    } catch (err) {
      console.error('devops90: Error scheduling notifications:', err);
    }
  },

  async cancelAll() {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
      console.log('devops90: Cleared all pending native notifications.');
    } catch (err) {
      console.error('devops90: Failed to cancel notifications:', err);
    }
  },

  // Developer testing utility to verify notification trigger in 10 seconds
  async testFireNow() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: 9999,
          title: '✅ Notification Test',
          body: 'Close the app — if you see this, native notifications are working correctly!',
          smallIcon: 'ic_stat_notify',
          sound: 'default',
          schedule: { at: new Date(Date.now() + 10_000) },
          channelId: 'devops90-reminders',
        }],
      });
      console.log('devops90: Test notification scheduled in 10s.');
    } catch (err) {
      console.error('devops90: Test fire failed:', err);
    }
  }
};