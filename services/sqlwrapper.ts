import { Response } from '../types';
import mysql, { RowDataPacket } from 'mysql2';

const poolSize = Number(
  process.env.NODE_ENV === 'production'
    ? process.env.MAX_CONN_POOLSIZE || 10
    : 20,
);
export const conn = mysql
  .createPool({
    connectionLimit: poolSize,
    host: '94.130.167.163',
    user: 'dobru783_user',
    database: 'dobru783_websocketchat',
    password: 'Dobrunia123',
  })
  .promise();

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

export async function findFriendStatusInfo( //TODO:: sql
  str_myId: string,
  str_user_id: string,
  str_status: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const user_id = str_myId.split('=')[1];
    const friend_id = str_user_id.split('=')[1];
    const status = str_status.split('=')[1];
    const sql = `SELECT * FROM friends WHERE user_id = ${user_id} AND friend_id = ${friend_id} AND status = ${status}`;
    // const results = await conn.query<mysql.RowDataPacket[]>(
    //   `SELECT * FROM friends WHERE user_id = ? AND friend_id = ? AND status = ?`,
    //   [user_id, friend_id, status], // userId=27 status=accepted
    // );
    const results = await conn.query<mysql.RowDataPacket[]>(sql);
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function addFriendStatusInfo(
  myId: string,
  friendId: string,
): Promise<mysql.RowDataPacket[]> {
  //TODO:: проверка что в бд есть уже такой запрос
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
      'DELETE FROM `friends` WHERE `user_id` = ? AND `friend_id` = ? AND `status` = ?',
      [user_id, friend_id, `accepted`],
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
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}
