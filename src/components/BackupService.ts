import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const BACKUP_PREF_KEY = 'devops90_native_backup';
const BACKUP_FILE_PATH = 'devops90_backup.json';

const getAllDevopsKeys = (): Record<string, string> => {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('devops90')) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        data[key] = val;
      }
    }
  }
  return data;
};

export const BackupService = {
  /**
   * Automatically serializes localStorage data prefixed with 'devops90'
   * and saves it to Capacitor Preferences and a local device JSON file.
   */
  async autoBackup(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;
    try {
      const data = getAllDevopsKeys();
      if (Object.keys(data).length === 0) return true;

      const dataStr = JSON.stringify(data);

      // 1. Save to Native Preferences
      await Preferences.set({
        key: BACKUP_PREF_KEY,
        value: dataStr
      });

      // 2. Save to Native Filesystem (Private Sandbox Data directory)
      await Filesystem.writeFile({
        path: BACKUP_FILE_PATH,
        data: dataStr,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        recursive: true
      });
      console.log('devops90: State successfully backed up to native storage.');
      return true;
    } catch (e) {
      console.error('devops90: State backup failed:', e);
      return false;
    }
  },

  /**
   * Checks if localStorage is empty and attempts to restore state from 
   * native Preferences or the Filesystem backup file.
   * Returns true if a restore occurred, prompting a state reload.
   */
  async autoRestore(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const accounts = localStorage.getItem('devops90_accounts');
      const currentUser = localStorage.getItem('devops90_current_user');
      
      // If we already have accounts or a logged in session, do not auto-overwrite
      if (accounts || currentUser) {
        return false;
      }

      let dataStr: string | null = null;

      // Try loading from preferences first
      try {
        const res = await Preferences.get({ key: BACKUP_PREF_KEY });
        dataStr = res.value;
      } catch (e) {
        console.warn('devops90: Preferences restore read failed:', e);
      }

      // Fallback to internal Filesystem if preferences is empty
      if (!dataStr) {
        try {
          const file = await Filesystem.readFile({
            path: BACKUP_FILE_PATH,
            directory: Directory.Data,
            encoding: Encoding.UTF8
          });
          dataStr = typeof file.data === 'string' ? file.data : JSON.stringify(file.data);
        } catch (e) {
          console.warn('devops90: Filesystem restore read failed:', e);
        }
      }

      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
          });
          console.log('devops90: Successfully restored state from native storage.');
          return true;
        }
      }
    } catch (e) {
      console.error('devops90: State restore failed:', e);
    }
    return false;
  },

  /**
   * Forcefully restores state regardless of whether localStorage is empty.
   */
  async forceRestore(): Promise<boolean> {
    try {
      let dataStr: string | null = null;
      try {
        const res = await Preferences.get({ key: BACKUP_PREF_KEY });
        dataStr = res.value;
      } catch (_) {}

      if (!dataStr) {
        try {
          const file = await Filesystem.readFile({
            path: BACKUP_FILE_PATH,
            directory: Directory.Data,
            encoding: Encoding.UTF8
          });
          dataStr = typeof file.data === 'string' ? file.data : JSON.stringify(file.data);
        } catch (_) {}
      }

      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data && typeof data === 'object') {
          // Clear current devops90 keys first to clean restore
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('devops90')) {
              localStorage.removeItem(key);
            }
          }
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
          });
          return true;
        }
      }
    } catch (e) {
      console.error('devops90: Force restore failed:', e);
    }
    return false;
  }
};
