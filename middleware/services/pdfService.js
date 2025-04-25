const fs = require("fs");
const pdfParse = require("pdf-parse");

class PdfService {
  static async extractText(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } catch (error) {
      throw new Error(`PDF parsing error: ${error.message}`);
    }
  }

  static cleanup(filePath) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
}

module.exports = PdfService;
