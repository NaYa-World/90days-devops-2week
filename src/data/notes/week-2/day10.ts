import { BootcampDay } from '../types';

export const day10: BootcampDay = {
  day: 10,
  title: "Secrets & Environment Variables",
  subtitle: "Harden your configuration by separating secrets from code using systemd EnvironmentFile",
  color: "#ff9f43",
  trainerNote: "Never, under any circumstances, push a secret to a public repo. If you do, assume it was compromised within 30 seconds.",
  engineerNote: "We load secrets via systemd EnvironmentFile, keeping permissions locked at 600. Keep it local, keep it safe.",
  goal: {
    icon: "🔐",
    title: "Day 10 Goal",
    description: "Harden your application by moving API keys to an EnvironmentFile and configuring proper file permissions."
  },
  pdfUrl: "/pdfs/day1.pdf",
  images: [
    {
      url: "/images/linux_permissions_chart.png",
      caption: "Securing secrets and local environment variables"
    }
  ]
};
