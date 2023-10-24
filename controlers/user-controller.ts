import {
  findUserByName,
  saveUser,
  confirmEmail,
  authorization,
  changeUsername,
  returnAllUsers,
  findUserById,
  getUserPosts,
  refresh,
  getFriendStatusInfo,
  addFriend,
  removeFriend,
  responseToFriendRequest,
  deletePost,
  changePhoto,
  returnFriendsIfnfo,
} from '../services/user-service';
import { emailVerification } from '../services/mail-service';

class UserController {
  async authorization(request, response, next) {
    const userData = await authorization(
      request.body.email,
      request.body.passwordHash,
    );
    response.cookie('refreshToken', userData.refreshToken, { httpOnly: true });
    response.json(userData);
  }

  async registration(request, response, next) {
    const DATA = {
      username: request.body.username,
      email: request.body.email,
      passwordHash: request.body.password,
    };
    const userID = await saveUser(DATA.username, DATA.email, DATA.passwordHash);
    if (userID) {
      await emailVerification(
        DATA.email,
        `http://localhost:5000/api/emailverification/${userID}`,
      );
    }
    response.json(userID);
  }

  async refresh(request, response, next) {
    const { refreshToken } = request.cookies;
    let result = await refresh(refreshToken);
    response.json(result);
  }

  async changeUsername(request, response, next) {
    const username = request.body.username;
    const email = request.body.email;
    const res = await changeUsername(username, email);
    if (res) {
      response.json(username);
    }
  }

  async changePhoto(request, response, next) {
    const userId = request.body.userId;
    const photoUrl = request.body.photoUrl;
    const res = await changePhoto(userId, photoUrl);
    if (res) {
      response.json(res);
    }
  }

  async addFriend(request, response, next) {
    const myId = request.body.myId;
    const friendId = request.body.friendId;
    const res = await addFriend(myId, friendId);
    if (res) {
      response.json(res);
    }
  }

  async removeFriend(request, response, next) {
    const myId = request.body.myId;
    const friendId = request.body.friendId;
    const res = await removeFriend(myId, friendId);
    if (res) {
      response.json(res);
    }
  }

  async deletePost(request, response, next) {
    const postId = request.body.postId;
    const res = await deletePost(postId);
    if (res) {
      response.json(res);
    }
  }

  async responseToFriendRequest(request, response, next) {
    const myId = request.body.myId;
    const friend_id = request.body.friend_id;
    const status = request.body.status;
    const res = await responseToFriendRequest(myId, friend_id, status);
    if (res) {
      response.json(res);
    }
  }

  async verification(request, response, next) {
    if (request.params.link) {
      const data = {
        title: 'Email Verification',
        message: '',
      };
      data.message = await confirmEmail(request.params.link);
      // ejs.renderFile('./views/verification.ejs', data, function (err, html) {
      //   if (err) {
      //     console.log(err);
      //     response.status(500).send('Internal Server Error');
      //   } else {
      //     return response.send(html);
      //   }
      // });
      return response.send(
        `<div
      style="
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: vh;
      "
    ><h1>${data.title}</h1><h2>${data.message}</h2></div>`,
      );
    }
  }
  async findUserByName(request, response, next) {
    const DATA = {
      userName: request.params.userName,
      myId: request.params.myId,
    };
    const users_response = await findUserByName(DATA);
    response.json(users_response);
  }
  async findUserById(request, response, next) {
    const search_Id_Value = request.query.search_value;
    const users_response = await findUserById(search_Id_Value);
    response.json(users_response);
  }
  async getUserPosts(request, response, next) {
    const search_Id_Value = request.query.search_value;
    const users_response = await getUserPosts(search_Id_Value);
    users_response.forEach((u) => {
      u.photosString = u.photos.toString('base64');
    });
    response.json(users_response);
  }
  async returnAllUsers(request, response, next) {
    const users_response = await returnAllUsers();
    response.json(users_response);
  }
  async getFriendStatusInfo(request, response, next) {
    const chat_id = await getFriendStatusInfo(
      request.params.myId,
      request.params.userId,
      request.params.status,
    );
    response.json(chat_id);
  }

  async getAllFriendsIfnfo(request, response, next) {
    const chatId = await returnFriendsIfnfo(request.params.id);
    response.json(chatId);
  }
}

export const userController = new UserController();
