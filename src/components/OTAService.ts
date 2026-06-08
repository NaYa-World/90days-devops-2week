import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';

export const OTAService = {
  /**
   * Signals the native updater that the current bundle booted successfully.
   * If not called, the app rolls back to the working version on next start.
   */
  async init() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await CapacitorUpdater.notifyAppReady();
      console.log('devops90: Live updater notified (app is ready).');
    } catch (e) {
      console.error('devops90: Live updater initialization failed:', e);
    }
  },

  /**
   * Checks for background updates.
   * In production, Capgo automatically handles background checks, but this 
   * allows manual hooks to check, download, and apply updates.
   */
  async checkForUpdates() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      console.log('devops90: Checking for live updates...');
      // Example of custom manual flow:
      // const updateInfo = await CapacitorUpdater.check();
      // if (updateInfo.url) {
      //   const downloadInfo = await CapacitorUpdater.download({
      //     url: updateInfo.url,
      //     version: updateInfo.version
      //   });
      //   await CapacitorUpdater.set({ id: downloadInfo.id });
      // }
    } catch (e) {
      console.error('devops90: Checking for live updates failed:', e);
    }
  }
};
