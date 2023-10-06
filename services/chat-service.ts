import { RowDataPacket } from 'mysql2';
import { conn } from './sqlwrapper';

export async function returnChatId(userId, hostUserId) {
   const results = await conn.query<RowDataPacket[]>(
    'SELECT * FROM `chats` WHERE `isPrivate` = TRUE AND `id` IN (SELECT `chatID` FROM `users_in_chats` WHERE `userID` = ?) AND `id` IN (SELECT `chatID` FROM `users_in_chats` WHERE `userID` = ?)',
    [userId, hostUserId],
  );
  return results[0];
}
