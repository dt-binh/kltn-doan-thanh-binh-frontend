import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-col">
            <h3 className="footer-logo">Smile Shop</h3>
            <p className="footer-desc">
              Web bán truyện tranh uy tín, giá tốt, cập nhật truyện mới mỗi ngày.
            </p>

            <div className="footer-contact">
              <p>📍 Hà Nội, Việt Nam</p>
              <p>📞 0123 456 789</p>
              <p>✉️ smilesupport@gmail.com</p>
            </div>
          </div>

          <div className="footer-col">
            <h4>Hỗ trợ khách hàng</h4>
            <ul>
              <li><a href="#">Trung tâm trợ giúp</a></li>
              <li><a href="#">Hướng dẫn mua hàng</a></li>
              <li><a href="#">Thanh toán</a></li>
              <li><a href="#">Vận chuyển</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Chính sách</h4>
            <ul>
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản dịch vụ</a></li>
              <li><a href="#">Chính sách giao hàng</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Kết nối với chúng tôi</h4>
            <div className="footer-social">
              <a href="#">Facebook</a>
              <a href="#">Instagram</a>
              <a href="#">TikTok</a>
            </div>

            <h4 className="newsletter-title">Đăng ký nhận tin</h4>
            <div className="newsletter">
              <input type="text" placeholder="Nhập email của bạn..." />
              <button>Gửi</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Smile Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;