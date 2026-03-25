import React from 'react';
// Styles from Cart.scss global

const CartItem = ({ item, updateQuantity, removeItem }) => {
  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.book.image} alt={item.book.title} />
      </div>
      <div className="cart-item-info">
        <h3>{item.book.title}</h3>
        <p>{item.book.author}</p>
      </div>
      <div className="cart-item-price">
        {item.book.price.toLocaleString()} ₫
      </div>
      <div className="cart-item-qty">
        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
        <span>{item.quantity}</span>
        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
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

