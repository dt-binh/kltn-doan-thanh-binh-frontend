import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { books } from '../../data/mockData.js';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import '../../pages/user/BookDetail.css';
const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const foundBook = books.find(b => b.id === parseInt(id));
    setBook(foundBook);
  }, [id]);

  const addToCart = () => {
    // Mock
    console.log('Added to cart:', { ...book, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!book) return <div className="loading">Đang tải...</div>;

  return (
    <>
      <Header />
      <main className="book-detail">
        <div className="container">
          <Link to="/books" className="back-btn">← Quay lại</Link>
          
          <div className="detail-content">
            <div className="detail-image">
              <img src={book.image} alt={book.title} />
            </div>
            
            <div className="detail-info">
              <h1>{book.title}</h1>
              <p className="author">{book.author}</p>
              <div className="meta">
                <span className="genre">{book.genre}</span>
                <div className="rating">
                  {'★'.repeat(Math.floor(book.rating))}{'☆'.repeat(5 - Math.floor(book.rating))}
                  <span>({book.rating})</span>
                </div>
              </div>
              
              <div className="price-section">
                <div className="price">{book.price.toLocaleString()} ₫</div>
                <div className="quantity">
                  <label>Số lượng:</label>
                  <div className="qty-controls">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                </div>
                <button onClick={addToCart} className={`add-cart-btn ${added ? 'added' : ''}`}>
                  {added ? '✅ Đã thêm' : 'Thêm vào giỏ hàng'}
                </button>
              </div>
            </div>
          </div>

          <div className="description">
            <h2>Mô tả</h2>
            <p>{book.description}</p>
          </div>

          <div className="reviews">
            <h2>Đánh giá ({Math.floor(Math.random()*50 + 10)} đánh giá)</h2>
            <div className="review-list">
              {/* Mock reviews */}
              <div className="review">
                <div className="review-header">
                  <span className="reviewer">Người dùng 1</span>
                  <span className="stars">★★★★★</span>
                </div>
                <p>Truyện rất hay, rất đáng đọc!</p>
              </div>
              <div className="review">
                <div className="review-header">
                  <span className="reviewer">Người dùng 2</span>
                  <span className="stars">★★★★☆</span>
                </div>
                <p>Bìa đẹp, nội dung hấp dẫn.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BookDetail;

