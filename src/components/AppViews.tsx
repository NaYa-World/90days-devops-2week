import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Lazy load views for optimal code splitting & bundle size reduction
const RoadmapView = React.lazy(() => import('../views/RoadmapView').then(m => ({ default: m.RoadmapView })));
const RoadmapV3View = React.lazy(() => import('../views/RoadmapV3View').then(m => ({ default: m.RoadmapV3View })));
const KanbanView = React.lazy(() => import('../views/KanbanView').then(m => ({ default: m.KanbanView })));
const FocusView = React.lazy(() => import('../views/FocusView').then(m => ({ default: m.FocusView })));
const JobsView = React.lazy(() => import('../views/JobsView').then(m => ({ default: m.JobsView })));
const QbankView = React.lazy(() => import('../views/QbankView').then(m => ({ default: m.QbankView })));
const StatsView = React.lazy(() => import('../views/StatsView').then(m => ({ default: m.StatsView })));
const WeeklyView = React.lazy(() => import('../views/WeeklyView').then(m => ({ default: m.WeeklyView })));
const ProjectsView = React.lazy(() => import('../views/ProjectsView').then(m => ({ default: m.ProjectsView })));
const GithubRewriterView = React.lazy(() => import('../views/GithubRewriterView').then(m => ({ default: m.GithubRewriterView })));
const ResumeView = React.lazy(() => import('../views/ResumeView').then(m => ({ default: m.ResumeView })));
const MockInterviewView = React.lazy(() => import('../views/MockInterviewView').then(m => ({ default: m.MockInterviewView })));
const SkillGapView = React.lazy(() => import('../views/SkillGapView').then(m => ({ default: m.SkillGapView })));
const BuildLogView = React.lazy(() => import('../views/BuildReviewComboView').then(m => ({ default: m.BuildReviewComboView })));
const LinkedInView = React.lazy(() => import('../views/LinkedInView').then(m => ({ default: m.LinkedInView })));
const NotesView = React.lazy(() => import('../views/NotesView').then(m => ({ default: m.NotesView })));
const ReadinessView = React.lazy(() => import('../views/ReadinessView').then(m => ({ default: m.ReadinessView })));
const DevOpsSandboxView = React.lazy(() => import('../views/DevOpsSandboxView').then(m => ({ default: m.DevOpsSandboxView })));
const DiagramBuilderView = React.lazy(() => import('../views/DiagramBuilderView').then(m => ({ default: m.DiagramBuilderView })));
const DevOpsFlowsView = React.lazy(() => import('../views/DevOpsFlowsView').then(m => ({ default: m.DevOpsFlowsView })));

interface AppViewsProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  appState: any;
  focusDay: string;
  setFocusDay: (day: string) => void;
  sandboxSection: 'scenarios' | 'labs' | 'free' | null;
  setSandboxSection: React.Dispatch<React.SetStateAction<'scenarios' | 'labs' | 'free' | null>>;
  theme: 'dark' | 'light';
}

export const AppViews: React.FC<AppViewsProps> = ({
  currentView,
  setCurrentView,
  appState,
  focusDay,
  setFocusDay,
  sandboxSection,
  setSandboxSection,
  theme
}) => {
  switch (currentView) {
    case 'roadmap':
      return (
        <React.Suspense fallback={<div style={{ padding: 40, color: 'var(--sub)', textAlign: 'center' }}>Loading DevOps roadmap...</div>}>
          <RoadmapView appState={appState} switchView={setCurrentView} />
        </React.Suspense>
      );
    case 'kanban':
      return (
        <KanbanView
          appState={appState}
          switchView={setCurrentView}
          setFocusDay={setFocusDay}
        />
      );
    case 'focus':
      return (
        <FocusView
          appState={appState}
          focusDay={focusDay}
          setFocusDay={setFocusDay}
        />
      );
    case 'labs':
      return (
        <DevOpsSandboxView 
          appState={appState} 
          sandboxSection="labs"
          setSandboxSection={setSandboxSection}
        />
      );
    case 'jobs':
      return <JobsView appState={appState} />;
    case 'qbank':
      return <QbankView appState={appState} />;
    case 'stats':
      return <StatsView appState={appState} />;
    case 'weekly':
      return <WeeklyView appState={appState} />;
    case 'projects':
      return <ProjectsView appState={appState} switchView={setCurrentView} />;
    case 'roadmap-v3':
      return (
        <React.Suspense fallback={<div style={{ padding: 40, color: 'var(--sub)', textAlign: 'center' }}>Loading notes-driven roadmap...</div>}>
          <RoadmapV3View appState={appState} switchView={setCurrentView} />
        </React.Suspense>
      );
    case 'github-rewriter':
      return (
        <ErrorBoundary name="GitHub Rewriter">
          <GithubRewriterView appState={appState} />
        </ErrorBoundary>
      );
    case 'resume':
      return (
        <ErrorBoundary name="Resume Scorer">
          <ResumeView appState={appState} />
        </ErrorBoundary>
      );
    case 'mock':
      return (
        <ErrorBoundary name="Mock Interview">
          <MockInterviewView appState={appState} switchView={setCurrentView} />
        </ErrorBoundary>
      );
    case 'skillgap':
      return (
        <ErrorBoundary name="Skill Gap Analyser">
          <SkillGapView
            appState={appState}
            setFocusDay={setFocusDay}
            switchView={setCurrentView}
          />
        </ErrorBoundary>
      );
    case 'buildlog':
      return <BuildLogView appState={appState} />;
    case 'linkedin':
      return (
        <ErrorBoundary name="LinkedIn Post Generator">
          <LinkedInView appState={appState} />
        </ErrorBoundary>
      );
    case 'readiness':
      return <ReadinessView appState={appState} />;
    case 'notes':
      return <NotesView appState={appState} />;
    case 'sandbox':
      return (
        <DevOpsSandboxView 
          appState={appState} 
          sandboxSection={sandboxSection}
          setSandboxSection={setSandboxSection}
        />
      );
    case 'diagram':
      return <DiagramBuilderView appState={appState} theme={theme} />;
    case 'devops-flows':
      return <DevOpsFlowsView appState={appState} switchView={setCurrentView} />;
    default:
      return (
        <RoadmapView
          appState={appState}
          switchView={setCurrentView}
        />
      );
  }
};
export default AppViews;
