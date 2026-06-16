import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  // State quản lý chi tiết đơn hàng
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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
      const res = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái", error);
      alert(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const handleToggleOrderDetails = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setDetailsLoading(true);
    setExpandedOrder(orderId);
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderDetails(res.data.items);
    } catch (err) {
      console.error("Lỗi lấy chi tiết đơn hàng:", err);
      alert("Không thể tải chi tiết đơn hàng.");
      setExpandedOrder(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h2>Quản lý đơn hàng ({orders.length})</h2>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Phương thức TT</th>
              <th>Trạng thái</th>
              <th>Ngày đặt</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr>
                <td>DH{order.id.toString().padStart(4, '0')}</td>
                <td>{order.username}</td>
                <td>{order.total.toLocaleString()} ₫</td>
                <td>
                  {order.payment_method === 'qr' ? (
                    <span className={`status ${order.status !== 'Chờ thanh toán' ? 'success' : 'pending'}`}>
                      {order.status !== 'Chờ thanh toán' ? 'Đã thanh toán QR' : 'QR (Chờ TT)'}
                    </span>
                  ) : (
                    <span style={{ fontWeight: '500', color: '#4b5563' }}>Tiền mặt</span>
                  )}
                </td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`status ${order.status === 'Đã giao' ? 'success' : order.status === 'Đã hủy' ? 'danger' : 'pending'}`}
                    style={{ border: 'none', outline: 'none', background: 'transparent' }}
                    disabled={order.status === 'Đã hủy' || order.status === 'Đã giao'}
                  >
                    {order.status === 'Chờ thanh toán' && <option value="Chờ thanh toán">Chờ thanh toán</option>}
                    <option value="Đang xử lí">Đang xử lí</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã giao">Đã giao</option>
                    {order.status === 'Đã hủy' && <option value="Đã hủy">Đã hủy</option>}
                  </select>
                </td>
                <td>{new Date(order.order_date).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <button
                      onClick={() => handleToggleOrderDetails(order.id)}
                      style={{ padding: '6px 12px', background: expandedOrder === order.id ? '#6b7280' : '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      {expandedOrder === order.id ? 'Ẩn' : 'Chi tiết'}
                    </button>
                  </td>
                </tr>

                {expandedOrder === order.id && (
                  <tr>
                    <td colSpan="7" style={{ padding: 0, borderBottom: '2px solid #e5e7eb' }}>
                      <div style={{ padding: '15px 20px', background: '#f9fafb' }}>
                        {detailsLoading ? (
                          <p style={{ margin: 0, color: '#6b7280' }}>Đang tải thông tin sản phẩm...</p>
                        ) : (
                          <div>
                            <h4 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '14px' }}>Sản phẩm trong đơn hàng:</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {orderDetails.map(item => (
                                <div key={item.book_id} style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                  <img 
                                    src={item.image || "https://via.placeholder.com/50x70"} 
                                    alt={item.title} 
                                    style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} 
                                  />
                                  <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#111827', fontSize: '14px' }}>{item.title}</p>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                                      Số lượng: {item.quantity} x {item.price.toLocaleString()} ₫
                                    </p>
                                  </div>
                                  <div style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '15px' }}>
                                    {(item.quantity * item.price).toLocaleString()} ₫
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
