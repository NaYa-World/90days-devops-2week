import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';

export const SecurityService = {
  /**
   * Checks if biometric authentication is available and enabled on the device.
   */
  async isBiometricAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const result = await NativeBiometric.isAvailable({ useFallback: true });
      return !!result.isAvailable;
    } catch (_) {
      return false;
    }
  },

  /**
   * Prompts the user for biometric authentication (Face ID or Fingerprint).
   * Returns true if successful.
   */
  async verifyBiometrics(reason: string = "Access your secure study notes"): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true; // Web bypasses lock or uses normal password
    try {
      const available = await this.isBiometricAvailable();
      if (!available) return false;

      await NativeBiometric.verifyIdentity({
        reason,
        title: "Biometric Unlock",
        subtitle: "Confirm your identity",
        description: "Please scan your fingerprint or use Face ID/passcode to verify access.",
        negativeButtonText: "Cancel",
        useFallback: true
      });
      return true;
    } catch (e) {
      console.error("Biometric verification failed:", e);
      return false;
    }
  },

  /**
   * Saves a key-value credential into the device's hardware-backed Keystore/Keychain.
   */
  async saveSecureCredential(key: string, value: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      localStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStorage.set({ key, value: value.trim() });
    } catch (e) {
      console.warn("SecureStorage set failed, falling back to localStorage:", e);
      localStorage.setItem(key, value.trim());
    }
  },

  /**
   * Reads a key-value credential from the hardware-backed Keystore/Keychain,
   * falling back to localStorage if necessary.
   */
  async getSecureCredential(key: string): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      return localStorage.getItem(key) || '';
    }
    try {
      const res = await SecureStorage.get({ key });
      return res.value || '';
    } catch (_) {
      // Fallback
      return localStorage.getItem(key) || '';
    }
  },

  /**
   * Removes a credential from both secure storage and localStorage.
   */
  async removeSecureCredential(key: string): Promise<void> {
    localStorage.removeItem(key);
    if (!Capacitor.isNativePlatform()) return;
    try {
      await SecureStorage.remove({ key });
    } catch (_) {}
  }
};
