import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Phân trang đơn hàng
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Lọc danh sách đơn hàng theo trang hiện tại
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token || !user) {
        navigate("/login");
        return;
      }

      try {
        const [profileRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUserInfo({
          name: profileRes.data.user.username || "",
          email: profileRes.data.user.email || "",
          phone: profileRes.data.user.phone || "",
          address: profileRes.data.user.address || "",
        });

        setOrders(ordersRes.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, []);

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/profile", userInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Cập nhật thành công!");
      setEditMode(false);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert("Lỗi khi cập nhật thông tin");
      }
    }
  };

  // Hàm gọi API Hủy đơn hàng (Chỉ dành cho đơn COD đang xử lí)
  const handleCancelOrder = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status: 'Đã hủy' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Đã hủy đơn hàng thành công!");
      // Tải lại danh sách đơn hàng
      const ordersRes = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(ordersRes.data);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Lỗi khi hủy đơn hàng");
      }
    }
  };

  const handleToggleOrderDetails = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setDetailsLoading(true);
    setExpandedOrder(orderId);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderDetails(res.data.items);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.error("Lỗi lấy chi tiết đơn hàng:", err);
        alert("Không thể tải chi tiết đơn hàng.");
        setExpandedOrder(null);
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1>Tài khoản của tôi</h1>
            <p>Quản lý thông tin cá nhân và lịch sử đơn hàng</p>
          </div>

          <div className="profile-grid">
            <div className="profile-info">
              <h2>Thông tin cá nhân</h2>

              {editMode ? (
                <form onSubmit={handleEdit}>
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input
                      value={userInfo.name}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      value={userInfo.email}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      value={userInfo.phone}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <input
                      value={userInfo.address}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="profile-buttons">
                    <button type="submit" className="save-btn">
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setEditMode(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="info-display">
                  <p>
                    <strong>Họ tên:</strong> {userInfo.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {userInfo.email}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {userInfo.phone}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {userInfo.address}
                  </p>

                  <button className="edit-btn" onClick={() => setEditMode(true)}>
                    Chỉnh sửa
                  </button>
                </div>
              )}
            </div>

            <div className="orders-history">
              <h2>Lịch sử đơn hàng</h2>

              <div className="orders-table">
                <div className="table-header orders-header">
                  <span>Mã đơn</span>
                  <span>Ngày đặt</span>
                  <span>Tổng tiền</span>
                  <span>Phương thức TT</span>
                  <span>Trạng thái</span>
                  <span>Thao tác</span>
                </div>

                {currentOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <div className="table-row orders-row">
                    <span>DH{order.id.toString().padStart(4, "0")}</span>
                    <span>{new Date(order.order_date).toLocaleDateString("vi-VN")}</span>
                    <span>{order.total.toLocaleString()} ₫</span>
                   <span
                      className={
                        order.payment_method === "qr"
                          ? "payment-qr"
                          : "payment-cod"
                      }
                    >
                      {order.payment_method === 'qr' ? 'Đã thanh toán QR' : 'Tiền mặt'}
                    </span>
                    <span
                      className={`status ${
                        order.status === "Đã giao" ? "completed" : order.status === "Đã hủy" ? "danger" : ""
                      }`}
                    >
                      {order.status}
                    </span>
                      <span className="action-buttons">
                        {((order.payment_method === 'cod' && order.status === 'Đang xử lí') || (order.payment_method === 'qr' && order.status === 'Chờ thanh toán')) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="cancel-order-btn"
                          >
                            Hủy
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleOrderDetails(order.id)}
                          className="detail-order-btn"
                        >
                          {expandedOrder === order.id ? "Ẩn" : "Chi tiết"}
                        </button>
                      </span>
                    </div>
                    
                    {expandedOrder === order.id && (
                     <div className="order-details-dropdown">
                        {detailsLoading ? <p style={{ margin: 0 }}>Đang tải chi tiết...</p> : (
                          <div className="order-details-container">
                            <h4 className="order-details-title">
                              Sản phẩm trong đơn hàng:
                            </h4>
                            {orderDetails.map(item => (
                              <div
                                key={item.book_id}
                                className="order-item"
                              >
                                <img
                                  src={item.image || "https://via.placeholder.com/50x70"}
                                  alt={item.title}
                                  className="order-item-image"
                                />
                                <div className="order-item-info">
                                  <h4 className="order-item-title">
                                    {item.title}
                                  </h4>

                                  <p className="order-item-desc">
                                    Số lượng: {item.quantity} x {item.price.toLocaleString()} ₫
                                  </p>
                                </div>
                               <div className="order-item-total">
                                {(item.quantity * item.price).toLocaleString()} ₫
                              </div>
                                {order.status === "Đã giao" && (
                                  <div className="review-section">
                                    {item.is_reviewed > 0 ? (
                                      <span className="reviewed">
                                        ✓ Đã đánh giá
                                      </span>
                                    ) : (
                                      <button
                                        className="review-btn"
                                        onClick={() =>
                                          navigate(`/book/${item.book_id}#reviews`)
                                        }
                                      >
                                        Đánh giá ngay
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`pagination-number ${
                        currentPage === page ? "active" : ""
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Profile;