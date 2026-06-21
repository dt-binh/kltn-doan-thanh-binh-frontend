const express = require("express");
const prisma = require("../config/db");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// ================= GET AUTHORS =================
router.get("/api/authors", async (req, res) => {
  try {
    const authors = await prisma.authors.findMany();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= CREATE AUTHOR (ADMIN) =================
router.post("/api/authors", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    const { name, country } = req.body;
    const author = await prisma.authors.create({ data: { name, country } });
    res.status(201).json({ message: "Thêm tác giả thành công", id: author.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE AUTHOR (ADMIN) =================
router.put("/api/authors/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    const { name, country } = req.body;
    await prisma.authors.update({
      where: { id: parseInt(req.params.id) },
      data: { name, country },
    });
    res.json({ message: "Cập nhật tác giả thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE AUTHOR (ADMIN) =================
router.delete("/api/authors/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    await prisma.authors.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Xóa tác giả thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
