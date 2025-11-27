const express = require("express");
const {
  getAllSubCategories,
  addNewsubCategory,
} = require("../controllers/subcategory.controller");
const router = express.Router();

router.get("/", getAllSubCategories);
router.post("/", addNewsubCategory);
module.exports = router;
