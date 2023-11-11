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
  getAllFriendsInfo,
  getFriendsRequestNotifications,
  changeUserInfo,
  isInfoExist,
  createUserInfo,
} from '../services/user-service.js';
import { emailVerification } from '../services/mail-service.js';
import { config } from '../config.js';

class UserController {
  async authorization(request, response, next) {
    try {
      const userData = await authorization(
        request.body.email,
        request.body.password,
      );
      response.cookie('refreshToken', userData.refreshToken, {
        httpOnly: true,
      });
      response.json(userData);
    } catch (error) {
      next(error);
    }
  }
  async registration(request, response, next) {
    try {
      const DATA = {
        username: request.body.username,
        email: request.body.email,
        passwordHash: request.body.password,
      };
      const userID = await saveUser(
        DATA.username,
        DATA.email,
        DATA.passwordHash,
      );
      if (userID) {
        try {
          await emailVerification(
            DATA.email,
            `${config.serverUrl}/api/emailverification/${userID}`,
          );
        } catch (error) {
          //TODO:: retry
        }
      }
      response.json(userID);
    } catch (error) {
      next(error);
    }
  }
  async refresh(request, response, next) {
    try {
      const { refreshToken } = request.cookies;
      let result = await refresh(refreshToken);
      response.json(result);
    } catch (error) {
      next(error);
    }
  }
  async changeUsername(request, response, next) {
    try {
      const username = request.body.username;
      const email = request.user.email;
      const res = await changeUsername(username, email);
      if (res) {
        response.json(username);
      }
    } catch (error) {
      next(error);
    }
  }
  async changePhoto(request, response, next) {
    try {
      const myId = request.user.id;
      const photoUrl = request.body.photoUrl;
      const res = await changePhoto(myId, photoUrl);
      if (res) {
        response.json(res);
      }
    } catch (error) {
      next(error);
    }
  }
  async changeUserInfo(request, response, next) {
    try {
      const myId = request.user.id;
      const value = request.body.value;
      const tableName = request.body.tableName;
      const isExist = await isInfoExist(myId);
      if (!isExist) {
        await createUserInfo(myId);
      }
      const res = await changeUserInfo(myId, value, tableName);
      if (res) {
        response.json(res);
      }
    } catch (error) {
      next(error);
    }
  }
  async addFriend(request, response, next) {
    try {
      const myId = request.user.id;
      const friendId = request.body.friendId;
      const res = await addFriend(myId, friendId);
      if (res) {
        response.json(res);
      }
    } catch (error) {
      next(error);
    }
  }
  async removeFriend(request, response, next) {
    try {
      const myId = request.user.id;
      const friendId = request.body.friendId;
      const res = await removeFriend(myId, friendId);
      if (res) {
        response.json(res);
      }
    } catch (error) {
      next(error);
    }
  }
  async deletePost(request, response, next) {
    try {
      const postId = request.body.postId;
      const res = await deletePost(postId);
      if (res) {
        response.json(res);
      }
    } catch (error) {
      next(error);
    }
  }
  async responseToFriendRequest(request, response, next) {
    try {
      const myId = request.user.id;
      const friend_id = request.body.friend_id;
      const status = request.body.status;
      const res = await responseToFriendRequest(myId, friend_id, status);
      if (res) {
        response.json(res);
      }
    } catch (error) {
      next(error);
    }
  }
  async verification(request, response, next) {
    try {
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
    } catch (error) {
      next(error);
    }
  }
  async findUserByName(request, response, next) {
    try {
      const DATA = {
        userName: request.params.userName,
        myId: request.user.id,
      };
      const users_response = await findUserByName(DATA);
      response.json(users_response);
    } catch (error) {
      next(error);
    }
  }
  async findUserById(request, response, next) {
    try {
      const DATA = {
        search_value: request.query.search_value,
        myId: request.user.id,
      };
      const users_response = await findUserById(DATA);
      response.json(users_response);
    } catch (error) {
      next(error);
    }
  }
  async getUserPosts(request, response, next) {
    try {
      const search_Id_Value = request.query.search_value;
      const users_response = await getUserPosts(search_Id_Value);
      users_response.forEach((u) => {
        u.photosString = u.photos.toString('base64');
      });
      response.json(users_response);
    } catch (error) {
      next(error);
    }
  }
  async returnAllUsers(request, response, next) {
    try {
      const users_response = await returnAllUsers();
      response.json(users_response);
    } catch (error) {
      next(error);
    }
  }
  async getNotifications(request, response, next) {
    try {
      const users_response = await getFriendsRequestNotifications(
        request.user.id,
      );
      response.json(users_response);
    } catch (error) {
      next(error);
    }
  }
  async isUserLoggedInCheck(request, response, next) {
    try {
      const users_response = request.user.id;
      response.json(users_response);
    } catch (error) {
      next(error);
    }
  }
  async getFriendStatusInfo(request, response, next) {
    try {
      const chat_id = await getFriendStatusInfo(
        request.user.id,
        request.params.userId,
      );
      response.json(chat_id);
    } catch (error) {
      next(error);
    }
  }
  async getAllFriendsInfo(request, response, next) {
    try {
      const chatId = await getAllFriendsInfo(request.params.id);
      response.json(chatId);
    } catch (error) {
      next(error);
    }
  }
  async saveColorsToDb(request, response, next) {
    try {
      const myId = request.user.id;
      const isExist = await isInfoExist(myId);
      if (!isExist) {
        await createUserInfo(myId);
      }
      const res1 = await changeUserInfo(myId, request.body.colorInputNav, 'colorInputNav');
      const res2 = await changeUserInfo(myId, request.body.colorInputAttention, 'colorInputAttention');
      const res3 = await changeUserInfo(myId, request.body.colorInputNavLightBg, 'colorInputNavLightBg');
      if (res1 && res2 && res3) {
        response.json(res3);
      }
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
