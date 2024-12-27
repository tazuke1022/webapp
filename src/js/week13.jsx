/**
 * 第１３週ミニ課題用のJSXファイル
 * ペイントチャットを実装する．
 */
// React DOMの関数をimportする．
import { createRoot } from 'react-dom/client';

// デバッグ用にエラー発生時にエラーメッセージを表示するコンポーネントで囲む．
import { ErrorBoundary } from './ErrorBoundary';

// コンポーネントの定義をimportする．
import { Authenticate } from './Authenticate';
import { WithSocket } from './WithSocket';
// サンプルとして単独で動作するPaintも配置する．
//import { Paint } from './Paint';
/* ここから */
import { PaintChat } from './PaintChat';
/* ここまで */

// ReactコンポーネントをidがrootであるDOM要素に配置する．
const root = createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    {/* 以下のペイント・アプリはミニ課題提出時にはコメントアウトしてください */}
    {/* <p>単独で動作する簡単なペイント・アプリ</p>
    <Paint />
    <p>ペイントチャット</p> */}
    {/* 動作確認を容易にするため，チャットアプリを２つ横に並べて配置する．*/}
    <div className="cols-wrap two-cols">
      {/* ここから */}
      <Authenticate>
        <WithSocket nsp="/chat">
          <PaintChat />
        </WithSocket>
      </Authenticate>
      <Authenticate>
        <WithSocket nsp="/chat">
          <PaintChat />
        </WithSocket>
      </Authenticate>




      {/* ここまで */}
    </div>
  </ErrorBoundary >
);
