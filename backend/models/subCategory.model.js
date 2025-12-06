const mongoose = require("mongoose");
const SubCategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});
const SubCategory = mongoose.model("SubCategory", SubCategorySchema);
module.exports = SubCategory;
