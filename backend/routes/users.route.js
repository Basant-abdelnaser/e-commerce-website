const express = require("express");
const {
  getAllUsers,
  getBlockedUsers,
  updateUser,
  getUser,
} = require("../controllers/users.controller");
const {
  verifyToken,
  verifyAdmin,
  verifyAdminAndUser,
} = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.get("/blocked", verifyToken, verifyAdmin, getBlockedUsers);
router.put("/:id", verifyToken, verifyAdminAndUser, updateUser);
router.get("/user", verifyToken,  getUser);

module.exports = router;
