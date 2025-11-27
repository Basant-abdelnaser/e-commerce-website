const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  valiadateRegUser,
  valiadateLoginUser,
  User,
} = require("../models/user.model");

const registerController = asyncHandler(async (req, res) => {
  const { error } = valiadateRegUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  req.body.password = hashedPassword;
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    addresses: req.body.addresses,
  });
  const savedUser = await newUser.save();
  const token = savedUser.generateToken();
  const { password, ...rest } = savedUser._doc;
  res
    .status(201)
    .json({ message: "User created successfully", ...rest, token });
});

const loginController = asyncHandler(async (req, res) => {
  const { error } = valiadateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = user.generateToken();
  const { password, ...rest } = user._doc;
  res
    .status(200)
    .json({ message: "User logged in successfully", ...rest, token });
});

module.exports = {
  registerController,
  loginController,
};
