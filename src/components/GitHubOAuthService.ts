export interface DeviceFlowResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export const GitHubOAuthService = {
  // IMPORTANT: You must replace this with your actual GitHub OAuth App Client ID!
  // To get one: GitHub Settings -> Developer Settings -> OAuth Apps -> New OAuth App
  // Set Authorization callback URL to anything (e.g. http://localhost)
  // Check the "Enable Device Flow" checkbox in the app settings!
  CLIENT_ID: 'YOUR_GITHUB_CLIENT_ID_HERE',

  async initiateDeviceFlow(): Promise<DeviceFlowResponse> {
    const res = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.CLIENT_ID,
        scope: 'gist user'
      })
    });
    
    if (!res.ok) {
      throw new Error('Failed to initiate device flow');
    }
    
    return res.json();
  },

  async pollForAccessToken(deviceCode: string, interval: number): Promise<string> {
    // Polls until the user authorizes the app, or expires
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const res = await fetch('https://github.com/login/oauth/access_token', {
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
