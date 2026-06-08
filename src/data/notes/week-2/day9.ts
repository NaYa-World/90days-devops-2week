import { BootcampDay } from '../types';

export const day9: BootcampDay = {
  day: 9,
  title: "Symlinked Releases & Rollbacks",
  subtitle: "Deploying code safely by versioning directories and switching symlinks",
  color: "#e040fb",
  trainerNote: "Rollback capability is the difference between an amateur and a professional. If you can rollback in under a minute, you sleep better.",
  engineerNote: "Using symlinks for releases is the engine behind tools like Capistrano. It makes deployments and rollbacks near-instant.",
  goal: {
    icon: "↩️",
    title: "Day 9 Goal",
    description: "Implement a versioned release directory layout with symlinks to allow sub-30-second rollbacks."
  },
  pdfUrl: "/pdfs/day2.pdf",
  images: [
    {
      url: "/images/git_workflows_chart.png",
      caption: "Symlinked release and rollback mechanism"
    }
  ]
};
