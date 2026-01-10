import { Router } from 'express';
import { getRecentEmails, emailAnalysis, getStoredEmails, getStoredApplications } from '../controllers/gmail.controller';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', jwtAuthMiddleware, getRecentEmails);
router.post('/analyze', jwtAuthMiddleware, emailAnalysis);
router.get('/emails', jwtAuthMiddleware, getStoredEmails);
router.get('/applications', jwtAuthMiddleware, getStoredApplications);

export default router;
