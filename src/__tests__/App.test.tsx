import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App.tsx';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('App component rendering and routing tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.setItem('devops90_current_user', 'testuser');
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('should render the app header and brand name', () => {
    render(<App />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    vi.useRealTimers();
    expect(screen.getByText('DevOps')).toBeDefined();
    expect(screen.getByText('90')).toBeDefined();
    expect(screen.getAllByText('BY GK')[0]).toBeDefined();
  });

  it('should render primary tabs', () => {
    render(<App />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    vi.useRealTimers();
    expect(screen.getAllByText(/Roadmap/i, { selector: 'button' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Kanban/i, { selector: 'button' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Focus/i, { selector: 'button' }).length).toBeGreaterThan(0);
  });

  it('should switch view when clicking tabs', async () => {
    render(<App />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    vi.useRealTimers();
    const kanbanTab = screen.getByText(/Kanban/i, { selector: 'button' });
    fireEvent.click(kanbanTab);
    expect(await screen.findByText(/Day Progress Kanban/i)).toBeDefined();
  });

  it('should switch to diagram builder view when clicking the drawer link', async () => {
    render(<App />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    vi.useRealTimers();

    // Open drawer
    const menuBtn = screen.getByLabelText('Menu');
    fireEvent.click(menuBtn);

    // Open AI Tools section
    const aiToolsHeader = screen.getByText(/AI Tools/i);
    fireEvent.click(aiToolsHeader);

    // Find and click 'MindMap' button
    const diagramBtn = screen.getByText(/MindMap/i, { selector: 'button' });
    fireEvent.click(diagramBtn);


    // Since DiagramBuilderView is lazy-loaded, we wait for it to be rendered
    expect(await screen.findByText('Model your own custom DevOps Roadmaps & Flowcharts')).toBeDefined();
  });

  it('should switch to devops flows view when clicking the drawer link', async () => {
    render(<App />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    vi.useRealTimers();

    // Open drawer
    const menuBtn = screen.getByLabelText('Menu');
    fireEvent.click(menuBtn);

    // Open AI Tools section
    const aiToolsHeader = screen.getByText(/AI Tools/i);
    fireEvent.click(aiToolsHeader);

    // Find and click 'DevOps Flowcharts' button
    const flowsBtn = screen.getByText('DevOps Flowcharts');
    fireEvent.click(flowsBtn);

    // Wait for the DevOpsFlowsView to lazy load
    expect(await screen.findAllByText('DevOps Lifecycle & Structure')).toBeDefined();
  });
});

