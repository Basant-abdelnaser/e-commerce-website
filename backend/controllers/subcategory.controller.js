const SubCategory = require("../models/subCategory.model");
const asynHandler = require("express-async-handler");

exports.addNewsubCategory = asynHandler(async (req, res) => {
  const newSubCategory = new SubCategory({
    category: req.body.category,
    name: req.body.name,
  });
  const savedSubCategory = await newSubCategory.save();
  res
    .status(201)
    .json({ message: "subcategory added successfully", savedSubCategory });
});
exports.getAllSubCategories = asynHandler(async (req, res) => {
  const subCategories = await SubCategory.find({ isActive: true }).populate(
    "category"
  );
  res
    .status(200)
    .json({ message: "subcategories fetched successfully", subCategories });
});
exports.updateSubCategory = asynHandler(async (req, res) => {
  const subCategory = await SubCategory.findById(req.params.id);
  if (!subCategory) {
    return res.status(404).json({ message: "subcategory not found" });
  }
  const updatedSubCategory = await SubCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res
    .status(200)
    .json({ message: "subcategory updated successfully", updatedSubCategory });
});
exports.deleteSubCategory = asynHandler(async (req, res) => {
  const category = await SubCategory.findById(req.params.id);
  category.isActive = false;
  await category.save();
  res
    .status(200)
    .json({ message: "subcategory deleted successfully", category });
});
