const mongoose = require("mongoose");
exports.connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("connected to mongodb");
    })
    .catch((err) => {
      console.log(err);
    });
};
