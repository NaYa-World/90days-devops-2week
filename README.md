# 90 Days of DevOps — Zero to Hired

A fully-featured, production-grade DevOps learning tracker built with **React 18 + TypeScript 5 + Vite**. Built for one goal: **getting a DevOps job in 90 days**, not just learning concepts.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# Opens at http://localhost:5173

# 3. Run tests
npm test

# 4. Build for production
npm run build
```

---

## 📱 Platform Guides (Web vs. APK)

This application is built as a cross-platform progressive app, running seamlessly in standard web browsers and as a native mobile application (packaged via Capacitor).

### 🌐 1. Using the Website (Web Browser)
* **Accessing the Site**: Open your local instance at `http://localhost:5173` or access your deployed production URL (e.g., Vercel).
* **AI Provider Keys**: Click the **⚙️ Settings & Profile** gear icon in the top-right menu to enter API keys for Claude, ChatGPT, Gemini, or Grok. Keys are stored locally in your browser session for maximum privacy.
* **GitHub Backup**: Sign in with GitHub on the Apprentice Portal. This automatically provisions a private repository named `90days-devops-my-notes` on your profile. Your task completions (`progress_backup.json`) and study notes will sync automatically.
* **Offline Support**: The site is a Progressive Web App (PWA). If your internet drops, you can keep checking off tasks and reading, and your changes will sync to GitHub once connectivity is restored.

### 🤖 2. Using the APK (Native Android/iOS Mobile App)
* **Installation**: Install the compiled `.apk` package on your Android device (or run/debug on your simulator/phone using Capacitor).
* **Native Features**:
  - **Notch & Safe Area Support**: Headers and sidebars automatically detect phone notches and safe zones using CSS `env(safe-area-inset-top)` to prevent overlapping text.
  - **Haptic Responses**: Native physical vibrations trigger on navigation tabs, task checkmarks, and button clicks for a tactile learning experience.
  - **Local Push Notifications**: Enable "Study Reminders" in the settings modal to schedule custom morning and evening push alerts directly on your device. Use the **🧪 Test Notification** button to confirm setup (delivers an alert in 10 seconds).
* **Frictionless Sync (Device Flow)**: To sync notes and progress without typing out long passwords or Personal Access Tokens (PATs) on mobile virtual keyboards, the APK uses **GitHub Device Flow**:
  1. Click **Continue with GitHub** on the login screen.
  2. Open the displayed URL on any browser or computer.
  3. Enter the short user-code shown on your phone screen to securely authorize your device.

---

## 🔑 AI Features Setup & Security

Most AI features (mock interviews, resume ATS scanning, LinkedIn posts, code review) utilize Claude. This application supports two secure methods to load keys:

### 1. Production Mode (Server-Side Proxy - Recommended)
When deploying to serverless-compatible environments (such as Vercel), set the API keys as environment variables in your hosting provider's dashboard:
* `ANTHROPIC_API_KEY`
* `OPENAI_API_KEY`
* `GEMINI_API_KEY`
* `GROK_API_KEY`

In this mode, client requests are routed through a server-side API proxy (`/api/chat.ts`). No API keys are exposed to the client browser.

### 2. Desktop/Local Mode (Client-Side Storage Fallback)
For local runs, standalone usage, or running as a native mobile app (Capacitor/Android), keys can be supplied directly:
- **Keys Settings Modal**: Click **🔑 Keys** in the top-right navigation and paste your keys securely.
- **Local Environment File**: Create a `.env` file in the project root:
  ```env
  VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
  ```

> **Note:** If AI features return errors, check that:
> - You have a valid API key set either in the settings UI or as a server environment variable.
> - In local mode, ensure the key is not restricted by CORS (Vite `.env` method is recommended locally to bypass CORS limits).

---

## 📋 What This App Does

This is not a tutorial tracker. It is a **job placement tool** with all the necessary views across two complete roadmaps.

### The Two Roadmaps

| | Original Roadmap (v4) | Problem-First Roadmap (v2) 💥 |
|---|---|---|
| **Structure** | Topic-first (Learn Linux → Learn Docker → Learn K8s) | Problem-first ("Your server is broken. Fix it.") |
| **Day 1** | Study DevOps culture and CAMS model | Deploy a real app to a real AWS server |
| **Learning trigger** | Topic sequence | Production problems that force you to learn |
| **Progress storage** | `devops90_tasks` in localStorage | `devops90_v2_tasks` in localStorage |
| **Navigation** | ☑ Roadmap tab | 💥 v2 Roadmap tab |

Both roadmaps are available simultaneously. Progress is tracked separately.

---

## 🗂️ All Views

### Roadmaps
| View | What it does |
|---|---|
| ☑ **Roadmap** (v4) | Original topic-first 90-day plan. Phases, tasks, notes, confidence scoring, AI quiz per day |
| 💥 **v2 Roadmap** | NEW — Problem-first roadmap. Every day starts with a broken production scenario. |

### Job Outcome Tools
| View | What it does |
|---|---|
| 📄 **Resume** | Paste your resume → AI scores ATS keyword coverage → shows missing keywords per job level |
| 🎤 **Mock Interview** | Timed (2 min/answer) AI mock interview. Grades answers. Shows your weak topics. |
| 🐙 **GitHub Rewriter** | Audits your GitHub repos. Suggests professional repo names. Generates README templates. |
| 💼 **Jobs** | Kanban job tracker (Applied → Screening → Interview → Offer → Rejected). Salary tracking. |
| 📊 **Skill Gap** | Paste any job description → see exact skills you have vs what the role requires |
| 🎯 **Readiness** | 8-gate readiness check. Tells you "apply now" vs "fix these 2 things first." |
| 🔗 **LinkedIn** | Converts your build logs into LinkedIn posts (3 tone options: technical, story, insight) |

### Daily Learning Tools
| View | What it does |
|---|---|
| ◎ **Focus** | Single-day deep work mode. One day, all its tasks, no distractions. |
| ⊞ **Kanban** | Drag tasks across Todo → In Progress → Done columns |
| ⌨ **Labs** | Interactive terminal simulator for Linux and Docker command practice |
| 🧰 **Projects** | 12 portfolio project specs with resume bullet points and interview talking points |
| ❓ **Qbank** | 200+ interview questions by category (Linux, Docker, K8s, CI/CD, Terraform) |
| 📝 **Notes** | Secure notes with local authentication and password protection |
| 🧑‍💻 **Sandbox** | Run arbitrary DevOps tools (Linux, Python, Git) in a real web container |

### Progress & Analytics
| View | What it does |
|---|---|
| 📈 **Stats** | Overall Progress, Weekly Goals, DORA metrics, readiness meters, XP level, Study hours, and Activity heatmap |
| 📅 **Goals** | Weekly goals, streak history, bounceback recovery after missed days |
| 🔨 **Build Log & Reviews** | Log what you built each day, and rate past tasks using spaced repetition to schedule reviews. |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AIService.ts          # Anthropic API wrapper — all AI calls go through here
│   ├── PomodoroModal.tsx     # SVG Pomodoro timer with desktop notifications
│   ├── TerminalSimulator.tsx # Interactive command-line simulator for labs
│   └── Toast.ts              # Toast notification manager
│
├── data/
│   ├── phases.ts             # Original 90-day roadmap — 6 phases, topic-first
│   ├── phases_v2.ts          # NEW — Problem-first 90-day roadmap (13 phases)
│   ├── labs.ts               # Linux + Docker lab exercises with expected outputs
│   ├── projects.ts           # Portfolio projects with resumeLine + talkingPoints
│   └── qbank.ts              # 200+ interview questions with categories and difficulty
│
├── hooks/
│   └── useAppState.ts        # Central state engine — all localStorage read/write
│
├── views/
│   ├── RoadmapView.tsx       # Original topic-first roadmap
│   ├── RoadmapV2View.tsx     # NEW — Problem-first roadmap renderer
│   ├── ResumeView.tsx        # ATS keyword scorer
│   ├── MockInterviewView.tsx # Timed mock interview with AI grading
│   ├── GithubRewriterView.tsx# GitHub profile and repo auditor
│   ├── JobsView.tsx          # Job application kanban
│   ├── SkillGapView.tsx      # JD vs skills gap analyser
│   ├── ReadinessView.tsx     # Go/no-go hiring readiness gates
│   ├── LinkedInView.tsx      # Build log to LinkedIn post converter
│   ├── FocusView.tsx         # Single-day focus mode
│   ├── KanbanView.tsx        # Task status kanban board
│   ├── LabsView.tsx          # Interactive terminal labs
│   ├── ProjectsView.tsx      # Portfolio project specs
│   ├── QbankView.tsx         # Interview question bank
│   ├── StatsView.tsx         # Progress analytics and weekly reports
│   ├── WeeklyView.tsx        # Weekly goals and streaks
│   ├── BuildReviewComboView.tsx # Combined daily build log & spaced repetition reviews
│   ├── DevOpsSandboxView.tsx # In-browser linux/devops sandbox
│   ├── NotesView.tsx         # Secure authenticated notebook
│   └── LoginScreen.tsx       # Local auth gate for notes
│
├── App.tsx                   # Root layout, nav bar, all view routing
├── index.css                 # Design system — CSS variables, dark/light mode
└── main.tsx                  # React entry point, PWA service worker registration
```

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 18 | UI components |
| TypeScript | 5 | Type safety throughout |
| Vite | 5 | Dev server + production bundler |
| Vitest | Latest | Unit and integration testing |
| Vanilla CSS | — | Custom design system, no Tailwind |
| canvas-confetti | 1.6 | Phase completion celebrations |
| Anthropic SDK | — | AI features via direct API calls |

---

## 💾 State Architecture

All state lives in `localStorage`. No database, no backend, no account needed.

| Key | What it stores |
|---|---|
| `devops90_v4` | All v1 roadmap task completions, notes, confidence scores |
| `devops90_v2_tasks` | All v2 (problem-first) roadmap task completions |
| `devops90_jobs` | Job application kanban data |
| `devops90_streak` | Daily study streak |
| `devops90_theme` | dark / light preference |
| `devops90_anthropic_api_key` | Your Anthropic API key |
| `devops90_build_log` | Daily build log entries |

---

## 🔄 The v2 Problem-First Roadmap — What Makes It Different

Every day follows this structure:

```
🔴 SCENARIO:   A real production problem (server down, data lost, CI broken)
💡 WHY THIS:   Why this problem teaches the concept better than a tutorial
   Tasks:      What you actually do to fix it
⚠️ GOTCHA:     The mistake everyone makes the first time
📝 NOTE:       Senior engineer insight you would not find in docs
🎤 INTERVIEW:  Exactly how to answer the interview question this scenario prepares you for
```

**Example — Day 4:** "The disk is full. The server refuses all connections."
You learn: `df -h`, `du -sh`, `find -mtime`, `logrotate`, disk monitoring cron — because your server is broken right now, not because you are following a syllabus.

---

## 📦 npm Scripts

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # TypeScript check + production bundle → dist/
npm run preview      # Serve the production build locally
npm test             # Run all tests once
npm run test:watch   # Re-run tests on every file save
npm run lint         # TypeScript type check only (no build)
```

---

## 🚢 Deploy to Vercel (Free)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/devops-tracker.git
git push -u origin main

# 2. Go to vercel.com → Import Project → Select repo → Deploy
# Vercel auto-detects Vite. No configuration needed.
# Your app is live in 60 seconds.

# 3. Add VITE_ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables
```

---

## 🎯 The Goal

This tracker exists for one reason: **getting GK (and anyone using it) hired as a DevOps engineer**.

Every feature answers the question: *"Does this help someone get a DevOps job faster?"*

- Resume ATS scanner → pass the automated filter
- Mock interview → stop stumbling on questions you knew the answer to
- GitHub rewriter → make repos look professional before recruiters see them
- Readiness gates → apply at 65%, not when you feel "100% ready" (you never will)
- Problem-first roadmap → learn what hiring managers actually test, not just what topics exist

---

*Built with React 18 · TypeScript 5 · Vite 5 · Zero to Hired in 90 Days*
# 90days-devops-v2job
