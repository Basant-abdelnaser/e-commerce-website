const Product = require("../models/product.model");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const Category = require("../models/category.model");
const SubCategory = require("../models/subCategory.model");
const mongoose = require("mongoose");

exports.addNewProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, subcategory, stock } = req.body;
  const slug = slugify(name, { lower: true });
  if (!req.file) {
    return res.status(400).json({ message: "Image is required" });
  }
  const image = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  const newProduct = new Product({
    name,
    slug,
    description,
    price,
    category,
    subcategory,
    stock,
    image,
  });
  const savedProduct = await newProduct.save();
  res.status(201).json({ message: "Product added successfully", savedProduct });
});
exports.getAllProducts = asyncHandler(async (req, res) => {
  try {
    let queryObj = { isActive: true, isDeleted: false };

    if (req.query.category) {
      let categoryId = req.query.category;

      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        console.log(categoryId);
        const category = await Category.findOne({ name: categoryId });
        console.log(category);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }

        categoryId = category._id;
        console.log(categoryId);
      }

      queryObj.category = categoryId;
      console.log(queryObj);
    }
    if (req.query.subcategory) {
      let subCategoryId = req.query.subcategory;

      if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
        console.log(subCategoryId);
        const subcategory = await SubCategory.findOne({ name: subCategoryId });
        console.log(subcategory);
        if (!subcategory) {
          return res.status(404).json({ message: "Category not found" });
        }

        subCategoryId = subcategory._id;
        console.log(subCategoryId);
      }

      queryObj.subcategory = subCategoryId;
      console.log(queryObj);
    }

    // PRICE FILTER FIX
    if (req.query.price) {
      const price = JSON.parse(req.query.price);
      queryObj.price = {};
      if (price.gte) queryObj.price.$gte = Number(price.gte);
      if (price.lte) queryObj.price.$lte = Number(price.lte);
    }
    console.log(queryObj);
    if (req.query.search) {
      queryObj.name = { $regex: req.query.search, $options: "i" };
    }
    // Build query
    let query = Product.find(queryObj)
      .populate("category")
      .populate("subcategory");

    // Sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort.split(",").join(" "));
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const products = await query;
    // console.log(products);

    // Count total
    const totalProducts = await Product.countDocuments(queryObj);

    res.status(200).json({
      message: "Products fetched successfully",
      results: products.length,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true });
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Product updated successfully", updatedProduct });
});
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
  }
  product.isDeleted = true;
  await product.save();
  res.status(200).json({ message: "Product deleted successfully" });
});

exports.getproductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category")
    .populate("subcategory");
  if (!product) {
    res.status(404).json({ message: "Product not found" });
  } else {
    res.status(200).json({ message: "Product fetched successfully", product });
  }
});
