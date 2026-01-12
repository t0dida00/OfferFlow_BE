import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";

const PORT = env.PORT;

(async () => {
    try {
        await connectDB(); // 🔥 MUST await

        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        process.on("SIGTERM", () => {
            console.log("SIGTERM signal received: closing HTTP server");
            server.close(() => {
                console.log("HTTP server closed");
            });
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
})();
