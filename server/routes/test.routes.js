const express = require("express");
const { testAPI } = require("../controllers/test.controller");

const router = express.Router();

router.get("/", testAPI);

module.exports = router;