import { BootcampDay } from '../types';

export const day12: BootcampDay = {
  day: 12,
  title: "Ansible Playbooks & Idempotency",
  subtitle: "Automating server setup configuration using declarative playbooks",
  color: "#a0e040",
  trainerNote: "If you configure a server manually, it's a pet. If you use Ansible, it's cattle. Cattle are replaceable.",
  engineerNote: "Idempotency means you can run the playbook again and again, knowing it only changes what is wrong.",
  goal: {
    icon: "🤖",
    title: "Day 12 Goal",
    description: "Write an Ansible playbook to configure a web server idempotently."
  },
  pdfUrl: "/pdfs/day1.pdf",
  images: [
    {
      url: "/images/git_workflows_chart.png",
      caption: "Ansible server provisioning model"
    }
  ]
};
