const express = require("express");
const prisma = require("../config/db");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// ================= GET ORDERS =================
router.get("/api/orders", verifyToken, async (req, res) => {
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
router.post("/api/orders", verifyToken, async (req, res) => {
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

    // 4. Transaction: tạo đơn hàng
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

// ================= GET ORDERS BY USER ID (ADMIN) =================
router.get("/api/admin/users/:userId/orders", verifyToken, async (req, res) => {
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
router.get("/api/orders/:id", verifyToken, async (req, res) => {
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
router.put("/api/orders/:id/status", verifyToken, async (req, res) => {
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

    if (order.status === "Đã hủy" || order.status === "Không nhận hàng") {
      return res.status(400).json({ message: "Không thể cập nhật đơn hàng đã bị hủy" });
    }

    // Admin có thể cập nhật từ "Đang giao" -> "Không nhận hàng"
    // nhưng user không thể tự hủy khi đang giao
    const isCancellingWhileDelivering = order.status === "Đang giao" && status === "Đã hủy";

    if (isCancellingWhileDelivering) {
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

    // Hoàn kho nếu hủy đơn hoặc không nhận hàng
    if (status === "Đã hủy" || status === "Không nhận hàng") {
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
router.post("/api/orders/:id/cancel-checkout", verifyToken, async (req, res) => {
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

module.exports = router;
