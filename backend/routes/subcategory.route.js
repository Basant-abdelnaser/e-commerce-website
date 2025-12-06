const express = require("express");
const {
  getAllSubCategories,
  addNewsubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subcategory.controller");
const router = express.Router();

router.get("/", getAllSubCategories);
router.post("/", addNewsubCategory);
router.put("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

module.exports = router;
