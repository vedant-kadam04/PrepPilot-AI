const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const evaluateAnswer = async (question, answer) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: `

You are a strict software engineering interviewer.

Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer honestly.

Scoring Rules:

- If the answer is empty, blank, or contains only whitespace, score MUST be 0.
- If the answer is irrelevant, gibberish, or unrelated to the question, score MUST be between 0 and 2.
- Very short answers (one sentence with little explanation) should score between 2 and 4.
- Partially correct answers should score between 5 and 7.
- Good answers with correct explanation should score between 8 and 9.
- Only exceptional, interview-ready answers deserve 10.

Return ONLY valid JSON in this exact format:

{
  "score": 8,
  "feedback": "Brief feedback (max 2 sentences)",
  "improvement": "One clear suggestion for improvement"
}

Rules:
- score must be an integer between 0 and 10
- Return ONLY JSON
- Do not use markdown
- Do not use \`\`\`
- Do not add any explanation outside the JSON
`,
      },
    ],
  });

  return completion.choices[0].message.content;
};

module.exports = {
  evaluateAnswer,
};