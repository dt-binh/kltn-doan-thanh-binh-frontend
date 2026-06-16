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
      const res = await axios.get(
        "http://localhost:5000/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi lấy user:", error);

      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.status === 403)
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // Toggle trạng thái
  const toggleStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "active"
        ? "inactive"
        : "active";

    try {
      await axios.put(
        `http://localhost:5000/api/users/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
    } catch (error) {
      console.error("Lỗi cập nhật user", error);
      alert("Lỗi cập nhật!");
    }
  };

  return (
    <div className="users-page admin-page">
      <h2>Quản lý người dùng ({users.length})</h2>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>TÊN</th>
              <th>EMAIL</th>
              <th>QUYỀN</th>
              <th>NGÀY ĐĂNG KÝ</th>
              <th>TRẠNG THÁI</th>
              <th>LỊCH SỬ MUA HÀNG</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>

                <td>{user.username}</td>

                <td>{user.email}</td>

                <td>{user.role}</td>

                <td>
                  {new Date(
                    user.created_at
                  ).toLocaleDateString("vi-VN")}
                </td>

                {/* STATUS */}
                <td className="status-cell">
                  <div className="status-wrapper">
                    <span
                      className={`user-status ${
                        user.status === "active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {user.status === "active"
                        ? "Hoạt động"
                        : "Đã khóa"}
                    </span>
                  </div>
                </td>

                {/* HISTORY */}
                <td>
                  <div className="history-wrapper">
                    <button
                      className="history-btn"
                      onClick={() =>
                        navigate(
                          `/admin/users/${user.id}/orders`
                        )
                      }
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </td>

                {/* ACTION */}
                <td className="action-cell">
                  <div className="action-wrapper">
                    {user.role !== "admin" ? (
                      <button
                        className={
                          user.status === "active"
                            ? "btn-lock"
                            : "btn-unlock"
                        }
                        onClick={() =>
                          toggleStatus(
                            user.id,
                            user.status
                          )
                        }
                      >
                        {user.status === "active"
                          ? "🔒 Khóa"
                          : "🔓 Mở"}
                      </button>
                    ) : (
                      <span className="admin-text">
                        Quản trị
                      </span>
                    )}
                  </div>
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