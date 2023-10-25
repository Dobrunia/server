import { Router } from 'express';
import { userController } from '../controlers/user-controller';
import { chatController } from '../controlers/chat-controller';
import { messageController, multer } from '../controlers/message-controller';
import { checkHeader } from '../middlewares/auth';
import { verifyAccount } from '../middlewares/permission';

export const router = Router();
//userController
router.post('/authorization', userController.authorization);
router.post('/registration', userController.registration);
router.post('/changeUsername', checkHeader, userController.changeUsername);
router.post('/changePhoto', checkHeader, userController.changePhoto);
router.post('/addFriend', checkHeader, userController.addFriend);
router.post('/responseToFriendRequest', checkHeader, userController.responseToFriendRequest);
router.post('/removeFriend', checkHeader, userController.removeFriend);
router.post('/deletePost', checkHeader, userController.deletePost);

router.get('/emailverification/:link', userController.verification);
router.get('/refresh', userController.refresh);
router.get('/findUserByName/:userName', checkHeader, userController.findUserByName);
router.get('/findUserById', checkHeader, userController.findUserById);
router.get('/getUserPosts', checkHeader, userController.getUserPosts);
router.get('/allUsers', checkHeader, userController.returnAllUsers);
router.get('/getFriendStatusInfo/:myId/:userId/:status', checkHeader, userController.getFriendStatusInfo);
router.get('/getAllFriendsInfo/:id', checkHeader, userController.getAllFriendsInfo);

//messageController
router.post('/addPost', checkHeader, multer.single('photo'), messageController.addPost);
router.post('/saveMessage', checkHeader, messageController.saveMessage);

//chatController
router.post('/createNewChat', checkHeader, chatController.createNewChat);
router.post('/writeNewUserInChat', checkHeader, chatController.writeNewUserInChat);

router.get('/findChatByUserId/:id', checkHeader, chatController.findChatByUserId);
router.get('/getMessagesByChatId/:chatId', checkHeader, chatController.getMessagesByChatId);
router.get('/returnActiveChats', checkHeader, chatController.returnAllUserChats);