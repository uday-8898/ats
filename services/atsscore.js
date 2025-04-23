require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Function to analyze resume against job description
const atsScore = async (resumeText, jobDescription) => {
  try {
    const prompt = `I will provide you with two inputs:
        - Resume Text: A candidate's resume in text format.
        - Job Description (JD): A job listing or description that the candidate is applying to.

        Your task is to **evaluate strictly** the resume based on the JD and return a concise JSON object with the following structure:

        only provide the jason object with the following structure with no expaltion or any other thing.:

        {
            "name": "Candidate's Name",  // Extract from the resume, or use "Unknown" if not present
            "email": "Candidate's Email",  // Extract from the resume, or use "Unknown" if not present
            "jScore": JD alignment score (0-100),
            "gScore": General resume quality score (0-100)
        }

        The evaluation must adhere to **strict guidelines**, penalizing vague or irrelevant details that do not directly align with the JD.

        IMPORTANT:
        - Match skills contextually, not just by keyword. Only mark a skill as present if it **exactly matches the context** required by the JD. For example, if the JD mentions "Python for Data Structures and Algorithms (DSA)," it should only be marked as present if Python is used explicitly for DSA in the resume.
        - Be **extremely strict** in evaluating how well the resume demonstrates qualifications for the **specific role** outlined in the JD.
        - Gaps, vagueness, or irrelevant content should significantly lower the JD-aligned score.
        - Also provide a **general resume quality** score independent of the JD, focusing on grammar, professionalism, and overall clarity.
        and keep this in mind while evaluating the resume:- Scoring Guidelines:
    - JScore (0-100): Strict evaluation of JD alignment
      70-100: Excellent match with specific skills and experience
      40-69: Partial match with some relevant experience
      0-39: Poor match with significant gaps

    - GScore (0-100): Overall resume quality
      70-100: Professional, well-structured, clear achievements
      40-69: Decent structure, needs minor improvements
      0-39: Major improvements needed

        Below is the Resume Text: "${resumeText}"
        Below is the Job Description: "${jobDescription}"`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192",
    });

    const { choices } = response;
    if (choices && choices[0]?.message?.content) {
      const rawContent = choices[0].message.content;
      console.log("Raw Content: ", rawContent);
      const result = extractRelevantJSON(rawContent);
      console.log("Result: ", result);
      return JSON.parse(result);
    } else {
      console.log("No valid response received.");
      return {
        name: "Unknown",
        email: "Unknown",
        jScore: 0,
        gScore: 0,
      };
    }
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error("Groq API error");
  }
};

// Helper function to extract relevant JSON data
const extractRelevantJSON = (content) => {
  try {
    const jsonObject = JSON.parse(content);
    const trimmedObject = {
      name: jsonObject.name || "Unknown",
      email: jsonObject.email || "Unknown",
      jScore: jsonObject.jScore || 0,
      gScore: jsonObject.gScore || 0,
    };
    return JSON.stringify(trimmedObject);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return JSON.stringify({
      name: "Unknown",
      email: "Unknown",
      jScore: 0,
      gScore: 0,
    });
  }
};

module.exports = {
  atsScore,
};
