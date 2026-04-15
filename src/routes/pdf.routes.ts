import { Router } from 'express';
import { generatePdf } from '../controllers/pdf.controller';

const router = Router();

router.post('/generate', generatePdf);

export default router;
