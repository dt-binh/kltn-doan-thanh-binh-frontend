const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const router = express.Router();

// ================= REGISTER =================
router.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await prisma.users.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    await prisma.users.create({
      data: { username, email, password: hashedPassword },
    });

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= LOGIN =================
router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email (hoặc tên đăng nhập) và mật khẩu",
      });
    }

    // Tìm user theo email hoặc username
    const user = await prisma.users.findFirst({
      where: {
        OR: [{ email }, { username: email }],
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    // Kiểm tra trạng thái khóa tài khoản
    if (user.status === "inactive") {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa bởi quản trị viên",
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
