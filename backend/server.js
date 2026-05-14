const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();


// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());


// ================= MYSQL CONNECT =================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.log("Lỗi MySQL:", err);
    return;
  }

  console.log("MySQL Connected");
});


// ================= HOME =================
app.get("/", (req, res) => {
  res.send("API đang chạy...");
});


// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body;

    // kiểm tra dữ liệu
    if (
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // kiểm tra email tồn tại
    const checkSql =
      "SELECT * FROM users WHERE email = ?";

    db.query(
      checkSql,
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        // email đã tồn tại
        if (result.length > 0) {
          return res.status(400).json({
            message: "Email đã tồn tại",
          });
        }

        // hash password
        const hashedPassword =
          await bcrypt.hash(password, 10);

        // insert user
        const sql = `
          INSERT INTO users (
            username,
            email,
            password
          )
          VALUES (?, ?, ?)
        `;

        db.query(
          sql,
          [
            username,
            email,
            hashedPassword,
          ],
          (err, data) => {
            if (err) {
              return res.status(500).json(err);
            }

            res.status(201).json({
              message:
                "Đăng ký thành công",
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
});


// ================= LOGIN =================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // kiểm tra dữ liệu
  if (!email || !password) {
    return res.status(400).json({
      message:
        "Vui lòng nhập email và mật khẩu",
    });
  }

  // tìm user
  const sql =
    "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    // không tìm thấy email
    if (result.length === 0) {
      return res.status(400).json({
        message: "Email không tồn tại",
      });
    }

    const user = result[0];

    // so sánh password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    // sai password
    if (!isMatch) {
      return res.status(400).json({
        message: "Sai mật khẩu",
      });
    }

    // tạo JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // trả dữ liệu
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
  });
});


// ================= GET USERS =================
app.get("/api/users", (req, res) => {
  const sql = `
    SELECT
      id,
      username,
      email,
      role,
      created_at
    FROM users
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
});


// ================= VERIFY TOKEN =================
const verifyToken = (req, res, next) => {
  const authHeader =
    req.headers["authorization"];

  const token =
    authHeader &&
    authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Không có token",
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, user) => {
      if (err) {
        return res.status(403).json({
          message: "Token không hợp lệ",
        });
      }

      req.user = user;

      next();
    }
  );
};


// ================= PROFILE =================
app.get(
  "/api/profile",
  verifyToken,
  (req, res) => {
    res.json({
      message:
        "Lấy profile thành công",

      user: req.user,
    });
  }
);


// ================= START SERVER =================
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});