import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';

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
    expect(screen.getByText('DEV')).toBeDefined();
    expect(screen.getByText('OPS')).toBeDefined();
    expect(screen.getAllByText('BY GK')[0]).toBeDefined();
  });

  it('should render primary tabs', () => {
    render(<App />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    vi.useRealTimers();
    expect(screen.getByText('☑ Roadmap')).toBeDefined();
    expect(screen.getByText('⊞ Kanban')).toBeDefined();
    expect(screen.getByText('◎ Focus')).toBeDefined();
  });

  it('should switch view when clicking tabs', async () => {
    render(<App />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    vi.useRealTimers();
    const kanbanTab = screen.getByText('⊞ Kanban');
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

    // Find and click 'Diagram Builder' button
    const diagramBtn = screen.getByText('Diagram Builder');
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

