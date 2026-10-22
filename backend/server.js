import app from "./app.js";
import connectDB from "./db/db.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
try {
await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
}

}

startServer();
