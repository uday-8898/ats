const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

class ExcelService {
  static generateExcelFile(results) {
    const workbook = xlsx.utils.book_new();

    // Format the data with more detailed columns
    const formattedResults = results.map((result) => ({
      "File Name": result.fileName,
      "Candidate Name": result.name,
      "Email Address": result.email,
      "JD Score (%)": result.jScore,
      "General Score (%)": result.gScore,
      Status: result.status,
      "Processing Time": result.processingTime,
      "Error (if any)": result.error || "None",
    }));

    // Create worksheet
    const worksheet = xlsx.utils.json_to_sheet(formattedResults, {
      header: [
        "File Name",
        "Candidate Name",
        "Email Address",
        "JD Score (%)",
        "General Score (%)",
        "Status",
        "Processing Time",
        "Error (if any)",
      ],
    });

    // Style configuration
    const colWidths = [
      { wch: 40 }, // File Name
      { wch: 30 }, // Candidate Name
      { wch: 35 }, // Email Address
      { wch: 15 }, // JD Score
      { wch: 15 }, // General Score
      { wch: 15 }, // Status
      { wch: 25 }, // Processing Time
      { wch: 40 }, // Error
    ];

    // Apply styles
    worksheet["!cols"] = colWidths;

    // Add to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Resume Analysis");

    const fileName = `resume_analysis_${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, "..", "output", fileName);

    // Ensure output directory exists
    const outputDir = path.join(__dirname, "..", "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write file
    xlsx.writeFile(workbook, filePath);
    return { fileName, filePath };
  }

  static cleanup(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up Excel file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting Excel file ${filePath}:`, error);
    }
  }
}

module.exports = ExcelService;
