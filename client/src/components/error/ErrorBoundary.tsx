import React from 'react';
import { BaseButton } from '../base';
import { logger } from '../../core/utils/logger';

// ============================================================
// ErrorBoundary – Catch React render errors gracefully
// Phase 5 – DX: Error boundary
// Wraps page/module level, shows friendly fallback UI
// Logs errors via structured logger
// ============================================================

export interface ErrorBoundaryProps {
  /** Child components to protect */
  children: React.ReactNode;
  /** Optional custom fallback UI */
  fallback?: React.ReactNode;
  /** Optional error handler callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Reset key — when this changes, the boundary resets */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log via structured logger
    logger.error('[ErrorBoundary] Uncaught render error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Notify parent
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset when resetKey changes (e.g. route navigation)
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
          <div className="bg-danger/5 border border-danger/20 rounded-xl p-6 max-w-lg text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-sm text-text-muted mb-4">
              An unexpected error occurred while rendering this component. The error has been logged
              automatically.
            </p>

            {this.state.error && (
              <details className="text-left mb-4">
                <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-neutral-100 rounded-lg text-xs text-danger font-mono overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-2">
              <BaseButton variant="primary" size="sm" onClick={this.handleReset}>
                Try Again
              </BaseButton>
              <BaseButton variant="outline" size="sm" onClick={() => window.location.reload()}>
                Reload Page
              </BaseButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Module-level Error Boundary ──────────────────────────
// Use this to wrap route-level pages with auto-reset on navigation

export interface ModuleErrorBoundaryProps {
  children: React.ReactNode;
  /** Module name for better logging */
  moduleName?: string;
}

export function ModuleErrorBoundary({ children, moduleName }: ModuleErrorBoundaryProps) {
  // Use pathname as reset key — auto-resets on route change
  const resetKey = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <ErrorBoundary
      resetKey={resetKey}
      onError={(error) => {
        logger.error(`[Module:${moduleName ?? 'unknown'}] Render error`, {
          error: error.message,
          module: moduleName,
          path: window.location.pathname,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
