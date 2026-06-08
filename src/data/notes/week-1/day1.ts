import { BootcampDay } from '../types';

export const day1: BootcampDay = {
  day: 1,
  title: "Linux Foundations on EC2",
  subtitle: "Mental models before tools. This day separates people who configure vs. people who understand.",
  color: "#7fff6a",
  trainerNote: "90% of DevOps bugs I see in the real world — from juniors AND seniors — are from people who skipped this layer. They Googled the fix without understanding WHY it broke.",
  engineerNote: "I've been in prod incidents at 2am where the person who saved us wasn't the one who knew the most commands. It was the one who understood the flow of a request end-to-end.",
  goal: {
    icon: "🎯",
    title: "Day 1 Goal",
    description: "By the end of Day 1 you can navigate a Linux server, create and manage files, understand permissions, and not panic when you only have a terminal. Expected output: a setup.sh script on your EC2 that a teammate could run to replicate your environment."
  },
  schedule: [
    {
      time: "09:00 – 09:45",
      phase: "SETUP",
      activity: "AWS Free Tier account + EC2 instance launch",
      why: "Your practice server. Everything from Day 1 onward happens here. Never do DevOps on your local machine when you have a real server available."
    },
    {
      time: "09:45 – 10:30",
      phase: "THEORY",
      activity: "What Linux actually is + the terminal mental model",
      why: "15 min: Linux distros and why Ubuntu. 20 min: Filesystem hierarchy — / vs /home vs /etc vs /var. 15 min: Process model (kernel → shell → process)."
    },
    {
      time: "10:30 – 10:45",
      phase: "BREAK",
      activity: "15-minute physical break — mandatory",
      why: "Step away from the screen. Walk. Your brain encodes what you learned in the previous block during rest."
    },
    {
      time: "10:45 – 12:30",
      phase: "HANDS-ON",
      activity: "Navigation + File system commands",
      why: "Type every command in this pack. Do not paste. Make deliberate mistakes to see error messages. Read the error — it tells you exactly what went wrong."
    },
    {
      time: "12:30 – 13:15",
      phase: "BREAK",
      activity: "Lunch. Away from screen.",
      why: "No passive \"learning\" videos during lunch. Your concentration degrades after 3 hours."
    },
    {
      time: "13:15 – 15:00",
      phase: "HANDS-ON",
      activity: "Permissions, users, process management",
      why: "The most screened Linux topics in junior DevOps interviews. chmod, chown, ps, kill, systemctl — you will use these in production on Day 1 of your first job."
    },
    {
      time: "15:00 – 15:15",
      phase: "BREAK",
      activity: "Short break + review mental notes",
      why: "Step away and review."
    },
    {
      time: "15:15 – 16:30",
      phase: "PROJECT",
      activity: "Mini Project: server_setup.sh",
      why: "Build the bash script. Test it. Break it intentionally. Fix it. This is your first portfolio artifact."
    },
    {
      time: "16:30 – 17:00",
      phase: "DOCUMENT",
      activity: "Write GitHub notes + Quiz yourself",
      why: "Open your notes repo. Write what you learned in your own words. Do the quiz at the end of this section. If you score below 70%, re-read the commands block."
    }
  ],
  concepts: [
    {
      icon: "🗂",
      title: "Filesystem Hierarchy Standard",
      description: "Linux organises everything under / (root). Every file, device, and process is a path. There are no drive letters like Windows.",
      analogy: "Think of / like the ground floor of a building. /home is the residents' floor. /etc is the manager's office with config files. /var is the storage room with logs and data."
    },
    {
      icon: "🔐",
      title: "File Permissions (rwx)",
      description: "Every file has 3 permission sets: owner, group, others. r=read(4), w=write(2), x=execute(1). These numbers add up: 755 = owner full, group+others read+execute.",
      analogy: "Your front door key (owner), spare key for family (group), and the fact a stranger can ring the bell but not enter (others)."
    },
    {
      icon: "⚙️",
      title: "Processes and Services",
      description: "Every running program is a process with a PID (process ID). systemd manages services — programs that start at boot and run in the background (like nginx, sshd).",
      analogy: "A process is like a running app on your phone. A service is like an app set to auto-start when you turn the phone on."
    },
    {
      icon: "📦",
      title: "Package Manager (apt)",
      description: "apt is Ubuntu's app store for the terminal. apt install downloads and installs software. apt update fetches the latest list of available software — do this before every install.",
      analogy: "apt update = refreshing your app store. apt install nginx = downloading and installing the app."
    },
    {
      icon: "📝",
      title: "Text Editors: nano vs vim",
      description: "On a server you have no GUI. You edit files in the terminal. nano is beginner-friendly. vim is what seniors use. Learn nano first — know that vim exists.",
      analogy: "nano is like Notepad. vim is like a professional IDE but keyboard-only — has modes that confuse beginners."
    },
    {
      icon: "🔌",
      title: "SSH (Secure Shell)",
      description: "SSH is how you connect to a remote server (like your EC2) from your laptop. You use a private key (.pem file) instead of a password. The server has the matching public key.",
      analogy: "A lock-and-key system. Your .pem file is the physical key. The EC2 is the lock. Only your key opens it."
    },
    {
      icon: "📊",
      title: "Text Processing Utilities",
      description: "awk (column extraction), cut (delimiter splitting), sort (ordering), uniq (deduplication), and wc (counting) are the core tools for parsing logs and stdout.",
      analogy: "Excel spreadsheet functions but in the terminal. awk picks columns, cut splits cells, sort and uniq count records, and wc counts rows."
    },
    {
      icon: "📜",
      title: "journald & journalctl",
      description: "Modern Linux services log to systemd's journald service. journalctl queries these logs, allowing filter by service, time, boot, or log level.",
      analogy: "Like a centralized event viewer on Windows. Instead of searching individual files in /var/log/, you search one database."
    },
    {
      icon: "🔍",
      title: "Port Auditing with lsof & ss",
      description: "lsof (list open files) and ss (socket statistics) identify which processes are listening on or connected to specific network ports, resolving conflicts.",
      analogy: "Task Manager's Network tab. It shows exactly who is occupying a port (e.g. port 80) when Nginx fails to start."
    },
    {
      icon: "🐚",
      title: "Shell Environment Customization",
      description: "export makes variables available to child processes. alias defines shortcuts. .bashrc is the startup script where permanent configurations are defined.",
      analogy: "Setting your desktop environment variables or command aliases. Doing it in .bashrc makes it persistent; doing it in the terminal only lasts for that session."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 4,
      sessionTitle: "Connecting to EC2 + First Navigation",
      sections: [
        {
          label: "From your local machine (Mac/Linux terminal or Windows WSL/Git Bash)",
          lines: [
            { type: 'comment', text: "Fix key permissions — AWS refuses connection if key is too open" },
            { type: 'cmd', prompt: "$", text: "chmod 400 ~/Downloads/my-ec2-key.pem" },
            { type: 'comment', text: "chmod 400 = only owner can read. Required by SSH." },
            { type: 'cmd', prompt: "$", text: "ssh -i ~/Downloads/my-ec2-key.pem ubuntu@YOUR_EC2_PUBLIC_IP" },
            { type: 'comment', text: "Replace YOUR_EC2_PUBLIC_IP with the IPv4 from EC2 console" },
            { type: 'comment', text: "First time: type 'yes' when asked about host authenticity" },
            { type: 'ok', text: "Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 6.5.0-1022-aws x86_64)" },
            { type: 'output', text: "ubuntu@ip-172-31-xx-xx:~$" }
          ]
        },
        {
          label: "Now inside EC2 — Navigation Commands",
          lines: [
            { type: 'cmd', prompt: "$", text: "pwd" },
            { type: 'comment', text: "Print Working Directory — where am I right now?" },
            { type: 'output', text: "/home/ubuntu" },
            { type: 'cmd', prompt: "$", text: "ls" },
            { type: 'comment', text: "List files in current directory" },
            { type: 'comment', text: "Empty — you just connected, nothing here yet" },
            { type: 'cmd', prompt: "$", text: "ls -la" },
            { type: 'comment', text: "l=long format, a=show hidden files (starting with .)" },
            { type: 'output', text: "drwxr-x--- 4 ubuntu ubuntu 4096 Jun  2 09:12 ." },
            { type: 'output', text: "drwxr-xr-x 3 root   root   4096 Jun  2 09:00 .." },
            { type: 'output', text: "-rw-r--r-- 1 ubuntu ubuntu  220 Jan  1 2024 .bash_logout" },
            { type: 'output', text: "-rw-r--r-- 1 ubuntu ubuntu 3526 Jan  1 2024 .bashrc" },
            { type: 'cmd', prompt: "$", text: "cd /" },
            { type: 'comment', text: "Change to root directory" },
            { type: 'cmd', prompt: "$", text: "ls" },
            { type: 'output', text: "bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var" },
            { type: 'comment', text: "This is the entire Linux filesystem. Know each major one:" },
            { type: 'comment', text: "/etc = system config files (nginx.conf, sshd_config, etc)" },
            { type: 'comment', text: "/var = variable data — logs live at /var/log/" },
            { type: 'comment', text: "/home = user home directories" },
            { type: 'comment', text: "/tmp = temporary files, cleared on reboot" },
            { type: 'comment', text: "/usr = user programs (installed software)" },
            { type: 'cmd', prompt: "$", text: "cd ~" },
            { type: 'comment', text: "~ means \"my home directory\" — fastest way home" },
            { type: 'cmd', prompt: "$", text: "pwd" },
            { type: 'output', text: "/home/ubuntu" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 4,
      sessionTitle: "File Operations",
      sections: [
        {
          label: "Creating, Moving, Editing Files",
          lines: [
            { type: 'cmd', prompt: "$", text: "mkdir devops-notes" },
            { type: 'comment', text: "Make directory" },
            { type: 'cmd', prompt: "$", text: "cd devops-notes" },
            { type: 'cmd', prompt: "$", text: "touch day1.txt" },
            { type: 'comment', text: "Create empty file" },
            { type: 'cmd', prompt: "$", text: "echo \"Day 1 learning DevOps\" > day1.txt" },
            { type: 'comment', text: "Write text to file" },
            { type: 'cmd', prompt: "$", text: "cat day1.txt" },
            { type: 'comment', text: "Read file contents" },
            { type: 'output', text: "Day 1 learning DevOps" },
            { type: 'cmd', prompt: "$", text: "echo \"Second line\" >> day1.txt" },
            { type: 'comment', text: ">> appends, > overwrites" },
            { type: 'cmd', prompt: "$", text: "cat day1.txt" },
            { type: 'output', text: "Day 1 learning DevOps" },
            { type: 'output', text: "Second line" },
            { type: 'cmd', prompt: "$", text: "cp day1.txt day1-backup.txt" },
            { type: 'comment', text: "Copy" },
            { type: 'cmd', prompt: "$", text: "mv day1-backup.txt backup/" },
            { type: 'comment', text: "Move (rename or relocate)" },
            { type: 'err', text: "mv: cannot stat 'backup/': No such file or directory" },
            { type: 'comment', text: "Expected error! You haven't created backup/ yet. Fix:" },
            { type: 'cmd', prompt: "$", text: "mkdir backup" },
            { type: 'cmd', prompt: "$", text: "mv day1-backup.txt backup/" },
            { type: 'cmd', prompt: "$", text: "ls -la backup/" },
            { type: 'output', text: "-rw-rw-r-- 1 ubuntu ubuntu 35 Jun 2 10:30 day1-backup.txt" },
            { type: 'cmd', prompt: "$", text: "rm backup/day1-backup.txt" },
            { type: 'comment', text: "Remove file" },
            { type: 'warn', text: "WARNING: rm has NO RECYCLE BIN. Gone is gone. Never run rm -rf / as root." },
            { type: 'cmd', prompt: "$", text: "nano day1.txt" },
            { type: 'comment', text: "Open editor. Ctrl+X to exit, Y to save." }
          ]
        },
        {
          label: "Searching Inside Files",
          lines: [
            { type: 'cmd', prompt: "$", text: "grep \"Day\" day1.txt" },
            { type: 'comment', text: "Find lines containing \"Day\"" },
            { type: 'ok', text: "Day 1 learning DevOps" },
            { type: 'cmd', prompt: "$", text: "grep -r \"ubuntu\" /etc/" },
            { type: 'comment', text: "Recursive search in /etc" },
            { type: 'cmd', prompt: "$", text: "find / -name \"*.txt\" 2>/dev/null" },
            { type: 'comment', text: "Find all .txt files, hide errors" },
            { type: 'comment', text: "2>/dev/null = throw permission errors in the bin — you don't own every file" },
            { type: 'cmd', prompt: "$", text: "cat /var/log/syslog | grep \"error\"" },
            { type: 'comment', text: "Pipe output into grep" },
            { type: 'comment', text: "| (pipe) sends output of left command into right command. Vital for DevOps." }
          ]
        }
      ]
    },
    {
      sessionNumber: 3,
      totalSessions: 4,
      sessionTitle: "Permissions + Users + Services",
      sections: [
        {
          label: "Understanding and Changing Permissions",
          lines: [
            { type: 'cmd', prompt: "$", text: "ls -la day1.txt" },
            { type: 'output', text: "-rw-rw-r-- 1 ubuntu ubuntu 35 Jun 2 10:30 day1.txt" },
            { type: 'comment', text: "Breakdown: - (file) rw- (owner: read+write) rw- (group: rw) r-- (others: read only)" },
            { type: 'cmd', prompt: "$", text: "chmod 755 day1.txt" },
            { type: 'cmd', prompt: "$", text: "ls -la day1.txt" },
            { type: 'output', text: "-rwxr-xr-x 1 ubuntu ubuntu 35 Jun 2 10:30 day1.txt" },
            { type: 'comment', text: "7=rwx (owner), 5=r-x (group), 5=r-x (others)" },
            { type: 'cmd', prompt: "$", text: "chmod 600 day1.txt" },
            { type: 'comment', text: "Owner read+write only, nobody else" },
            { type: 'cmd', prompt: "$", text: "chmod +x myscript.sh" },
            { type: 'comment', text: "Add execute permission (symbolic method)" },
            { type: 'cmd', prompt: "$", text: "chown root:root day1.txt" },
            { type: 'comment', text: "Change owner to root" },
            { type: 'err', text: "chown: changing ownership of 'day1.txt': Operation not permitted" },
            { type: 'comment', text: "You need sudo (superuser do) for that. This is correct behavior." },
            { type: 'cmd', prompt: "$", text: "sudo chown ubuntu:ubuntu day1.txt" },
            { type: 'comment', text: "sudo grants temporary root powers" }
          ]
        },
        {
          label: "Processes and System Services",
          lines: [
            { type: 'cmd', prompt: "$", text: "ps aux" },
            { type: 'comment', text: "All running processes. USER PID %CPU %MEM COMMAND" },
            { type: 'cmd', prompt: "$", text: "ps aux | grep ssh" },
            { type: 'comment', text: "Filter: find the sshd service process" },
            { type: 'output', text: "root 789 0.0 0.3 /usr/sbin/sshd -D" },
            { type: 'cmd', prompt: "$", text: "top" },
            { type: 'comment', text: "Live process monitor. Press q to quit." },
            { type: 'cmd', prompt: "$", text: "htop" },
            { type: 'comment', text: "Better version. Install if not present:" },
            { type: 'cmd', prompt: "$", text: "sudo apt update && sudo apt install htop -y" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl status ssh" },
            { type: 'comment', text: "Check if SSH service is running" },
            { type: 'ok', text: "● ssh.service - OpenBSD Secure Shell server" },
            { type: 'ok', text: "   Active: active (running) since Mon 2026-06-02 09:00:15 UTC" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl status nginx" },
            { type: 'comment', text: "Check status of web server" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl start nginx" },
            { type: 'comment', text: "Start nginx (if installed)" },
            { type: 'cmd', prompt: "$", text: "sudo systemctl enable nginx" },
            { type: 'comment', text: "Auto-start on reboot" },
            { type: 'cmd', prompt: "$", text: "df -h" },
            { type: 'comment', text: "Disk usage. -h = human readable (GB, MB)" },
            { type: 'cmd', prompt: "$", text: "free -h" },
            { type: 'comment', text: "RAM usage" },
            { type: 'cmd', prompt: "$", text: "uptime" },
            { type: 'comment', text: "How long server has been running" },
            { type: 'cmd', prompt: "$", text: "who" },
            { type: 'comment', text: "Who is logged in right now" },
            { type: 'cmd', prompt: "$", text: "history" },
            { type: 'comment', text: "All commands you've typed this session" },
            { type: 'cmd', prompt: "$", text: "history | grep chmod" },
            { type: 'comment', text: "Search your command history" }
          ]
        }
      ],
      expectedOutput: {
        label: "✅ Expected Output After Session 3",
        text: "You can: SSH into your EC2, navigate directories without getting lost, create/edit/delete files, read permission strings, use chmod and chown, check which services are running, and see disk/RAM usage."
      }
    },
    {
      sessionNumber: 4,
      totalSessions: 4,
      sessionTitle: "Text Processing, Log Auditing, and Shell Customization",
      sections: [
        {
          label: "Linux Text Processing (awk, cut, sort, uniq, wc, tar)",
          lines: [
            { type: 'cmd', prompt: "$", text: "df -h | awk 'NR==2 {print $5}'" },
            { type: 'comment', text: "awk: NR==2 means row 2 (skips header), $5 prints 5th column (Use%)" },
            { type: 'output', text: "18%" },
            { type: 'cmd', prompt: "$", text: "df -h | awk 'NR>1 {print $1, $5}'" },
            { type: 'comment', text: "NR>1 means row 1 is excluded. Print partition name and Use%" },
            { type: 'cmd', prompt: "$", text: "free -m | awk 'NR==2 {print $4}'" },
            { type: 'comment', text: "Print free RAM in MB (row 2, column 4)" },
            { type: 'cmd', prompt: "$", text: "ps aux | awk '{print $1, $11}' | head -5" },
            { type: 'comment', text: "List owners and command paths of running processes" },
            { type: 'cmd', prompt: "$", text: "cat /etc/passwd | cut -d: -f1 | head -5" },
            { type: 'comment', text: "cut: -d: splits on colon, -f1 extracts 1st field (usernames)" },
            { type: 'output', text: "root\ndaemon\nbin\nsys\nsync" },
            { type: 'cmd', prompt: "$", text: "echo \"2026-06-05 14:30:01\" | cut -d' ' -f1" },
            { type: 'output', text: "2026-06-05" },
            { type: 'cmd', prompt: "$", text: "echo \"192.168.1.1\" | cut -d. -f1-3" },
            { type: 'output', text: "192.168.1" },
            { type: 'cmd', prompt: "$", text: "cat /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10" },
            { type: 'comment', text: "Pipeline to find top 10 IP addresses hitting your server" },
            { type: 'cmd', prompt: "$", text: "cat /var/log/auth.log | grep \"Failed password\" | wc -l" },
            { type: 'comment', text: "Count failed SSH password attempts" },
            { type: 'cmd', prompt: "$", text: "wc -l /var/log/syslog" },
            { type: 'comment', text: "Count total lines in syslog file" },
            { type: 'cmd', prompt: "$", text: "tar -czf backup-$(date +%Y%m%d).tar.gz ~/devops-notes/" },
            { type: 'comment', text: "tar: -c (create), -z (gzip compress), -f (output filename)" },
            { type: 'cmd', prompt: "$", text: "tar -tzf backup-*.tar.gz | head -10" },
            { type: 'comment', text: "tar: -t lists files in the archive to verify contents before extracting" },
            { type: 'cmd', prompt: "$", text: "tar -xzf backup-*.tar.gz -C /tmp/" },
            { type: 'comment', text: "tar: -x extracts archive, -C extracts into specific target directory" }
          ]
        },
        {
          label: "journalctl Logs & Port Auditing (lsof, ss, scp)",
          lines: [
            { type: 'cmd', prompt: "$", text: "journalctl -u nginx -n 10" },
            { type: 'comment', text: "journalctl: -u specifies service, -n 10 gets last 10 lines of logs" },
            { type: 'cmd', prompt: "$", text: "journalctl -u nginx -f" },
            { type: 'comment', text: "journalctl: -f live-follows logs as they are written" },
            { type: 'cmd', prompt: "$", text: "journalctl -u nginx --since \"1 hour ago\"" },
            { type: 'cmd', prompt: "$", text: "journalctl -p err -u nginx" },
            { type: 'comment', text: "-p filters logs by severity level (err, crit, warning, info, etc.)" },
            { type: 'cmd', prompt: "$", text: "journalctl --disk-usage" },
            { type: 'cmd', prompt: "$", text: "journalctl -b" },
            { type: 'comment', text: "-b filters logs since the current system boot" },
            { type: 'cmd', prompt: "$", text: "journalctl -b -1" },
            { type: 'comment', text: "-b -1 shows logs from the previous boot cycle (crucial after crash)" },
            { type: 'cmd', prompt: "$", text: "sudo lsof -i :80" },
            { type: 'comment', text: "lsof: find which process is listening on port 80" },
            { type: 'output', text: "COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nnginx   2341 root    6u  IPv4  18923      0t0  TCP *:http (LISTEN)" },
            { type: 'cmd', prompt: "$", text: "sudo ss -tlnp | grep :80" },
            { type: 'comment', text: "ss: Socket Statistics. Faster alternative to check listening ports (-l=listen, -t=tcp, -n=numeric, -p=process)" },
            { type: 'cmd', prompt: "$", text: "scp -i ~/.ssh/my-key.pem ~/local-file.txt ubuntu@EC2_IP:~/remote-file.txt" },
            { type: 'comment', text: "scp: Secure Copy. Run from your local machine to upload files to EC2" },
            { type: 'cmd', prompt: "$", text: "scp -i ~/.ssh/my-key.pem ubuntu@EC2_IP:~/logs/health.log ~/Downloads/" },
            { type: 'comment', text: "Run locally to download file from EC2 to Downloads folder" }
          ]
        },
        {
          label: "Shell Environments (export, alias, .bashrc)",
          lines: [
            { type: 'cmd', prompt: "$", text: "MY_VAR=\"local only\" && bash -c 'echo $MY_VAR'" },
            { type: 'comment', text: "No output because MY_VAR is not exported to child processes" },
            { type: 'cmd', prompt: "$", text: "export MY_VAR=\"now exported\" && bash -c 'echo $MY_VAR'" },
            { type: 'output', text: "now exported" },
            { type: 'cmd', prompt: "$", text: "export AWS_PROFILE=learning" },
            { type: 'cmd', prompt: "$", text: "export AWS_DEFAULT_REGION=eu-west-1" },
            { type: 'cmd', prompt: "$", text: "export PATH=\"$PATH:/usr/local/bin\"" },
            { type: 'cmd', prompt: "$", text: "env | grep AWS" },
            { type: 'output', text: "AWS_PROFILE=learning\nAWS_DEFAULT_REGION=eu-west-1" },
            { type: 'cmd', prompt: "$", text: "alias gs='git status'" },
            { type: 'comment', text: "Create an interactive shell shortcut (only lasts current session)" },
            { type: 'cmd', prompt: "$", text: "alias gl='git log --oneline --graph --all'" },
            { type: 'cmd', prompt: "$", text: "alias nlog='sudo tail -f /var/log/nginx/access.log'" },
            { type: 'cmd', prompt: "$", text: "alias myip='curl -s ifconfig.me'" },
            { type: 'cmd', prompt: "$", text: "nano ~/.bashrc" },
            { type: 'comment', text: "Edit .bashrc startup script to make environment variables and aliases permanent" },
            { type: 'comment', text: "Add custom prompt parse_git_branch function to show branch name" },
            { type: 'cmd', prompt: "$", text: "source ~/.bashrc" },
            { type: 'comment', text: "Load modifications immediately into current terminal" }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "If SSH Connection Fails",
      steps: [
        {
          num: 1,
          title: "Check error message first",
          description: "\"Permission denied (publickey)\" → key problem. \"Connection timed out\" → network/security group problem."
        },
        {
          num: 2,
          title: "Key permissions wrong (most common)",
          description: "AWS refuses connection if .pem is readable by others.",
          cmd: "chmod 400 your-key.pem"
        },
        {
          num: 3,
          title: "Wrong username — Ubuntu EC2 uses \"ubuntu\", not \"ec2-user\"",
          description: "Amazon Linux uses ec2-user. Ubuntu AMI uses ubuntu. Check which you launched.",
          cmd: "ssh -i key.pem ubuntu@IP"
        },
        {
          num: 4,
          title: "Security Group blocking port 22",
          description: "Go to EC2 console → Security Groups → Inbound Rules. Port 22 must allow your IP (or 0.0.0.0/0 for testing, never in production)."
        },
        {
          num: 5,
          title: "Instance is stopped",
          description: "Check EC2 console. Instance State must be \"Running\". Start it if stopped."
        }
      ]
    },
    {
      title: "If a Command Says \"Permission denied\"",
      steps: [
        {
          num: 1,
          title: "Try running with sudo first",
          cmd: "sudo [your command here]"
        },
        {
          num: 2,
          title: "Check file ownership",
          description: "Who owns the file? Who are you?",
          cmd: "ls -la filename && whoami"
        },
        {
          num: 3,
          title: "Check if execute bit is missing for a script",
          cmd: "chmod +x script.sh && ./script.sh"
        }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Using sudo for everything",
      description: "Running all commands as root because \"it avoids permission errors.\" This destroys proper file ownership and creates real security risks in production. Use sudo only when explicitly needed.",
      fix: "Fix: Run as ubuntu, escalate to sudo only when the command itself requires it."
    },
    {
      mistake: "Using > when they mean >>",
      description: "echo \"line\" > file.txt overwrites the entire file every time. Beginners lose data they wanted to keep.",
      fix: "Fix: Use >> to append. Use > only when you want to replace the entire file content."
    },
    {
      mistake: "Not updating before apt install",
      description: "apt install nginx without running apt update first installs old or wrong versions from a stale package list.",
      fix: "Fix: Always: sudo apt update && sudo apt install [package] -y"
    },
    {
      mistake: "Leaving EC2 running when not studying",
      description: "Free tier has limits. Leaving a t2.micro running for 31 days is fine. Leaving 2–3 running or running larger instances drains your free tier allowance and causes unexpected charges.",
      fix: "Fix: Stop (not terminate) EC2 when done for the day. Stop = paused, billed for storage only. Terminate = permanently deleted."
    },
    {
      mistake: "Pasting commands without reading them",
      description: "Copying a Stack Overflow command and running it blindly. In DevOps this causes real outages. In learning it means you understand nothing.",
      fix: "Fix: Read every command word by word. Look up any flag you don't know with man [command] or [command] --help."
    },
    {
      mistake: "Treating chmod 777 as the fix-everything command",
      description: "chmod 777 gives everyone read+write+execute access to a file. Beginners use it to fix permission errors. In production it's a critical security vulnerability.",
      fix: "Fix: Diagnose why you need access (wrong user? wrong group?), fix the root cause. chmod 777 is almost never the right answer."
    },
    {
      mistake: "Using /var/log/ when journalctl would find the answer faster",
      description: "Modern Ubuntu services log directly to systemd's journald. If you search for service-specific log files under /var/log/ and they aren't there, you'll be stuck.",
      fix: "Fix: Use journalctl -u SERVICE -n 50 first to inspect modern systemd logs."
    },
    {
      mistake: "Defining aliases inside automation shell scripts",
      description: "Aliases are only expanded in interactive shells by default. If you write 'alias gs=...' in .bashrc and then call 'gs' inside a script, the script execution will fail with 'command not found'.",
      fix: "Fix: Always use raw commands (like 'git status') or define full functions inside non-interactive shell scripts."
    }
  ],
  project: {
    tag: "📁 Day 1 Mini Project",
    title: "server_setup.sh — Your First Automation Script",
    timeEstimate: "⏱ ~60 minutes",
    goal: "Write a bash script that a teammate could run on a fresh Ubuntu EC2 to replicate your development environment. This is the beginner version of what DevOps engineers call \"server provisioning\" — automating the setup of a machine.",
    checklist: [
      "Create the file ~/devops-notes/server_setup.sh",
      "The script must update the package list with apt update",
      "Install: git, curl, htop, tree, unzip",
      "Create a directory structure: ~/projects, ~/projects/scripts, ~/projects/logs",
      "Write a success message at the end: echo \"✓ Setup complete — $(date)\"",
      "Make the script executable with chmod +x",
      "Run it and verify it works without errors",
      "Run it a second time — it should still work without breaking"
    ],
    codeBlock: {
      title: "server_setup.sh — Build This File",
      lines: [
        "#!/bin/bash",
        "# The shebang line — tells the system to use bash to run this",
        "",
        "set -e",
        "# set -e: exit immediately if any command fails — catches errors early",
        "",
        "echo \"=== Starting server setup ===\"",
        "echo \"Date: $(date)\"",
        "echo \"User: $(whoami)\"",
        "",
        "echo \"--- Updating package list ---\"",
        "sudo apt update -y",
        "",
        "echo \"--- Installing tools ---\"",
        "sudo apt install -y git curl htop tree unzip",
        "",
        "echo \"--- Creating project directories ---\"",
        "mkdir -p ~/projects/scripts ~/projects/logs",
        "# -p flag: creates parent dirs if they don't exist, no error if they do",
        "",
        "echo \"--- Verifying installs ---\"",
        "git --version",
        "curl --version | head -1",
        "",
        "echo \"=== ✓ Setup complete — $(date) ===\"",
        "# Ctrl+X, then Y, then Enter to save and exit nano",
        "",
        "chmod +x ~/devops-notes/server_setup.sh",
        "bash ~/devops-notes/server_setup.sh"
      ]
    },
    expectedOutput: "=== Starting server setup ===\nDate: Tue Jun 2 14:30:00 UTC 2026\nUser: ubuntu\n--- Updating package list ---\n[apt output]\n--- Installing tools ---\n[apt install output]\n--- Verifying installs ---\ngit version 2.43.0\ncurl 7.88.1 (x86_64-pc-linux-gnu)\n=== ✓ Setup complete — Tue Jun 2 14:32:41 UTC 2026 ==="
  },
  interview: [
    {
      question: "Can you explain Linux file permissions to me?",
      answer: "Linux permissions are split into three groups: the owner of the file, the group it belongs to, and everyone else — called others. Each group gets three bits: read, write, and execute, represented as rwx. These map to numbers: r=4, w=2, x=1, so 7 means full access, 5 means read and execute, 4 means read only. A permission of 755 means the owner has full access, and the group and others can read and execute but not write. chmod is the command to change permissions, chown changes ownership. I use chmod 600 for private key files — only the owner can read, nobody else can touch it."
    },
    {
      question: "What's the difference between a process and a service?",
      answer: "A process is any running program — it has a Process ID, uses CPU and memory, and ends when its job is done. A service is a special type of process managed by systemd — it's designed to start at boot time, run continuously in the background, and be monitored and restarted if it crashes. For example, when I install nginx on a server, I use systemctl enable nginx to make it a service that starts automatically on every reboot, rather than having to manually start it each time."
    },
    {
      question: "Why would you use sudo and when wouldn't you?",
      answer: "sudo — superuser do — temporarily elevates your privileges to root level for a single command. I use it when I need to install packages, modify system configuration files in /etc, or manage services with systemctl. I would not use it for anything involving my own files in my home directory, or when writing application code. Running everything as root is dangerous because a bug or mistyped command has system-wide consequences — there's no safety net."
    },
    {
      question: "How do you diagnose a service that's failing to start — walk me through your process.",
      answer: "First step is always to check the service status: sudo systemctl status servicename — this shows the last few log lines and the exit code. If the status isn't enough detail, I go to the journal: journalctl -u servicename -n 50 gives me the last 50 log entries for that unit. If it's a port conflict — another process already using port 80 for example — I check with sudo ss -tlnp or lsof -i :80 to see what process has the port. For nginx specifically I also run sudo nginx -t to test config syntax before attempting a restart. I work top-down: service status → logs → config → resources — rather than restarting blindly and hoping."
    },
    {
      question: "How do you make a configuration change permanent on a Linux server vs just the current session?",
      answer: "It depends on what you're changing. For shell environment variables and aliases — things you want every time you log in — I add them to ~/.bashrc (or ~/.bash_profile for login shells). After editing, I run source ~/.bashrc to apply without logging out. For PATH changes, service configurations, or system-wide settings, it depends on the service: nginx config lives in /etc/nginx/, systemd unit files live in /etc/systemd/system/. For a service change, after editing the unit file I run systemctl daemon-reload and then systemctl restart or reload. The key mental model is: anything done in a terminal session is temporary — to make it survive reboots or new login sessions, it needs to be written to the appropriate config file."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "What does chmod 644 notes.txt mean?",
      options: [
        { text: "A) Owner, group, others all have read+write access", isCorrect: false },
        { text: "B) Owner has read+write; group and others have read-only", isCorrect: true },
        { text: "C) Everyone has full access", isCorrect: false },
        { text: "D) Owner has execute; group has write", isCorrect: false }
      ],
      explanation: "6=rw (4+2), 4=r (read only). So owner gets read+write, group gets read, others get read. Perfect for a public config file — everyone can read it, only you can edit it."
    },
    {
      num: 2,
      question: "You want to append a line to a file without deleting its contents. Which operator?",
      options: [
        { text: "A) >", isCorrect: false },
        { text: "B) >>", isCorrect: true },
        { text: "C) |", isCorrect: false },
        { text: "D) &", isCorrect: false }
      ],
      explanation: "> overwrites. >> appends. | pipes. This is one of the most common beginner mistakes that causes data loss."
    },
    {
      num: 3,
      question: "A service file change isn't taking effect after editing it. What are the correct two commands to apply the change?",
      options: [
        { text: "A) sudo reboot && sudo apt update", isCorrect: false },
        { text: "B) sudo service reload && sudo restart", isCorrect: false },
        { text: "C) sudo systemctl daemon-reload && sudo systemctl restart [service]", isCorrect: true },
        { text: "D) sudo kill [pid] && sudo start [service]", isCorrect: false }
      ],
      explanation: "After editing a systemd service file you must daemon-reload (re-read the config) then restart the specific service. Rebooting the whole server is amateur behaviour in production."
    },
    {
      num: 4,
      question: "Where would you look for nginx error logs on a Linux server?",
      options: [
        { text: "A) /home/ubuntu/logs/", isCorrect: false },
        { text: "B) /etc/nginx/errors/", isCorrect: false },
        { text: "C) /var/log/nginx/", isCorrect: true },
        { text: "D) /tmp/nginx/", isCorrect: false }
      ],
      explanation: "/var is for variable data — logs live at /var/log/. Application logs (nginx, apache, etc.) almost always live here. Learning to read logs is 50% of being a DevOps engineer."
    },
    {
      num: 5,
      question: "What command shows all currently running processes including their CPU and memory usage, live?",
      options: [
        { text: "A) ps aux", isCorrect: false },
        { text: "B) df -h", isCorrect: false },
        { text: "C) top or htop", isCorrect: true },
        { text: "D) who", isCorrect: false }
      ],
      explanation: "ps aux gives a snapshot. top and htop are live/real-time views that update every second. htop has a better interface and is preferred by most engineers."
    },
    {
      num: 6,
      question: "You need to check nginx logs but journalctl -u nginx shows nothing. Where else do you look?",
      options: [
        { text: "A) /tmp/nginx/", isCorrect: false },
        { text: "B) /var/log/nginx/error.log and /var/log/nginx/access.log", isCorrect: true },
        { text: "C) ~/.nginx/logs/", isCorrect: false },
        { text: "D) /etc/nginx/logs/", isCorrect: false }
      ],
      explanation: "nginx writes its own logs to /var/log/nginx/ in addition to (or instead of) journald, depending on configuration. If journalctl is empty, the nginx-specific log files are the next place to check."
    },
    {
      num: 7,
      question: "What does this command do: cat /var/log/auth.log | awk '{print $1,$2}' | sort | uniq -c | sort -rn | head -5",
      options: [
        { text: "A) Deletes the 5 oldest auth log entries", isCorrect: false },
        { text: "B) Shows the 5 most frequent date-time combinations in the auth log — a basic log frequency analysis", isCorrect: true },
        { text: "C) Copies the auth log to a new file", isCorrect: false },
        { text: "D) Counts total lines in the auth log", isCorrect: false }
      ],
      explanation: "This pipeline: extracts columns 1+2 (date and time), sorts them, counts duplicates, sorts numerically in reverse, and shows top 5. Useful for spotting brute-force attack patterns."
    },
    {
      num: 8,
      question: "Your .bashrc has alias gs='git status' but the alias stops working when you run a shell script that calls gs. Why?",
      options: [
        { text: "A) Shell scripts don't support aliases", isCorrect: false },
        { text: "B) Aliases are only available in interactive shells by default — not in non-interactive script subshells", isCorrect: true },
        { text: "C) The alias syntax is wrong", isCorrect: false },
        { text: "D) You need to restart the EC2", isCorrect: false }
      ],
      explanation: "Bash only expands aliases in interactive shells by default. A script runs in a non-interactive subshell where .bashrc aliases are not loaded. Use raw commands in scripts."
    },
    {
      num: 9,
      question: "You want to securely copy a log file from your EC2 to your laptop. Which command?",
      options: [
        { text: "A) aws s3 cp only works for this", isCorrect: false },
        { text: "B) scp -i key.pem ubuntu@EC2_IP:~/logs/health.log ~/Downloads/", isCorrect: true },
        { text: "C) ssh -i key.pem ubuntu@EC2_IP cat health.log", isCorrect: false },
        { text: "D) rsync is the only option", isCorrect: false }
      ],
      explanation: "scp (secure copy) uses SSH under the hood — same key, host, and user. Syntax is: scp -i key.pem remote_user@remote_ip:remote_path local_path."
    },
    {
      num: 10,
      question: "What does tar -czf archive.tar.gz ~/scripts/ do?",
      options: [
        { text: "A) Extracts archive.tar.gz into ~/scripts/", isCorrect: false },
        { text: "B) Creates (-c) a gzip-compressed (-z) archive (-f) named archive.tar.gz containing the ~/scripts/ directory", isCorrect: true },
        { text: "C) Lists the contents of an existing archive", isCorrect: false },
        { text: "D) Compresses only without creating an archive", isCorrect: false }
      ],
      explanation: "-c creates, -z compresses with gzip, -f specifies output filename. To extract: tar -xzf. To list contents: tar -tzf."
    }
  ],
  github: {
    filename: "devops-notes/day-01/README.md",
    commitMessage: "docs: Add Day 01 notes — Linux Foundations and EC2 Setup",
    template: `# Day 01 — Linux Foundations on EC2
**Date:** YYYY-MM-DD | **Status:** ✅ Complete | **Difficulty:** Beginner

---

## 🎯 What I Learned Today
- Linux filesystem hierarchy: why /etc holds config, /var holds logs
- File permissions with chmod: 755 vs 644 vs 600 explained in my own words
- The difference between a process (any running program) and a service (managed by systemd)
- How SSH key authentication works (public/private key pair)
- Log processing and text filtering using awk, cut, sort, uniq, and wc
- Centralised logging queries with journalctl and port verification using lsof/ss
- Environment exports, session aliases, and permanent .bashrc changes
- Remote file transfer via secure copy (scp) and compression with tar

## ⌨️ Commands I Actually Used

\`\`\`bash
# Navigation & Operations
pwd           # where am I?
ls -la        # list with permissions and hidden files
cd ~          # go home
cd /etc       # go to system config directory
tar -czf backup.tar.gz ~/scripts/  # compress directory
tar -xzf backup.tar.gz -C /tmp/    # extract directory

# Text Processing & Pipelines
df -h | awk 'NR==2 {print $5}'      # get disk use percentage
cat /etc/passwd | cut -d: -f1       # cut usernames from passwd
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head  # analyze IPs
wc -l /var/log/syslog               # count log lines

# Services & Debugging
sudo systemctl status nginx
journalctl -u nginx -n 50           # modern systemd logs
journalctl -u nginx -f              # follow log stream
sudo lsof -i :80                    # see what process owns port 80
sudo ss -tlnp | grep :80            # socket stats alternative
scp -i key.pem file.txt ubuntu@IP:~/  # copy local to remote

# Shell Customization
export AWS_PROFILE=learning
alias gs='git status'
source ~/.bashrc
\`\`\`

## 🐛 Errors I Hit (and How I Fixed Them)

| Error | Cause | Fix |
|-------|-------|-----|
| Permission denied (publickey) | .pem file had wrong permissions | chmod 400 key.pem |
| mv: No such file or directory | Destination folder didn't exist | mkdir -p destination/ first |
| journalctl: No logs found | Service logs directed to custom file | Checked /var/log/nginx/error.log directly |
| Alias not working in script | Script executed in non-interactive shell | Changed alias to raw command or function in script |

## 🏗 Mini Project: server_setup.sh
- Script location: ~/devops-notes/server_setup.sh
- What it does: installs development tools on a fresh Ubuntu EC2
- Test result: Ran twice, no errors on second run ✅

## ❓ Questions I Still Have
- When is ss preferred over lsof in production environment audits?

## 📈 Tomorrow (Day 2)
Git + GitHub workflow + AWS account setup + first EC2 IAM user`
  },
  pdfUrl: '/pdfs/day1.pdf',
  images: [
    {
      url: '/images/linux_permissions_chart.png',
      caption: 'Understanding Linux File Permissions (rwx) & Octal Values'
    }
  ]
};
