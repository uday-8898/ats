const { atsScore } = require("../services/atsscore");
const PdfService = require("../services/pdfService");
const ExcelService = require("../services/excelServices");

const analyzeSingleResume = async (req, res) => {
  try {
    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Ensure job description is provided
    const jobDescription = req.body.jobDescription;
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }

    console.log("➡️ Extracting text from uploaded file:", req.file.path);
    const resumeText = await PdfService.extractText(req.file.path);
    console.log("✅ Text extraction successful");

    console.log("➡️ Running ATS analysis...");
    const analysis = await atsScore(resumeText, jobDescription);
    console.log("✅ Analysis complete:", analysis);

    // Clean up the temporary file
    PdfService.cleanup(req.file.path);
    console.log("🧹 Temporary file cleaned:", req.file.path);

    // Return the analysis result
    res.status(200).json(analysis);
  } catch (error) {
    console.error("❌ Error analyzing single resume:", error);
    res.status(500).json({ error: "Error analyzing resume", details: error.message });
  }
};

const analyzeMultipleResumes = async (req, res) => {
  try {
    // Ensure files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Ensure job description is provided
    const jobDescription = req.body.jobDescription;
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const results = [];
    const totalFiles = req.files.length;
    let processedCount = 0;

    // Process each file
    for (const file of req.files) {
      try {
        console.log(`\n📄 Processing file ${++processedCount}/${totalFiles}: ${file.originalname}`);
        console.log("➡️ Extracting text...");
        const resumeText = await PdfService.extractText(file.path);
        console.log("✅ Text extracted");

        console.log("➡️ Analyzing with ATS Score...");
        const analysis = await atsScore(resumeText, jobDescription);
        console.log("✅ Analysis done:", analysis);

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
        PdfService.cleanup(file.path);
        console.log("🧹 Cleaned:", file.originalname);
      } catch (fileError) {
        console.error(`❌ Error processing ${file.originalname}:`, fileError);
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

      // Optional delay between processing files
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n📊 All resumes processed. Creating Excel...");
    // Sort the results based on job score (jScore)
    results.sort((a, b) => b.jScore - a.jScore);

    // Generate the Excel file
    const { fileName, filePath } = ExcelService.generateExcelFile(results);
    console.log(`✅ Excel generated: ${fileName}`);

    // Send the Excel file as a download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("❌ Error sending Excel:", err);
        return res.status(500).json({ error: "Error sending file" });
      }

      console.log(`📤 Excel sent: ${fileName}`);
      // Clean up the generated Excel file
      ExcelService.cleanup(filePath);
      console.log("🧹 Excel file cleaned up");
    });
  } catch (error) {
    console.error("❌ Error in analyzeMultipleResumes:", error);
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
