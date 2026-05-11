import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Something went wrong.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] rounded-3xl border border-red-900/40 bg-neutral-900 p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-950/40 p-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>

            <div className="flex-1">
              <div className="text-lg font-semibold text-white">
                Something went wrong
              </div>

              <div className="mt-2 text-sm text-neutral-400">
                This section crashed, but the app is still running.
              </div>

              {this.state.errorMessage ? (
                <div className="mt-3 rounded-2xl bg-neutral-950 px-4 py-3 text-xs text-red-300 border border-neutral-800 break-words">
                  {this.state.errorMessage}
                </div>
              ) : null}

              <button
                onClick={this.handleReload}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
              >
                <RefreshCcw className="h-4 w-4" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
