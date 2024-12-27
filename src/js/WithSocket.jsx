/**
 * Socket.IOのsocketを子要素に提供する．
 * 
 * <WithSocket nsp="namespace"> ... </WitSocket>
 *  nsp: Socket.IOで使用するnamespaceを指定する．デフォルトは /
 */
// CSSの読み込み
import '../css/WithSocket.css';

// socket.io.clientを使用する．
import { io } from 'socket.io-client';

import { useState, useRef, useEffect, useContext, createContext } from 'react';
// useEffectの代わりに useLayoutEffectを使う．
//import { useLayoutEffect } from 'react';

// 簡易ログイン機能を使用することにする．
import { LoginContext } from './Authenticate';

// socketをContextを使って，子要素に渡す．
export const SocketContext = createContext();

// コンポーネントの定義
export const WithSocket = (props) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // LoginContextからユーザ情報を取得する．
  const user = useContext(LoginContext);

  const openSocket = () => {
    // ユーザ情報があればauthHeaderをつける．
    const authHeader = user ?
      { auth: { token: user.token, username: user.username } } : {};
    if (!socketRef.current) {
      const socket = io(props.nsp, {
        reconnection: false,
        ...authHeader
      });
      socket.on('connect', () => {
        setConnected(true);
      })
      socket.on('error', (error) => {
        setErrorMessage(error.message);
      });
      socket.on('connect_error', (error) => {
        setErrorMessage(error.message)
      });
      socket.on('connect_timeout', (error) => {
        setErrorMessage(error.message)
      });
      socket.on('disconnect', (reason) => {
        setErrorMessage(`Disconnected: ${reason}.`);
        setConnected(false);
      });
      socketRef.current = socket;
    } else {
      setErrorMessage('');
      socketRef.current.connect();
    }
  };

  const closeSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  // コンポーネントがマウントされた時にソケットをオープンし，アンマウントする時にソケットをクローズする．
  // もし，画面の同期を優先するのであれば，useEffectではなく，useLayoutEffectを使う．
  useEffect(() => {
    if (!connected) {
      openSocket();
    }
    return () => {
      closeSocket();
    };
    // 簡単にするために，user, nsp はコンポーネントがマウントされている間は変化しないという前提で，depedancyに入れない．
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 接続/切断のボタンの処理
  const connectOrDisconnect = () => {
    if (connected) {
      closeSocket();
    } else {
      openSocket();
    }
  };

  return (
    <div className="with-socket">
      <div className="with-socket-control">
        <span className={(connected ? "" : "with-socket-disconnected")}>namespace: {props.nsp}</span>
        <button type="button" onClick={connectOrDisconnect}>
          {connected ? '切断' : '接続'}
        </button>
      </div>
      {connected ?
        // 接続している時は，子要素を表示する．
        <SocketContext.Provider value={socketRef}>
          {props.children}
        </SocketContext.Provider>
        :
        // 切断されている時
        <div><span className="with-socket-disconnected">接続されていません</span></div>
      }
      {errorMessage === '' ? null :
        <div className="error-message"
          onClick={() => setErrorMessage('')}>{errorMessage}</div>}
    </div>
  );
};
