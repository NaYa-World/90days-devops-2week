# Changelog: DevOps Bootcamp Notes Restructure and Collapsible Topic Dropdowns

This document outlines the architectural changes, file additions, removals, and visual improvements introduced in this branch to prepare for team review and merge.

---

## 1. Summary of Changes
We have restructured the bootcamp notes storage layout into structured weekly directories (`week-1/`, `week-2/`), integrated supplemental gap-fill knowledge, resolved existing compiler issues, and implemented premium collapsible topic dropdowns (accordions) in the notes section to facilitate ease of use on both desktop web browsers and mobile APK layouts.

---

## 2. Detailed Checklist of Modifications

### A. New Components & Layout Features [ADDED]
- **Collapsible Topic Sections**: Added stateful accordions for each major note section (8-Hour Schedule, Core Concepts, Exact Command Flow, Debug Trees, Common Mistakes, Mini Project, Interview Prompts, Quizzes, GitHub template).
- **Expand/Collapse All Controls**: Added a button control bar (`Expand All` / `Collapse All`) below the daily goal card to expand or collapse all dropdown sections in a single click.
- **Auto-Expansion Navigation**: Updated sidebar links and mobile dropdown selections to automatically set the corresponding topic section to "expanded" (`true`) in the state before scrolling, preventing scroll-to-hidden elements bugs.
- **Git Ignoring Safeguards**: Added a `.gitignore` file to ensure development assets, `node_modules`, build folder `dist`, `.DS_Store` files, and IDE configurations are not tracked by version control.
- **InteractiveDiagram Component**: Created `src/components/InteractiveDiagram.tsx` and `src/data/diagrams.ts` to display interactive DevOps roadmaps and CI/CD pipelines.
- **Launch Screen Component**: Added a new `src/components/LaunchScreen.tsx` component.
- **New Logo Asset**: Added `public/naya-logo.png`.
- **Week-2 Directory Structure**: Created `src/data/notes/week-2/` with a `.gitkeep` file to prepare for days 8–14 note content.
- **Week 1 Comprehensive Project**: Designed and created `src/data/notes/week-1/weekly-project.ts` as Day 7.1. It features a self-healing automation script combining Nginx, VPC, IAM, S3, and cron tasks that resolves IMDSv2, S3 policy corrections, and path configuration challenges.

### B. Removals & Cleanups [REMOVED / CLEANED UP]
- **Redundant Titles**: Removed static `h3` section headers inside children cards in `NotesView.tsx` to prevent title duplication since they are now cleanly rendered by the accordion header buttons.
- **Unstructured Root Day Files**: Removed individual note files (`day1.ts` to `day7.ts` and `day4-1.ts`) from the root `src/data/notes/` directory and moved them into the organized `src/data/notes/week-1/` directory.

### C. Updates & Refactoring [MODIFIED]
- **`NotesView.tsx`**:
  - Implemented the accordion UI `CollapsibleSection` component.
  - Added React state `expandedSections` and toggle/reset handlers.
  - Enhanced `handleScrollTo` with auto-opening of sections.
- **`notes.css`**:
  - Added custom accordion selectors, borders using active theme colors, rotating chevrons, and smooth CSS Grid auto-height transitions.
- **Supplement Merges**:
  - **Day 1**: Merged text processing tools (`awk`, `cut`, `sort`, `uniq`, `wc`, `tar`), system debugging (`journalctl`, `lsof`, `ss`), and terminal customization.
  - **Day 2**: Merged AWS safety alerts, billing dashboards, Git revert/reset/stash workflows.
  - **Day 3**: Merged EBS snapshots CLI command and recovery practices.
  - **Day 4**: Merged scripting aliases.
- **Compilation Bug Fix**: Fixed type safety issue in `day3.ts` where a decimal representation was updated to `7.1` to align with the bootcamp index mapping.
- **Main App & Imports**:
  - Refactored `App.tsx` to integrate notes routing.
  - Updated `src/data/notes/index.ts` to correctly resolve imports from the new `week-1/` paths and export the Week 1 Project review notes.
