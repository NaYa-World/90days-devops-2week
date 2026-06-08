export interface ScheduleBlock {
  time: string;
  phase: string;
  activity: string;
  why: string;
}

export interface ConceptBlock {
  icon: string;
  title: string;
  description: string;
  analogy: string;
}

export interface TerminalLine {
  type: 'cmd' | 'output' | 'comment' | 'ok' | 'warn' | 'err';
  text: string;
  prompt?: string;
}

export interface TerminalSection {
  label: string;
  lines: TerminalLine[];
}

export interface TerminalSession {
  sessionNumber: number;
  totalSessions: number;
  sessionTitle: string;
  sections: TerminalSection[];
  expectedOutput?: {
    label: string;
    text: string;
  };
}

export interface DebugStep {
  num: number;
  title: string;
  description?: string;
  cmd?: string;
}

export interface DebugTree {
  title: string;
  steps: DebugStep[];
}

export interface MistakeItem {
  mistake: string;
  description: string;
  fix: string;
}

export interface MiniProject {
  tag: string;
  title: string;
  timeEstimate: string;
  goal: string;
  checklist: string[];
  codeBlock?: {
    title: string;
    lines: string[];
  };
  expectedOutput?: string;
}

export interface InterviewPrompt {
  question: string;
  answer: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  num: number;
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface GithubTemplate {
  filename: string;
  commitMessage?: string;
  template: string;
}

export interface BootcampDay {
  day: number;
  title: string;
  subtitle: string;
  color: string;
  trainerNote: string;
  engineerNote: string;
  goal: {
    icon: string;
    title: string;
    description: string;
  };
  schedule?: ScheduleBlock[];
  concepts?: ConceptBlock[];
  commands?: TerminalSession[];
  debugTrees?: DebugTree[];
  mistakes?: MistakeItem[];
  project?: MiniProject;
  interview?: InterviewPrompt[];
  quiz?: QuizQuestion[];
  github?: GithubTemplate;
  pdfUrl?: string;
  images?: {
    url: string;
    caption: string;
  }[];
}
