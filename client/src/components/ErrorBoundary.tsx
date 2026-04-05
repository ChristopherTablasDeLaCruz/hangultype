import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/lessons";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-200">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_#991b1b_0%,_#020617_80%)]" />

          <div className="relative z-10 p-8 rounded-xl border border-red-500/30 bg-red-950/10 backdrop-blur-md max-w-lg text-center">
            <div className="text-red-400 text-6xl mb-6">⚠</div>
            <h1 className="text-2xl font-bold font-mono tracking-wide text-red-300 mb-3">
              CRITICAL_ERROR
            </h1>
            <p className="text-sm text-slate-400 mb-2 font-mono">
              SYSTEM_FAILURE // Render_Exception
            </p>

            {this.state.error && (
              <div className="mt-6 p-4 rounded-lg bg-slate-950/50 border border-white/5">
                <p className="text-xs text-red-400 font-mono break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="mt-8 px-6 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 font-mono text-sm font-bold uppercase tracking-wider hover:bg-red-500/30 hover:border-red-500/50 transition-all shadow-lg"
            >
              Return_To_Base →
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
