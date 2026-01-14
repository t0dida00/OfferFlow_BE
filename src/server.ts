import app from './app';
import { env } from './config/env';

import { connectDB } from './config/database';

const PORT = env.PORT;

// Connect to Database
const startServer = async () => {
    try {
        await connectDB();
        console.log("Database connected successfully");

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
    } catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    }
};

startServer();


