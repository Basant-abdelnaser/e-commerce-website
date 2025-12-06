const mongoose = require("mongoose");
const BlockListSchima = new moongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const BlockList = mongoose.model("BlockList", BlockListSchima);
module.exports = BlockList;
