import { BootcampDay } from '../types';

export const day13: BootcampDay = {
  day: 13,
  title: "Server Hardening & Fail2ban",
  subtitle: "Basic Linux security audits, blocking port scans, and locking down SSH",
  color: "#f05060",
  trainerNote: "Assume every server is under continuous scan. Hardening isn't a post-launch chore; it's a first-day requirement.",
  engineerNote: "A default-deny firewall and key-only authentication will stop 99.9% of scans. Fail2ban stops the rest.",
  goal: {
    icon: "🛡️",
    title: "Day 13 Goal",
    description: "Harden your SSH service, disable password auth, and configure Fail2ban to automatically block brute-force scanners."
  },
  pdfUrl: "/pdfs/day2.pdf",
  images: [
    {
      url: "/images/linux_permissions_chart.png",
      caption: "Server security and brute force mitigation"
    }
  ]
};
