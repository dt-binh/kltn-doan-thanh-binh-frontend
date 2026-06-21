const express = require("express");
const prisma = require("../config/db");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// ================= GET GENRES =================
router.get("/api/genres", async (req, res) => {
  try {
    const genres = await prisma.genres.findMany();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= CREATE GENRE (ADMIN) =================
router.post("/api/genres", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    const { name } = req.body;
    const genre = await prisma.genres.create({ data: { name } });
    res.status(201).json({ message: "Thêm thể loại thành công", id: genre.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE GENRE (ADMIN) =================
router.put("/api/genres/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    const { name } = req.body;
    await prisma.genres.update({
      where: { id: parseInt(req.params.id) },
      data: { name },
    });
    res.json({ message: "Cập nhật thể loại thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE GENRE (ADMIN) =================
router.delete("/api/genres/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    await prisma.genres.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Xóa thể loại thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
