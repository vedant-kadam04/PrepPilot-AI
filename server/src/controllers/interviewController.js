const prisma = require("../config/db");

const { generateQuestions } = require("../services/groqService");

const { evaluateAnswer } = require("../services/evaluateAnswerService");

const createInterview = async (req, res) => {
  try {
    const { title, role, difficulty } = req.body;

    const interview = await prisma.interview.create({
      data: {
        title,
        role,
        difficulty,
        userId: req.user.id,
      },
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getInterviews = async (req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    await prisma.answer.deleteMany({
      where: {
        interviewId: interview.id,
      },
    });
    await prisma.interview.delete({
      where: {
        id: interview.id,
      },
    });

    res.status(200).json({
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const generateInterviewQuestions = async (req, res) => {
  try {
    const { title, role, difficulty } = req.body;

    const questionsText = await generateQuestions(role, difficulty);

    const questionsArray = questionsText
      .split("\n")
      .filter((q) => q.trim() !== "");

    const interview = await prisma.interview.create({
      data: {
        title,
        role,
        difficulty,
        questions: questionsArray,
        userId: req.user.id,
      },
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const interviewId = parseInt(req.params.id);

    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId: req.user.id,
      },
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    if (!answer || answer.trim() === "") {
      const savedAnswer = await prisma.answer.create({
        data: {
          question,
          answer: "",
          score: 0,
          feedback: "No answer was submitted.",
          improvement: "Attempt the question to receive AI feedback.",
          interviewId,
        },
      });

      return res.status(201).json(savedAnswer);
    }
    // Evaluate the answer using AI
    // Evaluate the answer using AI
    const evaluation = await evaluateAnswer(question, answer);

    // Convert AI response (JSON string) into an object
    const parsedEvaluation = JSON.parse(evaluation);

    // Save answer along with AI evaluation
    const savedAnswer = await prisma.answer.create({
      data: {
        question,
        answer,
        score: parsedEvaluation.score,
        feedback: parsedEvaluation.feedback,
        improvement: parsedEvaluation.improvement,
        interviewId,
      },
    });

    res.status(201).json(savedAnswer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getInterviewReport = async (req, res) => {
  try {
    const interviewId = parseInt(req.params.id);

    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId: req.user.id,
      },
      include: {
        answers: true,
      },
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const totalQuestions = interview.questions ? interview.questions.length : 0;
    const totalAnswers = interview.answers.length;

    const validScores = interview.answers.filter(
      (answer) => answer.score !== null,
    );

    const averageScore =
      validScores.length > 0
        ? Number(
            (
              validScores.reduce((sum, answer) => sum + answer.score, 0) /
              validScores.length
            ).toFixed(2),
          )
        : 0;

    const highestScore =
      validScores.length > 0 ? Math.max(...validScores.map((a) => a.score)) : 0;

    const lowestScore =
      validScores.length > 0 ? Math.min(...validScores.map((a) => a.score)) : 0;

    let performance;

    if (averageScore >= 8.5) {
      performance = "Excellent";
    } else if (averageScore >= 7) {
      performance = "Good";
    } else if (averageScore >= 5) {
      performance = "Average";
    } else {
      performance = "Needs Improvement";
    }

    res.status(200).json({
      interviewId: interview.id,
      title: interview.title,
      role: interview.role,
      difficulty: interview.difficulty,

      totalQuestions,
      totalAnswers,
      averageScore,
      highestScore,
      lowestScore,
      performance,

      answers: interview.answers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  deleteInterview,
  generateInterviewQuestions,
  submitAnswer,
  getInterviewReport,
};
