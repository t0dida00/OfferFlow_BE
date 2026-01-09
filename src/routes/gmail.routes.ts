import { Router } from 'express';
import { getRecentEmails, emailAnalysis } from '../controllers/gmail.controller';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', jwtAuthMiddleware, getRecentEmails);
router.get('/analyze', jwtAuthMiddleware, emailAnalysis);

export default router;
