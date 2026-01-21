const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// server/routes/ai.js

router.post("/generate-proposal", async (req, res) => {
  try {
    const { jobDescription, userSkills } = req.body;

    // UPDATE: 1.5-flash is retired. Use 2.5-flash instead.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert freelancer applying for a project. 
      
      JOB DESCRIPTION: "${jobDescription}"
      MY CORE SKILLS: "${userSkills}"
      
      TASK: Write a 3-paragraph persuasive bid. 
      - Paragraph 1: Catchy opening and why I am interested.
      - Paragraph 2: Explicitly link my CORE SKILLS to the requirements in the JOB DESCRIPTION.
      - Paragraph 3: Professional closing with a call to action.
      
      STRICT RULES: 
      - Do not use generic placeholders like [Your Name].
      - Use professional, high-energy language.
      - Keep it under 200 words.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ proposal: text });
  } catch (error) {
    // This will now catch 200 responses or specific API errors
    console.error("Gemini AI Error:", error);
    res.status(500).json({ error: "AI Generation failed. Ensure API Key is active." });
  }
});

// ... all your router.post or router.get code ...

module.exports = router; // <--- MUST HAVE THIS LINE