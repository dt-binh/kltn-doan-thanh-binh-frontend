const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

require("dotenv").config();

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "truyen_db",
  connectionLimit: 10,
});

const app = express();
const prisma = new PrismaClient({ adapter });

// Tạo thư mục uploads nếu chưa có để lưu ảnh
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ================= HOME =================
app.get("/", (req, res) => {
  res.send("API đang chạy...");
});


// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
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
app.post("/api/login", async (req, res) => {
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


// ================= VERIFY TOKEN =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Không có token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ" });
    }
    req.user = user;
    next();
  });
};


// ================= UPLOAD IMAGE =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.post("/api/upload", verifyToken, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được tải lên" });
  }
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});


// ================= GET USERS =================
app.get("/api/users", async (req, res) => {
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
app.put("/api/users/:id/status", verifyToken, async (req, res) => {
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
app.delete("/api/users/:id", verifyToken, async (req, res) => {
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
app.get("/api/profile", verifyToken, async (req, res) => {
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
app.put("/api/profile", verifyToken, async (req, res) => {
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


// ================= GET ADMIN STATS =================
app.get("/api/admin/stats", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền" });
  }

  const revenueYear = parseInt(req.query.revenueYear || req.query.year || new Date().getFullYear());
  const salesYear = parseInt(req.query.salesYear || req.query.year || new Date().getFullYear());

  try {
    // Đếm số lượng
    const [usersCount, booksCount, ordersCount] = await Promise.all([
      prisma.users.count({ where: { role: "user" } }),
      prisma.books.count(),
      prisma.orders.count(),
    ]);

    // Tổng doanh thu
    const revenueResult = await prisma.orders.aggregate({
      _sum: { total: true },
      where: { status: "Đã giao" },
    });
    const revenue = revenueResult._sum.total || 0;

    // Tổng tồn kho
    const stockResult = await prisma.books.aggregate({ _sum: { stock: true } });
    const totalStock = stockResult._sum.stock || 0;

    // Doanh thu theo tháng
    const monthlyRevenueRaw = await prisma.orders.groupBy({
      by: ["order_date"],
      _sum: { total: true },
      where: {
        status: "Đã giao",
        order_date: {
          gte: new Date(`${revenueYear}-01-01`),
          lte: new Date(`${revenueYear}-12-31`),
        },
      },
    });

    // Số sách bán theo tháng
    const deliveredOrdersWithItems = await prisma.orders.findMany({
      where: {
        status: "Đã giao",
        order_date: {
          gte: new Date(`${salesYear}-01-01`),
          lte: new Date(`${salesYear}-12-31`),
        },
      },
      include: {
        order_items: { select: { quantity: true } },
      },
    });

    // Nhập kho theo tháng
    let importedRecords = [];
    try {
      importedRecords = await prisma.book_imports.findMany({
        where: {
          import_date: {
            gte: new Date(`${salesYear}-01-01`),
            lte: new Date(`${salesYear}-12-31`),
          },
        },
        select: { import_date: true, quantity: true },
      });
    } catch (e) {
      // Bảng book_imports chưa tồn tại
      importedRecords = [];
    }

    // Tính doanh thu theo tháng
    const revenueByMonth = new Array(12).fill(0);
    monthlyRevenueRaw.forEach((item) => {
      const month = new Date(item.order_date).getMonth(); // 0-indexed
      revenueByMonth[month] += Number(item._sum.total) || 0;
    });

    const soldByMonth = new Array(12).fill(0);
    deliveredOrdersWithItems.forEach((order) => {
      const month = new Date(order.order_date).getMonth(); // 0-indexed
      const qty = order.order_items.reduce((sum, i) => sum + (i.quantity || 0), 0);
      soldByMonth[month] += qty;
    });

    const importedByMonth = new Array(12).fill(0);
    importedRecords.forEach((record) => {
      if (record.import_date) {
        const month = new Date(record.import_date).getMonth(); // 0-indexed
        importedByMonth[month] += record.quantity || 0;
      }
    });

    res.json({
      totalStock,
      users: usersCount,
      books: booksCount,
      orders: ordersCount,
      revenue,
      revenueByMonth,
      soldByMonth,
      importedByMonth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= GET BOOKS =================
app.get("/api/books", async (req, res) => {
  try {
    const books = await prisma.books.findMany({
      include: {
        authors: { select: { name: true } },
        genres: { select: { name: true } },
      },
    });

    // Flatten author_name và genre_name
    const result = books.map((b) => ({
      ...b,
      author_name: b.authors?.name,
      genre_name: b.genres?.name,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= GET BOOK BY ID =================
app.get("/api/books/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Tăng lượt xem
    await prisma.books.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Lấy thông tin sách
    const book = await prisma.books.findUnique({
      where: { id },
      include: {
        authors: { select: { name: true } },
        genres: { select: { name: true } },
      },
    });

    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    res.json({
      ...book,
      author_name: book.authors?.name,
      genre_name: book.genres?.name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= GET REVIEWS FOR A BOOK =================
app.get("/api/books/:id/reviews", async (req, res) => {
  try {
    const book_id = parseInt(req.params.id);
    const reviews = await prisma.reviews.findMany({
      where: { book_id },
      include: { users: { select: { username: true } } },
      orderBy: { created_at: "desc" },
    });

    const result = reviews.map((r) => ({
      ...r,
      username: r.users?.username,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= ADD A REVIEW =================
app.post("/api/books/:id/reviews", verifyToken, async (req, res) => {
  try {
    const book_id = parseInt(req.params.id);
    const { rating, comment, image } = req.body;
    const user_id = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Vui lòng chọn số sao hợp lệ (1-5)" });
    }

    // Kiểm tra đã mua và nhận hàng chưa
    const deliveredOrder = await prisma.orders.findFirst({
      where: {
        user_id,
        status: "Đã giao",
        order_items: { some: { book_id } },
      },
    });

    if (!deliveredOrder) {
      return res.status(400).json({
        message: "Bạn chỉ có thể đánh giá khi đơn hàng đã giao thành công",
      });
    }

    // Kiểm tra đã đánh giá chưa
    const existing = await prisma.reviews.findFirst({
      where: { book_id, user_id },
    });

    if (existing) {
      return res.status(400).json({ message: "Bạn đã đánh giá truyện này rồi" });
    }

    // Thêm review
    await prisma.reviews.create({
      data: { book_id, user_id, rating, comment: comment || null },
    });

    // Cập nhật rating trung bình của sách
    const avgRating = await prisma.reviews.aggregate({
      _avg: { rating: true },
      where: { book_id },
    });

    await prisma.books.update({
      where: { id: book_id },
      data: { rating: avgRating._avg.rating || 0 },
    });

    res.status(201).json({ message: "Thêm đánh giá thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= CREATE BOOK (ADMIN) =================
app.post("/api/books", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    const { title, author_id, genre_id, price, stock, image, description, import_price } = req.body;
    const newStock = parseInt(stock) || 0;
    const impPrice = parseInt(import_price) || 0;

    const book = await prisma.$transaction(async (tx) => {
      // Tạo sách
      const newBook = await tx.books.create({
        data: {
          title,
          author_id: parseInt(author_id) || 0,
          genre_id: parseInt(genre_id) || 0,
          price: parseInt(price) || 0,
          stock: newStock,
          image: image || null,
          description: description || null,
        },
      });

      // Ghi lịch sử nhập kho (trong cùng transaction)
      if (newStock > 0) {
        await tx.book_imports.create({
          data: {
            book_id: newBook.id,
            quantity: newStock,
            import_price: impPrice,
            import_date: new Date(),
          },
        });
      }

      return newBook;
    });

    res.status(201).json({ message: "Thêm sách thành công", id: book.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= UPDATE BOOK (ADMIN) =================
app.put("/api/books/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    const id = parseInt(req.params.id);
    const { title, author_id, genre_id, price, stock, image, description, import_price } = req.body;

    const existingBook = await prisma.books.findUnique({ where: { id } });
    const oldStock = existingBook?.stock || 0;
    const newStock = parseInt(stock) || 0;
    const importedQty = newStock - oldStock;
    const impPrice = parseInt(import_price) || 0;

    await prisma.$transaction(async (tx) => {
      // Cập nhật thông tin sách
      await tx.books.update({
        where: { id },
        data: {
          title,
          author_id: parseInt(author_id) || 0,
          genre_id: parseInt(genre_id) || 0,
          price: parseInt(price) || 0,
          stock: newStock,
          image: image || null,
          description: description || null,
        },
      });

      // Ghi lịch sử nhập kho nếu tăng stock (trong cùng transaction)
      if (importedQty > 0) {
        await tx.book_imports.create({
          data: {
            book_id: id,
            quantity: importedQty,
            import_price: impPrice,
            import_date: new Date(),
          },
        });
      }
    });

    res.json({ message: "Cập nhật sách thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= DELETE BOOK (ADMIN) =================
app.delete("/api/books/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    await prisma.books.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Xóa sách thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= GET GENRES =================
app.get("/api/genres", async (req, res) => {
  try {
    const genres = await prisma.genres.findMany();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= CREATE GENRE (ADMIN) =================
app.post("/api/genres", verifyToken, async (req, res) => {
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
app.put("/api/genres/:id", verifyToken, async (req, res) => {
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
app.delete("/api/genres/:id", verifyToken, async (req, res) => {
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


// ================= GET AUTHORS =================
app.get("/api/authors", async (req, res) => {
  try {
    const authors = await prisma.authors.findMany();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= CREATE AUTHOR (ADMIN) =================
app.post("/api/authors", verifyToken, async (req, res) => {
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
app.put("/api/authors/:id", verifyToken, async (req, res) => {
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
app.delete("/api/authors/:id", verifyToken, async (req, res) => {
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


// ================= CART =================
app.get("/api/cart", verifyToken, async (req, res) => {
  try {
    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: req.user.id },
      include: {
        books: {
          select: { id: true, title: true, price: true, image: true, stock: true },
        },
      },
    });

    const result = cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      book_id: item.books.id,
      title: item.books.title,
      price: item.books.price,
      image: item.books.image,
      stock: item.books.stock,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/cart", verifyToken, async (req, res) => {
  try {
    const { book_id, quantity = 1 } = req.body;
    const user_id = req.user.id;

    const book = await prisma.books.findUnique({ where: { id: parseInt(book_id) } });
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    const stock = book.stock || 0;

    const existingItem = await prisma.cart_items.findFirst({
      where: { user_id, book_id: parseInt(book_id) },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > stock) {
        return res.status(400).json({ message: "Số lượng trong kho không đủ" });
      }
      await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
      res.json({ message: "Đã cập nhật số lượng trong giỏ hàng" });
    } else {
      if (quantity > stock) {
        return res.status(400).json({ message: "Số lượng trong kho không đủ" });
      }
      await prisma.cart_items.create({
        data: { user_id, book_id: parseInt(book_id), quantity },
      });
      res.status(201).json({ message: "Đã thêm vào giỏ hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/cart/:id", verifyToken, async (req, res) => {
  try {
    await prisma.cart_items.deleteMany({
      where: { id: parseInt(req.params.id), user_id: req.user.id },
    });
    res.json({ message: "Đã xóa khỏi giỏ hàng" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= GET ORDERS =================
app.get("/api/orders", verifyToken, async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      orders = await prisma.orders.findMany({
        include: {
          users: { select: { username: true, email: true } },
        },
        orderBy: { order_date: "desc" },
      });

      orders = orders.map((o) => ({
        ...o,
        username: o.users?.username,
        email: o.users?.email,
      }));
    } else {
      orders = await prisma.orders.findMany({
        where: { user_id: req.user.id },
        orderBy: { order_date: "desc" },
      });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= CREATE ORDER (CHECKOUT) =================
app.post("/api/orders", verifyToken, async (req, res) => {
  try {
    const { payment_method = "cod" } = req.body;
    const user_id = req.user.id;
    const status = payment_method === "qr" ? "Chờ thanh toán" : "Đang xử lí";
    const order_date = new Date();

    // 1. Lấy giỏ hàng
    const cartItems = await prisma.cart_items.findMany({
      where: { user_id },
      include: { books: { select: { id: true, price: true, stock: true, title: true } } },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng của bạn đang trống" });
    }

    // 2. Kiểm tra tồn kho
    for (const item of cartItems) {
      if (item.quantity > (item.books.stock || 0)) {
        return res.status(400).json({
          message: `Truyện "${item.books.title}" chỉ còn ${item.books.stock} quyển trong kho. Vui lòng cập nhật lại giỏ hàng!`,
        });
      }
    }

    // 3. Tính tổng tiền
    const total = cartItems.reduce((sum, item) => sum + item.books.price * item.quantity, 0);

    // 4. Transaction: tạo đơn hàng, order_items, xóa giỏ hàng, trừ kho
    const result = await prisma.$transaction(async (tx) => {
      // Tạo order
      const order = await tx.orders.create({
        data: { user_id, total, status, order_date, payment_method },
      });

      // Tạo order_items
      await tx.order_items.createMany({
        data: cartItems.map((item) => ({
          order_id: order.id,
          book_id: item.books.id,
          quantity: item.quantity,
          price: item.books.price,
        })),
      });

      // Xóa giỏ hàng
      await tx.cart_items.deleteMany({ where: { user_id } });

      // Trừ kho
      for (const item of cartItems) {
        await tx.books.update({
          where: { id: item.books.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });

    res.status(201).json({ message: "Đặt hàng thành công", order_id: result.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= SEPAY WEBHOOK (AUTO CONFIRM PAYMENT) =================
app.post("/api/webhook/sepay", async (req, res) => {
  const { transferType, transferAmount, content } = req.body;

  if (transferType === "in") {
    const match = content.match(/DH(\d+)/i);
    if (match) {
      const orderId = parseInt(match[1], 10);

      try {
        const order = await prisma.orders.findUnique({ where: { id: orderId } });

        if (order && order.status === "Chờ thanh toán" && transferAmount >= order.total) {
          await prisma.orders.update({
            where: { id: orderId },
            data: { status: "Đang xử lí" },
          });
          console.log(`✅ [Webhook] Đã tự động xác nhận đơn hàng DH${orderId.toString().padStart(4, "0")}`);
        }
      } catch (e) {
        console.error("Webhook error:", e.message);
      }
    }
  }

  res.status(200).json({ success: true });
});


// ================= GET ORDERS BY USER ID (ADMIN) =================
app.get("/api/admin/users/:userId/orders", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền này" });
  }

  try {
    const userId = parseInt(req.params.userId);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      orderBy: { order_date: "desc" },
    });

    res.json({ username: user.username, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= GET ORDER DETAILS =================
app.get("/api/orders/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;

    const order = await prisma.orders.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (role !== "admin" && order.user_id !== userId) {
      return res.status(403).json({ message: "Không có quyền truy cập đơn hàng này" });
    }

    const orderUserId = order.user_id;

    // Lấy order items kèm thông tin sách và kiểm tra đã review chưa
    const items = await prisma.order_items.findMany({
      where: { order_id: id },
      include: {
        books: { select: { title: true, image: true } },
      },
    });

    const itemsWithReview = await Promise.all(
      items.map(async (item) => {
        const reviewCount = await prisma.reviews.count({
          where: { book_id: item.book_id, user_id: orderUserId },
        });
        return {
          ...item,
          title: item.books?.title,
          image: item.books?.image,
          is_reviewed: reviewCount,
        };
      })
    );

    res.json({ order_info: order, items: itemsWithReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= UPDATE ORDER STATUS =================
app.put("/api/orders/:id/status", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!status) {
      return res.status(400).json({ message: "Vui lòng cung cấp trạng thái mới" });
    }

    const order = await prisma.orders.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.status === "Đã hủy") {
      return res.status(400).json({ message: "Không thể cập nhật đơn hàng đã bị hủy" });
    }

    if (order.status === "Đang giao" && status === "Đã hủy") {
      return res.status(400).json({ message: "Không thể hủy đơn hàng đang giao" });
    }

    if (order.status === "Đã giao") {
      return res.status(400).json({ message: "Không thể cập nhật trạng thái đơn hàng đã giao" });
    }

    if (role === "admin" && status === "Đã hủy") {
      return res.status(403).json({ message: "Chỉ khách hàng mới có quyền hủy đơn hàng" });
    }

    if (role !== "admin") {
      if (order.user_id !== userId) {
        return res.status(403).json({ message: "Bạn không có quyền cập nhật đơn hàng này" });
      }
      if (status !== "Đã hủy") {
        return res.status(403).json({ message: "Người dùng chỉ có quyền hủy đơn hàng" });
      }
      const canCancelCod = order.payment_method === "cod" && order.status === "Đang xử lí";
      const canCancelQr = order.payment_method === "qr" && order.status === "Chờ thanh toán";
      if (!canCancelCod && !canCancelQr) {
        return res.status(400).json({ message: "Không thể hủy đơn hàng ở trạng thái hiện tại" });
      }
    }

    await prisma.orders.update({ where: { id }, data: { status } });

    // Hoàn kho nếu hủy đơn
    if (status === "Đã hủy") {
      const orderItems = await prisma.order_items.findMany({ where: { order_id: id } });
      await Promise.all(
        orderItems.map((item) =>
          prisma.books.update({
            where: { id: item.book_id },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
    }

    res.json({ message: "Cập nhật trạng thái đơn hàng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= CANCEL QR CHECKOUT & RESTORE CART =================
app.post("/api/orders/:id/cancel-checkout", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user_id = req.user.id;

    const order = await prisma.orders.findFirst({
      where: { id, user_id, status: "Chờ thanh toán" },
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng hợp lệ để hủy" });
    }

    const items = await prisma.order_items.findMany({ where: { order_id: id } });

    await prisma.$transaction(async (tx) => {
      if (items.length > 0) {
        // Khôi phục giỏ hàng
        await tx.cart_items.createMany({
          data: items.map((item) => ({
            user_id,
            book_id: item.book_id,
            quantity: item.quantity,
          })),
        });

        // Khôi phục kho
        for (const item of items) {
          await tx.books.update({
            where: { id: item.book_id },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Xóa order_items và order
      await tx.order_items.deleteMany({ where: { order_id: id } });
      await tx.orders.delete({ where: { id } });
    });

    res.json({ message: "Đã hủy giao dịch và khôi phục giỏ hàng" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});