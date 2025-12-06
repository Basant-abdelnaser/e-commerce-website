const express = require("express");
const {
  getAllOrders,
  createNewOrder,
  updateOrder,
  deleteOrder,
  getUserOrders,
} = require("../controllers/order.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getAllOrders);
router.post("/", createNewOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.get("/user", verifyToken, getUserOrders);

module.exports = router;
