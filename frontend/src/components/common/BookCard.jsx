import React from 'react';
import { Link } from 'react-router-dom';
// Star icon unicode
import "./BookCard.css"

const BookCard = ({ book }) => {
  return (
    <Link to={`/book/${book.id}`} className="book-card">
      <div className="book-image">
        <img src={book.image} alt={book.title} />
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="book-rating">
          <span className="stars">{'★'.repeat(Math.floor(book.rating))}{'☆'.repeat(5-Math.floor(book.rating))}</span>
          <span className="rating-num">({book.rating})</span>
        </div>
        <div className="book-price">
          {book.price.toLocaleString()} ₫
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
