import { Router } from 'express';
import { googleCallback } from '../controllers/auth.controller';

const router = Router();

router.get('/google', googleCallback);

export default router;
