import { Router } from 'express';
import { updateApplication } from '../controllers/application.controller';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.put('/:id', jwtAuthMiddleware, updateApplication);

export default router;
