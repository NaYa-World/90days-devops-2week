import { useState, useEffect } from 'react';

// Maps external paths to internal view names
const ROUTE_MAP: Record<string, string> = {
  '/': 'dashboard',
  '/explore': 'roadmap-v4',
  '/library': 'material',
  '/today': 'focus',
  '/projects': 'projects',
  '/sandbox': 'sandbox',
  '/qbank': 'qbank',
  '/readiness': 'readiness',
  '/mock': 'mock',
  '/tracker': 'tracker',
  '/settings': 'settings',
  '/kanban': 'kanban'
};

// Maps internal view names back to external paths
const VIEW_MAP = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([path, view]) => [view, path])
);

export const useRouter = (defaultView: string) => {
  const [currentView, setCurrentViewState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path && ROUTE_MAP[path]) {
        return ROUTE_MAP[path];
      }
    }
    return defaultView;
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentViewState(ROUTE_MAP[path] || defaultView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultView]);

  const setCurrentView = (viewOrUpdater: string | ((prev: string) => string)) => {
    setCurrentViewState(prev => {
      const nextView = typeof viewOrUpdater === 'function' ? viewOrUpdater(prev) : viewOrUpdater;
      
      if (nextView !== prev) {
        // Find the canonical path for this view, default to /viewName if unknown
        const nextPath = VIEW_MAP[nextView] || `/${nextView}`;
        
        // Push state without reloading the page
        if (window.location.pathname !== nextPath) {
          window.history.pushState(null, '', nextPath);
        }
      }
      return nextView;
    });
  };

  return [currentView, setCurrentView] as const;
};
