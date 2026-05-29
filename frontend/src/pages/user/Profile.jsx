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
          localStorage.removeItem("token");
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
      alert("Lỗi khi cập nhật thông tin");
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
      alert(error.response?.data?.message || "Lỗi khi hủy đơn hàng");
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
                <div className="table-header" style={{ gridTemplateColumns: "0.8fr 1fr 1fr 1.5fr 1.2fr 1fr" }}>
                  <span>Mã đơn</span>
                  <span>Ngày đặt</span>
                  <span>Tổng tiền</span>
                  <span>Phương thức TT</span>
                  <span>Trạng thái</span>
                  <span>Thao tác</span>
                </div>

                {orders.map((order) => (
                  <div key={order.id} className="table-row" style={{ gridTemplateColumns: "0.8fr 1fr 1fr 1.5fr 1.2fr 1fr", alignItems: "center" }}>
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
                    <span>
                    {((order.payment_method === 'cod' && order.status === 'Đang xử lí') || (order.payment_method === 'qr' && order.status === 'Chờ thanh toán')) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
                        >
                          Hủy đơn
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Profile;