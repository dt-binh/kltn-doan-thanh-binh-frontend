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
          phone: profileRes.data.user.phone || "0123456789",
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

  const handleEdit = (e) => {
    e.preventDefault();
    alert("Cập nhật thành công!");
    setEditMode(false);
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

                  <button className="edit-btn" onClick={() => setEditMode(true)}>
                    Chỉnh sửa
                  </button>
                </div>
              )}
            </div>

            <div className="orders-history">
              <h2>Lịch sử đơn hàng</h2>

              <div className="orders-table">
                <div className="table-header">
                  <span>Mã đơn</span>
                  <span>Ngày đặt</span>
                  <span>Tổng tiền</span>
                  <span>Trạng thái</span>
                </div>

                {orders.map((order) => (
                  <div key={order.id} className="table-row">
                    <span>DH{order.id.toString().padStart(4, "0")}</span>
                    <span>{new Date(order.order_date).toLocaleDateString("vi-VN")}</span>
                    <span>{order.total.toLocaleString()} ₫</span>
                    <span
                      className={`status ${
                        order.status === "Đã giao" ? "completed" : ""
                      }`}
                    >
                      {order.status}
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