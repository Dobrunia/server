import {
  createNewChat,
  returnAllUserChats,
  returnChatId,
  returnMessages,
  writeNewUserInChat,
} from '../services/chat-service';

class ChatController {
  async returnAllUserChats(request, response, next) {
    const userId = request.params.id;
    const chatsResponse = await returnAllUserChats(userId);
    response.json(chatsResponse);
  }

  async createNewChat(request, response, next) {
    const isPrivate = await createNewChat(request.body.isPrivate);
    response.json(isPrivate);
  }

  async writeNewUserInChat(request, response, next) {
    const DATA = {
      userId: request.body.userId,
      chatId: request.body.chatId,
    };
    const isPrivate = await writeNewUserInChat(DATA);
    response.json(isPrivate);
  }

  async getMessagesByChatId(request, response, next) {
    const result = await returnMessages(request.params.chatId);
    response.json(result);
  }

  async findChatByUserId(request, response, next) {
    const chatId = await returnChatId(
      request.params.id,
      request.params.hostUserId,
    );
    response.json(chatId);
  }
}

export const chatController = new ChatController();
