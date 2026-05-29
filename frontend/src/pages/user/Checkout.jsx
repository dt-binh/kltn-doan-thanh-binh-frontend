import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

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
        <main style={{ padding: "60px 20px", maxWidth: "600px", margin: "0 auto", textAlign: "center", minHeight: "60vh" }}>
          <h2 style={{ color: "#10b981", marginBottom: "10px" }}>Đơn hàng đã được tạo!</h2>
          <p style={{ fontSize: "16px", color: "#4b5563", marginBottom: "20px" }}>
            Vui lòng mở ứng dụng ngân hàng và quét mã QR bên dưới để thanh toán.
          </p>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", display: "inline-block" }}>
            <img src={qrCodeUrl} alt="Mã QR Chuyển Khoản" style={{ width: "250px", borderRadius: "10px", marginBottom: "15px" }} />
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "18px" }}>Số tiền: <span style={{ color: "#e63946" }}>{totalAmount.toLocaleString()} ₫</span></p>
            <p style={{ margin: "5px 0 0 0", color: "#6b7280" }}>Nội dung: <strong style={{ color: "#1f2937" }}>{orderCode}</strong></p>
          </div>
          <div style={{ marginTop: "30px", color: "#f59e0b", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <span style={{ width: "20px", height: "20px", border: "3px solid #f3f4f6", borderTop: "3px solid #f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
            Hệ thống đang tự động chờ nhận tiền...
          </div>

      <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
      <button 
        onClick={handleChangePaymentMethod} 
        style={{ padding: "10px 20px", background: "transparent", border: "1px solid #3b82f6", borderRadius: "8px", cursor: "pointer", color: "#3b82f6", fontWeight: "bold" }}
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
      <main style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto", minHeight: "60vh" }}>
        <h2 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px", marginBottom: "20px" }}>
          Thanh toán đơn hàng
        </h2>
        
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
          
          {/* CỘT TRÁI: THÔNG TIN ĐƠN HÀNG */}
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h3>Tóm tắt đơn hàng</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {cartItems.map((item) => (
                <li key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px dashed #eee", paddingBottom: "8px" }}>
                  <span>{item.title} <strong>(x{item.quantity})</strong></span>
                  <span>{(item.price * item.quantity).toLocaleString()} ₫</span>
                </li>
              ))}
            </ul>
            
            <h3 style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <span>Tổng cộng thanh toán:</span>
              <span style={{ color: "#e63946", fontSize: "24px" }}>{totalAmount.toLocaleString()} ₫</span>
            </h3>
            
            <div style={{ marginTop: "20px", padding: "15px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#374151" }}>Chọn phương thức thanh toán</h4>
              <label style={{ display: "block", marginBottom: "10px", cursor: "pointer", fontSize: "15px" }}>
                <input 
                  type="radio" 
                  value="cod" 
                  checked={paymentMethod === "cod"} 
                  onChange={() => setPaymentMethod("cod")} 
                  style={{ marginRight: "10px" }}
                />
                Thanh toán khi nhận hàng (Tiền mặt)
              </label>
              <label style={{ display: "block", cursor: "pointer", fontSize: "15px" }}>
                <input 
                  type="radio" 
                  value="qr" 
                  checked={paymentMethod === "qr"} 
                  onChange={() => setPaymentMethod("qr")} 
                  style={{ marginRight: "10px" }}
                />
                Chuyển khoản qua mã QR
              </label>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={loading || cartItems.length === 0}
              style={{
                width: "100%", padding: "14px", background: "#10b981", color: "#fff", 
                border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginTop: "30px",
                fontWeight: "bold"
              }}
            >
              {loading ? "Đang xử lý..." : "Xác nhận & Đặt hàng"}
            </button>
          </div>

          {/* CỘT PHẢI: HƯỚNG DẪN THANH TOÁN */}
          <div style={{ flex: 1, minWidth: "300px", background: "#f9fafb", padding: "25px", borderRadius: "12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
            {paymentMethod === "qr" ? (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", color: "#4b5563" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#1f2937" }}>Thanh toán qua QR Code</h3>
                <p>Sau khi bấm đặt hàng, hệ thống sẽ tạo mã QR để bạn quét thanh toán tự động.</p>
                <div style={{ fontSize: "50px", marginTop: "20px" }}>📱</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", color: "#4b5563" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#1f2937" }}>Thanh toán tiền mặt (COD)</h3>
                <p>Bạn sẽ thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận được sách.</p>
                <div style={{ fontSize: "50px", marginTop: "20px" }}>🚚</div>
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