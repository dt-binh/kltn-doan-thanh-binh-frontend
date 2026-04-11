import React from 'react';
import { orders } from '../../data/mockData';
import './Dashboard.css';

const Orders = () => {
  return (
    <div className="admin-page">
      <h2>Quản lý đơn hàng</h2>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map(order => (
              <tr key={order.id}>
                <td>DH{order.id.toString().padStart(4, '0')}</td>
                <td>{order.customer}</td>
                <td>{order.total.toLocaleString()} ₫</td>
                <td className={`status ${order.status === 'Đã giao' ? 'success' : order.status === 'Đã hủy' ? 'danger' : 'pending'}`}>
                  {order.status}
                </td>
                <td>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
