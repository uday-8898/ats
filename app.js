const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const analyzeRoutes = require("./routes/analyzeRoutes");
const formRoutes = require("./routes/formRoutes");
const commRoutes = require("./routes/commRoutes");

const app = express();
dotenv.config();
// Increase payload size limit for large files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configure CORS
app.use(
  cors({
    origin: [
      "https://ats-ui-fxhpahcebed8aze3.centralindia-01.azurewebsites.net", // production
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies or auth headers if needed
  })
);

// Preflight support
app.options("*", cors());

// Ensure required directories exist
const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "output");

[uploadDir, outputDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

// Routes
app.use("/api/analyze", analyzeRoutes);
app.use("/api/form", formRoutes);
app.use("/api/communication", commRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload directory: ${uploadDir}`);
  console.log(`Output directory: ${outputDir}`);
});

// Cleanup function
const cleanup = () => {
  [uploadDir, outputDir].forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((file) => {
        fs.unlinkSync(path.join(dir, file));
      });
    }
  });
};

// Cleanup on server shutdown
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    cleanup();
    process.exit();
  });
});


app.get("/", (req, res) => {
  res.send("Server is running on port 5001");
});
