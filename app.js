/**
 * Web Server
 */
// ECMAScript module (ESM)を使うことにする．
// expressのライブラリをimportする．
import express from 'express';
// expressを使用する場合
const app = express();

import path from 'path';
// __filenameと__dirname を ECMAScript moduleでも使用できるようにする．
import { fileURLToPath } from 'url';
// import.meta.urlに実行中のファイルのURL(fileスキーム)が保持されている．
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// データ形式としてJSONをサポートする．大きなデータも送信できるようにlimitを設定する．
app.use(express.json({ extended: true, limit: '100mb' }));

// faviconのサポート
import favicon from 'serve-favicon';
app.use(favicon(path.join(__dirname, 'favicon.ico')));

// 環境変数の設定 (.envファイルがあれば読み込む)
import dotenv from 'dotenv';
dotenv.config();

// 動作確認用
// /test に GETリクエストを送るとテキストを返す．
app.get('/test', (req, res) => {
  res.send('Sample Web Application');
});

// 第１週ミニ課題
// 自分の名前を出力する．
app.get('/myname', (req, res) => {
  /* ここから */
  res.send('田附 麻帆');
  /* ここまで */
});

// Web APIの設定
// JSON Web Tokenを使った簡易ユーザ認証
import jwt from 'jsonwebtoken';
// 共通鍵の設定
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// /login POST
// リクエスト： username, password (JSON形式)
// レスポンス： username, token (JSON形式)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // 簡単にするためusernameとpasswordが同じであればログインに成功と扱う．
  if (username && username === password) {
    // JSON Web tokenを生成する．
    const token = jwt.sign({ username: username }, JWT_SECRET,
      // 有効期限を24時間に設定している．
      { expiresIn: '24h' });
    // username と tokenを返すことにする．
    res.json({ username, token });
  } else {
    // Forbiddenを返す．
    res.sendStatus(403);
  }
});

// ヘッダにトークンがあるかを確認する関数．
const verifyToken = (req, res, next) => {
  // authorizationヘッダを取得する．
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const auth = authHeader.split(' ');
    const token = (auth[0] === 'Bearer') && auth[1];
    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err) {
        // Forbiddenを返す．
        const err = new Error('Not authorized');
        err.status = 403;
        next(err);
      } else {
        // トークンの内容を req.userに保存する．
        req.user = payload;
        // 次の処理に移る．
        next();
      }
    })
  } else {
    // ヘッダが設定されていなければ，Forbiddenを返す．
    const err = new Error('Not authorized');
    err.status = 403;
    next(err);
  }
};

// ToDoリスト（Mockバージョン）
// サーバのメモリ上にToDoリストのデータを保存する．
// /mock-todoのURLでアクセスする．
/* ここから */
import { router as mockTodoRouter } from './routes/mock-todo.js';
app.use('/mock-todo', mockTodoRouter);

/* ここまで */

// ToDoリスト（MongoDBバージョン）
// ToDoリストのデータをMongoDBのデータベースに保存する．
// /todoのURLでアクセスする．
/* ここから */
import { router as todoRouter } from './routes/todo.js';
app.use('/todo', todoRouter);

/* ここまで */

// ToDoリスト (MongoDB + ユーザ認証付き)
// ユーザ認証を行い，ToDoリストのデータをMongoDBのデータベースに保存する．
// /todo-secureのURLでアクセスする．
/* ここから */
// MongoDBのバージョンをユーザ認証付きで/todo-secure のURLで提供する．
app.use('/todo-secure', verifyToken, todoRouter);
/* ここまで */

// ブラウザに提供するファイルの格納場所
app.use(express.static(path.join(__dirname, 'dist')));

// リクエストの処理がここまで達したら，Not Found (404) エラーを返す．
app.use((req, res, next) => {
  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// デフォルトのエラーハンドラーを置き換える．
app.use((err, req, res, next) => {
  console.error(err);
  // エラーの内容をブラウザに通知する．
  // statusがない時は 500 とする．
  res.status(err.status || 500).send(err.toString());
});

// socket.ioの設定
import { createServer } from 'http';
import { Server } from 'socket.io';
const server = createServer(app);
const io = new Server(server);

// Socket.IOにおける認証用の関数
const verifyTokenSocketIO = (socket, next) => {
  // auth には，usernameとtokenがあることを仮定する．
  const { token } = socket.handshake.auth;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err) => {
      if (err) {
        next(new Error('Not authorized'));
      } else {
        next();
      }
    });
  } else {
    next(new Error('no auth in the header'));
  }
};

// 簡易チャットシステム /chatの名前空間を使用する．
const chat = io.of('/chat');
// 認証を通すことにする．
chat.use(verifyTokenSocketIO);
import { chatServer } from './routes/chat-server.js';
chatServer(chat);

// ポート番号
const port = process.env.PORT || 3000;

// MongoDBの設定
import { MongoClient } from 'mongodb';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'webapp';

// MongoDBへのコネクションが成立してからサーバを起動することにする．
// finally節からもアクセスできるようにここでclientの変数を宣言する．
let client;
try {
  // MongoDB コネクションが確立するまで待つ．
  // タイムアウトをデフォルトの30 secから3 sec に短くしている．
  client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
  await client.connect();
  // ここでは，データベースを他のファイルからもアクセスできるようにapp.localsにセットしておく．
  app.locals.db = client.db(DB_NAME);
  console.log(`Connected to MongoDB: (${MONGODB_URI})`);
} catch (error) {
  // MongoDBを使用しない場合を想定し，ServerSelectionエラーは別扱いとする．
  if (error.name !== 'MongoServerSelectionError') {
    console.log(error.message);
  } else {
    console.log(`MongoDB is not available. (${MONGODB_URI})`);
  }
} finally {
  // サーバを起動する．
  server.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  })
  // サーバの終了時にMongoDBとのコネクションもクローズする． 
  const gracefullyShutdown = (signal) => {
    console.log(`${signal} received.`);
    server.close(async () => {
      console.log('HTTP server closed.');
      if (client) {
        await client.close();
        console.log('DB client closed.');
      }
    });
  }
  process.on('SIGINT', gracefullyShutdown);
  process.on('SIGTERM', gracefullyShutdown);
}
