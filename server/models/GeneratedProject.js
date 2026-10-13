const mongoose = require("mongoose");

const generatedProjectSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    templateSlug: { type: String, required: true, index: true },
    prompt: { type: String, trim: true, maxlength: 5000, default: "" },
    config: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
}, { timestamps: true });

generatedProjectSchema.index({ owner: 1, updatedAt: -1 });
module.exports = mongoose.model("GeneratedProject", generatedProjectSchema);
