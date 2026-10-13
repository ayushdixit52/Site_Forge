const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Template = require("../models/Template");
const GeneratedProject = require("../models/GeneratedProject");
const Product = require("../models/Product");
const Order = require("../models/Order");
const protect = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();
const loginAttempts = new Map();

router.post("/login", async (req, res, next) => {
    const ip = req.ip || "unknown";
    const recent = (loginAttempts.get(ip) || []).filter((time) => Date.now() - time < 15 * 60 * 1000);
    if (recent.length >= 10) return res.status(429).json({ success: false, message: "Too many login attempts. Try again in 15 minutes." });
    recent.push(Date.now());
    loginAttempts.set(ip, recent);
    try {
        if (!process.env.JWT_SECRET) return res.status(503).json({ success: false, message: "Set JWT_SECRET in server/.env before signing in." });
        const username = String(req.body?.username || "").trim().toLowerCase();
        const password = String(req.body?.password || "");
        if (!username || !password) return res.status(400).json({ success: false, message: "Username and password are required." });
        const admin = await User.findOne({ username, role: "admin" });
        if (!admin || !await bcrypt.compare(password, admin.password)) return res.status(401).json({ success: false, message: "Incorrect administrator username or password." });
        loginAttempts.delete(ip);
        const token = jwt.sign({ userId: String(admin._id), role: "admin" }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "8h" });
        return res.json({ success: true, token, user: { id: String(admin._id), username: admin.username, name: admin.name, role: admin.role } });
    } catch (error) { next(error); }
});

router.get("/me", protect, requireAdmin, async (req, res, next) => {
    try {
        const admin = await User.findById(req.user.userId).select("name username email role");
        if (!admin) return res.status(404).json({ success: false, message: "Administrator account not found." });
        res.json({ success: true, user: admin });
    } catch (error) { next(error); }
});

router.post("/change-password", protect, requireAdmin, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body || {};
        if (typeof newPassword !== "string" || newPassword.length < 12) return res.status(400).json({ success: false, message: "Choose a new password with at least 12 characters." });
        const admin = await User.findById(req.user.userId);
        if (!admin || !await bcrypt.compare(String(currentPassword || ""), admin.password)) return res.status(401).json({ success: false, message: "Current password is incorrect." });
        admin.password = await bcrypt.hash(newPassword, 12);
        await admin.save();
        res.json({ success: true, message: "Administrator password updated." });
    } catch (error) { next(error); }
});

router.get("/stats", protect, requireAdmin, async (_req, res, next) => {
    try {
        const [users, projects, templates, products, orders, revenue] = await Promise.all([
            User.countDocuments({ role: { $ne: "admin" } }), GeneratedProject.countDocuments(),
            Template.countDocuments(), Product.countDocuments(), Order.countDocuments(),
            Order.aggregate([{ $match: { status: { $in: ["confirmed", "processing", "shipped", "delivered"] } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
        ]);
        res.json({ success: true, stats: { users, projects, templates, products, orders, revenue: revenue[0]?.total || 0 } });
    } catch (error) { next(error); }
});

router.get("/projects", protect, requireAdmin, async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const projects = await GeneratedProject.find().populate("owner", "name email").sort({ updatedAt: -1 }).skip((page - 1) * 25).limit(25).lean();
        res.json({ success: true, page, projects });
    } catch (error) { next(error); }
});

module.exports = router;
