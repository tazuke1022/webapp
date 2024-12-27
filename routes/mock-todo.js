/**
 * ToDoリスト・アプリケーション用のWeb API
 * (メモリ中にデータを保持するモックアップ版）
 */
import { Router } from 'express';

// routerを作成する．
export const router = Router();

// ToDoアプリのデータ
const taskList = [];

// ToDoアプリのタスクのidを作成する関数
// 次に生成するタスクのidを変数に保持するクロージャを返す関数を即時実行して，作成する．
const generateTaskId = (() => {
  let taskId = 0;
  // クロージャを返す
  return () => (taskId++).toString();
})();

// タスクの一覧を返す．
router.get('/', (req, res) => {
  res.json(taskList);
});

// idで指定されたタスクを返す．存在しない場合はNot Found(404)を返す．
router.get('/:id', (req, res) => {
  /* ここから */
  const id = req.params.id;
  const task = taskList.find((task) => task._id === id);
  if (task === undefined) {
    res.sendStatus(404);
  } else {
    res.json(task);
  }




  /* ここまで */
});

// 新しいタスクを追加する．
router.post('/', (req, res) => {
  /* ここから */
  const newTask = req.body;
  newTask._id = generateTaskId();
  taskList.push(newTask);
  // 追加されたタスクのURLを返す．ここでは，requestのURLに対する相対URLを返している．
  res.status(201).location(`${req.baseUrl}/${newTask._id}`).send();

  /* ここまで */
});

// idで指定されたタスクを更新する．
// 本来PUTは，リソースが存在しない場合は新たにリソースを作るが，
// ここではidはサーバ側で作成することに統一するため，新たなリソースは作成せず，
// Bad Request(400)とする．
router.put('/:id', (req, res) => {
  /* ここから */
  const id = req.params.id;
  const putTask = req.body;
  if (putTask._id && putTask._id !== id) {
    res.sendStatus(400);
    return;
  }
  const index = taskList.findIndex((task) => task._id === id);
  if (index < 0) {
    res.sendStatus(400);
    return;
  }
  putTask._id = id;
  taskList[index] = putTask;
  res.sendStatus(204);

  /* ここまで */
});

// idで指定されたタスクを削除する．そのようなタスクが存在しない場合はNot Found(404)を返す．
router.delete('/:id', (req, res) => {
  /* ここから */
  const id = req.params.id;
  const index = taskList.findIndex((task) => task._id === id);
  if (index < 0) {
    res.sendStatus(404);
  } else {
    taskList.splice(index, 1);
    res.sendStatus(204);
  }
  /* ここまで */
});

// PUT とは異なり，タスクの差分のみを更新する．
router.patch('/:id', (req, res) => {
  const id = req.params.id;
  const patchedTask = req.body;
  if (patchedTask._id && patchedTask._id !== id) {
  res.sendStatus(400);
  return;
  }
  const index = taskList.findIndex((task) => task._id === id);
  if (index < 0) {
  res.sendStatus(400);
  return;
  }
  Object.keys(patchedTask).forEach((key) => {
  taskList[index][key] = patchedTask[key];
  });
  res.sendStatus(204);
  });

// すべてのタスクを削除する．（デバッグ支援用）
// idの生成はリセットしないことにする．
router.delete('/', (req, res) => {
  taskList.splice(0);
  // 204(No Content)を返す．
  res.sendStatus(204);
});

// すべてのタスクを置き換える．（デバッグ支援用）
// bodyにタスクのリストを渡す．
router.put('/', (req, res) => {
  const tasks = req.body;
  // タスクのidのリストを求めておく．
  const newTaskList = tasks.map((task) => {
    task._id = generateTaskId();
    return task;
  });
  // taskListを更新する．
  taskList.splice(0, taskList.length, ...newTaskList)
  // タスクの相対URLのリストを返すことにする．
  res.status(201).send(newTaskList.map((task) => `${req.baseUrl}/${task._id}`));
});

