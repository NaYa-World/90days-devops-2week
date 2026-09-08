import React, { useState, useEffect } from 'react';
import { GitHubSyncService } from '../components/GitHubSyncService';

// ── Persistent Task State Helpers ──────────────────────────────────────────────
export interface TaskState {
  completed: boolean;
  notes: string;
  lastSync?: string;
}

const getTaskState = (taskId: string): TaskState => {
  try {
    const val = localStorage.getItem(`devops90_task_${taskId}`);
    if (val) return JSON.parse(val);
  } catch (e) {}
  return { completed: false, notes: '' };
};

const setTaskState = (taskId: string, state: TaskState) => {
  localStorage.setItem(`devops90_task_${taskId}`, JSON.stringify(state));
  window.dispatchEvent(new Event('devops90_task_updated'));
};
// ── Track metadata for Git / Linux / Jenkins ──────────────────────────────────
const TRACK: Record<string, { color: string; dim: string; icon: string }> = {
  Git:        { color: '#FB923C', dim: 'rgba(251,146,60,0.12)',  icon: '🔀' },
  Linux:      { color: '#60A5FA', dim: 'rgba(96,165,250,0.12)',  icon: '🐧' },
  Jenkins:    { color: '#F87171', dim: 'rgba(248,113,113,0.12)', icon: '⚙️' },
  Docker:     { color: '#38BDF8', dim: 'rgba(56,189,248,0.12)',  icon: '🐳' },
  AWS:        { color: '#F59E0B', dim: 'rgba(245,158,11,0.12)',  icon: '☁️' },
  Kubernetes: { color: '#A78BFA', dim: 'rgba(167,139,250,0.12)', icon: '☸️' },
};

const LV_XP: Record<number, number> = { 1: 100, 2: 200, 3: 300, 4: 400 };

// ── Track task type ───────────────────────────────────────────────────────────
interface TrackTask {
  n: number;
  lv: number;
  title: string;
  detail: {
    context: string;
    task: string;
    steps: [string, string][];
    expected: string;
  };
  xp?: number;
}

const TT = (c: string, t: string, s: [string, string][], e: string) =>
  ({ context: c, task: t, steps: s, expected: e });

// ── GIT TASKS ─────────────────────────────────────────────────────────────────
const GIT_TASKS: TrackTask[] = [
  // Level 1
  { n:1, lv:1, title:'Set Up Git Repository on Storage Server', detail: TT(
    'The Nautilus development team needs a centralized bare repository on the Storage Server for all project code.',
    'Initialize a bare Git repository at /opt/repos/news-web.git on ststor01.',
    [['SSH to Storage Server','ssh natasha@ststor01'],
     ['Create the target directory','sudo mkdir -p /opt/repos/news-web.git'],
     ['Initialize bare repo','sudo git init --bare /opt/repos/news-web.git'],
     ['Set ownership','sudo chown -R natasha:natasha /opt/repos/news-web.git'],
     ['Verify structure','ls /opt/repos/news-web.git']],
    'HEAD  branches  config  description  hooks  info  objects  refs') },

  { n:2, lv:1, title:'Clone Git Repository on Storage Server', detail: TT(
    'A frontend engineer on the Nautilus team needs a working copy of the news-web repository to begin coding.',
    'Clone news-web.git from the Storage Server to /usr/src/repos/news-web on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Clone the repository','sudo git clone ssh://natasha@ststor01/opt/repos/news-web.git /usr/src/repos/news-web'],
     ['Verify working copy','ls /usr/src/repos/news-web'],
     ['Check remote URL','cd /usr/src/repos/news-web && git remote -v']],
    'origin  ssh://natasha@ststor01/opt/repos/news-web.git (fetch)') },

  { n:3, lv:1, title:'Fork a Git Repository', detail: TT(
    'A Nautilus UI developer needs their own copy of sarah/react-blog to experiment without affecting the original.',
    'Fork sarah/react-blog on Gitea, clone the fork, and add the upstream remote.',
    [['Log in to Gitea','http://git.stratos.xfusioncorp.com — use your credentials'],
     ['Fork via API','curl -X POST http://git.stratos.xfusioncorp.com/api/v1/repos/sarah/react-blog/forks -u \'your_user:your_pass\''],
     ['Clone your fork','git clone http://git.stratos.xfusioncorp.com/your_user/react-blog'],
     ['Add upstream remote','cd react-blog && git remote add upstream http://git.stratos.xfusioncorp.com/sarah/react-blog.git'],
     ['Verify remotes','git remote -v']],
    'origin (your fork) + upstream (sarah/react-blog) both configured') },

  { n:4, lv:1, title:'Update Git Repository with Sample HTML File', detail: TT(
    'The Nautilus content team needs an initial commit with a sample index.html before development begins.',
    'Add index.html to news-web repo on App Server 2, commit, and push to main.',
    [['Navigate to working copy','cd /usr/src/repos/news-web'],
     ['Create index.html',"echo '<h1>xFusionCorp News</h1>' > index.html"],
     ['Stage and commit','git add index.html && git commit -m \'JIRA-004: add sample index.html\''],
     ['Push to main','git push origin main'],
     ['Verify remote','git log --oneline origin/main']],
    'JIRA-004: add sample index.html  (visible in remote log)') },

  { n:5, lv:1, title:'Delete Git Branch', detail: TT(
    'The Nautilus UI team merged feature/old-nav and needs the stale branch removed from local and remote.',
    'Delete the local and remote branch feature/old-nav from the news-web repository.',
    [['List all branches','git branch -a'],
     ['Delete local branch','git branch -d feature/old-nav'],
     ['Delete remote branch','git push origin --delete feature/old-nav'],
     ['Verify deletion','git branch -r | grep old-nav']],
    'feature/old-nav no longer in git branch -r output') },

  // Level 2
  { n:6, lv:2, title:'Git Install and Create Repository', detail: TT(
    'The Nautilus infra team is provisioning a new App Server and needs Git installed with a first commit.',
    'Install git on App Server 1, initialize /usr/src/repos/kodekloud, and create an initial commit.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Install Git','sudo dnf install -y git'],
     ['Initialize repository','sudo git init /usr/src/repos/kodekloud'],
     ['Configure identity','git config --global user.email \'tony@stratos.xfusioncorp.com\' && git config --global user.name \'Tony Stark\''],
     ['Make initial commit','cd /usr/src/repos/kodekloud && git commit --allow-empty -m \'JIRA-201: init repo\''],
     ['Verify log','git log --oneline']],
    'JIRA-201: init repo  (commit visible in git log)') },

  { n:7, lv:2, title:'Git Create Branches', detail: TT(
    'The Nautilus backend team uses Gitflow and needs feature branches for parallel development of two new features.',
    'Create and push branches feature/user-auth and feature/api-gateway in the news-web repo.',
    [['Navigate to repo','cd /usr/src/repos/news-web'],
     ['Create and push feature/user-auth','git checkout -b feature/user-auth && git push origin feature/user-auth'],
     ['Return to main','git checkout main'],
     ['Create and push feature/api-gateway','git checkout -b feature/api-gateway && git push origin feature/api-gateway'],
     ['Verify remote branches','git branch -r']],
    'origin/feature/user-auth  origin/feature/api-gateway  origin/main') },

  { n:8, lv:2, title:'Git Merge Branches', detail: TT(
    'The Nautilus QA team approved feature/user-auth, and it is ready to merge into main.',
    'Merge feature/user-auth into main with a merge commit and push the result to origin.',
    [['Switch to main','git checkout main && git pull origin main'],
     ['Merge with explicit commit','git merge feature/user-auth --no-ff -m \'JIRA-208: merge user-auth into main\''],
     ['Push merged main','git push origin main'],
     ['Verify merge commit in log','git log --oneline -5']],
    "Merge commit 'JIRA-208: merge user-auth into main' visible in git log") },

  { n:9, lv:2, title:'Git Manage Remotes', detail: TT(
    "After forking the Nautilus org repo, the developer's clone needs upstream tracking configured to pull in updates.",
    'Add upstream remote pointing to the org repo, fetch it, and verify branch tracking.',
    [['Check current remotes','git remote -v'],
     ['Add upstream remote','git remote add upstream http://git.stratos.xfusioncorp.com/org/news-web.git'],
     ['Fetch from upstream','git fetch upstream'],
     ['Track upstream main','git branch --set-upstream-to=upstream/main main'],
     ['Verify remotes','git remote -v && git branch -vv']],
    'origin + upstream both in git remote -v | main tracking upstream/main') },

  { n:10, lv:2, title:'Git Revert Some Changes', detail: TT(
    'A faulty commit broke the Nautilus production build on main; it must be reversed without rewriting history.',
    'Revert the last commit on main using git revert to preserve the full history.',
    [['View recent commits','git log --oneline -5'],
     ['Revert the last commit','git revert HEAD --no-edit'],
     ['Push the revert commit','git push origin main'],
     ['Verify revert in log','git log --oneline -5']],
    "Revert 'JIRA-xxx: ...' commit visible at the top of git log") },

  // Level 3
  { n:11, lv:3, title:'Git Cherry Pick', detail: TT(
    'A critical security fix for a Nautilus payment gateway must be applied to main without a full merge.',
    'Cherry-pick the security fix commit from hotfix/cve-2024 onto the main branch.',
    [['Find the commit hash','git log hotfix/cve-2024 --oneline | head -5'],
     ['Switch to main','git checkout main'],
     ['Cherry-pick the commit','git cherry-pick <commit-hash>'],
     ['Push to remote','git push origin main'],
     ['Verify commit on main','git log --oneline -3']],
    'Cherry-picked security fix commit now on top of main') },

  { n:12, lv:3, title:'Manage Git Pull Requests', detail: TT(
    'The Nautilus code review process requires a pull request from feature/api-gateway to main on Gitea.',
    'Create a PR, get it reviewed, and merge it via Gitea, then pull the merged main.',
    [['Push feature branch','git push origin feature/api-gateway'],
     ['Open Gitea','http://git.stratos.xfusioncorp.com => New Pull Request from feature/api-gateway to main'],
     ['Add description and reviewers','Fill PR title, description, assign reviewer'],
     ['Approve and merge','Reviewer approves => Merge Pull Request'],
     ['Pull merged main locally','git checkout main && git pull origin main']],
    'Merge pull request from feature/api-gateway visible in git log') },

  { n:13, lv:3, title:'Git hard reset', detail: TT(
    'Three experimental commits by the Nautilus research team on main need complete removal including working directory cleanup.',
    'Hard reset main to HEAD~3, discarding the last three commits permanently.',
    [['View current commit log','git log --oneline -6'],
     ['Hard reset 3 commits back','git reset --hard HEAD~3'],
     ['Force push to remote','git push origin main --force'],
     ['Verify commits removed','git log --oneline -4']],
    'Last 3 commits no longer visible in git log') },

  { n:14, lv:3, title:'Git Clean', detail: TT(
    'Untracked build artifacts are cluttering the Nautilus CI runner\'s working directory after a failed build.',
    'Remove all untracked files and directories from the working tree using git clean.',
    [['Check what would be removed','git clean -nd'],
     ['Remove untracked files and dirs','git clean -fd'],
     ['Verify clean working tree','git status'],
     ['Confirm no untracked remain',"git status | grep 'nothing to commit'"]],
    'nothing to commit, working tree clean') },

  { n:15, lv:3, title:'Git Stash', detail: TT(
    'A Nautilus API developer has in-progress changes but must switch to fix an urgent hotfix branch.',
    'Stash in-progress changes, apply the hotfix on its branch, then restore the stashed work.',
    [['Stash current changes with message',"git stash push -m 'WIP: api-gateway refactor'"],
     ['Switch to hotfix branch','git checkout hotfix/urgent-fix'],
     ['Make and commit the fix',"echo fix > hotfix.txt && git add . && git commit -m 'JIRA-315: urgent hotfix'"],
     ['Return to feature branch','git checkout feature/api-gateway'],
     ['Restore stash','git stash pop'],
     ['Verify changes restored','git status']],
    'WIP changes restored | modified files visible in git status') },

  // Level 4
  { n:16, lv:4, title:'Git Rebase', detail: TT(
    'The Nautilus feature/api-gateway branch is 5 commits behind main; it needs rebasing for a clean linear history.',
    'Rebase feature/api-gateway onto the latest main branch.',
    [['Checkout feature branch','git checkout feature/api-gateway'],
     ['Fetch latest main','git fetch origin main'],
     ['Rebase onto origin/main','git rebase origin/main'],
     ['Resolve conflicts if any','git add . && git rebase --continue  (only if conflicts)'],
     ['Force push rebased branch','git push origin feature/api-gateway --force-with-lease']],
    'Linear history: feature commits directly on top of latest main') },

  { n:17, lv:4, title:'Manage Git Repositories', detail: TT(
    'The Nautilus news-web repo needs a push mirror backup on the Storage Server for disaster recovery.',
    'Create a mirror clone of news-web.git and configure it as a push mirror for the backup.',
    [['Clone as mirror on jump host','git clone --mirror ssh://natasha@ststor01/opt/repos/news-web.git /tmp/news-web-mirror.git'],
     ['Navigate to mirror','cd /tmp/news-web-mirror.git'],
     ['Set push mirror URL','git remote set-url --push origin ssh://natasha@ststor01/opt/repos/news-web-backup.git'],
     ['Push mirror to backup','git push --mirror'],
     ['Verify backup refs','git ls-remote ssh://natasha@ststor01/opt/repos/news-web-backup.git']],
    'Backup repo has same branches and tags as source') },

  { n:18, lv:4, title:'Resolve Git Merge Conflicts', detail: TT(
    'Both main and the Nautilus feature/user-auth branch modified index.html causing a conflict on merge.',
    'Merge feature/user-auth into main, resolve the conflict keeping both sets of changes.',
    [['Attempt the merge','git checkout main && git merge feature/user-auth'],
     ['Identify conflicted file',"git status | grep 'both modified'"],
     ['Open and resolve conflict','vim index.html  =>  remove <<<<, ====, >>>> markers; keep both content sections'],
     ['Stage resolved file','git add index.html'],
     ["Complete the merge commit","git commit -m 'JIRA-418: resolve merge conflict in index.html'"]],
    'Merge completed — both changes preserved in index.html') },

  { n:19, lv:4, title:'Git Hook', detail: TT(
    'The Nautilus frontend team needs a pre-commit hook to run ESLint and block commits when lint errors exist.',
    'Create a pre-commit hook in news-web repo that runs npm run lint and exits 1 on failure.',
    [['Navigate to hooks directory','cd /usr/src/repos/news-web/.git/hooks'],
     ['Create pre-commit hook','vim pre-commit'],
     ['Hook content','#!/bin/bash  =>  npm run lint; if [ $? -ne 0 ]; then echo \'Lint failed. Commit blocked.\'; exit 1; fi'],
     ['Make executable','chmod +x pre-commit'],
     ['Test with lint errors','Introduce a lint error => git commit => should fail'],
     ['Test with clean code','Fix lint errors => git commit => should succeed']],
    'Commit blocked on lint failure | allowed when lint passes') },

  { n:20, lv:4, title:'Git Setup from Scratch', detail: TT(
    'A brand new Nautilus greenfield project needs complete Git setup: repo, .gitignore, tagged first release, and remote.',
    'Init repo, add .gitignore, commit, tag v1.0.0, push to Storage Server bare repo.',
    [['Initialize new local repo','mkdir /usr/src/repos/greenfield && cd /usr/src/repos/greenfield && git init'],
     ['Create .gitignore',"echo -e 'node_modules/\\n.env\\n*.log\\ndist/' > .gitignore && git add .gitignore"],
     ['Initial commit',"git commit -m 'JIRA-420: project setup with .gitignore'"],
     ['Tag first release',"git tag -a v1.0.0 -m 'First release'"],
     ['Add remote and push','git remote add origin ssh://natasha@ststor01/opt/repos/greenfield.git && git push origin main --tags']],
    'v1.0.0 tag visible on remote | clean repo structure') },
];

// ── LINUX TASKS ───────────────────────────────────────────────────────────────
const LINUX_TASKS: TrackTask[] = [
  // Level 1
  { n:1, lv:1, title:'Custom Apache User Setup', detail: TT(
    "The Nautilus ops team needs a dedicated system user for the Apache web server with a locked shell.",
    'Create user httpd_user with home /var/www, shell /sbin/nologin, added to apache group on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Create user with custom home','sudo useradd -m -d /var/www -s /sbin/nologin -G apache httpd_user'],
     ['Verify user details','id httpd_user'],
     ['Verify group membership','getent group apache | grep httpd_user']],
    'uid=xxxx(httpd_user) gid=xxxx groups=xxxx,xxxx(apache)') },

  { n:2, lv:1, title:'Group Creation and User Assignment', detail: TT(
    "The Nautilus web dev team needs a shared group so members can collaborate on project files.",
    'Create group web_devs and add users yousuf and kareem to it on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Create the group','sudo groupadd web_devs'],
     ['Add yousuf to group','sudo usermod -aG web_devs yousuf'],
     ['Add kareem to group','sudo usermod -aG web_devs kareem'],
     ['Verify group members','getent group web_devs']],
    'web_devs:x:xxxx:yousuf,kareem') },

  { n:3, lv:1, title:'Linux User Setup with Non-Interactive Shell', detail: TT(
    "A Nautilus service account is needed for the monitoring tool that must not allow interactive login.",
    'Create user kirsty with /sbin/nologin shell on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Create non-interactive user','sudo useradd -s /sbin/nologin kirsty'],
     ['Verify /etc/passwd entry',"grep '^kirsty' /etc/passwd"],
     ['Confirm login is blocked','sudo -u kirsty /bin/bash  =>  should fail']],
    'kirsty:x:xxxx:xxxx::/home/kirsty:/sbin/nologin') },

  { n:4, lv:1, title:'Service User Creation without Home Directory', detail: TT(
    "A Nautilus microservice needs an account with no home directory for security hardening.",
    'Create user svcuser with no home directory and shell /sbin/nologin on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Create user without home','sudo useradd -M -s /sbin/nologin svcuser'],
     ['Verify user created','id svcuser'],
     ['Confirm no home dir','ls /home | grep svcuser  =>  should be empty']],
    'uid=xxxx(svcuser) | no /home/svcuser directory created') },

  { n:5, lv:1, title:'Temporary User Setup with Expiry', detail: TT(
    "A Nautilus contractor needs temporary access that auto-expires without manual intervention.",
    'Create user contractor1 with account expiry 2024-05-15 on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Create user with expiry','sudo useradd -e 2024-05-15 contractor1'],
     ['Set a temporary password','sudo passwd contractor1'],
     ["Verify expiry date","sudo chage -l contractor1 | grep 'Account expires'"]],
    'Account expires: May 15, 2024') },

  { n:6, lv:1, title:'Linux User Data Transfer', detail: TT(
    "Nautilus user john is being decommissioned; their home data must transfer to the web root.",
    'Copy all files from /home/john to /var/www/html/john on App Server 3, preserving permissions.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Create target directory','sudo mkdir -p /var/www/html/john'],
     ['Copy data preserving permissions','sudo cp -rp /home/john/. /var/www/html/john/'],
     ['Verify ownership and content','ls -la /var/www/html/john']],
    'Files copied with original permissions and ownership preserved') },

  { n:7, lv:1, title:'Secure Root SSH Access', detail: TT(
    "Nautilus security audit requires disabling direct root SSH login on App Server 2 to reduce attack surface.",
    'Disable root SSH login on App Server 2 and restart sshd.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Update sshd_config',"sudo sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config"],
     ['Restart SSH service','sudo systemctl restart sshd'],
     ['Verify setting applied','grep PermitRootLogin /etc/ssh/sshd_config']],
    'PermitRootLogin no') },

  { n:8, lv:1, title:'Data Backup for Developer', detail: TT(
    "Nautilus developer sarah's home directory must be archived before a planned OS upgrade.",
    'Create a compressed tarball of /home/sarah at /backup/sarah_backup.tar.gz on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Create backup directory','sudo mkdir -p /backup'],
     ['Create compressed archive','sudo tar -czf /backup/sarah_backup.tar.gz /home/sarah'],
     ['Verify backup size','ls -lh /backup/sarah_backup.tar.gz'],
     ['Test archive integrity','sudo tar -tzf /backup/sarah_backup.tar.gz | head -5']],
    '/backup/sarah_backup.tar.gz  (non-zero size, lists home contents)') },

  { n:9, lv:1, title:'Script Execution Permissions', detail: TT(
    "For the Nautilus project, a deployment script was uploaded but is missing its execute permission.",
    'Give the owner execute permission on /opt/scripts/deploy.sh on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Check current permissions','ls -l /opt/scripts/deploy.sh'],
     ['Add execute for owner only','sudo chmod u+x /opt/scripts/deploy.sh'],
     ['Verify new permissions','ls -l /opt/scripts/deploy.sh']],
    '-rwxr--r-- 1 root root /opt/scripts/deploy.sh') },

  { n:10, lv:1, title:'File Permission Correction', detail: TT(
    "For the Nautilus project, a sensitive config file has 777 permissions which is a security violation.",
    'Change /opt/app/config.conf to 640 permissions with owner root:apache on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Check current permissions','ls -l /opt/app/config.conf'],
     ['Fix permissions','sudo chmod 640 /opt/app/config.conf'],
     ['Fix ownership','sudo chown root:apache /opt/app/config.conf'],
     ['Verify both changes','ls -l /opt/app/config.conf']],
    '-rw-r----- 1 root apache /opt/app/config.conf') },

  { n:11, lv:1, title:'String Replacement', detail: TT(
    "For the Nautilus project, a config file references the old hostname and must be updated to the current server name.",
    'Replace all occurrences of old-server with stapp01 in /etc/app/settings.conf on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Count occurrences before',"grep -c 'old-server' /etc/app/settings.conf"],
     ['Perform replacement',"sudo sed -i 's/old-server/stapp01/g' /etc/app/settings.conf"],
     ['Verify replacement','grep \'stapp01\' /etc/app/settings.conf'],
     ['Confirm old string gone',"grep 'old-server' /etc/app/settings.conf  =>  should return nothing"]],
    'stapp01 present | old-server no longer found in settings.conf') },

  { n:12, lv:1, title:'Secure Data Transfer', detail: TT(
    "For the Nautilus project, a report file on App Server 1 needs secure transfer to App Server 3 for processing.",
    'Use scp to copy /opt/data/report.txt from App Server 1 to /tmp/ on App Server 3.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Copy file to App Server 3','scp /opt/data/report.txt banner@stapp03:/tmp/'],
     ['Verify on App Server 3','ssh banner@stapp03 ls -l /tmp/report.txt'],
     ['Check file integrity','ssh banner@stapp03 md5sum /tmp/report.txt']],
    'report.txt present in /tmp/ on stapp03 with matching checksum') },

  { n:13, lv:1, title:'Restrict Cron Access', detail: TT(
    "For the Nautilus project, only authorized users should be allowed to schedule cron jobs on App Server 1.",
    'Deny cron access for user tony and allow only user mark on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Add tony to cron.deny','echo tony | sudo tee -a /etc/cron.deny'],
     ['Create cron.allow with mark','echo mark | sudo tee /etc/cron.allow'],
     ['Verify cron.deny','cat /etc/cron.deny'],
     ['Verify cron.allow','cat /etc/cron.allow']],
    'cron.deny: tony | cron.allow: mark') },

  { n:14, lv:1, title:'Default GUI Boot Configuration', detail: TT(
    "For the Nautilus project, app Server 2 was accidentally set to graphical boot target; it needs reverting to CLI.",
    'Set the default boot target to multi-user.target on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Check current default','systemctl get-default'],
     ['Set multi-user target','sudo systemctl set-default multi-user.target'],
     ['Verify new default','systemctl get-default']],
    'multi-user.target') },

  { n:15, lv:1, title:'Timezone Alignment', detail: TT(
    "For the Nautilus project, server clocks must align to UTC for consistent log timestamps across the fleet.",
    'Set the timezone to UTC on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Check current timezone','timedatectl'],
     ['Set timezone to UTC','sudo timedatectl set-timezone UTC'],
     ['Verify new timezone',"timedatectl | grep 'Time zone'"],
     ['Confirm system date','date']],
    'Time zone: UTC (UTC, +0000)') },

  { n:16, lv:1, title:'Firewall Configuration', detail: TT(
    "The Nautilus web server on App Server 3 needs HTTP and HTTPS traffic allowed through the firewall.",
    'Allow HTTP port 80 and HTTPS port 443 through firewalld permanently on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Allow HTTP service','sudo firewall-cmd --permanent --add-service=http'],
     ['Allow HTTPS service','sudo firewall-cmd --permanent --add-service=https'],
     ['Reload firewall','sudo firewall-cmd --reload'],
     ['Verify allowed services','sudo firewall-cmd --list-services']],
    'dhcpv6-client http https ssh  (http and https now in list)') },

  { n:17, lv:1, title:'Process Limit Adjustment', detail: TT(
    "The Nautilus application server needs more processes than the default OS limit allows.",
    'Set the max process limit (nproc) to 8192 for user apache in /etc/security/limits.conf on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Check current limit',"sudo -u apache bash -c 'ulimit -u'"],
     ['Add hard limit to limits.conf',"sudo bash -c 'echo \"apache hard nproc 8192\" >> /etc/security/limits.conf'"],
     ['Also set soft limit',"sudo bash -c 'echo \"apache soft nproc 8192\" >> /etc/security/limits.conf'"],
     ['Verify new limit',"sudo -u apache bash -c 'ulimit -u'"]],
    '8192') },

  { n:18, lv:1, title:'SElinux Installation and Configuration', detail: TT(
    "A Nautilus compliance audit mandates SELinux enforcing mode on all App Servers.",
    'Enable SELinux enforcing mode on App Server 1 and persist it across reboots.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Check current mode','getenforce'],
     ['Set enforcing immediately','sudo setenforce 1'],
     ['Persist in config file',"sudo sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config"],
     ['Verify current mode','getenforce'],
     ['Verify config file',"grep '^SELINUX=' /etc/selinux/config"]],
    'Enforcing | SELINUX=enforcing') },

  // Level 2
  { n:19, lv:2, title:'Create a Cron Job', detail: TT(
    "For the Nautilus project, a log cleanup script must run automatically every 2 hours on App Server 1.",
    'Create a cron job for user mark to run /usr/local/bin/cleanup.sh every 2 hours.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Edit mark\'s crontab','sudo crontab -u mark -e'],
     ['Add cron entry','0 */2 * * * /usr/local/bin/cleanup.sh'],
     ['Verify cron entry','sudo crontab -u mark -l']],
    '0 */2 * * * /usr/local/bin/cleanup.sh') },

  { n:20, lv:2, title:'Linux Banner', detail: TT(
    "A Nautilus legal warning banner must display on every SSH login to meet compliance requirements.",
    'Set /etc/motd to a warning message on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Write the banner',"sudo bash -c 'echo \"Authorized access only. All activity is monitored.\" > /etc/motd'"],
     ['Verify motd content','cat /etc/motd'],
     ['Test on next login','ssh steve@stapp02  =>  banner should appear on login']],
    'Authorized access only. All activity is monitored.') },

  { n:21, lv:2, title:'Linux Collaborative Directories', detail: TT(
    "The Nautilus dev team needs a shared directory where all group members can create and modify files.",
    'Create /data/shared with group devteam ownership, permissions 2775 (setgid) on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Create directory','sudo mkdir -p /data/shared'],
     ['Set group ownership','sudo chgrp devteam /data/shared'],
     ['Set permissions with setgid','sudo chmod 2775 /data/shared'],
     ['Verify permissions','ls -ld /data/shared']],
    'drwxrwsr-x 2 root devteam /data/shared') },

  { n:22, lv:2, title:'Linux String Substitute (sed)', detail: TT(
    "The Nautilus database config file has the wrong hostname and needs updating across multiple files.",
    'Replace DB_HOST=localhost with DB_HOST=stdb01 in /opt/app/database.conf on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Check current value','grep DB_HOST /opt/app/database.conf'],
     ['Perform substitution',"sudo sed -i 's/DB_HOST=localhost/DB_HOST=stdb01/' /opt/app/database.conf"],
     ['Verify replacement','grep DB_HOST /opt/app/database.conf']],
    'DB_HOST=stdb01') },

  { n:23, lv:2, title:'Linux SSH Authentication', detail: TT(
    "Nautilus passwordless SSH is required from the jump host to all App Servers for Ansible automation.",
    'Configure SSH key-based auth for thor from jump host to stapp01, stapp02, stapp03.',
    [['Generate ED25519 key pair',"ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519"],
     ['Copy key to App Server 1','ssh-copy-id tony@stapp01'],
     ['Copy key to App Server 2','ssh-copy-id steve@stapp02'],
     ['Copy key to App Server 3','ssh-copy-id banner@stapp03'],
     ['Test passwordless access','ssh tony@stapp01 hostname && ssh steve@stapp02 hostname && ssh banner@stapp03 hostname']],
    'stapp01  stapp02  stapp03  (all without password prompt)') },

  { n:24, lv:2, title:'Linux Find Command', detail: TT(
    "Nautilus log files older than 30 days need identifying for scheduled cleanup to free disk space.",
    'Find all .log files under /var/log older than 30 days on App Server 1 and list them with sizes.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Find old log files',"find /var/log -name '*.log' -mtime +30"],
     ['List with sizes',"find /var/log -name '*.log' -mtime +30 -ls"],
     ['Count files found',"find /var/log -name '*.log' -mtime +30 | wc -l"]],
    '.log files older than 30 days listed with sizes and paths') },

  { n:25, lv:2, title:'Install a package', detail: TT(
    "For the Nautilus project, the development team needs tree and ncdu utilities for directory visualization and disk analysis.",
    'Install tree and ncdu on App Server 2 using dnf.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Install both packages','sudo dnf install -y tree ncdu'],
     ['Verify tree installed','tree --version'],
     ['Verify ncdu installed','ncdu --version']],
    'tree v1.x.x | ncdu x.x.x') },

  { n:26, lv:2, title:'Install Ansible', detail: TT(
    "The Nautilus ops team is adopting Ansible for automation and needs it installed on the jump host.",
    'Install Ansible on the jump host via dnf and verify with a ping to App Servers.',
    [['Install EPEL release','sudo dnf install -y epel-release'],
     ['Install Ansible','sudo dnf install -y ansible'],
     ['Verify version','ansible --version'],
     ['Test ping to app servers',"ansible all -i 'stapp01,stapp02,stapp03,' -m ping -u tony"]],
    'ansible [core 2.x.x] | All hosts respond with pong') },

  { n:27, lv:2, title:'Configure Local Yum repos', detail: TT(
    "For the Nautilus project, the App Server needs a local yum repository configured from an ISO mount for air-gapped updates.",
    'Configure a local yum repo on App Server 1 using the ISO mounted at /mnt/repo.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Create repo file','sudo vim /etc/yum.repos.d/local.repo'],
     ['Repo file content','[local]\\nname=Local Repo\\nbaseurl=file:///mnt/repo\\nenabled=1\\ngpgcheck=0'],
     ['Clean dnf cache','sudo dnf clean all'],
     ['Verify repo is listed','sudo dnf repolist | grep local']],
    'local  Local Repo  (visible in dnf repolist output)') },

  { n:28, lv:2, title:'Linux Services', detail: TT(
    "Critical Nautilus services httpd and vsftpd must be running and enabled on App Server 3.",
    'Enable and start both httpd and vsftpd on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Enable and start both services','sudo systemctl enable --now httpd vsftpd'],
     ['Check httpd enabled','systemctl is-enabled httpd'],
     ['Check vsftpd enabled','systemctl is-enabled vsftpd'],
     ['Check httpd active','systemctl is-active httpd']],
    'enabled | enabled | active') },

  { n:29, lv:2, title:'Linux Configure sudo', detail: TT(
    "Nautilus developer mark needs passwordless sudo for specific commands without full root access.",
    'Grant mark passwordless sudo for /bin/systemctl and /usr/bin/dnf on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Create sudoers drop-in file','sudo vim /etc/sudoers.d/mark'],
     ['Add rule','mark ALL=(ALL) NOPASSWD: /bin/systemctl, /usr/bin/dnf'],
     ['Verify syntax','sudo visudo -c -f /etc/sudoers.d/mark'],
     ['Test sudo -l','sudo -l -U mark']],
    '(ALL) NOPASSWD: /bin/systemctl, /usr/bin/dnf') },

  { n:30, lv:2, title:'DNS Troubleshooting', detail: TT(
    "For the Nautilus project, app Server 1 cannot resolve internal hostnames stdb01 and ststor01, breaking the application.",
    'Fix DNS resolution on App Server 1 so internal hostnames resolve correctly.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Check current DNS config','cat /etc/resolv.conf'],
     ['Test failing resolution','nslookup stdb01  =>  should fail'],
     ['Fix nameserver in resolv.conf','sudo vim /etc/resolv.conf  =>  add correct nameserver IP'],
     ['Test resolution now','nslookup stdb01 && nslookup ststor01']],
    'stdb01 resolves to 172.16.238.11 | ststor01 resolves correctly') },

  { n:31, lv:2, title:'Linux Firewalld Setup', detail: TT(
    "The Nautilus Storage Server needs NFS-related firewall rules for App Server mounts to work.",
    'Allow nfs, mountd, and rpc-bind through firewalld permanently on the Storage Server.',
    [['SSH to Storage Server','ssh natasha@ststor01'],
     ['Add NFS services permanently','sudo firewall-cmd --permanent --add-service=nfs --add-service=mountd --add-service=rpc-bind'],
     ['Reload firewall rules','sudo firewall-cmd --reload'],
     ['Verify services allowed','sudo firewall-cmd --list-services']],
    'mountd nfs rpc-bind visible in --list-services output') },

  { n:32, lv:2, title:'Linux Postfix Mail Server', detail: TT(
    "The Nautilus Mail Server needs Postfix installed and configured for the stratos.xfusioncorp.com domain.",
    'Install Postfix on stmail01, configure domain, and start the service.',
    [['SSH to Mail Server','ssh groot@stmail01'],
     ['Install Postfix','sudo dnf install -y postfix'],
     ['Set hostname',"sudo postconf -e 'myhostname = stmail01.stratos.xfusioncorp.com'"],
     ['Set domain',"sudo postconf -e 'mydomain = stratos.xfusioncorp.com'"],
     ['Enable and start','sudo systemctl enable --now postfix'],
     ['Verify config','postconf myhostname mydomain']],
    'myhostname = stmail01.stratos.xfusioncorp.com | mydomain = stratos.xfusioncorp.com') },

  { n:33, lv:2, title:'Linux Postfix Troubleshooting', detail: TT(
    "For the Nautilus project, mail delivery is failing because Postfix on the Mail Server has a configuration error.",
    'Diagnose and fix the Postfix service on stmail01 so mail delivery works.',
    [['SSH to Mail Server','ssh groot@stmail01'],
     ['Check service status','sudo systemctl status postfix'],
     ['View recent logs','sudo journalctl -u postfix -n 30 --no-pager'],
     ['Check config syntax','sudo postfix check'],
     ['Fix the identified error','sudo vim /etc/postfix/main.cf  =>  fix reported line'],
     ['Restart and verify','sudo systemctl restart postfix && postqueue -p']],
    'Postfix running | postqueue -p shows empty queue (no backlog)') },

  { n:34, lv:2, title:'Install and Configure HaProxy LBR', detail: TT(
    "The Nautilus Load Balancer Server needs HAProxy for round-robin balancing across App Servers 1 and 2.",
    'Install HAProxy on stlb01 and configure it to balance HTTP traffic to stapp01:80 and stapp02:80.',
    [['SSH to Load Balancer','ssh loki@stlb01'],
     ['Install HAProxy','sudo dnf install -y haproxy'],
     ['Configure frontend and backend','sudo vim /etc/haproxy/haproxy.cfg  =>  frontend port 80, backend stapp01 stapp02'],
     ['Enable and start HAProxy','sudo systemctl enable --now haproxy'],
     ['Test load balancing','curl http://stlb01 && curl http://stlb01']],
    'HAProxy routing requests alternately to stapp01 and stapp02') },

  { n:35, lv:2, title:'Haproxy LBR Troubleshooting', detail: TT(
    "For the Nautilus project, hAProxy on the LB Server is failing to start due to a misconfiguration in haproxy.cfg.",
    'Diagnose and fix the HAProxy configuration so the service starts successfully.',
    [['SSH to Load Balancer','ssh loki@stlb01'],
     ['Check service status','sudo systemctl status haproxy'],
     ['Validate config file','haproxy -f /etc/haproxy/haproxy.cfg -c'],
     ['Fix reported error','sudo vim /etc/haproxy/haproxy.cfg  =>  correct the syntax or port error'],
     ['Start service','sudo systemctl start haproxy'],
     ['Test response','curl -s http://localhost | head -3']],
    'haproxy active (running) | HTTP response from backend server') },

  { n:36, lv:2, title:'MariaDB Troubleshooting', detail: TT(
    "For the Nautilus project, mariaDB on App Server 1 is failing to start, blocking the application team from testing.",
    'Investigate and fix the MariaDB service failure on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Check service status','sudo systemctl status mariadb'],
     ['View error logs','sudo journalctl -u mariadb -n 30 --no-pager'],
     ['Fix config if needed','sudo vim /etc/my.cnf.d/mariadb-server.cnf'],
     ['Restart service','sudo systemctl restart mariadb'],
     ['Test connection',"mysql -u root -e 'SHOW DATABASES;'"]],
    'MariaDB active (running) | SHOW DATABASES returns list') },

  { n:37, lv:2, title:'Linux Bash Scripts', detail: TT(
    "The Nautilus ops team needs an automated disk monitoring script that alerts when usage exceeds 80%.",
    'Create /opt/scripts/disk_monitor.sh that checks root filesystem usage and echoes ALERT if > 80%.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Create the script','sudo vim /opt/scripts/disk_monitor.sh'],
     ['Script logic',"#!/bin/bash  USAGE=$(df / | awk 'NR==2{print $5}' | tr -d %)  [ $USAGE -gt 80 ] && echo \"ALERT: Disk at ${USAGE}%\" || echo \"OK: Disk at ${USAGE}%\""],
     ['Make executable','sudo chmod +x /opt/scripts/disk_monitor.sh'],
     ['Run and verify','sudo /opt/scripts/disk_monitor.sh']],
    'OK: Disk at XX%  (or ALERT: if disk > 80%)') },

  { n:38, lv:2, title:'Add Response Headers in Apache', detail: TT(
    "For the Nautilus project, security headers X-Frame-Options and X-Content-Type-Options must be added to all Apache responses.",
    'Configure Apache on App Server 2 to add security headers to every response.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Create security headers config','sudo vim /etc/httpd/conf.d/security-headers.conf'],
     ['Add header directives','Header always set X-Frame-Options SAMEORIGIN\\nHeader always set X-Content-Type-Options nosniff'],
     ['Test config syntax','sudo httpd -t'],
     ['Reload Apache','sudo systemctl reload httpd'],
     ['Verify headers','curl -I http://localhost | grep -E \'X-Frame|X-Content\'']],
    'X-Frame-Options: SAMEORIGIN | X-Content-Type-Options: nosniff in response') },

  { n:39, lv:2, title:'Apache Troubleshooting', detail: TT(
    "For the Nautilus project, apache is not starting on App Server 3 due to a config or port conflict, blocking the web team.",
    'Diagnose and fix the Apache service on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Check service status','sudo systemctl status httpd'],
     ['Check config syntax','sudo httpd -t'],
     ['View recent error logs','sudo journalctl -u httpd -n 20 --no-pager'],
     ['Fix identified error','sudo vim /etc/httpd/conf/httpd.conf  =>  fix the error (port, syntax, or module)'],
     ['Start and verify','sudo systemctl start httpd && curl -s http://localhost | head -3']],
    'httpd active (running) | HTTP 200 response from localhost') },

  { n:40, lv:2, title:'Linux GPG Encryption', detail: TT(
    "For the Nautilus project, sensitive configuration files must be encrypted at rest before being archived.",
    'Encrypt /opt/app/secrets.conf using GPG symmetric encryption on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Encrypt the file','gpg --symmetric --cipher-algo AES256 /opt/app/secrets.conf'],
     ['Verify encrypted file exists','ls -lh /opt/app/secrets.conf.gpg'],
     ['Test decryption','gpg --decrypt /opt/app/secrets.conf.gpg > /tmp/decrypted.conf'],
     ['Verify content matches','diff /tmp/decrypted.conf /opt/app/secrets.conf']],
    'secrets.conf.gpg created | decryption matches original content') },

  { n:41, lv:2, title:'Linux LogRotate', detail: TT(
    "For the Nautilus project, application logs at /var/log/app are growing unbounded and need daily rotation with 7-day retention.",
    'Create a logrotate config for /var/log/app/*.log with daily rotation and 7 days retention.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Create logrotate config','sudo vim /etc/logrotate.d/app-logs'],
     ['Config content','/var/log/app/*.log { daily rotate 7 compress missingok notifempty dateext }'],
     ['Dry run to verify','sudo logrotate -d /etc/logrotate.d/app-logs'],
     ['Force run','sudo logrotate /etc/logrotate.d/app-logs']],
    'Logrotate runs without errors | rotated .gz log created') },

  { n:42, lv:2, title:'Application Security', detail: TT(
    "The Nautilus application directory has world-readable permissions that expose sensitive configuration files.",
    'Set /opt/app to 750 permissions with owner root:appteam on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Set ownership recursively','sudo chown -R root:appteam /opt/app'],
     ['Set permissions recursively','sudo chmod -R 750 /opt/app'],
     ['Verify top-level directory','ls -ld /opt/app'],
     ['Verify no world-readable files','find /opt/app -perm -o+r  =>  should return nothing']],
    'drwxr-x--- root appteam /opt/app | no world-readable files') },

  // Level 3
  { n:43, lv:3, title:'Apache Redirects', detail: TT(
    "Old Nautilus URL paths need permanent redirecting to new paths for SEO and user bookmarks.",
    'Configure Apache on App Server 1 to permanently redirect /old-docs to /documentation (301).',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Create redirect config','sudo vim /etc/httpd/conf.d/redirects.conf'],
     ['Add redirect rule','Redirect 301 /old-docs /documentation'],
     ['Test config syntax','sudo httpd -t'],
     ['Reload Apache','sudo systemctl reload httpd'],
     ['Test redirect','curl -I http://localhost/old-docs | grep -E \'Location|301\'']],
    'HTTP/1.1 301 Moved Permanently | Location: http://localhost/documentation') },

  { n:44, lv:3, title:'Install And Configure SFTP', detail: TT(
    "Nautilus data transfer users need SFTP access for file uploads but must not get shell access.",
    'Configure SFTP-only access for user data-user on App Server 2 using OpenSSH.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Create SFTP-only user','sudo useradd -s /sbin/nologin data-user && sudo passwd data-user'],
     ['Create chroot directory','sudo mkdir -p /sftp/data-user && sudo chown root:root /sftp/data-user && sudo chmod 755 /sftp/data-user'],
     ['Configure sshd_config','sudo vim /etc/ssh/sshd_config  =>  add: Match User data-user / ForceCommand internal-sftp / ChrootDirectory /sftp/%u'],
     ['Restart SSH','sudo systemctl restart sshd'],
     ['Test SFTP access','sftp data-user@stapp02  =>  should connect via SFTP']],
    'SFTP connection succeeds | shell login blocked with /sbin/nologin') },

  { n:45, lv:3, title:'Install and Configure Tomcat Server', detail: TT(
    "For the Nautilus project, the Java application team needs Tomcat 9 for WAR file deployment on App Server 2.",
    'Install Tomcat, start the service, and verify it responds on port 8080.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Install Java 11','sudo dnf install -y java-11-openjdk'],
     ['Install Tomcat','sudo dnf install -y tomcat'],
     ['Enable and start','sudo systemctl enable --now tomcat'],
     ['Test port 8080','curl -s http://localhost:8080 | head -5'],
     ['Deploy sample WAR','sudo cp /tmp/sample.war /var/lib/tomcat/webapps/ && curl http://localhost:8080/sample']],
    'Tomcat welcome page accessible | sample app deployed at /sample') },

  { n:46, lv:3, title:'Linux Network Services', detail: TT(
    "The Nautilus Storage Server must export /data/shared over NFS and synchronize time via NTP.",
    'Configure NFS export of /data/shared to the 172.16.238.0/24 subnet and enable NTP on ststor01.',
    [['SSH to Storage Server','ssh natasha@ststor01'],
     ['Edit NFS exports','sudo vim /etc/exports  =>  /data/shared 172.16.238.0/24(rw,sync,no_root_squash)'],
     ['Apply exports','sudo exportfs -ra'],
     ['Install and enable chrony','sudo dnf install -y chrony && sudo systemctl enable --now chronyd'],
     ['Verify NFS export','showmount -e ststor01'],
     ['Verify NTP sync','chronyc tracking | head -3']],
    '/data/shared 172.16.238.0/24 in showmount | NTP synchronized') },

  { n:47, lv:3, title:'IPtables Installation And Configuration', detail: TT(
    "For the Nautilus project, a stateful firewall is needed on App Server 1 to allow only established and web traffic.",
    'Configure iptables on App Server 1: allow ESTABLISHED, SSH, HTTP, drop all other inbound.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Install iptables-services','sudo dnf install -y iptables-services'],
     ['Allow established connections','sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT'],
     ['Allow SSH and HTTP','sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT && sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT'],
     ['Set default DROP','sudo iptables -P INPUT DROP'],
     ['Save rules','sudo service iptables save'],
     ['Verify rules','sudo iptables -L INPUT -n']],
    'ACCEPT ESTABLISHED,RELATED | ACCEPT dpt:22 | ACCEPT dpt:80 | policy DROP') },

  { n:48, lv:3, title:'Linux Nginx as Reverse Proxy', detail: TT(
    "For the Nautilus project, nginx should act as the front door, proxying all traffic to the backend Node.js app on port 3000.",
    'Configure Nginx on App Server 3 as a reverse proxy passing requests to localhost:3000.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Install Nginx','sudo dnf install -y nginx'],
     ['Create proxy config','sudo vim /etc/nginx/conf.d/proxy.conf'],
     ['Proxy config content','server { listen 80; location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; } }'],
     ['Test config','sudo nginx -t'],
     ['Enable and reload','sudo systemctl enable --now nginx && sudo systemctl reload nginx']],
    'HTTP requests to port 80 proxied to Node.js app on port 3000') },

  { n:49, lv:3, title:'Configure protected directories in Apache', detail: TT(
    "For the Nautilus project, the admin area must be password-protected using HTTP Basic Auth to prevent unauthorized access.",
    'Protect /var/www/html/admin with Basic Auth using htpasswd on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Create htpasswd file','sudo htpasswd -c /etc/httpd/.htpasswd admin'],
     ['Create auth config','sudo vim /etc/httpd/conf.d/admin-auth.conf'],
     ['Auth config content','<Directory /var/www/html/admin>\\n  AuthType Basic\\n  AuthName Admin Area\\n  AuthUserFile /etc/httpd/.htpasswd\\n  Require valid-user\\n</Directory>'],
     ['Reload Apache','sudo systemctl reload httpd'],
     ['Test auth required','curl -I http://localhost/admin  =>  should return 401'],
     ['Test with credentials','curl -u admin:password http://localhost/admin  =>  should return 200']],
    'HTTP 401 without credentials | HTTP 200 with valid credentials') },

  { n:50, lv:3, title:'Linux Process Troubleshooting', detail: TT(
    "For the Nautilus project, zombie processes are accumulating on App Server 2, indicating a parent process not reaping children.",
    'Identify zombie processes and their parent on App Server 2, then resolve the issue.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Find zombie processes',"ps aux | awk '$8==\"Z\" {print}'"],
     ['Get parent PID','ps -o ppid= -p <zombie-pid>'],
     ['Identify parent process','ps aux | grep <parent-pid>'],
     ['Kill parent to reap zombies','sudo kill -SIGCHLD <parent-pid>  (or kill -9 if unresponsive)'],
     ['Verify zombies cleared',"ps aux | awk '$8==\"Z\" {print}'  =>  should return nothing"]],
    'Zombie processes no longer visible in ps aux output') },

  { n:51, lv:3, title:'PAM Authentication For Apache', detail: TT(
    "For the Nautilus project, the /secure endpoint must authenticate users against the OS PAM stack.",
    'Install mod_authnz_pam and configure /secure to require valid PAM credentials on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Install PAM auth module','sudo dnf install -y mod_authnz_pam'],
     ['Create PAM service file','sudo vim /etc/pam.d/httpd  =>  include system-auth'],
     ['Create Apache PAM config','sudo vim /etc/httpd/conf.d/pam-auth.conf'],
     ['Config content','<Location /secure>\\n  AuthType Basic\\n  AuthName Secure Area\\n  AuthBasicProvider PAM\\n  AuthPAMService httpd\\n  Require valid-user\\n</Location>'],
     ['Reload Apache','sudo systemctl reload httpd']],
    '/secure requires PAM credentials | valid OS user gets HTTP 200') },

  { n:52, lv:3, title:'Setup SSL for Nginx', detail: TT(
    "Nautilus production Nginx needs TLS termination with a self-signed certificate on port 443.",
    'Generate a self-signed cert and configure Nginx HTTPS on port 443 on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Create SSL directory','sudo mkdir -p /etc/nginx/ssl'],
     ['Generate self-signed cert',"sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.crt -subj '/CN=stapp03.stratos.xfusioncorp.com'"],
     ['Create SSL server block','sudo vim /etc/nginx/conf.d/ssl.conf  =>  listen 443 ssl; ssl_certificate/ssl_certificate_key pointing to above files'],
     ['Test and reload','sudo nginx -t && sudo systemctl reload nginx'],
     ['Verify HTTPS','curl -k https://localhost -I | head -3']],
    'HTTP/1.1 200 OK  (on https://localhost)') },

  // Level 4
  { n:53, lv:4, title:'Install and Configure Nginx as an LBR', detail: TT(
    "The Nautilus Load Balancer needs Nginx configured for upstream round-robin load balancing across app servers.",
    'Configure Nginx on stlb01 to round-robin HTTP traffic between stapp01:8080 and stapp02:8080.',
    [['SSH to Load Balancer','ssh loki@stlb01'],
     ['Install Nginx','sudo dnf install -y nginx'],
     ['Configure upstream and proxy','sudo vim /etc/nginx/nginx.conf  =>  upstream backend { server stapp01:8080; server stapp02:8080; }  server { listen 80; location / { proxy_pass http://backend; } }'],
     ['Test config','sudo nginx -t'],
     ['Enable and start','sudo systemctl enable --now nginx'],
     ['Test load balancing','for i in 1 2 3 4; do curl -s http://stlb01 | grep -i server; done']],
    'Requests alternating between stapp01 and stapp02 responses') },

  { n:54, lv:4, title:'Install and Configure PostgreSQL', detail: TT(
    "The Nautilus analytics team needs PostgreSQL with a dedicated database and restricted user access.",
    'Install PostgreSQL on stdb01, create database analytics and user analyst with full access.',
    [['SSH to DB Server','ssh peter@stdb01'],
     ['Install PostgreSQL','sudo dnf install -y postgresql-server postgresql-contrib'],
     ['Initialize cluster','sudo postgresql-setup --initdb'],
     ['Enable and start','sudo systemctl enable --now postgresql'],
     ['Create DB and user',"sudo -u postgres psql -c \"CREATE DATABASE analytics; CREATE USER analyst WITH PASSWORD 'Analyst@123'; GRANT ALL PRIVILEGES ON DATABASE analytics TO analyst;\""],
     ['Verify connection',"psql -U analyst -d analytics -h localhost -c '\\conninfo'"]],
    'Connected to database analytics as user analyst on host localhost') },

  { n:55, lv:4, title:'Bash scripts if/else statements', detail: TT(
    "Nautilus deployment needs environment-specific logic to select the correct target URL per environment.",
    'Write /opt/scripts/deploy.sh that accepts dev/staging/prod and echoes the appropriate URL.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Create the script','sudo vim /opt/scripts/deploy.sh'],
     ['Script content','#!/bin/bash\\nif [ "$1" == "prod" ]; then\\n  echo https://prod.stratos.xfusioncorp.com\\nelif [ "$1" == "staging" ]; then\\n  echo https://staging.stratos.xfusioncorp.com\\nelse\\n  echo https://dev.stratos.xfusioncorp.com\\nfi'],
     ['Make executable','sudo chmod +x /opt/scripts/deploy.sh'],
     ['Test all three envs','/opt/scripts/deploy.sh prod && /opt/scripts/deploy.sh staging && /opt/scripts/deploy.sh dev']],
    'https://prod.stratos.xfusioncorp.com | https://staging... | https://dev...') },

  { n:56, lv:4, title:'Install and Configure DB Server', detail: TT(
    "A Nautilus microservice needs its own MySQL database with a dedicated user on the DB Server.",
    'Install MySQL 8 on stdb01, create database sessions_db with user session_user accessible from any host.',
    [['SSH to DB Server','ssh peter@stdb01'],
     ['Install MySQL server','sudo dnf install -y mysql-server'],
     ['Enable and start','sudo systemctl enable --now mysqld'],
     ['Secure the installation','sudo mysql_secure_installation'],
     ['Create DB and remote user',"sudo mysql -e \"CREATE DATABASE sessions_db; CREATE USER 'session_user'@'%' IDENTIFIED BY 'Session@123'; GRANT ALL ON sessions_db.* TO 'session_user'@'%'; FLUSH PRIVILEGES;\""],
     ['Verify remote access','mysql -u session_user -pSession@123 -h stdb01 sessions_db -e \'status\'']],
    'sessions_db accessible by session_user from any host') },

  { n:57, lv:4, title:'Install and Configure Web Application', detail: TT(
    "For the Nautilus project, the xFusionCorp portal needs deploying on App Server 2 with a VirtualHost on port 8080.",
    'Install Apache + PHP, deploy the app, and configure a VirtualHost on port 8080.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Install Apache and PHP','sudo dnf install -y httpd php php-mysqlnd'],
     ['Create VirtualHost config','sudo vim /etc/httpd/conf.d/portal.conf  =>  <VirtualHost *:8080> DocumentRoot /var/www/portal </VirtualHost>'],
     ['Deploy application files','sudo unzip /tmp/portal.zip -d /var/www/portal && sudo chown -R apache:apache /var/www/portal'],
     ['Enable and start Apache','sudo systemctl enable --now httpd'],
     ['Test on port 8080','curl http://localhost:8080 | head -5']],
    'xFusionCorp portal HTML response on port 8080') },

  { n:58, lv:4, title:'Install and Configure PHP-FPM', detail: TT(
    "For the Nautilus project, pHP-FPM as a separate process manager improves performance and isolation over mod_php.",
    'Install PHP-FPM on App Server 1, configure for apache user, and connect to Apache via proxy.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Install PHP-FPM','sudo dnf install -y php-fpm'],
     ['Configure pool user',"sudo sed -i 's/^user = .*/user = apache/' /etc/php-fpm.d/www.conf && sudo sed -i 's/^group = .*/group = apache/' /etc/php-fpm.d/www.conf"],
     ['Enable and start PHP-FPM','sudo systemctl enable --now php-fpm'],
     ['Configure Apache proxy','sudo vim /etc/httpd/conf.d/php-fpm.conf  =>  ProxyPassMatch ^/(.*\\.php)$ fcgi://127.0.0.1:9000/var/www/html/$1'],
     ['Test configuration','php-fpm -t && sudo systemctl reload httpd']],
    'NOTICE: configuration file test is successful') },

  { n:59, lv:4, title:'Configure Nginx + PHP-FPM Using Unix Sock', detail: TT(
    "Nautilus production setup needs Nginx communicating with PHP-FPM via Unix socket for minimum latency.",
    'Configure Nginx and PHP-FPM to communicate via Unix socket /run/php-fpm/www.sock on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Install Nginx and PHP-FPM','sudo dnf install -y nginx php php-fpm'],
     ['Set PHP-FPM to use socket',"sudo sed -i 's|listen = .*|listen = /run/php-fpm/www.sock|' /etc/php-fpm.d/www.conf"],
     ['Set socket ownership',"sudo sed -i 's/;listen.owner = .*/listen.owner = nginx/' /etc/php-fpm.d/www.conf"],
     ['Configure Nginx fastcgi_pass','sudo vim /etc/nginx/conf.d/php.conf  =>  fastcgi_pass unix:/run/php-fpm/www.sock'],
     ['Start services and verify','sudo systemctl enable --now php-fpm nginx && ls -la /run/php-fpm/www.sock']],
    'srw-rw---- 1 nginx nginx /run/php-fpm/www.sock') },
];

// ── JENKINS TASKS ─────────────────────────────────────────────────────────────
const JENKINS_TASKS: TrackTask[] = [
  // Level 1
  { n:1, lv:1, title:'Set Up Jenkins Server', detail: TT(
    "For the Nautilus project, the CI/CD team needs Jenkins LTS installed and running on the jump host for pipeline management.",
    'Install Jenkins on the jump host, start it on port 8080, and retrieve the initial admin password.',
    [['Install Java 17 prerequisite','sudo dnf install -y java-17-openjdk'],
     ['Add Jenkins stable repo','sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo && sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key'],
     ['Install Jenkins LTS','sudo dnf install -y jenkins'],
     ['Enable and start service','sudo systemctl enable --now jenkins'],
     ['Retrieve admin password','sudo cat /var/lib/jenkins/secrets/initialAdminPassword'],
     ['Access setup wizard','Navigate to http://localhost:8080 and complete initial setup']],
    'Jenkins login page accessible | initialAdminPassword retrieved') },

  { n:2, lv:1, title:'Install Jenkins Plugins', detail: TT(
    "For the Nautilus project, the build pipeline requires Git, Maven, Pipeline, and Blue Ocean plugins for full CI functionality.",
    'Install Git, Maven Integration, Pipeline, and Blue Ocean plugins via Jenkins CLI.',
    [['Download Jenkins CLI','curl -O http://localhost:8080/jnlpJars/jenkins-cli.jar'],
     ['Install required plugins','java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:<pass> install-plugin git maven-plugin workflow-aggregator blueocean'],
     ['Safe restart Jenkins','java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:<pass> safe-restart'],
     ['Verify plugins installed','java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:<pass> list-plugins | grep -E \'git|maven|workflow|blueocean\'']],
    'git 5.x | maven-plugin 3.x | workflow-aggregator 2.x | blueocean 1.x') },

  { n:3, lv:1, title:'Configure Jenkins User Access', detail: TT(
    "The Nautilus team is integrating Jenkins into their CI/CD pipelines. After setting up a new Jenkins server, they're now configuring user access for the development team.",
    'Create user siva and use Project-based Matrix Authorization to grant overall read permissions while securing anonymous access.',
    [['Login to Jenkins','Login to the Jenkins UI with username admin and password Adm!n321'],
     ['Create user siva','Manage Jenkins => Users => Create User => siva (Full name: Siva) / ksH85UJjhb'],
     ['Configure authorization','Configure Global Security => Authorization => Project-based Matrix Authorization Strategy'],
     ['Set user permissions','Add siva row => check Overall/Read; ensure admin has Administer; remove Anonymous permissions'],
     ['Set job permissions','For the existing job, grant siva user only read permissions, disregarding Agent, SCM etc.']],
    'siva can login | has read-only access to existing job | anonymous access removed') },

  { n:4, lv:1, title:'Organize Jenkins Jobs with Folders', detail: TT(
    "For the Nautilus project, multiple team jobs need organizing into logical folders for easier navigation and access control.",
    'Create folder DevOps-Team in Jenkins and move the build-app job into it.',
    [['Install Folders plugin','Manage Jenkins => Plugin Manager => install cloudbees-folder'],
     ['Create folder','New Item => DevOps-Team => Folder => OK'],
     ['Copy job into folder','Inside DevOps-Team => New Item => build-app => Copy from: build-app'],
     ['Delete original job','Jenkins Dashboard => build-app => Delete Project'],
     ['Verify job path','Navigate to DevOps-Team/build-app and confirm it works']],
    'Job accessible at DevOps-Team/build-app path') },

  { n:5, lv:1, title:'Configure Jenkins Job for Package Installation', detail: TT(
    'Some new requirements have come up to install and configure some packages on the Nautilus infrastructure under Stratos Datacenter. The Nautilus DevOps team installed and configured a new Jenkins server so they wanted to create a Jenkins job to automate this task. Find below more details and complete the task accordingly:\n1. Access the Jenkins UI by clicking on the Jenkins button in the top bar. Log in using the credentials: username admin and password Adm!n321.\n2. Create a new Jenkins job named install-packages and configure it with the following specifications:\nAdd a string parameter named PACKAGE.\nConfigure the job to install a package specified in the $PACKAGE parameter on the storage server (Stratos Datacenter).\nBuild the job at least once  (e.g. with parameter PACKAGE=vim-enhanced) so the package is installed on the Storage server and can be verified.',
    'Create a parameterized Jenkins job named install-packages to install a specified package on the storage server.',
    [['Login to Jenkins','Access Jenkins UI and login with admin / Adm!n321'],
     ['Create parameterized job','New Item => install-packages => Freestyle project => OK'],
     ['Add Parameter','Check "This project is parameterized" => Add Parameter => String Parameter => Name: PACKAGE'],
     ['Configure build step','Add build step => Execute shell => ssh natasha@ststor01 "sudo yum install -y $PACKAGE"'],
     ['Save and build','Save => Build with Parameters => PACKAGE=vim-enhanced => Build'],
     ['Verify success','Console Output must show successful installation on the storage server']],
    'Package installed on storage server | Build Success') },

  // Level 2
  { n:6, lv:2, title:'Jenkins Views', detail: TT(
    "For the Nautilus project, different teams need tailored views of Jenkins jobs to avoid noise from unrelated projects.",
    'Create a List View named DevOps-View that shows only jobs inside the DevOps-Team folder.',
    [['Open Jenkins dashboard','Jenkins Home => click + tab to add new view'],
     ['Create List View','Name: DevOps-View => List View => OK'],
     ['Configure job filter','Job Filter => select jobs matching DevOps-Team/*'],
     ['Save and verify','Save => confirm only DevOps-Team jobs appear in the view'],
     ['Test view isolation','Switch between views to confirm correct job visibility']],
    'DevOps-View shows only DevOps-Team folder jobs') },

  { n:7, lv:2, title:'Jenkins Parameterized Builds', detail: TT(
    "For the Nautilus project, builds must support deploying to different environments selected at trigger time via parameters.",
    'Add DEPLOY_ENV and APP_VERSION string parameters to build-app and log them in the build.',
    [['Open build-app configuration','Jenkins => build-app => Configure'],
     ['Enable parameterized build','This build is parameterized => Add Parameter => String'],
     ['Add DEPLOY_ENV parameter','Name: DEPLOY_ENV, Default: dev, Description: Target environment'],
     ['Add APP_VERSION parameter','Name: APP_VERSION, Default: 1.0.0'],
     ['Add echo to build step','Execute Shell: echo "Deploying v$APP_VERSION to $DEPLOY_ENV"'],
     ['Test with parameters','Build with Parameters => DEPLOY_ENV=staging APP_VERSION=2.1.0']],
    'Console: Deploying v2.1.0 to staging') },

  { n:8, lv:2, title:'Jenkins Workspaces', detail: TT(
    "For the Nautilus project, stale build artifacts from previous builds are causing false failures on the current build.",
    'Configure build-app to use a custom workspace and wipe it before each build.',
    [['Open build-app configuration','Jenkins => build-app => Configure => Advanced'],
     ['Set custom workspace','Use custom workspace: /opt/jenkins-ws/build-app'],
     ['Enable workspace wipe','Before build starts => Delete workspace before build starts'],
     ['Save configuration','Save'],
     ['Trigger a build','Build Now => verify Console shows custom workspace path'],
     ['Check workspace directory','ls /opt/jenkins-ws/build-app after build completes']],
    'Build uses /opt/jenkins-ws/build-app | workspace freshly wiped before each run') },

  { n:9, lv:2, title:'Jenkins Database Backup Job', detail: TT(
    "For the Nautilus project, mySQL database backups must run automatically via Jenkins on a nightly schedule.",
    'Create job db-backup that runs mysqldump for apps_db to /tmp/jenkins-backups/ timestamped.',
    [['Create Freestyle job','New Item => db-backup => Freestyle project'],
     ['Add Execute Shell step','mkdir -p /tmp/jenkins-backups && mysqldump -u root apps_db > /tmp/jenkins-backups/backup_$(date +%F_%H%M).sql'],
     ['Schedule nightly','Build Triggers => Build periodically: 0 2 * * *'],
     ['Save and test manually','Save => Build Now'],
     ['Verify backup created','ls -lh /tmp/jenkins-backups/backup_*.sql']],
    'backup_2024-xx-xx_xxxx.sql created in /tmp/jenkins-backups/') },

  { n:10, lv:2, title:'Jenkins Scheduled Jobs', detail: TT(
    "For the Nautilus project, a weekly summary report must generate automatically every Monday morning.",
    'Create job weekly-report that runs every Monday at 8 AM and prints build metadata.',
    [['Create Freestyle job','New Item => weekly-report => Freestyle project'],
     ['Add Execute Shell step','Execute Shell: echo "Weekly report #$BUILD_NUMBER generated on $(date)"'],
     ['Set schedule trigger','Build Triggers => Build periodically: H 8 * * 1'],
     ['Save configuration','Save'],
     ['Verify next run shown','Job page shows Next scheduled run at Monday 8:00 AM'],
     ['Trigger manually to test','Build Now => verify output in Console']],
    'Weekly report #1 generated on Mon ... (next run scheduled Monday 08:00)') },

  // Level 3
  { n:11, lv:3, title:'Jenkins Slave Nodes', detail: TT(
    "For the Nautilus project, build workloads need distributing across App Servers to reduce queue time and isolate jobs.",
    'Add stapp01 and stapp02 as Jenkins SSH agent nodes each with 2 executors.',
    [['Go to Manage Nodes','Manage Jenkins => Nodes => New Node'],
     ['Configure stapp01-agent','Name: stapp01-agent | Remote root: /home/tony/jenkins | Launch via SSH: stapp01 | Credentials: tony | 2 executors'],
     ['Add stapp02-agent','Repeat: stapp02-agent => stapp02 => steve credentials => 2 executors'],
     ['Launch both agents','Save each => Launch Agent => wait for Connected status'],
     ['Verify agents online','Nodes dashboard shows both agents Connected with 2 executors each']],
    'stapp01-agent Connected 2/2 | stapp02-agent Connected 2/2') },

  { n:12, lv:3, title:'Jenkins Project Security', detail: TT(
    "Nautilus production jobs need tight access control so only admins can trigger builds, not all users.",
    'Enable per-project security on db-backup: admin gets all rights, sarah gets view-only.',
    [['Open db-backup configuration','Jenkins => db-backup => Configure'],
     ['Enable project-based security','Enable project-based Build Authorization'],
     ['Grant admin full access','Add admin => check all permission boxes'],
     ['Grant sarah view only','Add sarah => check Job/Read only'],
     ['Save and verify','Login as sarah => can view db-backup but Build Now is disabled']],
    'Admin: full control | sarah: view only, Build Now disabled') },

  { n:13, lv:3, title:'Jenkins Build Images', detail: TT(
    "For the Nautilus project, docker images must be built and pushed to Docker Hub as part of the CI pipeline.",
    'Create Pipeline job build-docker-image that builds and pushes nayagk/currency-conversion:BUILD_NUMBER.',
    [['Create Pipeline job','New Item => build-docker-image => Pipeline'],
     ['Add DockerHub credentials','Manage Jenkins => Credentials => dockerhub-creds (username nayagk + password)'],
     ['Write Jenkinsfile',"pipeline { agent any stages { stage('Build') { steps { sh 'docker build -t nayagk/currency-conversion:${BUILD_NUMBER} .' } } stage('Push') { steps { withCredentials([usernamePassword(credentialsId:'dockerhub-creds', usernameVariable:'USER', passwordVariable:'PASS')]) { sh 'docker login -u $USER -p $PASS && docker push nayagk/currency-conversion:${BUILD_NUMBER}' } } } } }"],
     ['Build and verify','Build Now => verify nayagk/currency-conversion:<build-number> on Docker Hub']],
    'nayagk/currency-conversion:<build-number> pushed to Docker Hub') },

  { n:14, lv:3, title:'Jenkins Deploy Pipeline', detail: TT(
    "For the Nautilus project, the full CI/CD pipeline must automate: checkout, build, test, Docker build, and deploy to stapp03.",
    'Create 5-stage Declarative Pipeline covering Checkout, Build, Test, Docker, and Deploy.',
    [['Create Pipeline job','New Item => deploy-pipeline => Pipeline'],
     ['Add required credentials','DockerHub creds + SSH key for banner@stapp03'],
     ['Write 5-stage Jenkinsfile','stages: Checkout (git) => Build (mvn package) => Test (mvn test) => Docker (build+push) => Deploy (sshagent: docker run on stapp03)'],
     ['Build and monitor','Build Now => watch Stage View for all 5 stages'],
     ['Verify deployment','ssh banner@stapp03 docker ps | grep currency-conversion']],
    'All 5 stages green | container running on stapp03') },

  { n:15, lv:3, title:'Jenkins Conditional Pipeline', detail: TT(
    "For the Nautilus project, deploy stage must only execute for main branch builds — feature branch builds skip it entirely.",
    "Add when { branch 'main' } to the Deploy stage and verify it skips on feature branches.",
    [['Edit Jenkinsfile','vim Jenkinsfile'],
     ['Add when condition',"stage('Deploy') { when { branch 'main' } steps { ... } }"],
     ['Commit and push',"git add Jenkinsfile && git commit -m 'JIRA-315: add conditional deploy' && git push"],
     ['Build on feature branch','Trigger build on feature/test => Deploy stage shows as Skipped'],
     ['Build on main','Trigger build on main => Deploy stage executes normally']],
    'Deploy: SKIPPED on feature/* | Deploy: SUCCESS on main') },

  // Level 4
  { n:16, lv:4, title:'Jenkins Deployment Job', detail: TT(
    "Nautilus production deployment requires SSHing to App Server 3 and running the latest Docker container.",
    'Create Pipeline job prod-deploy that pulls and runs nayagk/currency-conversion:latest on stapp03.',
    [['Create Pipeline job','New Item => prod-deploy => Pipeline'],
     ['Add banner SSH credentials','Manage Jenkins => Credentials => SSH Username banner with private key'],
     ['Write deployment Jenkinsfile',"pipeline { agent any stages { stage('Deploy') { steps { sshagent(['banner-key']) { sh 'ssh banner@stapp03 \"docker pull nayagk/currency-conversion:latest && docker stop app || true && docker run -d --name app -p 8080:8080 nayagk/currency-conversion:latest\"' } } } } }"],
     ['Build and verify','Build Now => Console shows SSH commands'],
     ['Confirm on stapp03','ssh banner@stapp03 docker ps | grep currency-conversion']],
    'Container currency-conversion:latest running on stapp03 port 8080') },

  { n:17, lv:4, title:'Jenkins Chained Builds', detail: TT(
    "For the Nautilus project, the full pipeline chain build-app => run-tests => db-backup must execute sequentially and automatically.",
    'Configure build-app to trigger run-tests on success, and run-tests to trigger db-backup on success.',
    [['Configure build-app post-build','build-app => Configure => Post-build Actions => Build other projects: run-tests (on stable)'],
     ['Configure run-tests post-build','run-tests => Configure => Post-build Actions => Build other projects: db-backup (on stable)'],
     ['Save both configurations','Save each job'],
     ['Trigger the chain','Build Now on build-app'],
     ['Verify cascade','All three jobs complete in sequence: build-app => run-tests => db-backup']],
    'build-app => run-tests => db-backup all green in sequence') },

  { n:18, lv:4, title:'Jenkins MR Jobs', detail: TT(
    "For the Nautilus project, merge requests on Gitea should automatically trigger Jenkins builds for pre-merge validation.",
    'Configure build-app to auto-trigger on Gitea pull request creation using the Gitea plugin.',
    [['Install Gitea plugin','Manage Jenkins => Plugin Manager => install gitea'],
     ['Configure Gitea server','Manage Jenkins => Configure System => Gitea Servers => add http://git.stratos.xfusioncorp.com'],
     ['Enable webhook trigger on job','build-app => Configure => Build Triggers => Gitea Webhook'],
     ['Add webhook in Gitea repo','Gitea repo => Settings => Webhooks => add Jenkins URL/gitea-webhook/post'],
     ['Create a test PR','Create PR in Gitea repo'],
     ['Verify auto-trigger','build-app triggers automatically when PR is opened']],
    'New PR in Gitea triggers build-app job automatically') },

  { n:19, lv:4, title:'Jenkins Multistage Pipeline', detail: TT(
    "For the Nautilus project, the software delivery lifecycle needs all quality gates: Lint, Test, Build, Docker, and Deploy.",
    'Create 5-stage multistage Declarative Pipeline with quality gates at every stage.',
    [['Create Pipeline job','New Item => multistage-pipeline => Pipeline'],
     ['Stage 1: Lint',"stage('Lint') { steps { sh 'mvn checkstyle:check' } }"],
     ['Stage 2: Test',"stage('Test') { steps { sh 'mvn test' } post { always { junit 'target/surefire-reports/*.xml' } } }"],
     ['Stage 3: Build',"stage('Build') { steps { sh 'mvn package -DskipTests' } }"],
     ['Stage 4: Docker',"stage('Docker') { steps { sh 'docker build -t nayagk/currency-conversion:$BUILD_NUMBER . && docker push nayagk/currency-conversion:$BUILD_NUMBER' } }"],
     ['Stage 5: Deploy',"stage('Deploy') { when { branch 'main' } steps { sshagent(['banner-key']) { sh 'ssh banner@stapp03 docker run -d nayagk/currency-conversion:$BUILD_NUMBER' } } }"]],
    'All 5 stages green in Stage View | build artifact + Docker image created') },

  { n:20, lv:4, title:'Jenkins Setup Node App', detail: TT(
    "For the Nautilus project, the Node.js frontend has its own CI requirements: npm install, npm test, and Docker build.",
    'Create Pipeline job node-app-ci with Node 18, running npm install, npm test, and Docker build.',
    [['Configure Node.js tool','Manage Jenkins => Global Tool Configuration => NodeJS => Add NodeJS 18'],
     ['Create Pipeline job','New Item => node-app-ci => Pipeline'],
     ['Write Node.js Jenkinsfile',"pipeline { agent any tools { nodejs 'NodeJS-18' } stages { stage('Install') { steps { sh 'npm install' } } stage('Test') { steps { sh 'npm test' } } stage('Docker') { steps { sh 'docker build -t nayagk/node-app:$BUILD_NUMBER .' } } } }"],
     ['Build and verify','Build Now => verify npm install, npm test, docker build all succeed'],
     ['Check Docker Hub','Confirm nayagk/node-app:<build-number> is pushed']],
    'npm install success | npm test passes | nayagk/node-app:<build-number> built') },
];

// ── DOCKER TASKS ─────────────────────────────────────────────────────────────
const DOCKER_TASKS: TrackTask[] = [
  // Level 1
  { n:1, lv:1, title:'Install Docker Packages and Start Docker Service', detail: TT(
    "For the Nautilus project, xFusionCorp is adopting containers and needs Docker installed on App Server 1.",
    'Install Docker on App Server 1, start and enable the service, add tony to the docker group.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Install Docker','sudo dnf install -y docker'],
     ['Enable and start Docker','sudo systemctl enable --now docker'],
     ['Add tony to docker group','sudo usermod -aG docker tony'],
     ['Verify installation','docker --version && docker run hello-world']],
    'Docker version x.x.x | Hello from Docker!') },

  { n:2, lv:1, title:'Deploy Nginx Container on Application Server', detail: TT(
    "For the Nautilus project, the web team needs an Nginx container for a quick static site deployment.",
    'Run an Nginx container named nginx_app mapped to host port 80 on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Pull Nginx image','docker pull nginx:latest'],
     ['Run detached container','docker run -d --name nginx_app -p 80:80 nginx:latest'],
     ['Verify it is running','docker ps | grep nginx_app'],
     ['Test HTTP response','curl -s http://localhost | grep -i nginx']],
    'nginx_app  Up x minutes  0.0.0.0:80->80/tcp') },

  { n:3, lv:1, title:'Delete Docker Container', detail: TT(
    "For the Nautilus project, a test container named test_app is no longer needed and must be cleaned up.",
    'Stop and remove the running container test_app on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['List running containers','docker ps | grep test_app'],
     ['Stop the container','docker stop test_app'],
     ['Remove the container','docker rm test_app'],
     ['Verify removal','docker ps -a | grep test_app  =>  should return nothing']],
    'test_app no longer listed in docker ps -a') },

  { n:4, lv:1, title:'Copy File to Docker Container', detail: TT(
    "For the Nautilus project, a custom config file needs injecting into a running Nginx container without rebuilding the image.",
    'Copy /tmp/index.html from the host into /usr/share/nginx/html/ inside nginx_app.',
    [['Verify container is running','docker ps | grep nginx_app'],
     ['Copy file into container','docker cp /tmp/index.html nginx_app:/usr/share/nginx/html/index.html'],
     ['Verify inside container','docker exec nginx_app cat /usr/share/nginx/html/index.html'],
     ['Test response via curl','curl -s http://localhost']],
    'Custom index.html content served by Nginx') },

  { n:5, lv:1, title:'Troubleshoot Docker Container Issue', detail: TT(
    "For the Nautilus project, a container named web_app is repeatedly crashing with a non-zero exit code.",
    'Investigate why web_app is crashing and fix the underlying issue.',
    [['Check container status','docker ps -a | grep web_app'],
     ['View crash logs','docker logs web_app --tail 30'],
     ['Inspect container config','docker inspect web_app | grep -A5 Env'],
     ['Identify the problem','Missing env var, wrong image command, or port conflict'],
     ['Fix and restart','docker rm web_app && docker run -d --name web_app <corrected flags> <image>'],
     ['Verify running','docker ps | grep web_app']],
    'web_app running without restarts') },

  // Level 2
  { n:6, lv:2, title:'Pull Docker Image', detail: TT(
    "For the Nautilus project, specific Ubuntu image versions need to be available locally for consistent test environments.",
    'Pull ubuntu:20.04 and ubuntu:22.04 images on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Pull ubuntu 20.04','docker pull ubuntu:20.04'],
     ['Pull ubuntu 22.04','docker pull ubuntu:22.04'],
     ['List pulled images','docker images | grep ubuntu']],
    'ubuntu  20.04  <id> | ubuntu  22.04  <id>') },

  { n:7, lv:2, title:'Docker Update Permissions', detail: TT(
    "Nautilus developer mark needs to run Docker commands without sudo on App Server 1.",
    'Add user mark to the docker group on App Server 1 so they can run Docker without sudo.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Add mark to docker group','sudo usermod -aG docker mark'],
     ['Apply group change','newgrp docker  (or mark must re-login)'],
     ['Verify group membership','id mark | grep docker'],
     ['Test as mark','sudo -u mark docker ps']],
    'mark can run docker ps without sudo') },

  { n:8, lv:2, title:'Create a Docker Image From Container', detail: TT(
    "For the Nautilus project, a running container with custom software needs saving as a reusable image for the team.",
    'Commit the nginx_app running container as image custom_nginx:v1.',
    [['Make a change inside the container','docker exec nginx_app bash -c \'echo xFusionCorp > /opt/info.txt\''],
     ['Commit container to new image','docker commit nginx_app custom_nginx:v1'],
     ['Verify image created','docker images | grep custom_nginx'],
     ['Test the new image','docker run --rm custom_nginx:v1 cat /opt/info.txt']],
    'custom_nginx  v1  <id> | xFusionCorp (from test run)') },

  { n:9, lv:2, title:'Docker EXEC Operations', detail: TT(
    "The Nautilus ops team must perform in-container maintenance without restarting the container.",
    'Inside the running nginx_app container, create /opt/data.txt with content xFusionCorp.',
    [['Check container is running','docker ps | grep nginx_app'],
     ['Create file inside container','docker exec nginx_app bash -c \'echo xFusionCorp > /opt/data.txt\''],
     ['Verify file content','docker exec nginx_app cat /opt/data.txt'],
     ['Check as interactive shell','docker exec -it nginx_app bash']],
    'xFusionCorp') },

  { n:10, lv:2, title:'Write a Docker File', detail: TT(
    "The Nautilus dev team needs a repeatable Docker image build for their Python Flask application.",
    'Write a Dockerfile that builds from python:3.9-slim, installs Flask, and runs app.py on port 5000.',
    [['Create project directory','mkdir flask-app && cd flask-app'],
     ['Write requirements.txt','echo flask > requirements.txt'],
     ['Write Dockerfile','FROM python:3.9-slim | WORKDIR /app | COPY . . | RUN pip install -r requirements.txt | EXPOSE 5000 | CMD python app.py'],
     ['Build the image','docker build -t flask-app:v1 .'],
     ['Run and test','docker run -d -p 5000:5000 flask-app:v1 && curl http://localhost:5000']],
    'Flask app responding on port 5000') },

  // Level 3
  { n:11, lv:3, title:'Create a Docker Network', detail: TT(
    "For the Nautilus project, containers need isolated network communication without exposing internal ports to the host.",
    'Create custom bridge network xfusion_net and run two containers connected to it.',
    [['Create custom bridge network','docker network create --driver bridge xfusion_net'],
     ['Run container 1 on the network','docker run -d --name app1 --network xfusion_net nginx:alpine'],
     ['Run container 2 on the network','docker run -d --name app2 --network xfusion_net nginx:alpine'],
     ['Test inter-container ping','docker exec app1 ping -c 2 app2'],
     ['Inspect network','docker network inspect xfusion_net']],
    '2 packets transmitted, 2 received — ping via hostname succeeds') },

  { n:12, lv:3, title:'Docker Volumes Mapping', detail: TT(
    "For the Nautilus project, database containers must persist data across restarts using named Docker volumes.",
    'Run a MySQL container with a named volume mysql_data mounted at /var/lib/mysql.',
    [['Create named volume','docker volume create mysql_data'],
     ['Run MySQL with volume','docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root -v mysql_data:/var/lib/mysql -p 3306:3306 mysql:8.0'],
     ['Verify data persists','docker exec mysql mysql -uroot -proot -e \'SHOW DATABASES;\''],
     ['Stop and remove container','docker stop mysql && docker rm mysql'],
     ['Start new container with same volume','docker run -d --name mysql2 -e MYSQL_ROOT_PASSWORD=root -v mysql_data:/var/lib/mysql mysql:8.0'],
     ['Verify data still present','docker exec mysql2 mysql -uroot -proot -e \'SHOW DATABASES;\'']],
    'Databases visible after container replacement — data survived') },

  { n:13, lv:3, title:'Docker Ports Mapping', detail: TT(
    "The Nautilus application needs specific host-to-container port mappings for multiple service endpoints.",
    'Run an httpd container mapping host port 8080 to container port 80, and 8443 to 443.',
    [['Run httpd with port mappings','docker run -d --name web_server -p 8080:80 -p 8443:443 httpd:latest'],
     ['Verify port mappings','docker port web_server'],
     ['Test port 8080','curl -s http://localhost:8080 | head -3'],
     ['List running container','docker ps | grep web_server']],
    '80/tcp -> 0.0.0.0:8080 | 443/tcp -> 0.0.0.0:8443') },

  { n:14, lv:3, title:'Save, Load and Transfer Docker Image', detail: TT(
    "For the Nautilus project, a custom image built on one server needs transferring to another server without a registry.",
    'Save custom_nginx:v1 as a .tar archive, copy it to App Server 2, and load it there.',
    [['Save image to tar','docker save custom_nginx:v1 -o /tmp/custom_nginx_v1.tar'],
     ['Copy tar to App Server 2','scp /tmp/custom_nginx_v1.tar steve@stapp02:/tmp/'],
     ['Load image on App Server 2','ssh steve@stapp02 docker load -i /tmp/custom_nginx_v1.tar'],
     ['Verify image loaded','ssh steve@stapp02 docker images | grep custom_nginx']],
    'custom_nginx:v1 present in docker images on stapp02') },

  { n:15, lv:3, title:'Write a Docker Compose File', detail: TT(
    "The Nautilus team needs a multi-container WordPress and MySQL stack defined in a single Compose file.",
    'Write a docker-compose.yml with WordPress on port 8080 and a MySQL 8 backend service.',
    [['Create docker-compose.yml','vim docker-compose.yml'],
     ['Define MySQL service','service db: image mysql:8.0, MYSQL_ROOT_PASSWORD, MYSQL_DATABASE=wordpress'],
     ['Define WordPress service','service wordpress: image wordpress:latest, port 8080:80, depends_on db, env vars for DB'],
     ['Start the stack','docker compose up -d'],
     ['Verify services running','docker compose ps'],
     ['Test WordPress','curl -s http://localhost:8080 | grep -i wordpress']],
    'wordpress Running 0.0.0.0:8080->80/tcp | db Running 3306/tcp') },

  // Level 4
  { n:16, lv:4, title:'Resolve Dockerfile Issues', detail: TT(
    "For the Nautilus project, a broken Dockerfile in the CI pipeline is failing builds and must be debugged and fixed.",
    'Fix all errors in /opt/docker/Dockerfile on App Server 3 so the image builds successfully.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Attempt build to reveal errors','cd /opt/docker && docker build -t test-image . 2>&1 | head -20'],
     ['Inspect the Dockerfile','cat Dockerfile  =>  look for typos, wrong base image, or bad syntax'],
     ['Apply fixes','vim Dockerfile'],
     ['Rebuild image','docker build -t test-image .'],
     ['Verify build success','docker images | grep test-image']],
    'test-image  latest  <id>  ... (BUILD successful)') },

  { n:17, lv:4, title:'Resolve Docker Compose Issues', detail: TT(
    "For the Nautilus project, a docker-compose.yml file is failing to bring up the stack due to configuration errors.",
    'Debug and fix the docker-compose.yml so all services start successfully.',
    [['Validate compose file','docker compose config 2>&1'],
     ['Attempt to bring up stack','docker compose up -d 2>&1 | tail -20'],
     ['Identify failing service','docker compose ps  =>  find services in Exit state'],
     ['Check service logs','docker compose logs <failing-service> --tail 30'],
     ['Fix docker-compose.yml','vim docker-compose.yml  =>  fix image tag, port, env var, or dependency'],
     ['Restart stack','docker compose down && docker compose up -d']],
    'All services in Running state  |  docker compose ps shows Up') },

  { n:18, lv:4, title:'Deploy an App on Docker Containers', detail: TT(
    "The Nautilus dev team needs a Node.js app containerized with persistent volume storage on App Server 1.",
    'Build and run nodeapp from /opt/app on port 3000 with a volume mount for data.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Build image from app dir','cd /opt/app && docker build -t nodeapp:v1 .'],
     ['Run with volume mount','docker run -d --name nodeapp -p 3000:3000 -v /opt/app/data:/app/data nodeapp:v1'],
     ['Verify it is running','docker ps | grep nodeapp'],
     ['Test the endpoint','curl http://localhost:3000']],
    'Node.js app response on port 3000') },

  { n:19, lv:4, title:'Docker Node App', detail: TT(
    "For the Nautilus project, a Node.js microservice needs containerizing with a proper multi-stage Dockerfile for production.",
    'Write a multi-stage Dockerfile for the Node.js app: build stage with dev deps, runtime with prod only.',
    [['Create multi-stage Dockerfile','FROM node:18-alpine AS builder | WORKDIR /app | COPY package*.json . | RUN npm ci | COPY . . | RUN npm run build'],
     ['Add runtime stage','FROM node:18-alpine AS runtime | WORKDIR /app | COPY --from=builder /app/dist ./dist | COPY --from=builder /app/node_modules ./node_modules | EXPOSE 3000 | CMD node dist/index.js'],
     ['Build the image','docker build -t nodeapp:prod .'],
     ['Compare sizes','docker images | grep nodeapp  =>  prod image should be smaller'],
     ['Run and test','docker run -d -p 3000:3000 nodeapp:prod && curl http://localhost:3000']],
    'nodeapp:prod running | image smaller than single-stage build') },

  { n:20, lv:4, title:'Docker Python App', detail: TT(
    "For the Nautilus project, the data team needs a Python script containerized and published to Docker Hub for portability.",
    'Containerize /opt/python-app/process.py and push image nayagk/python-app:v1 to Docker Hub.',
    [['Write Dockerfile','FROM python:3.10-alpine | WORKDIR /app | COPY process.py . | CMD python process.py'],
     ['Build the image','docker build -t nayagk/python-app:v1 .'],
     ['Test locally','docker run --rm nayagk/python-app:v1'],
     ['Log in to Docker Hub','docker login'],
     ['Push to registry','docker push nayagk/python-app:v1']],
    'Image pushed: nayagk/python-app:v1 on Docker Hub') },
];

// ── AWS TASKS ─────────────────────────────────────────────────────────────────
const AWS_TASKS: TrackTask[] = [
  // Level 1 — AWS fundamentals (Days 1–10)
  { n:1, lv:1, title:'Create Key Pair', detail: TT(
    "For the Nautilus project, eC2 instances require an SSH key pair for secure access. You need one before launching any instance.",
    'Create an EC2 key pair named xfusion-key using the AWS Console or CLI.',
    [['Open EC2 Console','AWS Console => EC2 => Key Pairs => Create key pair'],
     ['Name the key pair','Name: xfusion-key | Type: RSA | Format: .pem'],
     ['Create and download','Click Create key pair => .pem file downloads automatically'],
     ['Secure the key file','chmod 400 ~/Downloads/xfusion-key.pem'],
     ['CLI alternative','aws ec2 create-key-pair --key-name xfusion-key --query KeyMaterial --output text > xfusion-key.pem']],
    'xfusion-key visible in EC2 => Key Pairs list') },

  { n:2, lv:1, title:'Create Security Group', detail: TT(
    "For the Nautilus project, a Security Group acts as a virtual firewall controlling inbound and outbound traffic to EC2.",
    'Create Security Group web-sg allowing SSH (22) and HTTP (80) inbound from anywhere.',
    [['Open EC2 Console','AWS Console => EC2 => Security Groups => Create security group'],
     ['Set basic details','Name: web-sg | Description: Web server SG | VPC: default'],
     ['Add SSH inbound rule','Inbound: Type=SSH, Protocol=TCP, Port=22, Source=0.0.0.0/0'],
     ['Add HTTP inbound rule','Inbound: Type=HTTP, Protocol=TCP, Port=80, Source=0.0.0.0/0'],
     ['Create the SG','Click Create security group'],
     ['CLI alternative','aws ec2 create-security-group --group-name web-sg --description "Web server SG"']],
    'web-sg visible in Security Groups with SSH and HTTP inbound rules') },

  { n:3, lv:1, title:'Create Subnet', detail: TT(
    "For the Nautilus project, subnets partition a VPC into logical segments for isolating resources by tier or AZ.",
    'Create a public subnet 10.0.1.0/24 in the default VPC in us-east-1a.',
    [['Open VPC Console','AWS Console => VPC => Subnets => Create subnet'],
     ['Select VPC','Choose the default VPC'],
     ['Configure subnet','Subnet name: public-subnet-1a | AZ: us-east-1a | CIDR: 10.0.1.0/24'],
     ['Create subnet','Click Create subnet'],
     ['Enable auto-assign public IP','Select subnet => Actions => Edit subnet settings => Enable auto-assign public IPv4']],
    'public-subnet-1a visible in Subnets with CIDR 10.0.1.0/24') },

  { n:4, lv:1, title:'Enable Versioning for S3 Bucket', detail: TT(
    "For the Nautilus project, s3 versioning protects against accidental deletion by preserving all versions of every object.",
    'Create S3 bucket xfusion-assets and enable versioning on it.',
    [['Create S3 bucket','AWS Console => S3 => Create bucket => Name: xfusion-assets-<account-id> | Region: us-east-1'],
     ['Open bucket properties','Click the bucket => Properties tab'],
     ['Enable versioning','Bucket Versioning => Enable => Save changes'],
     ['CLI alternative','aws s3api put-bucket-versioning --bucket xfusion-assets-<id> --versioning-configuration Status=Enabled'],
     ['Verify','aws s3api get-bucket-versioning --bucket xfusion-assets-<id>']],
    'Status: Enabled in versioning configuration') },

  { n:5, lv:1, title:'Create GP3 Volume', detail: TT(
    "For the Nautilus project, gP3 EBS volumes offer better price-performance than GP2 for most EC2 workloads.",
    'Create a 20 GiB GP3 EBS volume in us-east-1a.',
    [['Open EC2 Console','AWS Console => EC2 => Volumes => Create volume'],
     ['Configure volume','Volume type: gp3 | Size: 20 GiB | AZ: us-east-1a'],
     ['Add name tag','Tags: Name = xfusion-data-vol'],
     ['Create volume','Click Create volume'],
     ['CLI alternative','aws ec2 create-volume --volume-type gp3 --size 20 --availability-zone us-east-1a']],
    'Volume in Available state | Type: gp3 | Size: 20 GiB') },

  { n:6, lv:1, title:'Launch EC2 Instance', detail: TT(
    "For the Nautilus project, eC2 is the core compute service; launching your first instance is the foundation of everything.",
    'Launch a t3.micro Amazon Linux 2023 instance using xfusion-key and web-sg in us-east-1a.',
    [['Open EC2 Console','AWS Console => EC2 => Instances => Launch instances'],
     ['Choose AMI','Amazon Linux 2023 AMI (free tier)'],
     ['Choose instance type','t3.micro'],
     ['Configure key pair','Key pair: xfusion-key'],
     ['Configure security group','Select existing: web-sg'],
     ['Launch instance','Click Launch instance => note instance ID'],
     ['Wait for running state','Instance state = Running | Status checks = 2/2 passed']],
    'EC2 instance Running | 2/2 status checks passed') },

  { n:7, lv:1, title:'Change EC2 Instance Type', detail: TT(
    "For the Nautilus project, workload growth requires upgrading an EC2 instance type for more CPU and memory.",
    'Change the running instance from t3.micro to t3.small.',
    [['Stop the instance','EC2 Console => select instance => Instance state => Stop'],
     ['Wait for stopped state','Instance state = Stopped'],
     ['Change instance type','Actions => Instance settings => Change instance type => t3.small'],
     ['Start the instance','Instance state => Start'],
     ['Verify new type','Instance details shows Instance type: t3.small'],
     ['CLI alternative','aws ec2 modify-instance-attribute --instance-id <id> --instance-type t3.small']],
    'Instance type: t3.small | Instance Running') },

  { n:8, lv:1, title:'Enable Stop Protection for EC2 Instance', detail: TT(
    "For the Nautilus project, stop protection prevents accidental stopping of critical production instances.",
    'Enable stop protection on the running EC2 instance.',
    [['Select the instance','EC2 Console => Instances => select your instance'],
     ['Open instance settings','Actions => Instance settings => Change stop protection'],
     ['Enable protection','Check Enable => Save'],
     ['Verify protection','Try Instance state => Stop => should show error or be grayed out'],
     ['CLI alternative','aws ec2 modify-instance-attribute --instance-id <id> --disable-api-stop']],
    'Stop protection enabled | Stop action blocked') },

  { n:9, lv:1, title:'Enable Termination Protection for EC2 Instance', detail: TT(
    "For the Nautilus project, termination protection prevents accidental permanent deletion of an EC2 instance.",
    'Enable termination protection on the running EC2 instance.',
    [['Select the instance','EC2 Console => Instances => select your instance'],
     ['Open instance settings','Actions => Instance settings => Change termination protection'],
     ['Enable protection','Check Enable => Save'],
     ['Verify','Try Terminate instance => should show error'],
     ['CLI alternative','aws ec2 modify-instance-attribute --instance-id <id> --disable-api-termination']],
    'Termination protection enabled | Terminate action blocked') },

  { n:10, lv:1, title:'Attach Elastic IP to EC2 Instance', detail: TT(
    "For the Nautilus project, elastic IPs provide a static public IP address that persists across instance stop/start cycles.",
    'Allocate an Elastic IP and attach it to the running EC2 instance.',
    [['Allocate Elastic IP','EC2 Console => Elastic IPs => Allocate Elastic IP address => Allocate'],
     ['Note the EIP address','Copy the allocated public IP address'],
     ['Associate with instance','Actions => Associate Elastic IP address => Instance: select your instance => Associate'],
     ['Verify association','EC2 instance details shows Elastic IP address'],
     ['CLI allocate','aws ec2 allocate-address --domain vpc'],
     ['CLI associate','aws ec2 associate-address --instance-id <id> --allocation-id <eip-alloc-id>']],
    'Instance shows Elastic IP | SSH using EIP works after stop/start') },

  // Level 2 — Networking & storage (Days 11–20)
  { n:11, lv:2, title:'Attach Elastic Network Interface to EC2 Instance', detail: TT(
    "For the Nautilus project, eNIs enable multiple network interfaces on one instance for network isolation or dual-homing.",
    'Create a secondary ENI in the same subnet and attach it to the running EC2 instance.',
    [['Create ENI','EC2 Console => Network Interfaces => Create network interface => select subnet and web-sg'],
     ['Note ENI ID','Copy the eni-xxxxxxxx ID'],
     ['Attach to instance','Select ENI => Actions => Attach => select instance => Attach'],
     ['Verify inside instance','SSH to instance => ip addr show => should see eth1'],
     ['CLI create','aws ec2 create-network-interface --subnet-id <subnet-id> --groups <sg-id>'],
     ['CLI attach','aws ec2 attach-network-interface --network-interface-id <eni-id> --instance-id <id> --device-index 1']],
    'eth1 visible in ip addr show inside the instance') },

  { n:12, lv:2, title:'Attach Volume to EC2 Instance', detail: TT(
    "For the Nautilus project, eBS volumes provide persistent block storage that can be attached and detached from instances.",
    'Attach the 20 GiB GP3 volume to the running EC2 instance and mount it at /data.',
    [['Attach in console','EC2 => Volumes => select xfusion-data-vol => Actions => Attach volume => select instance => /dev/sdf'],
     ['SSH to instance','ssh -i xfusion-key.pem ec2-user@<public-ip>'],
     ['List block devices','lsblk  =>  should show xvdf or nvme1n1'],
     ['Format the volume','sudo mkfs -t xfs /dev/xvdf'],
     ['Mount the volume','sudo mkdir /data && sudo mount /dev/xvdf /data'],
     ['Persist mount','echo /dev/xvdf /data xfs defaults 0 0 | sudo tee -a /etc/fstab']],
    '/data mounted | df -h shows xvdf mounted at /data') },

  { n:13, lv:2, title:'Create AMI from EC2 Instance', detail: TT(
    "For the Nautilus project, aMIs allow you to capture instance state as a reusable golden image for fast deployment.",
    'Create an AMI named xfusion-golden-ami from the configured EC2 instance.',
    [['Select the instance','EC2 => Instances => select instance'],
     ['Create image','Actions => Image and templates => Create image'],
     ['Configure AMI','Image name: xfusion-golden-ami | No reboot: check if desired'],
     ['Create','Click Create image => note AMI ID'],
     ['Wait for available state','EC2 => AMIs => status changes from pending to available'],
     ['CLI alternative','aws ec2 create-image --instance-id <id> --name xfusion-golden-ami --no-reboot']],
    'xfusion-golden-ami available in EC2 => AMIs') },

  { n:14, lv:2, title:'Terminate EC2 Instance', detail: TT(
    "For the Nautilus project, after completing work, instances must be terminated to avoid ongoing charges.",
    'Disable termination protection and terminate the EC2 instance.',
    [['Disable termination protection','EC2 => select instance => Actions => Instance settings => Change termination protection => Disable'],
     ['Terminate instance','Actions => Instance state => Terminate instance => Confirm'],
     ['Wait for terminated state','Instance state = terminated (disappears after ~1 hour)'],
     ['Release Elastic IP','EC2 => Elastic IPs => select EIP => Actions => Release Elastic IP address'],
     ['CLI terminate','aws ec2 terminate-instances --instance-ids <id>']],
    'Instance state: terminated | Elastic IP released') },

  { n:15, lv:2, title:'Create Volume Snapshot', detail: TT(
    "For the Nautilus project, eBS snapshots are point-in-time backups stored in S3, used for disaster recovery and AMIs.",
    'Create a snapshot of the 20 GiB GP3 volume with description xfusion-backup.',
    [['Open EC2 Console','EC2 => Volumes => select xfusion-data-vol'],
     ['Create snapshot','Actions => Create snapshot => Description: xfusion-backup => Create snapshot'],
     ['Monitor progress','EC2 => Snapshots => status changes from pending to completed'],
     ['CLI alternative','aws ec2 create-snapshot --volume-id <vol-id> --description xfusion-backup'],
     ['Verify','aws ec2 describe-snapshots --owner-ids self | grep xfusion-backup']],
    'Snapshot in completed state with description xfusion-backup') },

  { n:16, lv:2, title:'Create IAM User', detail: TT(
    "For the Nautilus project, iAM users provide individual identity and credentials for accessing AWS services programmatically.",
    'Create IAM user xfusion-dev with programmatic access (access key).',
    [['Open IAM Console','AWS Console => IAM => Users => Add users'],
     ['Set user details','User name: xfusion-dev | Access type: Programmatic access'],
     ['Skip permissions for now','Next: Permissions => Next: Tags => Next: Review => Create user'],
     ['Download credentials','Download the CSV with Access Key ID and Secret Access Key'],
     ['CLI alternative','aws iam create-user --user-name xfusion-dev && aws iam create-access-key --user-name xfusion-dev']],
    'xfusion-dev in IAM Users | access key created') },

  { n:17, lv:2, title:'Create IAM Group', detail: TT(
    "For the Nautilus project, iAM groups allow applying one policy to multiple users for consistent permission management.",
    'Create IAM group developers and add xfusion-dev to it.',
    [['Open IAM Console','IAM => User groups => Create group'],
     ['Name the group','Group name: developers'],
     ['Add user to group','Add users: xfusion-dev'],
     ['Create group','Create user group'],
     ['CLI alternative','aws iam create-group --group-name developers && aws iam add-user-to-group --group-name developers --user-name xfusion-dev'],
     ['Verify','aws iam get-group --group-name developers']],
    'developers group exists | xfusion-dev is a member') },

  { n:18, lv:2, title:'Create Read-Only IAM Policy for EC2 Console Access', detail: TT(
    "For the Nautilus project, least-privilege access requires a custom policy that allows only EC2 read operations.",
    'Create IAM policy ec2-readonly with ec2:Describe* actions on all resources.',
    [['Open IAM Console','IAM => Policies => Create policy'],
     ['Switch to JSON editor','Select JSON tab'],
     ['Enter policy JSON','{ "Version":"2012-10-17", "Statement":[{"Effect":"Allow","Action":["ec2:Describe*"],"Resource":"*"}] }'],
     ['Name the policy','Name: ec2-readonly | Description: Read-only EC2 access'],
     ['Create policy','Create policy'],
     ['CLI alternative','aws iam create-policy --policy-name ec2-readonly --policy-document file://ec2-readonly.json']],
    'ec2-readonly policy visible in IAM => Policies') },

  { n:19, lv:2, title:'Attach IAM Policy to IAM User', detail: TT(
    "For the Nautilus project, attaching a policy to a user grants them the permissions defined in that policy.",
    'Attach ec2-readonly policy to IAM user xfusion-dev.',
    [['Open IAM Console','IAM => Users => xfusion-dev => Permissions tab'],
     ['Add permission','Add permissions => Attach policies directly'],
     ['Select the policy','Search: ec2-readonly => check the policy => Next => Add permissions'],
     ['Verify','xfusion-dev Permissions tab shows ec2-readonly'],
     ['CLI alternative','aws iam attach-user-policy --user-name xfusion-dev --policy-arn arn:aws:iam::<account>:policy/ec2-readonly']],
    'ec2-readonly attached to xfusion-dev') },

  { n:20, lv:2, title:'Create IAM Role for EC2 with Policy Attachment', detail: TT(
    "For the Nautilus project, eC2 instance roles allow instances to call AWS APIs securely without embedding credentials.",
    'Create IAM role ec2-s3-role with EC2 trust and attach AmazonS3ReadOnlyAccess.',
    [['Open IAM Console','IAM => Roles => Create role'],
     ['Select trusted entity','AWS service => EC2 => Next'],
     ['Attach policy','Search: AmazonS3ReadOnlyAccess => select => Next'],
     ['Name and create','Role name: ec2-s3-role => Create role'],
     ['CLI create role','aws iam create-role --role-name ec2-s3-role --assume-role-policy-document file://ec2-trust.json'],
     ['CLI attach policy','aws iam attach-role-policy --role-name ec2-s3-role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess']],
    'ec2-s3-role with AmazonS3ReadOnlyAccess attached visible in IAM Roles') },

  // Level 3 — Architecture & automation (Days 21–35)
  { n:21, lv:3, title:'Setting Up an EC2 Instance with an Elastic IP for Application Hosting', detail: TT(
    "For the Nautilus project, a production web app needs a stable public IP that survives instance reboots.",
    'Launch a t3.micro EC2, attach an Elastic IP, install Nginx, and verify the public site.',
    [['Launch EC2 instance','t3.micro | Amazon Linux 2023 | web-sg | xfusion-key'],
     ['Allocate and attach EIP','EC2 => Elastic IPs => Allocate => Associate with instance'],
     ['Install Nginx','ssh ec2-user@<EIP> -i xfusion-key.pem && sudo dnf install -y nginx && sudo systemctl enable --now nginx'],
     ['Open port 80 in SG','EC2 => SG web-sg => add HTTP inbound if not present'],
     ['Verify site','curl http://<EIP>  =>  Nginx welcome page']],
    'Nginx welcome page accessible via Elastic IP') },

  { n:22, lv:3, title:'Configuring Secure SSH Access to an EC2 Instance', detail: TT(
    "Nautilus production instances need SSH locked down to specific IPs using a dedicated key and SG.",
    'Create a restricted SG allowing SSH only from your IP, launch EC2, and verify SSH access.',
    [['Get your public IP','curl https://checkip.amazonaws.com'],
     ['Create restricted SG','EC2 => SG => Create => Inbound SSH: port 22, source: <your-ip>/32'],
     ['Launch instance','t3.micro | xfusion-key | restricted-ssh-sg'],
     ['Test SSH access','ssh -i xfusion-key.pem ec2-user@<public-ip>'],
     ['Verify others blocked','From a different IP => SSH should time out']],
    'SSH succeeds from your IP | refused from any other IP') },

  { n:23, lv:3, title:'Data Migration Between S3 Buckets Using AWS CLI', detail: TT(
    "For the Nautilus project, all objects from an old bucket need migrating to a new bucket with versioning enabled.",
    'Copy all objects from xfusion-old to xfusion-new using aws s3 sync.',
    [['Create destination bucket','aws s3 mb s3://xfusion-new-<id> --region us-east-1'],
     ['Enable versioning on new','aws s3api put-bucket-versioning --bucket xfusion-new-<id> --versioning-configuration Status=Enabled'],
     ['Sync all objects','aws s3 sync s3://xfusion-old s3://xfusion-new-<id>'],
     ['Verify object count','aws s3 ls s3://xfusion-new-<id> --recursive | wc -l'],
     ['Verify specific file','aws s3 cp s3://xfusion-new-<id>/sample.txt /tmp/ && cat /tmp/sample.txt']],
    'All objects present in xfusion-new with matching count') },

  { n:24, lv:3, title:'Setting Up an Application Load Balancer for an EC2 Instance', detail: TT(
    "For the Nautilus project, an ALB distributes HTTP/HTTPS traffic across multiple EC2 targets for high availability.",
    'Create an ALB with a target group containing the EC2 instance and verify load balancing.',
    [['Create target group','EC2 => Target Groups => Create => Type: Instances | Port 80 | Protocol HTTP => register EC2'],
     ['Create ALB','EC2 => Load Balancers => Create => Application LB | internet-facing | port 80 | web-sg | select AZs'],
     ['Add listener rule','Listener port 80 => Forward to target group'],
     ['Wait for active','ALB state: active | Targets: healthy'],
     ['Test ALB DNS','curl http://<alb-dns-name>  =>  Nginx response']],
    'ALB DNS returns Nginx response | target healthy') },

  { n:25, lv:3, title:'Setting Up an EC2 Instance and CloudWatch Alarm', detail: TT(
    "For the Nautilus project, cPU alarms on EC2 enable on-call alerting when workloads spike unexpectedly.",
    'Create a CloudWatch alarm that fires when CPU > 80% for 2 consecutive 5-min periods.',
    [['Open CloudWatch Console','CloudWatch => Alarms => Create alarm'],
     ['Select metric','Select metric => EC2 => Per-Instance Metrics => CPUUtilization => select instance'],
     ['Configure conditions','Threshold: Greater than 80 | Period: 5 minutes | Evaluation periods: 2'],
     ['Configure action','Send notification to SNS topic (create new or existing)'],
     ['Name alarm','Alarm name: high-cpu-alarm => Create alarm'],
     ['CLI alternative','aws cloudwatch put-metric-alarm --alarm-name high-cpu --metric-name CPUUtilization --namespace AWS/EC2 --threshold 80 --comparison-operator GreaterThanThreshold --evaluation-periods 2 --period 300 --statistic Average']],
    'high-cpu-alarm in OK state | triggers alert above 80% CPU') },

  { n:26, lv:3, title:'Configuring an EC2 Instance as a Web Server with Nginx', detail: TT(
    "For the Nautilus project, a production web server needs Nginx serving a custom site with a virtual host config.",
    'Launch EC2, install Nginx, deploy a custom index.html, and serve it on port 80.',
    [['Launch and SSH to EC2','t3.micro | Amazon Linux 2023 | web-sg | EIP'],
     ['Install Nginx','sudo dnf install -y nginx && sudo systemctl enable --now nginx'],
     ['Deploy custom page','echo "<h1>xFusionCorp Production</h1>" | sudo tee /usr/share/nginx/html/index.html'],
     ['Verify via curl','curl http://localhost  =>  custom page HTML'],
     ['Verify via EIP','curl http://<EIP>  =>  same custom page']],
    'xFusionCorp Production heading returned from both localhost and EIP') },

  { n:27, lv:3, title:'Configuring a Public VPC with an EC2 Instance for Internet Access', detail: TT(
    "For the Nautilus project, a custom VPC with proper routing enables internet-accessible EC2 instances in isolation.",
    'Create VPC 10.0.0.0/16, public subnet, internet gateway, route table, and launch EC2.',
    [['Create VPC','VPC Console => Create VPC => IPv4 CIDR: 10.0.0.0/16 => Name: xfusion-vpc'],
     ['Create public subnet','Subnets => Create => 10.0.1.0/24 in us-east-1a => enable auto-assign public IP'],
     ['Create internet gateway','Internet Gateways => Create => attach to xfusion-vpc'],
     ['Create route table','Route Tables => Create => VPC: xfusion-vpc => add route 0.0.0.0/0 => IGW => associate public subnet'],
     ['Launch EC2 in subnet','Launch t3.micro in xfusion-vpc public subnet with web-sg'],
     ['Verify internet access','SSH to instance => curl https://ifconfig.me  =>  returns public IP']],
    'EC2 in custom VPC accessible from internet | curl returns public IP') },

  { n:28, lv:3, title:'Creating a Private ECR Repository', detail: TT(
    "For the Nautilus project, eCR provides private Docker image storage that integrates natively with ECS, EKS, and CodePipeline.",
    'Create a private ECR repository, build a Docker image, and push it to ECR.',
    [['Create ECR repository','ECR Console => Create repository => Private | Name: xfusion-app'],
     ['Authenticate Docker to ECR','aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com'],
     ['Build Docker image','docker build -t xfusion-app .'],
     ['Tag for ECR','docker tag xfusion-app:latest <account>.dkr.ecr.us-east-1.amazonaws.com/xfusion-app:latest'],
     ['Push to ECR','docker push <account>.dkr.ecr.us-east-1.amazonaws.com/xfusion-app:latest'],
     ['Verify in console','ECR => xfusion-app => Images => latest tag visible']],
    'xfusion-app:latest visible in ECR repository') },

  { n:29, lv:3, title:'Establishing Secure Communication Between Public and Private VPCs via VPC Peering', detail: TT(
    "For the Nautilus project, vPC peering enables private routing between VPCs without traffic traversing the public internet.",
    'Create a VPC peering connection between xfusion-vpc (public) and xfusion-private-vpc.',
    [['Create private VPC','VPC Console => Create VPC => 10.1.0.0/16 => xfusion-private-vpc'],
     ['Create peering connection','VPC => Peering Connections => Create => Requester: xfusion-vpc | Accepter: xfusion-private-vpc'],
     ['Accept the peering request','Select pending peering => Actions => Accept request'],
     ['Update route tables','Add route 10.1.0.0/16 => peering connection in xfusion-vpc route table | Add 10.0.0.0/16 => peering in private VPC route table'],
     ['Test connectivity','Launch EC2 in each VPC => ping private IP of instance in other VPC']],
    'Instances in both VPCs can ping each other via private IPs') },

  { n:30, lv:3, title:'Enable Internet Access for Private EC2 using NAT Instance', detail: TT(
    "For the Nautilus project, a NAT instance in the public subnet lets private subnet instances initiate outbound internet traffic.",
    'Launch a NAT instance in the public subnet and route private subnet traffic through it.',
    [['Launch NAT AMI','EC2 => Launch => search "NAT" => select amzn-ami-vpc-nat AMI | public subnet | web-sg'],
     ['Disable source/dest check','Select NAT instance => Actions => Networking => Change source/destination check => Stop'],
     ['Update private route table','Route Tables => private-rt => add route 0.0.0.0/0 => Target: NAT instance ID'],
     ['Launch private EC2','Launch EC2 in private subnet with no public IP'],
     ['Test outbound from private EC2','SSH via bastion to private EC2 => curl https://www.google.com']],
    'Private EC2 can reach internet via NAT instance') },

  { n:31, lv:3, title:'Configuring a Private RDS Instance for Application Development', detail: TT(
    "For the Nautilus project, rDS managed databases in private subnets provide secure, scalable relational storage.",
    'Create a MySQL 8 RDS instance in private subnets, accessible only from the app EC2.',
    [['Create DB subnet group','RDS => Subnet groups => Create => add 2 private subnets in different AZs'],
     ['Create RDS instance','RDS => Create database => MySQL 8.0 | db.t3.micro | Multi-AZ: No | DB subnet group => private-subnet-group'],
     ['Create RDS SG','SG: rds-sg => inbound MySQL/Aurora port 3306 from web-sg only'],
     ['Attach RDS SG','Modify RDS instance => VPC security groups: rds-sg'],
     ['Connect from EC2','SSH to app EC2 => mysql -h <rds-endpoint> -u admin -p => SHOW DATABASES;']],
    'MySQL prompt accessible from app EC2 | inaccessible from internet') },

  { n:32, lv:3, title:'Snapshot and Restoration of an RDS Instance', detail: TT(
    "For the Nautilus project, rDS snapshots enable point-in-time recovery and environment cloning for disaster recovery.",
    'Take a manual snapshot of the RDS instance and restore it to a new DB instance.',
    [['Create manual snapshot','RDS => Databases => select instance => Actions => Take snapshot => Name: xfusion-rds-snap'],
     ['Wait for available','RDS => Snapshots => status: available'],
     ['Restore from snapshot','Select snapshot => Actions => Restore snapshot => new DB identifier: xfusion-rds-restored'],
     ['Wait for new instance','RDS Databases => xfusion-rds-restored => Available'],
     ['Verify data','Connect to restored endpoint => SHOW DATABASES => confirm data present']],
    'xfusion-rds-restored available | same data as original') },

  { n:33, lv:3, title:'Create a Lambda Function', detail: TT(
    "For the Nautilus project, lambda runs code without provisioning servers \\u2014 ideal for event-driven and scheduled tasks.",
    'Create a Python Lambda function that returns Hello from xFusionCorp! and test it.',
    [['Open Lambda Console','Lambda => Create function => Author from scratch'],
     ['Configure function','Name: xfusion-hello | Runtime: Python 3.12 | Arch: x86_64'],
     ['Write the code','def lambda_handler(event, context):  return {"statusCode":200,"body":"Hello from xFusionCorp!"}'],
     ['Deploy','Click Deploy'],
     ['Test','Test => create test event => Invoke => verify response body in output']],
    '{"statusCode": 200, "body": "Hello from xFusionCorp!"}') },

  { n:34, lv:3, title:'Create a Lambda Function Using CLI', detail: TT(
    "For the Nautilus project, lambda can be deployed entirely via CLI for automation and IaC pipelines.",
    'Create a Python Lambda zip package and deploy it using aws lambda create-function.',
    [['Write lambda function','cat > lambda_function.py << EOF\\ndef lambda_handler(event, context):\\n  return {"statusCode":200,"body":"Hello from CLI!"}\\nEOF'],
     ['Zip the function','zip function.zip lambda_function.py'],
     ['Create IAM role for Lambda','aws iam create-role --role-name lambda-basic-role --assume-role-policy-document file://lambda-trust.json && aws iam attach-role-policy --role-name lambda-basic-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'],
     ['Create Lambda function','aws lambda create-function --function-name xfusion-cli-fn --runtime python3.12 --handler lambda_function.lambda_handler --zip-file fileb://function.zip --role arn:aws:iam::<account>:role/lambda-basic-role'],
     ['Invoke and verify','aws lambda invoke --function-name xfusion-cli-fn output.json && cat output.json']],
    '{"statusCode": 200, "body": "Hello from CLI!"}') },

  { n:35, lv:3, title:'Deploying and Managing Applications on AWS Elastic Beanstalk', detail: TT(
    "For the Nautilus project, elastic Beanstalk automates infrastructure provisioning for web applications.",
    'Deploy a sample Node.js app to Elastic Beanstalk and verify the public URL works.',
    [['Open Elastic Beanstalk','AWS Console => Elastic Beanstalk => Create application'],
     ['Configure app','Application name: xfusion-beanstalk | Platform: Node.js | Platform version: latest'],
     ['Upload sample code','Use sample application or upload your zip'],
     ['Create and wait','Create application => wait for environment health: Ok'],
     ['Test the URL','Click the environment URL => sample app loads in browser']],
    'Environment health: Ok | Application URL returns the app') },

  // Level 4 \u2014 Advanced services (Days 36\u201350)
  { n:36, lv:4, title:'Load Balancing EC2 Instances with Application Load Balancer', detail: TT(
    "For the Nautilus project, two EC2 instances behind an ALB enable zero-downtime deploys and horizontal scaling.",
    'Launch 2 EC2 instances, create an ALB, and verify traffic distributes across both.',
    [['Launch 2 EC2 instances','Both in different AZs | install Nginx with unique index.html per instance'],
     ['Create target group','TG: xfusion-tg | Port 80 | register both instances'],
     ['Create ALB','ALB: xfusion-alb | internet-facing | web-sg | both AZ subnets | listener 80 => xfusion-tg'],
     ['Wait for targets healthy','Target group health checks: healthy on both'],
     ['Test round-robin','for i in 1 2 3 4; do curl -s http://<alb-dns> | grep -i server; done']],
    'Responses alternate between both EC2 instances') },

  { n:37, lv:4, title:'Managing EC2 Access with S3 Role-based Permissions', detail: TT(
    "For the Nautilus project, eC2 instance profiles let applications access S3 without hardcoding credentials.",
    'Attach ec2-s3-role to an EC2 instance and verify it can list and read S3 buckets.',
    [['Create instance profile','aws iam create-instance-profile --instance-profile-name ec2-s3-profile && aws iam add-role-to-instance-profile --instance-profile-name ec2-s3-profile --role-name ec2-s3-role'],
     ['Attach to EC2','EC2 => select instance => Actions => Security => Modify IAM role => ec2-s3-profile'],
     ['SSH to instance','ssh -i xfusion-key.pem ec2-user@<ip>'],
     ['Test S3 access','aws s3 ls  =>  should list buckets without credentials'],
     ['Test read access','aws s3 cp s3://xfusion-assets-<id>/test.txt /tmp/ && cat /tmp/test.txt'],
     ['Test write blocked','aws s3 cp /tmp/test.txt s3://xfusion-assets-<id>/  =>  should fail with Access Denied']],
    'aws s3 ls works | read OK | write denied') },

  { n:38, lv:4, title:'Deploying Containerized Applications with Amazon ECS', detail: TT(
    "For the Nautilus project, eCS runs Docker containers at scale using Fargate (serverless) or EC2 launch type.",
    'Create an ECS cluster, task definition using nginx, and run it as a Fargate service.',
    [['Create ECS cluster','ECS => Clusters => Create cluster => Fargate | Name: xfusion-cluster'],
     ['Create task definition','ECS => Task definitions => Create => Fargate | CPU: 0.25vCPU | Memory: 512 MiB | Container: nginx:latest port 80'],
     ['Create service','xfusion-cluster => Services => Create => Fargate | task def | 1 desired task | public subnet | web-sg | auto-assign public IP'],
     ['Wait for running','Service => Tasks tab => Last status: RUNNING'],
     ['Test access','Copy public IP from task => curl http://<public-ip>  =>  Nginx welcome page']],
    'ECS Fargate task RUNNING | Nginx accessible via task public IP') },

  { n:39, lv:4, title:'Hosting a Static Website on AWS S3', detail: TT(
    "For the Nautilus project, s3 static hosting serves HTML/CSS/JS files globally at low cost without a web server.",
    'Enable static website hosting on an S3 bucket, upload index.html, and verify public access.',
    [['Create public bucket','S3 => Create bucket => uncheck Block all public access'],
     ['Enable static hosting','Bucket => Properties => Static website hosting => Enable | Index: index.html'],
     ['Upload index.html','echo "<h1>xFusionCorp Site</h1>" > index.html && aws s3 cp index.html s3://<bucket-name>/'],
     ['Set bucket policy','Bucket => Permissions => Bucket policy => allow s3:GetObject to Principal: *'],
     ['Access website','curl http://<bucket-name>.s3-website-us-east-1.amazonaws.com']],
    'xFusionCorp Site heading returned from S3 website URL') },

  { n:40, lv:4, title:'Troubleshooting Internet Accessibility for an EC2-Hosted Application', detail: TT(
    "For the Nautilus project, common EC2 connectivity issues involve SG rules, routing, NACL, or missing public IP.",
    'Debug why http://<ec2-public-ip> is unreachable and fix the root cause.',
    [['Check Security Group','EC2 => SG => verify HTTP port 80 inbound rule exists'],
     ['Check route table','VPC => Route Tables => verify 0.0.0.0/0 => IGW route exists for subnet'],
     ['Check NACL','VPC => NACLs => verify inbound and outbound rules allow port 80'],
     ['Check Nginx is running','SSH to EC2 => systemctl is-active nginx'],
     ['Check Nginx binding','ss -tlnp | grep :80  =>  should show nginx listening'],
     ['Fix whichever issue found','SG rule | route | NACL | service restart']],
    'curl http://<public-ip> returns Nginx response after fix') },

  { n:41, lv:4, title:'Securing Data with AWS KMS', detail: TT(
    "For the Nautilus project, kMS customer-managed keys provide full control over encryption, key rotation, and access policy.",
    'Create a KMS key, encrypt a file using it via CLI, and decrypt to verify.',
    [['Create KMS key','KMS Console => Customer managed keys => Create key => Symmetric | xfusion-key => finish'],
     ['Note key ID/ARN','Copy the key ARN'],
     ['Encrypt a file','aws kms encrypt --key-id <key-arn> --plaintext fileb://secret.txt --output text --query CiphertextBlob | base64 --decode > secret.enc'],
     ['Decrypt the file','aws kms decrypt --ciphertext-blob fileb://secret.enc --output text --query Plaintext | base64 --decode > decrypted.txt'],
     ['Verify content','diff secret.txt decrypted.txt  =>  no differences']],
    'Encrypted and decrypted file match | KMS key used') },

  { n:42, lv:4, title:'Building and Managing NoSQL Databases with AWS DynamoDB', detail: TT(
    "For the Nautilus project, dynamoDB is a serverless key-value and document database with single-digit millisecond latency.",
    'Create a DynamoDB table, insert items via CLI, and query by partition key.',
    [['Create table','DynamoDB => Tables => Create table => Name: xfusion-tasks | PK: taskId (String) | Billing: On-demand'],
     ['Wait for active','Table status: Active'],
     ['Insert items via CLI','aws dynamodb put-item --table-name xfusion-tasks --item \'{"taskId":{"S":"t001"},"title":{"S":"Deploy EC2"},"status":{"S":"done"}}\''],
     ['Query by PK','aws dynamodb get-item --table-name xfusion-tasks --key \'{"taskId":{"S":"t001"}}\''],
     ['Verify response','Response contains taskId, title, status with correct values']],
    'Item retrieved: taskId=t001 title=Deploy EC2 status=done') },

  { n:43, lv:4, title:'Scaling and Managing Kubernetes Clusters with Amazon EKS', detail: TT(
    "For the Nautilus project, eKS provides managed Kubernetes control plane, eliminating the overhead of self-managing masters.",
    'Create an EKS cluster, add a node group, and deploy an Nginx pod.',
    [['Create EKS cluster','EKS Console => Add cluster => Create | Name: xfusion-eks | K8s version: 1.30 | cluster SG | subnets'],
     ['Add managed node group','xfusion-eks => Compute => Add node group | t3.medium | min 1 max 3'],
     ['Configure kubectl','aws eks update-kubeconfig --region us-east-1 --name xfusion-eks'],
     ['Verify nodes','kubectl get nodes  =>  nodes in Ready state'],
     ['Deploy Nginx pod','kubectl run nginx --image=nginx --port=80'],
     ['Verify pod running','kubectl get pods  =>  nginx Running']],
    'kubectl get nodes: Ready | kubectl get pods: nginx Running') },

  { n:44, lv:4, title:'Implementing Auto Scaling for High Availability in AWS', detail: TT(
    "For the Nautilus project, auto Scaling automatically adjusts EC2 capacity to maintain performance and reduce cost.",
    'Create a Launch Template, Auto Scaling Group (min 1, max 3), and a scale-out policy.',
    [['Create Launch Template','EC2 => Launch Templates => Create | AMI: AL2023 | t3.micro | web-sg | user data: install nginx'],
     ['Create Auto Scaling Group','ASG => Create => Launch template | VPC: xfusion-vpc | subnets: 2 AZs | Min 1 / Desired 1 / Max 3'],
     ['Attach ALB target group','Attach to existing ALB target group xfusion-tg'],
     ['Create scale-out policy','Dynamic scaling => Target tracking => ALBRequestCountPerTarget > 100'],
     ['Test scaling','Generate load => aws cloudwatch get-metric-data to watch requests => ASG launches new instances']],
    'ASG shows desired=1 | scales out when load increases | new instances healthy') },

  { n:45, lv:4, title:'Configure NAT Gateway for Internet Access in a Private VPC', detail: TT(
    "For the Nautilus project, a NAT Gateway in the public subnet lets private instances reach the internet for updates.",
    'Create a NAT Gateway in the public subnet and route private subnet traffic through it.',
    [['Allocate EIP for NAT GW','EC2 => Elastic IPs => Allocate Elastic IP address'],
     ['Create NAT Gateway','VPC => NAT Gateways => Create | subnet: public-subnet-1a | EIP: allocated above'],
     ['Wait for available','NAT GW state: available'],
     ['Update private route table','VPC => Route Tables => private-rt => add 0.0.0.0/0 => NAT Gateway ID'],
     ['Test from private EC2','SSH via bastion to private EC2 => curl https://ifconfig.me  =>  returns NAT GW IP']],
    'Private EC2 reaches internet | public IP shown is NAT GW IP') },

  { n:46, lv:4, title:'Event-Driven Processing with Amazon S3 and Lambda', detail: TT(
    "For the Nautilus project, s3 event triggers let Lambda automatically process files on upload without polling.",
    'Create a Lambda that logs file metadata whenever an object is uploaded to S3.',
    [['Create Lambda function','Lambda => Create | xfusion-s3-trigger | Python 3.12 | role with S3ReadOnly + CloudWatchLogs'],
     ['Write Lambda code','def lambda_handler(event, context): bucket=event["Records"][0]["s3"]["bucket"]["name"]; key=event["Records"][0]["s3"]["object"]["key"]; print(f"New file: {key} in {bucket}"); return {"status":"ok"}'],
     ['Add S3 trigger','Lambda => Add trigger => S3 => bucket: xfusion-assets | Event: All object create events'],
     ['Upload test file','aws s3 cp test.txt s3://xfusion-assets-<id>/'],
     ['Verify Lambda ran','CloudWatch => Log groups => /aws/lambda/xfusion-s3-trigger => check latest log stream']],
    'CloudWatch log shows: New file: test.txt in xfusion-assets') },

  { n:47, lv:4, title:'Integrating AWS SQS and SNS for Reliable Messaging', detail: TT(
    "For the Nautilus project, sQS decouples producers from consumers; SNS fan-out delivers to multiple endpoints at once.",
    'Create SNS topic, SQS queue, subscribe queue to topic, and verify message delivery.',
    [['Create SNS topic','SNS => Topics => Create topic => Standard | Name: xfusion-alerts'],
     ['Create SQS queue','SQS => Create queue => Standard | Name: xfusion-queue'],
     ['Subscribe SQS to SNS','SNS => xfusion-alerts => Create subscription => Protocol: SQS | Endpoint: xfusion-queue ARN'],
     ['Publish test message','SNS => xfusion-alerts => Publish message => Body: Hello xFusionCorp!'],
     ['Read from SQS','SQS => xfusion-queue => Send and receive messages => Poll for messages => message body visible']],
    'xfusion-queue receives Hello xFusionCorp! via SNS fan-out') },

  { n:48, lv:4, title:'Automating Infrastructure Deployment with AWS CloudFormation', detail: TT(
    "For the Nautilus project, cloudFormation provisions entire stacks from YAML templates for repeatable infrastructure.",
    'Deploy a CloudFormation stack that creates a VPC, public subnet, and EC2 instance.',
    [['Write CloudFormation template','template.yml: AWSTemplateFormatVersion, Resources: VPC(AWS::EC2::VPC), Subnet(AWS::EC2::Subnet), EC2(AWS::EC2::Instance)'],
     ['Validate template','aws cloudformation validate-template --template-body file://template.yml'],
     ['Create stack','aws cloudformation create-stack --stack-name xfusion-stack --template-body file://template.yml --capabilities CAPABILITY_IAM'],
     ['Monitor creation','aws cloudformation describe-stack-events --stack-name xfusion-stack | head -20'],
     ['Verify outputs','aws cloudformation describe-stacks --stack-name xfusion-stack => check Outputs section'],
     ['Clean up','aws cloudformation delete-stack --stack-name xfusion-stack']],
    'xfusion-stack CREATE_COMPLETE | EC2 running in custom VPC') },

  { n:49, lv:4, title:'Centralized Audit Logging with VPC Flow Logs', detail: TT(
    "For the Nautilus project, vPC Flow Logs capture IP traffic metadata for security analysis, troubleshooting, and compliance.",
    'Enable VPC Flow Logs for xfusion-vpc to CloudWatch Logs and query rejected traffic.',
    [['Create CloudWatch log group','CloudWatch => Log groups => Create log group => /vpc/flow-logs/xfusion'],
     ['Create IAM role for flow logs','IAM => Create role => VPC Flow Logs trust => attach CloudWatchLogsFullAccess'],
     ['Enable flow logs','VPC => xfusion-vpc => Flow logs => Create | Destination: CloudWatch Logs | Log group: /vpc/flow-logs/xfusion | IAM role: flow-logs-role'],
     ['Generate traffic','Attempt SSH from blocked IP => generates REJECT entry'],
     ['Query logs','CloudWatch => Log Insights => select /vpc/flow-logs/xfusion => filter action = "REJECT" | head 10']],
    'REJECT entries visible in CloudWatch for blocked traffic') },

  { n:50, lv:4, title:'Expanding EC2 Instance Storage for Development Needs', detail: TT(
    "For the Nautilus project, eBS volumes can be expanded online without stopping the instance for zero-downtime storage growth.",
    'Expand the attached GP3 volume from 20 GiB to 40 GiB and resize the filesystem online.',
    [['Modify volume size','EC2 => Volumes => select xfusion-data-vol => Actions => Modify volume => Size: 40 => Modify'],
     ['Wait for optimization','Volume state changes from optimizing to in-use'],
     ['Check new size on OS','SSH to EC2 => lsblk  =>  volume shows 40G but filesystem still 20G'],
     ['Grow XFS filesystem','sudo xfs_growfs /data  (for XFS) | sudo resize2fs /dev/xvdf  (for ext4)'],
     ['Verify new size','df -h /data  =>  shows 40G available']],
    'df -h /data shows ~40G | filesystem expanded with no downtime') },
];

// ── KUBERNETES TASKS ───────────────────────────────────────────────────────────
const KUBERNETES_TASKS: TrackTask[] = [
  // Level 1
  { n:1, lv:1, title:'Deploy Pods in Kubernetes Cluster', detail: TT(
    'The Nautilus DevOps team is expanding their container orchestration platform. The team needs a simple nginx pod running in the Kubernetes cluster to validate the cluster connectivity.',
    'Create a Pod named nginx-pod using the nginx:latest image in the default namespace.',
    [['Check cluster connectivity','kubectl get nodes'],
     ['Create pod manifest','vim nginx-pod.yaml  =>  apiVersion: v1 / kind: Pod / metadata.name: nginx-pod / spec.containers: nginx:latest'],
     ['Apply the manifest','kubectl apply -f nginx-pod.yaml'],
     ['Verify pod is Running','kubectl get pod nginx-pod'],
     ['Describe for details','kubectl describe pod nginx-pod']],
    'nginx-pod   1/1   Running   0') },

  { n:2, lv:1, title:'Deploy Applications with Kubernetes Deployments', detail: TT(
    'The Nautilus application team needs a scalable and self-healing deployment for their web frontend. They want it managed by a Kubernetes Deployment so replicas are automatically recovered.',
    'Create a Deployment named httpd-deployment with 3 replicas using the httpd:latest image.',
    [['Create deployment manifest','vim httpd-deployment.yaml  =>  kind: Deployment / replicas: 3 / image: httpd:latest'],
     ['Apply the manifest','kubectl apply -f httpd-deployment.yaml'],
     ['Verify deployment','kubectl get deployment httpd-deployment'],
     ['Check all 3 pods are running','kubectl get pods -l app=httpd-deployment'],
     ['Describe deployment','kubectl describe deployment httpd-deployment']],
    'httpd-deployment   3/3   3   3   Running') },

  { n:3, lv:1, title:'Setup Kubernetes Namespaces and PODs', detail: TT(
    'The Nautilus team uses Kubernetes namespaces to isolate environments. The QA environment needs its own namespace and a dedicated pod running within it.',
    'Create a namespace named dev, then deploy an nginx pod named dev-pod inside it.',
    [['Create namespace','kubectl create namespace dev'],
     ['Verify namespace','kubectl get namespace dev'],
     ['Create pod in namespace','kubectl run dev-pod --image=nginx:latest -n dev'],
     ['Verify pod in namespace','kubectl get pod dev-pod -n dev'],
     ['Check pod logs','kubectl logs dev-pod -n dev']],
    'dev-pod   1/1   Running   0   (in namespace dev)') },

  { n:4, lv:1, title:'Set Resource Limits in Kubernetes Pods', detail: TT(
    'The Nautilus cluster has resource contention issues. The SRE team needs resource requests and limits enforced on application pods to prevent any single workload from starving others.',
    'Create a pod named resource-pod with CPU request 100m/limit 200m and memory request 64Mi/limit 128Mi.',
    [['Create pod manifest with resources','vim resource-pod.yaml  =>  resources.requests: {cpu: 100m, memory: 64Mi} / resources.limits: {cpu: 200m, memory: 128Mi}'],
     ['Apply manifest','kubectl apply -f resource-pod.yaml'],
     ['Verify pod is running','kubectl get pod resource-pod'],
     ['Check resource limits in description','kubectl describe pod resource-pod | grep -A5 Limits'],
     ['Check resource requests','kubectl describe pod resource-pod | grep -A5 Requests']],
    'Limits: cpu: 200m memory: 128Mi | Requests: cpu: 100m memory: 64Mi') },

  { n:5, lv:1, title:'Execute Rolling Updates in Kubernetes', detail: TT(
    'The Nautilus web application has a new image version ready. The team needs a zero-downtime rolling update to deploy the new version without service interruption.',
    'Update the image of deployment webapp-deployment from nginx:1.17 to nginx:1.19 using a rolling update.',
    [['Check current image','kubectl describe deployment webapp-deployment | grep Image'],
     ['Perform rolling update','kubectl set image deployment/webapp-deployment nginx=nginx:1.19'],
     ['Watch rollout status','kubectl rollout status deployment/webapp-deployment'],
     ['Verify new image','kubectl describe deployment webapp-deployment | grep Image'],
     ['Check all pods updated','kubectl get pods -l app=webapp-deployment']],
    'deployment.apps/webapp-deployment image updated | Waiting for rollout to finish... done') },

  { n:6, lv:1, title:'Revert Deployment to Previous Version in Kubernetes', detail: TT(
    'A recent Nautilus deployment introduced a regression bug. The team needs to immediately roll back the deployment to the last known working version to restore service.',
    'Roll back deployment webapp-deployment to its previous revision.',
    [['Check rollout history','kubectl rollout history deployment/webapp-deployment'],
     ['Undo the last rollout','kubectl rollout undo deployment/webapp-deployment'],
     ['Watch rollback status','kubectl rollout status deployment/webapp-deployment'],
     ['Verify previous image restored','kubectl describe deployment webapp-deployment | grep Image'],
     ['Confirm all pods are running','kubectl get pods -l app=webapp-deployment']],
    'deployment.apps/webapp-deployment rolled back | all pods Running with previous image') },

  { n:7, lv:1, title:'Deploy ReplicaSet in Kubernetes Cluster', detail: TT(
    'The Nautilus QA team needs a ReplicaSet to maintain exactly 3 identical nginx pods for load testing purposes, with automatic restarts if any pod fails.',
    'Create a ReplicaSet named nginx-replicaset with 3 replicas using the nginx:latest image.',
    [['Create ReplicaSet manifest','vim nginx-rs.yaml  =>  kind: ReplicaSet / spec.replicas: 3 / selector.matchLabels: app=nginx / image: nginx:latest'],
     ['Apply the manifest','kubectl apply -f nginx-rs.yaml'],
     ['Verify ReplicaSet','kubectl get replicaset nginx-replicaset'],
     ['Check all 3 pods','kubectl get pods -l app=nginx'],
     ['Test self-healing: delete a pod','kubectl delete pod <pod-name>  =>  ReplicaSet recreates it']],
    'nginx-replicaset   3   3   3   Running') },

  { n:8, lv:1, title:'Schedule Cronjobs in Kubernetes', detail: TT(
    'The Nautilus ops team needs a scheduled job to clean up temporary files on a recurring basis. Kubernetes CronJobs allow them to run this on a schedule without external cron infrastructure.',
    'Create a CronJob named cleanup-job that runs every 5 minutes and echoes "cleanup done".',
    [['Create CronJob manifest','vim cleanup-job.yaml  =>  kind: CronJob / spec.schedule: "*/5 * * * *" / command: [echo, cleanup done]'],
     ['Apply the manifest','kubectl apply -f cleanup-job.yaml'],
     ['Verify CronJob created','kubectl get cronjob cleanup-job'],
     ['Wait for first execution','kubectl get jobs --watch'],
     ['Check job pod logs','kubectl logs job/<job-name>']],
    'cleanup-job   */5 * * * *   Active | logs show: cleanup done') },

  { n:9, lv:1, title:'Create Countdown Job in Kubernetes', detail: TT(
    'The Nautilus team needs a one-shot batch job that runs a countdown script and exits cleanly. Kubernetes Jobs guarantee the task runs to completion exactly once.',
    'Create a Job named countdown-job that runs a shell countdown from 5 to 1 and exits 0.',
    [['Create Job manifest','vim countdown-job.yaml  =>  kind: Job / spec.template.spec.containers: command: [sh, -c, for i in 5 4 3 2 1; do echo $i; done]'],
     ['Apply the manifest','kubectl apply -f countdown-job.yaml'],
     ['Watch job completion','kubectl get job countdown-job --watch'],
     ['Check pod logs for output','kubectl logs job/countdown-job'],
     ['Verify job succeeded','kubectl describe job countdown-job | grep Succeeded']],
    'countdown-job: 1 Succeeded | logs: 5 4 3 2 1') },

  { n:10, lv:1, title:'Set Up Time Check Pod in Kubernetes', detail: TT(
    'The Nautilus monitoring team needs a pod that runs a continuous time check loop, logging the current timestamp every 5 seconds to verify pod liveliness.',
    'Create a pod named time-check that runs busybox and loops printing the date every 5 seconds.',
    [['Create pod manifest','vim time-check.yaml  =>  image: busybox / command: [sh,-c,"while true; do date; sleep 5; done"]'],
     ['Apply the manifest','kubectl apply -f time-check.yaml'],
     ['Verify pod is Running','kubectl get pod time-check'],
     ['Check pod logs','kubectl logs time-check'],
     ['Follow logs live','kubectl logs -f time-check']],
    'Pod Running | logs show timestamps every 5 seconds') },

  { n:11, lv:1, title:'Resolve Pod Deployment Issue', detail: TT(
    'The Nautilus staging environment has a pod stuck in a CrashLoopBackOff or Pending state. The SRE team must diagnose the root cause and fix it to restore the service.',
    'Investigate why the pod webapp-pod is not Running and fix the issue.',
    [['Check pod status','kubectl get pod webapp-pod'],
     ['Describe pod for events','kubectl describe pod webapp-pod  =>  look for Events section'],
     ['Check pod logs','kubectl logs webapp-pod  (or --previous if crashed)'],
     ['Identify issue (wrong image, resource limits, missing ConfigMap etc.)','kubectl describe pod webapp-pod | grep -E "Image|Error|Reason"'],
     ['Apply fix and verify','kubectl apply -f fixed-pod.yaml  &&  kubectl get pod webapp-pod']],
    'webapp-pod   1/1   Running   0') },

  { n:12, lv:1, title:'Update Deployment and Service in Kubernetes', detail: TT(
    'The Nautilus production team needs both the deployment image and its associated service port updated to accommodate a new version of the application.',
    'Update deployment httpd-deployment image to httpd:2.4.54 and update its service to expose port 8080.',
    [['Update deployment image','kubectl set image deployment/httpd-deployment httpd=httpd:2.4.54'],
     ['Watch rollout','kubectl rollout status deployment/httpd-deployment'],
     ['Edit the service','kubectl edit service httpd-service  =>  change port to 8080'],
     ['Verify service port','kubectl get service httpd-service'],
     ['Verify deployment image','kubectl describe deployment httpd-deployment | grep Image']],
    'Image: httpd:2.4.54 | Service port: 8080') },

  { n:13, lv:1, title:'Expose Application Using NodePort Service in Kubernetes', detail: TT(
    'The Nautilus QA team needs to access the web application running in Kubernetes from outside the cluster using a browser. A NodePort service will expose it on a fixed port on all cluster nodes.',
    'Expose deployment webapp-deployment on NodePort 30080 using port 80.',
    [['Create NodePort service','kubectl expose deployment webapp-deployment --type=NodePort --port=80 --name=webapp-service'],
     ['Edit service to set nodePort','kubectl edit service webapp-service  =>  set nodePort: 30080'],
     ['Verify service','kubectl get service webapp-service'],
     ['Test from node IP','curl http://<node-ip>:30080'],
     ['Check endpoints','kubectl get endpoints webapp-service']],
    'webapp-service  NodePort  80:30080/TCP | HTTP response from application') },

  { n:14, lv:1, title:'Resolve VolumeMounts Issue in Kubernetes', detail: TT(
    'A Nautilus pod is failing to start because its volumeMount path does not match the volume defined in the pod spec. The SRE team must correct the manifest and redeploy.',
    'Fix the volumeMount mismatch in pod data-pod so it mounts /data correctly.',
    [['Describe the failing pod','kubectl describe pod data-pod  =>  check Events for volume errors'],
     ['Get the current pod manifest','kubectl get pod data-pod -o yaml > data-pod.yaml'],
     ['Identify mountPath vs volume name mismatch','grep -A5 volumeMounts data-pod.yaml  &&  grep -A5 volumes data-pod.yaml'],
     ['Delete the broken pod','kubectl delete pod data-pod'],
     ['Fix manifest and re-apply','vim data-pod.yaml  =>  correct mountPath or volume name  &&  kubectl apply -f data-pod.yaml']],
    'data-pod   1/1   Running   0 | /data directory mounted correctly') },

  // Level 2
  { n:1, lv:2, title:'Kubernetes Shared Volumes', detail: TT(
    'The Nautilus application has two containers that need to share files at runtime. The team needs a pod with a shared emptyDir volume so both containers can read and write the same data.',
    'Create a pod named shared-vol-pod with two containers sharing an emptyDir volume mounted at /shared.',
    [['Create pod manifest with emptyDir','vim shared-vol-pod.yaml  =>  volumes: [{name: shared, emptyDir: {}}] / both containers: volumeMounts: [{name: shared, mountPath: /shared}]'],
     ['Apply the manifest','kubectl apply -f shared-vol-pod.yaml'],
     ['Verify pod is Running','kubectl get pod shared-vol-pod'],
     ['Write from container 1','kubectl exec shared-vol-pod -c container1 -- sh -c "echo hello > /shared/test.txt"'],
     ['Read from container 2','kubectl exec shared-vol-pod -c container2 -- cat /shared/test.txt']],
    'hello (readable from container2 written by container1)') },

  { n:2, lv:2, title:'Kubernetes Sidecar Containers', detail: TT(
    'The Nautilus observability team needs a sidecar container alongside the main app container to tail and forward logs to a centralized logging service without modifying the main application.',
    'Create a pod with a main nginx container and a busybox sidecar that tails /var/log/nginx/access.log via a shared volume.',
    [['Create pod manifest with two containers','vim sidecar-pod.yaml  =>  containers: [nginx (main), busybox (sidecar: tail -f /logs/access.log)] / shared emptyDir at /var/log/nginx and /logs'],
     ['Apply the manifest','kubectl apply -f sidecar-pod.yaml'],
     ['Verify both containers running','kubectl get pod sidecar-pod  =>  READY should show 2/2'],
     ['Check sidecar logs','kubectl logs sidecar-pod -c sidecar'],
     ['Curl nginx to generate a log entry','kubectl exec sidecar-pod -c nginx -- curl localhost']],
    'sidecar-pod   2/2   Running | sidecar logs show nginx access entries') },

  { n:3, lv:2, title:'Deploy Nginx Web Server on Kubernetes Cluster', detail: TT(
    'The Nautilus infrastructure team needs to run a production-grade nginx web server on the Kubernetes cluster, exposed via a ClusterIP service for internal communication.',
    'Deploy nginx with 2 replicas and expose it via a ClusterIP service on port 80.',
    [['Create Deployment','kubectl create deployment nginx-web --image=nginx:latest --replicas=2'],
     ['Expose as ClusterIP','kubectl expose deployment nginx-web --port=80 --target-port=80 --name=nginx-svc'],
     ['Verify deployment','kubectl get deployment nginx-web'],
     ['Verify service','kubectl get service nginx-svc'],
     ['Test internal access','kubectl run test-pod --image=busybox --rm -it -- wget -qO- http://nginx-svc']],
    '2/2 pods Running | nginx-svc ClusterIP port 80 responding') },

  { n:4, lv:2, title:'Print Environment Variables', detail: TT(
    'The Nautilus dev team needs to verify that environment variables are correctly injected into pods at runtime. A test pod should print all its environment variables on startup.',
    'Create a pod named env-pod that prints all environment variables using the env command and exits.',
    [['Create pod manifest','vim env-pod.yaml  =>  image: busybox / env: [{name: APP_ENV, value: production},{name: APP_VERSION, value: 2.0}] / command: [env]'],
     ['Apply the manifest','kubectl apply -f env-pod.yaml'],
     ['Check pod completes','kubectl get pod env-pod'],
     ['View printed environment variables','kubectl logs env-pod'],
     ['Verify specific var','kubectl logs env-pod | grep APP_ENV']],
    'APP_ENV=production | APP_VERSION=2.0 | (all env vars printed)') },

  { n:5, lv:2, title:'Rolling Updates And Rolling Back Deployments in Kubernetes', detail: TT(
    'The Nautilus release team needs to perform a rolling update to a new image version, then immediately validate rollback capability to ensure the deployment is reversible on failure.',
    'Update deployment frontend-app to image nginx:1.21, verify rollout, then roll back to nginx:1.19.',
    [['Check current image','kubectl describe deployment frontend-app | grep Image'],
     ['Rolling update to 1.21','kubectl set image deployment/frontend-app nginx=nginx:1.21  &&  kubectl rollout status deployment/frontend-app'],
     ['Verify update complete','kubectl describe deployment frontend-app | grep Image'],
     ['Roll back to previous (1.19)','kubectl rollout undo deployment/frontend-app'],
     ['Verify rollback complete','kubectl rollout status deployment/frontend-app  &&  kubectl describe deployment frontend-app | grep Image']],
    'Rollout to 1.21 succeeded | Rollback to 1.19 succeeded') },

  { n:6, lv:2, title:'Deploy Jenkins on Kubernetes', detail: TT(
    'The Nautilus CI/CD team needs Jenkins running on Kubernetes for pipeline orchestration. Jenkins must be persistent and accessible via a NodePort service.',
    'Deploy Jenkins using the jenkins/jenkins:lts image with a PVC for /var/jenkins_home and expose on NodePort 32000.',
    [['Create PVC for Jenkins data','vim jenkins-pvc.yaml  =>  PersistentVolumeClaim 8Gi / accessMode: ReadWriteOnce'],
     ['Create Jenkins deployment','vim jenkins-deploy.yaml  =>  image: jenkins/jenkins:lts / volumeMount: /var/jenkins_home from pvc'],
     ['Expose via NodePort','kubectl expose deployment jenkins --type=NodePort --port=8080 --name=jenkins-svc  =>  set nodePort: 32000'],
     ['Apply all manifests','kubectl apply -f jenkins-pvc.yaml -f jenkins-deploy.yaml'],
     ['Get initial admin password','kubectl exec <jenkins-pod> -- cat /var/jenkins_home/secrets/initialAdminPassword']],
    'Jenkins accessible at http://<node-ip>:32000 | initial admin password retrieved') },

  { n:7, lv:2, title:'Deploy Grafana on Kubernetes Cluster', detail: TT(
    'The Nautilus monitoring team needs Grafana deployed on Kubernetes to visualize metrics from Prometheus. It must be accessible externally via a NodePort.',
    'Deploy Grafana using grafana/grafana:latest and expose it on NodePort 32001.',
    [['Create Grafana deployment','kubectl create deployment grafana --image=grafana/grafana:latest'],
     ['Expose via NodePort','kubectl expose deployment grafana --type=NodePort --port=3000 --name=grafana-svc  =>  set nodePort: 32001'],
     ['Verify deployment','kubectl get deployment grafana  &&  kubectl get pod -l app=grafana'],
     ['Verify service','kubectl get service grafana-svc'],
     ['Access Grafana UI','http://<node-ip>:32001  =>  login with admin/admin']],
    'Grafana accessible at port 32001 | admin/admin login works') },

  { n:8, lv:2, title:'Deploy Tomcat App on Kubernetes', detail: TT(
    'The Nautilus Java application team needs Tomcat deployed on Kubernetes to host their WAR file. It must be reachable externally for QA testing.',
    'Deploy Tomcat using tomcat:9.0 image with 2 replicas and expose on NodePort 32002.',
    [['Create Tomcat deployment','kubectl create deployment tomcat-app --image=tomcat:9.0 --replicas=2'],
     ['Expose via NodePort','kubectl expose deployment tomcat-app --type=NodePort --port=8080 --name=tomcat-svc  =>  set nodePort: 32002'],
     ['Verify pods are running','kubectl get pods -l app=tomcat-app'],
     ['Verify service','kubectl get service tomcat-svc'],
     ['Test HTTP response','curl http://<node-ip>:32002  =>  Tomcat welcome page']],
    '2/2 pods Running | Tomcat welcome page at port 32002') },

  { n:9, lv:2, title:'Deploy Node App on Kubernetes', detail: TT(
    'The Nautilus development team needs their Node.js application deployed on Kubernetes with proper environment variables configured and externally accessible.',
    'Deploy a Node.js app using node:18-alpine, expose on NodePort 32003, and inject NODE_ENV=production.',
    [['Create Deployment with env var','kubectl create deployment node-app --image=node:18-alpine  =>  add env NODE_ENV=production in manifest'],
     ['Edit deployment to add env','kubectl edit deployment node-app  =>  env: [{name: NODE_ENV, value: production}]'],
     ['Expose via NodePort','kubectl expose deployment node-app --type=NodePort --port=3000 --name=node-svc  =>  set nodePort: 32003'],
     ['Verify pod env var','kubectl exec <node-pod> -- printenv NODE_ENV'],
     ['Verify service','kubectl get service node-svc']],
    'NODE_ENV=production | node-svc NodePort 32003') },

  { n:10, lv:2, title:'Troubleshoot Deployment issues in Kubernetes', detail: TT(
    'The Nautilus production deployment is stuck in a Pending or ErrImagePull state. The on-call SRE must diagnose the issue quickly to restore the service.',
    'Identify and fix why deployment broken-deploy is not successfully running pods.',
    [['Get deployment status','kubectl get deployment broken-deploy'],
     ['Check pod status','kubectl get pods -l app=broken-deploy'],
     ['Describe pods for events','kubectl describe pod <pod-name>  =>  look for: ErrImagePull, OOMKilled, Unschedulable'],
     ['Check deployment spec','kubectl get deployment broken-deploy -o yaml  =>  check image, resources, nodeSelector'],
     ['Apply the fix','kubectl set image deployment/broken-deploy <container>=<correct-image>  OR  kubectl edit deployment broken-deploy']],
    'broken-deploy   N/N   Running | no ErrImagePull or Pending pods') },

  { n:11, lv:2, title:'Fix issue with LAMP Environment in Kubernetes', detail: TT(
    'The Nautilus LAMP stack deployed on Kubernetes is non-functional. Either Apache or MySQL is failing, and the application is returning errors to users.',
    'Diagnose and fix the broken LAMP deployment so both Apache and MySQL pods are Running and the app is accessible.',
    [['Check all pods in namespace','kubectl get pods -n lamp  (or default)'],
     ['Describe failing pod','kubectl describe pod <lamp-pod>  =>  check Events'],
     ['Check logs of each container','kubectl logs <pod> -c apache  &&  kubectl logs <pod> -c mysql'],
     ['Identify the issue (wrong env var, missing secret, bad image)','kubectl get configmap,secret -n lamp'],
     ['Apply fix and verify','kubectl apply -f fixed-lamp.yaml  &&  kubectl get pods -n lamp']],
    'All LAMP pods Running | app accessible via service') },

  // Level 3
  { n:1, lv:3, title:'Deploy Apache Web Server on Kubernetes Cluster', detail: TT(
    'The Nautilus infrastructure team needs Apache HTTPD serving static content from a ConfigMap, deployed on Kubernetes with a LoadBalancer service for external access.',
    'Deploy Apache using httpd:2.4 with a custom index.html injected via ConfigMap, exposed on port 80.',
    [['Create ConfigMap for index.html','kubectl create configmap apache-content --from-literal=index.html="<h1>Nautilus</h1>"'],
     ['Create Deployment with ConfigMap volume','vim apache-deploy.yaml  =>  volumeMount ConfigMap at /usr/local/apache2/htdocs/'],
     ['Apply manifest','kubectl apply -f apache-deploy.yaml'],
     ['Expose as NodePort','kubectl expose deployment apache-deploy --type=NodePort --port=80 --name=apache-svc'],
     ['Test custom content','curl http://<node-ip>:<nodePort>  =>  shows <h1>Nautilus</h1>']],
    '<h1>Nautilus</h1> served from Apache via ConfigMap') },

  { n:2, lv:3, title:'Deploy Lamp Stack on Kubernetes Cluster', detail: TT(
    'The Nautilus web team needs a full LAMP (Linux, Apache, MySQL, PHP) stack on Kubernetes with inter-pod communication via a ClusterIP service for the database.',
    'Deploy Apache+PHP frontend and MySQL backend as separate pods connected via a ClusterIP service.',
    [['Create MySQL deployment and service','vim mysql-deploy.yaml  =>  image: mysql:8 / env: MYSQL_ROOT_PASSWORD / ClusterIP service mysql-svc:3306'],
     ['Create Apache+PHP deployment','vim apache-php-deploy.yaml  =>  image: php:apache / env: DB_HOST=mysql-svc'],
     ['Apply all manifests','kubectl apply -f mysql-deploy.yaml -f apache-php-deploy.yaml'],
     ['Verify both deployments','kubectl get deployments  &&  kubectl get services'],
     ['Test PHP to MySQL connection','kubectl exec <apache-pod> -- php -r "new PDO(mysql:host=mysql-svc); echo OK;"']],
    'Apache+PHP pod running | MySQL pod running | PHP can connect to MySQL via mysql-svc') },

  { n:3, lv:3, title:'Init Containers in Kubernetes', detail: TT(
    'The Nautilus app team needs an init container to pre-populate a shared volume with configuration data before the main application container starts.',
    'Create a pod with an init container that writes a config file to a shared emptyDir before the main container reads it.',
    [['Create pod manifest with initContainers','vim init-pod.yaml  =>  initContainers: [{image: busybox, command: [sh,-c,"echo config > /shared/app.conf"]}] / volumes: emptyDir / mainContainer mounts same volume'],
     ['Apply manifest','kubectl apply -f init-pod.yaml'],
     ['Watch init container run first','kubectl get pod init-pod --watch  =>  Init:0/1 then Running'],
     ['Verify main container got the file','kubectl exec init-pod -- cat /shared/app.conf'],
     ['Check pod events','kubectl describe pod init-pod | grep -A10 Events']],
    'config (content of /shared/app.conf) | pod progresses: Init → Running') },

  { n:4, lv:3, title:'Persistent Volumes in Kubernetes', detail: TT(
    'The Nautilus database team needs data to survive pod restarts. They need a PersistentVolume and PersistentVolumeClaim to provide durable storage for the MySQL pod.',
    'Create a 5Gi PersistentVolume and a matching PVC, then mount it in a MySQL pod at /var/lib/mysql.',
    [['Create PersistentVolume','vim pv.yaml  =>  capacity: storage: 5Gi / accessModes: ReadWriteOnce / hostPath: /mnt/data'],
     ['Create PersistentVolumeClaim','vim pvc.yaml  =>  resources.requests.storage: 5Gi / accessModes: ReadWriteOnce'],
     ['Apply PV and PVC','kubectl apply -f pv.yaml -f pvc.yaml  &&  kubectl get pvc  =>  STATUS: Bound'],
     ['Create MySQL pod using PVC','vim mysql-pod.yaml  =>  volumes: [{persistentVolumeClaim: {claimName: mysql-pvc}}] / mountPath: /var/lib/mysql'],
     ['Verify persistent storage','kubectl exec mysql-pod -- ls /var/lib/mysql']],
    'PVC STATUS: Bound | /var/lib/mysql mounted and writable') },

  { n:5, lv:3, title:'Manage Secrets in Kubernetes', detail: TT(
    'The Nautilus security team requires database credentials to be stored as Kubernetes Secrets, not hardcoded in pod specs, and injected as environment variables at runtime.',
    'Create a Secret named db-secret with MYSQL_ROOT_PASSWORD=P@ssword123 and inject it into a MySQL pod.',
    [['Create the Secret','kubectl create secret generic db-secret --from-literal=MYSQL_ROOT_PASSWORD=P@ssword123'],
     ['Verify secret created','kubectl get secret db-secret  &&  kubectl describe secret db-secret'],
     ['Create MySQL pod using secret env','vim mysql-secret-pod.yaml  =>  env: [{name: MYSQL_ROOT_PASSWORD, valueFrom: {secretKeyRef: {name: db-secret, key: MYSQL_ROOT_PASSWORD}}}]'],
     ['Apply pod manifest','kubectl apply -f mysql-secret-pod.yaml'],
     ['Verify env var injected','kubectl exec mysql-secret-pod -- printenv MYSQL_ROOT_PASSWORD']],
    'P@ssword123 (printed from inside pod without being in plain YAML)') },

  { n:6, lv:3, title:'Environment Variables in Kubernetes', detail: TT(
    'The Nautilus application needs multiple environment variables injected from both literal values and ConfigMaps to configure its runtime behavior across environments.',
    'Create a ConfigMap app-config with APP_ENV=staging and APP_PORT=8080, then inject all keys into a pod.',
    [['Create ConfigMap','kubectl create configmap app-config --from-literal=APP_ENV=staging --from-literal=APP_PORT=8080'],
     ['Create pod using envFrom','vim app-pod.yaml  =>  envFrom: [{configMapRef: {name: app-config}}]'],
     ['Apply the pod manifest','kubectl apply -f app-pod.yaml'],
     ['Verify env vars injected','kubectl exec app-pod -- printenv | grep APP'],
     ['Cross-check ConfigMap values','kubectl get configmap app-config -o yaml']],
    'APP_ENV=staging | APP_PORT=8080 (from envFrom configMapRef)') },

  { n:7, lv:3, title:'Kubernetes LEMP Setup', detail: TT(
    'The Nautilus web team needs a LEMP (Linux, Nginx, MySQL, PHP) stack on Kubernetes. Nginx proxies PHP-FPM requests and PHP-FPM connects to MySQL for dynamic content.',
    'Deploy Nginx + PHP-FPM as a multi-container pod and MySQL as a separate pod with a ClusterIP service.',
    [['Create MySQL deployment + ClusterIP service','vim mysql-lemp.yaml  =>  image: mysql:8 / service: mysql-svc:3306'],
     ['Create Nginx+PHP-FPM pod','vim lemp-pod.yaml  =>  containers: [nginx (proxy to php-fpm), php-fpm] / shared emptyDir for web root'],
     ['Configure Nginx to proxy PHP','kubectl create configmap nginx-conf --from-file=default.conf  =>  fastcgi_pass 127.0.0.1:9000'],
     ['Apply all manifests','kubectl apply -f mysql-lemp.yaml -f lemp-pod.yaml'],
     ['Test PHP page via Nginx','curl http://<lemp-service>  =>  PHP info or dynamic page rendered']],
    'Nginx serving PHP content | PHP-FPM connected to MySQL via mysql-svc') },

  { n:8, lv:3, title:'Kubernetes Troubleshooting', detail: TT(
    'The Nautilus production cluster has degraded workloads. The SRE team has been paged and must diagnose multiple failing pods and deployments to restore cluster health.',
    'Investigate the cluster for failing workloads and fix each identified issue.',
    [['Get overall cluster health','kubectl get nodes  &&  kubectl get pods --all-namespaces | grep -v Running'],
     ['Identify CrashLoopBackOff pods','kubectl describe pod <failing-pod> -n <namespace>  =>  check Events and last exit code'],
     ['Check pod logs','kubectl logs <pod> --previous  (for crashed containers)'],
     ['Check node resource pressure','kubectl describe node <node>  =>  check Conditions for MemoryPressure/DiskPressure'],
     ['Apply fixes and verify cluster health','kubectl apply -f fixed-manifests/  &&  kubectl get pods --all-namespaces']],
    'All pods Running or Completed | kubectl get pods --all-namespaces shows no CrashLoop') },

  { n:9, lv:3, title:'Deploy Iron Gallery App on Kubernetes', detail: TT(
    'The Nautilus team needs to deploy the Iron Gallery image gallery web application on Kubernetes with a persistent volume for uploaded images and external access via NodePort.',
    'Deploy the Iron Gallery app with a PVC for /data/uploads and expose on NodePort 32080.',
    [['Create PVC for image storage','vim gallery-pvc.yaml  =>  5Gi ReadWriteOnce'],
     ['Create Deployment with PVC mount','vim gallery-deploy.yaml  =>  image: kodekloud/irongallery / volumeMount: /data/uploads from PVC'],
     ['Expose via NodePort','kubectl expose deployment iron-gallery --type=NodePort --port=80 --name=gallery-svc  =>  nodePort: 32080'],
     ['Apply all manifests','kubectl apply -f gallery-pvc.yaml -f gallery-deploy.yaml'],
     ['Test app access','curl http://<node-ip>:32080  =>  Iron Gallery homepage']],
    'Iron Gallery accessible at port 32080 | /data/uploads PVC mounted') },

  { n:10, lv:3, title:'Fix Python App Deployed on Kubernetes Cluster', detail: TT(
    'The Nautilus Python Flask application deployed on Kubernetes is returning 500 errors. The team suspects an environment variable misconfiguration or a bad image tag.',
    'Diagnose and fix the failing Python app so it serves HTTP 200 responses.',
    [['Check pod status and events','kubectl get pods -l app=python-app  &&  kubectl describe pod <pod>'],
     ['Check application logs','kubectl logs <python-pod>  =>  look for ImportError, KeyError, or connection refused'],
     ['Verify environment variables','kubectl get deployment python-app -o yaml | grep env -A10'],
     ['Fix image tag or env variable','kubectl set image deployment/python-app python=python:3.11  OR  kubectl edit deployment python-app'],
     ['Test HTTP response','kubectl exec <pod> -- curl localhost:5000  =>  200 OK']],
    'HTTP 200 | Python app Running with correct env vars and image') },

  // Level 4
  { n:1, lv:4, title:'Deploy Redis Deployment on Kubernetes', detail: TT(
    'The Nautilus caching team needs Redis deployed on Kubernetes with persistent storage so cached data survives pod restarts, and a ClusterIP service for internal access.',
    'Deploy Redis using redis:7 with a PVC for /data and expose via ClusterIP on port 6379.',
    [['Create PVC for Redis data','vim redis-pvc.yaml  =>  2Gi ReadWriteOnce'],
     ['Create Redis deployment','vim redis-deploy.yaml  =>  image: redis:7 / args: [--appendonly yes] / volumeMount: /data from PVC'],
     ['Create ClusterIP service','kubectl expose deployment redis --port=6379 --name=redis-svc'],
     ['Apply all manifests','kubectl apply -f redis-pvc.yaml -f redis-deploy.yaml'],
     ['Test Redis connection','kubectl run test --image=redis:7 --rm -it -- redis-cli -h redis-svc ping']],
    'PONG | Redis running with /data PVC | redis-svc ClusterIP:6379') },

  { n:2, lv:4, title:'Deploy MySQL on Kubernetes', detail: TT(
    'The Nautilus database team needs a production MySQL 8 instance on Kubernetes with credentials stored in a Secret, persistent storage, and a ClusterIP service for app pods to connect.',
    'Deploy MySQL 8 with a Secret for root password, 10Gi PVC, and ClusterIP service mysql-svc:3306.',
    [['Create Secret for credentials','kubectl create secret generic mysql-secret --from-literal=MYSQL_ROOT_PASSWORD=Str0ng@Pass'],
     ['Create 10Gi PVC','vim mysql-pvc.yaml  =>  10Gi ReadWriteOnce'],
     ['Create MySQL deployment','vim mysql-deploy.yaml  =>  image: mysql:8 / env from secret / volumeMount: /var/lib/mysql'],
     ['Create ClusterIP service','kubectl expose deployment mysql --port=3306 --name=mysql-svc'],
     ['Verify connectivity','kubectl run test --image=mysql:8 --rm -it -- mysql -h mysql-svc -u root -pStr0ng@Pass -e "SHOW DATABASES;"']],
    'Database | information_schema | mysql connected via mysql-svc:3306') },

  { n:3, lv:4, title:'Kubernetes Nginx and PhpFPM Setup', detail: TT(
    'The Nautilus platform team needs an optimized Nginx + PHP-FPM setup on Kubernetes where Nginx communicates with PHP-FPM via a Unix socket or TCP on port 9000 using a shared volume.',
    'Create a multi-container pod with Nginx and PHP-FPM sharing a web root volume, with Nginx proxying .php requests to PHP-FPM.',
    [['Create Nginx ConfigMap with fastcgi_pass','kubectl create configmap nginx-phpfpm-conf --from-file=default.conf  =>  location ~ .php$ { fastcgi_pass 127.0.0.1:9000; }'],
     ['Create multi-container pod','vim nginx-phpfpm-pod.yaml  =>  containers: [nginx, php-fpm] / shared emptyDir at /var/www/html'],
     ['Add init container to write index.php','initContainers: busybox writing <?php phpinfo(); to /var/www/html/index.php'],
     ['Apply pod and service','kubectl apply -f nginx-phpfpm-pod.yaml  &&  kubectl expose pod nginx-phpfpm-pod --port=80 --name=web-svc'],
     ['Test PHP via Nginx','curl http://web-svc/index.php  =>  phpinfo() output']],
    'phpinfo() rendered via Nginx+PHP-FPM | TCP proxy on port 9000 working') },

  { n:4, lv:4, title:'Deploy Drupal App on Kubernetes', detail: TT(
    'The Nautilus CMS team needs Drupal deployed on Kubernetes backed by a MySQL database, with persistent storage for uploads and Drupal files, accessible externally via NodePort.',
    'Deploy Drupal using drupal:10 with MySQL backend via ClusterIP and expose Drupal on NodePort 32090.',
    [['Deploy MySQL with secret and PVC','kubectl apply -f mysql-pvc.yaml -f mysql-secret.yaml -f mysql-deploy.yaml  &&  kubectl expose deployment mysql --port=3306 --name=drupal-mysql-svc'],
     ['Create PVC for Drupal files','vim drupal-pvc.yaml  =>  10Gi ReadWriteOnce  =>  mountPath: /var/www/html'],
     ['Deploy Drupal','vim drupal-deploy.yaml  =>  image: drupal:10 / env: MYSQL_HOST=drupal-mysql-svc / volumeMount: /var/www/html'],
     ['Expose Drupal via NodePort','kubectl expose deployment drupal --type=NodePort --port=80 --name=drupal-svc  =>  nodePort: 32090'],
     ['Complete Drupal installation','http://<node-ip>:32090  =>  Drupal installer  =>  configure DB host: drupal-mysql-svc']],
    'Drupal installer accessible at port 32090 | MySQL connection via drupal-mysql-svc') },

  { n:5, lv:4, title:'Deploy Guest Book App on Kubernetes', detail: TT(
    'The Nautilus team needs the classic Guestbook application deployed on Kubernetes: a Redis master for writes, Redis slaves for reads, and a PHP frontend — all interconnected via services.',
    'Deploy the full Guestbook: redis-master (1 replica), redis-slave (2 replicas), and frontend (3 replicas) connected via ClusterIP services.',
    [['Deploy Redis master and service','kubectl apply -f redis-master-deployment.yaml -f redis-master-service.yaml  =>  service: redis-master:6379'],
     ['Deploy Redis slaves and service','kubectl apply -f redis-slave-deployment.yaml -f redis-slave-service.yaml  =>  env: GET_HOSTS_FROM=dns / service: redis-slave:6379'],
     ['Deploy PHP frontend','kubectl apply -f frontend-deployment.yaml  =>  image: gcr.io/google-samples/gb-frontend:v4 / replicas: 3 / env: GET_HOSTS_FROM=dns'],
     ['Expose frontend via NodePort','kubectl apply -f frontend-service.yaml  =>  NodePort 32100'],
     ['Test the full Guestbook','http://<node-ip>:32100  =>  add a message  =>  verify it persists in Redis']],
    'Guestbook at port 32100 | messages persist via Redis master-slave replication') },
];


function TrackTaskCard({ item, accentColor, isSelected, onClick }: {
  item: TrackTask; accentColor: string; isSelected: boolean; onClick: () => void;
}) {
  const num = String(item.n).padStart(2, '0');
  return (
    <div onClick={onClick} title={item.title}
      style={{ background: isSelected ? `${accentColor}18` : '#0C1829', border: `1px solid ${isSelected ? accentColor + '55' : '#152235'}`, borderRadius: 10, padding: '12px 12px 10px', cursor: 'pointer', transition: 'all 0.15s', position: 'relative', overflow: 'hidden', outline: isSelected ? `2px solid ${accentColor}22` : 'none', outlineOffset: 2 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: isSelected ? accentColor : accentColor + '44', borderRadius: '10px 10px 0 0' }} />
      <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, lineHeight: 1, color: accentColor, marginBottom: 6, marginTop: 4 }}>{num}</div>
      <div style={{ fontSize: 11, lineHeight: 1.4, color: '#7A9BB5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 30 }}>{item.title}</div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${accentColor}22`, fontSize: 9, color: accentColor + '88' }}>
        {LV_XP[item.lv]} XP
      </div>
    </div>
  );
}

// ── Helper: highlight inline code tokens in instruction text ─────────────────
function InstructionText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|'[^']+'|\b(?:\/\S+|\w+@\w+|\w+\.\w+|\w+-\w+|--\w[\w-]*|-\w+|[A-Z][A-Z_0-9]{2,})\b)/g);
  return (
    <span>
      {parts.map((p, i) => {
        const isCode = p.startsWith('`') || p.startsWith("'") || /^(\/\S+|\w+@\w+|\w+\.\w+|\w+-\w+|--\w[\w-]*|-\w+|[A-Z][A-Z_0-9]{2,})$/.test(p);
        return isCode ? (
          <code key={i} style={{ background: 'rgba(0,196,255,0.1)', color: '#67E8F9', border: '1px solid rgba(0,196,255,0.2)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', fontSize: '0.9em' }}>
            {p.replace(/^`|`$|^'|'$/g, '')}
          </code>
        ) : <span key={i}>{p}</span>;
      })}
    </span>
  );
}

// ── Helper: render scenario text, splitting lettered sub-requirements ─────────
function ScenarioText({ text }: { text: string }) {
  // Split on newlines so lettered sub-points (a. b. c. …) become their own blocks
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const isSubReq = (l: string) => /^[a-e]\./i.test(l);
  const intro = lines.filter(l => !isSubReq(l));
  const subs  = lines.filter(l => isSubReq(l));
  return (
    <div style={{ fontSize: 14, color: '#A3B8CC', lineHeight: 1.75, margin: '0 0 20px', paddingBottom: 16, borderBottom: '1px solid #152235' }}>
      {intro.map((line, i) => (
        <p key={i} style={{ margin: '0 0 12px' }}><InstructionText text={line} /></p>
      ))}
      {subs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {subs.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, fontWeight: 700, color: '#67E8F9', fontFamily: 'monospace', fontSize: 13, paddingTop: 1 }}>
                {line.slice(0, 2)}
              </span>
              <p style={{ margin: 0, color: '#A3B8CC' }}><InstructionText text={line.slice(2).trim()} /></p>
            </div>
          ))}
        </div>
      )}
      <p style={{ margin: '12px 0 0', color: '#7A9BB5', fontStyle: 'italic' }}>Complete the task following the provided requirements.</p>
    </div>
  );
}

// ── Track detail panel ────────────────────────────────────────────────────────
function TrackDetailPanel({ item, accentColor, icon, trackName, onClose }: {
  item: TrackTask; accentColor: string; icon: string; trackName: string; onClose: () => void;
}) {
  const taskId = `${trackName.toLowerCase()}-${item.lv}-${item.n}`;
  const initialState = getTaskState(taskId);
  const [completed, setCompleted] = useState(initialState.completed);
  const [notes, setNotes] = useState(initialState.notes || '');
  const [lastSync, setLastSync] = useState(initialState.lastSync || '');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [showSolution, setShowSolution] = useState(false);
  if (!item?.detail) return null;
  const { context, steps, expected } = item.detail;
  const lvLabel = `Level ${item.lv}`;
  const xp = LV_XP[item.lv];
  const num = String(item.n).padStart(2, '0');

  return (
    <div style={{ background: '#0A1A2C', border: `1px solid ${accentColor}44`, borderRadius: 12, overflow: 'hidden', marginBottom: 20, boxShadow: `0 0 28px ${accentColor}0D` }}>
      {/* Terminal title bar */}
      <div style={{ background: '#0C1F34', borderBottom: `1px solid ${accentColor}22`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#EF4444','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#4A7A9B', fontFamily: 'monospace' }}>
          stratos.xfusioncorp.com — {trackName.toLowerCase()}-{lvLabel.toLowerCase().replace(' ','-')}-{num}
        </div>
        <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, padding: '1px 10px', fontSize: 10, letterSpacing: '1px' }}>● ACTIVE</span>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #1E2D47', borderRadius: 4, color: '#4A7A9B', fontSize: 11, padding: '2px 8px', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ padding: 24 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}33`, borderRadius: 8, padding: '5px 12px', fontSize: 11, color: accentColor }}>
            {icon} {trackName} · {lvLabel}
          </div>
          <div style={{ background: 'rgba(0,196,255,0.08)', border: '1px solid rgba(0,196,255,0.2)', borderRadius: 8, padding: '5px 12px', fontSize: 11, color: '#00C4FF' }}>
            🏅 {xp} XP
          </div>
        </div>

        {/* Task title */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#EEF2FF', margin: '0 0 14px', lineHeight: 1.3 }}>{item.title}</h3>

        {/* Scenario paragraph */}
        <ScenarioText text={context} />

        {/* Numbered instructions */}
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {steps.map(([lbl, _cmd], i) => (
            <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: `${accentColor}22`, border: `1px solid ${accentColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: accentColor }}>
                {i + 1}
              </span>
              <p style={{ margin: 0, fontSize: 14, color: '#C8D8E8', lineHeight: 1.65, paddingTop: 3 }}>
                <InstructionText text={lbl} />
              </p>
            </li>
          ))}
        </ol>

        {/* Solution toggle */}
        <div style={{ marginTop: 20, borderTop: '1px solid #152235', paddingTop: 16 }}>
          <button
            onClick={() => setShowSolution(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: showSolution ? `${accentColor}12` : '#0C1829', border: `1px solid ${showSolution ? accentColor + '44' : '#1E2D47'}`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: showSolution ? accentColor : '#4A7A9B', fontSize: 12, fontWeight: 600, width: '100%', transition: 'all 0.15s' }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{showSolution ? '▼' : '▶'}</span>
            {showSolution ? 'Hide Solution' : '💡 Show Solution Commands'}
          </button>

          {showSolution && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map(([lbl, cmd], i) => (
                <CmdLine key={i} label={`${i + 1} · ${lbl}`} cmd={cmd} locked={false} />
              ))}
              {expected && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: '#4A7A9B', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>Expected output</div>
                  <div style={{ background: '#040C18', border: '1px solid #0D2235', borderRadius: 6, padding: '10px 14px' }}>
                    <code style={{ color: '#A78BFA', fontFamily: 'monospace', fontSize: 12 }}>{expected}</code>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #152235', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: '#4A7A9B' }}>
            {completed ? 'Task completed. You can add notes below.' : 'Finish the task above, then mark it complete to add notes.'}
          </div>
          <button onClick={() => {
            const newVal = !completed;
            setCompleted(newVal);
            setTaskState(taskId, { completed: newVal, notes, lastSync });
          }} style={{ background: completed ? 'rgba(74,222,128,0.25)' : 'rgba(74,222,128,0.12)', color: completed ? '#A7F3D0' : '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 7, padding: '7px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            {completed ? '✅ Completed' : '✓ Mark Complete'}
          </button>
        </div>

        {completed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.3s ease' }}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn from this task? Note down key commands, concepts, or mistakes here..."
              style={{ width: '100%', height: 100, background: '#040C18', border: '1px solid #1E2D47', borderRadius: 8, padding: '12px 16px', color: '#C8D8E8', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#4A7A9B' }}>
                {lastSync ? `Last synced to GitHub: ${lastSync}` : 'Notes are saved locally. Sync to back them up.'}
              </span>
              <button
                onClick={async () => {
                  setIsSyncing(true);
                  const time = new Date().toLocaleTimeString();
                  setLastSync(time);
                  setTaskState(taskId, { completed, notes, lastSync: time });
                  await GitHubSyncService.autoSyncToGitHub();
                  setIsSyncing(false);
                }}
                disabled={isSyncing}
                style={{ background: '#0C1829', border: '1px solid #1E2D47', color: '#4A7A9B', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: isSyncing ? 'wait' : 'pointer', transition: 'all 0.15s' }}
              >
                {isSyncing ? 'Syncing...' : '🐙 Save & Sync'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ── Level section (collapsible) ───────────────────────────────────────────────
function LevelSection({ level, tasks, accentColor, trackName, selectedId, onSelect }: {
  level: number; tasks: TrackTask[]; accentColor: string;
  trackName: string; selectedId: string | null; onSelect: (id: string, t: TrackTask) => void;
}) {
  const [open, setOpen] = useState(level === 1);
  const xp = LV_XP[level];
  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: open ? `${accentColor}0D` : '#0C1829', border: `1px solid ${open ? accentColor + '33' : '#152235'}`, borderRadius: open ? '10px 10px 0 0' : 10, padding: '13px 18px', cursor: 'pointer', color: open ? accentColor : '#4A7A9B', transition: 'all 0.18s' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: open ? accentColor : '#2A3D52' }}>L{level}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: open ? '#EEF2FF' : '#4A7A9B' }}>Level {level}</div>
          <div style={{ fontSize: 11, color: '#2A3D52', marginTop: 1 }}>{tasks.length} tasks · {xp} XP each</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}33`, borderRadius: 20, padding: '2px 10px', fontSize: 10, fontFamily: 'monospace' }}>
            0/{tasks.length} done
          </span>
          <span style={{ fontSize: 11, color: open ? accentColor : '#2A3D52', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
        </div>
      </button>
      {open && (
        <div style={{ border: `1px solid ${accentColor}22`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 16, background: '#07101F' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {tasks.map(t => (
              <TrackTaskCard key={t.n} item={t} accentColor={accentColor} isSelected={selectedId === `${trackName}-${t.n}`} onClick={() => onSelect(`${trackName}-${t.n}`, t)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Challenge tab (Git / Linux / Jenkins) ─────────────────────────────────────
function ChallengeTab({ trackName, tasks }: { trackName: keyof typeof TRACK; tasks: TrackTask[] }) {
  const meta = TRACK[trackName] ?? { color: '#A78BFA', dim: 'rgba(167,139,250,0.12)', icon: '📋' };
  const [filterLv, setFilterLv]   = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TrackTask | null>(null);

  const levels = [1, 2, 3, 4];
  const visibleLevels = filterLv === 0 ? levels : [filterLv];
  const totalXP = tasks.reduce((s, t) => s + (LV_XP[t.lv] || 0), 0);

  const handleSelect = (id: string, item: TrackTask) => {
    if (selectedId === id) { setSelectedId(null); setSelectedItem(null); return; }
    setSelectedId(id); setSelectedItem(item);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '16px 20px', background: `${meta.color}0A`, border: `1px solid ${meta.color}22`, borderRadius: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#EEF2FF' }}>{meta.icon} {trackName} Track</div>
          <div style={{ fontSize: 12, color: '#4A7A9B', marginTop: 2 }}>{tasks.length} tasks · 4 levels · {totalXP.toLocaleString()} XP available</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: meta.color, fontFamily: 'monospace' }}>0</div>
          <div style={{ fontSize: 9, letterSpacing: '2px', color: '#4A7A9B', textTransform: 'uppercase' }}>XP Earned</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[{v:0,l:'All Levels'}, {v:1,l:'Level 1'}, {v:2,l:'Level 2'}, {v:3,l:'Level 3'}, {v:4,l:'Level 4'}].map(({ v, l }) => (
          <button key={v} onClick={() => setFilterLv(v)}
            style={{ background: filterLv === v ? `${meta.color}18` : 'transparent', border: `1px solid ${filterLv === v ? meta.color + '55' : '#152235'}`, borderRadius: 20, padding: '5px 16px', fontSize: 12, cursor: 'pointer', color: filterLv === v ? meta.color : '#4A7A9B', transition: 'all 0.15s', fontWeight: filterLv === v ? 700 : 400 }}>
            {v === 0 ? l : `${l} · ${tasks.filter(t => t.lv === v).length} tasks`}
          </button>
        ))}
      </div>

      {selectedItem && (
        <TrackDetailPanel item={selectedItem} accentColor={meta.color} icon={meta.icon} trackName={trackName} onClose={() => { setSelectedId(null); setSelectedItem(null); }} />
      )}

      {visibleLevels.map(lv => (
        <LevelSection key={lv} level={lv} tasks={tasks.filter(t => t.lv === lv)} accentColor={meta.color} trackName={trackName} selectedId={selectedId} onSelect={handleSelect} />
      ))}
    </div>
  );
}

// ── Category metadata ─────────────────────────────────────────────────────────
const CAT_META: Record<string, { color: string; dim: string; icon: string; range: string }> = {
  Linux:      { color: '#60A5FA', dim: 'rgba(96,165,250,0.12)',  icon: '🐧', range: '1–20'   },
  Git:        { color: '#FB923C', dim: 'rgba(251,146,60,0.12)',  icon: '🔀', range: '21–34'  },
  Docker:     { color: '#38BDF8', dim: 'rgba(56,189,248,0.12)',  icon: '🐳', range: '35–47'  },
  Kubernetes: { color: '#A78BFA', dim: 'rgba(167,139,250,0.12)', icon: '⚓', range: '48–67'  },
  Jenkins:    { color: '#F87171', dim: 'rgba(248,113,113,0.12)', icon: '⚙️', range: '68–81'  },
  Ansible:    { color: '#4ADE80', dim: 'rgba(74,222,128,0.12)',  icon: '📜', range: '82–93'  },
  Terraform:  { color: '#C084FC', dim: 'rgba(192,132,252,0.12)', icon: '🏗️', range: '94–100' },
};

const getCategory = (n: number): string => {
  if (n <= 20) return 'Linux';
  if (n <= 34) return 'Git';
  if (n <= 47) return 'Docker';
  if (n <= 67) return 'Kubernetes';
  if (n <= 81) return 'Jenkins';
  if (n <= 93) return 'Ansible';
  return 'Terraform';
};

// ── Task data type ────────────────────────────────────────────────────────────
interface TaskDetail {
  context: string;
  task: string;
  steps: [string, string][];
  expected: string;
}

const T = (c: string, t: string, s: [string, string][], e: string): TaskDetail => ({
  context: c, task: t, steps: s, expected: e,
});

// ── Full task detail data for all 100 days ────────────────────────────────────
const TASK_DETAILS: Record<number, TaskDetail> = {
  // ── LINUX (1-20) ─────────────────────────────────────────────────────────────
  1: T('The backup agent requires a system account that cannot be used for interactive login.',
    'Create user john with a non-interactive shell on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Create non-interactive user','sudo useradd -s /sbin/nologin john'],
     ['Verify the entry','grep \'^john\' /etc/passwd']],
    'john:x:1001:1001::/home/john:/sbin/nologin'),

  2: T('A contractor needs temporary server access that auto-expires without manual cleanup.',
    'Create user mark with account expiry 2024-02-17 on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Create user with expiry date','sudo useradd -e 2024-02-17 mark'],
     ['Set a temporary password','sudo passwd mark'],
     ['Verify expiry date','sudo chage -l mark | grep \'Account expires\'']],
    'Account expires: Feb 17, 2024'),

  3: T('Security audit requires disabling direct root SSH to prevent brute-force attacks.',
    'Disable root SSH login on all three App Servers and restart sshd.',
    [['SSH to each App Server','ssh tony@stapp01  |  ssh steve@stapp02  |  ssh banner@stapp03'],
     ['Edit sshd_config','sudo vi /etc/ssh/sshd_config'],
     ['Set the directive','PermitRootLogin no'],
     ['Restart SSH daemon','sudo systemctl restart sshd'],
     ['Verify setting','grep PermitRootLogin /etc/ssh/sshd_config']],
    'PermitRootLogin no'),

  4: T('An automation script deployed by the dev team is missing its execute bit.',
    'Give the owner execute permission on /opt/scripts/process.sh on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Check current permissions','ls -l /opt/scripts/process.sh'],
     ['Add execute for owner','sudo chmod u+x /opt/scripts/process.sh'],
     ['Verify new permissions','ls -l /opt/scripts/process.sh']],
    '-rwxr--r-- 1 root root /opt/scripts/process.sh'),

  5: T('Compliance audit mandates SELinux enforcing mode to meet security standards.',
    'Set SELinux to enforcing mode on App Server 2 and persist it across reboots.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Set enforcing mode immediately','sudo setenforce 1'],
     ['Persist across reboots','sudo sed -i \'s/^SELINUX=.*/SELINUX=enforcing/\' /etc/selinux/config'],
     ['Verify current mode','getenforce']],
    'Enforcing'),

  6: T('Log cleanup must run nightly to prevent disk space exhaustion on production servers.',
    'Schedule /usr/bin/cleanup.sh at 11:00 PM daily for user mark on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Edit mark\'s crontab','sudo crontab -u mark -e'],
     ['Add cron entry','0 23 * * * /usr/bin/cleanup.sh'],
     ['Verify cron entry','sudo crontab -u mark -l']],
    '0 23 * * * /usr/bin/cleanup.sh'),

  7: T('Automation requires passwordless SSH between the jump host and all App Servers.',
    'Set up RSA key-based SSH authentication for user mark from jump host to all App Servers.',
    [['Generate RSA key pair','ssh-keygen -t rsa -b 4096 -N \'\' -f ~/.ssh/id_rsa'],
     ['Copy key to App Server 1','ssh-copy-id mark@stapp01'],
     ['Copy key to App Server 2','ssh-copy-id mark@stapp02'],
     ['Copy key to App Server 3','ssh-copy-id mark@stapp03'],
     ['Test passwordless login','ssh mark@stapp01 \'hostname\'']],
    'stapp01  (no password prompt)'),

  8: T('The team is adopting Ansible for infrastructure automation and needs it on the control node.',
    'Install Ansible on the jump host and verify the installation.',
    [['Install EPEL repository','sudo dnf install -y epel-release'],
     ['Install Ansible','sudo dnf install -y ansible'],
     ['Verify version','ansible --version'],
     ['Check Python interpreter','ansible --version | grep python']],
    'ansible [core 2.x.x] | python version = 3.x.x'),

  9: T('The MariaDB service on App Server 1 is failing to start, blocking the application team.',
    'Investigate and fix the MariaDB service on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Check service status','sudo systemctl status mariadb'],
     ['View error logs','sudo journalctl -u mariadb -n 30 --no-pager'],
     ['Start and enable service','sudo systemctl enable --now mariadb'],
     ['Test DB connection','mysql -u root -e \'SHOW DATABASES;\'']],
    'Database | information_schema | mysql | performance_schema'),

  10: T('The production support team of xFusionCorp Industries is working on developing some bash scripts to automate different day to day tasks. One is to create a bash script for archiving website content files. They have a static website running on App Server 2 in Stratos Datacenter, and they need to create a bash script named official_archive.sh which should accomplish the following tasks. (Also remember to place the script under the /scripts directory on App Server 2).\na. Create a zip archive named xfusioncorp_official.zip of /var/www/html/official directory.\nb. Save the archive in the /archives/ directory on the App Server 2. This is a temporary storage, as archives from this location will be cleaned on a weekly basis. Therefore, the archive should also be copied to the Nautilus Storage Server so it can be retrieved later for validation purposes.\nc. Copy the created archive to the Nautilus Storage Server server in the /archives/ location.\nd. Please make sure script won\'t ask for password while copying the archive file. Additionally, the respective server user (for example, tony in case of App Server 1) must be able to run it.\ne. Do not use sudo inside the script.',
    'Create official_archive.sh under /scripts on App Server 2 with all five requirements met.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Set up passwordless SSH to Storage Server (required for scp without password prompt)','ssh-copy-id natasha@ststor01'],
     ['Create the script file under /scripts','vim /scripts/official_archive.sh'],
     ['Add script content — zip the directory into /archives/ then scp to Storage Server (no sudo)','#!/bin/bash\nzip -r /archives/xfusioncorp_official.zip /var/www/html/official\nscp /archives/xfusioncorp_official.zip natasha@ststor01:/archives/'],
     ['Make the script executable by the server user steve','chmod +x /scripts/official_archive.sh'],
     ['Run the script as steve to verify it executes without password prompts','bash /scripts/official_archive.sh'],
     ['Verify archive exists locally on stapp02','ls -lh /archives/xfusioncorp_official.zip'],
     ['Verify archive was copied to the Nautilus Storage Server','ssh natasha@ststor01 ls -lh /archives/xfusioncorp_official.zip']],
    'xfusioncorp_official.zip present in /archives/ on stapp02 AND ststor01 | no password prompt | no sudo used'),

  11: T('The dev team needs a Java application server for deploying WAR files on App Server 2.',
    'Install Tomcat 9, start the service, and verify it responds on port 8080.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Install Java 11','sudo dnf install -y java-11-openjdk'],
     ['Install Tomcat','sudo dnf install -y tomcat'],
     ['Enable and start service','sudo systemctl enable --now tomcat'],
     ['Verify port 8080','curl -s http://localhost:8080 | head -5']],
    'Apache Tomcat/9.x default welcome page HTML'),

  12: T('NFS file sharing must be configured on the Storage Server for App Server mounts.',
    'Install NFS utilities and ensure nfs-server and rpcbind are running on the Storage Server.',
    [['SSH to Storage Server','ssh natasha@ststor01'],
     ['Install NFS utilities','sudo dnf install -y nfs-utils'],
     ['Enable both services','sudo systemctl enable --now nfs-server rpcbind'],
     ['Check service status','sudo systemctl is-active nfs-server && sudo systemctl is-active rpcbind']],
    'active | active'),

  13: T('Firewall rules are needed to restrict inbound traffic on App Server 2 to only allowed ports.',
    'Configure iptables on App Server 2: allow SSH/HTTP/HTTPS inbound, drop all other inbound.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Install iptables-services','sudo dnf install -y iptables-services'],
     ['Allow SSH, HTTP, HTTPS','sudo iptables -A INPUT -p tcp -m multiport --dports 22,80,443 -j ACCEPT'],
     ['Set default DROP policy','sudo iptables -P INPUT DROP'],
     ['Save rules','sudo service iptables save'],
     ['Verify rules','sudo iptables -L INPUT -n']],
    'ACCEPT tcp dpt:22 | ACCEPT tcp dpt:80 | ACCEPT tcp dpt:443'),

  14: T('A runaway process is consuming excessive CPU on App Server 3, degrading other services.',
    'Identify the top CPU-consuming process on App Server 3 and terminate it gracefully.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Find top CPU processes','ps aux --sort=-%cpu | head -10'],
     ['Get the PID','top -bn1 | awk \'NR>7{print $1,$9,$11}\' | head -5'],
     ['Send graceful SIGTERM','sudo kill -15 <PID>'],
     ['Verify process stopped','ps aux | grep <process_name> | grep -v grep']],
    'Process no longer visible in ps output'),

  15: T('The web team needs HTTPS on Nginx to encrypt traffic; a self-signed cert is acceptable.',
    'Generate a self-signed SSL cert and configure Nginx on App Server 1 to serve HTTPS on port 443.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Create SSL directory','sudo mkdir -p /etc/nginx/ssl'],
     ['Generate self-signed cert','sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt -subj \'/CN=stapp01\''],
     ['Configure Nginx SSL block','sudo vim /etc/nginx/conf.d/ssl.conf'],
     ['Test config and reload','sudo nginx -t && sudo systemctl reload nginx'],
     ['Verify HTTPS response','curl -k https://localhost -I | head -3']],
    'HTTP/1.1 200 OK'),

  16: T('High-traffic web apps need load balancing across App Servers 1 and 2 via the LB Server.',
    'Configure Nginx on stlb01 to distribute traffic round-robin to stapp01 and stapp02.',
    [['SSH to Load Balancer','ssh loki@stlb01'],
     ['Install Nginx','sudo dnf install -y nginx'],
     ['Configure upstream block','sudo vim /etc/nginx/nginx.conf  =>  upstream backend { server stapp01; server stapp02; }'],
     ['Test config','sudo nginx -t'],
     ['Enable and start Nginx','sudo systemctl enable --now nginx'],
     ['Test load balancing','curl http://stlb01 && curl http://stlb01']],
    'Responses alternating from stapp01 and stapp02'),

  17: T('The analytics team needs a PostgreSQL database for reporting workloads on the DB Server.',
    'Install PostgreSQL, initialize it, create database kodekloud_db and user kodekloud_u1.',
    [['SSH to DB Server','ssh peter@stdb01'],
     ['Install PostgreSQL','sudo dnf install -y postgresql-server postgresql-contrib'],
     ['Initialize DB cluster','sudo postgresql-setup --initdb'],
     ['Enable and start service','sudo systemctl enable --now postgresql'],
     ['Create database and user','sudo -u postgres psql -c "CREATE DATABASE kodekloud_db; CREATE USER kodekloud_u1 WITH PASSWORD \'Kodekloud@123\';"'],
     ['Verify connection','sudo -u postgres psql -d kodekloud_db -c \'\\conninfo\'']],
    'You are connected to database \'kodekloud_db\' as user \'postgres\''),

  18: T('A new microservice requires a MySQL backend with a dedicated database and user on the DB Server.',
    'Install MySQL, secure it, and create database apps_db with user apps_user.',
    [['SSH to DB Server','ssh peter@stdb01'],
     ['Install MySQL server','sudo dnf install -y mysql-server'],
     ['Enable and start MySQL','sudo systemctl enable --now mysqld'],
     ['Run secure installation','sudo mysql_secure_installation'],
     ['Create DB and user','sudo mysql -u root -p -e "CREATE DATABASE apps_db; CREATE USER \'apps_user\'@\'localhost\' IDENTIFIED BY \'Apps@123\'; GRANT ALL ON apps_db.* TO \'apps_user\'@\'localhost\';"'],
     ['Verify databases','sudo mysql -u root -p -e \'SHOW DATABASES;\'']],
    'apps_db | information_schema | mysql | performance_schema'),

  19: T('The e-commerce team needs their PHP application deployed on App Server 2 via Apache.',
    'Deploy the web app to /var/www/html on App Server 2 with correct permissions and start Apache.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Install Apache and PHP','sudo dnf install -y httpd php php-mysqlnd'],
     ['Deploy app files','sudo cp -r /tmp/webapp/* /var/www/html/'],
     ['Set ownership','sudo chown -R apache:apache /var/www/html && sudo chmod -R 755 /var/www/html'],
     ['Enable and start Apache','sudo systemctl enable --now httpd'],
     ['Test response','curl -s http://localhost | grep -i \'welcome\'']],
    'Welcome to xFusionCorp Application'),

  20: T('The team wants Nginx and PHP-FPM to communicate via Unix socket for lower latency.',
    'Configure PHP-FPM to use a Unix socket and update Nginx fastcgi_pass on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Install Nginx and PHP-FPM','sudo dnf install -y nginx php php-fpm'],
     ['Set PHP-FPM socket path','sudo sed -i \'s|listen = .*|listen = /run/php-fpm/www.sock|\' /etc/php-fpm.d/www.conf'],
     ['Set socket ownership','sudo sed -i \'s/;listen.owner = .*/listen.owner = nginx/\' /etc/php-fpm.d/www.conf'],
     ['Configure Nginx fastcgi_pass','sudo vim /etc/nginx/conf.d/php.conf  =>  fastcgi_pass unix:/run/php-fpm/www.sock'],
     ['Start both services','sudo systemctl enable --now php-fpm nginx && ls -la /run/php-fpm/www.sock']],
    'srw-rw---- 1 nginx nginx /run/php-fpm/www.sock'),

  // ── GIT (21-34) ──────────────────────────────────────────────────────────────
  21: T('The dev team needs a central bare Git repository on the Storage Server for collaborative work.',
    'Initialize a bare repository at /opt/repos/project.git on the Storage Server.',
    [['SSH to Storage Server','ssh natasha@ststor01'],
     ['Create target directory','sudo mkdir -p /opt/repos/project.git'],
     ['Initialize bare repo','sudo git init --bare /opt/repos/project.git'],
     ['Set ownership','sudo chown -R natasha:natasha /opt/repos/project.git'],
     ['Verify repo structure','ls /opt/repos/project.git']],
    'HEAD  branches  config  description  hooks  info  objects  refs'),

  22: T('A developer needs a working copy of the project repository on App Server 1.',
    'Clone the bare repo from /opt/repos/project.git to /usr/src/kodekloudrepos/project on App Server 1.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Clone the repo','sudo git clone ssh://natasha@ststor01/opt/repos/project.git /usr/src/kodekloudrepos/project'],
     ['Verify clone contents','ls /usr/src/kodekloudrepos/project'],
     ['Check remote URL','cd /usr/src/kodekloudrepos/project && git remote -v']],
    'origin  ssh://natasha@ststor01/opt/repos/project.git (fetch)'),

  23: T('A developer needs their own copy of the repo to experiment without affecting the original.',
    'Fork the sarah/story-blog repository on Gitea and clone your fork to the jump host.',
    [['Log in to Gitea','http://git.stratos.xfusioncorp.com — use your credentials'],
     ['Fork via Gitea API','curl -X POST http://git.stratos.xfusioncorp.com/api/v1/repos/sarah/story-blog/forks -u \'your_user:your_pass\''],
     ['Clone your fork','git clone http://git.stratos.xfusioncorp.com/your_user/story-blog'],
     ['Verify remote URL','cd story-blog && git remote -v']],
    'origin  http://git.stratos.xfusioncorp.com/your_user/story-blog (fetch)'),

  24: T('The team follows Gitflow and needs feature branches for parallel development streams.',
    'Create and push branches feature/branch1 and feature/branch2 in the project repo.',
    [['Navigate to repo','cd /usr/src/kodekloudrepos/project'],
     ['Create and push branch1','git checkout -b feature/branch1 && git push origin feature/branch1'],
     ['Return to main','git checkout main'],
     ['Create and push branch2','git checkout -b feature/branch2 && git push origin feature/branch2'],
     ['Verify remote branches','git branch -r']],
    'origin/feature/branch1  origin/feature/branch2  origin/main'),

  25: T('A completed feature branch is approved and ready to be merged into main.',
    'Merge feature/branch1 into main with a merge commit and push the result.',
    [['Switch to main','git checkout main && git pull origin main'],
     ['Merge with commit message','git merge feature/branch1 --no-ff -m \'Merge feature/branch1 into main\''],
     ['Push merged main','git push origin main'],
     ['Verify merge commit','git log --oneline -5']],
    'Merge commit visible at top of git log'),

  26: T('The team is migrating to a new Git server and remote URLs need updating in all clones.',
    'Update the origin remote URL to the new Gitea server and add an upstream remote.',
    [['Check current remotes','git remote -v'],
     ['Update origin URL','git remote set-url origin http://git.stratos.xfusioncorp.com/sarah/story-blog.git'],
     ['Add upstream remote','git remote add upstream http://git.stratos.xfusioncorp.com/org/story-blog.git'],
     ['Verify both remotes','git remote -v']],
    'origin  http://git.stratos.xfusioncorp.com/sarah/story-blog.git (fetch)'),

  27: T('A breaking bug was introduced in the last commit and must be reversed without rewriting history.',
    'Revert the last commit on main branch using git revert to preserve the commit history.',
    [['View recent commits','git log --oneline -5'],
     ['Revert the last commit','git revert HEAD --no-edit'],
     ['Push the revert commit','git push origin main'],
     ['Verify revert in log','git log --oneline -5']],
    'Revert \'<commit-message>\' visible at top of git log'),

  28: T('A hotfix committed on a feature branch needs applying to main without a full branch merge.',
    'Cherry-pick the specific hotfix commit from feature/hotfix onto the main branch.',
    [['Find the commit hash','git log feature/hotfix --oneline | head -5'],
     ['Checkout main branch','git checkout main'],
     ['Cherry-pick the commit','git cherry-pick <commit-hash>'],
     ['Push to remote','git push origin main'],
     ['Verify commit on main','git log --oneline -3']],
    'Cherry-picked commit now on top of main branch'),

  29: T('Code review policy requires all changes to go through pull requests before merging to main.',
    'Create a pull request on Gitea from feature/branch2 to main, review, and merge it.',
    [['Push feature branch','git push origin feature/branch2'],
     ['Open Gitea PR UI','http://git.stratos.xfusioncorp.com — New Pull Request from feature/branch2 to main'],
     ['Review changes in Gitea','Examine the diff and leave approval comment'],
     ['Merge the PR','Click Merge Pull Request in Gitea UI'],
     ['Pull merged main locally','git checkout main && git pull origin main']],
    'Merge pull request from feature/branch2 visible in git log'),

  30: T('Experimental commits must be completely discarded including working directory changes.',
    'Hard reset main to 2 commits before HEAD, permanently discarding the last two commits.',
    [['View current commit log','git log --oneline -6'],
     ['Hard reset 2 commits back','git reset --hard HEAD~2'],
     ['Force push to remote','git push origin main --force'],
     ['Verify commits removed','git log --oneline -4']],
    'Last 2 commits no longer visible in git log'),

  31: T('A developer needs to switch branches mid-task without committing incomplete work.',
    'Stash in-progress changes, commit a fix on feature/branch1, then restore the stash.',
    [['Stash current changes','git stash push -m \'WIP: partial feature work\''],
     ['Switch and commit a fix','git checkout feature/branch1 && echo fix > fix.txt && git add . && git commit -m \'JIRA-031: quick fix\''],
     ['Return to original branch','git checkout main'],
     ['Restore stash','git stash pop'],
     ['Verify changes restored','git status']],
    'Changes restored from stash | modified files visible in git status'),

  32: T('The feature branch is behind main and needs a clean linear history before merging.',
    'Rebase feature/branch1 onto the latest main branch for a linear commit history.',
    [['Checkout the feature branch','git checkout feature/branch1'],
     ['Fetch latest main','git fetch origin main'],
     ['Rebase onto main','git rebase origin/main'],
     ['Resolve any conflicts','git add . && git rebase --continue  (if conflicts arise)'],
     ['Force push rebased branch','git push origin feature/branch1 --force-with-lease']],
    'Linear history: feature commits directly on top of latest main'),

  33: T('Two developers modified the same file causing a conflict that must be resolved manually.',
    'Resolve the merge conflict in story.txt between main and feature/branch1, keeping both changes.',
    [['Attempt the merge','git merge feature/branch1'],
     ['Identify conflicted files','git status | grep \'both modified\''],
     ['Open and resolve conflict','vim story.txt  =>  remove <<<, ===, >>> markers; keep both content blocks'],
     ['Stage the resolved file','git add story.txt'],
     ['Complete the merge commit','git commit -m \'Resolve merge conflict in story.txt\'']],
    'Merge completed — conflict markers removed, both changes preserved'),

  34: T('The team needs automated commit message validation to enforce JIRA ticket ID standards.',
    'Create a commit-msg hook that rejects commits without a JIRA ID prefix (e.g. JIRA-123).',
    [['Navigate to hooks directory','cd /usr/src/kodekloudrepos/project/.git/hooks'],
     ['Create the hook file','vim commit-msg'],
     ['Hook content','#!/bin/bash  =>  if ! grep -qE \'^[A-Z]+-[0-9]+\' "$1"; then echo \'Must start with JIRA-ID\'; exit 1; fi'],
     ['Make hook executable','chmod +x commit-msg'],
     ['Test rejection','git commit -m \'bad message\'  =>  should fail with error'],
     ['Test acceptance','git commit -m \'JIRA-034: valid message\'  =>  should succeed']],
    'Hook rejects bad commit | accepts JIRA-prefixed commit message'),

  // ── DOCKER (35-47) ───────────────────────────────────────────────────────────
  35: T('App Server 1 needs Docker installed to run containerized workloads in the environment.',
    'Install Docker Engine on App Server 1, start on boot, and add tony to the docker group.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Install Docker','sudo dnf install -y docker'],
     ['Enable and start Docker','sudo systemctl enable --now docker'],
     ['Add user to docker group','sudo usermod -aG docker tony'],
     ['Verify installation','docker --version && docker run hello-world']],
    'Docker version x.x.x | Hello from Docker!'),

  36: T('The web team needs an Nginx container for a quick static site deployment on App Server 2.',
    'Run an Nginx container named nginx_app mapped to host port 80 on App Server 2.',
    [['SSH to App Server 2','ssh steve@stapp02'],
     ['Pull Nginx image','docker pull nginx:latest'],
     ['Run detached container','docker run -d --name nginx_app -p 80:80 nginx:latest'],
     ['Verify it is running','docker ps | grep nginx_app'],
     ['Test HTTP response','curl -s http://localhost | grep -i nginx']],
    'nginx_app  Up x minutes  0.0.0.0:80->80/tcp'),

  37: T('A custom HTML file needs injecting into a running Nginx container without rebuilding the image.',
    'Copy /tmp/index.html from the host into /usr/share/nginx/html/ inside the nginx_app container.',
    [['Verify container is running','docker ps | grep nginx_app'],
     ['Copy file into container','docker cp /tmp/index.html nginx_app:/usr/share/nginx/html/index.html'],
     ['Verify inside container','docker exec nginx_app cat /usr/share/nginx/html/index.html'],
     ['Test response via curl','curl -s http://localhost']],
    'Custom index.html content served by Nginx'),

  38: T('The team needs specific Ubuntu image versions available locally for consistent test environments.',
    'Pull both ubuntu:20.04 and ubuntu:latest images on App Server 3.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Pull ubuntu 20.04','docker pull ubuntu:20.04'],
     ['Pull ubuntu latest','docker pull ubuntu:latest'],
     ['List pulled images','docker images | grep ubuntu']],
    'ubuntu  20.04  <id>  ... | ubuntu  latest  <id>  ...'),

  39: T('A running container with custom software needs saving as a reusable image for the team.',
    'Commit the nginx_app running container as image custom_nginx:v1.',
    [['Make a change inside the container','docker exec nginx_app bash -c \'echo xFusionCorp > /opt/info.txt\''],
     ['Commit container to new image','docker commit nginx_app custom_nginx:v1'],
     ['Verify image created','docker images | grep custom_nginx'],
     ['Test the new image','docker run --rm custom_nginx:v1 cat /opt/info.txt']],
    'custom_nginx  v1  <id>  ... | xFusionCorp (from test run)'),

  40: T('The ops team must perform in-container maintenance tasks without restarting the container.',
    'Inside the running nginx_app container, create /opt/data.txt with content xFusionCorp.',
    [['Check container is running','docker ps | grep nginx_app'],
     ['Create file inside container','docker exec nginx_app bash -c \'echo xFusionCorp > /opt/data.txt\''],
     ['Verify file content','docker exec nginx_app cat /opt/data.txt']],
    'xFusionCorp'),

  41: T('The dev team needs a repeatable Docker image build for their Python Flask application.',
    'Write a Dockerfile that builds from python:3.9-slim, installs Flask, and runs app.py on port 5000.',
    [['Create project directory','mkdir flask-app && cd flask-app'],
     ['Write requirements.txt','echo flask > requirements.txt'],
     ['Write Dockerfile','FROM python:3.9-slim | WORKDIR /app | COPY . . | RUN pip install -r requirements.txt | EXPOSE 5000 | CMD python app.py'],
     ['Build the image','docker build -t flask-app:v1 .'],
     ['Run and test','docker run -d -p 5000:5000 flask-app:v1 && curl http://localhost:5000']],
    'Flask app responding on port 5000'),

  42: T('Containers need isolated network communication without exposing internal ports to the host.',
    'Create custom bridge network xfusion_net and run two containers connected to it.',
    [['Create custom bridge network','docker network create --driver bridge xfusion_net'],
     ['Run container 1 on the network','docker run -d --name app1 --network xfusion_net nginx:alpine'],
     ['Run container 2 on the network','docker run -d --name app2 --network xfusion_net nginx:alpine'],
     ['Test inter-container ping','docker exec app1 ping -c 2 app2'],
     ['Inspect network','docker network inspect xfusion_net']],
    '2 packets transmitted, 2 received — ping via hostname succeeds'),

  43: T('The application needs specific host-to-container port mappings for multiple service endpoints.',
    'Run an httpd container mapping host port 8080 to container port 80, and 8443 to 443.',
    [['Run httpd with port mappings','docker run -d --name web_server -p 8080:80 -p 8443:443 httpd:latest'],
     ['Verify port mappings','docker port web_server'],
     ['Test port 8080','curl -s http://localhost:8080 | head -3'],
     ['List running container','docker ps | grep web_server']],
    '80/tcp -> 0.0.0.0:8080 | 443/tcp -> 0.0.0.0:8443'),

  44: T('The team needs a multi-container WordPress and MySQL stack defined in a single Compose file.',
    'Write a docker-compose.yml with WordPress on port 8080 and a MySQL backend service.',
    [['Create docker-compose.yml','vim docker-compose.yml'],
     ['Define MySQL service','service mysql: image mysql:8.0, MYSQL_ROOT_PASSWORD, MYSQL_DATABASE'],
     ['Define WordPress service','service wordpress: image wordpress:latest, port 8080:80, depends_on mysql'],
     ['Start the stack','docker compose up -d'],
     ['Verify services running','docker compose ps'],
     ['Test WordPress','curl -s http://localhost:8080 | grep -i wordpress']],
    'wordpress Running 0.0.0.0:8080->80/tcp | mysql Running 3306/tcp'),

  45: T('A broken Dockerfile in the CI pipeline is failing builds and must be debugged and fixed.',
    'Fix all errors in /opt/docker/Dockerfile on App Server 3 so the image builds successfully.',
    [['SSH to App Server 3','ssh banner@stapp03'],
     ['Attempt build to reveal errors','cd /opt/docker && docker build -t test-image . 2>&1 | head -20'],
     ['Inspect the Dockerfile','cat Dockerfile  =>  look for typos, wrong base image, or bad syntax'],
     ['Apply fixes','vim Dockerfile'],
     ['Rebuild image','docker build -t test-image .'],
     ['Verify build success','docker images | grep test-image']],
    'test-image  latest  <id>  ... (BUILD successful)'),

  46: T('The dev team needs a Node.js app containerized with persistent volume storage on App Server 1.',
    'Build and run the nodeapp container from /opt/app on port 3000 with a volume mount.',
    [['SSH to App Server 1','ssh tony@stapp01'],
     ['Build image from app dir','cd /opt/app && docker build -t nodeapp:v1 .'],
     ['Run with volume mount','docker run -d --name nodeapp -p 3000:3000 -v /opt/app/data:/app/data nodeapp:v1'],
     ['Verify it is running','docker ps | grep nodeapp'],
     ['Test the endpoint','curl http://localhost:3000']],
    'Node.js app response on port 3000'),

  47: T('The data team needs a Python script containerized and published to Docker Hub for portability.',
    'Containerize /opt/python-app/process.py and push image nayagk/python-app:v1 to Docker Hub.',
    [['Write Dockerfile','FROM python:3.10-alpine | WORKDIR /app | COPY process.py . | CMD python process.py'],
     ['Build the image','docker build -t nayagk/python-app:v1 .'],
     ['Test locally','docker run --rm nayagk/python-app:v1'],
     ['Log in to Docker Hub','docker login'],
     ['Push to registry','docker push nayagk/python-app:v1']],
    'Image pushed: nayagk/python-app:v1 on Docker Hub'),

  // ── KUBERNETES (48-67) ───────────────────────────────────────────────────────
  48: T('The ops team needs to verify pod scheduling works correctly in the Kubernetes cluster.',
    'Create a Pod named web-pod using nginx:alpine image in the default namespace.',
    [['Generate pod YAML','kubectl run web-pod --image=nginx:alpine --restart=Never --dry-run=client -o yaml > pod.yaml'],
     ['Apply the pod','kubectl apply -f pod.yaml'],
     ['Check pod status','kubectl get pod web-pod'],
     ['Describe pod events','kubectl describe pod web-pod | tail -10']],
    'web-pod  1/1  Running  0  <age>'),

  49: T('Production workloads need self-healing and rolling update capability via Kubernetes Deployments.',
    'Create a Deployment httpd-deployment with 3 replicas using image httpd:2.4.43.',
    [['Create the deployment','kubectl create deployment httpd-deployment --image=httpd:2.4.43 --replicas=3'],
     ['Monitor rollout','kubectl rollout status deployment/httpd-deployment'],
     ['Verify 3 replicas ready','kubectl get pods -l app=httpd-deployment'],
     ['Describe deployment','kubectl describe deployment httpd-deployment | grep -A3 Replicas']],
    '3/3 replicas Ready | AVAILABLE 3'),

  50: T('Resource contention is causing OOM kills on cluster nodes; pods need explicit resource limits.',
    'Create pod resource-pod with requests 100m CPU/128Mi RAM and limits 200m CPU/256Mi RAM.',
    [['Write resource pod YAML','vim resource-pod.yaml'],
     ['Add resources block','resources: requests: {cpu: 100m, memory: 128Mi}  limits: {cpu: 200m, memory: 256Mi}'],
     ['Apply the pod','kubectl apply -f resource-pod.yaml'],
     ['Verify limits applied','kubectl describe pod resource-pod | grep -A4 \'Limits\'']],
    'Limits: cpu 200m, memory 256Mi | Requests: cpu 100m, memory 128Mi'),

  51: T('A new image version needs deploying with zero downtime using Kubernetes rolling updates.',
    'Update httpd-deployment image from httpd:2.4.43 to httpd:2.4.46.',
    [['Check current image','kubectl describe deploy httpd-deployment | grep Image'],
     ['Set the new image','kubectl set image deployment/httpd-deployment httpd=httpd:2.4.46'],
     ['Monitor rollout status','kubectl rollout status deployment/httpd-deployment'],
     ['Verify new image on pods','kubectl describe pods -l app=httpd-deployment | grep Image']],
    'deployment.apps/httpd-deployment successfully rolled out'),

  52: T('The newly deployed version has a critical bug and must be rolled back to the previous stable release.',
    'Roll back httpd-deployment to its previous revision immediately.',
    [['Check rollout history','kubectl rollout history deployment/httpd-deployment'],
     ['Undo to previous revision','kubectl rollout undo deployment/httpd-deployment'],
     ['Monitor the rollback','kubectl rollout status deployment/httpd-deployment'],
     ['Verify old image restored','kubectl describe deployment httpd-deployment | grep Image']],
    'Rolled back to revision 1 | Image: httpd:2.4.43'),

  53: T('A pod is stuck in CrashLoopBackOff due to an incorrect volumeMount path in its spec.',
    'Fix the volumeMount configuration in /opt/manifests/broken-pod.yaml and re-deploy.',
    [['Describe pod errors','kubectl describe pod broken-pod | grep -A5 Warning'],
     ['View the manifest','cat /opt/manifests/broken-pod.yaml'],
     ['Fix mountPath in YAML','vim /opt/manifests/broken-pod.yaml  =>  correct the mountPath field'],
     ['Delete old pod','kubectl delete pod broken-pod'],
     ['Apply fixed manifest','kubectl apply -f /opt/manifests/broken-pod.yaml'],
     ['Verify Running','kubectl get pod broken-pod']],
    'broken-pod  1/1  Running  0  <age>'),

  54: T('Two containers in the same pod need to share data via a common emptyDir volume.',
    'Create a pod with nginx and busybox containers sharing an emptyDir at /shared-data.',
    [['Write shared volume pod YAML','vim shared-vol.yaml  =>  emptyDir volume, both containers mountPath: /shared-data'],
     ['Apply the pod','kubectl apply -f shared-vol.yaml'],
     ['Write from busybox container','kubectl exec <pod-name> -c busybox -- sh -c \'echo hello > /shared-data/test.txt\''],
     ['Read from nginx container','kubectl exec <pod-name> -c nginx -- cat /shared-data/test.txt']],
    'hello  (same file visible from both containers)'),

  55: T('Application logs must be shipped by a sidecar log-agent container alongside the main app.',
    'Create a pod with nginx as main container and busybox sidecar tailing the nginx access log.',
    [['Write sidecar pod YAML','vim sidecar.yaml  =>  shared emptyDir, busybox: tail -f /logs/access.log, nginx writes logs to /logs/'],
     ['Apply the pod','kubectl apply -f sidecar.yaml'],
     ['Verify both containers','kubectl get pod sidecar-pod -o jsonpath=\'{.spec.containers[*].name}\''],
     ['Check sidecar output','kubectl logs sidecar-pod -c busybox']],
    'nginx busybox | sidecar tailing nginx log entries'),

  56: T('The team needs a production Nginx deployment exposed outside the cluster via a NodePort Service.',
    'Deploy Nginx with 2 replicas and expose it via NodePort Service on port 30080.',
    [['Create Nginx deployment','kubectl create deployment nginx-web --image=nginx:1.21 --replicas=2'],
     ['Expose as NodePort','kubectl expose deployment nginx-web --type=NodePort --port=80 --node-port=30080'],
     ['Verify deployment','kubectl get deploy nginx-web'],
     ['Verify service','kubectl get svc nginx-web'],
     ['Test external access','curl http://<node-ip>:30080']],
    '2/2 replicas Ready | NodePort 30080 accessible externally'),

  57: T('A debugging session requires confirming environment variables are correctly injected into pods.',
    'Create a pod with APP_ENV=production and DB_HOST=mysql-service env vars and print them.',
    [['Run pod with env vars','kubectl run env-pod --image=busybox --restart=Never --env=\'APP_ENV=production\' --env=\'DB_HOST=mysql-service\' -- sh -c \'env && sleep 3600\''],
     ['Verify pod is running','kubectl get pod env-pod'],
     ['Print specific env vars','kubectl exec env-pod -- env | grep -E \'APP_ENV|DB_HOST\'']],
    'APP_ENV=production | DB_HOST=mysql-service'),

  58: T('The observability team needs Grafana for cluster metrics dashboards and alerting.',
    'Deploy Grafana in the monitoring namespace and expose it via NodePort on port 32000.',
    [['Create monitoring namespace','kubectl create namespace monitoring'],
     ['Deploy Grafana','kubectl create deployment grafana --image=grafana/grafana:latest -n monitoring'],
     ['Expose as NodePort','kubectl expose deployment grafana --type=NodePort --port=3000 --node-port=32000 -n monitoring'],
     ['Verify all resources','kubectl get all -n monitoring']],
    'grafana  1/1 Running | service NodePort 32000 active in monitoring'),

  59: T('The shopping-app deployment in namespace xfusion is stuck and the team cannot deploy.',
    'Diagnose and fix the broken shopping-app deployment in the xfusion namespace.',
    [['Check deployment status','kubectl get deploy shopping-app -n xfusion'],
     ['Describe for error details','kubectl describe deploy shopping-app -n xfusion | grep -i \'error\''],
     ['Check pod events','kubectl get events -n xfusion --sort-by=\'.lastTimestamp\' | tail -10'],
     ['Edit and fix the issue','kubectl edit deploy shopping-app -n xfusion  =>  fix image tag, resource, or config error'],
     ['Verify pods Running','kubectl get pods -n xfusion']],
    'All pods Running after the fix is applied'),

  60: T('Database pods need persistent storage that survives pod restarts and rescheduling events.',
    'Create a 1Gi hostPath PersistentVolume and a PVC that binds to it.',
    [['Write PV YAML','vim pv.yaml  =>  hostPath: /data/pv-data, capacity: 1Gi, accessModes: ReadWriteOnce'],
     ['Apply PV','kubectl apply -f pv.yaml'],
     ['Write PVC YAML','vim pvc.yaml  =>  request 1Gi, accessModes: ReadWriteOnce'],
     ['Apply PVC','kubectl apply -f pvc.yaml'],
     ['Verify binding','kubectl get pv && kubectl get pvc']],
    'PV Status: Bound | PVC Status: Bound'),

  61: T('The app container must wait for its dependency service to be ready before it starts.',
    'Create a pod with a busybox init container that waits for mysql-service DNS resolution.',
    [['Write init container pod YAML','vim init-pod.yaml  =>  initContainers: busybox runs nslookup mysql-service in a loop'],
     ['Apply the pod','kubectl apply -f init-pod.yaml'],
     ['Watch the init phases','kubectl get pod init-pod -w'],
     ['Check init container logs','kubectl logs init-pod -c init-check']],
    'Init:0/1 → Init:1/1 → PodInitializing → Running'),

  62: T('Database credentials must be stored securely in Kubernetes Secrets rather than in pod specs.',
    'Create Secret db-secret with DB_USER=admin and DB_PASS=secret123, inject as env vars in a pod.',
    [['Create the secret','kubectl create secret generic db-secret --from-literal=DB_USER=admin --from-literal=DB_PASS=secret123'],
     ['Verify secret created','kubectl get secret db-secret -o yaml'],
     ['Write pod YAML using secret','vim secret-pod.yaml  =>  envFrom: - secretRef: name: db-secret'],
     ['Apply pod and verify','kubectl apply -f secret-pod.yaml && kubectl exec secret-pod -- env | grep DB_']],
    'DB_USER=admin | DB_PASS=secret123 inside the pod'),

  63: T('Iron Gallery app needs a complete Kubernetes setup: Deployment, Service, and ConfigMap.',
    'Deploy Iron Gallery with 2 replicas using image kodekloud/irongallery and expose on NodePort 32000.',
    [['Create ConfigMap','kubectl create configmap iron-gallery-config --from-literal=APP_ENV=production'],
     ['Write Deployment YAML','vim iron-gallery.yaml  =>  2 replicas, image: kodekloud/irongallery'],
     ['Apply deployment','kubectl apply -f iron-gallery.yaml'],
     ['Expose via NodePort','kubectl expose deployment iron-gallery --type=NodePort --port=80 --node-port=32000'],
     ['Verify all resources','kubectl get all | grep iron-gallery']],
    '2/2 pods Running | NodePort 32000 accessible'),

  64: T('A Python Flask app deployed in Kubernetes is crashing with CrashLoopBackOff status.',
    'Debug the python-app pod in namespace dev and fix the crashing container.',
    [['Check pod status','kubectl get pods -n dev | grep python-app'],
     ['View crash logs','kubectl logs -n dev -l app=python-app --previous'],
     ['Describe pod events','kubectl describe pod -n dev -l app=python-app | tail -15'],
     ['Edit and fix deployment','kubectl edit deploy python-app -n dev  =>  fix env vars, command, or image tag'],
     ['Verify pod recovered','kubectl get pods -n dev | grep python-app']],
    'python-app-xxx  1/1  Running  0  <age>'),

  65: T('The caching layer needs a Redis deployment with data persistence across pod restarts.',
    'Deploy Redis with 1 replica using redis:alpine and a PVC for /data persistence.',
    [['Create Redis PVC','kubectl apply -f redis-pvc.yaml  =>  1Gi ReadWriteOnce'],
     ['Create Redis deployment','kubectl create deployment redis --image=redis:alpine'],
     ['Add PVC volume to deployment','kubectl set volume deployment/redis --add --claim-name=redis-pvc --mount-path=/data'],
     ['Expose Redis Service','kubectl expose deployment redis --port=6379 --name=redis-service'],
     ['Test Redis is working','kubectl exec -it deploy/redis -- redis-cli ping']],
    'PONG'),

  66: T('The application backend requires a MySQL 8.0 database with secure credentials and persistent storage.',
    'Deploy MySQL 8.0 with root password in a Secret and data stored on a PVC.',
    [['Create MySQL Secret','kubectl create secret generic mysql-secret --from-literal=MYSQL_ROOT_PASSWORD=Rootpass@123'],
     ['Create MySQL PVC','kubectl apply -f mysql-pvc.yaml  =>  2Gi ReadWriteOnce'],
     ['Write MySQL Deployment','vim mysql-deploy.yaml  =>  image mysql:8.0, env from secret, volumeMount /var/lib/mysql'],
     ['Apply deployment','kubectl apply -f mysql-deploy.yaml'],
     ['Expose Service','kubectl expose deployment mysql --port=3306 --name=mysql-service'],
     ['Verify DB connection','kubectl exec -it deploy/mysql -- mysql -uroot -pRootpass@123 -e \'SHOW DATABASES;\'']],
    'information_schema | mysql | performance_schema'),

  67: T('The multi-tier Guestbook demo needs full deployment: Redis leader, followers, and PHP frontend.',
    'Deploy the complete Guestbook with Redis cluster and 3-replica PHP frontend.',
    [['Deploy Redis leader and service','kubectl apply -f redis-leader-deployment.yaml && kubectl apply -f redis-leader-service.yaml'],
     ['Deploy Redis followers and service','kubectl apply -f redis-follower-deployment.yaml && kubectl apply -f redis-follower-service.yaml'],
     ['Deploy PHP frontend','kubectl apply -f frontend-deployment.yaml'],
     ['Expose frontend via NodePort','kubectl expose deployment frontend --type=NodePort --port=80'],
     ['Verify all tiers','kubectl get deployments -o wide']],
    'redis-leader 1/1 | redis-follower 2/2 | frontend 3/3  all Running'),

  // ── JENKINS (68-81) ──────────────────────────────────────────────────────────
  68: T('CI/CD pipeline infrastructure requires Jenkins installed and running on the jump host.',
    'Install Jenkins LTS on the jump host, start the service, and retrieve the initial admin password.',
    [['Install Java 17 prerequisite','sudo dnf install -y java-17-openjdk'],
     ['Add Jenkins repo and key','sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo && sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key'],
     ['Install Jenkins','sudo dnf install -y jenkins'],
     ['Enable and start service','sudo systemctl enable --now jenkins'],
     ['Get initial admin password','sudo cat /var/lib/jenkins/secrets/initialAdminPassword'],
     ['Access Jenkins UI','Navigate to http://localhost:8080 and complete the setup wizard']],
    'Jenkins running on port 8080 | initial admin password retrieved'),

  69: T('The CI pipeline requires Git, Maven, Pipeline, and Docker plugins for the build workflow.',
    'Install plugins Git, Maven Integration, Pipeline, and Docker Pipeline via Jenkins CLI.',
    [['Download Jenkins CLI','curl -O http://localhost:8080/jnlpJars/jenkins-cli.jar'],
     ['Install required plugins','java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:<pass> install-plugin git maven-plugin workflow-aggregator docker-workflow'],
     ['Restart Jenkins safely','java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:<pass> safe-restart'],
     ['Verify plugins installed','java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:<pass> list-plugins | grep -E \'git|maven|pipeline|docker\'']],
    'git 5.x | maven-plugin 3.x | workflow-aggregator 2.x | docker-workflow 1.x'),

  70: T('The team needs role-based access control in Jenkins with separate roles per team member.',
    'Create Jenkins user james with password James@123 and assign read-only Developer access.',
    [['Install Role Strategy plugin','Manage Jenkins => Plugin Manager => install role-strategy'],
     ['Create user james','Manage Jenkins => Manage Users => Create User => james / James@123'],
     ['Enable role-based security','Configure Global Security => Role-Based Strategy'],
     ['Create Developer role','Manage and Assign Roles => Add Developer role with Job/Read and Job/Build'],
     ['Assign james to Developer','Assign Roles => assign james to Developer role'],
     ['Verify access','Login as james and confirm correct permission level']],
    'James can login | has Developer role permissions in Jenkins'),

  71: T('The CI pipeline must install project dependencies as part of the automated build process.',
    'Create Freestyle job install-packages that runs mvn install on the currency-conversion repo.',
    [['Create Freestyle job','Jenkins UI => New Item => install-packages => Freestyle project'],
     ['Configure SCM','Source Code Management => Git => https://github.com/NaYaGK/currency-conversion-devops.git'],
     ['Add Maven build step','Add Build Step => Invoke Maven => Goals: install -Deureka.client.enabled=false'],
     ['Save and build','Save => Build Now'],
     ['Verify success','Console Output => BUILD SUCCESS at the bottom']],
    '[INFO] BUILD SUCCESS'),

  72: T('Builds need to support different deployment targets selectable at trigger time via parameters.',
    'Create a parameterized job with a DEPLOY_ENV string parameter and echo it in the build output.',
    [['Create Freestyle job','Jenkins UI => New Item => param-build => Freestyle project'],
     ['Add String Parameter','This build is parameterized => Add Parameter => String: DEPLOY_ENV, default=dev'],
     ['Add Execute Shell step','Build Steps => Execute shell: echo \'Deploying to: $DEPLOY_ENV\''],
     ['Build with Parameters','Build with Parameters => DEPLOY_ENV=staging => Build'],
     ['Verify output','Console Output => Deploying to: staging']],
    'Console output: Deploying to: staging'),

  73: T('Nightly builds are needed to catch integration issues before the development team starts work.',
    'Schedule the install-packages job to run at 2:00 AM every day using Jenkins cron syntax.',
    [['Open job configuration','Jenkins UI => install-packages => Configure'],
     ['Enable Build Triggers','Build Triggers => Build periodically'],
     ['Set cron expression','Schedule: H 2 * * *'],
     ['Save and verify','Save => check that Next run shows approximately 2:00 AM']],
    'Job scheduled: next run at 2:00 AM daily'),

  74: T('MySQL backups must run on a schedule and store dump files for disaster recovery purposes.',
    'Create a Jenkins job db-backup that runs mysqldump for apps_db and stores it in /tmp/backups/.',
    [['Create Freestyle job','New Item => db-backup => Freestyle project'],
     ['Add Execute Shell step','mkdir -p /tmp/backups && mysqldump -u root apps_db > /tmp/backups/apps_db_$(date +%F).sql'],
     ['Schedule nightly run','Build Triggers => Build periodically: 0 1 * * *'],
     ['Test manually','Build Now => verify /tmp/backups/ contains the .sql dump file']],
    'apps_db_2024-xx-xx.sql created in /tmp/backups/'),

  75: T('Build workloads need distributing across agent nodes to reduce pipeline queue times.',
    'Add App Server 1 as a Jenkins SSH agent node with 2 executors.',
    [['Go to Manage Nodes','Jenkins => Manage Jenkins => Nodes => New Node'],
     ['Configure agent details','Name: stapp01-agent | Remote root: /home/tony/jenkins | Launch: via SSH'],
     ['Set SSH host and credentials','Host: stapp01 | Add SSH username/password credentials for tony'],
     ['Save and connect','Save => Launch Agent => confirm Agent connected in logs'],
     ['Verify executors online','Nodes dashboard shows stapp01-agent with 2 executors available']],
    'stapp01-agent Connected | 2 executors active'),

  76: T('Sensitive build artifacts and credentials must be protected from unauthorized Jenkins users.',
    'Enable Matrix-based security and restrict install-packages to read-only access for user james.',
    [['Install Matrix Auth plugin','Plugin Manager => install matrix-auth'],
     ['Enable Matrix Security','Configure Global Security => Matrix-based security'],
     ['Give admin full access','admin row => check all permission boxes'],
     ['Give james read-only','james row => check only Overall/Read and Job/Read'],
     ['Verify james access','Login as james => can view job but Build Now button is disabled']],
    'James: view-only | Build Now disabled for james'),

  77: T('The team needs a complete CI/CD pipeline automating the path from code commit to deployed container.',
    'Create a Declarative Pipeline: Checkout => Maven Build => Docker Build => Docker Push.',
    [['Create Pipeline job','New Item => deploy-pipeline => Pipeline'],
     ['Add DockerHub credentials','Manage Jenkins => Credentials => dockerhub-creds (username/password)'],
     ['Write 4-stage Jenkinsfile','pipeline { agent any stages { stage(Checkout){...} stage(Build){...} stage(Docker Build){...} stage(Docker Push){...} } }'],
     ['Trigger and monitor','Build Now => watch Stage View for all 4 stages'],
     ['Verify completion','All 4 stages green | image pushed to Docker Hub']],
    'All 4 stages green | nayagk/currency-conversion:latest on Docker Hub'),

  78: T('Production deploys must only trigger on main branch; feature branches must skip the deploy stage.',
    'Add a when { branch \'main\' } condition to the Deploy stage in the Declarative Pipeline.',
    [['Edit Jenkinsfile in repo','vim Jenkinsfile'],
     ['Add when condition','stage(\'Deploy\') { when { branch \'main\' } steps { ... } }'],
     ['Commit and push','git add Jenkinsfile && git commit -m \'JIRA-078: conditional deploy\' && git push'],
     ['Test on feature branch','Build on feature/test => Deploy stage shows Skipped'],
     ['Test on main','Build on main => Deploy stage executes normally']],
    'Deploy: SKIPPED on feature/* | Deploy: SUCCESS on main'),

  79: T('The deploy stage must SSH to App Server 3 and run the latest Docker container after a build.',
    'Add a Deploy stage that SSHs to stapp03 and runs docker pull + docker run for the app image.',
    [['Add SSH credentials for banner','Manage Jenkins => Credentials => SSH Username: banner'],
     ['Install SSH Agent plugin','Plugin Manager => install ssh-agent'],
     ['Add Deploy stage to Jenkinsfile','stage(\'Deploy\') { steps { sshagent([\'banner-key\']) { sh \'ssh banner@stapp03 docker pull nayagk/currency-conversion:latest && docker run -d nayagk/currency-conversion:latest\' } } }'],
     ['Trigger pipeline','Build Now => verify Deploy stage console shows SSH commands executing'],
     ['Verify on stapp03','ssh banner@stapp03 docker ps | grep currency-conversion']],
    'Container running on stapp03 after pipeline completes'),

  80: T('The test suite must automatically run after each successful build without manual triggering.',
    'Configure run-tests job to auto-trigger when install-packages build succeeds.',
    [['Open install-packages config','Jenkins => install-packages => Configure'],
     ['Add Post-build Trigger','Post-build Actions => Build other projects: run-tests'],
     ['Set trigger condition','Trigger only if build is stable'],
     ['Save and run install-packages','Build Now => watch run-tests auto-start afterward'],
     ['Verify chain completes','Both jobs show green within seconds of each other']],
    'run-tests auto-triggered | both jobs green'),

  81: T('The CI pipeline needs distinct quality-gate stages for lint, test, artifact, Docker, and deploy.',
    'Create a 5-stage Multistage Declarative Pipeline covering the full software delivery lifecycle.',
    [['Create Pipeline job','New Item => multistage-pipeline => Pipeline'],
     ['Write 5-stage Jenkinsfile','stages: Lint | Unit Tests | Build Artifact | Docker Build | Deploy'],
     ['Add Maven lint stage','stage(\'Lint\') { steps { sh \'mvn checkstyle:check\' } }'],
     ['Add SonarQube quality gate','stage(\'Tests\') { steps { waitForQualityGate() } }'],
     ['Commit and run','git push => Build Now => watch all 5 stages in Stage View']],
    '5 stages all green in Stage View'),

  // ── ANSIBLE (82-93) ──────────────────────────────────────────────────────────
  82: T('Ansible needs a structured inventory file to target the full xFusionCorp server fleet.',
    'Create inventory at /home/thor/ansible/inventory grouping App Servers and DB Server.',
    [['Create ansible directory','mkdir -p /home/thor/ansible'],
     ['Write the inventory file','vim /home/thor/ansible/inventory'],
     ['Add groups and hosts','[app_servers]  stapp01 ansible_user=tony  stapp02 ansible_user=steve  stapp03 ansible_user=banner  [db_servers]  stdb01 ansible_user=peter'],
     ['Test connectivity','ansible all -i /home/thor/ansible/inventory -m ping'],
     ['List inventory structure','ansible-inventory -i /home/thor/ansible/inventory --list']],
    'All 4 servers respond with pong | SUCCESS'),

  83: T('A broken Ansible playbook is failing with YAML or module errors, blocking automated deployments.',
    'Fix all errors in /home/thor/ansible/playbook.yml and run it successfully against all hosts.',
    [['Check syntax first','ansible-playbook /home/thor/ansible/playbook.yml --syntax-check'],
     ['Review error output','Note the exact line number, type (indentation, module name, missing key)'],
     ['Fix the playbook','vim /home/thor/ansible/playbook.yml'],
     ['Dry-run to confirm fix','ansible-playbook /home/thor/ansible/playbook.yml --check -i inventory'],
     ['Execute the playbook','ansible-playbook /home/thor/ansible/playbook.yml -i inventory']],
    'PLAY RECAP: ok=x, changed=x, failed=0'),

  84: T('Config files need pushing to all App Servers simultaneously from the Ansible control node.',
    'Write a playbook using the copy module to push /tmp/index.html to /var/www/html/ on all App Servers.',
    [['Write the copy playbook','vim /home/thor/ansible/copy-file.yml'],
     ['Playbook task','- name: Copy index.html  copy: src=/tmp/index.html dest=/var/www/html/index.html'],
     ['Run with become','ansible-playbook -i inventory copy-file.yml --become'],
     ['Verify on App Server 1','ansible stapp01 -i inventory -m command -a \'cat /var/www/html/index.html\' --become']],
    'Contents of /tmp/index.html present on all App Servers'),

  85: T('Standardized config files need creating on all App Servers as part of system provisioning.',
    'Write a playbook that creates /opt/ansible-test/config.txt with content "Ansible managed" on all App Servers.',
    [['Write file creation playbook','vim create-file.yml'],
     ['Playbook task','- name: Create config  copy: content=\'Ansible managed\' dest=/opt/ansible-test/config.txt'],
     ['Run with privilege escalation','ansible-playbook -i inventory create-file.yml --become'],
     ['Verify on all servers','ansible app_servers -i inventory -m command -a \'cat /opt/ansible-test/config.txt\' --become']],
    'Ansible managed  (from all 3 App Servers)'),

  86: T('Before running any automation, connectivity to all managed nodes must be confirmed.',
    'Use the Ansible ping module to verify Ansible can reach all hosts in the inventory.',
    [['Ping all hosts','ansible all -i /home/thor/ansible/inventory -m ping'],
     ['Ping only app_servers group','ansible app_servers -i /home/thor/ansible/inventory -m ping'],
     ['Ping only db_servers group','ansible db_servers -i /home/thor/ansible/inventory -m ping'],
     ['Check for unreachable hosts','ansible all -i inventory -m ping | grep -E \'UNREACHABLE|pong\'']],
    'All hosts respond: SUCCESS => pong'),

  87: T('All App Servers need git and wget installed as part of the standard developer tooling setup.',
    'Write a playbook using the dnf module to install git and wget on all App Servers.',
    [['Write the install playbook','vim install-pkgs.yml'],
     ['Playbook task','- name: Install packages  dnf: name=[git, wget] state=present'],
     ['Run with become','ansible-playbook -i inventory install-pkgs.yml --become'],
     ['Verify on all servers','ansible app_servers -i inventory -m command -a \'git --version && wget --version\' --become']],
    'git version x.x.x | GNU Wget x.x (on all 3 servers)'),

  88: T('A standardized DNS block needs appending to /etc/hosts across all App Servers via automation.',
    'Use the blockinfile module to add custom DNS entries to /etc/hosts on all App Servers.',
    [['Write blockinfile playbook','vim hosts-update.yml'],
     ['Playbook task','blockinfile: path=/etc/hosts marker=\'# {mark} ANSIBLE MANAGED\' block=\'192.168.1.10 db01\\n192.168.1.11 cache01\''],
     ['Run the playbook','ansible-playbook -i inventory hosts-update.yml --become'],
     ['Verify on App Server 2','ansible stapp02 -i inventory -m command -a \'grep -A5 ANSIBLE /etc/hosts\' --become']],
    '# BEGIN ANSIBLE MANAGED | 192.168.1.10 db01 | 192.168.1.11 cache01 | # END ANSIBLE MANAGED'),

  89: T('The httpd service needs ensuring it is started and enabled across all App Servers via Ansible.',
    'Write a playbook using the service module to start and enable httpd on all App Servers.',
    [['Write service management playbook','vim manage-httpd.yml'],
     ['Playbook task','- name: Ensure httpd running  service: name=httpd state=started enabled=yes'],
     ['Run with become','ansible-playbook -i inventory manage-httpd.yml --become'],
     ['Verify on all servers','ansible app_servers -i inventory -m command -a \'systemctl is-active httpd\' --become']],
    'active  (returned from all 3 App Servers)'),

  90: T('Fine-grained file ACL control is required for user mark on specific shared directories.',
    'Use the Ansible acl module to give mark read-write access on /opt/data/ on App Server 1.',
    [['Write ACL playbook','vim set-acl.yml'],
     ['Playbook task','acl: path=/opt/data entity=mark etype=user permissions=rw state=present'],
     ['Run the playbook','ansible-playbook -i inventory set-acl.yml --become'],
     ['Verify ACL applied','ansible stapp01 -i inventory -m command -a \'getfacl /opt/data\' --become']],
    'user:mark:rw-  (in getfacl output on App Server 1)'),

  91: T('A specific AllowUsers SSH directive must be added to sshd_config across all App Servers.',
    'Use lineinfile module to add AllowUsers tony steve banner to /etc/ssh/sshd_config on all App Servers.',
    [['Write lineinfile playbook','vim lineinfile.yml'],
     ['Playbook task','lineinfile: path=/etc/ssh/sshd_config line=\'AllowUsers tony steve banner\' state=present'],
     ['Run the playbook','ansible-playbook -i inventory lineinfile.yml --become'],
     ['Verify line added','ansible app_servers -i inventory -m command -a "grep AllowUsers /etc/ssh/sshd_config" --become']],
    'AllowUsers tony steve banner  (in sshd_config on all servers)'),

  92: T('Nginx config must be generated dynamically with per-server values using Jinja2 templates.',
    'Use the template module to deploy an Nginx config with server_name set per inventory_hostname.',
    [['Create Jinja2 template','vim templates/nginx.conf.j2  =>  server_name {{ inventory_hostname }};'],
     ['Write template deploy playbook','vim deploy-nginx.yml  =>  template: src=nginx.conf.j2 dest=/etc/nginx/nginx.conf'],
     ['Run the playbook','ansible-playbook -i inventory deploy-nginx.yml --become'],
     ['Verify per-server values','ansible stapp01 -i inventory -m command -a \'grep server_name /etc/nginx/nginx.conf\' --become']],
    'server_name stapp01;  server_name stapp02;  server_name stapp03;  (each unique)'),

  93: T('Package installation differs between RedHat and Debian systems; conditionals handle both.',
    'Write a playbook that installs nginx using dnf on RHEL-based and apt on Debian-based hosts.',
    [['Write conditional install playbook','vim conditional-install.yml'],
     ['Add RedHat condition','- name: Install nginx (RHEL)  dnf: name=nginx  when: ansible_os_family == \'RedHat\''],
     ['Add Debian condition','- name: Install nginx (Debian)  apt: name=nginx  when: ansible_os_family == \'Debian\''],
     ['Dry-run first','ansible-playbook -i inventory conditional-install.yml --check --become'],
     ['Run actual playbook','ansible-playbook -i inventory conditional-install.yml --become']],
    'ok=1  skipped=1 per server  (correct package manager used per OS family)'),

  // ── TERRAFORM (94-100) ───────────────────────────────────────────────────────
  94: T('AWS infrastructure needs an isolated VPC network environment for xFusionCorp workloads.',
    'Write Terraform to create a VPC with CIDR 10.0.0.0/16 and DNS support enabled in us-east-1.',
    [['Create main.tf with provider','provider "aws" { region = "us-east-1" }'],
     ['Add VPC resource','resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16"  enable_dns_hostnames = true }'],
     ['Initialize Terraform','terraform init'],
     ['Review the plan','terraform plan'],
     ['Apply changes','terraform apply -auto-approve']],
    'aws_vpc.main: Creation complete | id = vpc-xxxxxxxxx'),

  95: T('The VPC needs Security Groups to control which inbound traffic reaches the instances.',
    'Create a Security Group allowing HTTP port 80 and HTTPS port 443 inbound, all outbound.',
    [['Add security group to main.tf','resource "aws_security_group" "web" { vpc_id = aws_vpc.main.id }'],
     ['Define ingress rules','ingress { from_port=80 to_port=80 protocol=tcp cidr_blocks=["0.0.0.0/0"] }  ingress { ...port 443... }'],
     ['Define egress rule','egress { from_port=0 to_port=0 protocol=-1 cidr_blocks=["0.0.0.0/0"] }'],
     ['Apply changes','terraform apply -auto-approve'],
     ['Verify resource','terraform show | grep security_group_id']],
    'aws_security_group.web created | id = sg-xxxxxxxxx'),

  96: T('A compute instance is needed in the xFusionCorp VPC for the application tier.',
    'Launch a t3.micro EC2 instance using Amazon Linux 2 AMI in a public subnet of the xFusionCorp VPC.',
    [['Create public subnet resource','resource "aws_subnet" "public" { cidr_block="10.0.1.0/24"  map_public_ip_on_launch=true }'],
     ['Add EC2 instance resource','resource "aws_instance" "web" { ami="ami-0c02fb55956c7d316"  instance_type="t3.micro"  subnet_id=aws_subnet.public.id }'],
     ['Add output for public IP','output "instance_public_ip" { value = aws_instance.web.public_ip }'],
     ['Apply changes','terraform apply -auto-approve'],
     ['Get instance IP','terraform output instance_public_ip']],
    'aws_instance.web created | public_ip = x.x.x.x'),

  97: T('The application needs a least-privilege IAM policy for programmatic S3 read access.',
    'Create IAM policy s3-read-policy allowing s3:GetObject and s3:ListBucket via Terraform.',
    [['Add IAM policy resource','resource "aws_iam_policy" "s3_read" { name="s3-read-policy" }'],
     ['Define policy with jsonencode','policy = jsonencode({ Statement=[{ Effect=Allow  Action=["s3:GetObject", "s3:ListBucket"]  Resource="*" }] })'],
     ['Apply changes','terraform apply -auto-approve'],
     ['Verify policy ARN','terraform show | grep arn']],
    'aws_iam_policy.s3_read created | arn:aws:iam::123456789012:policy/s3-read-policy'),

  98: T('Backend instances must not be publicly accessible and should run in a private subnet.',
    'Create a private subnet 10.0.2.0/24 with a NAT Gateway and launch a t3.micro EC2 in it.',
    [['Add private subnet','resource "aws_subnet" "private" { cidr_block="10.0.2.0/24"  map_public_ip_on_launch=false }'],
     ['Create Elastic IP and NAT GW','resource "aws_eip" "nat" {}  resource "aws_nat_gateway" "main" { allocation_id=aws_eip.nat.id  subnet_id=aws_subnet.public.id }'],
     ['Create private route table','aws_route_table + aws_route => NAT GW + aws_route_table_association'],
     ['Launch EC2 in private subnet','resource "aws_instance" "backend" { subnet_id=aws_subnet.private.id  instance_type=t3.micro }'],
     ['Apply and verify','terraform apply -auto-approve && terraform show | grep subnet_id']],
    'aws_instance.backend: no public IP | placed in private subnet 10.0.2.0/24'),

  99: T('The application service needs programmatic DynamoDB access via an IAM role attached to EC2.',
    'Create an IAM role, attach DynamoDB full-access policy, and create an instance profile in Terraform.',
    [['Create IAM role with EC2 trust','resource "aws_iam_role" "app_role" { assume_role_policy = EC2 principal trust JSON }'],
     ['Attach DynamoDB managed policy','resource "aws_iam_role_policy_attachment" "dynamo" { role=app_role.name  policy_arn="arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess" }'],
     ['Create instance profile','resource "aws_iam_instance_profile" "app" { role=aws_iam_role.app_role.name }'],
     ['Attach to EC2 resource','Add iam_instance_profile = aws_iam_instance_profile.app.name to aws_instance'],
     ['Apply and verify','terraform apply -auto-approve && terraform show | grep iam_instance_profile']],
    'EC2 instance has IAM role with DynamoDB full access attached'),

  100: T('Production EC2 instances need CPU alarms to alert the on-call team and trigger auto-scaling.',
    'Create a CloudWatch alarm that fires when CPU exceeds 80% for 2 consecutive 5-minute periods.',
    [['Create SNS topic for alerts','resource "aws_sns_topic" "alerts" { name="cpu-alerts" }'],
     ['Add CloudWatch alarm resource','resource "aws_cloudwatch_metric_alarm" "cpu_high" {'],
     ['Configure alarm parameters','alarm_name="high-cpu"  metric_name="CPUUtilization"  threshold=80  evaluation_periods=2  period=300  comparison_operator="GreaterThanThreshold"'],
     ['Link to EC2 and SNS','dimensions={InstanceId=aws_instance.web.id}  alarm_actions=[aws_sns_topic.alerts.arn]'],
     ['Apply and verify','terraform apply -auto-approve && terraform show | grep alarm_name']],
    'aws_cloudwatch_metric_alarm.cpu_high created | State: OK'),
};

// ── All 100 days ──────────────────────────────────────────────────────────────
interface DayEntry { n: number; title: string; open: boolean }

const DAYS: DayEntry[] = [
  { n: 1,   title: 'Linux User Setup with Non-Interactive Shell',        open: true  },
  { n: 2,   title: 'Temporary User Setup with Expiry',                   open: true  },
  { n: 3,   title: 'Secure Root SSH Access',                             open: true  },
  { n: 4,   title: 'Script Execution Permissions',                       open: true  },
  { n: 5,   title: 'SElinux Installation and Configuration',             open: true  },
  { n: 6,   title: 'Create a Cron Job',                                  open: true  },
  { n: 7,   title: 'Linux SSH Authentication',                           open: true  },
  { n: 8,   title: 'Install Ansible',                                    open: true  },
  { n: 9,   title: 'MariaDB Troubleshooting',                            open: true  },
  { n: 10,  title: 'Linux Bash Scripts',                                 open: true  },
  { n: 11,  title: 'Install and Configure Tomcat Server',                open: true  },
  { n: 12,  title: 'Linux Network Services',                             open: true  },
  { n: 13,  title: 'IPtables Installation And Configuration',            open: true  },
  { n: 14,  title: 'Linux Process Troubleshooting',                      open: true  },
  { n: 15,  title: 'Setup SSL for Nginx',                                open: true  },
  { n: 16,  title: 'Install and Configure Nginx as an LBR',              open: true  },
  { n: 17,  title: 'Install and Configure PostgreSQL',                   open: true  },
  { n: 18,  title: 'Install and Configure DB Server',                    open: true  },
  { n: 19,  title: 'Install and Configure Web Application',              open: true  },
  { n: 20,  title: 'Configure Nginx + PHP-FPM Using Unix Sock',          open: true  },
  { n: 21,  title: 'Set Up Git Repository on Storage Server',            open: true  },
  { n: 22,  title: 'Clone Git Repository on Storage Server',             open: true  },
  { n: 23,  title: 'Fork a Git Repository',                              open: true  },
  { n: 24,  title: 'Git Create Branches',                                open: true  },
  { n: 25,  title: 'Git Merge Branches',                                 open: true  },
  { n: 26,  title: 'Git Manage Remotes',                                 open: true  },
  { n: 27,  title: 'Git Revert Some Changes',                            open: true  },
  { n: 28,  title: 'Git Cherry Pick',                                    open: true  },
  { n: 29,  title: 'Manage Git Pull Requests',                           open: true  },
  { n: 30,  title: 'Git hard reset',                                     open: true  },
  { n: 31,  title: 'Git Stash',                                          open: true  },
  { n: 32,  title: 'Git Rebase',                                         open: true  },
  { n: 33,  title: 'Resolve Git Merge Conflicts',                        open: true  },
  { n: 34,  title: 'Git Hook',                                           open: true  },
  { n: 35,  title: 'Install Docker Packages and Start Docker Service',   open: true  },
  { n: 36,  title: 'Deploy Nginx Container on Application Server',       open: true  },
  { n: 37,  title: 'Copy File to Docker Container',                      open: true  },
  { n: 38,  title: 'Pull Docker Image',                                  open: true  },
  { n: 39,  title: 'Create a Docker Image From Container',               open: true  },
  { n: 40,  title: 'Docker EXEC Operations',                             open: true  },
  { n: 41,  title: 'Write a Docker File',                                open: true  },
  { n: 42,  title: 'Create a Docker Network',                            open: true  },
  { n: 43,  title: 'Docker Ports Mapping',                               open: true  },
  { n: 44,  title: 'Write a Docker Compose File',                        open: true  },
  { n: 45,  title: 'Resolve Dockerfile Issues',                          open: true  },
  { n: 46,  title: 'Deploy an App on Docker Containers',                 open: true  },
  { n: 47,  title: 'Docker Python App',                                  open: true  },
  { n: 48,  title: 'Deploy Pods in Kubernetes Cluster',                  open: true  },
  { n: 49,  title: 'Deploy Applications with Kubernetes Deployments',    open: true  },
  { n: 50,  title: 'Set Resource Limits in Kubernetes Pods',             open: true  },
  { n: 51,  title: 'Execute Rolling Updates in Kubernetes',              open: true  },
  { n: 52,  title: 'Revert Deployment to Previous Version in Kubernetes',open: true  },
  { n: 53,  title: 'Resolve VolumeMounts Issue in Kubernetes',           open: true  },
  { n: 54,  title: 'Kubernetes Shared Volumes',                          open: true  },
  { n: 55,  title: 'Kubernetes Sidecar Containers',                      open: true  },
  { n: 56,  title: 'Deploy Nginx Web Server on Kubernetes Cluster',      open: true  },
  { n: 57,  title: 'Print Environment Variables',                        open: true  },
  { n: 58,  title: 'Deploy Grafana on Kubernetes Cluster',               open: true  },
  { n: 59,  title: 'Troubleshoot Deployment issues in Kubernetes',       open: true  },
  { n: 60,  title: 'Persistent Volumes in Kubernetes',                   open: true  },
  { n: 61,  title: 'Init Containers in Kubernetes',                      open: true  },
  { n: 62,  title: 'Manage Secrets in Kubernetes',                       open: true  },
  { n: 63,  title: 'Deploy Iron Gallery App on Kubernetes',              open: true  },
  { n: 64,  title: 'Fix Python App Deployed on Kubernetes Cluster',      open: true  },
  { n: 65,  title: 'Deploy Redis Deployment on Kubernetes',              open: true  },
  { n: 66,  title: 'Deploy MySQL on Kubernetes',                         open: true  },
  { n: 67,  title: 'Deploy Guest Book App on Kubernetes',                open: true  },
  { n: 68,  title: 'Set Up Jenkins Server',                              open: true  },
  { n: 69,  title: 'Install Jenkins Plugins',                            open: true  },
  { n: 70,  title: 'Configure Jenkins User Access',                      open: true  },
  { n: 71,  title: 'Configure Jenkins Job for Package Installation',     open: true  },
  { n: 72,  title: 'Jenkins Parameterized Builds',                       open: true  },
  { n: 73,  title: 'Jenkins Scheduled Jobs',                             open: true  },
  { n: 74,  title: 'Jenkins Database Backup Job',                        open: true  },
  { n: 75,  title: 'Jenkins Slave Nodes',                                open: true  },
  { n: 76,  title: 'Jenkins Project Security',                           open: true  },
  { n: 77,  title: 'Jenkins Deploy Pipeline',                            open: true  },
  { n: 78,  title: 'Jenkins Conditional Pipeline',                       open: true  },
  { n: 79,  title: 'Jenkins Deployment Job',                             open: true  },
  { n: 80,  title: 'Jenkins Chained Builds',                             open: true  },
  { n: 81,  title: 'Jenkins Multistage Pipeline',                        open: true  },
  { n: 82,  title: 'Create Ansible Inventory for App Server Testing',    open: true  },
  { n: 83,  title: 'Troubleshoot and Create Ansible Playbook',           open: true  },
  { n: 84,  title: 'Copy Data to App Servers using Ansible',             open: true  },
  { n: 85,  title: 'Create Files on App Servers using Ansible',          open: true  },
  { n: 86,  title: 'Ansible Ping Module Usage',                          open: true  },
  { n: 87,  title: 'Ansible Install Package',                            open: true  },
  { n: 88,  title: 'Ansible Blockinfile Module',                         open: true  },
  { n: 89,  title: 'Ansible Manage Services',                            open: true  },
  { n: 90,  title: 'Managing ACLs Using Ansible',                        open: true  },
  { n: 91,  title: 'Ansible Lineinfile Module',                          open: true  },
  { n: 92,  title: 'Managing Jinja2 Templates Using Ansible',            open: true  },
  { n: 93,  title: 'Using Ansible Conditionals',                         open: true  },
  { n: 94,  title: 'Create VPC Using Terraform',                         open: true  },
  { n: 95,  title: 'Create Security Group Using Terraform',              open: true  },
  { n: 96,  title: 'Create EC2 Instance Using Terraform',                open: true  },
  { n: 97,  title: 'Create IAM Policy Using Terraform',                  open: true  },
  { n: 98,  title: 'Launch EC2 in Private VPC Subnet Using Terraform',   open: true  },
  { n: 99,  title: 'Attach IAM Policy for DynamoDB Access Using Terraform', open: true },
  { n: 100, title: 'Create and Configure Alarm Using CloudWatch Using Terraform', open: true },
];

// ── CmdLine component ─────────────────────────────────────────────────────────
function CmdLine({ label, cmd, locked }: { label: string; cmd: string; locked: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (locked) return;
    navigator.clipboard?.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: '#4A7A9B', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#040C18', border: '1px solid #0D2235', borderRadius: 6, padding: '8px 12px' }}>
        <code style={{ color: '#4ADE80', fontFamily: 'monospace', fontSize: 12, flex: 1, wordBreak: 'break-all' }}>
          <span style={{ color: '#60A5FA', marginRight: 6 }}>$</span>{cmd}
        </code>
        {!locked && (
          <button onClick={copy} style={{ background: 'transparent', border: '1px solid #1A3A52', borderRadius: 4, color: copied ? '#4ADE80' : '#4A7A9B', fontSize: 10, padding: '2px 8px', cursor: 'pointer', flexShrink: 0 }}>
            {copied ? '✓' : 'copy'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── TaskDetailPanel ───────────────────────────────────────────────────────────
function TaskDetailPanel({ dayNum, onClose }: { dayNum: number; onClose: () => void }) {
  const taskId = `devops100-${dayNum}`;
  const initialState = getTaskState(taskId);
  const [completed, setCompleted] = useState(initialState.completed);
  const [notes, setNotes] = useState(initialState.notes || '');
  const [lastSync, setLastSync] = useState(initialState.lastSync || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const day    = DAYS.find(d => d.n === dayNum);
  const detail = TASK_DETAILS[dayNum];
  if (!day || !detail) return null;

  const cat    = getCategory(dayNum);
  const meta   = CAT_META[cat] ?? { color: '#4A7A9B', dim: 'rgba(74,122,155,0.12)', icon: '📋', range: '' };
  const locked = !day.open;
  const num    = String(dayNum).padStart(2, '0');

  return (
    <div style={{ background: '#0A1A2C', border: `1px solid ${locked ? '#1E2D47' : meta.color + '44'}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20, boxShadow: locked ? 'none' : `0 0 28px ${meta.color}0D` }}>
      {/* Terminal bar */}
      <div style={{ background: '#0C1F34', borderBottom: `1px solid ${locked ? '#152235' : meta.color + '22'}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#EF4444','#F59E0B','#4ADE80'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#4A7A9B', fontFamily: 'monospace' }}>
          {locked ? `locked — day-${num}` : `stratos.xfusioncorp.com — ${cat.toLowerCase()}-day-${num}`}
        </div>
        <span style={{ background: locked ? 'rgba(74,114,255,0.1)' : 'rgba(74,222,128,0.15)', color: locked ? '#4A6A9B' : '#4ADE80', border: `1px solid ${locked ? 'rgba(74,114,255,0.2)' : 'rgba(74,222,128,0.3)'}`, borderRadius: 20, padding: '1px 10px', fontSize: 10, letterSpacing: '1px' }}>
          {locked ? '🔒 LOCKED' : '● ACTIVE'}
        </span>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #1E2D47', borderRadius: 4, color: '#4A7A9B', fontSize: 11, padding: '2px 8px', cursor: 'pointer' }}>✕</button>
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ background: meta.dim, border: `1px solid ${meta.color}33`, borderRadius: 8, padding: '5px 12px', fontSize: 11, color: meta.color, letterSpacing: '0.5px' }}>
            {meta.icon} {cat} · Day {num}
          </div>
          {locked && dayNum > 1 && (
            <div style={{ background: 'rgba(74,114,255,0.08)', border: '1px solid rgba(74,114,255,0.2)', borderRadius: 8, padding: '5px 12px', fontSize: 11, color: '#4A6A9B' }}>
              Complete Day {dayNum - 1} to unlock
            </div>
          )}
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#EEF2FF', margin: '0 0 14px', lineHeight: 1.3 }}>
          {day.title}
        </h3>

        {/* Scenario paragraph */}
        <ScenarioText text={detail.context} />

        {/* Numbered instructions + solution — blurred when locked */}
        <div style={{ position: 'relative' }}>
          <div style={{ filter: locked ? 'blur(4px)' : 'none', userSelect: locked ? 'none' : 'auto', pointerEvents: locked ? 'none' : 'auto', transition: 'filter 0.2s' }}>

            {/* Numbered instruction list */}
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {detail.steps.map(([lbl, _cmd], i) => (
                <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: `${meta.color}22`, border: `1px solid ${meta.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: meta.color }}>
                    {i + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: 14, color: '#C8D8E8', lineHeight: 1.65, paddingTop: 3 }}>
                    <InstructionText text={lbl} />
                  </p>
                </li>
              ))}
            </ol>

            {/* Solution toggle */}
            <div style={{ marginTop: 20, borderTop: '1px solid #152235', paddingTop: 16 }}>
              <button
                onClick={() => setShowSolution(p => !p)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: showSolution ? `${meta.color}12` : '#0C1829', border: `1px solid ${showSolution ? meta.color + '44' : '#1E2D47'}`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: showSolution ? meta.color : '#4A7A9B', fontSize: 12, fontWeight: 600, width: '100%', transition: 'all 0.15s' }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{showSolution ? '▼' : '▶'}</span>
                {showSolution ? 'Hide Solution' : '💡 Show Solution Commands'}
              </button>

              {showSolution && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detail.steps.map(([lbl, cmd], i) => (
                    <CmdLine key={i} label={`${i + 1} · ${lbl}`} cmd={cmd} locked={locked} />
                  ))}
                  {detail.expected && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: '#4A7A9B', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>Expected output</div>
                      <div style={{ background: '#040C18', border: '1px solid #0D2235', borderRadius: 6, padding: '10px 14px' }}>
                        <code style={{ color: '#A78BFA', fontFamily: 'monospace', fontSize: 12 }}>{detail.expected}</code>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {locked && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(7,16,31,0.75)', borderRadius: 8 }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🔒</div>
              <div style={{ color: '#4A6A9B', fontSize: 13, textAlign: 'center' }}>
                {dayNum > 1 ? `Complete Day ${dayNum - 1} to unlock this task` : 'Task is locked'}
              </div>
            </div>
          )}
        </div>
      </div>

      {!locked && (
        <div style={{ borderTop: '1px solid #152235', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#4A7A9B' }}>
              {completed ? 'Task completed. You can add notes below.' : <>🏅 <span style={{ color: '#FB923C' }}>800 XP</span> on completion</>}
            </span>
            <button onClick={() => {
              const newVal = !completed;
              setCompleted(newVal);
              setTaskState(taskId, { completed: newVal, notes, lastSync });
            }} style={{ background: completed ? 'rgba(74,222,128,0.25)' : 'rgba(74,222,128,0.12)', color: completed ? '#A7F3D0' : '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 7, padding: '7px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              {completed ? '✅ Completed' : '✓ Mark Complete'}
            </button>
          </div>

          {completed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.3s ease' }}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you learn from this task? Note down key commands, concepts, or mistakes here..."
                style={{ width: '100%', height: 100, background: '#040C18', border: '1px solid #1E2D47', borderRadius: 8, padding: '12px 16px', color: '#C8D8E8', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#4A7A9B' }}>
                  {lastSync ? `Last synced to GitHub: ${lastSync}` : 'Notes are saved locally. Sync to back them up.'}
                </span>
                <button
                  onClick={async () => {
                    setIsSyncing(true);
                    const time = new Date().toLocaleTimeString();
                    setLastSync(time);
                    setTaskState(taskId, { completed, notes, lastSync: time });
                    await GitHubSyncService.autoSyncToGitHub();
                    setIsSyncing(false);
                  }}
                  disabled={isSyncing}
                  style={{ background: '#0C1829', border: '1px solid #1E2D47', color: '#4A7A9B', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: isSyncing ? 'wait' : 'pointer', transition: 'all 0.15s' }}
                >
                  {isSyncing ? 'Syncing...' : '🐙 Save & Sync'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ── DayCard ───────────────────────────────────────────────────────────────────
function DayCard({ day, onClick, isSelected }: { day: DayEntry; onClick: () => void; isSelected: boolean }) {
  const cat    = getCategory(day.n);
  const meta   = CAT_META[cat] ?? { color: '#4A7A9B', dim: 'rgba(74,122,155,0.12)', icon: '📋', range: '' };
  const locked = !day.open;
  const num    = String(day.n).padStart(2, '0');

  return (
    <div
      onClick={onClick}
      title={day.title}
      style={{
        background: isSelected ? meta.dim : locked ? '#0C1829' : 'rgba(0,196,255,0.04)',
        border: `1px solid ${isSelected ? meta.color + '66' : locked ? '#152235' : meta.color + '33'}`,
        borderRadius: 10, padding: '12px 12px 10px',
        cursor: 'pointer', transition: 'all 0.15s',
        position: 'relative', overflow: 'hidden',
        outline: isSelected ? `2px solid ${meta.color}33` : 'none',
        outlineOffset: 2,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: locked ? '#152235' : isSelected ? meta.color : meta.color + '66', borderRadius: '10px 10px 0 0' }} />
      <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, lineHeight: 1, color: locked ? '#1E2D47' : meta.color, marginBottom: 6, marginTop: 4 }}>
        {num}
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.4, color: locked ? '#1E2D47' : '#7A9BB5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 30 }}>
        {day.title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: `1px solid ${locked ? '#152235' : meta.color + '22'}` }}>
        <span style={{ fontSize: 9, color: locked ? '#1A2D3A' : meta.color + '99', letterSpacing: '0.5px' }}>
          {meta.icon} {cat.toUpperCase()}
        </span>
        <span style={{ fontSize: 11 }}>
          {day.open ? <span style={{ color: '#4ADE80' }}>●</span> : <span style={{ color: '#1A2D3A' }}>🔒</span>}
        </span>
      </div>
    </div>
  );
}

// ── Top-level tab type ───────────────────────────────────────────────────────
type TopTab = 'instructions' | 'devops100' | 'git' | 'linux' | 'jenkins' | 'docker' | 'aws' | 'k8s';

const TOP_TABS: { id: TopTab; label: string; icon: string; color: string }[] = [
  { id: 'instructions', label: 'Instructions', icon: '📝', color: '#10B981' },
  { id: 'devops100', label: 'DevOps 100',  icon: '🚀', color: '#00C4FF' },
  { id: 'git',       label: 'Git',         icon: '🔀', color: '#FB923C' },
  { id: 'linux',     label: 'Linux',       icon: '🐧', color: '#60A5FA' },
  { id: 'jenkins',   label: 'Jenkins',     icon: '⚙️', color: '#F87171' },
  { id: 'docker',    label: 'Docker',      icon: '🐳', color: '#38BDF8' },
  { id: 'aws',       label: 'AWS',         icon: '☁️', color: '#F59E0B' },
  { id: 'k8s',       label: 'Kubernetes',  icon: '☸️', color: '#A78BFA' },
];

// ── Main View ─────────────────────────────────────────────────────────────────
interface DailyTasksViewProps {
  switchView?: (view: string) => void;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({ switchView }) => {
  const [activeTab,   setActiveTab]   = useState<TopTab>('instructions');
  const [filter,      setFilter]      = useState('All');
  const [selectedDay, setSelectedDay] = useState<number | null>(1);
  const [hoverBtn,    setHoverBtn]    = useState(false);
  const [completedCount, setCompletedCount] = useState(() => DAYS.filter(d => getTaskState(`devops100-${d.n}`).completed).length);

  useEffect(() => {
    const onUpdate = () => setCompletedCount(DAYS.filter(d => getTaskState(`devops100-${d.n}`).completed).length);
    window.addEventListener('devops90_task_updated', onUpdate);
    return () => window.removeEventListener('devops90_task_updated', onUpdate);
  }, []);

  const total     = DAYS.length;
  const XP        = completedCount * 800;
  const pct       = (completedCount / total) * 100;
  const filters   = ['All', ...Object.keys(CAT_META)];
  const filtered  = filter === 'All' ? DAYS : DAYS.filter(d => getCategory(d.n) === filter);
  const bars      = Array.from({ length: 20 }, (_, i) => i < Math.round(pct / 5));

  return (
    <div style={{ background: '#07101F', minHeight: '100vh', color: '#B8C9E0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '3px', color: '#00C4FF', textTransform: 'uppercase', marginBottom: 4 }}>
              xFusionCorp Industries
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#EEF2FF', letterSpacing: '-0.5px' }}>
              DevOps Challenge
            </div>
            <div style={{ fontSize: 12, color: '#4A7A9B', marginTop: 2 }}>
              100 days · 7 tracks · Production-grade lab tasks
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'rgba(0,196,255,0.08)', border: '1px solid rgba(0,196,255,0.25)', borderRadius: 12, padding: '12px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#00C4FF', fontFamily: 'monospace', lineHeight: 1 }}>
                {XP.toLocaleString()}
              </div>
              <div style={{ fontSize: 9, letterSpacing: '2.5px', color: '#4A7A9B', textTransform: 'uppercase', marginTop: 2 }}>
                XP Earned
              </div>
            </div>
            {switchView && (
              <button
                onClick={() => switchView('dashboard')}
                onMouseEnter={() => setHoverBtn(true)}
                onMouseLeave={() => setHoverBtn(false)}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #1E2D47', background: hoverBtn ? '#0C1829' : 'transparent', color: '#7A9BB5', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
              >
                ← Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: '#0C1829', border: '1px solid #152235', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#4A7A9B', letterSpacing: '0.5px' }}>CHALLENGE PROGRESS</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#00C4FF' }}>{completedCount} / {total} days</span>
          </div>
          <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
            {bars.map((filled, i) => (
              <div key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: filled ? '#00C4FF' : '#152235', boxShadow: filled ? '0 0 6px rgba(0,196,255,0.5)' : 'none' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {Object.entries(CAT_META).map(([k, v]) => (
                <span key={k} style={{ fontSize: 10, color: v.color + '88', letterSpacing: '0.5px' }}>
                  {v.icon} {k}
                </span>
              ))}
            </div>
            <span style={{ fontSize: 10, color: '#2A3D52' }}>{pct.toFixed(0)}% complete</span>
          </div>
        </div>

        {/* Top-level Tab Bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid #152235', paddingBottom: 0 }}>
          {TOP_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? `${tab.color}12` : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? tab.color : 'transparent'}`,
                borderRadius: '8px 8px 0 0',
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 400,
                cursor: 'pointer',
                color: activeTab === tab.id ? tab.color : '#4A7A9B',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Git / Linux / Jenkins / Docker / AWS tabs */}
        {activeTab === 'git'     && <ChallengeTab trackName="Git"     tasks={GIT_TASKS} />}
        {activeTab === 'linux'   && <ChallengeTab trackName="Linux"   tasks={LINUX_TASKS} />}
        {activeTab === 'jenkins' && <ChallengeTab trackName="Jenkins" tasks={JENKINS_TASKS} />}
        {activeTab === 'docker'  && <ChallengeTab trackName="Docker"  tasks={DOCKER_TASKS} />}
        {activeTab === 'aws'     && <ChallengeTab trackName="AWS"       tasks={AWS_TASKS} />}
        {activeTab === 'k8s'     && <ChallengeTab trackName="Kubernetes" tasks={KUBERNETES_TASKS} />}

        {/* Instructions tab content */}
        {activeTab === 'instructions' && (
          <div style={{ background: '#0C1829', border: '1px solid #152235', borderRadius: 12, padding: '24px 32px', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#10B981', marginBottom: 16 }}>Lab Environment Setup Instructions</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#A3B8CC', marginBottom: 24 }}>
              To complete the tasks in this challenge, you will need to provision the following servers and users to match the <strong>Nautilus Architecture</strong> used throughout the lab scenarios.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#EEF2FF', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>🖥️ Core Servers & OS Users</h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: 20, color: '#A3B8CC', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                  <li><strong>Jump Host</strong> (<code>stjump01</code>): User <code>thor</code> (and occasionally <code>mark</code>). <em>Note: Jenkins is installed directly on this server.</em></li>
                  <li><strong>App Server 1</strong> (<code>stapp01</code>): User <code>tony</code> (and occasionally <code>mark</code>)</li>
                  <li><strong>App Server 2</strong> (<code>stapp02</code>): User <code>steve</code></li>
                  <li><strong>App Server 3</strong> (<code>stapp03</code>): User <code>banner</code></li>
                  <li><strong>Database Server</strong> (<code>stdb01</code>): OS User <code>peter</code></li>
                  <li><strong>Load Balancer</strong> (<code>stlb01</code>): User <code>loki</code></li>
                  <li><strong>Storage Server</strong> (<code>ststor01</code>): User <code>natasha</code></li>
                  <li><strong>Mail Server</strong> (<code>stmail01</code>): User <code>groot</code></li>
                </ul>
              </div>

              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#EEF2FF', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>⚙️ Jenkins (Runs on Jump Host)</h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: 20, color: '#A3B8CC', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                  <li><strong>Default Admin:</strong> Username <code>admin</code> (Password is retrieved from <code>/var/lib/jenkins/secrets/initialAdminPassword</code> or set to <code>Adm!n321</code>)</li>
                  <li><strong>Additional Users to Create:</strong> <code>siva</code> (Password: <code>ksH85UJjhb</code>), <code>james</code> (Password: <code>James@123</code>)</li>
                  <li><strong>DockerHub Credentials:</strong> ID <code>dockerhub-creds</code> with username <code>nayagk</code></li>
                </ul>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 8, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#EEF2FF', marginBottom: 8 }}>🗄️ Database Users (stdb01)</h3>
                  <ul style={{ listStyleType: 'disc', paddingLeft: 20, color: '#A3B8CC', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                    <li><strong>PostgreSQL:</strong> <code>analyst</code> (Password: <code>Analyst@123</code>)</li>
                    <li><strong>MySQL/MariaDB:</strong> <code>session_user</code> (Password: <code>Session@123</code>)</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 8, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#EEF2FF', marginBottom: 8 }}>🔀 Source Control (Gitea)</h3>
                  <ul style={{ listStyleType: 'disc', paddingLeft: 20, color: '#A3B8CC', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                    <li><strong>Server / URL:</strong> <code>git.stratos.xfusioncorp.com</code></li>
                    <li><strong>Usernames:</strong> <code>your_user</code> (dev credentials) and <code>sarah</code> (repo owner)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DevOps 100 tab content */}
        {activeTab === 'devops100' && (<>

        {/* Task Detail Panel */}
        {selectedDay !== null && (
          <TaskDetailPanel dayNum={selectedDay} onClose={() => setSelectedDay(null)} />
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#152235' }} />
          <span style={{ fontSize: 10, color: '#2A3D52', letterSpacing: '2px', textTransform: 'uppercase' }}>All 100 Days</span>
          <div style={{ flex: 1, height: 1, background: '#152235' }} />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {filters.map(f => {
            const active = filter === f;
            const m      = f === 'All' ? null : CAT_META[f];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: active ? (m ? m.dim : 'rgba(0,196,255,0.1)') : 'transparent',
                  border: `1px solid ${active ? (m ? m.color + '44' : 'rgba(0,196,255,0.4)') : '#152235'}`,
                  borderRadius: 20, padding: '4px 14px', fontSize: 11,
                  cursor: 'pointer',
                  color: active ? (m ? m.color : '#00C4FF') : '#4A7A9B',
                  transition: 'all 0.15s',
                }}
              >
                {m ? `${m.icon} ` : ''}{f}
                {m && <span style={{ opacity: 0.55, marginLeft: 4, fontSize: 9 }}>{m.range}</span>}
              </button>
            );
          })}
        </div>

        {/* Day Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 8 }}>
          {filtered.map(d => (
            <DayCard
              key={d.n}
              day={d}
              isSelected={selectedDay === d.n}
              onClick={() => setSelectedDay(prev => prev === d.n ? null : d.n)}
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#1E2D3A' }}>
          Showing {filtered.length} of {total} tasks · {completedCount} completed · {total - completedCount} locked
        </div>

        </>)}{/* end devops100 tab */}
      </div>
    </div>
  );
};
