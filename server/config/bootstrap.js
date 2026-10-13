const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Template = require("../models/Template");
const catalog = require("../data/templateCatalog");

async function bootstrap() {
    for (const [slug, name, category, description, photoId, primaryColor, industry] of catalog) {
        await Template.updateOne({ slug }, {
            $setOnInsert: {
                slug, name, category, description,
                previewImage: photoId ? `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1000&q=80` : "",
                primaryColor, config: { industry }, status: "published", isBuiltIn: true,
            },
        }, { upsert: true });
    }

    const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) {
        console.warn("Platform admin is not initialized. Set ADMIN_USERNAME and ADMIN_PASSWORD in server/.env.");
        return;
    }
    const existing = await User.findOne({ username });
    if (existing) return;
    const hashed = await bcrypt.hash(password, 12);
    await User.create({
        username,
        name: process.env.ADMIN_NAME || "SiteForge Administrator",
        email: (process.env.ADMIN_EMAIL || `${username}@siteforge.local`).toLowerCase(),
        password: hashed,
        role: "admin",
    });
    console.log(`Initial platform admin created for username ${username}.`);
}

module.exports = bootstrap;
