/**
 * 第２回レポート課題用のJSXファイル
 */
// React DOMの関数をimportする．
import { createRoot } from 'react-dom/client';

// デバッグ用にエラー発生時にエラーメッセージを表示するコンポーネントで囲む．
import { ErrorBoundary } from './ErrorBoundary';

// コンポーネントの定義をimportする．
/* ここから */
import { Authenticate } from './Authenticate';
import { WithSocket } from './WithSocket';
import { TextChat } from './TextChat';
//import { EchoBot } from './EchoBot'
/* ここまで */

// ReactコンポーネントをidがrootであるDOM要素に配置する．
const root = createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    {/* ここから */}
    <Authenticate>
      <WithSocket nsp="/chat">
        <TextChat />
      </WithSocket>
    </Authenticate>
    <hr />
    {/* ここまで */}
  </ErrorBoundary>
);
