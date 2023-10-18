import { returnAllUserChats } from '../services/chat-service';

class ChatController {
  async returnAllUserChats(request, response, next) {
    const userId = request.params.id;
    const chats_response = await returnAllUserChats(userId);
    response.json(chats_response);
  }
}

export const chatController = new ChatController();
