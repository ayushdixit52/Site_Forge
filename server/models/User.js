const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        username: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true,
            unique: true,
            maxlength: 60
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["owner", "admin"],
            default: "owner"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
