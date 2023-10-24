import { ApiError } from './../exceptions/api-error';
import { ResultSetHeader } from 'mysql2';
import { find, conn, set, setPost, findFriendStatusInfo, addFriendStatusInfo, removeFriendRequest, responseToFriend, removePost, returnAllUserInfo, returnFriends, saveMessageToDb } from './sqlwrapper';
import { generateJwtTokens, validateRefreshToken } from './token-service';
import { compareSync } from 'bcrypt-ts';
import { JwtPayload } from 'jsonwebtoken';

export async function findUsername(search_value: string) {
  search_value = '%' + search_value + '%';
  return await find(`users`, 'username LIKE ?', search_value);
}

export async function findUserById(search_Id_Value: string) {
  return await find(`users`, 'id LIKE ?', search_Id_Value);
  //return await returnAllUserInfo(search_Id_Value);
}

export async function getUserPosts(search_Id_Value: string) {
  return await find(`posts`, 'wallId LIKE ?', search_Id_Value);
}

export async function findUserByEmail(email: string) {
  const users = await find(`users`, '`email` = ?', email);
  if (users.length <= 0) {
    //TODO:: падает .length <= 0
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

export async function authorization(email: string, passwordHash: string) {
  const user = await findUserByEmail(email);
  const id = user.id;
  const hash = user.password;
  const username = user.username;
  const avatar = user.avatar;
  if (compareSync(hash, passwordHash)) {
    throw Error('password invalid'); //password invalid;
  }
  const { accessToken, refreshToken } = generateJwtTokens({
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

export async function responseToFriendRequest(myId: string, user_id: string, status: string) {
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
  const user = findUserByEmail(userData.email) as any;
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
    return { email: user.email, username: user.username, avatar: user.avatar, accessToken, refreshToken };
  } else {
    throw ApiError.UnauthorizedError()
  }
}

export async function returnAllUsers() {
  return await find(`users`);
}

export async function getFriendStatusInfo(myId: string, userId: string, status: string) {
  return await findFriendStatusInfo(myId, userId, status);
}

export async function returnFriendsIfnfo(userId: string) {
  return await returnFriends(userId);
}