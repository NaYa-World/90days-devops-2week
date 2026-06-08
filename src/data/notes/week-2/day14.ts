import { BootcampDay } from '../types';

export const day14: BootcampDay = {
  day: 14,
  title: "Week 2 Review & Capstone",
  subtitle: "Deploying a fully automated, secure, and monitored server stack from scratch",
  color: "#00d9a0",
  trainerNote: "This project brings everything together. If you can do this from memory or a single playbook, you have Week 2 locked down.",
  engineerNote: "A proper runbook or playbook is the only way to manage more than one server. Keep it versioned and clean.",
  goal: {
    icon: "🏆",
    title: "Day 14 Goal",
    description: "Deploy a fresh EC2 server using your Ansible playbook and verify automated git push deploys, SSL, and hardened SSH configs."
  },
  pdfUrl: "/pdfs/day1.pdf",
  images: [
    {
      url: "/images/linux_permissions_chart.png",
      caption: "Day 14 review - Server Hardening Verification"
    },
    {
      url: "/images/git_workflows_chart.png",
      caption: "Day 14 review - Auto Deployment Validation"
    }
  ]
};
