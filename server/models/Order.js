const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    storeId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    customer: {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
    },
    items: [{ productId: String, name: String, quantity: { type: Number, min: 1 }, unitPrice: { type: Number, min: 0 } }],
    total: { type: Number, min: 0, required: true },
    paymentMethod: { type: String, enum: ["upi", "cod", "gateway"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "cod-due"], default: "pending" },
    status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], default: "pending", index: true },
    accessToken: { type: String, required: true, select: false },
    confirmationEmailSentAt: { type: Date, default: null },
}, { timestamps: true });

orderSchema.index({ storeId: 1, createdAt: -1 });
module.exports = mongoose.model("Order", orderSchema);
