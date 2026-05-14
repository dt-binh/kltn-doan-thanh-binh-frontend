import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  // Lấy thông tin user
  const user = JSON.parse(localStorage.getItem("user"));

  // Dropdown user
  const [showMenu, setShowMenu] = useState(false);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.reload();
  };

  return (
    <header className="header-wrapper">
      <div className="header-container">

        {/* Logo */}
        <Link to="/" className="header-logo">
          BOOKS SHOP
        </Link>

        {/* Search */}
        <div className="header-search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm truyện..."
          />

          <button type="submit">
            🔍︎
          </button>
        </div>

        {/* Menu */}
        <div className="header-nav-menu">

          <Link to="/books">
            📚 Truyện mới
          </Link>

          {/* Cart */}
          <Link to="/cart" className="cart-link">
            🛒 Giỏ hàng
          </Link>

          {/* Nếu đăng nhập */}
          {user ? (
            <>
              {/* User */}
              <div className="header-user-wrapper">

                <div
                  className="header-user"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <span className="user-icon">
                    👤
                  </span>

                  <span className="username">
                    {user.username}
                  </span>
                </div>

                {/* Dropdown */}
                {showMenu && (
                  <div className="user-dropdown">

                    <div className="dropdown-user-info">
                      <p>
                        <strong>Tên:</strong>
                        {" "}
                        {user.username}
                      </p>

                      <p>
                        <strong>Email:</strong>
                        {" "}
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="dropdown-link"
                    >
                      Trang cá nhân
                    </Link>

                    <Link
                      to="/orders"
                      className="dropdown-link"
                    >
                      Đơn hàng
                    </Link>
                  </div>
                )}
              </div>

              {/* Logout đưa lên cùng hàng */}
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;