const asyncHandler = require("express-async-handler");
const Testmonials = require("../models/testmonials.model");

exports.addNewTestmonial = asyncHandler(async (req, res) => {
  const newTestmonial = new Testmonials({
    user: req.user._id,
    // product: req.body.product,
    message: req.body.message,
    rating: req.body.rating,
  });
  const savedTestmonial = await newTestmonial.save();
  res
    .status(201)
    .json({ message: "Testmonial added successfully", savedTestmonial });
});
exports.getAllTestmonialsForAdmin = asyncHandler(async (req, res) => {
  const testmonials = await Testmonials.find({ isDeleted: false }).populate(
    "user"
  );

  res
    .status(200)
    .json({ message: "Testmonials fetched successfully", testmonials });
});
exports.getAlltestmonialsForUser = asyncHandler(async (req, res) => {
  const testmonials = await Testmonials.find({
    visibleToClient: true,
    isDeleted: false,
  }).populate("user");
  res
    .status(200)
    .json({ message: "Testmonials fetched successfully", testmonials });
});
exports.updateTestmonial = asyncHandler(async (req, res) => {
  const testmonial = await Testmonials.findById(req.params.id);
  if (!testmonial) {
    return res.status(404).json({ message: "Testmonial not found" });
  }
  const updatedTestmonial = await Testmonials.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Testmonial updated successfully", updatedTestmonial });
});
exports.deleteTestmonial = asyncHandler(async (req, res) => {
  const testmonial = await Testmonials.findById(req.params.id);
  if (!testmonial) {
    return res.status(404).json({ message: "Testmonial not found" });
  }
  testmonial.isDeleted = true;
  await testmonial.save();
  res
    .status(200)
    .json({ message: "Testmonial deleted successfully", testmonial });
});
