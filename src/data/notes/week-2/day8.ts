import { BootcampDay } from '../types';

export const day8: BootcampDay = {
  day: 8,
  title: "Bare Git Repos & Git Hooks",
  subtitle: "Setting up a simple, lightweight CI/CD pipeline on-server with git hooks",
  color: "#4fa8ff",
  trainerNote: "Automating deployment is the first major step to showing you can operate like a DevOps engineer, not just a sysadmin.",
  engineerNote: "A simple post-receive hook is extremely stable and requires 0 extra server memory. Great for bootstrapped startups.",
  goal: {
    icon: "🌿",
    title: "Day 8 Goal",
    description: "Set up a git bare repository on your EC2 and write a post-receive hook to auto-deploy your application on push."
  },
  pdfUrl: "/pdfs/day1.pdf",
  images: [
    {
      url: "/images/git_workflows_chart.png",
      caption: "Git post-receive hook deployment cycle"
    }
  ]
};
