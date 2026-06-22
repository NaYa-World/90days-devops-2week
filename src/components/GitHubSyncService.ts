export const GitHubSyncService = {
  REPO_NAME: '90days-devops-my-notes',
  BACKUP_FILENAME: 'progress_backup.json',
  
  async getToken(): Promise<string | null> {
    return localStorage.getItem('devops90_github_token');
  },

  async getUsername(token: string): Promise<string | null> {
    try {
      const cached = localStorage.getItem('devops90_github_username') || localStorage.getItem('devops90_current_user');
      if (cached) return cached;
      
      const res = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const user = await res.json();
        if (user.login) {
          localStorage.setItem('devops90_github_username', user.login);
          return user.login;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async ensureRepository(token: string, username: string): Promise<boolean> {
    try {
      const check = await fetch(`https://api.github.com/repos/${username}/${this.REPO_NAME}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (check.ok) return true;
      
      if (check.status === 404) {
        const create = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.REPO_NAME,
            description: 'My DevOps 90 Days Bootcamp progress backup',
            private: true,
            auto_init: true
          })
        });
        if (create.ok) {
          console.log(`devops90: Created new private repository: ${this.REPO_NAME}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('devops90: Error ensuring repository exists', e);
      return false;
    }
  },

  async autoSyncToGitHub(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return true;

    const username = await this.getUsername(token);
    if (!username) return false;

    const ok = await this.ensureRepository(token, username);
    if (!ok) return false;

    try {
      const progressData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('devops90') && key !== 'devops90_github_token') {
          const val = localStorage.getItem(key);
          if (val !== null) progressData[key] = val;
        }
      }

      const content = JSON.stringify(progressData, null, 2);
      const base64Content = btoa(unescape(encodeURIComponent(content)));
      const filePath = this.BACKUP_FILENAME;

      let sha: string | undefined;
      try {
        const checkRes = await fetch(
          `https://api.github.com/repos/${username}/${this.REPO_NAME}/contents/${filePath}?ref=main`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        if (checkRes.ok) {
          const existing = await checkRes.json();
          sha = existing.sha;
        }
      } catch { /* file doesn't exist yet */ }

      const body: Record<string, string> = {
        message: 'Update DevOps 90 Days progress backup',
        content: base64Content,
        branch: 'main'
      };
      if (sha) body.sha = sha;

      const res = await fetch(
        `https://api.github.com/repos/${username}/${this.REPO_NAME}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (res.ok) {
        console.log('devops90: Backup successfully saved to repository.');
        return true;
      } else {
        console.error('devops90: Failed to push progress backup', await res.text());
        return false;
      }
    } catch (err) {
      console.error('devops90: Repo sync failed', err);
      return false;
    }
  },

  async restoreFromGitHub(token: string): Promise<boolean> {
    try {
      const username = await this.getUsername(token);
      if (!username) return false;

      const ok = await this.ensureRepository(token, username);
      if (!ok) return false;

      const filePath = this.BACKUP_FILENAME;
      const res = await fetch(
        `https://api.github.com/repos/${username}/${this.REPO_NAME}/contents/${filePath}?ref=main`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!res.ok) {
        console.log('devops90: No backup file found in repository.');
        return false;
      }

      const file = await res.json();
      if (!file || !file.content) return false;

      const decodedContent = decodeURIComponent(escape(atob(file.content.replace(/\s/g, ''))));
      const data = JSON.parse(decodedContent);

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('devops90') && key !== 'devops90_github_token') {
          localStorage.removeItem(key);
        }
      }

      Object.keys(data).forEach(key => {
        localStorage.setItem(key, data[key]);
      });

      console.log('devops90: Successfully restored state from repository.');
      return true;
    } catch (e) {
      console.error('devops90: Restore failed', e);
      return false;
    }
  }
};

export const autoSyncToGitHub = () => GitHubSyncService.autoSyncToGitHub();
