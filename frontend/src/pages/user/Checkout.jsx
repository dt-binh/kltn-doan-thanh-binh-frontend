import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import "./Checkout.css";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' hoặc 'qr'
  const [loading, setLoading] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const [cartRes, profileRes] = await Promise.all([
        axios.get("http://localhost:5000/api/cart", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCartItems(cartRes.data);
      setUserProfile(profileRes.data.user);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert("Giỏ hàng trống!");
    
    if (!userProfile?.phone || !userProfile?.address) {
      alert("Vui lòng cập nhật Số điện thoại và Địa chỉ trong trang Cá nhân trước khi đặt hàng!");
      navigate("/profile");
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Gọi API tạo đơn hàng (Backend sẽ tự lấy giỏ hàng và chuyển thành order)
      const res = await axios.post("http://localhost:5000/api/orders", {
        payment_method: paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (paymentMethod === "qr") {
        // Chuyển sang màn hình chờ quét QR
        setCreatedOrderId(res.data.order_id);
      } else {
        alert("Đặt hàng thành công!");
        navigate("/profile"); 
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Polling: Tự động kiểm tra trạng thái đơn hàng mỗi 3 giây nếu đang ở màn hình QR
  useEffect(() => {
    let interval;
    if (createdOrderId) {
      interval = setInterval(async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await axios.get(`http://localhost:5000/api/orders/${createdOrderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.order_info.status === 'Đang xử lí') {
            clearInterval(interval);
            alert("✅ Thanh toán thành công! Đơn hàng đã được xác nhận.");
            navigate("/profile");
          }
        } catch (error) {}
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [createdOrderId, navigate]);

  const handleChangePaymentMethod = async () => {
    if (!window.confirm("Giao dịch QR hiện tại sẽ bị hủy để bạn chọn phương thức khác. Tiếp tục?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/orders/${createdOrderId}/cancel-checkout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreatedOrderId(null); // Ẩn mã QR, quay lại trang trước đó
      setPaymentMethod("cod"); // Reset lựa chọn về Tiền mặt
      fetchData(); // Tải lại thông tin giỏ hàng
    } catch (error) {
      alert("Có lỗi xảy ra khi thay đổi phương thức");
    }
  };

  // MÀN HÌNH CHỜ THANH TOÁN QR (HIỂN THỊ SAU KHI CLICK ĐẶT HÀNG)
  if (createdOrderId) {
    const orderCode = `DH${createdOrderId.toString().padStart(4, "0")}`;
    const qrCodeUrl = `https://img.vietqr.io/image/MB-0397331521-compact2.png?amount=${totalAmount}&addInfo=${orderCode}&accountName=DOAN THANH BINH`;
    return (
      <>
        <Header />
        <main className="checkout-qr-page">
          <h2 className="qr-title">Đơn hàng đã được tạo!</h2>
          <p className="qr-desc">
            Vui lòng mở ứng dụng ngân hàng và quét mã QR bên dưới để thanh toán.
          </p>
          <div className="qr-card">
            <img
              src={qrCodeUrl}
              alt="Mã QR Chuyển Khoản"
              className="qr-image"
            />
            <p className="qr-amount">
              Số tiền:
              <span className="qr-price">
                {totalAmount.toLocaleString()} ₫
              </span>
            </p>
           <p className="qr-content">
              Nội dung:
              <strong className="qr-order-code">
                {orderCode}
              </strong>
            </p>
          </div>
          <div className="qr-waiting">
            <span className="spinner"></span>
            Hệ thống đang tự động chờ nhận tiền...
          </div>

      <div className="qr-actions">
      <button
        onClick={handleChangePaymentMethod}
        className="change-payment-btn"
      >
        Thay đổi phương thức thanh toán
      </button>
      </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="checkout-page">
        <h2 className="checkout-title">
          Thanh toán đơn hàng
        </h2>
        
        <div className="checkout-layout">
          
          {/* CỘT TRÁI: THÔNG TIN ĐƠN HÀNG */}
          <div className="checkout-left">
            <h3>Tóm tắt đơn hàng</h3>
            <ul className="checkout-list">
              {cartItems.map((item) => (
                <li key={item.id} className="checkout-item">
                  <span>{item.title} <strong>(x{item.quantity})</strong></span>
                  <span>{(item.price * item.quantity).toLocaleString()} ₫</span>
                </li>
              ))}
            </ul>
            
            <h3 className="checkout-total">
              <span>Tổng cộng thanh toán:</span>
              <span className="checkout-price">{totalAmount.toLocaleString()} ₫</span>
            </h3>
            
            <div className="payment-box">
              <h4 className="payment-title">Chọn phương thức thanh toán</h4>
              <label className="payment-option">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="payment-radio"
                />
                Thanh toán khi nhận hàng (Tiền mặt)
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  value="qr"
                  checked={paymentMethod === "qr"}
                  onChange={() => setPaymentMethod("qr")}
                  className="payment-radio"
                />
                Chuyển khoản qua mã QR
              </label>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              className="checkout-btn"
            >
              {loading ? "Đang xử lý..." : "Xác nhận & Đặt hàng"}
            </button>
          </div>

          {/* CỘT PHẢI: HƯỚNG DẪN THANH TOÁN */}
          <div className="checkout-right">
            {paymentMethod === "qr" ? (
              <div className="checkout-guide">
                <h3 className="guide-title">Thanh toán qua QR Code</h3>
                <p>Sau khi bấm đặt hàng, hệ thống sẽ tạo mã QR để bạn quét thanh toán tự động.</p>
                <div className="guide-icon">
                  📱
                </div>
              </div>
            ) : (
              <div className="checkout-guide">
                <h3 className="guide-title">
                  Thanh toán tiền mặt (COD)
                </h3>

                <p>
                  Bạn sẽ thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận được sách.
                </p>

                <div className="guide-icon">
                  🚚
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;