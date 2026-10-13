const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
    {
        storeId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["draft", "active", "suspended"],
            default: "draft"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Store", storeSchema);