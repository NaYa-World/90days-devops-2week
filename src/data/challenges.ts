export interface ChallengeQuestion {
  weekday: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const CHALLENGES: ChallengeQuestion[] = [
  {
    weekday: 1,
    question: "Which file format is most commonly used for writing Kubernetes manifests and Ansible playbooks?",
    options: ["JSON", "XML", "YAML", "TOML"],
    answerIndex: 2,
    explanation: "YAML (Yet Another Markup Language) is the industry standard for Kubernetes manifests, Ansible playbooks, and many CI/CD pipelines due to its readability."
  },
  {
    weekday: 2,
    question: "In Git, which command allows you to save your uncommitted changes temporarily and revert back to a clean working directory?",
    options: ["git reset --hard", "git stash", "git checkout", "git clean"],
    answerIndex: 1,
    explanation: "git stash shelves your local modifications so you can work on something else, and you can re-apply them later with git stash pop."
  },
  {
    weekday: 3,
    question: "Which Docker instruction specifies the default command to execute when a container starts, but can be overridden by command-line arguments?",
    options: ["ENTRYPOINT", "RUN", "CMD", "EXPOSE"],
    answerIndex: 2,
    explanation: "CMD defines the default execution command for a container. If the user specifies arguments on docker run, CMD is completely overridden, whereas ENTRYPOINT is not."
  },
  {
    weekday: 4,
    question: "What is the primary purpose of a CI/CD pipeline stage called 'Linting'?",
    options: ["Running load tests", "Analyzing code for programmatic and stylistic errors", "Deploying code to staging", "Compiling code into binaries"],
    answerIndex: 1,
    explanation: "Linting is static code analysis that flags syntax, stylistic, and potential runtime errors before the code is compiled or run."
  },
  {
    weekday: 5,
    question: "Which Kubernetes resource is typically used to expose a set of Pods as a network service, providing a stable IP address and DNS name?",
    options: ["Service", "Ingress", "ConfigMap", "Deployment"],
    answerIndex: 0,
    explanation: "A Kubernetes Service defines a logical set of Pods and a policy by which to access them, ensuring clients have a stable endpoint even as Pods are rescheduled."
  },
  {
    weekday: 6,
    question: "Which of the following describes an SSH key pair used for secure authentication?",
    options: ["Both private and public keys are shared with the server", "The private key stays on your local machine; the public key is placed on the server", "The public key stays on your local machine; the private key is placed on the server", "Only a single shared key is used for both encryption and decryption"],
    answerIndex: 1,
    explanation: "SSH uses asymmetric cryptography: your private key remains strictly on your local machine, and your public key is added to authorized_keys on the remote server."
  },
  {
    weekday: 7,
    question: "In continuous integration, what does the term 'Idempotency' mean regarding deployment or automation scripts?",
    options: ["The script runs faster each time it is executed", "The script can run multiple times without changing the result beyond the initial application", "The script must only be run once; subsequent runs will fail", "The script runs concurrently on multiple nodes without locking"],
    answerIndex: 1,
    explanation: "Idempotency means that applying an operation multiple times has the same outcome as applying it once, which is a core principle in DevOps and Infrastructure as Code (IaC)."
  }
];
