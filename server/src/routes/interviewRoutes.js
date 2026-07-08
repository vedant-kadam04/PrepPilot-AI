const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createInterview,
  getInterviews,
  getInterviewById,
  deleteInterview,
  generateInterviewQuestions,
  submitAnswer,
  getInterviewReport,
} = require("../controllers/interviewController");

router.post("/", protect, createInterview);
router.get("/", protect, getInterviews);
router.get("/:id", protect, getInterviewById);
router.delete("/:id", protect, deleteInterview);
router.post(
  "/generate-questions",
   protect,
   generateInterviewQuestions
);
router.post("/:id/answers", protect, submitAnswer);
router.get("/:id/report", protect, getInterviewReport);
module.exports = router;