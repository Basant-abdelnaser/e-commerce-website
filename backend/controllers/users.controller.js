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

  const { addresses, ...otherUpdates } = req.body;

  // Handle address updates separately
  if (addresses && Array.isArray(addresses)) {
    // Process each address in the array
    addresses.forEach((newAddress) => {
      // Check if this exact address already exists
      const addressExists = user.addresses.some(
        (addr) =>
          addr.governorate === newAddress.governorate &&
          addr.city === newAddress.city &&
          addr.street === newAddress.street
      );

      if (!addressExists) {
        // If new address should be default, set all others to non-default
        if (newAddress.isDefault) {
          user.addresses.forEach((addr) => {
            addr.isDefault = false;
          });
        }

        // Push the new address
        user.addresses.push({
          governorate: newAddress.governorate,
          city: newAddress.city,
          street: newAddress.street,
          isDefault:
            newAddress.isDefault !== undefined ? newAddress.isDefault : false,
        });
      } else if (newAddress.isDefault) {
        // If address exists but should be set as default
        user.addresses.forEach((addr) => {
          if (
            addr.governorate === newAddress.governorate &&
            addr.city === newAddress.city &&
            addr.street === newAddress.street
          ) {
            addr.isDefault = true;
          } else {
            addr.isDefault = false;
          }
        });
      }
    });
  }

  // Update other fields
  Object.keys(otherUpdates).forEach((key) => {
    user[key] = otherUpdates[key];
  });

  // Save the user with updated addresses
  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    updatedUser: user,
  });
});
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  console.log(req.user);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  return res.status(200).json({ user });
});
