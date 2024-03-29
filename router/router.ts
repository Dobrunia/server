import { Router } from 'express';
import { userController } from '../controlers/user-controller.js';
import { newsController } from '../controlers/news-controller.js';
import { chatController } from '../controlers/chat-controller.js';
import { musicController } from '../controlers/music-controller.js';
import { programsController } from '../controlers/programs-controller.js';
import { messageController, multer } from '../controlers/message-controller.js';
import { checkHeader } from '../middlewares/auth.js';

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
router.post('/changeUserInfo', checkHeader, userController.changeUserInfo);
router.post('/saveColorsToDb', checkHeader, userController.saveColorsToDb);

router.get('/emailverification/:link', userController.verification);
router.get('/refresh', userController.refresh);
router.get('/findUserByName/:userName', checkHeader, userController.findUserByName);
router.get('/findUserById/:userId', checkHeader, userController.findUserById);
router.get('/getMyInfo', checkHeader, userController.getMyInfo);
router.get('/getUserPosts', checkHeader, userController.getUserPosts);
router.get('/allUsers', checkHeader, userController.returnAllUsers);
router.get('/getNotifications', checkHeader, userController.getNotifications);
router.get('/isUserLoggedInCheck', checkHeader, userController.isUserLoggedInCheck);
router.get('/getFriendStatusInfo/:userId', checkHeader, userController.getFriendStatusInfo);
router.get('/getAllFriendsInfo/:id', checkHeader, userController.getAllFriendsInfo);
router.get('/getAllMyFriends', checkHeader, userController.getAllMyFriends);

//messageController
router.post('/addPost', checkHeader, multer.single('photo'), messageController.addPost);
router.post('/saveComment', checkHeader, messageController.saveComment);
// router.post('/saveMessage', checkHeader, messageController.saveMessage);
//router.post('/saveNewMessageNotification', checkHeader, messageController.saveNewMessageNotification);

router.get('/getCommentsByPostId/:postId', checkHeader, messageController.getCommentsByPostId);


//chatController
router.post('/createNewChat', checkHeader, chatController.createNewChat);
router.post('/writeNewUserInChat', checkHeader, chatController.writeNewUserInChat);

router.get('/findChatByUserId/:id', checkHeader, chatController.findChatByUserId);
router.get('/getMessagesByChatId/:chatId', checkHeader, chatController.getMessagesByChatId);
router.get('/returnActiveChats', checkHeader, chatController.returnAllUserChats);
router.get('/findCompanionsData/:chatId', checkHeader, chatController.findCompanionsData);

//musicController
import Multer from 'multer';
const upload = Multer({ dest: 'uploads/' });

router.post('/saveMp3ToServer', checkHeader, upload.fields([{ name: 'audioFile' }, { name: 'imageFile' }]), musicController.saveAudio);
router.post('/savePlaylistToDb', checkHeader, multer.single('playlistPhoto'), musicController.savePlaylist);
router.post('/addAudioToPlaylist', checkHeader, musicController.addAudioToPlaylist);

router.get('/getAllServerTracks', checkHeader, musicController.getAllTracks);
router.get('/getTrackByString/:string', checkHeader, musicController.getTrackByString);
router.get('/getTrackBySongsArray/:songsarray', checkHeader, musicController.getTrackBySongsArray);
router.get('/returnMyPlaylists', checkHeader, musicController.returnMyPlaylists);

//programs-controller
router.post('/checkNewRecord', checkHeader, programsController.checkNewRecord);

router.get('/returnAllRecords', checkHeader, programsController.returnAllRecords);

//news
router.get('/returnCnnNews', checkHeader, newsController.returnCnnNews);
