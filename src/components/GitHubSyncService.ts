let isSyncing = false;
let pendingSync = false;
let retryTimeout: any = null;

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
    if (isSyncing) {
      pendingSync = true;
      return false;
    }
    isSyncing = true;

    const executeSync = async (): Promise<boolean> => {
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
          pendingSync = true; // trigger active retry queue
          return false;
        }
      } catch (err) {
        console.error('devops90: Repo sync failed', err);
        pendingSync = true; // trigger active retry queue
        return false;
      }
    };

    try {
      return await executeSync();
    } finally {
      isSyncing = false;
      if (pendingSync) {
        pendingSync = false;
        if (retryTimeout) clearTimeout(retryTimeout);
        // Background active retry queue to flush missed state mutations
        retryTimeout = setTimeout(() => {
          GitHubSyncService.autoSyncToGitHub().catch(() => {});
        }, 5000);
      }
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
      const remoteData = JSON.parse(decodedContent);

      const metaKey = `devops90_meta_timestamps_${username.toLowerCase()}`;
      
      const localMetaStr = localStorage.getItem(metaKey) || '{}';
      let localMeta: Record<string, number> = {};
      try { localMeta = JSON.parse(localMetaStr); } catch(e){}

      const remoteMetaStr = remoteData[metaKey] || '{}';
      let remoteMeta: Record<string, number> = {};
      try { remoteMeta = JSON.parse(remoteMetaStr); } catch(e){}

      let requiresPush = false;
      let stateChangedLocally = false;
      const finalLocalStorage: Record<string, string> = {};

      Object.keys(remoteData).forEach(storageKey => {
         if (storageKey === metaKey || storageKey === 'devops90_github_token') return;

         const remoteValStr = remoteData[storageKey];
         const localValStr = localStorage.getItem(storageKey);

         if (!localValStr) {
             finalLocalStorage[storageKey] = remoteValStr;
             stateChangedLocally = true;
             return;
         }

         let localObj: any;
         let remoteObj: any;
         let isPrimitive = false;

         try { localObj = JSON.parse(localValStr); } catch { localObj = localValStr; isPrimitive = true; }
         try { remoteObj = JSON.parse(remoteValStr); } catch { remoteObj = remoteValStr; isPrimitive = true; }
         
         if (isPrimitive || typeof localObj !== 'object' || localObj === null || typeof remoteObj !== 'object' || remoteObj === null) {
             if (localValStr !== remoteValStr) {
                 finalLocalStorage[storageKey] = remoteValStr;
                 stateChangedLocally = true;
             } else {
                 finalLocalStorage[storageKey] = localValStr;
             }
             return;
         }

         try {
             const mergedObj = { ...localObj };
             let mergedObjChanged = false;

             // Map standard keys to meta keys (handles useAppState.ts underscores)
             const getMetaKeyName = (prop: string) => {
                 const underscored = ['history', 'jobs', 'pomoSessions', 'lastDay', 'streak', 'streakFreezeUsedOn', 'freezeUsedWeek'];
                 if (underscored.includes(prop)) return `_${prop}`;
                 return prop;
             };

             Object.keys(remoteObj).forEach(prop => {
                 const metaProp = getMetaKeyName(prop);
                 const mKey = `${storageKey}::${metaProp}`;
                 const rTime = remoteMeta[mKey] || 0;
                 const lTime = localMeta[mKey] || 0;

                 if (rTime > lTime) {
                     mergedObj[prop] = remoteObj[prop];
                     localMeta[mKey] = rTime; 
                     mergedObjChanged = true;
                     stateChangedLocally = true;
                 } else if (lTime > rTime) {
                     requiresPush = true;
                 } else {
                     if (JSON.stringify(mergedObj[prop]) !== JSON.stringify(remoteObj[prop])) {
                         requiresPush = true; // Conflict with no clear winner, fallback to pushing local
                     }
                 }
             });

             Object.keys(localObj).forEach(prop => {
                 if (!(prop in remoteObj)) {
                     requiresPush = true;
                 }
             });

             if (mergedObjChanged) {
                 finalLocalStorage[storageKey] = JSON.stringify(mergedObj);
             } else {
                 finalLocalStorage[storageKey] = localValStr;
             }

         } catch (e) {
             finalLocalStorage[storageKey] = remoteValStr;
             stateChangedLocally = true;
         }
      });

      Object.keys(finalLocalStorage).forEach(storageKey => {
         localStorage.setItem(storageKey, finalLocalStorage[storageKey]);
      });
      localStorage.setItem(metaKey, JSON.stringify(localMeta));

      console.log('devops90: Successfully restored and merged state from repository.');

      if (requiresPush) {
          console.log('devops90: Local offline changes detected. Triggering auto-push.');
          GitHubSyncService.autoSyncToGitHub().catch(()=>{});
      }

      return stateChangedLocally || Object.keys(remoteData).length > 0;
    } catch (e) {
      console.error('devops90: Restore failed', e);
      return false;
    }
  }
};

export const autoSyncToGitHub = () => GitHubSyncService.autoSyncToGitHub();
