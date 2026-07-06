import { Capacitor } from '@capacitor/core';

export interface DeviceFlowResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export const GitHubOAuthService = {
  // BUG-005 FIX: Read Client ID from environment variable instead of hardcoding
  get CLIENT_ID(): string {
    const envId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!envId) {
      console.error('VITE_GITHUB_CLIENT_ID environment variable is not set. GitHub auth will fail.');
    }
    return envId || '';
  },

  async initiateDeviceFlow(): Promise<DeviceFlowResponse> {
    if (!this.CLIENT_ID) {
      throw new Error('GitHub OAuth Client ID is not configured. Set VITE_GITHUB_CLIENT_ID in your .env file.');
    }

    const baseUrl = !Capacitor.isNativePlatform() ? '/github-oauth' : 'https://github.com';

    const res = await fetch(`${baseUrl}/login/device/code`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.CLIENT_ID,
        scope: 'gist user repo'
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to initiate device flow: ${res.status} ${errorText}`);
    }

    return res.json();
  },

  async pollForAccessToken(deviceCode: string, interval: number, expiresIn: number = 900): Promise<string> {
    // BUG-018 FIX: Add timeout based on expires_in from GitHub's device flow response
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const maxDuration = expiresIn * 1000; // convert to ms

      const poll = async () => {
        // Check if polling has exceeded the expiry window
        if (Date.now() - startTime > maxDuration) {
          reject(new Error('Authorization timed out. The device code has expired. Please try again.'));
          return;
        }

        try {
          const baseUrl = !Capacitor.isNativePlatform() ? '/github-oauth' : 'https://github.com';

          const res = await fetch(`${baseUrl}/login/oauth/access_token`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              client_id: this.CLIENT_ID,
              device_code: deviceCode,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
            })
          });

          const data = await res.json();

          if (data.access_token) {
            resolve(data.access_token);
            return;
          }

          if (data.error === 'authorization_pending') {
            // Keep polling
            setTimeout(poll, interval * 1000);
          } else if (data.error === 'slow_down') {
            setTimeout(poll, (interval + 5) * 1000);
          } else if (data.error === 'expired_token') {
            reject(new Error('The device code has expired. Please restart the login process.'));
          } else {
            reject(new Error(data.error_description || data.error));
          }
        } catch (e) {
          reject(e);
        }
      };

      // Start polling
      setTimeout(poll, interval * 1000);
    });
  },

  async getUserProfile(token: string) {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  }
};
