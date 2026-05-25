import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import "./Checkout.css";

const Checkout = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
  });

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token || !user) {
        navigate("/login");
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(res.data);
        const t = res.data.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(t);
      } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchCart();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post("http://localhost:5000/api/orders", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Đặt hàng thành công!");
      navigate("/profile");
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng.");
    }
  };

  return (
    <>
      <Header />

      <main className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Thanh toán</h1>
            <p>Thông tin nhận hàng và phương thức thanh toán</p>
          </div>

          <div className="checkout-content">
            <div className="checkout-form-section">
              <h2>Thông tin nhận hàng</h2>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa chỉ giao hàng</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </div>

                <h3>Phương thức thanh toán</h3>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleChange}
                    />
                    <span>Thanh toán khi nhận hàng</span>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === "online"}
                      onChange={handleChange}
                    />
                    <span>Thanh toán online</span>
                  </label>
                </div>

                <button type="submit" className="confirm-btn">
                  Xác nhận đặt hàng
                </button>
              </form>
            </div>

            <div className="checkout-summary">
              <h3>Đơn hàng của bạn</h3>

              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <span>{item.title} (x{item.quantity})</span>
                    <span>{(item.price * item.quantity).toLocaleString()} ₫</span>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                Tổng cộng: <strong>{total.toLocaleString()} ₫</strong>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Checkout;