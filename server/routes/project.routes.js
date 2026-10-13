const express = require("express");
const GeneratedProject = require("../models/GeneratedProject");
const protect = require("../middleware/auth.middleware");

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
    try {
        const projects = await GeneratedProject.find({ owner: req.user.userId }).sort({ updatedAt: -1 }).lean();
        res.json({ success: true, projects: projects.map((project) => ({ ...project, id: String(project._id) })) });
    } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
    try {
        const { name, templateSlug, prompt = "", config } = req.body || {};
        if (!String(name || "").trim() || !String(templateSlug || "").trim() || !config || typeof config !== "object") {
            return res.status(400).json({ success: false, message: "Website name, selected template and configuration are required." });
        }
        const project = await GeneratedProject.create({ owner: req.user.userId, name: String(name).trim(), templateSlug: String(templateSlug).trim(), prompt: String(prompt).slice(0, 5000), config });
        res.status(201).json({ success: true, project: { ...project.toObject(), id: String(project._id) } });
    } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
    try {
        const update = {};
        if (req.body?.name) update.name = String(req.body.name).trim().slice(0, 100);
        if (req.body?.config && typeof req.body.config === "object") update.config = req.body.config;
        if (typeof req.body?.prompt === "string") update.prompt = req.body.prompt.slice(0, 5000);
        const project = await GeneratedProject.findOneAndUpdate({ _id: req.params.id, owner: req.user.userId }, update, { new: true, runValidators: true });
        if (!project) return res.status(404).json({ success: false, message: "Website not found." });
        res.json({ success: true, project: { ...project.toObject(), id: String(project._id) } });
    } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const project = await GeneratedProject.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
        if (!project) return res.status(404).json({ success: false, message: "Website not found." });
        res.json({ success: true });
    } catch (error) { next(error); }
});

module.exports = router;
