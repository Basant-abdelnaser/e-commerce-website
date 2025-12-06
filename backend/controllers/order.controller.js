const asyncHandler = require("express-async-handler");
const Order = require("../models/order.model");

exports.createNewOrder = asyncHandler(async (req, res) => {
  const daysForrefund = 14;
  const refundDate = new Date();
  refundDate.setDate(refundDate.getDate() + daysForrefund);
  req.body.refundAllowedTill = refundDate;
  const newOrder = new Order(req.body);
  const savedOrder = await newOrder.save();
  res.status(201).json({ message: "Order created successfully", savedOrder });
});
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user")
    .populate("products.product")
    .populate("products.product.category")
    .populate("products.product.subcategory");
  res.status(200).json({ message: "Orders fetched successfully", orders });
});
exports.updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({ message: "Order updated successfully", updatedOrder });
});
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
  }
  await Order.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Order deleted successfully" });
});
exports.getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({user : req.user._id})
    .populate("user")
    .populate("products.product");
  if (!orders) {
    return res.status(404).json({ message: "orders not found" });
  }
  return res.status(200).json({ orders });
});
