import { BootcampDay } from '../types';

export const day4_1: BootcampDay = {
  day: 4.1,
  title: "BASH SCRIPTING DEPTH",
  subtitle: "Variables · Conditionals · Loops · Functions · Error Handling · Cron",
  color: "#f0c040",
  trainerNote: "This trips up everyone from Python/JS background — spaces matter differently in Bash.",
  engineerNote: "I've seen missing quotes delete production data. Quote every variable, every time.",
  goal: {
    icon: "🎯",
    title: "Day 4.1 Goal",
    description: "By end of Day 4.1 you can write bash scripts that use variables, conditionals, loops, and functions — and handle errors without panicking. You will build a health_check.sh script that monitors your EC2 and logs results. This is the kind of script that runs on cron in production every 5 minutes."
  },
  schedule: [
    {
      time: "09:00–09:20",
      phase: "RECALL",
      activity: "Day 3 cold review",
      why: "From memory: launch EC2 CLI, open port 80, install nginx. If you can't do this without notes, you haven't consolidated — spend 30 mins drilling Day 3 commands before Bash."
    },
    {
      time: "09:20–10:30",
      phase: "THEORY",
      activity: "Bash mental model",
      why: "Variables, quoting rules (single vs double), exit codes, the $? variable, why scripts fail silently without set -e. Every concept explained with a real scenario."
    },
    {
      time: "10:30–10:45",
      phase: "BREAK",
      activity: "15 min away from screen",
      why: ""
    },
    {
      time: "10:45–12:30",
      phase: "HANDS-ON",
      activity: "Conditionals + Loops on EC2",
      why: "Type every example. Then intentionally break them — wrong brackets, missing quotes, wrong operator. Read every error message before fixing."
    },
    {
      time: "12:30–13:15",
      phase: "BREAK",
      activity: "Lunch — no passive learning",
      why: ""
    },
    {
      time: "13:15–14:30",
      phase: "HANDS-ON",
      activity: "Functions + Error Handling + set -euo pipefail",
      why: "Functions let you write reusable blocks. Error handling is what makes scripts safe to run in production. A script without error handling is a liability."
    },
    {
      time: "14:30–15:30",
      phase: "HANDS-ON",
      activity: "Cron jobs on EC2",
      why: "Schedule scripts to run automatically. This is how monitoring, backups, and maintenance work in real systems. Build cron syntax from scratch — don't copy it."
    },
    {
      time: "15:30–15:45",
      phase: "BREAK",
      activity: "Break",
      why: ""
    },
    {
      time: "15:45–16:45",
      phase: "PROJECT",
      activity: "health_check.sh — build and schedule it",
      why: "Full script: checks disk, RAM, nginx status, writes timestamped log. Cron it. This is your first \"always-running\" automation."
    },
    {
      time: "16:45–17:00",
      phase: "COMMIT",
      activity: "Commit + push + write Day 4.1 notes",
      why: ""
    }
  ],
  concepts: [
    {
      icon: "💲",
      title: "Variables + Quoting",
      description: "Variables store values. NAME=\"ubuntu\". Always double-quote variables: \"$NAME\". Without quotes, a variable with spaces breaks your script silently.",
      analogy: "Why it matters: A path with a space, like /home/my user/, kills scripts that don't quote variables. This causes real outages."
    },
    {
      icon: "🔀",
      title: "Exit Codes + $?",
      description: "Every Linux command returns a number when it finishes. 0 = success. Anything else = failure. $? holds the last command's exit code. Scripts check this to decide what to do next.",
      analogy: "Why it matters: Your scripts must know if a step succeeded. Blindly continuing after a failed command creates corrupted state."
    },
    {
      icon: "🛡",
      title: "set -euo pipefail",
      description: "set -e: exit on any error. set -u: exit if undefined variable used. set -o pipefail: fail if any part of a pipe fails. This trio is on line 2 of every professional bash script.",
      analogy: "Why it matters: Without these, a bash script will happily continue past failures, compounding damage. Always use them."
    },
    {
      icon: "🔁",
      title: "Loops (for / while)",
      description: "for iterates over a list. while runs until a condition is false. These let you automate repetitive tasks — processing multiple files, retrying failed operations, scanning lists of servers.",
      analogy: "Why it matters: The same script that manages 1 server manages 100 with a loop. Scalability is built into bash from the start."
    },
    {
      icon: "🧩",
      title: "Functions",
      description: "Functions group reusable logic. function log_info() { echo \"[INFO] $1\"; }. Call it with log_info \"Starting\". DRY — Don't Repeat Yourself — is as important in shell scripts as in code.",
      analogy: "Why it matters: A 200-line script without functions is unreadable and unmaintainable. Employers check your script quality."
    },
    {
      icon: "⏰",
      title: "Cron — Scheduled Automation",
      description: "Cron runs scripts on a schedule. crontab -e opens the cron editor. The format is: minute hour day month weekday command. */5 * * * * /script.sh runs every 5 minutes.",
      analogy: "Why it matters: Every production system has cron jobs — health checks, log rotation, backups, cleanup. This is fundamental infrastructure automation."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 3,
      sessionTitle: "Variables, Quoting, Exit Codes",
      sections: [
        {
          label: "Variables — Declare and Reference",
          lines: [
            { type: "cmd", prompt: "$", text: "NAME=\"DevOps-Learner\"" },
            { type: "cmd", prompt: "$", text: "echo \"Hello $NAME\"" },
            { type: "ok", text: "Hello DevOps-Learner" },
            { type: "cmd", prompt: "$", text: "echo 'Hello $NAME'" },
            { type: "comment", text: "Single quotes = no variable expansion" },
            { type: "output", text: "Hello $NAME" },
            { type: "cmd", prompt: "$", text: "MY_DATE=$(date +%Y-%m-%d)" },
            { type: "comment", text: "Command substitution — store output" },
            { type: "cmd", prompt: "$", text: "echo \"Today is: $MY_DATE\"" },
            { type: "ok", text: "Today is: 2026-06-05" },
            { type: "cmd", prompt: "$", text: "readonly MAX_RETRY=3" },
            { type: "comment", text: "Constant — cannot be changed later" },
            { type: "cmd", prompt: "$", text: "MAX_RETRY=5" },
            { type: "err", text: "bash: MAX_RETRY: readonly variable" },
            { type: "comment", text: "This error is correct — readonly variables are protected" }
          ]
        },
        {
          label: "Exit Codes — Understanding Success and Failure",
          lines: [
            { type: "cmd", prompt: "$", text: "ls /tmp" },
            { type: "cmd", prompt: "$", text: "echo \"Exit code: $?\"" },
            { type: "ok", text: "Exit code: 0" },
            { type: "cmd", prompt: "$", text: "ls /nonexistent_directory" },
            { type: "err", text: "ls: cannot access '/nonexistent_directory': No such file or directory" },
            { type: "cmd", prompt: "$", text: "echo \"Exit code: $?\"" },
            { type: "err", text: "Exit code: 2" },
            { type: "comment", text: "Non-zero = failure. Your scripts must check this." },
            { type: "cmd", prompt: "$", text: "cat /etc/passwd | grep \"ubuntu\" && echo \"User found\" || echo \"User not found\"" },
            { type: "ok", text: "ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash" },
            { type: "ok", text: "User found" },
            { type: "comment", text: "&& runs if left side succeeds. || runs if left side fails." }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 3,
      sessionTitle: "Conditionals + Loops",
      sections: [
        {
          label: "Conditionals — Making Decisions",
          lines: [
            { type: "cmd", prompt: "$", text: "nano ~/test_cond.sh" },
            { type: "comment", text: "Type the following inside nano:" },
            { type: "output", text: "#!/bin/bash" },
            { type: "output", text: "set -euo pipefail" },
            { type: "output", text: "DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')" },
            { type: "comment", text: "awk extracts column 5 (use%). tr -d removes the % sign" },
            { type: "output", text: "if [ \"$DISK_USAGE\" -gt 80 ]; then" },
            { type: "output", text: " echo \"WARNING: Disk usage is ${DISK_USAGE}% — investigate\"" },
            { type: "output", text: "elif [ \"$DISK_USAGE\" -gt 60 ]; then" },
            { type: "output", text: " echo \"NOTICE: Disk usage is ${DISK_USAGE}% — watch this\"" },
            { type: "output", text: "else" },
            { type: "output", text: " echo \"OK: Disk usage is ${DISK_USAGE}%\"" },
            { type: "output", text: "fi" },
            { type: "comment", text: "Ctrl+X, Y, Enter" },
            { type: "cmd", prompt: "$", text: "chmod +x ~/test_cond.sh && bash ~/test_cond.sh" },
            { type: "ok", text: "OK: Disk usage is 18%" }
          ]
        },
        {
          label: "Comparison Operators — Critical Reference",
          lines: [
            { type: "comment", text: "INTEGER comparisons (numbers only):" },
            { type: "output", text: "-eq (equal) -ne (not equal)" },
            { type: "output", text: "-gt (greater than) -lt (less than)" },
            { type: "output", text: "-ge (>=) -le (<=)" },
            { type: "comment", text: "STRING comparisons:" },
            { type: "output", text: "= (equal strings) != (not equal)" },
            { type: "output", text: "-z (string is empty) -n (string is not empty)" },
            { type: "comment", text: "FILE checks:" },
            { type: "output", text: "-f (file exists) -d (directory exists)" },
            { type: "output", text: "-r (readable) -w (writable) -x (executable)" }
          ]
        },
        {
          label: "Loops — for and while",
          lines: [
            { type: "comment", text: "FOR loop — iterate over a list" },
            { type: "cmd", prompt: "$", text: "for SERVICE in nginx ssh cron; do" },
            { type: "cmd", prompt: " ", text: "STATUS=$(systemctl is-active \"$SERVICE\" 2>/dev/null || echo \"inactive\")" },
            { type: "cmd", prompt: " ", text: "echo \"$SERVICE: $STATUS\"" },
            { type: "cmd", prompt: " ", text: "done" },
            { type: "ok", text: "nginx: active" },
            { type: "ok", text: "ssh: active" },
            { type: "ok", text: "cron: active" },
            { type: "comment", text: "FOR loop — iterate over files" },
            { type: "cmd", prompt: "$", text: "for LOG in /var/log/*.log; do" },
            { type: "cmd", prompt: " ", text: "SIZE=$(du -sh \"$LOG\" | cut -f1)" },
            { type: "cmd", prompt: " ", text: "echo \"$SIZE $LOG\"" },
            { type: "cmd", prompt: " ", text: "done" },
            { type: "output", text: "4.0K /var/log/auth.log" },
            { type: "output", text: "20K /var/log/syslog" },
            { type: "comment", text: "WHILE loop — retry with countdown" },
            { type: "cmd", prompt: "$", text: "RETRIES=0; MAX=3" },
            { type: "cmd", prompt: "$", text: "while [ $RETRIES -lt $MAX ]; do" },
            { type: "cmd", prompt: " ", text: "echo \"Attempt $((RETRIES+1)) of $MAX...\"" },
            { type: "cmd", prompt: " ", text: "RETRIES=$((RETRIES+1))" },
            { type: "cmd", prompt: " ", text: "sleep 1" },
            { type: "cmd", prompt: " ", text: "done" },
            { type: "output", text: "Attempt 1 of 3..." },
            { type: "output", text: "Attempt 2 of 3..." },
            { type: "output", text: "Attempt 3 of 3..." }
          ]
        }
      ]
    },
    {
      sessionNumber: 3,
      totalSessions: 3,
      sessionTitle: "Functions + Cron",
      sections: [
        {
          label: "Functions — Write Once, Call Many Times",
          lines: [
            { type: "comment", text: "Functions go at TOP of script, before they're called" },
            { type: "cmd", prompt: "$", text: "nano ~/test_functions.sh" },
            { type: "output", text: "#!/bin/bash" },
            { type: "output", text: "set -euo pipefail" },
            { type: "output", text: "LOG_FILE=\"/tmp/test.log\"" },
            { type: "output", text: "function log() {" },
            { type: "comment", text: "local = variable only exists inside this function" },
            { type: "output", text: " local LEVEL=\"$1\"" },
            { type: "output", text: " local MSG=\"$2\"" },
            { type: "output", text: " echo \"[$(date '+%Y-%m-%d %H:%M:%S')] [$LEVEL] $MSG\" | tee -a \"$LOG_FILE\"" },
            { type: "comment", text: "tee writes to stdout AND appends to log file simultaneously" },
            { type: "output", text: "}" },
            { type: "output", text: "function check_service() {" },
            { type: "output", text: " local SVC=\"$1\"" },
            { type: "output", text: " if systemctl is-active --quiet \"$SVC\"; then" },
            { type: "output", text: " log \"OK\" \"$SVC is running\"" },
            { type: "output", text: " return 0" },
            { type: "output", text: " else" },
            { type: "output", text: " log \"ERROR\" \"$SVC is NOT running — attempting restart\"" },
            { type: "output", text: " sudo systemctl start \"$SVC\" || log \"CRITICAL\" \"Could not start $SVC\"" },
            { type: "output", text: " return 1" },
            { type: "output", text: " fi" },
            { type: "output", text: "}" },
            { type: "output", text: "log \"INFO\" \"Starting service check\"" },
            { type: "output", text: "check_service \"nginx\"" },
            { type: "output", text: "check_service \"ssh\"" },
            { type: "output", text: "log \"INFO\" \"Check complete\"" },
            { type: "cmd", prompt: "$", text: "chmod +x ~/test_functions.sh && bash ~/test_functions.sh" },
            { type: "ok", text: "[2026-06-05 14:30:01] [OK] nginx is running" },
            { type: "ok", text: "[2026-06-05 14:30:01] [OK] ssh is running" },
            { type: "ok", text: "[2026-06-05 14:30:01] [INFO] Check complete" }
          ]
        },
        {
          label: "Cron — Schedule Automation",
          lines: [
            { type: "cmd", prompt: "$", text: "crontab -l" },
            { type: "comment", text: "List existing cron jobs (empty if new)" },
            { type: "output", text: "no crontab for ubuntu" },
            { type: "cmd", prompt: "$", text: "crontab -e" },
            { type: "comment", text: "Opens editor (choose nano if asked)" },
            { type: "comment", text: "Cron format: minute hour day_of_month month day_of_week command" },
            { type: "comment", text: "* = any value */5 = every 5 1-5 = range 1,3 = list" },
            { type: "comment", text: "Add this line to run health check every 5 minutes:" },
            { type: "output", text: "*/5 * * * * /home/ubuntu/scripts/health_check.sh >> /home/ubuntu/logs/health.log 2>&1" },
            { type: "comment", text: "2>&1 = redirect stderr to stdout — captures ALL output, including errors" },
            { type: "cmd", prompt: "$", text: "crontab -l" },
            { type: "ok", text: "*/5 * * * * /home/ubuntu/scripts/health_check.sh >> /home/ubuntu/logs/health.log 2>&1" },
            { type: "cmd", prompt: "$", text: "sudo grep CRON /var/log/syslog | tail -5" },
            { type: "comment", text: "Verify cron ran" },
            { type: "output", text: "Jun 5 14:35:01 ip-172-31 CRON[4521]: (ubuntu) CMD (/home/ubuntu/scripts/health_check.sh)" }
          ]
        }
      ],
      expectedOutput: {
        label: "✅ Expected State After Day 4.1 Commands",
        text: "You can write a bash script with variables, conditionals, loops, functions, and error handling from scratch. You have a script scheduled in cron that runs automatically every 5 minutes. The log file in ~/logs/ grows over time with timestamped entries — check it in the morning."
      }
    }
  ],
  debugTrees: [
    {
      title: "⚡ Script Fails or Does Nothing — Systematic Diagnosis",
      steps: [
        {
          num: 1,
          title: "Always run with bash -x first — shows every line as it executes",
          description: "This is the single most powerful bash debugging tool.",
          cmd: "bash -x /path/to/your/script.sh"
        },
        {
          num: 2,
          title: "Check shebang line — is it correct?",
          description: "Line 1 must be #!/bin/bash. If missing, Linux uses sh which has different syntax.",
          cmd: "head -1 script.sh"
        },
        {
          num: 3,
          title: "Check execute permission",
          cmd: "ls -la script.sh → chmod +x script.sh"
        },
        {
          num: 4,
          title: "shellcheck — automated syntax checker",
          description: "Catches missing quotes, wrong operators, style issues before you even run.",
          cmd: "sudo apt install shellcheck -y && shellcheck script.sh"
        }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Spaces around the = in variable assignment",
      description: "NAME = \"ubuntu\" causes a \"command not found\" error. Bash sees \"NAME\" as a command, not an assignment. No spaces allowed around = in variable assignment.",
      fix: "Fix: NAME=\"ubuntu\" (no spaces, ever)"
    },
    {
      mistake: "Not quoting variables — especially paths",
      description: "rm -rf $DIR where $DIR=\"/my project\" becomes rm -rf /my project — deletes two separate paths. If $DIR is empty it becomes rm -rf — catastrophic.",
      fix: "Fix: Always: rm -rf \"$DIR\" (double quotes wrap the whole value)"
    },
    {
      mistake: "Using relative paths in cron jobs",
      description: "Cron runs in a minimal environment without your normal PATH. A script that works from your terminal fails in cron because it can't find commands like aws or docker.",
      fix: "Fix: Use full paths in cron: /usr/bin/aws, /usr/local/bin/docker. Or add PATH=/usr/bin:/usr/local/bin at top of crontab."
    },
    {
      mistake: "Not redirecting stderr in cron (2>&1)",
      description: "Without 2>&1, error output from cron jobs is silently discarded. You have no idea why something failed.",
      fix: "Fix: Always append both stdout and stderr to log: >> /path/to/script.log 2>&1"
    }
  ],
  project: {
    tag: "📁 Day 4.1 Mini Project",
    title: "health_check.sh — Production-Grade Monitoring Script",
    timeEstimate: "⏱ ~75 min",
    goal: "A script that checks your EC2's health (disk, RAM, CPU, services) every 5 minutes via cron, writes a timestamped log, and sends a different exit code for healthy vs critical state.",
    checklist: [
      "Script lives at ~/scripts/health_check.sh, log at ~/logs/health.log",
      "Uses set -euo pipefail on line 2",
      "Contains a reusable log() function that timestamps every message",
      "Checks disk usage — warns above 70%, CRITICAL above 90%",
      "Checks available RAM — warns if less than 200MB free",
      "Checks nginx and ssh service status — attempts restart on failure",
      "Exits with code 0 (healthy) or 1 (problem found)",
      "Scheduled in crontab to run every 5 minutes",
      "After scheduling, verify it ran: check syslog and log file after 5 minutes",
      "Commit to GitHub: feat: Add EC2 health monitoring script with cron schedule"
    ],
    codeBlock: {
      title: "health_check.sh — Full Script (Build This)",
      lines: [
        "#!/bin/bash",
        "set -euo pipefail",
        "",
        "###############################################",
        "# health_check.sh — EC2 System Health Monitor",
        "# Runs via cron every 5 minutes",
        "###############################################",
        "",
        "LOG_FILE=\"${HOME}/logs/health.log\"",
        "DISK_WARN=70",
        "DISK_CRIT=90",
        "RAM_WARN_MB=200",
        "HEALTHY=0",
        "PROBLEMS=0",
        "",
        "mkdir -p \"${HOME}/logs\"",
        "",
        "function log() {",
        " echo \"[$(date '+%Y-%m-%d %H:%M:%S')] [$1] $2\" | tee -a \"$LOG_FILE\"",
        "}",
        "",
        "function check_disk() {",
        " local USAGE",
        " USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')",
        " if [ \"$USAGE\" -ge \"$DISK_CRIT\" ]; then",
        " log \"CRITICAL\" \"Disk usage: ${USAGE}% — exceeds ${DISK_CRIT}% threshold\"",
        " PROBLEMS=$((PROBLEMS+1))",
        " elif [ \"$USAGE\" -ge \"$DISK_WARN\" ]; then",
        " log \"WARN\" \"Disk usage: ${USAGE}% — above ${DISK_WARN}% warning\"",
        " else",
        " log \"OK\" \"Disk usage: ${USAGE}%\"",
        " fi",
        "}",
        "",
        "function check_ram() {",
        " local FREE_MB",
        " FREE_MB=$(free -m | awk 'NR==2 {print $4}')",
        " if [ \"$FREE_MB\" -lt \"$RAM_WARN_MB\" ]; then",
        " log \"WARN\" \"Low RAM: ${FREE_MB}MB free — below ${RAM_WARN_MB}MB threshold\"",
        " PROBLEMS=$((PROBLEMS+1))",
        " else",
        " log \"OK\" \"RAM: ${FREE_MB}MB free\"",
        " fi",
        "}",
        "",
        "function check_service() {",
        " local SVC=\"$1\"",
        " if systemctl is-active --quiet \"$SVC\"; then",
        " log \"OK\" \"Service ${SVC}: running\"",
        " else",
        " log \"ERROR\" \"Service ${SVC}: DOWN — attempting restart\"",
        " sudo systemctl start \"$SVC\" && log \"OK\" \"Restarted ${SVC}\" || {",
        " log \"CRITICAL\" \"Cannot restart ${SVC} — manual intervention needed\"",
        " PROBLEMS=$((PROBLEMS+1))",
        " }",
        " fi",
        "}",
        "",
        "log \"INFO\" \"=== Health check started ===\"",
        "check_disk",
        "check_ram",
        "check_service \"nginx\"",
        "check_service \"ssh\"",
        "",
        "if [ \"$PROBLEMS\" -eq 0 ]; then",
        " log \"INFO\" \"=== All checks passed ===\"",
        " exit 0",
        "else",
        " log \"WARN\" \"=== $PROBLEMS problem(s) found ===\"",
        " exit 1",
        "fi"
      ]
    },
    expectedOutput: "[2026-06-05 14:35:02] [INFO] === Health check started ===\n[2026-06-05 14:35:02] [OK] Disk usage: 18%\n[2026-06-05 14:35:02] [OK] RAM: 842MB free\n[2026-06-05 14:35:02] [OK] Service nginx: running\n[2026-06-05 14:35:02] [OK] Service ssh: running\n[2026-06-05 14:35:02] [INFO] === All checks passed ==="
  },
  interview: [
    {
      question: "Walk me through a bash script you've written.",
      answer: "I built a health monitoring script that runs every 5 minutes via cron on an EC2 instance. It checks disk usage, available RAM, and verifies that nginx and SSH are running. Each check calls a reusable log function that timestamps and writes to a log file simultaneously using tee. If a service is down, the script attempts a restart and logs the result. The script uses set -euo pipefail so any unexpected failure exits immediately rather than continuing in an unknown state. It exits with code 0 if all checks pass, 1 if any problems were found — which means a monitoring system could call this script and interpret the exit code."
    },
    {
      question: "What does set -euo pipefail do and why use it?",
      answer: "These are three shell options that make scripts safer. set -e exits the script immediately if any command returns a non-zero exit code — prevents blindly continuing after a failure. set -u causes the script to exit if any undefined variable is referenced — catches typos in variable names. set -o pipefail makes a pipeline fail if any command in the pipe fails, not just the last one. Without pipefail, cat file | process_data could fail silently if 'cat' failed because only the exit code of 'process_data' would be checked. Together these three turn bash from a lenient interpreter into something that behaves predictably in production."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "What is wrong with this line? NAME = \"ubuntu\"",
      options: [
        { text: "A) Should use single quotes not double", isCorrect: false },
        { text: "B) Spaces around = are not allowed in bash variable assignment", isCorrect: true },
        { text: "C) Variable names cannot contain uppercase", isCorrect: false },
        { text: "D) Nothing is wrong", isCorrect: false }
      ],
      explanation: "Bash interprets NAME as a command, not a variable name. Commands don't use = for assignment — that's a bash-specific rule. This causes \"command not found: NAME\" which confuses everyone from other languages."
    },
    {
      num: 2,
      question: "Your cron job runs fine from the terminal but fails silently in cron. Most likely reason?",
      options: [
        { text: "A) Cron only runs root scripts", isCorrect: false },
        { text: "B) The script has a syntax error", isCorrect: false },
        { text: "C) Commands like 'aws' or 'docker' use relative paths not available in cron's environment", isCorrect: true },
        { text: "D) Cron doesn't support bash scripts", isCorrect: false }
      ],
      explanation: "Cron has a minimal environment with a stripped-down PATH. /usr/local/bin where tools like aws-cli live may not be included. Fix: use full paths (/usr/local/bin/aws) or add PATH=/usr/bin:/usr/local/bin at top of the crontab file."
    },
    {
      num: 3,
      question: "What does 2>&1 do in this cron line: */5 * * * * /script.sh >> /log.log 2>&1",
      options: [
        { text: "A) Runs the script twice", isCorrect: false },
        { text: "B) Sends output to two files", isCorrect: false },
        { text: "C) Redirects stderr (error output) to the same place as stdout (the log file)", isCorrect: true },
        { text: "D) Suppresses all output", isCorrect: false }
      ],
      explanation: "2 = file descriptor for stderr. 1 = file descriptor for stdout. 2>&1 merges stderr into stdout. Without it, error messages are discarded in cron — you'd never know why a cron job failed. Always use 2>&1 in production cron lines."
    },
    {
      num: 4,
      question: "Which comparison operator checks if integer A is greater than integer B in bash?",
      options: [
        { text: "A) A > B", isCorrect: false },
        { text: "B) A == B", isCorrect: false },
        { text: "C) [ \"$A\" -gt \"$B\" ]", isCorrect: true },
        { text: "D) (( A > B )) is the only valid way", isCorrect: false }
      ],
      explanation: "-gt is the bash integer greater-than operator. A > B works too in (( )) arithmetic context, but inside [ ] you need -gt. Using > inside [ ] redirects output, it doesn't compare — a subtle and dangerous mistake."
    },
    {
      num: 5,
      question: "What is the most important first step when debugging a failing bash script?",
      options: [
        { text: "A) Rewrite it from scratch", isCorrect: false },
        { text: "B) Add echo \"debug\" everywhere", isCorrect: false },
        { text: "C) Run with bash -x to see each command as it executes", isCorrect: true },
        { text: "D) Google the error immediately", isCorrect: false }
      ],
      explanation: "bash -x prints each command with a + prefix before executing it, showing exactly what bash is doing and what values variables hold at each step. This takes 2 seconds and gives you the answer in 90% of cases. Always try this before anything else."
    }
  ],
  github: {
    filename: "devops-90days/day-04/README.md",
    commitMessage: "docs: Add Day 04 notes — Bash scripting and cron automation",
    template: `# Day 04 — Bash Scripting + Cron Automation
**Date:** YYYY-MM-DD | **Difficulty:** Medium | **Status:** ✅ Complete

---

## 🎯 What I Built Today
- health_check.sh: monitors disk, RAM, and services with timestamped logging
- Cron job: runs health_check.sh every 5 minutes automatically
- Learned set -euo pipefail and why scripts explode without it

## ⌨️ Key Commands

\`\`\`bash
# Run script with debug trace
bash -x script.sh

# Validate syntax without running
shellcheck script.sh

# Edit cron jobs
crontab -e   # edit
crontab -l   # list
crontab -r   # CAREFUL: removes ALL your cron jobs

# Critical cron format
*/5 * * * * /full/path/script.sh >> /full/path/log.log 2>&1

# Verify cron ran
sudo grep CRON /var/log/syslog | tail -10
\`\`\`

## 🔑 Bash Patterns I Now Use

\`\`\`bash
# Top of every script
#!/bin/bash
set -euo pipefail

# Logging function
function log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$1] $2" | tee -a "$LOG_FILE"; }

# Safe variable default
VALUE="\${MY_VAR:-default_if_empty}"

# Check before acting
[ -f "$FILE" ] && process_file "$FILE"
\`\`\`

## 🐛 Errors I Hit
| Error | Root Cause | Fix |
|-------|-----------|-----|
| [your error] | | |

## 📈 Tomorrow — Day 5
IAM deep-dive: policies, roles, least-privilege. S3: buckets, versioning, bucket policies vs IAM policies.`
  }
};
