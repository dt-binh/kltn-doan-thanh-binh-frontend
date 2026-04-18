import React, { useState } from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { orders } from "../../data/mockData";
import "./Profile.css";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Nguyễn Văn A",
    email: "user@example.com",
    phone: "0123456789",
  });

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
                    <span>{order.date}</span>
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