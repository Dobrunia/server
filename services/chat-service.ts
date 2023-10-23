import { RowDataPacket } from 'mysql2';
import { conn } from './sqlwrapper';
import { Chat } from '../models/chat';
import { Message } from '../models/message';

export async function returnChatId(userId, hostUserId) {
  const results = await conn.query<RowDataPacket[]>(
    'SELECT * FROM `chats` WHERE `isPrivate` = 1 AND `id` IN (SELECT `chatID` FROM `users_in_chats` WHERE `userID` = ?) AND `id` IN (SELECT `chatID` FROM `users_in_chats` WHERE `userID` = ?)',
    [userId, hostUserId],
  );
  return results[0];
}

export async function returnMessages(chatId) {
  const results = await conn.query<RowDataPacket[]>(
    'SELECT m.*, u.id as userId, u.username, u.email, u.avatar, u.permission FROM `messages`AS m LEFT JOIN users AS u ON u.Id = m.sendBy WHERE `chatID` = 2 ORDER BY `datetime` ASC',
    [chatId],
  );
  return results[0].map((u) => {
    const message = new Message();
    message.userId = u.userId;
    message.username = u.username;
    message.email = u.email;
    message.avatar = u.avatar;
    message.permission = u.permission;
    message.id = u.id;
    message.content = u.content;
    message.sendBy = u.sendBy;
    message.chatID = u.chatID;
    message.datetime = u.datetime;
    return message;
  });
}

export async function returnAllUserChats(userId): Promise<Chat[]> {
  const results = await conn.query<RowDataPacket[]>(
    'SELECT * FROM `chats`AS ch LEFT JOIN messages AS m ON m.chatID = ch.Id LEFT JOIN `users_in_chats` AS uc ON uc.chatID = ch.Id LEFT JOIN `users` AS u ON u.Id = uc.userID WHERE ch.Id IN (SELECT `chatID` FROM `users_in_chats` WHERE `userID` = ?) AND m.Id = ( SELECT MAX(Id) FROM `messages` WHERE chatID = ch.Id ) AND u.Id <> ?',
    [userId, userId],
  );
  return results[0].map((ch) => {
    const chat = new Chat();
    chat.userId = ch.id;
    chat.userEmail = ch.email;
    chat.chatId = ch.chatID;
    chat.name = ch.username;
    chat.avatar = ch.avatar;
    chat.last_message = ch.content;
    chat.datetime = ch.datetime;
    return chat;
  });
}
