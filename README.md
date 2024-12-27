# Webアプリケーション 雛形

## Node.js 
Node.jsの処理系を https://nodejs.org からダウンロードし，インストールしておく．

## Webサーバのインストール
必要なライブラリをインストールする．
```shell
npm install
```
## ビルド
Reactのプログラムを変換するためにここではParcel( https://parceljs.org/ )を使用している．
```shell
npm run build
```
## Webサーバの起動
```shell
npm run start
```
ブラウザからは，`http://localhost:3000/` でアクセスできる．
