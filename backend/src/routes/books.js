const express = require("express");
const prisma = require("../config/db");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// ================= GET BOOKS =================
router.get("/api/books", async (req, res) => {
  try {
    const books = await prisma.books.findMany({
      include: {
        authors: { select: { name: true } },
        genres: { select: { name: true } },
      },
    });

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
router.get("/api/books/:id", async (req, res) => {
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

// ================= CREATE BOOK (ADMIN) =================
router.post("/api/books", verifyToken, async (req, res) => {
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
router.put("/api/books/:id", verifyToken, async (req, res) => {
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
router.delete("/api/books/:id", verifyToken, async (req, res) => {
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

// ================= GET REVIEWS FOR A BOOK =================
router.get("/api/books/:id/reviews", async (req, res) => {
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
router.post("/api/books/:id/reviews", verifyToken, async (req, res) => {
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

module.exports = router;
