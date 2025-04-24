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

        only provide the JSON object with the following structure with no explanation or any other thing.:

        {
            "name": "Candidate's Name",
            "email": "Candidate's Email",
            "jScore": JD alignment score (0-100),
            "gScore": General resume quality score (0-100)
        }

        The evaluation must adhere to strict guidelines...
        
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
      console.log("🔍 Raw Content from Groq:", rawContent);

      const extracted = extractRelevantJSON(rawContent);
      console.log("✅ Extracted JSON:", extracted);

      return JSON.parse(extracted);
    } else {
      console.warn("⚠️ No valid response received from Groq.");
      return {
        name: "Unknown",
        email: "Unknown",
        jScore: 0,
        gScore: 0,
      };
    }
  } catch (error) {
    console.error("❌ Error calling Groq API:", error);
    return {
      name: "Unknown",
      email: "Unknown",
      jScore: 0,
      gScore: 0,
    };
  }
};

// Helper function to extract only the JSON block from the response
const extractRelevantJSON = (content) => {
  try {
    // Match first JSON object in response using regex
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error("No JSON object found in content");

    const jsonObject = JSON.parse(jsonMatch[0]);
    return JSON.stringify({
      name: jsonObject.name || "Unknown",
      email: jsonObject.email || "Unknown",
      jScore: jsonObject.jScore || 0,
      gScore: jsonObject.gScore || 0,
    });
  } catch (error) {
    console.error("⚠️ Error parsing JSON content:", error);
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
