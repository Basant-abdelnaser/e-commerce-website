const express = require("express");
const {
  addNewTestmonial,
  getAllTestmonialsForAdmin,
  getAlltestmonialsForUser,
  updateTestmonial,
  deleteTestmonial,
} = require("../controllers/testmonials.controller");
const {
  verifyToken,
  verifyAdmin,
  verifyAdminAndUser,
} = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/", verifyToken, addNewTestmonial);
router.get("/admin", verifyToken, verifyAdmin, getAllTestmonialsForAdmin);
router.get("/", getAlltestmonialsForUser);
router.put("/:id", verifyToken, verifyAdminAndUser, updateTestmonial);
router.delete("/:id", verifyToken, verifyAdminAndUser,deleteTestmonial);


module.exports = router;
