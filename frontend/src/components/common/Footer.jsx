import React from 'react';
import "./Footer.css"
 const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Smile shop</h3>
                        <p>Web bán truyện hay</p>
                    </div>
                    <div className="footer-section">
                        <h4>Liên kết</h4>
                        <ul>
                            <li><a href="">Giới thiệu</a></li>
                            <li><a href="">Liên hệ</a></li>
                            <li><a href="">Chính sách</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Social</h4>
                        <div className="social-links">
                            <a href="#">FB</a>
                            <a href="#">IG</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2023 Smile. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
export default Footer;