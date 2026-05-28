import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import CartItem from "../../components/user/CartItem";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

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
      const formattedItems = res.data.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        book: {
          id: item.book_id,
          title: item.title,
          price: item.price,
          image: item.image,
        },
      }));
      setCartItems(formattedItems);
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const diff = newQty - item.quantity;
    if (diff === 0) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/api/cart",
        { book_id: item.book.id, quantity: diff },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
    }
  };

  const removeItem = async (itemId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  return (
    <>
      <Header />

      <main className="cart-page">
        <div className="cart-container">
          <div className="page-header">
            <div>
              <h1>Giỏ hàng của bạn</h1>
              <p>{cartItems.length} sản phẩm</p>
            </div>

            <Link to="/books" className="continue-btn">
              ← Tiếp tục mua sắm
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Giỏ hàng trống</p>
              <Link to="/books" className="btn-primary">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-list">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                  />
                ))}
              </div>

              <div className="cart-summary">
                <h3>Thanh toán</h3>

                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{total.toLocaleString()} ₫</span>
                </div>

                <div className="summary-row shipping-row">
                  <span>Phí vận chuyển:</span>
                  <span>0 ₫</span>
                </div>

                <div className="summary-row total-row">
                  <span>Tổng cộng:</span>
                  <span>{total.toLocaleString()} ₫</span>
                </div>

                <Link to="/checkout" className="checkout-btn">
                   Thanh toán
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Cart;