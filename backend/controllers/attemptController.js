
const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Attempt = require("../models/Attempt");

async function startAttempt(req, res) {
  try {
    const { examId } = req.body;

    if (!mongoose.isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    const exam = await Exam.findOne({
      _id: examId,
      isPublished: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    let attempt = await Attempt.findOne({
      student: req.user._id,
      exam: exam._id,
      status: "in-progress",
    });

    if (!attempt) {
      attempt = await Attempt.create({
        student: req.user._id,
        exam: exam._id,
        startedAt: new Date(),
        answers: [],
        totalMarks: exam.questions.reduce(
          (sum, question) => sum + question.marks,
          0
        ),
      });
    }

    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
    );

    const remainingSeconds = Math.max(
      0,
      exam.durationMinutes * 60 - elapsedSeconds
    );

    if (remainingSeconds === 0) {
      return res.status(400).json({
        success: false,
        message: "Exam time has expired. Submit your answers if available.",
        attemptId: attempt._id,
        remainingSeconds: 0,
      });
    }

    res.status(201).json({
      success: true,
      message: "Exam started",
      attemptId: attempt._id,
      remainingSeconds,
      exam: {
        _id: exam._id,
        title: exam.title,
        durationMinutes: exam.durationMinutes,
        questions: exam.questions.map((question) => ({
          _id: question._id,
          questionText: question.questionText,
          options: question.options,
          marks: question.marks,
        })),
      },
      savedAnswers: attempt.answers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not start exam",
    });
  }
}

async function submitAttempt(req, res) {
  try {
    const { attemptId, answers } = req.body;

    if (
      !mongoose.isValidObjectId(attemptId) ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid attempt ID and answers array are required",
      });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      student: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    if (attempt.status === "submitted") {
      return res.json({
        success: true,
        message: "Attempt was already submitted",
        result: {
          attemptId: attempt._id,
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          status: attempt.status,
          submittedAt: attempt.submittedAt,
        },
      });
    }

    const exam = await Exam.findById(attempt.exam);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
    );

    const timeExpired = elapsedSeconds >= exam.durationMinutes * 60;

    // Accept only question IDs belonging to this exam.
    const questionMap = new Map(
      exam.questions.map((question) => [
        question._id.toString(),
        question,
      ])
    );

    const answerMap = new Map();

    for (const answer of answers) {
      if (
        !answer ||
        !mongoose.isValidObjectId(answer.questionId) ||
        !questionMap.has(answer.questionId.toString()) ||
        answerMap.has(answer.questionId.toString())
      ) {
        return res.status(400).json({
          success: false,
          message: "An answer contains an invalid or duplicate question ID",
        });
      }

      const question = questionMap.get(answer.questionId.toString());
      const selectedOption = answer.selectedOption;

      if (
        selectedOption !== null &&
        selectedOption !== undefined &&
        (!Number.isInteger(selectedOption) ||
          selectedOption < 0 ||
          selectedOption >= question.options.length)
      ) {
        return res.status(400).json({
          success: false,
          message: "A selected option is invalid",
        });
      }

      answerMap.set(answer.questionId.toString(), {
        questionId: question._id,
        selectedOption:
          selectedOption === undefined ? null : selectedOption,
      });
    }

    let score = 0;
    let totalMarks = 0;

    for (const question of exam.questions) {
      totalMarks += question.marks;

      const answer = answerMap.get(question._id.toString());

      if (
        answer &&
        answer.selectedOption !== null &&
        answer.selectedOption === question.correctAnswer
      ) {
        score += question.marks;
      }
    }

    attempt.answers = exam.questions.map((question) => {
      const answer = answerMap.get(question._id.toString());

      return {
        questionId: question._id,
        selectedOption: answer ? answer.selectedOption : null,
      };
    });

    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();

    await attempt.save();

    res.json({
      success: true,
      message: timeExpired
        ? "Time expired. Your submitted answers have been evaluated."
        : "Exam submitted successfully",
      result: {
        attemptId: attempt._id,
        score,
        totalMarks,
        percentage:
          totalMarks > 0
            ? Number(((score / totalMarks) * 100).toFixed(2))
            : 0,
        status: attempt.status,
        timeExpired,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not submit exam",
    });
  }
}

async function getMyAttempts(req, res) {
  try {
    const attempts = await Attempt.find({
      student: req.user._id,
    })
      .populate("exam", "title durationMinutes")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      attempts: attempts.map((attempt) => ({
        _id: attempt._id,
        exam: attempt.exam,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage:
          attempt.totalMarks > 0
            ? Number(
                ((attempt.score / attempt.totalMarks) * 100).toFixed(2)
              )
            : 0,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch attempt history",
    });
  }
}

module.exports = {
  startAttempt,
  submitAttempt,
  getMyAttempts,
};
