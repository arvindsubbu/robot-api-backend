require("dotenv").config();       
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 3000;

if (!process.env.MONGO_URI) {
  console.warn("MONGO_URI not set add it to your .env file (see .env.example)");
}

const start = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // start Express server
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // Graceful shutdown logic
    const shutdown = (signal) => {
      console.log(`\n Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log("HTTP server closed");
        const mongoose = require("mongoose");
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed");
          process.exit(0);
        });
      });

      // force exit after 10sec if shutdown hangs
      setTimeout(() => {
        console.error("Forcing shutdown");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
