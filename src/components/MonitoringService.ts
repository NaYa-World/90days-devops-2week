import * as Sentry from '@sentry/capacitor';
import { Capacitor } from '@capacitor/core';

export const MonitoringService = {
  /**
   * Initializes the Sentry monitoring SDK on native platforms.
   */
  init() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      Sentry.init({
        dsn: 'https://6325514f7b234eb789c0fef3be95015e@o4500000000000000.ingest.sentry.io/4500000000000000', // Replace with your Sentry Project DSN
        tracesSampleRate: 1.0,
      });
      console.log('devops90: Sentry crash reporting initialized.');
    } catch (e) {
      console.error('devops90: Sentry initialization failed:', e);
    }
  },

  /**
   * Captures and uploads a runtime exception to Sentry, fallback to console logging.
   */
  logError(error: any, context?: string) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`devops90 [Error - ${context || 'General'}]: ${message}`, error);
    
    if (Capacitor.isNativePlatform()) {
      try {
        Sentry.captureException(error);
      } catch (_) {}
    }
  },

  /**
   * Logs a tracking/analytics event.
   * Can be easily bridged to Firebase Analytics or Mixpanel.
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    const eventData = {
      ...properties,
      timestamp: new Date().toISOString(),
      platform: Capacitor.getPlatform()
    };
    
    // Log to dev console for diagnostic tracing
    console.log(`devops90 [Telemetry - ${eventName}]:`, eventData);
    
    // Placeholder to wire up Firebase Analytics:
    // import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
    // if (Capacitor.isNativePlatform()) {
    //   FirebaseAnalytics.logEvent({ name: eventName, params: eventData }).catch(() => {});
    // }
  }
};
