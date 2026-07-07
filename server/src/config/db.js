const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected (Cloud): ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Cloud MongoDB connection failed: ${error.message}`);
    console.log("Starting local in-memory MongoDB server as fallback...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const dbBaseDir = path.join(__dirname, "../../.db-data");
      
      // Clean up previous run directories to avoid clutter
      if (fs.existsSync(dbBaseDir)) {
        try {
          fs.rmSync(dbBaseDir, { recursive: true, force: true });
        } catch (e) {
          // Ignore locking issues from other active processes
        }
      }
      
      const dbPath = path.join(dbBaseDir, `db_${Date.now()}`);
      fs.mkdirSync(dbPath, { recursive: true });

      const mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
        }
      });
      const mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started at: ${mongoUri}`);
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error(`Failed to start in-memory MongoDB: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;


