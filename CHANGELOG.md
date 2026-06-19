# Changelog — Project Audit Resolutions

This log details the security improvements, error boundary fallbacks, git cleanups, and roadmap refinements introduced to resolve all issues listed in the project audit report.

---

## 1. Security Enhancements
- **Serverless API Proxy (`[NEW] api/chat.ts`)**: Added a server-side API proxy to hide sensitive keys (Anthropic, OpenAI, Gemini, Grok) from browser bundles and storage payloads, routing requests securely on server-side deploys.
- **Client-Key Fallback**: Provided secure support in the API proxy for client-provided API keys in request headers, supporting local/Capacitor execution.
- **Vite Local Dev Proxy**: Configured a local development proxy routing `/api` requests to port 3000 in `vite.config.ts`.
- **`AIService.ts` Integration**: Refactored call mechanism to fetch `/api/chat` first and fall back to direct browser fetch calls if the proxy is unavailable.

## 2. Model String Fixes
- **Claude Model Update**: Updated the default model name in both `AIService.ts` and `/api/chat.ts` to `claude-sonnet-4-6` to eliminate clone-and-run errors.

## 3. Git Hygiene & Cleanups
- **`.gitignore` Rules**: Appended rules to ignore `mobile_flutter/` and OS-specific files.
- **`.DS_Store` Purge**: Removed tracked `.DS_Store` files from the git index tracking system.

## 4. Containerization
- **`Dockerfile` (`[NEW]`)**: Added a multi-stage compilation Dockerfile serving the compiled static assets securely via Nginx.
- **`docker-compose.yml` (`[NEW]`)**: Added compose configurations for both production-like Nginx proxy and node hot-reload development environments.

## 5. UI Stability & Fallbacks
- **`ErrorBoundary.tsx` (`[NEW]`)**: Created a custom React Error Boundary component with fallback alerts and a "Try Again" recovery action.
- **App Integrations**: Wrapped all AI-calling screens (GitHub Rewriter, Resume Scorer, Timed Mock Interview, Skill Gap Analyser, and LinkedIn Generator) with the new `<ErrorBoundary>` wrapper.

## 6. Roadmap Refinements & Enhancements
- **Primary V2 Default**: Updated `App.tsx` state to default the primary view to the problem-first V2 Roadmap instead of V4.
- **V4 Demotion**: Marked the original V4 Roadmap tab as "v4 Reference" in both desktop and mobile layouts.
- **AWS Cost Estimation**: Added cost descriptors (e.g., `[Est. AWS Spend: ~$8/month]`) to relevant weeks in `phases_v2.ts`.
- **Checklists**: Added physical artifact checklists to day tasks to ensure learners commit real code configurations and screenshots to their personal portfolio repositories.
