const express = require("express");
const prisma = require("../config/db");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// ================= GET USERS =================
router.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE USER STATUS (ADMIN) =================
router.put("/api/users/:id/status", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    await prisma.users.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.json({ message: "Cập nhật trạng thái người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE USER (ADMIN) =================
router.delete("/api/users/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    await prisma.users.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= PROFILE =================
router.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        address: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ message: "Lấy profile thành công", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE PROFILE =================
router.put("/api/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    await prisma.users.update({
      where: { id: req.user.id },
      data: { username: name, phone, address },
    });

    res.json({ message: "Cập nhật profile thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
