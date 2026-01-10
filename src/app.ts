import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import textAnalyzerRoutes from './routes/textAnalyzer.routes';
import gmailRoutes from './routes/gmail.routes';
import applicationRoutes from './routes/application.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security and Performance Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/text', textAnalyzerRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/gmail', gmailRoutes);
app.use('/api/v1/applications', applicationRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
