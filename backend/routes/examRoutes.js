
const express = require("express");
const router = express.Router();

const {
  getExams,
  getExamById,
  createExam,
} = require("../controllers/examController");

const { protect, adminOnly } = require("../middleware/auth");

router.get("/", protect, getExams);
router.get("/:id", protect, getExamById);
router.post("/", protect, adminOnly, createExam);

module.exports = router;
