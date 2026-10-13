const express = require("express");

const {
    createStore,
    getStore,
    getAllStores,
    updateStore
} = require("../controllers/store.controller");

const router = express.Router();

router.post("/", createStore);

router.get("/", getAllStores);

router.get("/:storeId", getStore);

router.put("/:storeId", updateStore);

module.exports = router;