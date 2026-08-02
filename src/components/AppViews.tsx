import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Lazy load views for optimal code splitting & bundle size reduction
const RoadmapView = React.lazy(() => import('../views/RoadmapView').then(m => ({ default: m.RoadmapView })));
const RoadmapV4View = React.lazy(() => import('../views/RoadmapV4View').then(m => ({ default: m.RoadmapV4View })));
const KanbanView = React.lazy(() => import('../views/KanbanView').then(m => ({ default: m.KanbanView })));
const FocusView = React.lazy(() => import('../views/FocusView').then(m => ({ default: m.FocusView })));
const JobsView = React.lazy(() => import('../views/JobsView').then(m => ({ default: m.JobsView })));
const QbankView = React.lazy(() => import('../views/QbankView').then(m => ({ default: m.QbankView })));
const StatsView = React.lazy(() => import('../views/StatsView').then(m => ({ default: m.StatsView })));
const DashboardView = React.lazy(() => import('../views/DashboardView').then(m => ({ default: m.DashboardView })));
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
const PipelineReferenceView = React.lazy(() => import('../views/PipelineReferenceView').then(m => ({ default: m.PipelineReferenceView })));
const ChaosSimulatorView = React.lazy(() => import('../views/ChaosSimulatorView').then(m => ({ default: m.ChaosSimulatorView })));
const SettingsView = React.lazy(() => import('../views/SettingsView').then(m => ({ default: m.SettingsView })));
const DevOpsTracker = React.lazy(() => import('../views/DevOpsTracker'));
const LearningSystemView = React.lazy(() => import('../views/LearningSystemView').then(m => ({ default: m.LearningSystemView })));
const MaterialView = React.lazy(() => import('../views/MaterialView').then(m => ({ default: m.MaterialView })));
interface AppViewsProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  appState: any;
  focusDay: string;
  setFocusDay: (day: string) => void;
  sandboxSection: 'scenarios' | 'labs' | 'free' | null;
  setSandboxSection: React.Dispatch<React.SetStateAction<'scenarios' | 'labs' | 'free' | null>>;
  theme: 'dark' | 'light';
  activeProvider?: any;
  setActiveProviderState?: any;
  providerKeys?: any;
  setProviderKeys?: any;
  uiScale?: any;
  setUiScale?: any;
  notificationsEnabled?: any;
  toggleStudyReminders?: any;
  morningTime?: any;
  handleMorningTimeChange?: any;
  eveningTime?: any;
  handleEveningTimeChange?: any;
  handleSaveSettings?: any;
  syncWithSystemTheme?: any;
  setSyncWithSystemTheme?: any;
  currentUser?: any;
}

export const AppViews: React.FC<AppViewsProps> = (props) => {
  return (
    <React.Suspense fallback={<div style={{ padding: 40, color: 'var(--sub)', textAlign: 'center' }}>Loading view...</div>}>
      {(() => {
        switch (props.currentView) {
          case 'roadmap':
            return (
              <RoadmapView appState={props.appState} switchView={props.setCurrentView} />
            );
          case 'settings':
            return (
              <SettingsView
                activeProvider={props.activeProvider}
                setActiveProviderState={props.setActiveProviderState}
                providerKeys={props.providerKeys}
                setProviderKeys={props.setProviderKeys}
                uiScale={props.uiScale}
                setUiScale={props.setUiScale}
                notificationsEnabled={props.notificationsEnabled}
                toggleStudyReminders={props.toggleStudyReminders}
                morningTime={props.morningTime}
                handleMorningTimeChange={props.handleMorningTimeChange}
                eveningTime={props.eveningTime}
                handleEveningTimeChange={props.handleEveningTimeChange}
                handleSaveSettings={props.handleSaveSettings}
                syncWithSystemTheme={props.syncWithSystemTheme}
                setSyncWithSystemTheme={props.setSyncWithSystemTheme}
                theme={props.theme}
                currentUser={props.currentUser}
                triggerSync={props.appState.triggerSync}
              />
            );
          case 'kanban':
            return (
              <KanbanView
                appState={props.appState}
                switchView={props.setCurrentView}
                setFocusDay={props.setFocusDay}
              />
            );
          case 'focus':
            return (
              <FocusView
                appState={props.appState}
                focusDay={props.focusDay}
                setFocusDay={props.setFocusDay}
              />
            );
          case 'labs':
            return (
              <DevOpsSandboxView 
                appState={props.appState} 
                sandboxSection="labs"
                setSandboxSection={props.setSandboxSection}
              />
            );
          case 'jobs':
            return <JobsView appState={props.appState} />;
          case 'qbank':
            return <QbankView appState={props.appState} />;
          case 'stats':
            return <StatsView appState={props.appState} />;
          case 'dashboard':
            return <DashboardView appState={props.appState} switchView={props.setCurrentView} />;
          case 'pipeline-ref':
            return <PipelineReferenceView />;
          case 'chaos-sim':
            return <ChaosSimulatorView />;
          case 'weekly':
            return <WeeklyView appState={props.appState} />;
          case 'projects':
            return <ProjectsView appState={props.appState} switchView={props.setCurrentView} />;
          case 'roadmap-v4':
            return (
              <RoadmapV4View appState={props.appState} />
            );
          case 'github-rewriter':
            return (
              <ErrorBoundary name="GitHub Rewriter">
                <GithubRewriterView appState={props.appState} />
              </ErrorBoundary>
            );
          case 'resume':
            return (
              <ErrorBoundary name="Resume Scorer">
                <ResumeView appState={props.appState} />
              </ErrorBoundary>
            );
          case 'mock':
            return (
              <ErrorBoundary name="Mock Interview">
                <MockInterviewView appState={props.appState} switchView={props.setCurrentView} />
              </ErrorBoundary>
            );
          case 'skillgap':
            return (
              <ErrorBoundary name="Skill Gap Analyser">
                <SkillGapView
                  appState={props.appState}
                  setFocusDay={props.setFocusDay}
                  switchView={props.setCurrentView}
                />
              </ErrorBoundary>
            );
          case 'buildlog':
            return <BuildLogView appState={props.appState} />;
          case 'linkedin':
            return (
              <ErrorBoundary name="LinkedIn Post Generator">
                <LinkedInView appState={props.appState} />
              </ErrorBoundary>
            );
          case 'readiness':
            return <ReadinessView appState={props.appState} />;
          case 'notes':
            return <NotesView appState={props.appState} />;
          case 'sandbox':
            return (
              <DevOpsSandboxView 
                appState={props.appState} 
                sandboxSection={props.sandboxSection}
                setSandboxSection={props.setSandboxSection}
              />
            );
          case 'diagram':
            return <DiagramBuilderView appState={appState} theme={theme} />;
          case 'devops-flows':
            return <DevOpsFlowsView appState={appState} switchView={setCurrentView} />;
          case 'tracker':
            return (
              <ErrorBoundary name="DevOps Tracker">
                <DevOpsTracker onBack={() => setCurrentView('dashboard')} />
              </ErrorBoundary>
            );
          case 'material':
            return (
              <ErrorBoundary name="Material">
                <MaterialView />
              </ErrorBoundary>
            );
          case 'learning-system':
            return (
              <ErrorBoundary name="Learning System">
                <LearningSystemView switchView={setCurrentView} />
              </ErrorBoundary>
            );
          default:
            return (
              <RoadmapView
                appState={appState}
                switchView={setCurrentView}
              />
            );
        }
      })()}
    </React.Suspense>
  );
};
export default AppViews;
