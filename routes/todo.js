/**
 *  ToDoリスト・アプリケーション用のWeb API
 * (MongoDBデータベース中にデータを保持する）
 */
import { Router } from 'express';
import { ObjectId } from 'mongodb';

// MongoDBのcollectionの名前
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'todo';

// routerを作成する
export const router = Router();

// MongoDBとのコネクションは app.locals.dbに設定されている．

// タスクの一覧を返す．
router.get('/', async (req, res, next) => {
  try {
    const filter = req.user ? { username: req.user.username } : {};
    const taskList = await req.app.locals.db.collection(COLLECTION_NAME)
      .find(filter).sort({ _id: 1 }).toArray();
    res.json(taskList);
  } catch (error) {
    next(error);
  }
});

// idで指定されたタスクを返す．存在しない場合はNot Found (404)を返す．
router.get('/:id', async (req, res, next) => {
  try {
    const filter = req.user ? { username: req.user.username } : {};
    const id = req.params.id;
    const item = await req.app.locals.db.collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id), ...filter });
    if (!item) {
      res.sendStatus(404);
    } else {
      res.json(item);
    }
  } catch (error) {
    next(error);
  }
});

// 新しいタスクを追加する．
router.post('/', async (req, res, next) => {
  try {
    const { _id, ...task } = req.body;
    if (req.user) {
      task.username = req.user.username;
    }
    const result = await req.app.locals.db.collection(COLLECTION_NAME)
      .insertOne(task);
    res.status(201).location(`${req.baseUrl}/${result.insertedId}`).send();
  } catch (error) {
    next(error);
  }
});

// idで指定されたタスクを更新する．
// 本来PUTは，リソースが存在しない場合は新たにリソースを作るが，
// ここではidはサーバ側で作成することに統一するため，新たなリソースは作成せず，Bad Request(400)とする
router.put('/:id', async (req, res, next) => {
  try {
    const filter = req.user ? { username: req.user.username } : {};
    const putItem = req.body;
    const id = req.params.id;
    if (!putItem._id || putItem._id !== id) {
      res.sendStatus(400);
    } else {
      const { _id, ...item } = putItem;
      const result = await req.app.locals.db.collection(COLLECTION_NAME)
        .updateOne({ _id: new ObjectId(id), ...filter }, { $set: item });
      if (result.matchedCount === 0) {
        res.sendStatus(400);
      } else {
        res.sendStatus(204);
      }
    }
  } catch (error) {
    next(error);
  }
});

// idで指定されたタスクを削除する．そのようなタスクが存在しない場合はNot Found (404)を返す．
router.delete('/:id', async (req, res, next) => {
  try {
    const filter = req.user ? { username: req.user.username } : {};
    const id = req.params.id;
    const result = await req.app.locals.db.collection(COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id), ...filter });
    if (result.deletedCount === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
});

// タスクの差分のみを更新する．
router.patch('/:id', async (req, res, next) => {
  try {
    const filter = req.user ? { username: req.user.username } : {};
    const id = req.params.id;
    const { _id, ...delta } = req.body;
    if (_id && _id !== id) {
      return res.sendStatus(400);
    }
    const result = await req.app.locals.db.collection(COLLECTION_NAME)
      .updateOne({ _id: new ObjectId(id), ...filter }, { $set: delta });
    if (result.modifiedCount === 0) {
      res.sendStatus(400);
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
});

// すべてのタスクを削除する．（デバッグ支援用）
// 実際にはcollectionごと削除している．
router.delete('/', async (req, res, next) => {
  try {
    await req.app.locals.db.collection(COLLECTION_NAME).drop();
    // 204(No Content)を返す．
    res.sendStatus(204);
  } catch (error) {
    if (error.codeName === 'NamespaceNotFound') {
      // collectionが無かったり，データが追加されていなくてindexが存在しない時は，
      // namespaceが存在しないというエラーになるが，このエラーは無視することにする．
      res.sendStatus(204);
    } else {
      next(error);
    }
  }
});

// すべてのタスクを置き換える．（デバッグ支援用）
// bodyにタスクのリストを渡す．
router.put('/', async (req, res, next) => {
  try {
    // まずすべてのタスクを削除する．
    await req.app.locals.db.collection(COLLECTION_NAME).deleteMany({});
    const tasks = req.body;
    // _idは振り直すので，取り除いておく．
    const newTasks = tasks.map(({ _id, ...rest }) => rest);
    if (newTasks.length === 0) {
      // 空のリストをinsertManyに渡すとエラーになるので，相対URLのリストとして単純に空のリストを返す．
      res.status(201).send([]);
    } else {
      const result = await req.app.locals.db.collection(COLLECTION_NAME)
        .insertMany(newTasks);
      // 相対URLのリストを返すことにする．
      const idList = Object.keys(result.insertedIds).map((key) => `${req.baseUrl}/${result.insertedIds[key]}`);
      res.status(201).send(idList);
    }
  } catch (error) {
    next(error);
  }
});
