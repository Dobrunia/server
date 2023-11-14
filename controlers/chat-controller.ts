import {
  createNewChat,
  returnAllUserChats,
  returnChatId,
  returnMessages,
  writeNewUserInChat,
} from '../services/chat-service.js';
import { returnAllUsersInChat } from '../services/sqlwrapper.js';

class ChatController {
  async returnAllUserChats(request, response, next) {
    try {
      const userId = request.user.id;
      const chatsResponse = await returnAllUserChats(userId);
      response.json(chatsResponse);
    } catch (error) {
      next(error);
    }
  }

  async createNewChat(request, response, next) {
    try {
      const isPrivate = await createNewChat(request.body.isPrivate);
      response.json(isPrivate);
    } catch (error) {
      next(error);
    }
  }

  async writeNewUserInChat(request, response, next) {
    //TODO:: проверить
    try {
      const DATA = {
        userId: request.body.userId ? request.body.userId : request.user.id,
        chatId: request.body.chatId,
      };
      const isPrivate = await writeNewUserInChat(DATA);
      response.json(isPrivate);
    } catch (error) {
      next(error);
    }
  }

  async getMessagesByChatId(request, response, next) {
    try {
      const result = await returnMessages(request.params.chatId);
      response.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findChatByUserId(request, response, next) {
    try {
      const chatId = await returnChatId(
        request.params.id,
        request.params.hostUserId,
      );
      response.json(chatId);
    } catch (error) {
      next(error);
    }
  }

  async findCompanionsData(request, response, next) {
    try {
      const result = await returnAllUsersInChat(request.params.chatId);
      response.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
