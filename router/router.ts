import { Router } from 'express';
import { userController } from '../controlers/user-controller';
import { checkHeader } from '../middlewares/auth';

export const router = Router();
router.post('/authorization', userController.authorization);
router.post('/registration', userController.registration);
router.get('/emailverification/:link', userController.verification);
router.get('/refresh', userController.refresh);
 
router.post('/changeUsername', checkHeader, userController.changeUsername);
router.get('/find-users', checkHeader, userController.findUsers);
router.get('/allUsers', checkHeader, userController.returnAllUsers);
router.get('/findChatByUserId/:id', checkHeader, userController.findChatByUserId);