/**
 * Background GitHub auto-sync utility.
 * Automatically saves all devops90 state keys from localStorage
 * and pushes them as a progress.json file to the configured repository.
 */
export const autoSyncToGitHub = async (): Promise<void> => {
  const pat = localStorage.getItem('devops90_github_pat') || '';
  const ghUsername = localStorage.getItem('devops90_github_username') || '';
  const repo = localStorage.getItem('devops90_github_repo') || '';
  const branch = localStorage.getItem('devops90_github_branch') || 'main';

  // Return early if GitHub integration is not configured
  if (!pat || !ghUsername || !repo) {
    return;
  }

  try {
    // 1. Gather all progress data
    const progressData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('devops90')) {
        const val = localStorage.getItem(key);
        if (val !== null) {
          progressData[key] = val;
        }
      }
    }

    const progressStr = JSON.stringify(progressData, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(progressStr)));
    const filePath = 'progress.json';

    // 2. Check if the file exists to get its SHA (required for updating files in GitHub API)
    let sha: string | undefined;
    try {
      const checkRes = await fetch(
        `https://api.github.com/repos/${ghUsername}/${repo}/contents/${filePath}?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${pat}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        sha = existing.sha;
      }
    } catch (_) {
      // File doesn't exist yet, which is fine
    }

    // 3. PUT the file back
    const body: Record<string, string> = {
      message: `Sync DevOps study progress: ${new Date().toISOString()}`,
      content: base64Content,
      branch
    };
    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(
      `https://api.github.com/repos/${ghUsername}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (res.ok) {
      console.log('devops90: Background progress synced to GitHub successfully.');
    } else {
      const errText = await res.text();
      console.warn('devops90: Background progress sync failed:', errText);
    }
  } catch (err) {
    console.error('devops90: Error during GitHub background sync:', err);
  }
};
