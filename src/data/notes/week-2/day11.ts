import { BootcampDay } from '../types';

export const day11: BootcampDay = {
  day: 11,
  title: "Performance Audits & Slow Code",
  subtitle: "Profiling CPU, memory, and disk usage to find bottlenecks",
  color: "#20c997",
  trainerNote: "When a server is slow, don't guess. Use measurements. Top, free, iostat are your best friends.",
  engineerNote: "Most performance issues are due to database queries. Check your database slow logs first.",
  goal: {
    icon: "📈",
    title: "Day 11 Goal",
    description: "Use top, free, and iostat to audit server resources and profile application code."
  },
  pdfUrl: "/pdfs/day2.pdf",
  images: [
    {
      url: "/images/linux_permissions_chart.png",
      caption: "Resource profiling and bottleneck discovery"
    }
  ]
};
