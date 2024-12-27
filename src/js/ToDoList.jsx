// コンポーネントの定義
import '../css/ToDoList.css';
import { useState, useEffect, useContext, useRef } from 'react';
import { LoginContext } from './Authenticate';
import { useLocalStorage } from './useLocalStorage';

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();
const todayStr = `${year.toString()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

export const ToDoList = (props) => {
  const [taskList, setTaskList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const user = useContext(LoginContext);
  const authHeader = user ? { 'Authorization': 'Bearer ' + user.token } : {};
  const deadlineInputRef = useRef(null);
  const priorityInputRef = useRef(null);

  const [showCompleted, setShowCompleted] = useLocalStorage(
    `${document.location.pathname}#ToDoList${props.url}-showCompleted`,
    true
  );

  const [sortTaskList, setSortTaskList] = useLocalStorage(
    `${document.location.pathname}#ToDoList${props.url}-sortTaskList`,
    false
  );

  const [editingTask, setEditingTask] = useState(null);
  // 追加した機能
  const [categories, setCategories] = useState(['仕事', '個人', 'その他']);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const key = `${document.location.pathname}#ToDoList${props.url}-showCompleted`;
    localStorage.setItem(key, JSON.stringify(showCompleted));
  }, [showCompleted]);

  useEffect(() => {
    // コンポーネントがマウントされたときにタスクリストを取得
    getTaskList();
  }, []);

  const getTaskList = async () => {
    try {
      setErrorMessage('');
      // GETリクエストを送る．
      const response = await fetch(props.url, {
        method: 'GET',
        headers: authHeader
      });

      if (!response.ok) {
        // statusが200番台以外の時はエラーとして扱う．
        throw new Error(`${response.status} ${response.statusText}`);
      }
      // JSONレスポンスを取得する．
      const data = await response.json();
      setTaskList(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const addTask = async () => {
    const deadline = deadlineInputRef.current.value;
    const priority = priorityInputRef.current.value;
    try {
      setErrorMessage('');
      // POSTリクエストを送る
      const response = await fetch(props.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          description: taskInput,
          completed: false,
          // ログイン時にはタスクのプロパティにユーザ名を追加することにしている．
          ...(user ? { username: user.username } : {}),
          ...(deadline ? { deadline } : {}),
          priority,
          category: selectedCategory, // カテゴリを追加
        })
      });

      if (!response.ok) {
        // statusが200番台以外の時はエラーとして扱う．
        throw new Error(`${response.status} ${response.statusText}`);
      }
      // 入力エリアをクリアする．
      setTaskInput('');
      deadlineInputRef.current.value = '';
      priorityInputRef.current.value = '0';
      // タスクリストを更新する．
      getTaskList();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      setErrorMessage('');
      // PUTリクエストを送る．
      const response = await fetch(props.url + '/' + updatedTask._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) {
        // statusが200番台以外の時はエラーとして扱う．
        throw new Error(`${response.status} ${response.statusText}`);
      }

      getTaskList();
      setEditingTask(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const deleteTask = async (task) => {
    try {
      setErrorMessage('');
      // DELETEリクエストを送る．
      const response = await fetch(props.url + '/' + task._id, {
        method: 'DELETE',
        headers: authHeader
      });

      if (!response.ok) {
        // statusが200番台以外の時はエラーとして扱う．
        throw new Error(`${response.status} ${response.statusText}`);
      }
      // タスクリストを更新する．
      getTaskList();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleTaskInput = (event) => {
    setTaskInput(event.target.value);
  };

  const isTaskOverdue = (task) => !task.completed && task.deadline && task.deadline < todayStr;

  const compareTask = (a, b) => {
    if (a['completed'] === b['completed']) {
      /* タスクの実行済か否かは同じ場合 */
      const deadlineA = a['deadline'] ? a['deadline'] : '9';
      const deadlineB = b['deadline'] ? b['deadline'] : '9';
      if (deadlineA === deadlineB) {
        /* 締切も同じ場合 */
        if (a['priority'] === b['priority']) {
          return a['_id'] < b['_id'] ? -1 : 1;
        } else {
          return a['priority'] > b['priority'] ? -1 : 1;
        }
      } else {
        return deadlineA < deadlineB ? -1 : 1;
      }
    } else {
      return !a['completed'] ? -1 : 1;
    }
  };

  const filteredTaskList = taskList.filter(
    (task) => (showCompleted || !task['completed'])
  );

  const sortedTaskList = sortTaskList
    ? filteredTaskList.sort(compareTask)
    : filteredTaskList;

  return (
    <div className="todo-list">
      <div className="todo-list-head">
        <span onClick={getTaskList}>ToDoリスト{props.url}</span>
        <label>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => {
              setShowCompleted(e.target.checked);
            }}
          />
          完了済のタスクも表示
        </label>
        <label>
          <input
            type="checkbox"
            checked={sortTaskList}
            onChange={(e) => {
              setSortTaskList(e.target.checked);
            }}
          />
          並べ替え
        </label>
      </div>
      {sortedTaskList.length === 0 ? null : (
        <div className="todo-list-task-list">
          {sortedTaskList.map((task) => (
            <div key={task['_id']} className={"todo-list-task" +
              (task['completed'] ? " todo-list-completed" : "") +
              (isTaskOverdue(task) ? " todo-list-overdue" : "")} >
              {/* 編集モードかどうかで表示を切り替える */}
              {editingTask && editingTask._id === task._id ? (
                <>
                  <input
                    type="text"
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value
                      })
                    }
                  />
                  <select
                    value={editingTask.priority || '0'}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value
                      })
                    }
                  >
                    <option value="3">★★★</option>
                    <option value="2">★★☆</option>
                    <option value="1">★☆☆</option>
                    <option value="0">☆☆☆</option>
                  </select>
                  <input
                    className="todo-list-deadline"
                    type="date"
                    value={editingTask.deadline || ''}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        deadline: e.target.value
                      })
                    }
                  />
                  {/* カテゴリ-の選択を追加 */}
                  <select
                    value={editingTask.category}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, category: e.target.value })
                    }
                  >
                    <option value="仕事">仕事</option>
                    <option value="個人">個人</option>
                    <option value="その他">その他</option>
                  </select>
                  <button onClick={() => updateTask(editingTask)}>
                    保存
                  </button>
                  <button onClick={() => setEditingTask(null)}>
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={task['completed']}
                    onChange={(e) =>
                      updateTask({ ...task, completed: e.target.checked })
                    }
                  ></input>
                  <span className="todo-list-description">
                    {task['description']}
                  </span>
                  <span className="todo-list-priority">
                    {['☆☆☆', '★☆☆', '★★☆', '★★★'][task['priority']]}
                  </span>
                  <span className="todo-list-deadline">
                    {task['deadline']}
                  </span>
                  <span className="todo-list-username">
                    【{task['username']}】
                  </span>
                  <span className="todo-list-category">
                    {task['category'] === '個人' ? (
                      <span className="circle-blue"> </span>
                    ) : task['category'] === '仕事' ? (
                      <span className="circle-orange"> </span>
                    ) : (
                      <span className="circle-purple"> </span>
                    )}
                    {task['category']}
                  </span>

                  <button onClick={() => setEditingTask(task)}>編集</button>
                  <button onClick={() => deleteTask(task)}>削除</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {/* 新規タスクの追加 */}
      <div className="todo-list-task-input">
        <input
          type="text"
          onChange={handleTaskInput}
          placeholder="タスク"
          value={taskInput}
        />
        <select defaultValue="0" ref={priorityInputRef}>
          <option value="3">★★★</option>
          <option value="2">★★☆</option>
          <option value="1">★☆☆</option>
          <option value="0">☆☆☆</option>
        </select>
        {/* 追加した機能 */}
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">カテゴリーを選択</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input type="date" ref={deadlineInputRef} defaultValue="" />
        <button type="button" onClick={addTask}>
          追加
        </button>
      </div>
      {/* エラーメッセージの表示 */}
      {errorMessage === '' ? null : (
        <div className="error-message" onClick={() => setErrorMessage('')}>
          {errorMessage}
        </div>
      )}

    </div>
  );
};


