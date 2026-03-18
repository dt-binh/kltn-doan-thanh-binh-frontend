import React, { useState, useEffect } from 'react';
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { books, genres, authors } from '../../data/mockData.js';
import BookCard from "../../components/common/BookCard";
import "./BookList.css"

const BookList = () => {
  const [filteredBooks, setFilteredBooks] = useState(books);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    let result = [...books];

    if (search) {
      result = result.filter(book => 
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedGenre) {
      result = result.filter(book => book.genre === selectedGenre);
    }

    if (selectedAuthor) {
      result = result.filter(book => book.author === selectedAuthor);
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'bestseller':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredBooks(result);
  }, [search, selectedGenre, selectedAuthor, sortBy]);

  return (
    <>
      <Header />
      <main>
        <div className="hero-small">
          <div className="container">
            <h1>Danh sách truyện</h1>
            <p>Khám phá tất cả truyện trong cửa hàng</p>
          </div>
        </div>

        <section className="filters-section">
          <div className="container">
            <div className="filters">
              <input 
                type="text" 
                placeholder="Tìm kiếm truyện, tác giả..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                <option value="">Tất cả thể loại</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)}>
                <option value="">Tất cả tác giả</option>
                {authors.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="">Sắp xếp</option>
                <option value="newest">Mới nhất</option>
                <option value="bestseller">Bán chạy</option>
                <option value="price-low">Giá thấp → cao</option>
                <option value="price-high">Giá cao → thấp</option>
              </select>
            </div>
          </div>
        </section>

        <section className="books-list">
          <div className="container">
            <div className="books-grid">
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            {filteredBooks.length === 0 && (
              <div className="no-results">
                Không tìm thấy truyện phù hợp
              </div>
            )}
            <div className="pagination">
              {/* Mock pagination */}
              <button>Trước</button>
              <span>1 / 3</span>
              <button>Sau</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BookList;
