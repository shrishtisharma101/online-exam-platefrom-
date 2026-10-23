
const express = require("express");
const router = express.Router();

const {
  startAttempt,
  submitAttempt,
  getMyAttempts,
} = require("../controllers/attemptController");

const { protect } = require("../middleware/auth");

router.post("/start", protect, startAttempt);
router.post("/submit", protect, submitAttempt);
router.get("/my", protect, getMyAttempts);

module.exports = router;
