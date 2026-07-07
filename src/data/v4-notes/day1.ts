export const day1 = `
# Day 1: Launch EC2 and Survive SSH

## 👨‍🏫 Trainer's Guidance
**Objective:** Get your first EC2 instance running and successfully establish a secure remote connection.

Welcome to Day 1! Today is about breaking the ice with cloud infrastructure. We are focusing on Amazon Elastic Compute Cloud (EC2). Think of EC2 as renting a computer in someone else's data center. You don't have a monitor or keyboard for this computer, so you must communicate with it securely over the internet using a protocol called SSH (Secure Shell).

**Practical Task:** 
1. Log into AWS and launch a \`t2.micro\` instance running Amazon Linux 2023.
2. Download the \`.pem\` key pair.
3. Fix the key permissions and SSH into your new server.

---

## 🛠️ Engineer's Notes
**Commands:**
\`\`\`bash
# 1. Secure your private key (Linux/Mac requires this!)
chmod 400 ~/.ssh/devops-key.pem

# 2. Connect to the instance
ssh -i ~/.ssh/devops-key.pem ec2-user@<YOUR-EC2-IP>

# 3. Verify your environment
uname -r && whoami && uptime
\`\`\`

**Troubleshooting & Common Mistakes:**
- **The "Unprotected Private Key" Error:** If you get \`WARNING: UNPROTECTED PRIVATE KEY FILE\`, SSH is rejecting your connection. By default, downloaded files have \`644\` permissions (readable by anyone). SSH demands \`400\` (readable *only* by you).
- **Connection Timed Out:** Check your AWS Security Group. Ensure port 22 (SSH) is open to your specific IP address.

---

## 👔 CTO's Perspective
**Why this matters:** In the real world, nobody clicks through a GUI to manage servers. Everything begins with secure, terminal-based access. If you can't securely access the infrastructure, you can't debug, deploy, or manage it. 

**Success Criteria:** You can spin up a server and establish a secure shell connection without needing to consult the AWS documentation. This is the absolute baseline of operational readiness.
`;
