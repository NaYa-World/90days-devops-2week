# 90 Days of DevOps — Zero to Hired (Enterprise Edition)

A fully-featured, production-grade DevOps learning tracker built with **React 18 + TypeScript 5 + Capacitor**. Built for one goal: **getting a DevOps job in 90 days**.

This repository has been structurally hardened to meet **Senior Android and Frontend Architectural Standards**, featuring offline-first LWW concurrency, Android Keystore encryption, React Virtual DOM memoization, and ProGuard R8 bytecode obfuscation.

---

## 🚀 Quick Start (Web Development)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🏗️ Senior Engineering Guidelines (How to Contribute)

If you are extending this application, you **must** adhere to the following enterprise architecture standards established in the codebase.

### 1. State Management & React Virtual DOM
The `useAppState` hook manages the global state. Because it relies on top-down prop drilling to avoid heavy state-management libraries (like Redux):
- **NEVER** pass inline anonymous functions to deeply nested components (e.g., `<TaskRow onClick={() => doSomething()} />`).
- **ALWAYS** use `React.memo` wrapped with custom `arePropsEqual` comparators when rendering lists (like the 90-day Roadmap views). Failure to do so will cause catastrophic cascading re-renders and UI jank on low-end Android devices.

### 2. Network Concurrency & Background Sync
The app communicates with GitHub via `GitHubSyncService.ts`.
- **Mutex Locks:** Network calls are guarded by a Mutex (`isSyncing`). Do not bypass this lock. Concurrent pushes to the same GitHub Gist will result in `409 Conflict` errors and corrupt the user's progress json.
- **Offline First:** All operations write to local memory first. If the network drops, the `Active Background Retry Queue` will capture the failed API payload and automatically retry when Capacitor detects a restored `Network Status`.

### 3. Cryptography & OAuth Security
- **NEVER** write API Keys, Personal Access Tokens (PATs), or OAuth credentials to `localStorage`. `localStorage` is vulnerable to Cross-Site Scripting (XSS).
- **ALWAYS** use `SecurityService.setSecureCredential()`. On the web, this uses an in-memory fallback. On native mobile deployments, this invokes `@aparajita/capacitor-secure-storage` to mathematically encrypt the payload using the **Android Hardware Keystore** or **iOS Secure Enclave**.

### 4. Crash Recovery (Sentry Error Boundaries)
- The React component tree is wrapped in an `<ErrorBoundary>`. If you throw an unhandled exception or trigger a Null Pointer Exception via a bad array lookup, Sentry will catch the stack trace and prevent the application from crashing to a White Screen of Death (WSOD).

### 5. Native Android Build Pipeline (ProGuard)
If you are compiling the `.apk` or `.aab` for the Google Play Store:
- The `android/app/build.gradle` is strictly configured with `minifyEnabled true` and `shrinkResources true`.
- **Do not disable this.** Disabling minification exposes your Native Bridge Java/Kotlin code to reverse engineering decompilers (`jadx`) and massively inflates the APK payload with unused Capacitor plugins.

---

## 📱 Platform Delivery (Web vs. APK)

### 🌐 Progressive Web App (PWA)
* **Access**: `http://localhost:5173` or Vercel.
* **Offline Service Worker**: `sw.js` caches the UI. If the internet drops, users can continue checking off tasks.

### 🤖 Native APK (Capacitor)
* **Notch & Safe Area**: Headers automatically detect phone notches using CSS `env(safe-area-inset-top)`.
* **Haptics**: Native vibrations trigger on task completions via `@capacitor/haptics`.
* **Push Notifications**: Scheduled via `@capacitor/local-notifications` directly on the device background thread.

## 🗂️ Core Views & Components Architecture

To maintain the scalable React architecture, responsibilities are strictly separated between pure UI views and backend-agnostic services.

### Core Services
| Component | Responsibility & Features |
|---|---|
| `GitHubSyncService.ts` | **The Network Engine.** Handles all GitHub Gist API communication. Features a Mutex lock (`isSyncing`) to prevent `409 Conflict` race conditions and an Active Background Retry Queue for offline resilience. |
| `SecurityService.ts` | **The Cryptography Layer.** Interfaces with `@aparajita/capacitor-secure-storage`. Safely encrypts OAuth tokens in the Android Hardware Keystore instead of plaintext localStorage. |
| `MonitoringService.ts`| **The Crash Analytics.** Initializes `@sentry/capacitor`. Intercepts fatal unhandled React exceptions and uploads the stack traces to Sentry. |
| `OTAService.ts` | **The Live Updater.** Hooks into `@capgo/capacitor-updater` to apply Over-The-Air JavaScript bundle updates without requiring a Google Play Store review. |

### Core Views
| View | Responsibility & Features |
|---|---|
| `AppViews.tsx` | **The Global Router.** Switches between all screens. Wrapped in an `<ErrorBoundary>` to prevent White Screen of Death (WSOD) crashes. |
| `RoadmapV4View.tsx` | **The Curriculum Engine.** Renders the massive 90-day learning curriculum. Features a deeply optimized `TaskRow` wrapper using `React.memo` to bypass React's inline-function diffing, achieving 60fps scrolling on low-end Androids. |
| `NotesView.tsx` | **The Daily Journal.** Renders engineering notes. Features defensive bounds-checking to prevent Null Pointer Exceptions if a day's data is temporarily unavailable. |
| `StatsView.tsx` | **The Analytics Engine.** Renders DORA metrics, readiness meters, Study hours, and Activity heatmaps using lightweight SVG charting. |
| `JobsView.tsx` | **The Career Tracker.** A Kanban board managing job applications (Screening → Interview → Offer) and salary negotiation tracking. |
| `DevOpsSandboxView`| **The Execution Engine.** Runs an interactive command-line simulator for Linux/Docker labs directly in the browser DOM. |

---

## 💾 State Architecture (Zero-Database)

To remain lightweight and portable, the app uses **zero local databases (No SQLite)**. All state lives strictly in `localStorage` and syncs to a private GitHub Gist JSON file.

| Key | What it stores |
|---|---|
| `devops90_v4` | All roadmap task completions and confidence scores |
| `devops90_jobs` | Job application kanban data |
| `devops90_anthropic_api_key` | (Legacy) API keys |
| `devops90_build_log` | Daily build log entries |

---

*Built with React 18 · TypeScript 5 · Vite 5 · Capacitor 6 · Zero to Hired in 90 Days*
