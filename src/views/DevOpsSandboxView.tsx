import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getActiveProvider, getProviderKey } from '../components/AIService';
import { LABS, Lab, Exercise } from '../data/labs';
import { TerminalSimulator } from '../components/TerminalSimulator';
import { UseAppStateReturnType } from '../hooks/useAppState';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system' | 'success';
  text: string;
}

interface Scenario {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: ScenarioStep[];
}

interface ScenarioStep {
  instruction: string;
  expectedCommand: string;
  hints: string[];
  successMessage: string;
  alternates?: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'file-ops',
    title: 'File & Permission Ops',
    icon: '📁',
    description: 'Practice creating directories, files, and managing Linux file permissions — the bread and butter of any sysadmin.',
    steps: [
      {
        instruction: 'Create a directory called "devops-lab"',
        expectedCommand: 'mkdir devops-lab',
        alternates: ['mkdir -p devops-lab'],
        hints: ['Use the mkdir command', 'Syntax: mkdir <directory-name>'],
        successMessage: '✅ Directory "devops-lab" created successfully!'
      },
      {
        instruction: 'Navigate into the "devops-lab" directory',
        expectedCommand: 'cd devops-lab',
        hints: ['Use the cd command', 'Syntax: cd <directory>'],
        successMessage: '✅ Changed directory to devops-lab/'
      },
      {
        instruction: 'Create an empty file called "deploy.sh"',
        expectedCommand: 'touch deploy.sh',
        hints: ['Use the touch command to create an empty file', 'Syntax: touch <filename>'],
        successMessage: '✅ File "deploy.sh" created!'
      },
      {
        instruction: 'Make deploy.sh executable for the owner',
        expectedCommand: 'chmod +x deploy.sh',
        alternates: ['chmod u+x deploy.sh', 'chmod 755 deploy.sh', 'chmod 700 deploy.sh'],
        hints: ['Use chmod to change permissions', 'The +x flag adds execute permission'],
        successMessage: '✅ deploy.sh is now executable (rwxr-xr-x)'
      },
      {
        instruction: 'List files with detailed permissions',
        expectedCommand: 'ls -la',
        alternates: ['ls -l', 'ls -al', 'ls -lah'],
        hints: ['Use ls with the -l flag for long format', 'Add -a to show hidden files too'],
        successMessage: '✅ \n-rwxr-xr-x 1 devops devops  0 Jun  2 10:00 deploy.sh\ndrwxr-xr-x 2 devops devops 40 Jun  2 10:00 .'
      },
      {
        instruction: 'Write "#!/bin/bash\\necho Hello DevOps" into deploy.sh',
        expectedCommand: 'echo -e "#!/bin/bash\\necho Hello DevOps" > deploy.sh',
        alternates: [
          "echo '#!/bin/bash' > deploy.sh",
          'printf "#!/bin/bash\\necho Hello DevOps" > deploy.sh',
          'cat > deploy.sh'
        ],
        hints: ['Use echo with redirection (>) to write to a file', 'Use -e flag to interpret \\n as newline'],
        successMessage: '✅ Script written to deploy.sh successfully!'
      }
    ]
  },
  {
    id: 'git-ops',
    title: 'Git Version Control',
    icon: '🔀',
    description: 'Practice essential Git workflows — init, branch, commit, merge — that you will use every single day as a DevOps engineer.',
    steps: [
      {
        instruction: 'Initialize a new Git repository',
        expectedCommand: 'git init',
        hints: ['Use the git init command to create a new repo'],
        successMessage: '✅ Initialized empty Git repository in /devops-lab/.git/'
      },
      {
        instruction: 'Check the repository status',
        expectedCommand: 'git status',
        hints: ['Use git status to see untracked files and changes'],
        successMessage: '✅ On branch main\n\nNo commits yet\n\nUntracked files:\n  deploy.sh\n\nnothing added to commit but untracked files present'
      },
      {
        instruction: 'Stage all files for commit',
        expectedCommand: 'git add .',
        alternates: ['git add -A', 'git add --all', 'git add deploy.sh'],
        hints: ['Use git add to stage files', 'The dot (.) stages everything in the current directory'],
        successMessage: '✅ All files staged for commit.'
      },
      {
        instruction: 'Create a commit with message "Initial commit"',
        expectedCommand: 'git commit -m "Initial commit"',
        alternates: ["git commit -m 'Initial commit'"],
        hints: ['Use git commit -m to commit with a message', 'Wrap the message in quotes'],
        successMessage: '✅ [main (root-commit) a1b2c3d] Initial commit\n 1 file changed, 2 insertions(+)'
      },
      {
        instruction: 'Create and switch to a new branch called "feature/ci-pipeline"',
        expectedCommand: 'git checkout -b feature/ci-pipeline',
        alternates: ['git switch -c feature/ci-pipeline'],
        hints: ['Use git checkout -b to create and switch to a new branch', 'Or use the newer git switch -c command'],
        successMessage: '✅ Switched to a new branch \'feature/ci-pipeline\''
      },
      {
        instruction: 'List all branches',
        expectedCommand: 'git branch',
        alternates: ['git branch -a', 'git branch --list'],
        hints: ['Use git branch to see all local branches', 'The asterisk (*) marks your current branch'],
        successMessage: '✅ * feature/ci-pipeline\n  main'
      }
    ]
  },
  {
    id: 'server-diag',
    title: 'Server Diagnostics',
    icon: '🖥️',
    description: 'Practice debugging production servers — checking logs, monitoring resources, inspecting ports, and diagnosing issues.',
    steps: [
      {
        instruction: 'Check available disk space',
        expectedCommand: 'df -h',
        alternates: ['df -hT', 'df --human-readable'],
        hints: ['Use df to display filesystem disk usage', 'The -h flag makes sizes human-readable'],
        successMessage: '✅ Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1          50G   18G   30G  38% /\ntmpfs             3.9G     0  3.9G   0% /dev/shm'
      },
      {
        instruction: 'Check system memory usage',
        expectedCommand: 'free -h',
        alternates: ['free -m', 'free --human'],
        hints: ['Use free to check memory (RAM) usage', 'The -h flag makes output human-readable'],
        successMessage: '✅               total   used   free  shared  buff/cache  available\nMem:           7.7Gi  3.2Gi  1.9Gi   312Mi       2.6Gi      3.9Gi\nSwap:          2.0Gi  128Mi  1.9Gi'
      },
      {
        instruction: 'Show top resource-consuming processes',
        expectedCommand: 'top -b -n 1',
        alternates: ['top', 'htop', 'ps aux --sort=-%mem | head'],
        hints: ['Use top or htop to view running processes', 'The -b flag runs top in batch mode, -n 1 limits to one iteration'],
        successMessage: '✅ PID   USER    %CPU  %MEM  COMMAND\n1234  nginx   2.3   1.4   nginx: worker\n5678  node    8.1   4.2   node server.js\n9012  postgres 3.7  6.8   postgres: writer'
      },
      {
        instruction: 'Check which process is listening on port 80',
        expectedCommand: 'ss -tlnp | grep :80',
        alternates: ['netstat -tlnp | grep :80', 'lsof -i :80', 'ss -tlnp'],
        hints: ['Use ss (socket statistics) or netstat to check ports', 'Filter with grep for port 80'],
        successMessage: '✅ LISTEN  0  511  0.0.0.0:80  0.0.0.0:*  users:(("nginx",pid=1234,fd=6))'
      },
      {
        instruction: 'View the last 20 lines of the nginx error log',
        expectedCommand: 'tail -n 20 /var/log/nginx/error.log',
        alternates: ['tail -20 /var/log/nginx/error.log', 'tail -f /var/log/nginx/error.log'],
        hints: ['Use tail to view the end of log files', 'Combine with -n to specify line count'],
        successMessage: '✅ 2024/06/02 10:15:32 [error] connect() failed (111: Connection refused) while connecting to upstream\n2024/06/02 10:15:33 [warn] 1234#1234: *100 upstream server temporarily disabled\n... (18 more lines)'
      },
      {
        instruction: 'Test if port 443 on google.com is reachable',
        expectedCommand: 'curl -I https://google.com',
        alternates: ['curl -Is https://google.com', 'nc -zv google.com 443', 'telnet google.com 443'],
        hints: ['Use curl with -I for a HEAD request to test connectivity', 'Or use nc (netcat) for raw port testing'],
        successMessage: '✅ HTTP/2 301\nlocation: https://www.google.com/\ncontent-type: text/html; charset=UTF-8\nserver: gws'
      }
    ]
  }
];

interface Props {
  appState: UseAppStateReturnType;
  sandboxSection: 'scenarios' | 'labs' | 'free' | null;
  setSandboxSection: React.Dispatch<React.SetStateAction<'scenarios' | 'labs' | 'free' | null>>;
}

export const DevOpsSandboxView: React.FC<Props> = ({ 
  appState, 
  sandboxSection, 
  setSandboxSection 
}) => {
  const { isLabDone, markLabDone, labDayDone } = appState;
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [activeLabDk, setActiveLabDk] = useState<string>(() => Object.keys(LABS)[0] || '');
  const [currentStep, setCurrentStep] = useState(0);
  const [cmdInput, setCmdInput] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [hintIdx, setHintIdx] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('devops90_sandbox_done') || '{}');
    } catch { return {}; }
  });

  useEffect(() => {
    try {
      setCompletedScenarios(JSON.parse(localStorage.getItem('devops90_sandbox_done') || '{}'));
    } catch {
      setCompletedScenarios({});
    }
  }, [appState.state]);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [freeMode, setFreeMode] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeScenario, freeMode, sandboxSection]);

  const addLine = useCallback((type: TerminalLine['type'], text: string) => {
    setLines(prev => [...prev, { type, text }]);
  }, []);

  const startScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setCurrentStep(0);
    setHintIdx(0);
    setCmdInput('');
    setLines([
      { type: 'system', text: `═══ ${scenario.icon} ${scenario.title} ═══` },
      { type: 'system', text: scenario.description },
      { type: 'system', text: '' },
      { type: 'system', text: `Step 1/${scenario.steps.length}: ${scenario.steps[0].instruction}` }
    ]);
    setFreeMode(false);
  };

  const startFreeMode = () => {
    setActiveScenario(null);
    setFreeMode(true);
    setCurrentStep(0);
    setLines([
      { type: 'system', text: '═══ 🧑‍💻 Free Practice Mode ═══' },
      { type: 'system', text: 'Type any Linux/DevOps command. Use "Ask AI Coach" for help.' },
      { type: 'system', text: 'Type "help" for a list of available commands.' }
    ]);
  };

  const matchesCommand = (input: string, expected: string, alternates?: string[]): boolean => {
    const clean = input.trim().toLowerCase();
    if (clean === expected.toLowerCase()) return true;
    if (alternates) {
      return alternates.some(alt => clean === alt.toLowerCase() || clean.startsWith(alt.toLowerCase()));
    }
    const verb = expected.split(' ')[0];
    if (clean.startsWith(verb) && clean.includes(expected.split(' ').slice(-1)[0])) return true;
    return false;
  };

  const handleFreeModeCommand = (cmd: string) => {
    const lowerCmd = cmd.toLowerCase().trim();
    addLine('input', `$ ${cmd}`);

    const responses: Record<string, string> = {
      'help': 'Available commands: ls, cd, mkdir, touch, cat, echo, chmod, chown,\n  git (init/status/add/commit/branch/checkout/merge/log),\n  df, free, top, ps, ss, netstat, curl, tail, head, grep,\n  docker (ps/images/run/build), kubectl (get/describe/apply),\n  terraform (init/plan/apply), ansible-playbook, systemctl',
      'ls': 'deploy.sh  Dockerfile  docker-compose.yml  README.md',
      'ls -la': 'total 24\ndrwxr-xr-x 3 devops devops 4096 Jun  2 10:00 .\n-rwxr-xr-x 1 devops devops   42 Jun  2 10:00 deploy.sh\n-rw-r--r-- 1 devops devops  156 Jun  2 10:00 Dockerfile\n-rw-r--r-- 1 devops devops  312 Jun  2 10:00 docker-compose.yml',
      'pwd': '/home/devops/devops-lab',
      'whoami': 'devops',
      'hostname': 'devops-sandbox-01',
      'uname -a': 'Linux devops-sandbox-01 5.15.0-105-generic #115-Ubuntu SMP x86_64 GNU/Linux',
      'date': new Date().toString(),
      'uptime': ' 10:00:00 up 42 days, 3:14,  1 user,  load average: 0.12, 0.08, 0.05',
      'docker ps': 'CONTAINER ID  IMAGE          STATUS         PORTS              NAMES\na1b2c3d4e5f6  nginx:latest   Up 2 hours     0.0.0.0:80->80     web-proxy\nf6e5d4c3b2a1  postgres:15    Up 2 hours     5432/tcp           app-db',
      'docker images': 'REPOSITORY    TAG       IMAGE ID       SIZE\nnginx         latest    a1b2c3d4e5f6   187MB\npostgres      15        f6e5d4c3b2a1   412MB\nnode          20-slim   1234abcd5678   245MB',
      'kubectl get pods': 'NAME                          READY   STATUS    RESTARTS   AGE\nnginx-deploy-6c8b449b8-x2m4k  1/1     Running   0          3h\napi-server-5d7f9c4b7d-kn8p2   1/1     Running   0          3h\nredis-master-0                 1/1     Running   0          5h',
      'kubectl get nodes': 'NAME              STATUS   ROLES           AGE   VERSION\ncontrol-plane-1   Ready    control-plane   30d   v1.28.4\nworker-node-1     Ready    <none>          30d   v1.28.4\nworker-node-2     Ready    <none>          30d   v1.28.4',
      'terraform --version': 'Terraform v1.7.5\non linux_amd64',
      'clear': '__CLEAR__'
    };

    if (lowerCmd === 'clear') {
      setLines([]);
      return;
    }

    const matchKey = Object.keys(responses).find(k => lowerCmd === k || lowerCmd.startsWith(k.split(' ')[0] + ' '));
    if (responses[lowerCmd]) {
      addLine('output', responses[lowerCmd]);
    } else if (matchKey && responses[matchKey]) {
      addLine('output', responses[matchKey]);
    } else {
      addLine('output', `${cmd.split(' ')[0]}: command simulated — in a real terminal this would execute.\nTip: Use "Ask AI Coach" to learn more about this command.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = cmdInput.trim();
    if (!trimmed) return;

    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);
    setCmdInput('');

    if (freeMode) {
      handleFreeModeCommand(trimmed);
      return;
    }

    if (!activeScenario) return;

    const step = activeScenario.steps[currentStep];
    addLine('input', `$ ${trimmed}`);

    if (matchesCommand(trimmed, step.expectedCommand, step.alternates)) {
      addLine('success', step.successMessage);
      const nextStep = currentStep + 1;

      if (nextStep >= activeScenario.steps.length) {
        addLine('system', '');
        addLine('system', `🎉 Scenario Complete! You finished "${activeScenario.title}"!`);
        const updated = { ...completedScenarios, [activeScenario.id]: true };
        setCompletedScenarios(updated);
        localStorage.setItem('devops90_sandbox_done', JSON.stringify(updated));
        appState.triggerSync().catch(() => {});

        import('canvas-confetti').then((conf) => {
          conf.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        });
      } else {
        setCurrentStep(nextStep);
        setHintIdx(0);
        addLine('system', '');
        addLine('system', `Step ${nextStep + 1}/${activeScenario.steps.length}: ${activeScenario.steps[nextStep].instruction}`);
      }
    } else {
      addLine('error', `❌ Not quite. Try again!`);
      if (step.hints[0]) {
        addLine('system', `💡 Hint: ${step.hints[Math.min(hintIdx, step.hints.length - 1)]}`);
        setHintIdx(prev => Math.min(prev + 1, step.hints.length - 1));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIdx = historyIdx === -1 ? commandHistory.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setCmdInput(commandHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx >= 0) {
        const newIdx = historyIdx + 1;
        if (newIdx >= commandHistory.length) {
          setHistoryIdx(-1);
          setCmdInput('');
        } else {
          setHistoryIdx(newIdx);
          setCmdInput(commandHistory[newIdx]);
        }
      }
    }
  };

  const askAICoach = async () => {
    const provider = getActiveProvider();
    const key = await getProviderKey(provider);
    if (!key) {
      addLine('error', `⚠️ No API key configured for ${provider}. Go to Settings → API Keys to add one.`);
      return;
    }

    setAiCoachLoading(true);
    const context = lines.slice(-10).map(l => l.text).join('\n');
    const currentInstruction = activeScenario
      ? activeScenario.steps[currentStep]?.instruction || 'Free practice'
      : 'Free practice mode';

    const prompt = `You are a DevOps mentor helping a student in an interactive CLI sandbox.

Current task: ${currentInstruction}
Recent terminal activity:
${context}

Provide a brief, helpful hint (2-3 sentences max). Don't give the exact answer — guide them to discover it. If they seem stuck, mention the specific command name they should use. Be encouraging.`;

    try {
      let response: string;
      if (provider === 'claude') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'dangerously-allow-browser': 'true'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 300,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const data = await res.json();
        response = data.content?.[0]?.text || 'No response from AI coach.';
      } else if (provider === 'chatgpt') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini', max_tokens: 300,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const data = await res.json();
        response = data.choices?.[0]?.message?.content || 'No response from AI coach.';
      } else if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        response = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI coach.';
      } else {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'grok-beta', max_tokens: 300,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const data = await res.json();
        response = data.choices?.[0]?.message?.content || 'No response from AI coach.';
      }

      addLine('system', `🤖 AI Coach (${provider}): ${response}`);
    } catch (err) {
      addLine('error', `⚠️ AI Coach error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAiCoachLoading(false);
    }
  };


  // ─── Main Sandbox Selection Landing Page ───
  if (sandboxSection === null) {
    return (
      <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(135deg, var(--green), var(--blue, #4fa8ff))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🧑‍💻 DevOps Unified CLI Sandbox
          </h1>
          <p style={{ color: 'var(--sub)', fontSize: '14px', maxWidth: '550px', margin: '0 auto' }}>
            A single consolidated home for all hands-on terminal exercises, guided scenarios, and free-practice command simulations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Card 1: Guided Scenarios */}
          <div
            onClick={() => setSandboxSection('scenarios')}
            className="v4-card"
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all .25s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--blue)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(0,0,0,.45)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔀</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Guided Scenarios</h3>
            <p style={{ fontSize: '13px', color: 'var(--sub)', lineHeight: '1.6', marginBottom: '16px' }}>
              Structured step-by-step challenges for Git workflows, Linux File Ops, and Server Diagnostics. Real-time validation.
            </p>
            <span style={{ fontSize: '12px', color: 'var(--blue)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
              Start Scenarios →
            </span>
          </div>

          {/* Card 2: Daily Lab Exercises */}
          <div
            onClick={() => {
              setSandboxSection('labs');
              setActiveLabDk(Object.keys(LABS)[0] || '');
            }}
            className="v4-card"
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all .25s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(0,0,0,.45)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>⌨</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Daily Labs (Days 1–10)</h3>
            <p style={{ fontSize: '13px', color: 'var(--sub)', lineHeight: '1.6', marginBottom: '16px' }}>
              Interactive daily terminal exercises covering Linux basics, processes, grep/sed/awk, SSH, Docker, and Docker Compose.
            </p>
            <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
              Start Daily Labs →
            </span>
          </div>

          {/* Card 3: Free Practice Terminal */}
          <div
            onClick={() => {
              setSandboxSection('free');
              startFreeMode();
            }}
            className="v4-card"
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all .25s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--amber)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(0,0,0,.45)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>🧪</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Free Practice Mode</h3>
            <p style={{ fontSize: '13px', color: 'var(--sub)', lineHeight: '1.6', marginBottom: '16px' }}>
              Open terminal simulator to run any command. Ideal for custom testing with AI Coach guidance.
            </p>
            <span style={{ fontSize: '12px', color: 'var(--amber)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
              Launch Terminal →
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Daily Labs View ───
  if (sandboxSection === 'labs') {
    const activeLab: Lab | undefined = LABS[activeLabDk];
    const done = activeLab ? labDayDone(activeLabDk) : 0;
    const total = activeLab ? activeLab.exercises.length : 0;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const formatTime = (secs: number) => {
      if (secs < 60) return secs + 's';
      return Math.floor(secs / 60) + 'm ' + (secs % 60) + 's';
    };

    return (
      <div className="wrap" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => {
              setSandboxSection(null);
            }}
            style={{
              background: 'var(--s2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'var(--mono)'
            }}
          >
            ← Back to Sandbox Selection
          </button>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
            ⌨ Daily DevOps Labs (Days 1–10)
          </div>
          <div></div>
        </div>

        <div style={{ background: 'rgba(255,200,80,.06)', border: '1px solid rgba(255,200,80,.2)', borderRadius: 'var(--r12)', padding: '11px 13px', marginBottom: '16px', fontSize: '13px', color: 'var(--sub)' }}>
          <strong style={{ color: 'var(--amber)' }}>Note:</strong> For Docker/K8s days, open KillerCoda in a new tab, run commands there, then enter them here to auto-verify.
        </div>

        {/* Lab selectors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
          {Object.keys(LABS).map(dk => {
            const lab = LABS[dk];
            const labDone = labDayDone(dk);
            const labTotal = lab.exercises.length;
            const isComplete = labDone === labTotal && labTotal > 0;
            const isActive = dk === activeLabDk;

            return (
              <button
                key={dk}
                className={`lab-day-btn ${isComplete ? 'lab-day-done' : ''}`}
                style={{
                  background: isActive ? 'var(--s2)' : 'var(--s1)',
                  borderColor: isComplete ? 'var(--green)' : 'var(--border)',
                  color: isComplete ? 'var(--green)' : 'var(--sub)',
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  padding: '5px 11px',
                  borderRadius: 'var(--r8)',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  borderStyle: 'solid',
                  borderWidth: '1px'
                }}
                onClick={() => setActiveLabDk(dk)}
              >
                {lab.day} {labDone > 0 ? `(${labDone}/${labTotal})` : ''}
              </button>
            );
          })}
        </div>

        {/* Active Lab Area */}
        {activeLab && (
          <div id="lab-exercises-area">
            <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '16px 18px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--green)', marginBottom: '3px' }}>
                    {activeLab.day} · {activeLab.type.toUpperCase()} LAB
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{activeLab.title}</div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: done === total && total > 0 ? 'var(--green)' : 'var(--sub)' }}>
                  {done}/{total} done
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--sub)', marginBottom: '10px' }}>{activeLab.intro}</div>
              <div style={{ height: '4px', background: 'var(--s3)', borderRadius: '2px' }}>
                <div style={{ height: '100%', background: 'var(--green)', borderRadius: '2px', width: `${pct}%`, transition: 'width .4s' }}></div>
              </div>

              {/* Docker/K8s playgound links */}
              {(activeLab.type === 'docker' || activeLab.type === 'k8s') && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {activeLab.killercoda && (
                    <a
                      href={activeLab.killercoda}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--amber)', padding: '5px 11px', border: '1px solid rgba(255,200,80,.3)', borderRadius: 'var(--r8)', background: 'rgba(255,200,80,.06)', textDecoration: 'none' }}
                    >
                      🚀 Open KillerCoda Lab →
                    </a>
                  )}
                  {activeLab.playdocker && (
                    <a
                      href={activeLab.playdocker}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--blue)', padding: '5px 11px', border: '1px solid rgba(79,168,255,.3)', borderRadius: 'var(--r8)', background: 'rgba(79,168,255,.06)', textDecoration: 'none' }}
                    >
                      🐳 Play With Docker →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Terminal (for terminal-type labs) */}
            {activeLab.type === 'terminal' && (
              <TerminalSimulator
                dk={activeLabDk}
                lab={activeLab}
                isLabDone={(exId) => isLabDone(activeLabDk, exId)}
                markLabDone={(exId) => markLabDone(activeLabDk, exId)}
                onExercisePassed={() => {
                  const updatedDone = labDayDone(activeLabDk) + 1;
                  if (updatedDone === total) {
                    import('canvas-confetti').then((conf) => {
                      conf.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    });
                  }
                }}
              />
            )}

            {/* Exercise list */}
            {activeLab.exercises.map((ex, idx) => {
              const isExDone = isLabDone(activeLabDk, ex.id);
              return (
                <ExerciseCard
                  key={ex.id}
                  ex={ex}
                  idx={idx}
                  isDone={isExDone}
                  formatTime={formatTime}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── Guided Scenarios List ───
  if (sandboxSection === 'scenarios' && !activeScenario) {
    return (
      <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => {
              setSandboxSection(null);
            }}
            style={{
              background: 'var(--s2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'var(--mono)'
            }}
          >
            ← Back to Sandbox Selection
          </button>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
            🔀 Guided Scenarios
          </div>
          <div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {SCENARIOS.map(sc => (
            <div
              key={sc.id}
              onClick={() => startScenario(sc)}
              style={{
                background: 'var(--s1)',
                border: `1px solid ${completedScenarios[sc.id] ? 'rgba(0,217,160,.4)' : 'var(--border)'}`,
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all .25s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,.3)';
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              {completedScenarios[sc.id] && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,217,160,.15)', color: 'var(--green)', fontSize: '10px', padding: '3px 10px', borderRadius: '12px', fontFamily: 'var(--mono)' }}>
                  ✅ Done
                </div>
              )}
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{sc.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>{sc.title}</div>
              <p style={{ fontSize: '12px', color: 'var(--sub)', lineHeight: '1.5', marginBottom: '12px' }}>{sc.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                  {sc.steps.length} steps
                </span>
                <span style={{ fontSize: '10px', color: 'var(--green)', fontFamily: 'var(--mono)' }}>
                  → Start
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Scenario/Free Terminal View ───
  const progress = activeScenario
    ? Math.round(((currentStep + (currentStep >= activeScenario.steps.length ? 0 : 0)) / activeScenario.steps.length) * 100)
    : 0;

  return (
    <div className="wrap" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <button
          onClick={() => { 
            setActiveScenario(null); 
            setFreeMode(false); 
            setLines([]); 
          }}
          style={{
            background: 'var(--s2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'var(--mono)'
          }}
        >
          ← Back to Selection
        </button>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
          {activeScenario ? `${activeScenario.icon} ${activeScenario.title}` : '🧪 Free Practice'}
        </div>
        <button
          onClick={askAICoach}
          disabled={aiCoachLoading}
          style={{
            background: aiCoachLoading ? 'var(--s2)' : 'linear-gradient(135deg, rgba(192,132,252,.15), rgba(79,168,255,.15))',
            border: '1px solid rgba(192,132,252,.4)',
            color: '#c084fc',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            cursor: aiCoachLoading ? 'wait' : 'pointer',
            fontFamily: 'var(--mono)',
            transition: 'all .2s ease'
          }}
        >
          {aiCoachLoading ? '⏳ Thinking...' : '🤖 Ask AI Coach'}
        </button>
      </div>

      {/* Progress bar for scenarios */}
      {activeScenario && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--sub)', marginBottom: '4px' }}>
            <span>Step {Math.min(currentStep + 1, activeScenario.steps.length)}/{activeScenario.steps.length}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--s2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--green), #4fa8ff)',
              borderRadius: '2px',
              transition: 'width .4s ease'
            }} />
          </div>
        </div>
      )}

      {/* Terminal */}
      <div style={{
        background: '#0d1117',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,.08)',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,.5)'
      }}>
        {/* Title bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'rgba(255,255,255,.04)',
          borderBottom: '1px solid rgba(255,255,255,.06)'
        }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
          <span style={{ marginLeft: '12px', fontSize: '11px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--mono)' }}>
            devops@sandbox:~
          </span>
        </div>

        {/* Output */}
        <div
          ref={termRef}
          onClick={() => inputRef.current?.focus()}
          style={{
            padding: '16px',
            minHeight: '360px',
            maxHeight: 'calc(100vh - 340px)',
            overflowY: 'auto',
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            lineHeight: '1.6',
            cursor: 'text'
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{
              color: line.type === 'input' ? '#e6edf3'
                : line.type === 'success' ? '#3fb950'
                : line.type === 'error' ? '#f85149'
                : line.type === 'system' ? '#8b949e'
                : '#c9d1d9',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {line.text}
            </div>
          ))}

          {/* Input line */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ color: '#3fb950', marginRight: '8px', userSelect: 'none' }}>$</span>
            <input
              ref={inputRef}
              type="text"
              value={cmdInput}
              onChange={e => setCmdInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e6edf3',
                fontFamily: 'var(--mono)',
                fontSize: '13px',
                caretColor: '#3fb950'
              }}
            />
          </form>
        </div>
      </div>

      {/* Quick reference */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['ls', 'cd', 'mkdir', 'git', 'docker', 'kubectl'].map(cmd => (
          <button
            key={cmd}
            onClick={() => setCmdInput(cmd + ' ')}
            style={{
              background: 'var(--s2)',
              border: '1px solid var(--border)',
              color: 'var(--sub)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'var(--mono)',
              cursor: 'pointer',
              transition: 'all .15s ease'
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--green)')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};

interface ExerciseCardProps {
  ex: Exercise;
  idx: number;
  isDone: boolean;
  formatTime: (secs: number) => string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ ex, idx, isDone }) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div
      style={{
        background: 'var(--s1)',
        border: `1px solid ${isDone ? 'rgba(0,217,160,.35)' : 'var(--border)'}`,
        borderRadius: 'var(--r12)',
        padding: '14px 16px',
        marginBottom: '8px',
        transition: 'all .2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: isDone ? 'var(--green)' : 'var(--s3)',
            border: `1.5px solid ${isDone ? 'var(--green)' : 'var(--border)'}`,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            marginTop: '1px'
          }}
        >
          {isDone ? (
            <span style={{ color: '#000', fontWeight: 700 }}>✓</span>
          ) : (
            <span style={{ color: 'var(--sub)' }}>{idx + 1}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              marginBottom: '5px',
              color: isDone ? 'var(--sub)' : 'var(--text)',
              textDecoration: isDone ? 'line-through' : 'none'
            }}
          >
            {ex.prompt}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowHint(!showHint)}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: 'var(--sub)',
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                padding: '3px 9px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showHint ? '🙈 Hide hint' : '💡 Hint'}
            </button>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--amber)' }}>
              +{ex.xp} XP
            </span>
            {isDone && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)' }}>
                {ex.ok}
              </span>
            )}
          </div>
          {showHint && (
            <div
              style={{
                marginTop: '8px',
                background: 'var(--s3)',
                borderRadius: 'var(--r8)',
                padding: '8px 11px',
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                color: 'var(--amber)',
                whiteSpace: 'pre-wrap'
              }}
            >
              {ex.hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
