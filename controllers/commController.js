const { processGroupDiscussion, validateInputs } = require("../services/groupdiscussion");

const commController = async (req, res) => {
  try {
    const { text, topic = "General Discussion" } = req.body;
    
    console.log("Request body:", req.body);
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "No text provided",
      });
    }

    try {
      validateInputs(text, topic);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Process with group discussion service
    const analysisResult = await processGroupDiscussion(text, topic);
    
    return res.status(200).json({
      success: true,
      data: {
        text: text,
        topic: topic,
        analysis: analysisResult,
      },
    });
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error processing text",
    });
  }
};

module.exports = commController;