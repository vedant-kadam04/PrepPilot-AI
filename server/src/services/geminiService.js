const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const generateQuestions = async (role, difficulty) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
Generate 10 interview questions for a ${role} position.
Difficulty: ${difficulty}.

Return only a numbered list of questions.
`;

  const result = await model.generateContent(prompt);

  return result.response.text();
};

module.exports = {
  generateQuestions,
};