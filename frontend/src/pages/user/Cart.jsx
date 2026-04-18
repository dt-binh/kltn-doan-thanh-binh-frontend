import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import CartItem from "../../components/user/CartItem";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      book: {
        id: 1,
        title: "Harry Potter...",
        author: "J.K. Rowling",
        price: 150000,
        image: "...",
      },
      quantity: 2,
    },
    {
      id: "2",
      book: {
        id: 2,
        title: "Dế Mèn...",
        author: "Tô Hoài",
        price: 80000,
        image: "...",
      },
      quantity: 1,
    },
  ]);

  const updateQuantity = (itemId, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
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
                  Tiến hành thanh toán
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