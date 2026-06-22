import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

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
    <div className="orders-page admin-page">
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
                    <span className={`status ${order.status !== 'Chờ thanh toán' ? 'status-success' : 'status-pending'}`}>
                      {order.status !== 'Chờ thanh toán' ? 'TT QR' : 'QR (Chờ TT)'}
                    </span>
                  ) : (
                    <span className="payment-cash">Tiền mặt</span>
                  )}
                </td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`status status-select ${
                      order.status === 'Đã giao' ? 'status-success' : 
                      order.status === 'Đã hủy' ? 'status-danger' : 
                      order.status === 'Không nhận hàng' ? 'status-danger' : 
                      order.status === 'Đang giao' ? 'status-delivering' : 
                      order.status === 'Đang xử lí' ? 'status-processing' : 
                      'status-pending'
                    }`}
                    disabled={['Đã hủy', 'Đã giao', 'Không nhận hàng'].includes(order.status)}
                  >
                    {order.status === 'Chờ thanh toán' && <option value="Chờ thanh toán">Chờ thanh toán</option>}
                    <option value="Đang xử lí">Đang xử lí</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã giao">Đã giao</option>
                    <option value="Không nhận hàng">Không nhận hàng</option>
                    {order.status === 'Đã hủy' && <option value="Đã hủy">Đã hủy</option>}
                  </select>
                </td>
                <td>{new Date(order.order_date).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <button
                      onClick={() => handleToggleOrderDetails(order.id)}
                      className={`btn-toggle-details ${expandedOrder === order.id ? 'active' : ''}`}
                    >
                      {expandedOrder === order.id ? 'Ẩn' : 'Chi tiết'}
                    </button>
                  </td>
                </tr>

                {expandedOrder === order.id && (
                  <tr>
                    <td colSpan="7" className="details-td">
                      <div className="details-wrapper">
                        {detailsLoading ? (
                          <p className="details-loading">Đang tải thông tin sản phẩm...</p>
                        ) : (
                          <div>
                            <h4 className="details-title">Sản phẩm trong đơn hàng:</h4>
                            <div className="details-list">
                              {orderDetails.map(item => (
                                <div key={item.book_id} className="detail-item">
                                  <img 
                                    src={item.image || "https://via.placeholder.com/50x70"} 
                                    alt={item.title} 
                                    className="detail-img" 
                                  />
                                  <div className="detail-info">
                                    <p className="detail-name">{item.title}</p>
                                    <p className="detail-qty">
                                      Số lượng: {item.quantity} x {item.price.toLocaleString()} ₫
                                    </p>
                                  </div>
                                  <div className="detail-price">
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
