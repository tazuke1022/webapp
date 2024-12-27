// CSSを使用する場合：CSSの定義の読み込み
/* ここから */
import '../css/TextChat.css';
/* ここまで */
// reactから使用する関数をimportする．
import { useState, useEffect, useContext, useRef } from 'react';
// 簡易ログイン機能を使用する．
import { LoginContext } from './Authenticate';
// Socket.IOのソケットを使用する．
import { SocketContext } from './WithSocket';

import { Paint } from './Paint';

export const TextChat = () => {
  // LoginContextからユーザ情報を取得する．
  const user = useContext(LoginContext);
  const username = user ? user.username : '';
  // SocketContextからソケットを受け取る．
  const socketRef = useContext(SocketContext);
  const socket = socketRef ? socketRef.current : null;
  // 送信するテキストメッセージの入力
  const [inputMessage, setInputMessage] = useState('');
  // 受信したテキストメッセージのリスト
  const [messages, setMessages] = useState([]);
  // その他の変数（定数）を定義していく．
  // テキストメッセージの最後の行
  const lastLineRef = useRef(null);
  // chat の宛先
  const [chatTo, setChatTo] = useState('*');
  // サーバから送られてくるユーザのリスト
  const [userList, setUserList] = useState([]);

  const paintRef = useRef(null);

  // イベントリスナーの定義
  // text チャットメッセージの受信
  const handleTextMessage = (data) => {
    // メッセージの最後に追加する．
    setMessages((prevMessages) => [...prevMessages, data]);
  };

  // user-list ユーザリストの受信
  const handleUserList = (data) => {
    setUserList(data);
    // 現在の宛先（chatTo）がユーザリスト（data）に含まれていなければ宛先を'*'に設定する．
    if (data.indexOf(chatTo) < 0) {
      setChatTo('*');
    }
  };

  // 時間をフォーマットする関数
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  // 関数の定義
  // チャットのメッセージの送信
  const sendTextMessage = () => {
    if (socket) {
      const now = Date.now();
      socket.emit('text', {
        from: username,
        to: chatTo,
        text: inputMessage,
        image: paintRef.current.getImageDataURL(),
        time: now // タイムスタンプを追加
      });
      setInputMessage(''); // 入力エリアをクリアする．
    } 
  };

  // キー入力のたびにメッセージのテキストを入力するinput要素を更新する．
  const inputChanged = (event) => {
    setInputMessage(event.target.value);
  };

  // Enterキーが押された時にメッセージを送信する．
  const handleKeyUp = (event) => {
    if (event.key === "Enter" && inputMessage.length > 0) {
      sendTextMessage();
    }
  };

  // メッセージの宛先の選択
  const selectChatTo = (event) => {
    setChatTo(event.target.value);
  };

  // コンポーネントがマウントされた時にソケットにイベントリスナーをつける．
  useEffect(() => {
    if (socket) {
      console.log('[TextChat] adding listeners');
      // イベントリスナーを付加する．
      socket.on('text', handleTextMessage);
      socket.on('user-list', handleUserList);
      // 最新のユーザリストを求める．
      socket.emit('user-list', { from: username });
      return () => {
        console.log('[TextChat] removing listeners');
        // イベントリスナーを削除する．
        socket.off('text', handleTextMessage);
        socket.off('user-list', handleUserList);
      };
    }
  }, [socket, username, chatTo]);

  // メッセージの最後までスクロールする．
  useEffect(() => {
    if (lastLineRef.current) {
      lastLineRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [messages]);

  return (
    <div className="text-chat">
      <div className="text-chat-message-list-container">
        <div className="text-chat-message-list">
          {messages.map((message) => (
            <div key={message.from + message.time}
              className={message.from === username ?
                "text-chat-from-me" : "text-chat-from-them"}>
              <div className="text-chat-message">
                <div className="text-chat-from">{message.from}</div>
                <div className="text-chat-message-body">
                  <div>{message.text}</div>
                  {message.image ? <img src={message.image} alt="paint"
                    onClick={(event) =>
                      paintRef.current.putImageDataURL(event.target.src)} />
                    : null}
                </div>
                <div className="text-chat-message-time">{formatTime(message.time)}</div> {/* フォーマットされた時間を表示 */}
              </div>
            </div>))}
          <div ref={lastLineRef}></div>
        </div>
      </div>
      {/* メッセージの入力 */}
      <div className="text-chat-input">
        <select onChange={selectChatTo} value={chatTo}>
          <option value="*">*</option>
          {userList.map((u) => (
            <option key={u} value={u}>{u}</option>))}
        </select>
        <input type="text" onChange={inputChanged}
          value={inputMessage} onKeyUp={handleKeyUp} />
        <button type="button" onClick={sendTextMessage}
          disabled={socket === null || inputMessage === ""}>送信</button>
      </div>
      <Paint ref={paintRef} />
    </div>
  );
}
