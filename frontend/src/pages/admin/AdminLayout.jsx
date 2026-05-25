import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import '../../pages/admin/Dashboard.css'; // Reuse styles for layout

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-header">
          <h1>Admin Panel</h1>
          <div className="header-actions">
            <span style={{ marginRight: "15px" }}>Chào Admin! 👋</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 15px",
                background: "#ff4d6d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
