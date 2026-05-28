import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Users.css";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi lấy user:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // Toggle trạng thái
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error("Lỗi cập nhật user", error);
      alert("Lỗi cập nhật!");
    }
  };

  return (
    <div className="admin-page">
      <h2>Quản lý người dùng</h2>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Quyền</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="clickable-row"
                onClick={() => navigate(`/admin/users/${user.id}/orders`)}
              >
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>

                <td>
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </td>

                {/* STATUS */}
                <td className="status-cell">
                  <span
                    className={`user-status ${
                      user.status === "active" ? "active" : "inactive"
                    }`}
                  >
                    {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                  </span>
                </td>

                {/* ACTION */}
                <td className="action-cell">
                  {user.role !== 'admin' && (
                    <button
                      className={
                        user.status === "active" ? "btn-lock" : "btn-unlock"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(user.id, user.status);
                      }}
                    >
                      {user.status === "active" ? "🔒 Khóa" : "🔓 Mở"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;