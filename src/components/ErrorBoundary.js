import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl text-red-500 mb-4">Something went wrong</h2>
          <p className="text-white mb-4">
            We're sorry, but there was an error loading this component.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Try again
          </button>
          <details className="mt-4 text-left">
            <summary className="text-gray-400 cursor-pointer">Error details</summary>
            <pre className="mt-2 p-4 bg-gray-900 text-red-300 rounded text-xs overflow-auto">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 