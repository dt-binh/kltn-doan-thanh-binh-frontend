import React, { useState, useEffect } from 'react';

const CartItem = ({ item, updateQuantity, removeItem }) => {
  const [qty, setQty] = useState(item.quantity);

  // Đồng bộ state cục bộ khi item.quantity thay đổi từ Parent (sau khi fetchCart)
  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  // Xử lý khi người dùng rời chuột khỏi ô nhập
  const handleBlur = () => {
    let finalQty = parseInt(qty, 10);
    
    if (isNaN(finalQty) || finalQty < 1) {
      finalQty = 1;
    }

    setQty(finalQty);
    if (finalQty !== item.quantity) {
      updateQuantity(item.id, finalQty);
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.book.image || null} alt={item.book.title} />
      </div>
      <div className="cart-item-info">
        <h3>{item.book.title}</h3>
        <p>{item.book.author}</p>
      </div>
      <div className="cart-item-price">
        {item.book.price.toLocaleString()} ₫
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
        <div className="cart-item-qty">
          <button onClick={() => {
            const newQty = parseInt(qty, 10) - 1;
            if (newQty >= 1) {
              setQty(newQty);
              updateQuantity(item.id, newQty);
            }
          }}>-</button>
          <input
            type="number"
            min="1"
            max={item.book.stock}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onBlur={handleBlur}
            className="cart-qty-input"
          />
          <button onClick={() => {
            const newQty = parseInt(qty, 10) + 1;
            setQty(newQty);
            updateQuantity(item.id, newQty);
          }}>+</button>
        </div>
        {item.quantity > item.book.stock && (
          <span style={{ color: '#ff4d6d', fontSize: '11px', fontWeight: 'bold' }}>
            Kho: {item.book.stock}
          </span>
        )}
      </div>
      <div className="cart-item-total">
        {(item.book.price * item.quantity).toLocaleString()} ₫
      </div>
      <button className="remove-btn" onClick={() => removeItem(item.id)}>
        ×
      </button>
    </div>
  );
};

export default CartItem;
