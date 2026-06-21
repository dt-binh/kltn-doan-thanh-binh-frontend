const express = require("express");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// ================= UPLOAD IMAGE =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/api/upload", verifyToken, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được tải lên" });
  }
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

module.exports = router;
