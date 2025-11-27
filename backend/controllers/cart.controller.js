const asynchandler = require("express-async-handler");
const Cart = require("../models/cart.model");

exports.getcartItems = asynchandler(async (req, res) => {
  const cartItems = await Cart.find({ user: req.user._id }).populate(
    "products.product"
  );
  if (!cartItems) return res.status(404).json({ message: "Cart not found" });
  res
    .status(200)
    .json({ message: "Cart items fetched successfully", cartItems });
});

exports.addToCart = asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { product, quantity, price } = req.body;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      products: [{ product, quantity, price }],
    });
    return res
      .status(201)
      .json({ message: "Cart created and item added successfully", cart });
  }
  const existingProductIndex = cart.products.findIndex(
    (item) => item.product.toString() === product
  );
  if (existingProductIndex !== -1) {
    cart.products[existingProductIndex].quantity += quantity;
  } else {
    cart.products.push({ product, quantity, price });
  }
  await cart.save();
  res.status(201).json({ message: "Item added to cart successfully", cart });
});

exports.updatecartItem = asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { product, quantity } = req.body;
  if (!product || !quantity) {
    res.status(400).json({ message: "product and quantity are required" });
  }
  if (quantity < 1) {
    res.status(400).json({ message: "quantity must be greater than 0" });
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    res.status(404).json({ message: "cart not found" });
  }
  const productIndex = cart.products.findIndex(
    (item) => item.product.toString() === product
  );
  if (productIndex === -1) {
    res.status(404).json({ message: "product not found in cart" });
  }
  cart.products[productIndex].quantity = quantity;
  await cart.save();
  res.status(200).json({ message: "cart updated successfully", cart });
});

exports.deletecartItem = asynchandler(async (req, res) => {
  const itemId = req.params.itemId;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  cart.products = cart.products.filter((item) => {
    console.log(item._id.toString() !== itemId);
    console.log(item._id.toString(), itemId);
    return item._id.toString() !== itemId;
  });
  console.log(itemId);
  await cart.save();
  console.log(cart.products);
  res.status(200).json({ message: "Item removed from cart successfully" });
});

exports.clearCart = asynchandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  cart.products = [];
  await cart.save();
  res.status(200).json({ message: "Cart cleared successfully" });
});

exports.getcartTotal = asynchandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  const total = cart.products.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  return res
    .status(200)
    .json({ tmessage: "Total fetched successfully", total });
});
