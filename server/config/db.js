const mongoose = require("mongoose");
const bootstrap = require("./bootstrap");

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.warn("MongoDB is not configured. Set MONGO_URI in server/.env to enable database features.");
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);

        await bootstrap();

        console.log("MongoDB connected successfully");
        return true;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.warn("The API will stay online, but database-backed requests will not work until MongoDB is available.");
        return false;
    }
};

module.exports = connectDB;
