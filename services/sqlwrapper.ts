import mysql, { RowDataPacket } from 'mysql2';
import { config } from '../config.js';

const poolSize = Number(
  config.env === 'production' ? config.db.poolSize || 10 : 20,
);
export const conn = mysql
  .createPool({
    connectionLimit: poolSize,
    host: config.db.host,
    user: config.db.user,
    database: config.db.database,
    password: config.db.pass,
  })
  .promise();

setInterval(() => {
  conn.query('select 1');
}, 240000);

export async function find(
  tableName: string,
  searchClause?: string,
  args?,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = searchClause
      ? await conn.query<RowDataPacket[]>(
          `SELECT * FROM ${tableName} WHERE ${searchClause}`,
          [args],
        )
      : await conn.query<RowDataPacket[]>(`SELECT * FROM ${tableName}`);
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function findUserInfoById(userId): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      `SELECT * FROM users LEFT JOIN user_info ON users.id = user_info.userIdInfo WHERE users.id LIKE ?`,
      [userId],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function returnAllPrivateChats(): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'SELECT * FROM `chats` WHERE `isPrivate` = 1',
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function returnUsersInChat(
  chatId,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'SELECT * FROM `users_in_chats` WHERE `chatID` = ?',
      [chatId],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function findPrivateChatId(DATA): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>('', [
      DATA.userName,
      DATA.myId,
    ]);
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function set(
  tableName: string,
  setIn: string,
  setContent: any,
  whereColumn: string,
  whereArg: any,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      `UPDATE ${tableName} SET ${setIn} = ${setContent} WHERE ${whereColumn} = ${whereArg};`,
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function setUserInfo(
  userId: string,
  value: string,
  infoType: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'UPDATE `users` SET ?? = ? WHERE `userIdInfo` = ?',
      [infoType, value, userId],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function setPost(DATA): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'INSERT INTO posts SET ?',
      DATA,
    );
    // const results = await conn.query<RowDataPacket[]>(
    //   `INSERT INTO posts (id, wallId, authorId, text, photos, files) VALUES (NULL, '${DATA.wallId}', '${DATA.authorId}', '${DATA.postText}', '${DATA.photo}', '${DATA.file}');`,
    // );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function saveMessageToDb(DATA): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'INSERT INTO `messages`(`id`, `content`, `sendBy`, `chatID`, `datetime`) VALUES (NULL,?,?,?,?)',
      [DATA.content, DATA.sendBy, DATA.chatId, DATA.datetime],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function FriendsRequestNotifications(
  myId: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<mysql.RowDataPacket[]>(
      `SELECT u.*, f.* FROM friends f JOIN users u ON f.user_id = u.id WHERE f.friend_id = ?`,
      [myId],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function findFriendStatusInfo(
  myId: string,
  userId: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    //const sql = `SELECT * FROM friends WHERE user_id = ${myId} AND friend_id = ${userId}`;
    //const results = await conn.query<mysql.RowDataPacket[]>(sql);
    const results = await conn.query<mysql.RowDataPacket[]>(
      `SELECT * FROM friends WHERE user_id = ? AND friend_id = ? OR user_id = ? AND friend_id = ?`,
      [myId, userId, userId, myId],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function addFriendStatusInfo( //TODO:: проверка что в бд есть уже такой запрос
  myId: string,
  friendId: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'INSERT INTO `friends`(`friendship_id`, `user_id`, `friend_id`, `status`) VALUES (NULL,?,?,?)',
      [myId, friendId, 'pending'],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function removeFriendRequest(
  user_id: string,
  friend_id: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'DELETE FROM `friends` WHERE `user_id` = ? AND `friend_id` = ? AND `status` = ? OR `user_id` = ? AND `friend_id` = ? AND `status` = ?',
      [user_id, friend_id, `accepted`, friend_id, user_id, `accepted`],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function responseToFriend(
  myId: string,
  user_id: string,
  status: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'UPDATE `friends` SET `status`=? WHERE `user_id`=? AND `friend_id`=?',
      [status, user_id, myId],
    );
    const ttt = await conn.query<RowDataPacket[]>(
      "DELETE FROM friends WHERE status = 'rejected'",
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function removePost(
  postId: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'DELETE FROM `posts` WHERE `id` = ?',
      [postId],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function returnAllUserPost(
  wallId,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      `SELECT posts.id AS postsid, posts.wallId, posts.authorId, posts.text, posts.photos, posts.files, users.*
      FROM posts
      JOIN users ON posts.authorId = users.id
      WHERE posts.wallId LIKE ?`,
      [wallId],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function returnFriends(userId: string) {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'SELECT * FROM `users` WHERE `id` IN (' +
        'SELECT CASE ' +
        'WHEN `user_id` = ? THEN `friend_id` ' +
        'ELSE `user_id` ' +
        'END ' +
        'FROM `friends` ' +
        "WHERE `status` = 'accepted' AND (`user_id` = ? OR `friend_id` = ?)" +
        ') AND `id` <> ?',
      [userId, userId, userId, userId],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}
