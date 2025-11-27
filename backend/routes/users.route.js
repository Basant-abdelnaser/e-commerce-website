const express = require("express");
const {
  getAllUsers,
  getBlockedUsers,
  updateUser,
} = require("../controllers/users.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.get("/blocked", verifyToken, verifyAdmin, getBlockedUsers);
router.put("/:id", verifyToken, verifyAdmin, updateUser);

module.exports = router;
