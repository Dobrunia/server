import { getCommentsByPost, saveComment } from '../services/sqlwrapper.js';
import { addPost, saveMessage } from '../services/user-service.js';

import Multer from 'multer';

export const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 32 * 1024 * 1024, // no larger than 32mb
  },
});

class MessageController {
  async addPost(request, response, next) {
    try {
      const DATA = {
        wallId: request.body.wallId,
        authorId: request.user.id,
        text: request.body.postText ? request.body.postText : '',
        photos: request.file ? request.file.buffer : '',
        postTime: request.body.postTime,
      };
      const res = await addPost(DATA);
      if (res) {
        response.json(res);
      }
    } catch (error) {
      next(error);
    }
  }

  async saveComment(request, response, next) {
    try {
      const DATA = {
        postId: request.body.postId,
        authorId: request.body.authorId === null ? request.body.authorId : request.user.id,
        commentText: request.body.commentText,
      };
      const res = await saveComment(DATA);
      if (res) {
        response.json(res);
      }
    } catch (error) {
      next(error);
    }
  }

  async saveMessage(request, response, next) {
    try {
      const DATA = {
        chatId: request.body.message.chatId,
        content: request.body.message.content,
        datetime: request.body.message.datetime,
        sendBy: request.body.message.sendBy,
      };
      const res = await saveMessage(DATA);
      if (res) {
        response.json(res);
      }
    } catch (error) {
      next(error);
    }
  }

  async getCommentsByPostId(request, response, next) {
    try {
      const users_response = await getCommentsByPost(request.params.postId);
      response.json(users_response);
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
