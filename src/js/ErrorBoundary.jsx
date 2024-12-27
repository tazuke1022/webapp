/**
 * Reactコンポーネント描画時に発生したJavaScriptエラーを表示する．
 */
import { Component, StrictMode } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error: error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          color: "hsla(355, 100%, 32%, 1)",
          backgroundColor: "hsla(355, 100%, 94%, 1)",
          borderRadius: "8px",
          padding: "8px 8px",
        }}>
          <p style={{ margin: "0px 0px 8px 0px" }}>
            Reactコンポーネント描画時にJavaScriptエラーが発生しました。
          </p>
          <code>{this.state.error.name}: {this.state.error.message}</code>
        </div>
      )
    }
    return (
      <StrictMode>
        <>
          {this.props.children}
        </>
      </StrictMode>
    );
  }
}
