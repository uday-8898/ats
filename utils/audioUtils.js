const supportedAudioFormats = [
  "audio/wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/webm",
];

const validateAudio = (file) => {
  if (!file) {
    throw new Error("No audio file provided");
  }

  if (!supportedAudioFormats.includes(file.mimetype)) {
    throw new Error(
      `Unsupported audio format. Supported formats: ${supportedAudioFormats.join(", ")}`,
    );
  }

  // Add any additional validation as needed
};

const handleAudioError = (error) => {
  console.error("Audio processing error:", error);

  if (
    error.message.includes("No audio file provided") ||
    error.message.includes("Unsupported audio format")
  ) {
    return {
      status: 400,
      message: error.message,
    };
  }

  return {
    status: 500,
    message: "Error processing audio file",
  };
};

module.exports = {
  validateAudio,
  handleAudioError,
  supportedAudioFormats,
};
