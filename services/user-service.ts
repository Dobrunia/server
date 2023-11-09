import { ApiError } from './../exceptions/api-error.js';
import { ResultSetHeader } from 'mysql2';
import {
  find,
  conn,
  set,
  setPost,
  findFriendStatusInfo,
  addFriendStatusInfo,
  removeFriendRequest,
  responseToFriend,
  removePost,
  returnFriends,
  saveMessageToDb,
  findPrivateChatId,
  returnAllPrivateChats,
  returnUsersInChat,
  FriendsRequestNotifications,
  returnAllUserPost,
  findUserInfoById,
  createUserInfoTable,
} from './sqlwrapper.js';
import { generateJwtTokens, validateRefreshToken } from './token-service.js';
import bcrypt from 'bcryptjs';
import { JwtPayload } from 'jsonwebtoken';

export async function findUserByName(DATA) {
  DATA.userName = '%' + DATA.userName + '%';
  const usersArray = await find(`users`, `username like ?`, DATA.userName);
  const privateChatsArray = await returnAllPrivateChats();
  for (const user of usersArray) {
    for (const privateChat of privateChatsArray) {
      const usersInChat = await returnUsersInChat(privateChat.id);
      if (
        (usersInChat[0].userID == DATA.myId ||
          usersInChat[1].userID == DATA.myId) &&
        (usersInChat[0].userID == user.id || usersInChat[1].userID == user.id)
      ) {
        // if (DATA.myId == user.id) {
        //   console.log('Это я');
        //   user.chatId = null;
        //   break;
        // } else {
        // console.log('Есть чат');
        user.chatId = privateChat.id;
        break;
        // }
      } else {
        // console.log('Нет чата');
        user.chatId = null;
      }
    }
  }
  return usersArray;
}

export async function findUserById(DATA) {
  //const usersArray = await find(`users`, 'id LIKE ?', DATA.search_value);
  const usersArray = await findUserInfoById(DATA.search_value);
  const privateChatsArray = await returnAllPrivateChats();
  for (const user of usersArray) {
    for (const privateChat of privateChatsArray) {
      const usersInChat = await returnUsersInChat(privateChat.id);
      if (
        (usersInChat[0].userID == DATA.myId ||
          usersInChat[1].userID == DATA.myId) &&
        (usersInChat[0].userID == user.id || usersInChat[1].userID == user.id)
      ) {
        user.chatId = privateChat.id;
        break;
      } else {
        user.chatId = null;
      }
    }
  }
  return usersArray;
}

export async function getUserPosts(search_Id_Value: string) {
  return await returnAllUserPost(search_Id_Value);
}

export async function findUserByEmail(email: string) {
  const users = await find(`users`, '`email` = ?', email);
  if (!users) {
    throw Error('User not found');
  }
  return users[0];
}

export async function isNotUniqueEmail(email: string) {
  const users = await find(`users`, '`email` = ?', email);
  return users.length !== 0;
}

export async function saveUser(
  username: string,
  email: string,
  passwordHash: string,
  avatarUrl?: string,
) {
  if (await isNotUniqueEmail(email)) {
    return false;
  }
  if (!avatarUrl) {
    avatarUrl =
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXjVdhI2sR7J-TH0AImmVysoT76AQahg6Tc2bkR8LidQ&s';
  }
  const result = await conn.query<ResultSetHeader>(
    'INSERT INTO `users` (`id`, `username`, `email`, `password`, `avatar`, `permission`, `isActivated`) VALUES(NULL, ?, ?, ?, ?, 1, false)',
    [username, email, passwordHash, avatarUrl],
  );
  return result[0].insertId;
}

export async function confirmEmail(id: number) {
  const check = await find(`users`, '`id` = ?', id);
  if (check[0]) {
    const isSet = await set(`users`, `isActivated`, true, `id`, id);
    if ((isSet as any).affectedRows === 1) {
      return 'You have successfully verified your email';
    } else {
      return 'Error';
    }
  } else {
    return 'This user does not exist';
  }
}

export async function authorization(email: string, password: string) {
  const user = await findUserByEmail(email);
  const id = user.id;
  const hash = user.password;
  const username = user.username;
  const avatar = user.avatar;
  if (!bcrypt.compareSync(password, hash)) {
    throw Error('password invalid'); //password invalid;
  }
  const { accessToken, refreshToken } = generateJwtTokens({
    id,
    email,
    username,
    avatar,
  });
  await set(
    `users`,
    `refreshToken`,
    `'${refreshToken}'`,
    `email`,
    `'${email}'`,
  );
  return { id, email, username, avatar, accessToken, refreshToken };
}

export async function changeUsername(username: string, email: string) {
  const isSet = await set(
    `users`,
    `username`,
    `'${username}'`,
    `email`,
    `'${email}'`,
  );
  if ((isSet as any).affectedRows === 1) {
    return 'You have successfully changed your username';
  } else {
    return false;
  }
}

export async function changePhoto(userId: string, photoUrl: string) {
  const isSet = await set(
    `users`,
    `avatar`,
    `'${photoUrl}'`,
    `id`,
    `'${userId}'`,
  );
  if ((isSet as any).affectedRows === 1) {
    return 'You have successfully changed your avatar';
  } else {
    return false;
  }
}

export async function changeUserInfo(
  userId: string,
  value: string,
  infoType: string,
) {
  const isSet = await set(
    `user_info`,
    `${infoType}`,
    `'${value}'`,
    `userIdInfo`,
    `'${userId}'`,
  );
  if ((isSet as any).affectedRows === 1) {
    return 'You have successfully changed your info';
  } else {
    return false;
  }
}

export async function isInfoExist(myId: string) {
  const res = await find(`user_info`, '`userIdInfo` = ?', myId);
  if (!res) {
    throw Error('not found');
  }
  return res[0];
}

export async function createUserInfo(myId: string) {
  const res = await createUserInfoTable(myId);
  if (!res) {
    throw Error('not found');
  }
  return res[0];
}

export async function addFriend(myId: string, friendId: string) {
  const isSet = await addFriendStatusInfo(myId, friendId);
  if ((isSet as any).affectedRows === 1) {
    return 'You have successfully send request';
  } else {
    return false;
  }
}

export async function removeFriend(myId: string, friendId: string) {
  const isSet = await removeFriendRequest(myId, friendId);
  if ((isSet as any).affectedRows === 1) {
    return 'You have successfully remove friend';
  } else {
    return false;
  }
}

export async function deletePost(postId: string) {
  const isSet = await removePost(postId);
  if ((isSet as any).affectedRows === 1) {
    return 'You have successfully remove friend';
  } else {
    return false;
  }
}

export async function responseToFriendRequest(
  myId: string,
  user_id: string,
  status: string,
) {
  const isSet = await responseToFriend(myId, user_id, status);
  if ((isSet as any).affectedRows === 1) {
    return 'You have successfully request to user';
  } else {
    return false;
  }
}

export async function addPost(DATA) {
  const isSet = await setPost(DATA);
  if ((isSet as any).affectedRows === 1) {
    return 'You have successfully added the post';
  } else {
    return false;
  }
}

export async function saveMessage(DATA) {
  const isSet = await saveMessageToDb(DATA);
  if ((isSet as any).affectedRows === 1) {
    return 'You have successfully send message';
  } else {
    return false;
  }
}

export async function refresh(refreshToken: string) {
  const userData = validateRefreshToken(refreshToken) as JwtPayload;
  const user = (await findUserByEmail(userData.email)) as any;
  if (user.refreshToken) {
    const { accessToken, refreshToken } = generateJwtTokens({
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    });
    await set(
      `users`,
      `refreshToken`,
      `'${refreshToken}'`,
      `email`,
      `'${user.email}'`,
    );
    return {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      accessToken,
      refreshToken,
    };
  } else {
    throw ApiError.UnauthorizedError();
  }
}

export async function returnAllUsers() {
  return await find(`users`);
}

export async function getFriendsRequestNotifications(myId: string) {
  return await FriendsRequestNotifications(myId);
}

export async function getFriendStatusInfo(myId: string, userId: string) {
  return await findFriendStatusInfo(myId, userId);
}

export async function getAllFriendsInfo(userId: string) {
  return await returnFriends(userId);
}
