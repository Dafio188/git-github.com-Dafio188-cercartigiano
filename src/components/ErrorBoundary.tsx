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
        <div className="p-10 bg-white text-[#1D1D1F] font-sans">
          <h2 className="text-[#FF3B30] text-xl font-bold mb-4">Oops, qualcosa è andato storto.</h2>
          <p className="mb-2">Se vedi questo messaggio, c'è stato un problema di rendering nell'applicazione.</p>
          <p className="font-bold mb-4">{this.state.error?.message}</p>
          <pre className="text-xs whitespace-pre-wrap bg-[#f0f0f0] p-5 rounded-[10px] overflow-auto mb-4">
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-5 px-5 py-2.5 bg-[#0066cc] text-white rounded-[8px] border-none cursor-pointer hover:bg-opacity-90 transition-all font-bold"
          >
            Ricarica Applicazione
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
