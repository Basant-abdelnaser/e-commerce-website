const express = require("express");
const {
  getcartItems,
  addToCart,
  updatecartItem,
  deletecartItem,
  clearCart,
  getcartTotal,
} = require("../controllers/cart.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", verifyToken, getcartItems);
router.post("/", verifyToken, addToCart);
router.put("/update", verifyToken, updatecartItem);
router.delete("/clear", verifyToken, clearCart);
router.delete("/:itemId", verifyToken, deletecartItem);
router.get("/total", verifyToken, getcartTotal);

module.exports = router;
