import { Router } from 'express';
import { analyze } from '../controllers/textAnalyzer.controller';

const router = Router();

router.post('/analyzer', analyze);

export default router;
