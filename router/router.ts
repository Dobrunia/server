import { Router } from 'express';
import { userController } from '../controlers/user-controller';
import { chatController } from '../controlers/chat-controller';
import { messageController, multer } from '../controlers/message-controller';
import { checkHeader } from '../middlewares/auth';

export const router = Router();
router.post('/authorization', userController.authorization);
router.post('/registration', userController.registration);
router.get('/emailverification/:link', userController.verification);
router.get('/refresh', userController.refresh);

router.post('/changeUsername', checkHeader, userController.changeUsername);
router.post('/addPost', multer.single('photo'), messageController.addPost);
router.get('/find-users', checkHeader, userController.findUsers);
router.get('/find-user-by-id', checkHeader, userController.findUserById);
router.get('/get-user-posts', checkHeader, userController.getUserPosts);
router.get('/allUsers', checkHeader, userController.returnAllUsers);
router.get('/findChatByUserId/:id', checkHeader, userController.findChatByUserId);
router.get('/getFriendStatusInfo/:myId/:userId/:status', checkHeader, userController.getFriendStatusInfo);



router.get('/returnActiveChats/:id', checkHeader, chatController.returnAllUserChats);