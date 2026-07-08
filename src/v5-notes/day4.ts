export const day4 = `
# Day 4 — Network Binding: 0.0.0.0 vs 127.0.0.1

**Phase 1 · Week 1 · Linux & EC2 Foundations**

---

## 🎯 Trainer's Guidance — Senior DevOps Trainer

### Learning Objectives
- Understand what a "bind address" controls for a running service.
- Diagnose the single most common "why can't I reach my app" bug in beginner deployments.
- Correctly choose bind addresses for local-only vs externally-reachable services.

### Explanation (Beginner-Friendly)
When an app starts a web server, it binds to an IP + port. \`127.0.0.1\` (loopback) means "only accept connections that originate from this same machine" — \`curl localhost:3000\` works, but nothing from outside can ever reach it, Security Group rules irrelevant. \`0.0.0.0\` means "accept connections on every network interface this machine has" — including its public IP.

This is the #1 reason a freshly deployed app is unreachable even with perfect Security Group rules: the app itself never asked to listen on the public interface.

### Practical Task
Run a simple app bound to \`127.0.0.1\`, confirm it's unreachable externally despite an open Security Group port, then rebind to \`0.0.0.0\` and confirm it becomes reachable.

---

## 🛠️ Engineer's Notes — Senior DevOps Engineer

### Commands
\`\`\`bash
# Example with Python's built-in server — bind to loopback only
python3 -m http.server 8080 --bind 127.0.0.1
# From another machine: curl http://<EC2_PUBLIC_IP>:8080  → times out / connection refused
# From the EC2 box itself: curl http://localhost:8080      → works fine

# Rebind to all interfaces
python3 -m http.server 8080 --bind 0.0.0.0
# Now external curl succeeds (assuming Security Group allows port 8080)

# Confirm what's actually listening and on which address
ss -tuln | grep 8080
# 127.0.0.1:8080   → loopback only
# 0.0.0.0:8080     → all interfaces
\`\`\`

### Troubleshooting Flow
| Symptom | Check | Likely Cause |
|---|---|---|
| App unreachable, SG port open, instance running | \`ss -tuln \\| grep <port>\` | Bound to \`127.0.0.1\` — check app config (\`app.run(host=...)\`, \`server.listen(port, host)\`, etc.) |
| App reachable locally via \`curl localhost\`, not externally | Same as above | Same fix — rebind to \`0.0.0.0\` |
| App reachable but you didn't intend that | Bind address is \`0.0.0.0\` with no auth | Security concern — restrict via SG, reverse proxy, or app-level auth |

### Common Mistakes
| Mistake | Why it hurts | Fix |
|---|---|---|
| Binding everything to \`0.0.0.0\` by habit | Unnecessarily exposes internal-only services (DBs, admin panels) to the network | Internal services stay on \`127.0.0.1\` or a private VPC IP; only the public-facing edge binds \`0.0.0.0\` |
| Spending hours checking Security Groups when the real issue is the bind address | Wastes incident time | Check \`ss -tuln\` locally on the instance *before* touching AWS console |
| Confusing bind address with Security Group as "the same layer" | They are independent, both must be correct | SG = who can reach the network interface; bind address = whether the app is even listening on it |

---

## 🧭 CTO's Perspective — Head of DevOps

### Why This Matters in Real Projects
I've watched engineers burn 45 minutes debugging "AWS networking" when the actual problem was one line of app config. This is a fast, cheap diagnostic once internalized — and a real security control when applied deliberately (databases should almost never bind \`0.0.0.0\`).

### Success Criteria
- [ ] Reproduced both bind states and confirmed the reachability difference directly
- [ ] Can read \`ss -tuln\` output and state immediately whether a service is internally or externally reachable
- [ ] Can articulate the security implication of binding a database to \`0.0.0.0\`

### Long-Term Workflow Connection
This concept resurfaces constantly: Docker's \`-p 127.0.0.1:8080:80\` vs \`-p 8080:80\`, Kubernetes Service types (ClusterIP vs NodePort — see Week 3+), and reverse proxy configs (nginx, Day 6 onward). Get this instinct right now and every later networking layer built on top of it makes immediate sense.

**Interview bar (3–4 yrs):** "Your Security Group and firewall are both correctly configured, but the app still isn't reachable externally — what do you check next?" should trigger this exact answer, unprompted.
`;

export default day4;
