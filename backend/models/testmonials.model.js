const mongoose = require("mongoose");
const testmonialsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  
    message: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    newFlag: {
      type: Boolean,
      default: true,
    },
    visibleToClient: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const Testmonials = mongoose.model("Testmonials", testmonialsSchema);
module.exports = Testmonials;
