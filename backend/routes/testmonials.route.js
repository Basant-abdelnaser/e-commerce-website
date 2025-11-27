const express = require("express");
const {
  addNewTestmonial,
  getAllTestmonialsForAdmin,
  getAlltestmonialsForUser,
  updateTestmonial,
} = require("../controllers/testmonials.controller");
const {
  verifyToken,
  verifyAdmin,
  verifyAdminAndUser,
} = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/", verifyToken, verifyAdminAndUser, addNewTestmonial);
router.get("/admin", verifyToken, verifyAdmin, getAllTestmonialsForAdmin);
router.get("/", getAlltestmonialsForUser);
router.put("/:id", verifyToken, verifyAdminAndUser, updateTestmonial);

module.exports = router;
