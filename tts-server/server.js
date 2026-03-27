const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const MODELS_DIR = path.join(__dirname, "models");
const PIPER_EXE = path.join(__dirname, "piper.exe");
const PIPER_MODEL = path.join(MODELS_DIR, "model.onnx");
const OUTPUT_DIR = path.join(__dirname, "temp_audio");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

app.post("/speak", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).send("Text is required");
  
  if (!fs.existsSync(PIPER_EXE)) {
    return res.status(500).send("piper.exe not found in server directory");
  }

  const filename = `speech_${Date.now()}.wav`;
  const filePath = path.join(OUTPUT_DIR, filename);
  
  // Clean up old files (> 10 mins)
  const tenMinsAgo = Date.now() - 600000;
  fs.readdirSync(OUTPUT_DIR).forEach(file => {
    const fPath = path.join(OUTPUT_DIR, file);
    if (fs.statSync(fPath).mtimeMs < tenMinsAgo) {
      fs.unlinkSync(fPath);
    }
  });

  // Escape text for shell
  const escapedText = text.replace(/"/g, '\\"');
  
  // Command: echo "text" | piper.exe --model models/model.onnx --output_file temp_audio/file.wav
  const command = `echo "${escapedText}" | "${PIPER_EXE}" --model "${PIPER_MODEL}" --output_file "${filePath}"`;

  console.log(`Generating: ${text.substring(0, 30)}...`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Piper Exec Error:", error);
      return res.status(500).send(`TTS Error: ${error.message}`);
    }
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(500).send("WAV file was not created");
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`TTS Server (Piper-backed) running on port ${PORT}`);
  console.log(`Model Check: ${fs.existsSync(PIPER_MODEL) ? "PRESENT" : "MISSING"}`);
});
