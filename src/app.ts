import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import textAnalyzerRoutes from './routes/textAnalyzer.routes';
import gmailRoutes from './routes/gmail.routes';
import applicationRoutes from './routes/application.routes';
import pdfRoutes from './routes/pdf.routes';
import { errorHandler } from './middleware/error.middleware';
import { env } from './config/env';
import { connectDB } from './config/database';


const app = express();


// Security and Performance Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());



// Routes
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

    res.send(`OfferFlow API is working. Database: ${dbStatus}. `);
});

app.use('/api/v1/text', textAnalyzerRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/gmail', gmailRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/pdf', pdfRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
