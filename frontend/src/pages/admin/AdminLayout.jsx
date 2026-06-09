import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// Sidebar của trang Admin
import AdminSidebar from '../../components/admin/AdminSidebar';

// File CSS chứa giao diện
import './AdminLayout.css';

const AdminLayout = () => {
  // Hook dùng để chuyển trang
  const navigate = useNavigate();

  // Hàm xử lý khi nhấn nút đăng xuất
  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Chuyển về trang đăng nhập
    navigate("/login");
  };

  return (
    // Layout chính của trang Admin
    <div className="admin-layout">

      {/* Thanh menu bên trái */}
      <AdminSidebar />

      {/* Khu vực nội dung bên phải */}
      <div className="admin-main">

        {/* Header trên cùng */}
        <header className="admin-header">

          {/* Tiêu đề trang */}
          <h1>Admin Panel</h1>

          {/* Khu vực bên phải header */}
          <div className="header-actions">

            {/* Lời chào Admin */}
            <span className="admin-greeting">
              Chào Admin! 👋
            </span>

            {/* Nút đăng xuất */}
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Đăng xuất
            </button>

          </div>
        </header>

        {/* Nội dung các trang con sẽ hiển thị ở đây */}
        <main className="admin-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;