/**
 * 簡易Chatサーバ機能
 *  テキストチャット
 *    宛先を指定したテキストメッセージの送信をサポートする．
 *  ペイントチャット
 *    ペイントコマンドの配送を行う．
 */
export const chatServer = (io) => {
  /// テキストチャットのサポート
  // ユーザ管理：ユーザ名ごとにルームを作成することにしている．
  // 現在接続されているユーザ名のリストを求める．
  const getUserList = () => {
    const usernames = new Set();
    // ルームの一覧からsocketIdがルーム名になっているルームを除く．
    // (socketIdがルーム名となっているルームが暗黙のうちに作成されているため)
    io.adapter.rooms.forEach((socketIds, roomName) => {
      if (!socketIds.has(roomName)) {
        usernames.add(roomName);
      }
    });
    // Setを配列に変換して返す．
    return [...usernames];
  }

  /// ペイントチャットのサポート
  // 途中から参加しても画面が共有できるように，
  // ペイントチャットにおける描画コマンド列を保持する．
  const paintCommandList = [];

  // コネクションがはられた時にsocketを初期化する．
  io.on('connection', (socket) => {
    const username = socket.handshake.auth?.username;
    if (username === undefined) {
      console.log(`[${io.name}] Refusing connection (no username).`);
      socket.disconnect();
      return;
    }
    // デバッグ支援用
    console.log(`[${io.name}] Connected from ${username}`);
    // ユーザ名のroomにjoinすることにする．
    socket.join(username);
    // ユーザが追加されたので，現在のユーザリストをブロードキャストする．
    const userList = getUserList();
    io.emit('user-list', userList);
    // デバッグ支援用
    console.log(`[${io.name}] current users: ${JSON.stringify(userList)}`);

    // ユーザリストのリクエストの処理
    socket.on('user-list', () => {
      // ユーザリストを求め，返す．
      const userList = getUserList();
      socket.emit('user-list', userList);
      // デバッグ支援用
      console.log(`[${io.name}] user-list requested; current users: ${JSON.stringify(userList)}`);
    });

    // テキストメッセージを受け取った時の処理
    socket.on('text', (data) => {
      // サーバでタイムスタンプをつけることにする．
      const msg = { ...data, time: Date.now() };
      // デバッグ支援用
      console.log(`[${io.name}] text: ${JSON.stringify(msg)}`)
      if (!data.to || data.to === '*') {
        // toが指定されていないか，あるいは*の場合は，
        // この名前空間に接続されているソケットすべてに転送する．
        io.emit('text', msg);
      } else {
        // 宛先が指定されている場合は宛先のroomに送る
        io.in(data.to).emit('text', msg);
        // 宛先が自分自身でなければ，送信元のsocketにもコピーを送る．
        if (data.to !== data.from) {
          socket.emit('text', msg);
        }
      }
    });

    // ペイントチャット用にこれまでの描画コマンドを送る．
    socket.on('paint-history', () => {
      // デバッグ支援用
      console.log(`[${io.name}] paint-hisotry requested`);
      paintCommandList.forEach((command) => {
        socket.emit('paint', command);
      });
    });

    // ペイントチャットのメッセージ（描画コマンド）処理
    socket.on('paint', (command) => {
      // デバッグ支援用
      console.log(`[${io.name}] paint: ${JSON.stringify(command)}`)
      // 送られてきた描画コマンドを保存する．
      paintCommandList.push(command);
      // 描画コマンドをbroadcastする．
      io.emit('paint', command);
    });

    // socketが切断された時の処理
    socket.on('disconnect', (reason) => {
      // デバッグ支援用
      console.log(`[${io.name}] Disconnected from ${username}: (${reason})`);

      // テキストチャットのサポート
      // ユーザが退出したので，ユーザ名の一覧を求め，通知する．
      const userList = getUserList();
      io.emit('user-list', userList);
      // デバッグ支援用
      console.log(`[${io.name}] current users: ${JSON.stringify(userList)}`);

      // ペイントチャットのサポート: 
      // ソケットの数が0になった時には描画コマンド列をクリアすることにする．
      if (io.sockets.size === 0) {
        console.log(`[${io.name}] clearing paintCommandList`);
        paintCommandList.splice(0);
      }
    });

    // chatサーバで処理するコマンドを追加する場合はここに追加する．
    // 例えば，以下のようにする．
    // socket.on('command', (data) => {
    //   // 処理を書く
    //   // デバッグ支援用
    //   console.log(`[${io.name}] command: ${JSON.stringify(data)}`);
    //   // 応答を返す
    //   socket.emit('command', { ...data, result: 'ok' });
    //   // 他のクライアントにも通知する場合
    //   // io.emit('command', { ...data, result: 'ok' });
    // });
  });
}
