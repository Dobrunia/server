import { Router } from 'express';
import { userController } from '../controlers/user-controller';
import { chatController } from '../controlers/chat-controller';
import { messageController, multer } from '../controlers/message-controller';
import { checkHeader } from '../middlewares/auth';

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
router.get('/find-users', checkHeader, userController.findUsers);
router.get('/find-user-by-id', checkHeader, userController.findUserById);
router.get('/get-user-posts', checkHeader, userController.getUserPosts);
router.get('/allUsers', checkHeader, userController.returnAllUsers);
router.get('/getFriendStatusInfo/:myId/:userId/:status', checkHeader, userController.getFriendStatusInfo);
router.get('/getAllFriendsIfnfo/:id', checkHeader, userController.getAllFriendsIfnfo);

//messageController
router.post('/addPost', multer.single('photo'), messageController.addPost);
router.post('/saveMessage', checkHeader, messageController.saveMessage);

//chatController
router.get('/findChatByUserId/:id', checkHeader, chatController.findChatByUserId);
router.get('/getMessagesByChatId/:chatID', checkHeader, chatController.getMessagesByChatId);
router.get('/returnActiveChats/:id', checkHeader, chatController.returnAllUserChats);