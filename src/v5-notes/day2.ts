export const day2 = `
# Day 2 — Process Signals: SIGTERM vs SIGKILL

**Phase 1 · Week 1 · Linux & EC2 Foundations**

---

## 🎯 Trainer's Guidance — Senior DevOps Trainer

### Learning Objectives
- Understand how Linux processes receive and handle signals.
- Know the practical difference between a graceful shutdown request and a forced kill.
- Predict what happens to in-flight work (DB writes, open connections) under each signal.

### Explanation (Beginner-Friendly)
A signal is the OS tapping a process on the shoulder. **SIGTERM (15)** is a polite request: "please shut down." A well-written app catches it, finishes in-flight requests, closes DB connections, then exits. **SIGKILL (9)** is not a request — the kernel terminates the process immediately, with zero chance for cleanup. The app cannot catch, ignore, or block SIGKILL.

This distinction is why \`kill -9\` is a last resort, not a habit. If your deploy or rollback script defaults to \`-9\`, you are silently generating corrupted state, orphaned locks, and half-written files in production.

### Practical Task
Write a small script that traps SIGTERM to log a graceful shutdown message, then prove that SIGKILL bypasses the trap entirely.

---

## 🛠️ Engineer's Notes — Senior DevOps Engineer

### Commands
\`\`\`bash
# Send SIGTERM (default signal for \`kill\`)
kill <PID>          # same as: kill -15 <PID>

# Send SIGKILL — no cleanup possible
kill -9 <PID>

# See what's actually running and its PID
ps aux | grep myapp

# Watch a process's signal handling live
strace -e trace=signal -p <PID>
\`\`\`

### Trap Example (bash)
\`\`\`bash
#!/bin/bash
trap 'echo "Caught SIGTERM — cleaning up..."; exit 0' SIGTERM

echo "PID: $$"
while true; do sleep 1; done
\`\`\`
Run it, then in another terminal: \`kill <PID>\` — you'll see the cleanup message. Now try \`kill -9 <PID>\` on a fresh instance of the same script — it dies instantly, no message, no cleanup.

### Troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| App takes forever to stop (\`docker stop\` hangs) | App doesn't handle SIGTERM, Docker waits 10s then sends SIGKILL | Add a SIGTERM handler in the app; don't rely on the timeout |
| Deploy script "solves" hangs with \`kill -9\` everywhere | Masking a real shutdown bug | Fix the SIGTERM handler instead of escalating to -9 |
| Data corruption after "successful" deploy | Old process force-killed mid-write | Ensure graceful shutdown drains connections before termination |

### Common Mistakes
| Mistake | Fix |
|---|---|
| Defaulting to \`kill -9\` because "it works" | Reserve -9 for genuinely hung/unresponsive processes only |
| Assuming \`docker stop\` = \`docker kill\` | \`stop\` sends SIGTERM then waits; \`kill\` sends SIGKILL immediately |
| No shutdown handler in app code | Every production service needs one — this is not optional at 3+ years experience |

---

## 🧭 CTO's Perspective — Head of DevOps

### Why This Matters in Real Projects
This single concept separates "it restarted fine" from "we lost transactions during the deploy." Kubernetes sends SIGTERM to every pod on termination and waits \`terminationGracePeriodSeconds\` (default 30s) before SIGKILL. If your app doesn't handle SIGTERM properly, every rolling deploy is a small data-integrity gamble — and at scale, small gambles compound into incidents.

### Success Criteria
- [ ] Can explain both signals without hedging
- [ ] Has demonstrated a working SIGTERM trap in a script
- [ ] Can state, correctly, that SIGKILL cannot be trapped or ignored

### Long-Term Workflow Connection
This is the exact mechanism behind Kubernetes pod termination, systemd service stops (Day 5), and every CI/CD rolling deploy. Understanding it now means Day 5's \`systemd\` unit files and later Kubernetes lifecycle hooks won't feel like new concepts — they're this same idea, wrapped in different tooling.

**Interview bar (3–4 yrs):** Expect "what happens to open DB connections when Kubernetes terminates a pod?" — the answer must reference the SIGTERM grace period, not just "it gets killed."
`;

export default day2;
