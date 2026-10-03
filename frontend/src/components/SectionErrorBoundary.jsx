import { Component } from "react";

export default class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.retry = this.retry.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Keep render failures observable in browser diagnostics without exposing
    // implementation details in the player-facing page.
    console.error("[Crystal Guild] profile section render failure", error, info);
  }

  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  retry() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === "function") return this.props.fallback({ retry: this.retry });
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="state-message section-render-fallback">
          <span>This section hit a display error.</span>
          <button type="button" className="equipment-action-button secondary" onClick={this.retry}>Retry Section</button>
        </div>
      );
    }
    return this.props.children;
  }
}
