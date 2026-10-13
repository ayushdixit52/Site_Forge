const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 400, default: "" },
    previewImage: { type: String, trim: true, default: "" },
    primaryColor: { type: String, match: /^#[0-9a-fA-F]{6}$/, default: "#2563eb" },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    isBuiltIn: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Template", templateSchema);
