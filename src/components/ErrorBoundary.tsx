import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', backgroundColor: '#fff', color: '#1D1D1F', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#FF3B30' }}>Oops, qualcosa è andato storto.</h2>
          <p>Se vedi questo messaggio, c'è stato un problema di rendering nell'applicazione.</p>
          <p style={{ fontWeight: 'bold' }}>{this.state.error?.message}</p>
          <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '10px' }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#0066cc', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            Ricarica Applicazione
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
