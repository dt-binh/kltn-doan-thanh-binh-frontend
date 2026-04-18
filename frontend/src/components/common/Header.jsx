import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="header-wrapper">
      <div className="header-container">
        <Link to="/" className="header-logo">
          Smile
        </Link>

        <div className="header-search-bar">
          <input type="text" placeholder="Tìm kiếm truyện..." />
          <button type="submit">🔍︎</button>
        </div>

        <div className="header-nav-menu">
          <Link to="/books">Truyện mới</Link>
          <Link to="/cart">Giỏ hàng</Link>
          <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;