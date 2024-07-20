import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(
    props: Props = {
      children: undefined,
    },
  ) {
    super(
      props || {
        children: undefined,
      },
    );
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("Error caught by ErrorBoundary", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
