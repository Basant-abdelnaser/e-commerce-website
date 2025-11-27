const asyncHandler = require("express-async-handler");
const { User } = require("../models/user.model");

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ message: "Users fetched successfully", users });
});
exports.getBlockedUsers = asyncHandler(async (req, res) => {
  const blockedUsers = await User.find({ blocked: true });
  res
    .status(200)
    .json({ message: "Blocked users fetched successfully", blockedUsers });
});
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({ message: "User updated successfully", updatedUser });
});
