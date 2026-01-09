import { Router } from 'express';
import { getRecentEmails } from '../controllers/gmail.controller';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', jwtAuthMiddleware, getRecentEmails);

export default router;
