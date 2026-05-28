const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();

// Tạo thư mục uploads nếu chưa có để lưu ảnh
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


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


// ================= RESET ADMIN PASSWORD =================
app.get("/api/reset-admin", async (req, res) => {
  // Mã hoá mật khẩu "123456" chuẩn
  const hash = await bcrypt.hash("123456", 10);
  db.query("UPDATE users SET password = ? WHERE username = 'admin'", [hash], (err) => {
    if (err) return res.status(500).json(err);
    res.send("Đã reset mật khẩu tài khoản admin thành: 123456. Bạn có thể quay lại trang đăng nhập!");
  });
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
        "Vui lòng nhập email (hoặc tên đăng nhập) và mật khẩu",
    });
  }

  // tìm user
  const sql =
    "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(sql, [email, email], async (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    // không tìm thấy email
    if (result.length === 0) {
      return res.status(400).json({
        message: "Tài khoản không tồn tại",
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

    // kiểm tra trạng thái khóa tài khoản
    if (user.status === 'inactive') {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa bởi quản trị viên",
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


// ================= UPLOAD IMAGE =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.post("/api/upload", verifyToken, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được tải lên" });
  }
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});


// ================= GET USERS =================
app.get("/api/users", (req, res) => {
  const sql = `
    SELECT
      id,
      username,
      email,
      role,
      status,
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


// ================= UPDATE USER STATUS (ADMIN) =================
app.put("/api/users/:id/status", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  
  const { id } = req.params;
  const { status } = req.body;
  
  const sql = "UPDATE users SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Cập nhật trạng thái người dùng thành công" });
  });
});


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


// ================= GET ADMIN STATS =================
app.get("/api/admin/stats", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền" });

  try {
    const getCount = (query) => new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) reject(err);
        else resolve(result[0].count);
      });
    });

    const getTotalRevenue = () => new Promise((resolve, reject) => {
      db.query("SELECT SUM(total) as revenue FROM orders WHERE status = 'Đã giao'", (err, result) => {
        if (err) reject(err);
        else resolve(result[0].revenue || 0);
      });
    });

    const usersCount = await getCount("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const booksCount = await getCount("SELECT COUNT(*) as count FROM books");
    const ordersCount = await getCount("SELECT COUNT(*) as count FROM orders");
    const revenue = await getTotalRevenue();

    res.json({
      users: usersCount,
      books: booksCount,
      orders: ordersCount,
      revenue: revenue
    });
  } catch (error) {
    res.status(500).json(error);
  }
});


// ================= GET BOOKS =================
app.get("/api/books", (req, res) => {
  const sql = `
    SELECT
      books.*,
      authors.name AS author_name,
      genres.name AS genre_name
    FROM books
    LEFT JOIN authors ON books.author_id = authors.id
    LEFT JOIN genres ON books.genre_id = genres.id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result);
  });
});


// ================= GET BOOK BY ID =================
app.get("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      books.*,
      authors.name AS author_name,
      genres.name AS genre_name
    FROM books
    LEFT JOIN authors ON books.author_id = authors.id
    LEFT JOIN genres ON books.genre_id = genres.id
    WHERE books.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }
    res.json(result[0]);
  });
});


// ================= CREATE BOOK (ADMIN) =================
app.post("/api/books", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  
  const { title, author_id, genre_id, price, image, description } = req.body;
  const sql = "INSERT INTO books (title, author_id, genre_id, price, image, description) VALUES (?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [title, author_id, genre_id, price, image, description], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: "Thêm sách thành công", id: result.insertId });
  });
});

// ================= UPDATE BOOK (ADMIN) =================
app.put("/api/books/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  
  const { id } = req.params;
  const { title, author_id, genre_id, price, image, description } = req.body;
  const sql = "UPDATE books SET title=?, author_id=?, genre_id=?, price=?, image=?, description=? WHERE id=?";
  
  db.query(sql, [title, author_id, genre_id, price, image, description, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Cập nhật sách thành công" });
  });
});

// ================= DELETE BOOK (ADMIN) =================
app.delete("/api/books/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  
  const { id } = req.params;
  const sql = "DELETE FROM books WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Xóa sách thành công" });
  });
});


// ================= GET GENRES =================
app.get("/api/genres", (req, res) => {
  const sql = "SELECT * FROM genres";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result);
  });
});


// ================= GET AUTHORS =================
app.get("/api/authors", (req, res) => {
  const sql = "SELECT * FROM authors";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result);
  });
});


// ================= CREATE GENRE (ADMIN) =================
app.post("/api/genres", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  const { name } = req.body;
  db.query("INSERT INTO genres (name) VALUES (?)", [name], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: "Thêm thể loại thành công", id: result.insertId });
  });
});

// ================= UPDATE GENRE (ADMIN) =================
app.put("/api/genres/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  const { name } = req.body;
  db.query("UPDATE genres SET name=? WHERE id=?", [name, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Cập nhật thể loại thành công" });
  });
});

// ================= DELETE GENRE (ADMIN) =================
app.delete("/api/genres/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  db.query("DELETE FROM genres WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Xóa thể loại thành công" });
  });
});

// ================= CREATE AUTHOR (ADMIN) =================
app.post("/api/authors", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  const { name, country } = req.body;
  db.query("INSERT INTO authors (name, country) VALUES (?, ?)", [name, country], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: "Thêm tác giả thành công", id: result.insertId });
  });
});

// ================= UPDATE AUTHOR (ADMIN) =================
app.put("/api/authors/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  const { name, country } = req.body;
  db.query("UPDATE authors SET name=?, country=? WHERE id=?", [name, country, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Cập nhật tác giả thành công" });
  });
});

// ================= DELETE AUTHOR (ADMIN) =================
app.delete("/api/authors/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  db.query("DELETE FROM authors WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Xóa tác giả thành công" });
  });
});

// ================= DELETE USER (ADMIN) =================
app.delete("/api/users/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Xóa người dùng thành công" });
  });
});


// ================= CART =================
app.get("/api/cart", verifyToken, (req, res) => {
  const sql = `
    SELECT cart_items.id, cart_items.quantity, books.id AS book_id, books.title, books.price, books.image
    FROM cart_items
    JOIN books ON cart_items.book_id = books.id
    WHERE cart_items.user_id = ?
  `;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/api/cart", verifyToken, (req, res) => {
  const { book_id, quantity = 1 } = req.body;
  const user_id = req.user.id;

  const checkSql = "SELECT * FROM cart_items WHERE user_id = ? AND book_id = ?";
  db.query(checkSql, [user_id, book_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      const updateSql = "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?";
      db.query(updateSql, [quantity, result[0].id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Đã cập nhật số lượng trong giỏ hàng" });
      });
    } else {
      const insertSql = "INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, ?)";
      db.query(insertSql, [user_id, book_id, quantity], (err) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: "Đã thêm vào giỏ hàng" });
      });
    }
  });
});

app.delete("/api/cart/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const sql = "DELETE FROM cart_items WHERE id = ? AND user_id = ?";
  db.query(sql, [id, user_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Đã xóa khỏi giỏ hàng" });
  });
});


// ================= GET ORDERS =================
app.get("/api/orders", verifyToken, (req, res) => {
  let sql = "";
  let params = [];

  // Admin có thể thấy tất cả đơn hàng, trong khi User chỉ lấy được đơn hàng của chính mình.
  if (req.user.role === "admin") {
    sql = `
      SELECT orders.*, users.username, users.email
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.order_date DESC
    `;
  } else {
    sql = `
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY order_date DESC
    `;
    params = [req.user.id];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result);
  });
});


// ================= CREATE ORDER (CHECKOUT) =================
app.post("/api/orders", verifyToken, (req, res) => {
  const user_id = req.user.id;
  const status = 'Đang xử lí';
  const order_date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

  // 1. Lấy thông tin giỏ hàng của user kèm giá sách
  const cartSql = `
    SELECT c.book_id, c.quantity, b.price
    FROM cart_items c
    JOIN books b ON c.book_id = b.id
    WHERE c.user_id = ?
  `;

  db.query(cartSql, [user_id], (err, cartItems) => {
    if (err) return res.status(500).json(err);
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng của bạn đang trống" });
    }

    // 2. Tính tổng tiền
    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });

    // 3. Tạo đơn hàng mới
    const insertOrderSql = "INSERT INTO orders (user_id, total, status, order_date) VALUES (?, ?, ?, ?)";
    db.query(insertOrderSql, [user_id, total, status, order_date], (err, orderResult) => {
      if (err) return res.status(500).json(err);

      const order_id = orderResult.insertId;

      // 4. Thêm chi tiết đơn hàng (order_items)
      const orderItemsData = cartItems.map(item => [order_id, item.book_id, item.quantity, item.price]);
      const insertOrderItemsSql = "INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ?";
      
      db.query(insertOrderItemsSql, [orderItemsData], (err) => {
        if (err) return res.status(500).json(err);

        // 5. Xóa giỏ hàng sau khi đặt hàng thành công
        const clearCartSql = "DELETE FROM cart_items WHERE user_id = ?";
        db.query(clearCartSql, [user_id], (err) => {
          if (err) return res.status(500).json(err);

          res.status(201).json({
            message: "Đặt hàng thành công",
            order_id: order_id
          });
        });
      });
    });
  });
});

// ================= GET ORDERS BY USER ID (ADMIN) =================
app.get("/api/admin/users/:userId/orders", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  const { userId } = req.params;

  // Lấy tên người dùng trước
  const userSql = "SELECT username FROM users WHERE id = ?";
  db.query(userSql, [userId], (userErr, userResult) => {
    if (userErr) return res.status(500).json(userErr);
    if (userResult.length === 0) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const username = userResult[0].username;

    // Sau đó lấy tất cả đơn hàng của người dùng đó
    const ordersSql = `
        SELECT * 
        FROM orders
        WHERE user_id = ?
        ORDER BY order_date DESC
    `;

    db.query(ordersSql, [userId], (ordersErr, orders) => {
      if (ordersErr) return res.status(500).json(ordersErr);
      
      // Trả về cả tên người dùng và danh sách đơn hàng
      res.json({ username, orders });
    });
  });
});


// ================= GET ORDER DETAILS =================
app.get("/api/orders/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  // Check quyền: chỉ có Admin và chủ sở hữu của Order mới được xem chi tiết
  let checkSql = "SELECT user_id FROM orders WHERE id = ?";
  db.query(checkSql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (role !== "admin" && result[0].user_id !== userId) {
      return res.status(403).json({ message: "Không có quyền truy cập đơn hàng này" });
    }

    const sql = `
      SELECT order_items.*, books.title, books.image
      FROM order_items
      JOIN books ON order_items.book_id = books.id
      WHERE order_items.order_id = ?
    `;

    db.query(sql, [id], (err, items) => {
      if (err) return res.status(500).json(err);
      res.json({
        order_info: result[0],
        items: items
      });
    });
  });
});


// ================= UPDATE ORDER STATUS =================
app.put("/api/orders/:id/status", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền cập nhật trạng thái đơn hàng" });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Vui lòng cung cấp trạng thái mới" });
  }

  const sql = "UPDATE orders SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json(err);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json({ message: "Cập nhật trạng thái đơn hàng thành công" });
  });
});


// ================= START SERVER =================
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});