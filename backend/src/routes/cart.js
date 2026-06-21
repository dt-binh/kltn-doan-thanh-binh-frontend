const express = require("express");
const prisma = require("../config/db");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// ================= CART =================
router.get("/api/cart", verifyToken, async (req, res) => {
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

router.post("/api/cart", verifyToken, async (req, res) => {
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

router.delete("/api/cart/:id", verifyToken, async (req, res) => {
  try {
    await prisma.cart_items.deleteMany({
      where: { id: parseInt(req.params.id), user_id: req.user.id },
    });
    res.json({ message: "Đã xóa khỏi giỏ hàng" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
