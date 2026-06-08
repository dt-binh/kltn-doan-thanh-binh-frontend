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
                <div className="table-header" style={{ gridTemplateColumns: "0.8fr 1fr 1fr 1.5fr 1.2fr 1.5fr" }}>
                  <span>Mã đơn</span>
                  <span>Ngày đặt</span>
                  <span>Tổng tiền</span>
                  <span>Phương thức TT</span>
                  <span>Trạng thái</span>
                  <span>Thao tác</span>
                </div>

                {currentOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <div className="table-row" style={{ gridTemplateColumns: "0.8fr 1fr 1fr 1.5fr 1.2fr 1.5fr", alignItems: "center" }}>
                    <span>DH{order.id.toString().padStart(4, "0")}</span>
                    <span>{new Date(order.order_date).toLocaleDateString("vi-VN")}</span>
                    <span>{order.total.toLocaleString()} ₫</span>
                    <span style={{ fontWeight: "500", color: order.payment_method === 'qr' ? "#10b981" : "#4b5563" }}>
                      {order.payment_method === 'qr' ? 'Đã thanh toán QR' : 'Tiền mặt'}
                    </span>
                    <span
                      className={`status ${
                        order.status === "Đã giao" ? "completed" : order.status === "Đã hủy" ? "danger" : ""
                      }`}
                    >
                      {order.status}
                    </span>
                      <span style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {((order.payment_method === 'cod' && order.status === 'Đang xử lí') || (order.payment_method === 'qr' && order.status === 'Chờ thanh toán')) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
                          >
                            Hủy
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleOrderDetails(order.id)}
                          style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
                        >
                          {expandedOrder === order.id ? 'Ẩn' : 'Chi tiết'}
                        </button>
                      </span>
                    </div>
                    
                    {expandedOrder === order.id && (
                      <div className="order-details-dropdown" style={{ padding: "15px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        {detailsLoading ? <p style={{ margin: 0 }}>Đang tải chi tiết...</p> : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <h4 style={{ margin: "0 0 10px 0" }}>Sản phẩm trong đơn hàng:</h4>
                            {orderDetails.map(item => (
                              <div key={item.book_id} style={{ display: "flex", alignItems: "center", gap: "15px", background: "#fff", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                                <img src={item.image || "https://via.placeholder.com/50x70"} alt={item.title} style={{ width: "50px", height: "70px", objectFit: "cover", borderRadius: "4px" }} />
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ margin: "0 0 5px 0" }}>{item.title}</h4>
                                  <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>Số lượng: {item.quantity} x {item.price.toLocaleString()} ₫</p>
                                </div>
                                <div style={{ fontWeight: "bold" }}>{(item.quantity * item.price).toLocaleString()} ₫</div>
                                {order.status === "Đã giao" && (
                                  <div style={{ marginLeft: "15px", minWidth: "120px", textAlign: "right" }}>
                                    {item.is_reviewed > 0 ? (
                                      <span style={{ color: "#10b981", fontSize: "14px", fontWeight: "bold" }}>✓ Đã đánh giá</span>
                                    ) : (
                                      <button 
                                        onClick={() => navigate(`/book/${item.book_id}#reviews`)}
                                        style={{ background: "#f59e0b", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
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
                <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    style={{ padding: "6px 12px", cursor: currentPage === 1 ? "not-allowed" : "pointer", border: "1px solid #d1d5db", background: "#f9fafb", borderRadius: "6px", color: "#374151" }}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page} 
                      onClick={() => setCurrentPage(page)}
                      style={{ padding: "6px 12px", cursor: "pointer", border: "1px solid #d1d5db", background: currentPage === page ? "#3b82f6" : "#fff", color: currentPage === page ? "#fff" : "#374151", borderRadius: "6px" }}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    style={{ padding: "6px 12px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", border: "1px solid #d1d5db", background: "#f9fafb", borderRadius: "6px", color: "#374151" }}
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