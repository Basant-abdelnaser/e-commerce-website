const express = require("express");
const {
  getAllCategories,
  addNewCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const router = express.Router();

router.get("/", getAllCategories);
router.post("/", addNewCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
module.exports = router;
