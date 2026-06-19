import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in component "${this.props.name || 'Unknown'}":`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '2rem',
          margin: '1.5rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            ⚠️ Something went wrong in {this.props.name || 'this feature'}
          </h3>
          <p style={{ color: 'var(--sub, #64748b)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-card, #ef4444)',
              color: '#fff',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card, #ef4444)')}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
