const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error.middleware");

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));
app.use(cors());

connectDB();
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/category", require("./routes/category.route"));
app.use("/api/subcategory", require("./routes/subcategory.route"));
app.use("/api/products", require("./routes/products.route"));
app.use("/api/orders", require("./routes/orders.route"));
app.use("/api/cart", require("./routes/cart.route"));
app.use("/api/testmonials", require("./routes/testmonials.route"));
app.use("/api/users", require("./routes/users.route"));

app.use(notFound);
app.use(errorHandler);
app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
