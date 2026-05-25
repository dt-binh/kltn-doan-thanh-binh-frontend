import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../pages/admin/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    books: 0,
    orders: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token || !user) {
        navigate("/login");
        return;
      }
      if (user.role !== "admin") {
        navigate("/");
        return;
      }

      try {
        const [statsRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/orders", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5)); // Lấy 5 đơn hàng mới nhất
      } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;

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
            <h3>{Number(stats.revenue || 0).toLocaleString()} ₫</h3>
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
          {recentOrders.map(order => (
            <div key={order.id} className="order-row">
              <span>DH{order.id.toString().padStart(4, '0')}</span>
              <span>{order.username}</span>
              <span>{order.total.toLocaleString()} ₫</span>
              <span className={`status ${order.status === 'Đã giao' ? 'success' : order.status === 'Đã hủy' ? 'danger' : 'pending'}`}>
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
