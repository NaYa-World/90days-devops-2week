import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DevOpsFlowsView } from '../views/DevOpsFlowsView';

describe('DevOpsFlowsView component tests', () => {
  const mockAppState = {} as any;
  const mockSwitchView = vi.fn();

  it('should render flow tabs and overall description', () => {
    render(<DevOpsFlowsView appState={mockAppState} switchView={mockSwitchView} />);
    expect(screen.getAllByText('DevOps Lifecycle & Structure')[0]).toBeDefined();
    expect(screen.getByText('Automated CI/CD Pipeline')).toBeDefined();
    expect(screen.getByText('Docker Image & Container Flow')).toBeDefined();
    expect(screen.getByText('Kubernetes Pod Deployment Flow')).toBeDefined();
    expect(screen.getByText('Ansible Configuration Management')).toBeDefined();
    expect(screen.getByText('SonarQube Code Review & Gate')).toBeDefined();
  });

  it('should display details when clicking a node', () => {
    render(<DevOpsFlowsView appState={mockAppState} switchView={mockSwitchView} />);
    
    // Find Plan & Collaborate node and click it
    const planNode = screen.getByText('Plan & Collaborate');
    fireEvent.click(planNode);

    // Verify detail panel shows explanation for Plan & Collaborate
    expect(screen.getByText(/Jira \/ Slack \/ Notion/i)).toBeDefined();
    expect(screen.getByText(/Teams align on requirements/i)).toBeDefined();
  });
});
