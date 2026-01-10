import { Router } from 'express';
import { googleCallback, getCurrentUser } from '../controllers/auth.controller';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/google', googleCallback);
router.get('/me', jwtAuthMiddleware, getCurrentUser);

export default router;
