class ErrorHandler {
  static handleMulterError(error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return {
        status: 400,
        message: "File size is too large. Max limit is 10MB",
      };
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return { status: 400, message: "Too many files. Max limit is 20 files" };
    }
    return { status: 500, message: "File upload error" };
  }
}

module.exports = ErrorHandler;
