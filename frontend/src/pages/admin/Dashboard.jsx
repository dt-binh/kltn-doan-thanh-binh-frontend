import React from 'react';
import '../../pages/admin/Dashboard.css';
import { books, orders, users } from '../../data/mockData';

const Dashboard = () => {
  const stats = {
    users: users.length,
    books: books.length,
    orders: orders.length,
    revenue: orders.reduce((sum, order) => sum + order.total, 0).toLocaleString() + ' ₫'
  };

  return (
    <main className="admin-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Tổng người dùng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.books}</h3>
            <p>Tổng truyện</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.orders}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{stats.revenue}</h3>
            <p>Doanh thu</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Doanh thu theo tháng</h3>
          <div className="chart-bar">
            <div className="bar" style={{height: '80%'}}></div>
            <div className="bar" style={{height: '60%'}}></div>
            <div className="bar" style={{height: '90%'}}></div>
            <div className="bar" style={{height: '70%'}}></div>
          </div>
          <div className="chart-labels">
            <span>Th1</span>
            <span>Th2</span>
            <span>Th3</span>
            <span>Th4</span>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h3>Đơn hàng gần đây</h3>
        <div className="orders-table">
          {orders.slice(-5).reverse().map(order => (
            <div key={order.id} className="order-row">
              <span>DH{order.id.toString().padStart(4, '0')}</span>
              <span>{order.customer}</span>
              <span>{order.total.toLocaleString()} ₫</span>
              <span className={`status ${order.status === 'Đã giao' ? 'success' : order.status === 'Đã hủy' ? 'danger' : ''}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;

