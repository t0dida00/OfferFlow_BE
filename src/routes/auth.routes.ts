import { Router } from 'express';
import { googleCallback, getCurrentUser, redirectToGoogle } from '../controllers/auth.controller';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/google', redirectToGoogle);
router.get('/google/callback', googleCallback);
router.get('/me', jwtAuthMiddleware, getCurrentUser);

export default router;
