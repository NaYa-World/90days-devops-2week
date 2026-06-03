import React, { useState, useEffect, useCallback } from 'react';
import { showToast } from '../components/Toast';
import { UseAppStateReturnType } from '../hooks/useAppState';
import days from '../data/notes';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { InteractiveDiagram } from '../components/InteractiveDiagram';
import { devopsRoadmapMindmap, cicdPipelineDiagram } from '../data/diagrams';
import {
  ScheduleTable,
  ConceptCards,
  TerminalBlock,
  DebugFlow,
  MistakesBlock,
  MiniProjectBlock,
  InterviewPrep,
  InteractiveQuiz,
  GithubTemplateBlock
} from '../components/BootcampComponents';

interface NotesViewProps {
  appState: UseAppStateReturnType;
}

function loadNotesState(username: string | null): Record<string, boolean> {
  const user = username ? username.toLowerCase() : 'guest';
  const key = `devops90_notes_completed_${user}`;
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function saveNotesState(username: string | null, s: Record<string, boolean>) {
  const user = username ? username.toLowerCase() : 'guest';
  const key = `devops90_notes_completed_${user}`;
  try { localStorage.setItem(key, JSON.stringify(s)); } catch { /**/ }
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: string;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  color,
  isOpen,
  onToggle,
  children
}) => {
  return (
    <div id={id} className={`collapsible-section ${isOpen ? 'open' : ''}`} style={{ '--section-color': color } as React.CSSProperties}>
      <button className="collapsible-header" onClick={onToggle}>
        <span className="collapsible-header-title">
          <span className="icon">{icon}</span>
          <span>{title}</span>
        </span>
        <span className="chevron">▶</span>
      </button>
      <div className="collapsible-wrapper">
        <div className="collapsible-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export const NotesView: React.FC<NotesViewProps> = ({ appState }) => {
  const { currentUser } = appState;
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');



  const [activeDay, setActiveDay] = useState(() => {
    const saved = localStorage.getItem('devops90_active_notes_day');
    return saved ? parseInt(saved) : 0;
  });
  const [activeView, setActiveView] = useState<string>(() => {
    const saved = localStorage.getItem('devops90_active_notes_day');
    if (saved) {
      const idx = parseInt(saved);
      return `day${days[idx]?.day || 1}`;
    }
    return 'overview';
  });

  useEffect(() => {
    if (activeView === 'overview') {
      localStorage.removeItem('devops90_active_notes_day');
    } else {
      localStorage.setItem('devops90_active_notes_day', String(activeDay));
    }
  }, [activeDay, activeView]);

  const [activeSection, setActiveSection] = useState<string>('');
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('devops90_active_notes_day');
    const activeIdx = saved ? parseInt(saved) : 0;
    const initial: Record<string, boolean> = {
      day1: false,
      day2: false,
      day3: false,
      day4: false
    };
    if (activeIdx >= 0 && activeIdx < days.length) {
      initial[`day${days[activeIdx].day}`] = true;
    } else {
      initial.day1 = true;
    }
    return initial;
  });

  const [notesState, setNotesState] = useState<Record<string, boolean>>(() => loadNotesState(currentUser));

  useEffect(() => {
    setNotesState(loadNotesState(currentUser));
  }, [currentUser]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    schedule: false,
    concepts: false,
    commands: false,
    debug: false,
    mistakes: false,
    project: false,
    interview: false,
    quiz: false,
    github: false,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const setAllSections = (isOpen: boolean) => {
    setExpandedSections({
      schedule: isOpen,
      concepts: isOpen,
      commands: isOpen,
      debug: isOpen,
      mistakes: isOpen,
      project: isOpen,
      interview: isOpen,
      quiz: isOpen,
      github: isOpen,
    });
  };

  useEffect(() => {
    // Reset all sections to collapsed when activeDay changes, EXCEPT the one actively scrolled to
    setExpandedSections(prev => {
      const initial = {
        schedule: false,
        concepts: false,
        commands: false,
        debug: false,
        mistakes: false,
        project: false,
        interview: false,
        quiz: false,
        github: false,
      };
      if (activeSection && activeSection in initial) {
        initial[activeSection as keyof typeof initial] = true;
      }
      return initial;
    });
  }, [activeDay]);

  // Prevent screen sleep while viewing study notes
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      KeepAwake.keepAwake().catch(() => {});
    }
    return () => {
      if (Capacitor.isNativePlatform()) {
        KeepAwake.allowSleep().catch(() => {});
      }
    };
  }, []);

  const day = days[activeDay];
  const dayKeyStr = `day_${day.day}`;
  const isDayCompleted = !!notesState[dayKeyStr];

  const syncToGitHub = useCallback(async () => {
    const pat = localStorage.getItem('devops90_github_pat') || '';
    const ghUsername = localStorage.getItem('devops90_github_username') || '';
    const repo = localStorage.getItem('devops90_github_repo') || '';
    const branch = localStorage.getItem('devops90_github_branch') || 'main';

    if (!pat || !ghUsername || !repo) {
      showToast('⚠️ GitHub settings missing. Go to Settings → API Keys to configure GitHub PAT, username, and repo.');
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return;
    }

    if (!isDayCompleted) {
      showToast('⚠️ Please mark the day as completed before syncing to GitHub.');
      return;
    }

    setSyncLoading(true);
    setSyncStatus('idle');

    try {
      const filePath = `notes/day${day.day}.md`;
      const today = new Date().toISOString().split('T')[0];
      const content = day.github.template.replace(/YYYY-MM-DD/g, today);
      const base64Content = btoa(unescape(encodeURIComponent(content)));

      // Check if file already exists (to get SHA for update)
      let sha: string | undefined;
      try {
        const checkRes = await fetch(
          `https://api.github.com/repos/${ghUsername}/${repo}/contents/${filePath}?ref=${branch}`,
          { headers: { Authorization: `Bearer ${pat}`, Accept: 'application/vnd.github.v3+json' } }
        );
        if (checkRes.ok) {
          const existing = await checkRes.json();
          sha = existing.sha;
        }
      } catch { /* file doesn't exist yet, that's fine */ }

      // PUT the file
      const body: Record<string, string> = {
        message: day.github.commitMessage || `Add Day ${day.day} notes: ${day.title}`,
        content: base64Content,
        branch
      };
      if (sha) body.sha = sha;

      const res = await fetch(
        `https://api.github.com/repos/${ghUsername}/${repo}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${pat}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (res.ok) {
        setSyncStatus('success');
        showToast(`✅ Day ${day.day} notes pushed to ${ghUsername}/${repo}!`);
      } else {
        const err = await res.text();
        throw new Error(err);
      }
    } catch (err) {
      setSyncStatus('error');
      showToast(`❌ GitHub sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSyncLoading(false);
      setTimeout(() => setSyncStatus('idle'), 4000);
    }
  }, [day, isDayCompleted]);

  const toggleDayComplete = () => {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    }
    const next = { ...notesState, [dayKeyStr]: !isDayCompleted };
    setNotesState(next);
    saveNotesState(currentUser, next);
  };

  // Helper to scroll to section
  const handleScrollTo = (view: string, dayIdx: number | null, sectionId: string) => {
    setActiveView(view);
    setActiveSection(sectionId);
    if (dayIdx !== null) {
      setActiveDay(dayIdx);
      const dayKey = `day${days[dayIdx].day}`;
      setOpenDropdowns(prev => ({
        ...prev,
        [dayKey]: true
      }));
    }
    
    // Explicitly open the section being scrolled to
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: true
    }));
    
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const toggleDropdown = (dayKey: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  const handleDayHeaderClick = (dayKey: string, dayIdx: number) => {
    toggleDropdown(dayKey);
    setActiveView(`day${days[dayIdx].day}`);
    setActiveDay(dayIdx);
    setActiveSection('');
    setTimeout(() => {
      const element = document.getElementById('day-top');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const isSubItemActive = (viewKey: string, sectionName: string) => {
    return activeView === viewKey && activeSection === sectionName;
  };

  const renderOverview = () => {
    return (
      <div className="notes-day-container">
        {/* HERO */}
        <div style={{ padding: "20px 0 32px", position: "relative" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--green)", textTransform: "uppercase", letterSpacing: "3px", marginBottom: "14px" }}>
            ● DevOps Bootcamp — Days 1 to 4
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px" }}>
            Trainer <span style={{ color: "var(--green)" }}>Beside You.</span><br />Zero to EC2 in 4 Days.
          </h1>
          <p style={{ color: "var(--sub)", fontSize: "15px", maxWidth: "680px", marginBottom: "32px", lineHeight: "1.7" }}>
            You are 33, starting from zero, and the market is paying £55K–£90K for junior DevOps. This pack is your first 4 days of a guided apprenticeship — not a course. Every command is explained. Every mistake is documented. Every hour is accounted for.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ background: "var(--s1)", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "6px", fontFamily: "var(--mono)", fontSize: "12.5px", color: "var(--sub)" }}>
              Target: <span style={{ color: "var(--blue)", fontWeight: 600 }}>Junior DevOps / Cloud Engineer</span>
            </div>
            <div style={{ background: "var(--s1)", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "6px", fontFamily: "var(--mono)", fontSize: "12.5px", color: "var(--sub)" }}>
              Timeline: <span style={{ color: "var(--blue)", fontWeight: 600 }}>Days 1–4 of 90</span>
            </div>
            <div style={{ background: "var(--s1)", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "6px", fontFamily: "var(--mono)", fontSize: "12.5px", color: "var(--sub)" }}>
              Platform: <span style={{ color: "var(--blue)", fontWeight: 600 }}>AWS EC2 (Ubuntu 22.04)</span>
            </div>
            <div style={{ background: "var(--s1)", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "6px", fontFamily: "var(--mono)", fontSize: "12.5px", color: "var(--sub)" }}>
              Daily Hours: <span style={{ color: "var(--blue)", fontWeight: 600 }}>8 hrs structured</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ROADMAP MINDMAP */}
        <div style={{ margin: "10px 0 24px" }}>
          <InteractiveDiagram 
            data={devopsRoadmapMindmap} 
            onNodeClick={(targetDay) => {
              setActiveView(`day${days[targetDay].day}`);
              setActiveDay(targetDay);
              setActiveSection('');
            }}
          />
        </div>

        {/* QUICK JUMP BUTTONS */}
        <div style={{ display: "flex", gap: "10px", margin: "10px 0 32px", flexWrap: "wrap" }}>
          {days.map((d, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveView(`day${d.day}`);
                setActiveDay(idx);
                setActiveSection('');
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: "6px",
                background: "var(--s1)",
                border: `1px solid ${d.color}44`,
                color: d.color,
                fontFamily: "var(--mono)",
                fontSize: "12.5px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = `${d.color}11`;
                e.currentTarget.style.borderColor = d.color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--s1)";
                e.currentTarget.style.borderColor = `${d.color}44`;
              }}
            >
              ↓ Day {d.day} {d.title.split('+')[0].split('—')[0]}
            </button>
          ))}
        </div>

        {/* MARKET BRIEF */}
        <div id="market-brief" style={{ background: "var(--s1)", border: "1px solid var(--border)", borderLeft: "4px solid var(--green)", padding: "28px 32px", borderRadius: "8px", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "14px", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "2px", color: "var(--green)", margin: "0 0 16px", fontWeight: "bold" }}>
            MARKET BRIEF – WHY THIS ORDER MATTERS
          </h2>
          <p style={{ color: "var(--sub)", fontSize: "14px", lineHeight: "1.7" }}>
            Senior engineers who review your GitHub and interview you in 2026 will immediately test: Linux fluency → Git hygiene → AWS EC2 basics → CI/CD logic. That is the exact sequence of these 4 days. The market has shifted: mid-level generalists are being squeezed. You need depth in the fundamentals before you touch Docker or Kubernetes. Build the foundation correctly now.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "16px" }}>
            <div style={{ background: "var(--s2)", border: "1px solid var(--border)", padding: "14px 16px", borderRadius: "6px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "22px", fontWeight: 700, color: "var(--blue)", display: "block" }}>£55K–90K</span>
              <span style={{ fontSize: "11px", color: "var(--sub)", marginTop: "2px", display: "block" }}>Junior DevOps range (UK, 2026)</span>
            </div>
            <div style={{ background: "var(--s2)", border: "1px solid var(--border)", padding: "14px 16px", borderRadius: "6px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "22px", fontWeight: 700, color: "var(--blue)", display: "block" }}>EC2 + Git</span>
              <span style={{ fontSize: "11px", color: "var(--sub)", marginTop: "2px", display: "block" }}>Tested in 90%+ of junior interviews</span>
            </div>
            <div style={{ background: "var(--s2)", border: "1px solid var(--border)", padding: "14px 16px", borderRadius: "6px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "22px", fontWeight: 700, color: "var(--blue)", display: "block" }}>Linux CLI</span>
              <span style={{ fontSize: "11px", color: "var(--sub)", marginTop: "2px", display: "block" }}>Screened in first phone call</span>
            </div>
            <div style={{ background: "var(--s2)", border: "1px solid var(--border)", padding: "14px 16px", borderRadius: "6px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "22px", fontWeight: 700, color: "var(--blue)", display: "block" }}>IAM + VPC</span>
              <span style={{ fontSize: "11px", color: "var(--sub)", marginTop: "2px", display: "block" }}>Week 2 target — not yet</span>
            </div>
          </div>
        </div>

        {/* TWO TRAINERS */}
        <div id="advisors" style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 16px" }}>
            👤 Two Trainers. One Pack.
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            <div style={{ background: "var(--s1)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ background: "rgba(0, 217, 160, 0.06)", color: "var(--green)", borderBottom: "1px solid rgba(0, 217, 160, 0.15)", padding: "12px 18px", fontFamily: "var(--mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>
                ⚡ SENIOR DEVOPS ENGINEER — BLUNT REALITY
              </div>
              <div style={{ padding: "16px 18px", fontSize: "13.5px", color: "var(--sub)", lineHeight: "1.6" }}>
                <p>Your biggest enemy in Week 1 is skipping Linux for Docker tutorials. Do not do it. I have interviewed hundreds of "DevOps candidates" who cannot tell me the difference between <code>chmod 755</code> and <code>chmod 644</code>. They fail. Immediately.</p>
                <p style={{ marginTop: "8px" }}>At 33 you have a cognitive advantage: you have real-world discipline. Use it. The commands I am about to give you are not optional exercises — they are the exact same commands you will run in production on your first job. Treat them like that.</p>
                <p style={{ marginTop: "8px" }}>Every command block: type it, do not paste it. Your hands need to learn this. A senior will spot a copy-paste candidate in the first 10 minutes of a technical screen.</p>
              </div>
            </div>
            <div style={{ background: "var(--s1)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ background: "rgba(79, 168, 255, 0.06)", color: "var(--blue)", borderBottom: "1px solid rgba(79, 168, 255, 0.15)", padding: "12px 18px", fontFamily: "var(--mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>
                🎓 SENIOR TRAINER — LEARNING FRAMEWORK
              </div>
              <div style={{ padding: "16px 18px", fontSize: "13.5px", color: "var(--sub)", lineHeight: "1.6" }}>
                <p>I have trained people who switched from hospitality, retail, finance — all backgrounds. The pattern that gets people hired: understand the why before the how, then repeat the how until the hands know it without the brain.</p>
                <p style={{ marginTop: "8px" }}>For Days 1–4 I want you to think in three frames: What does this command do? Why would a system need this? What breaks if I do it wrong? Every section below gives you all three.</p>
                <p style={{ marginTop: "8px" }}>Do not rush to tick boxes. One concept fully understood is worth ten commands memorised. This pack is built so Day 3/4 feels hard — that tension is the signal you are actually learning.</p>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESSION MAP */}
        <div id="week-track" style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 16px" }}>
            📅 WEEK 1 PROGRESSION MAP
          </h3>
          <div style={{ background: "var(--s1)", border: "1px solid var(--border)", borderRadius: "8px", padding: "20px 24px" }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
              {days.map((d, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveView(`day${d.day}`);
                    setActiveDay(idx);
                    setActiveSection('');
                  }}
                  style={{
                    flex: 1,
                    height: "32px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--mono)",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: `1px solid ${d.color}44`,
                    background: "var(--s2)",
                    color: d.color,
                    cursor: "pointer"
                  }}
                >
                  D{d.day}
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--sub)", margin: 0 }}>
              D1: Linux Foundations → D2: Git + AWS Account → D3: EC2 Live Deploy → D4: Linux Deep Dive + Troubleshooting
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="notes-container">
      {/* Sidebar Nav */}
      <div className="notes-sidebar">
        <div className="notes-sidebar-logo">
          <span>90 Days DevOps</span>
          <strong>Days 1–4 Pack</strong>
        </div>

        {/* OVERVIEW SECTION */}
        <div className="notes-sidebar-section">Overview</div>
        <button
          className={`notes-sidebar-link ${activeView === 'overview' && activeSection === 'market-brief' ? 'active' : ''}`}
          onClick={() => handleScrollTo('overview', null, 'market-brief')}
          style={{ '--accent-color': 'var(--green)' } as React.CSSProperties}
        >
          <span className="dot"></span>Market Brief
        </button>
        <button
          className={`notes-sidebar-link ${activeView === 'overview' && activeSection === 'advisors' ? 'active' : ''}`}
          onClick={() => handleScrollTo('overview', null, 'advisors')}
          style={{ '--accent-color': 'var(--green)' } as React.CSSProperties}
        >
          <span className="dot"></span>Trainer + Senior Voice
        </button>
        <button
          className={`notes-sidebar-link ${activeView === 'overview' && activeSection === 'week-track' ? 'active' : ''}`}
          onClick={() => handleScrollTo('overview', null, 'week-track')}
          style={{ '--accent-color': 'var(--green)' } as React.CSSProperties}
        >
          <span className="dot"></span>Week Tracker
        </button>

        {/* DAYS SECTION */}
        <div className="notes-sidebar-section">Bootcamp Days</div>
        {days.map((d, idx) => {
          const dayKey = `day${d.day}`;
          const isOpen = openDropdowns[dayKey];
          
          return (
            <div key={idx} className={`notes-sidebar-dropdown ${isOpen ? 'open' : ''}`} style={{ '--accent-color': d.color } as React.CSSProperties}>
              <button
                className="notes-sidebar-dropdown-toggle"
                onClick={() => handleDayHeaderClick(dayKey, idx)}
              >
                <span>Day {d.day} — {d.title.split('+')[0].split('—')[0].trim()}</span>
                <span className="chevron">▶</span>
              </button>
              <div className="notes-sidebar-dropdown-body">
                <button className={`notes-sidebar-link ${isSubItemActive(dayKey, 'schedule') ? 'active' : ''}`} onClick={() => handleScrollTo(dayKey, idx, 'schedule')}>
                  <span className="dot"></span>8h Schedule
                </button>
                <button className={`notes-sidebar-link ${isSubItemActive(dayKey, 'concepts') ? 'active' : ''}`} onClick={() => handleScrollTo(dayKey, idx, 'concepts')}>
                  <span className="dot"></span>Core Concepts
                </button>
                <button className={`notes-sidebar-link ${isSubItemActive(dayKey, 'commands') ? 'active' : ''}`} onClick={() => handleScrollTo(dayKey, idx, 'commands')}>
                  <span className="dot"></span>Commands
                </button>
                {d.debugTrees && d.debugTrees.length > 0 && (
                  <button className={`notes-sidebar-link ${isSubItemActive(dayKey, 'debug') ? 'active' : ''}`} onClick={() => handleScrollTo(dayKey, idx, 'debug')}>
                    <span className="dot"></span>Debug Tree
                  </button>
                )}
                <button className={`notes-sidebar-link ${isSubItemActive(dayKey, 'mistakes') ? 'active' : ''}`} onClick={() => handleScrollTo(dayKey, idx, 'mistakes')}>
                  <span className="dot"></span>Mistakes
                </button>
                <button className={`notes-sidebar-link ${isSubItemActive(dayKey, 'project') ? 'active' : ''}`} onClick={() => handleScrollTo(dayKey, idx, 'project')}>
                  <span className="dot"></span>Mini Project
                </button>
                <button className={`notes-sidebar-link ${isSubItemActive(dayKey, 'interview') ? 'active' : ''}`} onClick={() => handleScrollTo(dayKey, idx, 'interview')}>
                  <span className="dot"></span>Interview Prompts
                </button>
                <button className={`notes-sidebar-link ${isSubItemActive(dayKey, 'quiz') ? 'active' : ''}`} onClick={() => handleScrollTo(dayKey, idx, 'quiz')}>
                  <span className="dot"></span>Quiz
                </button>
                <button className={`notes-sidebar-link ${isSubItemActive(dayKey, 'github') ? 'active' : ''}`} onClick={() => handleScrollTo(dayKey, idx, 'github')}>
                  <span className="dot"></span>GitHub Notes
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="notes-main-content">
        {/* Mobile Day Selector (Visible only on mobile/screens < 900px) */}
        <div className="mobile-day-selector">
          <button
            onClick={() => {
              setActiveView('overview');
              setActiveSection('');
            }}
            style={{
              padding: "8px 14px",
              border: "none",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "12px",
              borderRadius: "6px",
              background: activeView === 'overview' ? 'var(--green)' : 'var(--s2)',
              color: activeView === 'overview' ? '#000' : 'var(--sub)',
              fontWeight: activeView === 'overview' ? "bold" : "normal",
              transition: "all 0.15s",
              whiteSpace: "nowrap"
            }}
          >
            Overview
          </button>
          {days.map((d, i) => {
            const dayKey = `day${d.day}`;
            const isActive = activeView === dayKey;
            return (
              <button
                key={i}
                onClick={() => {
                  setActiveView(dayKey);
                  setActiveDay(i);
                  setActiveSection('');
                }}
                style={{
                  padding: "8px 14px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  borderRadius: "6px",
                  background: isActive ? d.color : "var(--s2)",
                  color: isActive ? "#000" : "var(--sub)",
                  fontWeight: isActive ? "bold" : "normal",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap"
                }}
              >
                Day {d.day}
              </button>
            );
          })}
        </div>

        {/* Mobile Section Selector */}
        {activeView !== 'overview' && (
          <div className="mobile-section-selector">
            <select
              value={activeSection}
              onChange={(e) => {
                const sec = e.target.value;
                if (sec) {
                  handleScrollTo(activeView, activeDay, sec);
                }
              }}
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r8)',
                padding: '9px 12px',
                color: 'var(--text)',
                fontFamily: 'var(--body)',
                fontSize: '13px',
                outline: 'none',
                marginBottom: '15px'
              }}
            >
              <option value="">Jump to Section...</option>
              <option value="schedule">📋 8h Schedule</option>
              <option value="concepts">🧠 Core Concepts</option>
              <option value="commands">💻 Commands</option>
              {day.debugTrees && day.debugTrees.length > 0 && (
                <option value="debug">🛠️ Debug Tree</option>
              )}
              <option value="mistakes">⚠️ Mistakes</option>
              <option value="project">🚀 Mini Project</option>
              <option value="interview">🎤 Interview Prompts</option>
              <option value="quiz">🧪 Quiz</option>
              <option value="github">🐙 GitHub Notes</option>
            </select>
          </div>
        )}

        {activeView === 'overview' ? renderOverview() : (
          <div className="notes-day-container" id="day-top">
            {/* Day Title & Subtitle */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: day.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  color: "#000",
                  fontSize: "16px",
                  fontFamily: "monospace"
                }}>
                  {day.day}
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 900 }}>{day.title}</h2>
                  <p style={{ margin: 0, color: "var(--sub)", fontSize: "13px" }}>{day.subtitle}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={toggleDayComplete}
                    style={{
                      background: isDayCompleted ? 'rgba(0, 217, 160, 0.12)' : 'var(--s2)',
                      border: isDayCompleted ? '1px solid var(--green)' : '1px solid var(--border)',
                      color: isDayCompleted ? 'var(--green)' : 'var(--sub)',
                      borderRadius: 'var(--r8)',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontFamily: 'var(--mono)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isDayCompleted ? '✓ Completed' : '⬜ Mark Completed'}
                  </button>
                  <button
                    onClick={syncToGitHub}
                    disabled={syncLoading}
                    style={{
                      background: syncStatus === 'success' ? 'rgba(0,217,160,.12)'
                        : syncStatus === 'error' ? 'rgba(255,95,95,.08)'
                        : 'rgba(79,168,255,.08)',
                      border: `1px solid ${
                        syncStatus === 'success' ? 'rgba(0,217,160,.4)'
                        : syncStatus === 'error' ? 'rgba(255,95,95,.3)'
                        : 'rgba(79,168,255,.3)'
                      }`,
                      color: syncStatus === 'success' ? 'var(--green)'
                        : syncStatus === 'error' ? 'var(--red, #ff5f5f)'
                        : '#4fa8ff',
                      borderRadius: 'var(--r8)',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontFamily: 'var(--mono)',
                      fontWeight: 'bold',
                      cursor: syncLoading ? 'wait' : 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      opacity: syncLoading ? 0.7 : 1
                    }}
                  >
                    {syncLoading ? '⏳ Syncing...' : syncStatus === 'success' ? '✅ Synced!' : syncStatus === 'error' ? '❌ Failed' : '🐙 Sync to GitHub'}
                  </button>
                </div>
              </div>
            </div>

            {/* Dual Perspective Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px", marginBottom: "24px" }}>
              <div style={{ background: "var(--s1)", border: `1px solid ${day.color}33`, borderRadius: "10px", padding: "14px" }}>
                <div style={{ fontSize: "10px", color: day.color, fontFamily: "var(--mono)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "bold" }}>
                  🎓 Trainer (Market Reality)
                </div>
                <p style={{ margin: 0, color: "var(--sub)", fontSize: "13px", lineHeight: "1.6", fontStyle: "italic" }}>
                  "{day.trainerNote}"
                </p>
              </div>
              <div style={{ background: "var(--s1)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px" }}>
                <div style={{ fontSize: "10px", color: "var(--sub)", fontFamily: "var(--mono)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "bold" }}>
                  ⚙️ Senior Engineer (War Story)
                </div>
                <p style={{ margin: 0, color: "var(--sub)", fontSize: "13px", lineHeight: "1.6", fontStyle: "italic" }}>
                  "{day.engineerNote}"
                </p>
              </div>
            </div>

            {/* Day Goal callout */}
            <div className="callout ok" style={{ borderLeftColor: day.color }}>
              <span className="callout-icon">{day.goal.icon}</span>
              <h4 style={{ color: day.color }}>{day.goal.title}</h4>
              <p>{day.goal.description}</p>
            </div>

            {/* Dynamic CI/CD Flowchart for Day 4 */}
            {day.day === 4 && (
              <div style={{ marginTop: "32px", marginBottom: "16px" }}>
                <InteractiveDiagram data={cicdPipelineDiagram} />
              </div>
            )}

            {/* Collapse / Expand all controls */}
            <div className="collapse-controls-bar">
              <button className="collapse-control-btn" onClick={() => setAllSections(true)}>
                ↔ Expand All
              </button>
              <button className="collapse-control-btn" onClick={() => setAllSections(false)}>
                ↔ Collapse All
              </button>
            </div>

            {/* Schedule */}
            <CollapsibleSection
              id="schedule"
              title="8-Hour Schedule"
              icon="📋"
              color={day.color}
              isOpen={!!expandedSections.schedule}
              onToggle={() => toggleSection('schedule')}
            >
              <ScheduleTable schedule={day.schedule} color={day.color} />
            </CollapsibleSection>

            {/* Core Concepts */}
            <CollapsibleSection
              id="concepts"
              title="Core Concepts — The Why Behind Every Command"
              icon="🧠"
              color={day.color}
              isOpen={!!expandedSections.concepts}
              onToggle={() => toggleSection('concepts')}
            >
              <ConceptCards concepts={day.concepts} color={day.color} />
            </CollapsibleSection>

            {/* Command sessions */}
            <CollapsibleSection
              id="commands"
              title="Exact Command Flow — Type Every Line"
              icon="⌨️"
              color={day.color}
              isOpen={!!expandedSections.commands}
              onToggle={() => toggleSection('commands')}
            >
              {day.commands.map((session, idx) => (
                <TerminalBlock key={idx} session={session} color={day.color} />
              ))}
            </CollapsibleSection>

            {/* Debug Flows */}
            {day.debugTrees && day.debugTrees.length > 0 && (
              <CollapsibleSection
                id="debug"
                title={`Debugging Flow — Day ${day.day} Most Common Failures`}
                icon="🐛"
                color={day.color}
                isOpen={!!expandedSections.debug}
                onToggle={() => toggleSection('debug')}
              >
                {day.debugTrees.map((tree, idx) => (
                  <DebugFlow key={idx} tree={tree} color={day.color} />
                ))}
              </CollapsibleSection>
            )}

            {/* Mistakes */}
            <CollapsibleSection
              id="mistakes"
              title={`Common Beginner Mistakes — Day ${day.day}`}
              icon="💥"
              color={day.color}
              isOpen={!!expandedSections.mistakes}
              onToggle={() => toggleSection('mistakes')}
            >
              <MistakesBlock mistakes={day.mistakes} color={day.color} />
            </CollapsibleSection>

            {/* Mini Project */}
            <CollapsibleSection
              id="project"
              title={`Day ${day.day} Mini Project`}
              icon="🏗"
              color={day.color}
              isOpen={!!expandedSections.project}
              onToggle={() => toggleSection('project')}
            >
              <MiniProjectBlock project={day.project} color={day.color} />
            </CollapsibleSection>

            {/* Interview prompts */}
            <CollapsibleSection
              id="interview"
              title={`Interview Explanation Prompts — Day ${day.day} Topics`}
              icon="🎤"
              color={day.color}
              isOpen={!!expandedSections.interview}
              onToggle={() => toggleSection('interview')}
            >
              <InterviewPrep interview={day.interview} color={day.color} />
            </CollapsibleSection>

            {/* Interactive Quiz */}
            <CollapsibleSection
              id="quiz"
              title={`Day ${day.day} Quiz — Test Yourself Before Moving On`}
              icon="🧪"
              color={day.color}
              isOpen={!!expandedSections.quiz}
              onToggle={() => toggleSection('quiz')}
            >
              <InteractiveQuiz questions={day.quiz} color={day.color} />
            </CollapsibleSection>

            {/* Github Notes templates */}
            <CollapsibleSection
              id="github"
              title="GitHub Notes Template — Push This Tonight"
              icon="📂"
              color={day.color}
              isOpen={!!expandedSections.github}
              onToggle={() => toggleSection('github')}
            >
              <GithubTemplateBlock github={day.github} />
            </CollapsibleSection>

            {/* Bottom Nav */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => {
                  const prevIdx = activeDay - 1;
                  if (prevIdx >= 0) {
                    setActiveDay(prevIdx);
                    setActiveView(`day${days[prevIdx].day}`);
                    setActiveSection('');
                  }
                }}
                disabled={activeDay === 0}
                style={{
                  padding: "10px 20px",
                  background: activeDay === 0 ? "var(--s1)" : "var(--s2)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: activeDay === 0 ? "var(--muted)" : "var(--text)",
                  cursor: activeDay === 0 ? "not-allowed" : "pointer",
                  fontFamily: "var(--mono)",
                  fontSize: "13px"
                }}
              >
                ← Previous Day
              </button>
              <div style={{ color: "var(--muted)", fontSize: "12px", alignSelf: "center", fontFamily: "var(--mono)" }}>
                Day {activeDay + 1} of {days.length} (Week 1)
              </div>
              <button
                onClick={() => {
                  const nextIdx = activeDay + 1;
                  if (nextIdx < days.length) {
                    setActiveDay(nextIdx);
                    setActiveView(`day${days[nextIdx].day}`);
                    setActiveSection('');
                  }
                }}
                disabled={activeDay === days.length - 1}
                style={{
                  padding: "10px 20px",
                  background: activeDay === days.length - 1 ? "var(--s1)" : day.color,
                  border: activeDay === days.length - 1 ? "1px solid var(--border)" : "none",
                  borderRadius: "8px",
                  color: activeDay === days.length - 1 ? "var(--muted)" : "#000",
                  cursor: activeDay === days.length - 1 ? "not-allowed" : "pointer",
                  fontFamily: "var(--mono)",
                  fontSize: "13px",
                  fontWeight: "bold"
                }}
              >
                Next Day →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;
