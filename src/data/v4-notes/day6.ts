export const day6 = `
# Day 6: User Management and SSH Hardening

## 👨‍🏫 Trainer's Guidance
**Objective:** Apply the principle of least privilege by creating non-root users and locking down SSH.

Logging in as \`root\` is like driving a bulldozer to the grocery store. It's dangerous and unnecessary. A core principle of security is least privilege: users should only have the exact permissions they need, and no more. Today, we'll create a dedicated deployment user and harden our SSH configuration.

**Practical Task:** 
1. Create a \`deploy\` user and configure \`sudo\` access.
2. Disable direct \`root\` login over SSH.
3. Disable password authentication (enforce SSH keys).

---

## 🛠️ Engineer's Notes
**Commands:**
\`\`\`bash
# 1. Create a new user with a home directory
sudo useradd -m -s /bin/bash deploy

# 2. Safely edit the sudoers file
sudo visudo
# Add this line to allow 'deploy' to restart services without a password:
# deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart myapp

# 3. Harden SSH configuration
sudo nano /etc/ssh/sshd_config
# Ensure these lines are set:
# PermitRootLogin no
# PasswordAuthentication no

# 4. Apply changes (WARNING: Make sure your key works first!)
sudo systemctl restart sshd
\`\`\`

**Troubleshooting & Common Mistakes:**
- **Locking yourself out:** Never close your current terminal when modifying SSH config! Keep one active session open. Try logging in from a *second* terminal to verify you didn't break access.
- **Editing \`/etc/sudoers\` directly:** NEVER edit this file with \`nano\` directly. Always use \`visudo\`. If you make a syntax error, \`visudo\` will catch it. If you use \`nano\` and make a syntax error, you permanently break \`sudo\` for the entire server.

---

## 👔 CTO's Perspective
**Why this matters:** Compliance audits (SOC2, ISO27001) will immediately fail a company if root SSH access or password authentication is enabled. Hardening servers is not just a best practice; it's a legal and business requirement.

**Success Criteria:** You understand the immense danger of the \`root\` user and can confidently lock down a Linux machine to meet baseline enterprise security standards.
`;
