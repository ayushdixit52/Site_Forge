const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const testRoutes = require("./routes/test.routes");

const connectDB = require("./config/db");
const storeRoutes = require("./routes/store.routes");
const userRoutes = require("./routes/user.routes");
const aiRoutes = require("./routes/ai.routes");
const adminRoutes = require("./routes/admin.routes");
const templateRoutes = require("./routes/template.routes");
const projectRoutes = require("./routes/project.routes");

const app = express();

const PORT = process.env.PORT || 5001;

// Connect MongoDB when configured. The app remains available for local template previews without it.
connectDB();

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://127.0.0.1:3000").split(",").map((origin) => origin.trim());
app.use(cors({ origin: (origin, callback) => {
    const isLocalDevelopmentOrigin = process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin || "");
    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) return callback(null, true);
    return callback(new Error("This origin is not allowed by CORS"));
} }));
app.use(express.json({ limit: "1mb" }));

// Test API
app.use("/api/test", testRoutes);

app.use("/api/stores", storeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/projects", projectRoutes);
app.get("/api/health", (_req, res) => res.json({ success: true, database: mongoose.connection.readyState === 1 ? "connected" : process.env.MONGO_URI ? "connecting" : "not-configured", ai: process.env.GEMINI_API_KEY ? "configured" : "not-configured" }));

app.use((error, _req, res, _next) => {
    console.error("API error:", error.message);
    res.status(error.status || 500).json({ success: false, message: error.message || "Unexpected server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
