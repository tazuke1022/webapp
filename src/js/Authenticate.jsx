/**
 * 簡易ログイン機能
 * <Authenticate> ... </Authenticate>
 * 
 * 未ログイン時: ログインの画面を表示する．
 * ログイン時：子要素を表示する．ならびにログオフボタンを上部に表示する．
 * 
 * [自動ログインの実験的機能]
 * propsとして，username, passwordが渡されると，コンポーネントのマウント時に
 * 指定されたusernameとpasswordを使って自動的にログインを試みることにする．
 * ログアウトボタンは表示されない．
 * [開発支援用：localStorageにユーザ名を保存する機能]
 * propsに usernameSaveKey が指定されると，
 * usernameSaveKeyで指定された値をkeyとしてlocalStorageにユーザ名を保存する．
 * 保存されたユーザ名は，次回のマウント時に自動的に読み込まれ，ユーザ名に設定される．
 * その際には便宜的にpasswordはusernameと同じものに設定される．
 * ユーザはログインボタンをクリックすればログインされることになる．
 */
import '../css/Authenticate.css';

import { useState, useRef, createContext, useEffect } from 'react';

// ユーザ情報を子要素に渡すために context を使用する．
export const LoginContext = createContext();

export const Authenticate = (props) => {
  // localStorageに保存するユーザ名のキー
  const usernameKey = props.usernameSaveKey ?
    `${document.location.pathname}#Authenticate${props.usernameSaveKey}` : undefined;
  // localStorageからユーザ名を取得する．無ければ値をnullにする．
  const savedUsername = usernameKey ? localStorage.getItem(usernameKey) : null;

  // ユーザ名の入力
  const [usernameInput, setUsernameInput] = useState(props.username !== undefined ?
    props.username : savedUsername);

  // passwordの入力 useRefを使って，値を取得する．
  const passwordInputRef = useRef('');

  // /loginにPOSTリクエストを送った際のエラーメッセージを表示する．
  const [errorMessage, setErrorMessage] = useState('');

  // ユーザ情報（usernameとtoken）を保持する．
  const [user, setUser] = useState(null);

  // ログイン：loginのAPIを呼ぶ．
  const login = async () => {
    try {
      setErrorMessage('');
      const response = await fetch('/login', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // username と password を渡す．
          username: usernameInput,
          password: passwordInputRef.current.value
        })
      });
      if (!response.ok) {
        // statusが200番台以外の時はエラーとして扱う．
        if (response.status === 403) {
          // Forbiddenエラーであれば，ログインエラーとして扱う．
          throw new Error('ログイン・エラー');
        } else {
          // それ以外であれば，statusコードとstatusテキストをエラーとして表示することにする．
          throw new Error(`${response.status} ${response.statusText}`);
        }
      }
      // ユーザ情報（usernameとtoken）がJSONレスポンスとして返ってくるので，これをuserに保存する．
      const data = await response.json();
      setUser(data);
      // ユーザ名をlocalStorageに保存する．
      if (usernameKey !== undefined) {
        localStorage.setItem(usernameKey, usernameInput);
      }
    } catch (error) {
      setErrorMessage(error.message);
      // エラーの場合は，ユーザ情報を削除することにする．
      setUser(null);
      if (usernameKey !== undefined) {
        localStorage.removeItem(usernameKey);
      }
    }
  };

  // ログアウト：ユーザ情報を削除する．
  const logout = () => {
    setUser(null);
    if (usernameKey !== undefined) {
      localStorage.removeItem(usernameKey);
    }
  };

  // 実験的な自動ログイン機能
  useEffect(() => {
    // usernameとpasswordがpropsに指定されている時には自動ログインを行うことにする．
    if (props.username !== undefined && props.password !== undefined) {
      // passwordを設定する．
      passwordInputRef.current.value = props.password;
      // ログインを試みる．
      login();
    } else if (usernameKey !== undefined) {
      // ユーザ名をlocalStorageから取得する．
      const username = localStorage.getItem(usernameKey);
      if (username !== null) {
        // 便宜的にpasswordをusernameと同じものに設定する．
        passwordInputRef.current.value = username;
        // ユーザ名を設定する．
        setUsernameInput(username);
        // 自動的にログインする場合は，loginを呼ぶ．
        // login();
      }
    }
  }, []);

  return (user ?
    <div>
      {/* ログインしている場合 */}
      <div className="authenticate-logout">
        <span>User: {user ? user.username : ''}</span>
        {/* 自動ログインの場合はログアウトボタンを表示しないことにする． */}
        {(props.username !== undefined && props.password !== undefined) ? null :
          <button type="button" onClick={logout}>ログアウト</button>}
      </div>
      <LoginContext.Provider value={user}>
        {/* userをLoginContextに渡すとともに，子要素を表示する． */}
        {props.children}
      </LoginContext.Provider>
    </div>
    :
    <div>
      {/* 未ログインの場合 */}
      <div className="authenticate-login">
        <label>
          <span>ユーザ名:</span>
          <span><input type="text" placeholder="ユーザ名"
            onChange={(event) => setUsernameInput(event.target.value)} value={usernameInput} />
          </span>
        </label>
        <label>
          <span>パスワード:</span>
          <span><input type="password" ref={passwordInputRef}
            placeholder="パスワード" defaultValue='' />
          </span>
        </label>
        <button type="button" onClick={login}>ログイン</button>
      </div>
      <div>
        {errorMessage === '' ? null :
          <div className="error-message" onClick={() => setErrorMessage('')}>
            {errorMessage}</div>}
      </div>
    </div>
  );
};

