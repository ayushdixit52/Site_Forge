const express = require("express");
const Template = require("../models/Template");
const protect = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();
const safeTemplate = (template) => ({
    id: String(template._id), slug: template.slug, name: template.name, category: template.category,
    description: template.description, previewImage: template.previewImage,
    primaryColor: template.primaryColor, config: template.config, status: template.status, isBuiltIn: template.isBuiltIn,
});

router.get("/", async (_req, res, next) => {
    try {
        const templates = await Template.find({ status: "published" }).sort({ isBuiltIn: -1, name: 1 }).lean();
        res.json({ success: true, templates: templates.map(safeTemplate) });
    } catch (error) { next(error); }
});

router.get("/admin/all", protect, requireAdmin, async (_req, res, next) => {
    try {
        const templates = await Template.find().sort({ updatedAt: -1 }).lean();
        res.json({ success: true, templates: templates.map(safeTemplate) });
    } catch (error) { next(error); }
});

router.post("/", protect, requireAdmin, async (req, res, next) => {
    try {
        const { slug, name, category, description = "", previewImage = "", primaryColor = "#2563eb", config = {}, status = "draft" } = req.body || {};
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "") || !String(name || "").trim() || !String(category || "").trim()) {
            return res.status(400).json({ success: false, message: "A valid URL slug, template name and category are required." });
        }
        if (primaryColor && !/^#[0-9a-fA-F]{6}$/.test(primaryColor)) return res.status(400).json({ success: false, message: "Theme color must be a six-digit hex color." });
        const template = await Template.create({ slug, name, category, description, previewImage, primaryColor, config, status: status === "published" ? "published" : "draft" });
        res.status(201).json({ success: true, template: safeTemplate(template) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ success: false, message: "That template slug is already in use." });
        next(error);
    }
});

router.put("/:id", protect, requireAdmin, async (req, res, next) => {
    try {
        const allowed = ["slug", "name", "category", "description", "previewImage", "primaryColor", "config", "status"];
        const update = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
        if (update.primaryColor && !/^#[0-9a-fA-F]{6}$/.test(update.primaryColor)) return res.status(400).json({ success: false, message: "Theme color must be a six-digit hex color." });
        if (update.status && !["draft", "published"].includes(update.status)) return res.status(400).json({ success: false, message: "Template status must be draft or published." });
        const template = await Template.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!template) return res.status(404).json({ success: false, message: "Template not found." });
        res.json({ success: true, template: safeTemplate(template) });
    } catch (error) { next(error); }
});

router.delete("/:id", protect, requireAdmin, async (req, res, next) => {
    try {
        const template = await Template.findByIdAndDelete(req.params.id);
        if (!template) return res.status(404).json({ success: false, message: "Template not found." });
        res.json({ success: true, message: "Template deleted." });
    } catch (error) { next(error); }
});

module.exports = router;
