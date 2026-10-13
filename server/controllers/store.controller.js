const crypto = require("crypto");
const Store = require("../models/Store");

const createStore = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Store name is required"
            });
        }

        const store = await Store.create({
            storeId: crypto.randomUUID(),
            name: name
        });

        res.status(201).json({
            success: true,
            message: "Store created successfully",
            store
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create store"
        });
    }
};


const getStore = async (req, res) => {
    try {
        const { storeId } = req.params;

        const store = await Store.findOne({ storeId });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        res.status(200).json({
            success: true,
            store
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get store"
        });
    }
};

const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get stores"
        });
    }
};
const updateStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { name, status } = req.body;

        const store = await Store.findOne({ storeId });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        if (name !== undefined) {
            store.name = name;
        }

        if (status !== undefined) {
            store.status = status;
        }

        await store.save();

        res.status(200).json({
            success: true,
            message: "Store updated successfully",
            store
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update store"
        });
    }
};

module.exports = {
    createStore,
    getStore,
    getAllStores,
    updateStore
};