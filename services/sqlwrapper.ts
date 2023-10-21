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

export async function findFriendStatusInfo(
  user_id: string,
  status: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const str_user_id = user_id.split('=')[1];
    const str_status = status.split('=')[1];
    const results = await conn.query<mysql.RowDataPacket[]>(
      'SELECT * FROM friends WHERE user_id = ? AND status = ?',
      [str_user_id, str_status], // userId=27 status=accepted
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}
