/**
 * DevOps Learning Tracker — Secondary Dashboard
 * Single-file React component using Tailwind CSS + Recharts + Lucide
 * All state persisted via localStorage. No backend, no auth.
 */

import '../css/tracker.css';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Flame,
  Clock,
  Brain,
  Target,
  CheckCircle,
  Lock,
  Play,
  BookOpen,
  Mic,
  X,
  Trophy,
  Activity,
  ArrowLeft,
} from 'lucide-react';

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
interface StreakData { lastVisit: string; count: number; }
interface QuizData   { correct: number; total: number; }
interface PrepData   { completed: number; total: number; }
interface WeekEntry  { week: string; count: number; }

interface AppState {
  streak:          StreakData;
  totalMinutes:    number;
  quiz:            QuizData;
  prep:            PrepData;
  currentTopicIndex: number;
  completedTopics: number[];
  activityLog:     Record<string, boolean>;
  weeklyProgress:  WeekEntry[];
  sessionActive:   boolean;
}

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const LS_KEY = 'devops_tracker_v1';

const TOPICS = [
  { name: 'Linux Commands',         desc: 'Core Linux administration for DevOps: file systems, permissions, processes, and networking.' },
  { name: 'Git',                    desc: 'Version control workflows, branching, merging, and collaboration.' },
  { name: 'GitHub / SCM',           desc: 'Source code management, PRs, Git Flow, and GitHub Actions basics.' },
  { name: 'Jenkins',                desc: 'Continuous Integration server setup, declarative pipelines, and plugins.' },
  { name: 'Maven',                  desc: 'Java build tool, dependencies management, and build profiles.' },
  { name: 'SonarCloud',             desc: 'Static Code Analysis, quality gates, and automated code review.' },
  { name: 'Artifact Repository',    desc: 'Managing build artifacts, Docker images, and package registries.' },
  { name: 'Docker',                 desc: 'Containerization, Dockerfiles, Compose, and AWS ECR.' },
  { name: 'Trivy',                  desc: 'Vulnerability scanning for containers and integrating with CI pipelines.' },
  { name: 'Kubernetes',             desc: 'Container orchestration: Pods, Deployments, Services, and Helm on EKS.' },
  { name: 'Splunk & Grafana',       desc: 'Monitoring, logging, dashboarding, and alerting for infrastructure.' },
  { name: 'AWS Core Services',      desc: 'Foundational AWS networking, IAM, compute, and observability.' },
  { name: 'Terraform',              desc: 'Infrastructure as Code, HCL, remote state, modules, and AWS provider.' },
  { name: 'Ansible',                desc: 'Configuration management, playbooks, roles, and vault for provisioning.' },
  { name: 'AWS DevOps Services',    desc: 'Native AWS CI/CD tools: CodeCommit, CodeBuild, CodeDeploy, CodePipeline.' },
  { name: 'Incident Management',    desc: 'On-call practices, SLAs, runbooks, blameless postmortems.' },
  { name: 'Cloud Cost Optimization',desc: 'FinOps practices, AWS Cost Explorer, spot instances, right-sizing.' },
];

const SKILL_AXES = ['Linux', 'Git', 'CI/CD', 'Code Quality', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'Monitoring'];

// topic index → radar axis index
const TOPIC_AXIS_MAP: Record<number, number> = {
  0: 0, // Linux Commands → Linux
  1: 1, // Git   → Git
  2: 1, // GitHub / SCM → Git
  3: 2, // Jenkins → CI/CD
  4: 2, // Maven → CI/CD
  5: 3, // SonarCloud → Code Quality
  6: 3, // Artifact Repository → Code Quality
  7: 4, // Docker → Docker
  8: 4, // Trivy → Docker
  9: 5, // Kubernetes → Kubernetes
  10: 8, // Splunk & Grafana → Monitoring
  11: 6, // AWS Core Services → AWS
  12: 7, // Terraform → Terraform
  13: 2, // Ansible → CI/CD
  14: 6, // AWS DevOps Services → AWS
  15: 8, // Incident Management → Monitoring
  16: 6, // Cloud Cost Optimization → AWS
};

// ── Quiz Questions ─────────────────────────────
interface Question {
  q:       string;
  opts:    string[];
  correct: number;
  topic:   number; // topic index
}

const QUIZ_QUESTIONS: Question[] = [
  // Linux
  { topic: 0, q: 'Which command displays the current working directory?',
    opts: ['ls', 'pwd', 'cd', 'dir'], correct: 1 },
  { topic: 0, q: 'What permission bit does `chmod 755` set for "others"?',
    opts: ['rwx', 'rw-', 'r-x', 'r--'], correct: 2 },
  { topic: 0, q: 'Which signal does `kill -9` send to a process?',
    opts: ['SIGTERM', 'SIGHUP', 'SIGKILL', 'SIGSTOP'], correct: 2 },
  // Git
  { topic: 2, q: 'Which git command creates a new branch AND switches to it?',
    opts: ['git branch new', 'git checkout -b new', 'git switch new', 'git merge new'], correct: 1 },
  { topic: 2, q: 'What does `git stash pop` do?',
    opts: ['Deletes stash', 'Applies latest stash and removes it', 'Lists stashes', 'Stages changes'], correct: 1 },
  { topic: 2, q: 'Which command rewrites the last commit message without creating a new commit?',
    opts: ['git commit -m', 'git rebase', 'git commit --amend', 'git reset'], correct: 2 },
  // Docker
  { topic: 3, q: 'What does `docker-compose up -d` do?',
    opts: ['Builds images', 'Starts services in detached mode', 'Stops containers', 'Removes containers'], correct: 1 },
  { topic: 3, q: 'Which Dockerfile instruction sets the working directory?',
    opts: ['RUN', 'COPY', 'WORKDIR', 'ENV'], correct: 2 },
  { topic: 3, q: 'What does `docker exec -it <id> bash` do?',
    opts: ['Starts a new container', 'Opens an interactive shell in running container', 'Copies a file', 'Stops container'], correct: 1 },
  // K8s
  { topic: 5, q: 'Which Kubernetes object maintains a stable set of running pods?',
    opts: ['Pod', 'Service', 'ReplicaSet', 'ConfigMap'], correct: 2 },
  { topic: 5, q: '`kubectl get pods -n kube-system` lists pods in which namespace?',
    opts: ['default', 'kube-system', 'all', 'monitoring'], correct: 1 },
];

// ── Interview Questions ────────────────────────
interface InterviewQ { id: number; topic: string; q: string; }

const INTERVIEW_QUESTIONS: InterviewQ[] = [
  { id: 0,  topic: 'Linux',      q: 'Explain the difference between a process and a thread.' },
  { id: 1,  topic: 'Linux',      q: 'How would you troubleshoot a server running out of disk space?' },
  { id: 2,  topic: 'Git',        q: 'Describe a Git branching strategy you have used in production.' },
  { id: 3,  topic: 'Git',        q: 'What is a merge conflict and how do you resolve it?' },
  { id: 4,  topic: 'Docker',     q: 'How does Docker networking work (bridge, host, overlay)?' },
  { id: 5,  topic: 'Docker',     q: 'What is the difference between CMD and ENTRYPOINT?' },
  { id: 6,  topic: 'CI/CD',      q: 'Describe the stages in a typical CI/CD pipeline.' },
  { id: 7,  topic: 'CI/CD',      q: 'How do you handle secrets in a CI/CD pipeline securely?' },
  { id: 8,  topic: 'Kubernetes', q: 'Explain liveness vs readiness probes in Kubernetes.' },
  { id: 9,  topic: 'Kubernetes', q: 'How does Kubernetes handle rolling deployments?' },
  { id: 10, topic: 'AWS',        q: 'What is the shared responsibility model in AWS?' },
  { id: 11, topic: 'AWS',        q: 'Explain the difference between Security Groups and NACLs.' },
  { id: 12, topic: 'Terraform',  q: 'What is Terraform state and why is remote state important?' },
  { id: 13, topic: 'Terraform',  q: 'What does `terraform plan` do and why is it important?' },
  { id: 14, topic: 'Monitoring', q: 'What is the RED method for monitoring microservices?' },
  { id: 15, topic: 'Monitoring', q: 'Describe how you would set up alerting with Prometheus & Alertmanager.' },
  { id: 16, topic: 'General',    q: 'What is the difference between DevOps and SRE?' },
  { id: 17, topic: 'General',    q: 'Explain blue-green vs canary deployments.' },
  { id: 18, topic: 'General',    q: 'How do you ensure zero-downtime deployments?' },
  { id: 19, topic: 'General',    q: 'Describe your approach to incident response and post-mortems.' },
];

// ─────────────────────────────────────────────
//  localStorage helpers
// ─────────────────────────────────────────────
function today(): string {
  return new Date().toISOString().split('T')[0];
}

function getDefaultState(): AppState {
  return {
    streak:           { lastVisit: '', count: 0 },
    totalMinutes:     0,
    quiz:             { correct: 0, total: 0 },
    prep:             { completed: 0, total: 20 },
    currentTopicIndex: 0,
    completedTopics:  [],
    activityLog:      {},
    weeklyProgress:   [],
    sessionActive:    false,
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return getDefaultState();
    return { ...getDefaultState(), ...JSON.parse(raw) };
  } catch {
    return getDefaultState();
  }
}

function saveState(s: AppState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch { /* quota exceeded — ignore */ }
}

// ─────────────────────────────────────────────
//  Computed metrics
// ─────────────────────────────────────────────
function calcKnowledgeScore(quiz: QuizData): number {
  if (quiz.total === 0) return 0;
  return Math.floor((quiz.correct / quiz.total) * 100);
}

function calcInterviewReady(prep: PrepData, quiz: QuizData): number {
  const quizAccuracy = quiz.total === 0 ? 0 : quiz.correct / quiz.total;
  const prepRatio    = prep.total === 0 ? 0 : prep.completed / prep.total;
  return Math.floor((prepRatio * 0.5 + quizAccuracy * 0.5) * 100);
}

function buildRadarData(completedTopics: number[]): { axis: string; value: number }[] {
  const scores = Array(SKILL_AXES.length).fill(0);
  
  // Calculate how many topics belong to each axis
  const maxTopicsPerAxis = Array(SKILL_AXES.length).fill(0);
  TOPICS.forEach((_, ti) => {
    const axisIdx = TOPIC_AXIS_MAP[ti] ?? 0;
    maxTopicsPerAxis[axisIdx]++;
  });

  completedTopics.forEach((ti) => {
    const axisIdx = TOPIC_AXIS_MAP[ti] ?? 0;
    const increment = maxTopicsPerAxis[axisIdx] > 0 ? 100 / maxTopicsPerAxis[axisIdx] : 100;
    scores[axisIdx] = Math.min(100, scores[axisIdx] + increment);
  });
  return SKILL_AXES.map((axis, i) => ({ axis, value: scores[i] }));
}

function buildWeeklyChartData(weeklyProgress: WeekEntry[]): { label: string; topics: number }[] {
  const now   = new Date();
  const weeks: { label: string; topics: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key   = d.toISOString().split('T')[0];
    const label = `W${8 - i}`;
    const entry = weeklyProgress.find((w) => w.week === key);
    weeks.push({ label, topics: entry ? entry.count : 0 });
  }
  // Make it cumulative
  let cum = 0;
  return weeks.map((w) => { cum += w.topics; return { label: w.label, topics: cum }; });
}

// ─────────────────────────────────────────────
//  Activity Heatmap helper
// ─────────────────────────────────────────────
function buildHeatmapGrid(activityLog: Record<string, boolean>): { date: string; active: boolean }[][] {
  const grid: { date: string; active: boolean }[][] = [];
  const now = new Date();
  // Go back 83 days (12 weeks * 7 = 84, start on Sunday)
  const start = new Date(now);
  start.setDate(start.getDate() - 83);
  // Align to Sunday
  const dow = start.getDay();
  start.setDate(start.getDate() - dow);

  for (let col = 0; col < 12; col++) {
    const week: { date: string; active: boolean }[] = [];
    for (let row = 0; row < 7; row++) {
      const d = new Date(start);
      d.setDate(start.getDate() + col * 7 + row);
      const key = d.toISOString().split('T')[0];
      week.push({ date: key, active: !!activityLog[key] });
    }
    grid.push(week);
  }
  return grid;
}

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
interface DevOpsTrackerProps {
  onBack?: () => void;
}

const DevOpsTracker: React.FC<DevOpsTrackerProps> = ({ onBack }) => {
  const [appState, setAppState] = useState<AppState>(loadState);
  const [quizOpen,   setQuizOpen]   = useState(false);
  const [prepOpen,   setPrepOpen]   = useState(false);
  const [quizTopic,  setQuizTopic]  = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [prepChecked,   setPrepChecked]   = useState<Record<number, boolean>>({});
  const [nodeTooltip, setNodeTooltip] = useState<number | null>(null);
  const [, setTick] = useState(0); // force re-render each minute

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── On mount: streak + activity ─────────────
  useEffect(() => {
    setAppState((prev) => {
      const s    = { ...prev };
      const td   = today();

      // Streak logic
      const lv = s.streak.lastVisit;
      if (lv !== td) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yd = yesterday.toISOString().split('T')[0];
        s.streak = {
          lastVisit: td,
          count: lv === yd ? s.streak.count + 1 : 1,
        };
      }

      // Activity log
      s.activityLog = { ...s.activityLog, [td]: true };

      saveState(s);
      return s;
    });

    // Minute timer for learning time
    intervalRef.current = setInterval(() => {
      setAppState((prev) => {
        const s = { ...prev, totalMinutes: prev.totalMinutes + 1 };
        saveState(s);
        return s;
      });
      setTick((t) => t + 1);
    }, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Persist prep checkboxes ──────────────────
  useEffect(() => {
    const raw = localStorage.getItem(`${LS_KEY}_prep_checked`);
    if (raw) setPrepChecked(JSON.parse(raw));
  }, []);

  const updateState = useCallback((updater: (s: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater({ ...prev });
      saveState(next);
      return next;
    });
  }, []);

  // ── Derived metrics ──────────────────────────
  const knowledgeScore  = calcKnowledgeScore(appState.quiz);
  const interviewReady  = calcInterviewReady(appState.prep, appState.quiz);
  const radarData       = buildRadarData(appState.completedTopics);
  const weeklyChartData = buildWeeklyChartData(appState.weeklyProgress);
  const heatmapGrid     = buildHeatmapGrid(appState.activityLog);

  // ── Topic actions ────────────────────────────
  const startSession = () => {
    updateState((s) => ({ ...s, sessionActive: true }));
    localStorage.setItem(`${LS_KEY}_sessionStart`, String(Date.now()));
  };

  const markComplete = () => {
    updateState((s) => {
      const idx  = s.currentTopicIndex;
      const next = Math.min(idx + 1, TOPICS.length - 1);
      const completed = s.completedTopics.includes(idx)
        ? s.completedTopics
        : [...s.completedTopics, idx];

      // Update weekly progress
      const wk  = (() => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay());
        return d.toISOString().split('T')[0];
      })();
      const wp = [...s.weeklyProgress];
      const wIdx = wp.findIndex((w) => w.week === wk);
      if (wIdx >= 0) wp[wIdx] = { ...wp[wIdx], count: wp[wIdx].count + 1 };
      else wp.push({ week: wk, count: 1 });

      return {
        ...s,
        currentTopicIndex: next,
        completedTopics:   completed,
        sessionActive:     false,
        weeklyProgress:    wp,
      };
    });
  };

  // ── Quiz ─────────────────────────────────────
  const topicQuestions = QUIZ_QUESTIONS.filter((q) => q.topic === quizTopic);
  const allQuestions   = topicQuestions.length > 0 ? topicQuestions : QUIZ_QUESTIONS.slice(0, 5);

  const openQuiz = () => {
    setQuizTopic(appState.currentTopicIndex);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizOpen(true);
  };

  const submitQuiz = () => {
    let correct = 0;
    allQuestions.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) correct++;
    });
    updateState((s) => ({
      ...s,
      quiz: {
        correct: s.quiz.correct + correct,
        total:   s.quiz.total   + allQuestions.length,
      },
    }));
    setQuizSubmitted(true);
  };

  // ── Interview Prep ───────────────────────────
  const togglePrep = (id: number, checked: boolean) => {
    const next = { ...prepChecked, [id]: checked };
    setPrepChecked(next);
    localStorage.setItem(`${LS_KEY}_prep_checked`, JSON.stringify(next));
    const completedCount = Object.values(next).filter(Boolean).length;
    updateState((s) => ({
      ...s,
      prep: { ...s.prep, completed: completedCount },
    }));
  };

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <div
      className="min-h-screen text-white font-mono"
      style={{ background: '#0a0a0a', fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: '#0a0a0a', borderColor: '#1f1f1f' }}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border transition-colors hover:border-red-500 hover:text-red-400"
              style={{ borderColor: '#1f1f1f', color: '#6b7280' }}
            >
              <ArrowLeft size={14} /> BACK
            </button>
          )}
          <Activity size={20} className="text-red-500" />
          <span className="text-sm font-bold tracking-widest text-white">DEVOPS TRACKER</span>
          <span
            className="hidden sm:inline text-xs px-2 py-0.5 rounded border"
            style={{ borderColor: '#1f1f1f', color: '#6b7280' }}
          >
            SECONDARY DASHBOARD
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NavBtn icon={<BookOpen size={14} />} label="TAKE QUIZ"       onClick={openQuiz} />
          <NavBtn icon={<Mic size={14} />}      label="INTERVIEW PREP"  onClick={() => setPrepOpen(true)} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── STAT CARDS ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Flame size={18} className="text-red-500" />}
            label="STREAK"
            value={String(appState.streak.count)}
            sub="DAYS"
          />
          <StatCard
            icon={<Clock size={18} className="text-red-500" />}
            label="LEARNING TIME"
            value={String(appState.totalMinutes)}
            sub="MINUTES"
          />
          <StatCard
            icon={<Brain size={18} className="text-red-500" />}
            label="KNOWLEDGE SCORE"
            value={`${knowledgeScore}`}
            sub="/ 100"
          />
          <StatCard
            icon={<Target size={18} className="text-red-500" />}
            label="INTERVIEW READY"
            value={`${interviewReady}%`}
            sub="READINESS"
          />
        </section>

        {/* ── NEXT MOVE ── */}
        <NextMoveCard
          idx={appState.currentTopicIndex}
          sessionActive={appState.sessionActive}
          onStart={startSession}
          onComplete={markComplete}
        />

        {/* ── LEARNING SYSTEM MAP ── */}
        <section>
          <SectionLabel label="LEARNING SYSTEM MAP" />
          <SystemMap
            currentIdx={appState.currentTopicIndex}
            completed={appState.completedTopics}
            nodeTooltip={nodeTooltip}
            setNodeTooltip={setNodeTooltip}
          />
        </section>

        {/* ── CHARTS ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar */}
          <div
            className="p-5 rounded-xl border"
            style={{ background: '#111111', borderColor: '#1f1f1f' }}
          >
            <SectionLabel label="SKILL COVERAGE" />
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#1f1f1f" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#e53e3e"
                  fill="#e53e3e"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div
            className="p-5 rounded-xl border"
            style={{ background: '#111111', borderColor: '#1f1f1f' }}
          >
            <SectionLabel label="PROGRESS OVER TIME" />
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeklyChartData}>
                <CartesianGrid stroke="#1f1f1f" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#111111',
                    border: '1px solid #1f1f1f',
                    borderRadius: 8,
                    color: '#fff',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="topics"
                  stroke="#e53e3e"
                  strokeWidth={2}
                  dot={{ fill: '#e53e3e', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#fc8181' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── ACTIVITY HEATMAP ── */}
        <section>
          <SectionLabel label="ACTIVITY HEATMAP — LAST 12 WEEKS" />
          <ActivityHeatmap grid={heatmapGrid} />
        </section>

      </main>

      {/* ── QUIZ MODAL ── */}
      {quizOpen && (
        <Modal title="QUIZ ENGINE" onClose={() => setQuizOpen(false)}>
          <QuizEngine
            questions={allQuestions}
            topicName={TOPICS[quizTopic]?.name ?? 'General'}
            answers={quizAnswers}
            setAnswers={setQuizAnswers}
            submitted={quizSubmitted}
            onSubmit={submitQuiz}
          />
        </Modal>
      )}

      {/* ── INTERVIEW PREP MODAL ── */}
      {prepOpen && (
        <Modal title="INTERVIEW PREP TRACKER" onClose={() => setPrepOpen(false)}>
          <InterviewPrep
            questions={INTERVIEW_QUESTIONS}
            checked={prepChecked}
            onToggle={togglePrep}
            completed={appState.prep.completed}
            total={appState.prep.total}
          />
        </Modal>
      )}

      {/* Global pulse animation */}
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(229,62,62,0.6); }
          70%  { box-shadow: 0 0 0 8px rgba(229,62,62,0); }
          100% { box-shadow: 0 0 0 0 rgba(229,62,62,0); }
        }
        .pulse-ring { animation: pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite; }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────

// ── NavBtn ────────────────────────────────────
const NavBtn: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-all hover:border-red-500 hover:text-red-400"
    style={{ borderColor: '#1f1f1f', color: '#6b7280', background: '#111111' }}
  >
    {icon} {label}
  </button>
);

// ── SectionLabel ─────────────────────────────
const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-xs tracking-widest mb-3" style={{ color: '#6b7280' }}>{label}</p>
);

// ── StatCard ─────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: string; sub: string;
}> = ({ icon, label, value, sub }) => (
  <div
    className="p-5 rounded-xl border flex flex-col gap-3"
    style={{ background: '#111111', borderColor: '#1f1f1f' }}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs tracking-widest" style={{ color: '#6b7280' }}>{label}</span>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className="text-xs mb-1" style={{ color: '#6b7280' }}>{sub}</span>
    </div>
  </div>
);

// ── NextMoveCard ─────────────────────────────
const NextMoveCard: React.FC<{
  idx: number;
  sessionActive: boolean;
  onStart: () => void;
  onComplete: () => void;
}> = ({ idx, sessionActive, onStart, onComplete }) => {
  const topic   = TOPICS[idx] ?? TOPICS[TOPICS.length - 1];
  const isLast  = idx >= TOPICS.length;

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ background: '#111111', borderColor: '#1f1f1f' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs tracking-widest" style={{ color: '#6b7280' }}>YOUR NEXT MOVE</p>
          <h2 className="text-xl font-bold text-white">{isLast ? '🎉 ALL TOPICS COMPLETE!' : topic.name}</h2>
          {!isLast && (
            <p className="text-sm" style={{ color: '#6b7280' }}>
              TOPIC {idx + 1} OF {TOPICS.length} — {topic.desc}
            </p>
          )}
        </div>
        {!isLast && (
          <div className="flex gap-3 flex-shrink-0">
            {!sessionActive ? (
              <button
                onClick={onStart}
                id="tracker-start-session"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold tracking-wider transition-all hover:brightness-110 active:scale-95"
                style={{ background: '#e53e3e', color: '#fff' }}
              >
                <Play size={14} /> START SESSION →
              </button>
            ) : (
              <button
                onClick={onComplete}
                id="tracker-mark-complete"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold tracking-wider transition-all hover:brightness-110 active:scale-95 border"
                style={{ background: 'transparent', borderColor: '#e53e3e', color: '#e53e3e' }}
              >
                <CheckCircle size={14} /> MARK COMPLETE ✓
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── System Map ────────────────────────────────
const SystemMap: React.FC<{
  currentIdx:   number;
  completed:    number[];
  nodeTooltip:  number | null;
  setNodeTooltip: (n: number | null) => void;
}> = ({ currentIdx, completed, nodeTooltip, setNodeTooltip }) => (
  <div
    className="p-6 rounded-xl border overflow-x-auto"
    style={{ background: '#111111', borderColor: '#1f1f1f' }}
  >
    <div className="flex items-center gap-0 min-w-max mx-auto w-fit">
      {TOPICS.map((t, i) => {
        const isDone    = completed.includes(i);
        const isCurrent = i === currentIdx;
        const isLocked  = !isDone && !isCurrent;

        return (
          <div key={i} className="flex items-start">
            {/* Node */}
            <div className="relative flex flex-col items-center w-20 flex-shrink-0 gap-2">
              <button
                onClick={() => isLocked && setNodeTooltip(nodeTooltip === i ? null : i)}
                onMouseLeave={() => isLocked && setNodeTooltip(null)}
                className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${isDone    ? 'text-white'           : ''}
                  ${isCurrent ? 'pulse-ring text-white' : ''}
                  ${isLocked  ? 'cursor-pointer'        : ''}
                `}
                style={{
                  background:  isDone    ? '#e53e3e'  : isCurrent ? 'transparent' : '#1f1f1f',
                  border:      isCurrent ? '2px solid #e53e3e' : isDone ? 'none' : '2px solid #2d2d2d',
                  color:       isLocked  ? '#4b5563'  : '#fff',
                }}
              >
                {isDone ? <CheckCircle size={16} /> : isLocked ? <Lock size={14} /> : i + 1}
              </button>
              <span
                className="text-[10px] text-center w-full leading-tight break-words"
                style={{ color: isLocked ? '#374151' : isCurrent ? '#e53e3e' : '#9ca3af' }}
              >
                {t.name.split(' ')[0]}
              </span>
              {/* Tooltip */}
              {nodeTooltip === i && (
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                  style={{ background: '#1f1f1f', color: '#e53e3e', border: '1px solid #e53e3e' }}
                >
                  Complete previous topic first
                </div>
              )}
            </div>
            {/* Connector */}
            {i < TOPICS.length - 1 && (
              <div
                className="w-6 h-0.5 mx-1 flex-shrink-0 mt-[19px]"
                style={{ background: completed.includes(i) ? '#e53e3e' : '#1f1f1f' }}
              />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// ── Activity Heatmap ──────────────────────────
const ActivityHeatmap: React.FC<{ grid: { date: string; active: boolean }[][] }> = ({ grid }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <div
      className="p-5 rounded-xl border overflow-x-auto"
      style={{ background: '#111111', borderColor: '#1f1f1f' }}
    >
      <div className="flex gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          <div className="h-4" /> {/* spacer for header */}
          {days.map((d, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center" style={{ color: '#6b7280' }}>
              <span className="text-[9px]">{i % 2 === 0 ? d : ''}</span>
            </div>
          ))}
        </div>
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {/* Month label (first day of week) */}
            <div className="h-4 flex items-center">
              {week[0] && new Date(week[0].date).getDate() <= 7 ? (
                <span className="text-[9px]" style={{ color: '#6b7280' }}>
                  {new Date(week[0].date).toLocaleString('default', { month: 'short' })}
                </span>
              ) : <div className="w-3" />}
            </div>
            {week.map((cell, di) => (
              <div
                key={di}
                title={cell.date}
                className="w-3 h-3 rounded-sm"
                style={{
                  background: cell.active
                    ? '#e53e3e'
                    : cell.date > today()
                    ? 'transparent'
                    : '#1f1f1f',
                  opacity:   cell.active ? 0.9 : 1,
                  border:    cell.date === today() ? '1px solid #e53e3e' : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4" style={{ color: '#6b7280' }}>
        <span className="text-xs">LESS</span>
        {[0.15, 0.35, 0.6, 0.9].map((op) => (
          <div key={op} className="w-3 h-3 rounded-sm" style={{ background: `rgba(229,62,62,${op})` }} />
        ))}
        <span className="text-xs">MORE</span>
      </div>
    </div>
  );
};

// ── Modal ─────────────────────────────────────
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title, onClose, children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
    <div
      className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border overflow-hidden"
      style={{ background: '#0a0a0a', borderColor: '#1f1f1f' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: '#1f1f1f' }}
      >
        <span className="text-sm font-bold tracking-widest text-white">{title}</span>
        <button onClick={onClose} className="hover:text-red-400 transition-colors" style={{ color: '#6b7280' }}>
          <X size={18} />
        </button>
      </div>
      {/* Body */}
      <div className="overflow-y-auto flex-1 p-6">{children}</div>
    </div>
  </div>
);

// ── Quiz Engine ───────────────────────────────
const QuizEngine: React.FC<{
  questions:   Question[];
  topicName:   string;
  answers:     Record<number, number>;
  setAnswers:  (a: Record<number, number>) => void;
  submitted:   boolean;
  onSubmit:    () => void;
}> = ({ questions, topicName, answers, setAnswers, submitted, onSubmit }) => {
  const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain size={16} className="text-red-500" />
        <span className="text-sm tracking-widest" style={{ color: '#6b7280' }}>
          TOPIC: {topicName.toUpperCase()}
        </span>
        <span className="text-xs px-2 py-0.5 rounded border" style={{ borderColor: '#1f1f1f', color: '#6b7280' }}>
          {questions.length} QUESTIONS
        </span>
      </div>

      {submitted ? (
        // Score summary
        <div className="text-center space-y-6 py-4">
          <Trophy size={48} className="mx-auto text-red-500" />
          <div>
            <p className="text-4xl font-bold text-white">
              {correctCount} / {questions.length}
            </p>
            <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
              {Math.round((correctCount / questions.length) * 100)}% ACCURACY
            </p>
          </div>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            {correctCount === questions.length
              ? '🔥 PERFECT SCORE — IMPRESSIVE!'
              : correctCount >= questions.length / 2
              ? '✅ GOOD WORK — KEEP PRACTISING!'
              : '📚 REVIEW THE MATERIAL AND TRY AGAIN.'}
          </p>
        </div>
      ) : (
        // Questions
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="space-y-3">
              <p className="text-sm text-white">
                <span className="text-red-500 mr-2">Q{qi + 1}.</span>{q.q}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.opts.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => setAnswers({ ...answers, [qi]: oi })}
                    className="text-left text-xs px-3 py-2.5 rounded-lg border transition-all"
                    style={{
                      borderColor: answers[qi] === oi ? '#e53e3e' : '#1f1f1f',
                      background:  answers[qi] === oi ? 'rgba(229,62,62,0.1)' : '#111111',
                      color:       answers[qi] === oi ? '#e53e3e' : '#9ca3af',
                    }}
                  >
                    <span className="mr-2" style={{ color: '#4b5563' }}>
                      {['A', 'B', 'C', 'D'][oi]}.
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={onSubmit}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full py-3 rounded-lg text-sm font-bold tracking-wider transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#e53e3e', color: '#fff' }}
          >
            SUBMIT QUIZ →
          </button>
        </div>
      )}
    </div>
  );
};

// ── Interview Prep ────────────────────────────
const InterviewPrep: React.FC<{
  questions: InterviewQ[];
  checked:   Record<number, boolean>;
  onToggle:  (id: number, checked: boolean) => void;
  completed: number;
  total:     number;
}> = ({ questions, checked, onToggle, completed, total }) => {
  const pct = Math.round((completed / total) * 100);

  // Group by topic
  const byTopic = questions.reduce<Record<string, InterviewQ[]>>((acc, q) => {
    (acc[q.topic] = acc[q.topic] || []).push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs" style={{ color: '#6b7280' }}>
          <span>CONFIDENCE PROGRESS</span>
          <span>{completed} / {total} — {pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1f1f1f' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: '#e53e3e' }}
          />
        </div>
      </div>

      {/* Questions by topic */}
      {Object.entries(byTopic).map(([topic, qs]) => (
        <div key={topic} className="space-y-3">
          <p className="text-xs tracking-widest" style={{ color: '#e53e3e' }}>{topic.toUpperCase()}</p>
          {qs.map((q) => (
            <label
              key={q.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={!!checked[q.id]}
                  onChange={(e) => onToggle(q.id, e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-4 h-4 rounded border flex items-center justify-center transition-all"
                  style={{
                    background:  checked[q.id] ? '#e53e3e' : 'transparent',
                    borderColor: checked[q.id] ? '#e53e3e' : '#374151',
                  }}
                >
                  {checked[q.id] && <CheckCircle size={10} className="text-white" />}
                </div>
              </div>
              <span
                className="text-sm leading-relaxed transition-colors"
                style={{ color: checked[q.id] ? '#6b7280' : '#d1d5db' }}
              >
                {q.q}
                {checked[q.id] && (
                  <span className="ml-2 text-xs text-green-500">✓ CONFIDENT</span>
                )}
              </span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DevOpsTracker;
