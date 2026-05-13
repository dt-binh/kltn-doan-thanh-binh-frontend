import React, { useState } from "react";
import { users as initialUsers } from "../../data/mockData";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState(initialUsers);

  // Toggle trạng thái
  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user
      )
    );
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
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {users.slice(0, 10).map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>

                <td>
                  {user.createdAt ||
                    new Date(user.id * 86400000).toLocaleDateString("vi-VN")}
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
                  <button
                    className={
                      user.status === "active" ? "btn-lock" : "btn-unlock"
                    }
                    onClick={() => toggleStatus(user.id)}
                  >
                    {user.status === "active" ? "🔒 Khóa" : "🔓 Mở"}
                  </button>
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