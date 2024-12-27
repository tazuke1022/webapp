/**
 * 第１回レポート課題用のJSXファイル
 */
// React DOMの関数をimportする．
import { createRoot } from 'react-dom';

// デバッグ用にエラー発生時にエラーメッセージを表示するコンポーネントで囲む．
import { ErrorBoundary } from './ErrorBoundary';

// ToDoListのコンポーネントの定義をimportする．
/* ここから */
import { ToDoList } from './ToDoList';

import { Authenticate } from './Authenticate';

/* ここまで */

// ReactコンポーネントをidがrootであるDOM要素に配置する．
const root = createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    {/* ここから */}
    <p>ログイン</p>
    <Authenticate usernameSaveKey="key1">
      <ToDoList url="/todo-secure" />
    </Authenticate>
    <hr />
    {/* <p>ログイン機能を使用しない場合</p>
    <ToDoList url="/todo" /> */}
    {/* ここまで */}
  </ErrorBoundary>
);

