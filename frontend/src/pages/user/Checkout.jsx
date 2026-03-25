import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import '../../pages/user/Checkout.css';

const Checkout = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cod'
  });
  const [total] = useState(430000); // Mock from cart
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock order
    console.log('Order:', formData, total);
    alert('Đặt hàng thành công!');
    navigate('/profile');
  };

  return (
    <>
      <Header />
      <main className="checkout-page">
        <div className="container">
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
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Địa chỉ giao hàng</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="3" required />
                </div>

                <h3>Phương thức thanh toán</h3>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} />
                    <span>Thanh toán khi nhận hàng</span>
                  </label>
                  <label className="payment-option">
                    <input type="radio" name="paymentMethod" value="online" checked={formData.paymentMethod === 'online'} onChange={handleChange} />
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
                <div className="summary-item">
                  <span>Harry Potter (x2)</span>
                  <span>300,000 ₫</span>
                </div>
                <div className="summary-item">
                  <span>Dế Mèn (x1)</span>
                  <span>80,000 ₫</span>
                </div>
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

