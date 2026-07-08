const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateQuestions = async (role, difficulty) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Generate 10 interview questions for a ${role} position at ${difficulty} difficulty. Return only the questions.`,
      },
    ],
    model: "llama-3.1-8b-instant",
  });

  return completion.choices[0].message.content;
};

module.exports = {
  generateQuestions,
};