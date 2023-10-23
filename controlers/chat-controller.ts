import { returnAllUserChats, returnChatId, returnMessages } from '../services/chat-service';

class ChatController {
  async returnAllUserChats(request, response, next) {
    const userId = request.params.id;
    const chatsResponse = await returnAllUserChats(userId);
    response.json(chatsResponse);
  }
  
  async findChatByUserId(request, response, next) {
    const chatId = await returnChatId(
      request.params.id,
      request.params.hostUserId,
    );
    response.json(chatId);
  }

  async getMessagesByChatId(request, response, next) {
    const chatId = await returnMessages(request.params.chatID);
    response.json(chatId);
  }
}

export const chatController = new ChatController();
