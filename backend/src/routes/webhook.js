const express = require("express");
const prisma = require("../config/db");

const router = express.Router();

// ================= SEPAY WEBHOOK (AUTO CONFIRM PAYMENT) =================
router.post("/api/webhook/sepay", async (req, res) => {
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

module.exports = router;
