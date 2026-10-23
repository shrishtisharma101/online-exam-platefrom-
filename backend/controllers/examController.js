
const Exam = require("../models/Exam");

function safeExam(exam) {
  const data = exam.toObject ? exam.toObject() : exam;

  return {
    _id: data._id,
    title: data.title,
    description: data.description,
    durationMinutes: data.durationMinutes,
    questions: data.questions.map((question) => ({
      _id: question._id,
      questionText: question.questionText,
      options: question.options,
      marks: question.marks,
    })),
    createdAt: data.createdAt,
  };
}

async function getExams(req, res) {
  try {
    const exams = await Exam.find({ isPublished: true })
      .select("title description durationMinutes questions createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      exams: exams.map((exam) => ({
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.questions.length,
        totalMarks: exam.questions.reduce(
          (sum, question) => sum + question.marks,
          0
        ),
        createdAt: exam.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch exams",
    });
  }
}

async function getExamById(req, res) {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      isPublished: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.json({
      success: true,
      exam: safeExam(exam),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid exam ID",
    });
  }
}

async function createExam(req, res) {
  try {
    const { title, description, durationMinutes, questions, isPublished } =
      req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, valid duration and at least one question are required",
      });
    }

    for (const question of questions) {
      if (
        typeof question.questionText !== "string" ||
        !question.questionText.trim() ||
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        !question.options.every(
          (option) => typeof option === "string" && option.trim()
        ) ||
        !Number.isInteger(question.correctAnswer) ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length ||
        (question.marks !== undefined &&
          (!Number.isFinite(question.marks) || question.marks < 0))
      ) {
        return res.status(400).json({
          success: false,
          message: "One or more questions have invalid data",
        });
      }
    }

    const exam = await Exam.create({
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : "",
      durationMinutes,
      questions,
      isPublished: isPublished !== false,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.questions.length,
        isPublished: exam.isPublished,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Could not create exam",
    });
  }
}

module.exports = { getExams, getExamById, createExam };
