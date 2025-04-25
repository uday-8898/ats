const { analyzeResume } = require("../services/openAiService");
const { atsScore } = require("../services/atsscore");
const PdfService = require("../services/pdfService");
const ExcelService = require("../services/excelServices");

const analyzeSingleResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const jobDescription = req.body.jobDescription;
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }

    // Extract text from PDF
    const resumeText = await PdfService.extractText(req.file.path);

    // Analyze resume
    const analysis = await analyzeResume(resumeText, jobDescription);

    // Clean up uploaded file
    PdfService.cleanup(req.file.path);

    res.json(analysis);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({ error: "Error analyzing resume" });
  }
};

const analyzeMultipleResumes = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const jobDescription = req.body.jobDescription;
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const results = [];
    let processedCount = 0;
    const totalFiles = req.files.length;

    // Process files sequentially
    for (const file of req.files) {
      try {
        console.log(
          `Processing file ${++processedCount} of ${totalFiles}: ${file.originalname}`
        );

        // Extract text from PDF
        const resumeText = await PdfService.extractText(file.path);
        console.log(`PDF text extracted successfully for ${file.originalname}`);

        // Process with atsscore.js
        console.log(`Analyzing resume with ATS Score system...`);
        const analysis = await atsScore(resumeText, jobDescription);
        console.log(`Analysis completed for ${file.originalname}:`, analysis);

        // Format and store result
        const result = {
          fileName: file.originalname,
          name: analysis.name || "Unknown",
          email: analysis.email || "Unknown",
          jScore: analysis.jScore || 0,
          gScore: analysis.gScore || 0,
          status: "Completed",
          processingTime: new Date().toISOString(),
        };

        results.push(result);
        console.log(`Added result for ${file.originalname}`);

        // Clean up the processed file
        PdfService.cleanup(file.path);
        console.log(`Cleaned up temporary file for ${file.originalname}`);
      } catch (fileError) {
        console.error(`Error processing ${file.originalname}:`, fileError);
        results.push({
          fileName: file.originalname,
          name: "Error",
          email: "Error",
          jScore: 0,
          gScore: 0,
          status: "Failed",
          error: fileError.message,
          processingTime: new Date().toISOString(),
        });
      }

      // Optional: Add a small delay between processing files
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("All files processed. Generating Excel file...");

    // Sort results by jScore in descending order
    results.sort((a, b) => b.jScore - a.jScore);

    // Generate Excel file with detailed results
    const { fileName, filePath } = ExcelService.generateExcelFile(results);
    console.log(`Excel file generated: ${fileName}`);

    // Send the Excel file to client
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending Excel file:", err);
        return res.status(500).json({ error: "Error sending file" });
      }
      console.log(`Excel file sent successfully: ${fileName}`);
      // Clean up the Excel file after sending
      ExcelService.cleanup(filePath);
    });
  } catch (error) {
    console.error("Error in analyzeMultipleResumes:", error);
    res.status(500).json({
      error: "Error processing resumes",
      details: error.message,
    });
  }
};


module.exports = {
  analyzeSingleResume,
  analyzeMultipleResumes,
};
