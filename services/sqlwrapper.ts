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
