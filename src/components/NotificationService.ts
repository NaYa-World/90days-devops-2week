import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {
  /**
   * Requests push notification permissions and registers the push token.
   */
  async init() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      let perm = await PushNotifications.checkPermissions();
      
      if (perm.receive !== 'granted') {
        perm = await PushNotifications.requestPermissions();
      }

      if (perm.receive === 'granted') {
        // Register the app with FCM/APNs to retrieve the device push token
        await PushNotifications.register();
      }

      // 1. Success Token Registration Listener
      PushNotifications.addListener('registration', (token) => {
        console.log('devops90 [Push Token]:', token.value);
        // Bridge token to push server (e.g. Firebase Cloud Messaging backend)
      });

      // 2. Failure Registration Listener
      PushNotifications.addListener('registrationError', (error) => {
        console.error('devops90 [Push Error]: Registration failed:', error);
      });

      // 3. Foreground Notification Received Listener
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('devops90 [Push Received]:', notification);
        // Show an in-app banner or custom notification card
      });

      // 4. Notification Action (Click/Tap) Listener
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('devops90 [Push Action]: Tap registered:', action.notification);
        // Navigate users to specific views (e.g., QBank or Labs) based on notification payload
      });

    } catch (e) {
      console.error('devops90 [Push Init Error]:', e);
    }
  }
};
