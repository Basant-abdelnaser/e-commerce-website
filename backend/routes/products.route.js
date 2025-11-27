const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");
const {
  addNewProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getproductBySlug,
} = require("../controllers/products.controller");

router.post(
  "/",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  addNewProduct
);
router.get("/", getAllProducts);
router.put("/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);
router.get("/:slug", getproductBySlug);
module.exports = router;
