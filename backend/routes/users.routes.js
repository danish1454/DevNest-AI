import {Router} from 'express';
import * as userController from '../controllers/user.controller.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js'

const router = Router();

router.post('/register',
    body('email').isEmail().withMessage('Email must be vaild'),
    body('password').isLength({min:3}).withMessage('Password must of lenght 3'),    
    userController.createUserController);

router.post('/login', 
    body('email').isEmail().withMessage('Email must be vaild'),
    body('password').isLength({min:3}).withMessage('Password must of Length 3'),
        
    userController.loginController);

router.get('/profile', authMiddleware.authUser, userController.profileController);

router.get('/logout', authMiddleware.authUser, userController.logoutController);

export default router;

