const express = require("express");
const {
  getAllOrders,
  createNewOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/order.controller");
const router = express.Router();

router.get("/", getAllOrders);
router.post("/", createNewOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;
