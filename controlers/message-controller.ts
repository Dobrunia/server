import {
    addPost,
  } from '../services/user-service';
  
  import Multer from 'multer';
  
  export const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 32 * 1024 * 1024 // no larger than 32mb
    }
  });
  
  class MessageController {
    
    async addPost(request, response, next) {   
      const DATA = {
        wallId: request.body.wallId,
        authorId: request.body.authorId,
        text: request.body.postText,
        photos: request.file.buffer
      };
      const res = await addPost(DATA);
      if (res) {
        response.json(res);
      } 
    }
    
  }
  
  export const messageController = new MessageController();