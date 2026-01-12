import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

// Connect to Database

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Endpoint: http://localhost:${PORT}/api/v1/text/analyzer`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
