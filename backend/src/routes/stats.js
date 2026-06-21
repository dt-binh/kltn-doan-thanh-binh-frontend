const express = require("express");
const prisma = require("../config/db");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// ================= GET ADMIN STATS =================
router.get("/api/admin/stats", verifyToken, async (req, res) => {
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

module.exports = router;
