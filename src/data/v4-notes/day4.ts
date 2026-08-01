export const day4 = `
# Day 4: Networking — Ports, Firewalls & Reachability

## 👨‍🏫 Trainer's Guidance
**Objective:** Diagnose network reachability issues step-by-step.

You deploy a web app on port 8080. You try to access it in your browser, and it just spins until it times out. Why? Is the app down? Is the port blocked? Networking issues are intimidating, but they can always be solved by verifying the network stack layer by layer.

**Practical Task:** 
1. Run a simple Python web server.
2. Verify it is listening on the expected port locally.
3. Configure the firewall to allow external traffic.

---

## 🛠️ Engineer's Notes
**Commands:**
\`\`\`bash
# 1. Start a simple web server for testing
python3 -m http.server 8080 &

# 2. Check if the app is actually listening on the port
ss -tlnp | grep 8080
# Alternatively: netstat -tlnp | grep 8080

# 3. Test local reachability (eliminates external firewall issues)
curl http://localhost:8080

# 4. Check internal OS firewalls (iptables/firewalld)
sudo iptables -L -n -v
\`\`\`

**Troubleshooting & Common Mistakes:**
- **Localhost vs 0.0.0.0:** If \`ss -tlnp\` shows your app listening on \`127.0.0.1:8080\`, it is ONLY accessible from inside the server itself. To serve external traffic, it must bind to \`0.0.0.0:8080\`.
- **AWS Security Groups:** Don't forget the cloud provider's firewall! Even if the OS firewall allows traffic, AWS will block it unless you open an Inbound Rule in the Security Group.

---

## 👔 CTO's Perspective
**Why this matters:** When an application is unreachable, engineers often guess and make random configuration changes. Network segregation is our first security perimeter. Understanding exactly how packets traverse from the internet to your process is non-negotiable.

**Success Criteria:** You follow a deterministic path to solve network issues: Check the Process -> Check Local Binding -> Check OS Firewall -> Check Cloud Firewall.
`;
