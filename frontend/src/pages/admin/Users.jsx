import React from 'react';
import { users } from '../../data/mockData';
import '../../pages/admin/Dashboard.css'; // Shared styles

const Users = () => {
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
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 10).map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.createdAt || new Date(user.id * 86400000).toLocaleDateString('vi-VN')}</td>
                <td className={`status ${user.status === 'active' ? 'active' : 'inactive'}`}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
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

