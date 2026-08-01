export const day5 = `
# Day 5: systemd — Surviving Reboots

## 👨‍🏫 Trainer's Guidance
**Objective:** Daemonize an application so it runs automatically in the background and survives system reboots.

Running apps in the foreground (or with a simple \`&\`) is fine for testing. But what happens if the server reboots for a security patch at 3am? If your app doesn't start automatically, you have an outage. Modern Linux systems use \`systemd\` as an init system to manage background services (daemons).

**Practical Task:** 
1. Write a custom \`systemd\` service file for a dummy application.
2. Enable it to start on boot.
3. Check its logs.

---

## 🛠️ Engineer's Notes
**Commands:**
\`\`\`bash
# 1. Create a service file
sudo nano /etc/systemd/system/myapp.service

# Example myapp.service content:
# [Unit]
# Description=My Sample Node App
# After=network.target
# 
# [Service]
# ExecStart=/usr/bin/node /home/ec2-user/app.js
# Restart=always
# User=ec2-user
# 
# [Install]
# WantedBy=multi-user.target

# 2. Reload systemd to read your new file
sudo systemctl daemon-reload

# 3. Start the service and enable it on boot
sudo systemctl start myapp
sudo systemctl enable myapp

# 4. View the logs for this specific service
journalctl -u myapp -f
\`\`\`

**Troubleshooting & Common Mistakes:**
- **Forgetting \`daemon-reload\`:** If you edit a \`.service\` file, systemd won't know about it until you run \`sudo systemctl daemon-reload\`.
- **Wrong Paths:** \`systemd\` does not know your PATH environment variable. Always use absolute paths (e.g., \`/usr/bin/node\` instead of just \`node\`).

---

## 👔 CTO's Perspective
**Why this matters:** We cannot rely on manual intervention. Resiliency means designing systems that recover themselves. If an engineer has to wake up to restart a crashed process, we have failed at automation.

**Success Criteria:** You can write a unit file, enable it, and confidently reboot a server knowing the application will come back online without human input.
`;
