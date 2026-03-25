import React from 'react';
import { Link } from 'react-router-dom';
import './Adminsidebar.css';

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <Link to="/admin" className="nav-item">
          <span>📊</span>
          Dashboard
        </Link>
        <Link to="/admin/users" className="nav-item">
          <span>👥</span>
          Quản lý người dùng
        </Link>
        {/* TODO: Implement these pages */}
        <Link to="/admin/books" className="nav-item" title="Coming soon">
          <span>📚</span>
          Quản lý truyện
        </Link>
        <Link to="/admin/genres" className="nav-item" title="Coming soon">
          <span>📂</span>
          Quản lý thể loại
        </Link>
        <Link to="/admin/authors" className="nav-item" title="Coming soon">
          <span>✍️</span>
          Quản lý tác giả
        </Link>
        <Link to="/admin/orders" className="nav-item" title="Coming soon">
          <span>📋</span>
          Quản lý đơn hàng
        </Link>
        {/* END TODO */}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

