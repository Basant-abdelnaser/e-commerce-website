const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const addressSchema = new mongoose.Schema({
  governorate: String,
  city: String,
  street: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    addresses: [addressSchema],
    blocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, isAdmin: this.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};
const User = mongoose.model("User", UserSchema);
const valiadateRegUser = (user) => {
  const addressJoiSchema = joi.object({
    governorate: joi.string(),
    city: joi.string(),
    street: joi.string(),
    isDefault: joi.boolean(),
  });
  const schema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: passwordComplexity().required(),
    phone: joi.string().required(),
    addresses: joi.array().items(addressJoiSchema),
  });
  return schema.validate(user);
};
const valiadateLoginUser = (user) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });
  return schema.validate(user);
};

module.exports = {
  User,
  valiadateRegUser,
  valiadateLoginUser,
};
