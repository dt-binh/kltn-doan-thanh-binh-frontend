const express = require("express");
const cors = require("cors");
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

// ================= HOME =================
app.get("/", (req, res) => {
  res.send("API đang chạy...");
});

// ================= ROUTERS =================
const authRouter = require("./src/routes/auth");
const usersRouter = require("./src/routes/users");
const booksRouter = require("./src/routes/books");
const genresRouter = require("./src/routes/genres");
const authorsRouter = require("./src/routes/authors");
const cartRouter = require("./src/routes/cart");
const ordersRouter = require("./src/routes/orders");
const statsRouter = require("./src/routes/stats");
const uploadRouter = require("./src/routes/upload");
const webhookRouter = require("./src/routes/webhook");

app.use(authRouter);
app.use(usersRouter);
app.use(booksRouter);
app.use(genresRouter);
app.use(authorsRouter);
app.use(cartRouter);
app.use(ordersRouter);
app.use(statsRouter);
app.use(uploadRouter);
app.use(webhookRouter);

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});