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

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}
function escapeSql(text) {
  return text.replace(/[\0\x08\x09\x1a\n\r"'\\%_]/g, function (char) {
    switch (char) {
      case '\0':
        return '\\0';
      case '\x08':
        return '\\b';
      case '\x09':
        return '\\t';
      case '\x1a':
        return '\\z';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
      case '_':
        return '\\' + char; // экранирование специальных символов
    }
  });
}

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
    return await results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function getCommentsByPost(
  postId,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      `SELECT c.*, u.avatar, u.id AS userId
      FROM comments c
      LEFT JOIN users u ON c.authorId = u.id
      WHERE c.postId = ?`,
      [postId],
    );
    return await results[0];
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
  chatID,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'SELECT * FROM `users_in_chats` WHERE `chatID` = ?',
      [chatID],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function returnAllUsersInChat(
  chatId,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id IN (SELECT userID FROM users_in_chats WHERE chatID = ?)',
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

export async function saveComment(DATA): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'INSERT INTO comments SET ?',
      DATA,
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function createUserInfoTable(
  myId,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      "INSERT INTO `dobru238_websocketchat`.`user_info` (`userIdInfo`, `scrollingText`, `telegramLink`, `steamLink`, `shikimoriLink`, `textStatus`, `backgroundStyle`, `colorInputNav`, `colorInputAttention`, `colorInputNavLightBg`, `usernameFont`, `isRain`) VALUES (?, '', '', '', '', '', '', '#ffffff', '#ffc107', '#222222', '', '')",
      myId,
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function saveMessageToDb(DATA): Promise<mysql.RowDataPacket[]> {
  try {
    const now = new Date();
    const isoDate = now.toISOString();
    const results = await conn.query<RowDataPacket[]>(
      'INSERT INTO `messages`(`id`, `content`, `sendBy`, `chatID`, `datetime`) VALUES (NULL,?,?,?,?)',
      [escapeSql(escapeHtml(DATA.content)), DATA.sendBy, DATA.chatId, isoDate],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function saveNewMessageNotification(
  DATA,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'INSERT INTO `new_massage_notifications`(`id`, `user_id_from`, `chat_id_to`, `message_content`) VALUES (NULL,?,?,?)',
      [DATA.user_id_from, DATA.chat_id_to, DATA.message_content],
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

export async function newMessagesNotifications(
  myId: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<mysql.RowDataPacket[]>(
      `SELECT *
      FROM new_massage_notifications
      JOIN users ON users.id = new_massage_notifications.user_id_from
      WHERE new_massage_notifications.user_id_to = ?`,
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
      `SELECT posts.id AS postsid, posts.wallId, posts.authorId, posts.text, posts.photos, posts.files, posts.postTime, users.*, COUNT(comments.postId) AS commentCount
      FROM posts
      JOIN users ON posts.authorId = users.id
      LEFT JOIN comments ON posts.id = comments.postId
      WHERE posts.wallId LIKE ?
      GROUP BY posts.id`,
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

export async function updateUserStatus(
  user_id: string,
): Promise<mysql.RowDataPacket[]> {
  try {
    const now = new Date();
    const isoDate = now.toISOString();
    const results = await conn.query<RowDataPacket[]>(
      'UPDATE users SET status = ? WHERE id = ?',
      [isoDate, user_id],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function returnPlaylistsByAuthor(
  userId: number,
): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<mysql.RowDataPacket[]>(
      'SELECT * FROM `playlists` WHERE `authorId` = ?',
      [userId],
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function savePlaylist(DATA): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'INSERT INTO playlists SET ?',
      DATA,
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function saveAudioToPlaylist(
  audioId,
  playlistId,
): Promise<mysql.RowDataPacket[]> {
  try {
    const songsArray = await conn.query<RowDataPacket[]>(
      'SELECT songsArray FROM playlists WHERE id = ?',
      [playlistId],
    );

    let newSongsArray = audioId;
    if (songsArray[0][0]) {
      const currentSongsArray = songsArray[0][0].songsArray;
      newSongsArray = `${currentSongsArray}_${audioId}`;

      if (currentSongsArray.includes(audioId)) {
        playlistId = undefined;
      }
    }

    const res = await conn.query<RowDataPacket[]>(
      'UPDATE playlists SET songsArray = ? WHERE id = ?',
      [newSongsArray, playlistId],
    );
    return res[0];
  } catch (ex) {
    console.log(ex);
  }
}

//memory_numbers
export async function returnAllRecords(): Promise<mysql.RowDataPacket[]> {
  try {
    const results = await conn.query<RowDataPacket[]>(
      'SELECT memory_numbers_records.*, users.avatar FROM memory_numbers_records JOIN users ON memory_numbers_records.userId = users.id',
    );
    return results[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function returnRecord(grid): Promise<mysql.RowDataPacket[]> {
  try {
    const result = await conn.query<RowDataPacket[]>(
      'SELECT `time` FROM `memory_numbers_records` WHERE `grid` = ?',
      [grid],
    );
    return result[0];
  } catch (ex) {
    console.log(ex);
  }
}

export async function setRecord(userId, time, grid): Promise<mysql.RowDataPacket[]> {
  try {
    const result = await conn.query<RowDataPacket[]>(
      'UPDATE `memory_numbers_records` SET `userId` = ?, `time` = ? WHERE `grid` = ?',
      [userId, time, grid],
    );
    return result[0];
  } catch (ex) {
    console.log(ex);
  }
}