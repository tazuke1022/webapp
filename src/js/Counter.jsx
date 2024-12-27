/**
 * カウンターの例
 */
import { useState } from 'react';

// 関数の引数としてprops の代わりに分割代入を使うことも考えられる．
export const Counter = ({
  /* ここから */
  initial = 0,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER }) => {
  const [count, setCount] = useState(0);
  const countUp = () => {
    setCount(Math.min(count + 1, max));
  };
  const countDown = () => {
    setCount(Math.max(count - 1, min));
  };
  const countReset = () => {
    setCount(0);
  };


  /* ここまで */

  return (
    <div>
      {/* ここから */}
      <div>カウント： {count}</div>
      <div>
        <button type="button" onClick={countUp} disabled={count >= max}>アップ
        </button>
        <button type="button" onClick={countDown} disabled={count <= min}>ダウン
        </button>
        <button type="button" onClick={countReset}>リセット</button>
      </div>




      {/* ここまで */}
    </div>
  );
}
