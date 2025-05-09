require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Function to analyze resume against job description
const analyzeResume = async (resumeText, jobDescription) => {
  try {
    const prompt = `Analyze the provided resume against the job description and generate a detailed evaluation report.

    Input:
    Resume Text: "${resumeText}"
    Job Description: "${jobDescription}"

    Evaluation Guidelines:
    1. Skills Matching
        - First extract ALL skills from resume (both technical and soft skills)
        - Then extract ALL required skills from job description
        - For each skill found in resume:
          * Check if it appears in job description
          * Note the context and proficiency level mentioned
          * Consider skill variations (e.g., "React.js" = "ReactJS")
          * Mark as true if found in job description, false if not
        - List all skills from resume regardless of job description match
        - Ensure no skills are missed even if they don't match
        - Include proficiency level where mentioned in resume
        - Example: "Python for Data Structures" is different from "Python for Web Development"

    2. Content Evaluation
    - Identify gaps and irrelevant content
    - Penalize vague or unrelated experiences
    - Evaluate clarity and specificity of achievements
    - Check for quantifiable results and impact

    3. Project/Internship Analysis
    - Match projects strictly based on JD relevance
    - Evaluate technology stack alignment
    - Check implementation context
    - Verify outcome relevance

    4. Resume Quality Metrics
    - Grammar and professionalism (independent of JD)
    - Structure and formatting
    - Content organization
    - Action verb usage
    - Quantifiable achievements

    5. Enhanced Recruiter Tips Requirements:
    - Provide at least 5-7 detailed suggestions for improvement
    - Include specific formatting recommendations
    - Add industry-standard best practices
    - Suggest optimal word count range for each section
    - Include ATS optimization tips
    - Provide keyword placement strategies

    6. Words to Avoid Analysis:
    - Identify at least 10 weak or overused words/phrases
    - Provide stronger alternatives for each word
    - Include context-specific replacements
    - Flag buzzwords and clichés
    - Suggest industry-specific professional terminology

    7. Suggested Skills Enhancement:
    - List at least 8-10 relevant technical skills from JD
    - Include emerging technologies in the field
    - Suggest certification recommendations
    - Add relevant soft skills based on role
    - Include tool/platform proficiency requirements

    8. Project Rephrasing Requirements:
    - Provide 3-4 alternative versions for each project
    - Include quantifiable metrics in rephrasing
    - Add technical keywords from JD
    - Improve action verb usage
    - Enhance result orientation
    - Include impact metrics

    Scoring Guidelines:
    - JScore (0-100): Strict evaluation of JD alignment
      70-100: Excellent match with specific skills and experience
      40-69: Partial match with some relevant experience
      0-39: Poor match with significant gaps

    - GScore (0-100): Overall resume quality
      70-100: Professional, well-structured, clear achievements
      40-69: Decent structure, needs minor improvements
      0-39: Major improvements needed

    Required Output Format (JSON only):
    {
        "Job Title Match": "Matched/Not Matched",
        "Skills": {
            "TechnicalSkills": {"skill": boolean},
            "SoftSkills": {"skill": boolean}
        },
        "Suggested Skills": ["skill1", "skill2"], // Minimum 8-10 skills with context
        "Matched Projects And Internships": [
            {
                "Project": "title",
                "Description": "alignment explanation"
            }
        ],
        "Rephrased Projects And Internships": [
            {
                "Original": "text",
                "Rephrased": ["point1", "point2", "point3", "point4"] // At least 4 variations
            }
        ],
        "Resume Improvement Suggestions": ["suggestion1", "suggestion2"],
        "Grammatical Check": "detailed review",
        "Project Title Description Check": [
            {
                "Project": "title",
                "Status": "Matched/Not Matched",
                "Explanation": "consistency review"
            }
        ],
        "Recruiter Tips": {
            "Suggestions": ["tip1", "tip2", "tip3", "tip4", "tip5"], // Minimum 5 detailed tips
            "Word Count": "detailed section-wise recommendation",
            "wordsToAvoid": {
                "word1": "stronger alternative",
                "word2": "stronger alternative"
                // Minimum 10 words with alternatives
            }
        },
        "JScore": number,
        "GScore": number
    }

    Important:
    - Provide only the JSON response
    - Maintain exact key names as shown
    - Ensure all values are properly formatted
    - No additional explanations or text outside JSON structure`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192", // Adjust the model if needed
      // max_tokens: 1000, // Set token limit to 1000
    });

    // Log response to check the data structure
    //console.log(response);
    const { choices } = response;
    if (choices && choices[0]?.message?.content) {
      const rawContent = choices[0].message.content;
      console.log("Raw Content: ", rawContent);
      // Now we'll trim the content to extract only the relevant parts between "Matched Skills" and "Score"
      const trimmedContent = extractRelevantJSON(rawContent);
      console.log("-----------------trimmed_data_receive-----------------");
      console.log("Trimmed Content: ", trimmedContent);
      console.log("-----------------trimmed_data_send-----------------");
      const result = JSON.parse(trimmedContent); // Parse the trimmed JSON content
      console.log("Result: ", result);
      return result;
    } else {
      console.log("No matches found.");
      return {
        matches: "No matches found.",
      };
    }
  } catch (error) {
    console.error(error);
  }
};

// Helper function to extract JSON data from "Matched Skills" to "Score"
const extractRelevantJSON = (content) => {
  const startMarker = '"Job Title Match"';
  const endMarker = '"GScore"';
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker) + endMarker.length + 5; // Adjust to capture full content

  if (startIndex !== -1 && endIndex !== -1) {
    const trimmedContent = content.substring(startIndex, endIndex);
    console.log("---------------trim--------------------");
    console.log(trimmedContent);
    console.log("----------------trim-------------------");
    return `{${trimmedContent}}`; // Wrap it in curly braces to make it a valid JSON object
  }

  // If markers are not found, return an empty object
  return "{}";
};

module.exports = {
  analyzeResume,
};
