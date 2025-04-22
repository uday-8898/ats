require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY2 });

// Helper function to extract valid JSON from response
const extractValidJson = (data) => {
  try {
    // Regular expression to capture valid JSON structure from the response
    const jsonMatch = data.match(/{.*}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]); // Parse only the JSON part
    }
    throw new Error("No valid JSON found in the response");
  } catch (error) {
    console.error("Error extracting JSON:", error);
    throw error; // Rethrow to handle it in the main function
  }
};

// Helper function to trim and validate the JSON structure
const trimResumeData = (data) => {
  try {
    const parsedData = extractValidJson(data);

    // Allowed keys in the JSON structure, now including 'projects' and 'certifications'
    const validKeys = [
      "contactInformation",
      "objective",
      "education",
      "skills",
      "workExperience",
      "achievements",
      "projects",
    ];

    // Filter out any unnecessary fields
    const trimmedData = {};
    validKeys.forEach((key) => {
      if (parsedData[key]) {
        trimmedData[key] = parsedData[key];
      } else {
        trimmedData[key] = "Empty"; // Handle empty fields
      }
    });

    return trimmedData;
  } catch (error) {
    console.error("Error parsing or trimming resume data:", error);
    return {};
  }
};

// Function to generate resume from raw JSON data
const generateResume = async (candidateData) => {
  try {
    const candidateDataString = JSON.stringify(candidateData);
    const prompt = `
          I will provide you with raw JSON data of a candidate's information.
          Your task is to generate a highly optimized, ATS-friendly resume in JSON format based on this raw data.
          Ensure the final JSON structure is crisp, includes the right keywords, and adheres to ATS standards, allowing the resume to pass any ATS screening.

          This is the Candidate data: "${candidateDataString}"

          ### Instructions:
          1. Include only the following sections: **contactInformation, objective, education, skills, workExperience, achievements, projects, certifications**.
          2. Use bullet points for **achievements** and **work experience** responsibilities to enhance clarity and ATS parsing.
          3. Fill out empty fields with the label "Empty".
          4. Ensure that the summary and work experience sections are tailored to ATS, using key action verbs and industry-relevant terms.
          5. Keep the descriptions short and keyword-focused, highlighting relevant technologies, skills, and experiences.
          6. Eliminate irrelevant details; focus only on the most important aspects for the ATS system.

          ### IMPORTANT The response should be in JSON format and must follow this structure. Do not add any additional information, and ensure the keys are exactly as shown below. Ensure there are no symbols like tilde so that I can parse it as JSON:
          const candidateResume = {
            "contactInformation": {
              "name": "Your Full Name" || "Empty",
              "email": "Your Email Address" || "Empty",
              "phone": "Your Phone Number" || "Empty",
              "linkedin": "Your LinkedIn Profile URL" || "Empty",
              "github": "Your GitHub Profile URL" || "Empty",
              "location": "Your Current Location" || "Empty"
            },
            "objective": "A concise, ATS-optimized summary of the candidate’s strengths and career goals (2-3 sentences)." || "Empty",
            "education": {
              "graduation": {
                "degree": "Your Degree" || "Empty",
                "institution": "Your University Name" || "Empty",
                "location": "University Location" || "Empty",
                "yearSpan": "Years Attended" || "Empty",
                "CPI": "Your GPA/Grade" || "Empty"
              },
              "intermediate": {
                "schoolName": "Your Intermediate School Name" || "Empty",
                "percentage": "Your Percentage/Grade" || "Empty",
                "stream": "Your Stream/Discipline" || "Empty",
                "yearSpan": "Years Attended" || "Empty",
                "location": "School Location" || "Empty"
              },
              "highSchool": {
                "schoolName": "Your High School Name" || "Empty",
                "percentage": "Your High School Percentage/Grade" || "Empty",
                "yearSpan": "Years Attended" || "Empty",
                "location": "School Location" || "Empty"
              }
            },
            "workExperience": [
              {
                "jobTitle": "Your Designation" || "Empty",
                "company": "Company Name" || "Empty",
                "description": [
                  "• Description point 1 of the candidate's role and responsibilities." || "Empty",
                  "• Point 2 elaborating on achievements and specific results obtained." || "Empty"
                ]
              }
            ],
            "projects": [
              {
                "projectTitle": "Project Title 1" || "Empty",
                "description": [
                  "• Project objective and role." || "Empty",
                  "• Technologies used." || "Empty",
                  "• Key results achieved." || "Empty"
                ]
              }
            ],
            "skills": {
              "technicalSkills": [
                "Technical Skill 1" || "Empty",
                "Technical Skill 2" || "Empty"
              ],
              "softSkills": [
                "Soft Skill 1" || "Empty",
                "Soft Skill 2" || "Empty",
                "Soft Skill 3" || "Empty"
              ]
            },
            "certifications": [
              {
                "name": "Certification 1" || "Empty"
              },
              {
                "name": "Certification 2" || "Empty"
              }
            ],
            "achievements": [
              "Achievement 1" || "Empty",
              "Achievement 2" || "Empty"
            ]
          }`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192",
      max_tokens: 3000,
    });

    console.log("Raw Response:", response.choices[0].message.content);

    // Trim and validate the JSON response
    const trimmedResume = trimResumeData(response.choices[0].message.content);

    // console.log("Trimmed and Valid Resume:", trimmedResume);

    return trimmedResume;
  } catch (error) {
    console.error("Error generating resume JSON:", error);
    throw new Error("Groq API error");
  }
};

module.exports = { generateResume };
