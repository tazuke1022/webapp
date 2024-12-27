/**
 * ペイントチャット
 */
// reactから使用する関数をimportする．
/* ここから */
import { useRef, useContext, useEffect } from 'react';
/* ここまで */

// 簡易ログイン機能を使用する．
import { LoginContext } from './Authenticate';
// Socket wrapperを使用する
import { SocketContext } from './WithSocket';

// ペイントを使用する．
import { Paint } from './Paint';

export const PaintChat = () => {
  // LoginContextからユーザ情報を取得する．
  const user = useContext(LoginContext);
  const username = user ? user.username : '';
  // SocketContextからソケットを受け取る．
  const socketRef = useContext(SocketContext);
  const socket = socketRef ? socketRef.current : null;

  /* ここから */
  // Paintコンポーネントへのref
  const paintRef = useRef(null);
  // ペイントチャットのイベントリスナー（コマンドを処理する）
  const handlePaintCommand = (data) => {
    if (data.command === 'draw-line') {
      paintRef.current.drawLine(
        data.x0, data.y0, data.x1, data.y1, data.penColor, data.penSize
      );
    } else if (data.command === 'clear-canvas') {
      paintRef.current.clearCanvas();
    } else {
      console.log(`[PaintChat] ${data.command} is not supported.`);
    }
  };
  // draw-lineのコマンドを送る．
  const sendDrawLine = (x0, y0, x1, y1, penColor, penSize) => {
    if (socket) {
      socket.emit('paint', {
        from: username,
        command: 'draw-line',
        x0, y0, x1, y1, penColor, penSize
      });
    }
  };
  // キャンバスをクリアするコマンド('clear-canvas')を送る．
  const sendClearCanvas = () => {
    if (socket) {
      socket.emit('paint', {
        from: username,
        command: 'clear-canvas',
      });
    }
  };

  // コンポーネントがマウントされた時にソケットにイベントリスナーをつける．
  useEffect(() => {
    if (socket) {
      console.log('[PaintChat] adding listeners');
      socket.on('paint', handlePaintCommand);
      // これまでの描画コマンドをリクエストする．
      // これによりこれまでのペイントコマンドが送られ，画面の同期が可能になる．
      socket.emit('paint-history', { from: username });
      // クリーンアップ関数を返す．
      return () => {
        console.log('[PaintChat] removing listeners')
        socket.off('paint', handlePaintCommand);
      };
    }
  }, []);
  return (
    <Paint ref={paintRef}
      drawLine={sendDrawLine}
      clearCanvas={sendClearCanvas} />
  );




  /* ここまで */
};
