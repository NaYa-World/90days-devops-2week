export const GitHubSyncService = {
  GIST_FILENAME: 'devops90_backup.json',
  
  async getToken(): Promise<string | null> {
    return localStorage.getItem('devops90_github_token');
  },

  async autoSyncToGitHub(): Promise<void> {
    const token = await this.getToken();
    if (!token) return;

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
      
      // 1. Find existing Gist
      const existingGistId = await this.findBackupGist(token);
      
      if (existingGistId) {
        // Update gist
        await fetch(`https://api.github.com/gists/${existingGistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            files: {
              [this.GIST_FILENAME]: { content }
            }
          })
        });
        console.log('devops90: Backup Gist updated.');
      } else {
        // Create new gist
        await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: 'DevOps 90 Days App Backup',
            public: false,
            files: {
              [this.GIST_FILENAME]: { content }
            }
          })
        });
        console.log('devops90: New Backup Gist created.');
      }
    } catch (err) {
      console.error('devops90: Gist sync failed', err);
    }
  },

  async findBackupGist(token: string): Promise<string | null> {
    try {
      const res = await fetch('https://api.github.com/gists', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!res.ok) return null;
      const gists = await res.json();
      const backupGist = gists.find((g: any) => Object.keys(g.files).includes(this.GIST_FILENAME));
      return backupGist ? backupGist.id : null;
    } catch (e) {
      return null;
    }
  },

  async restoreFromGitHub(token: string): Promise<boolean> {
    try {
      const gistId = await this.findBackupGist(token);
      if (!gistId) return false;

      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!res.ok) return false;
      
      const gist = await res.json();
      const file = gist.files[this.GIST_FILENAME];
      if (!file || !file.content) return false;

      const data = JSON.parse(file.content);
      
      // Clean existing state
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('devops90') && key !== 'devops90_github_token') {
          localStorage.removeItem(key);
        }
      }

      // Restore new state
      Object.keys(data).forEach(key => {
        localStorage.setItem(key, data[key]);
      });

      console.log('devops90: Successfully restored state from Gist.');
      return true;
    } catch (e) {
      console.error('devops90: Restore failed', e);
      return false;
    }
  }
};

export const autoSyncToGitHub = () => GitHubSyncService.autoSyncToGitHub();
