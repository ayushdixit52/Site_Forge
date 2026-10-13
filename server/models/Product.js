const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    storeId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    category: { type: String, trim: true, maxlength: 100, default: "General" },
    image: { type: String, trim: true, default: "" },
    price: { type: Number, min: 0, required: true },
    compareAtPrice: { type: Number, min: 0, default: null },
    stock: { type: Number, min: 0, default: 0 },
    active: { type: Boolean, default: true, index: true },
    variants: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: true });

productSchema.index({ storeId: 1, active: 1, category: 1 });
module.exports = mongoose.model("Product", productSchema);
