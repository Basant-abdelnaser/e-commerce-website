const Category = require("../models/category.model");
const asynHandler = require("express-async-handler");

exports.addNewCategory = asynHandler(async (req, res) => {
  const newCategory = new Category({
    name: req.body.name,
  });
  const savedCategory = await newCategory.save();
  res
    .status(201)
    .json({ message: "Category added successfully", savedCategory });
});
exports.getAllCategories = asynHandler(async (req, res) => {
  const categories = await Category.find();
  res
    .status(200)
    .json({ message: "Categories fetched successfully", categories });
});
exports.updateCategory = asynHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  const updatedcategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Category updated successfully", updatedcategory });
});
exports.deleteCategory = asynHandler(async (req, res) => {
  // const category = await Category.findById(req.params.id);
  // category.isActive = false;
  // await category.save();
  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Category deleted successfully" });
});
