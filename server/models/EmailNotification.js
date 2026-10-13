const mongoose = require("mongoose");

const emailNotificationSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    recipient: { type: String, required: true, trim: true, lowercase: true },
    type: { type: String, enum: ["order-confirmation"], required: true },
    status: { type: String, enum: ["sent", "failed"], required: true },
    error: { type: String, default: "" },
    sentAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("EmailNotification", emailNotificationSchema);
