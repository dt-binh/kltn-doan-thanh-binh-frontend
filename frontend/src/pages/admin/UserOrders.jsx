import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './UserOrders.css';

const UserOrders = () => {
    const { userId } = useParams();
    const [userData, setUserData] = useState({ username: '', orders: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        const fetchUserOrders = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError('Bạn cần đăng nhập với tư cách admin.');
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`http://localhost:5000/api/admin/users/${userId}/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(res.data);
            } catch (err) {
                setError('Lỗi khi tải dữ liệu đơn hàng của người dùng.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserOrders();
    }, [userId]);

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
            console.error("Lỗi lấy chi tiết đơn hàng:", err);
            alert("Không thể tải chi tiết đơn hàng.");
            setExpandedOrder(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Đang tải...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    const totalOrders = userData.orders.length;

    return (
        <div className="user-orders-page">
            <div className="page-header">
                <Link to="/admin/users" className="back-link">← Quay lại danh sách</Link>
                <h1>Lịch sử đơn hàng của "{userData.username}"</h1>
                <p>Tổng cộng: <strong>{totalOrders}</strong> đơn hàng</p>
            </div>

            {totalOrders === 0 ? (
                <p className="no-orders-msg">Người dùng này chưa có đơn hàng nào.</p>
            ) : (
                <div className="orders-list-container">
                    {userData.orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-summary" onClick={() => handleToggleOrderDetails(order.id)}>
                                <div className="order-info-group">
                                    <span className="order-id">Mã ĐH: <strong>{order.id.toString().padStart(4, "0")}</strong></span>
                                    <span className="order-date">Ngày đặt: {new Date(order.order_date).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="order-info-group">
                                    <span className="order-total">Tổng tiền: <strong>{order.total.toLocaleString()} ₫</strong></span>
                                    <span className={`order-status status-${order.status.toLowerCase().replace(/ /g, '-')}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <button className="details-toggle-btn">
                                    {expandedOrder === order.id ? '▲ Ẩn' : '▼ Xem'} chi tiết
                                </button>
                            </div>
                            {expandedOrder === order.id && (
                                <div className="order-details">
                                    {detailsLoading ? ( <p>Đang tải chi tiết...</p> ) : (
                                        <>
                                            <h4>Chi tiết đơn hàng</h4>
                                            <div className="order-items-list">
                                                {orderDetails.map(item => (
                                                    <div key={item.book_id} className="order-item">
                                                        <img src={item.image || 'https://via.placeholder.com/60x80'} alt={item.title} className="item-image" />
                                                        <div className="item-info">
                                                            <p className="item-title">{item.title}</p>
                                                            <p className="item-qty-price">Số lượng: {item.quantity} x {item.price.toLocaleString()} ₫</p>
                                                        </div>
                                                        <p className="item-subtotal">{(item.quantity * item.price).toLocaleString()} ₫</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserOrders;