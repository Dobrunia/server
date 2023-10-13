import {
  findUsername,
  saveUser,
  confirmEmail,
  authorization,
  changeUsername,
  returnAllUsers,
  findUserById,
  getUserPosts,
  addPost,
} from '../services/user-service';
import { emailVerification } from '../services/mail-service';
import { returnChatId } from '../services/chat-service';

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
    try {
      const { refreshToken } = request.cookies;
    } catch {}
  }
  async changeUsername(request, response, next) {
    const username = request.body.username;
    const email = request.body.email;
    const res = await changeUsername(username, email);
    if (res) {
      response.json(username);
    }
  }
  async addPost(request, response, next) {
    const DATA = request.body.DATA;
    const res = await addPost(DATA);
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
  async findUsers(request, response, next) {
    const searchValue = request.query.search_value;
    const users_response = await findUsername(searchValue);
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
    response.json(users_response);
  }
  async returnAllUsers(request, response, next) {
    const users_response = await returnAllUsers();
    response.json(users_response);
  }
  async findChatByUserId(request, response, next) {
    const chat_id = await returnChatId(request.params.id, request.params.hostUserId);
    response.json(chat_id);
  }
}

export const userController = new UserController();
