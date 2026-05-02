/**
 * ErrorBoundary.jsx — Catches React render crashes
 * Prevents white screen of death by showing a friendly error UI
 */
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f2eb',
          padding: '32px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: '#1a1a1a' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
              The page encountered an unexpected error. This may be due to a server connection issue.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              style={{
                background: '#2d5016',
                color: '#fff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Go to Home Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
