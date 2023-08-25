import { Router } from 'express';
import { userController } from '../controlers/user-controller';
import { checkHeader } from '../middlewares/auth';

export const router = Router();
router.post('/authorization', userController.authorization);
router.post('/registration', userController.registration);
router.post('/changeUsername', checkHeader, userController.changeUsername);
router.get('/emailverification/:link', userController.verification);
router.get('/find-users', checkHeader, userController.findUsers);
router.get('/refresh', userController.refresh);
