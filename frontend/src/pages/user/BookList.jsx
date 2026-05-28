import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import BookCard from "../../components/common/BookCard";

import "./BookList.css";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);

  const location = useLocation();

  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, genresRes, authorsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/books"),
          axios.get("http://localhost:5000/api/genres"),
          axios.get("http://localhost:5000/api/authors"),
        ]);

        setBooks(booksRes.data);
        setGenres(genresRes.data);
        setAuthors(authorsRes.data);

      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const searchQuery = params.get("search");
    const genreQuery = params.get("genre");

    setSearch(searchQuery || "");
    setSelectedGenre(genreQuery || "");

  }, [location.search]);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (search) {
      result = result.filter(
        (book) =>
          book.title
            .toLowerCase()
            .includes(search.toLowerCase()) ||

          (book.author_name &&
            book.author_name
              .toLowerCase()
              .includes(search.toLowerCase()))
      );
    }

    if (selectedGenre) {
      result = result.filter(
        (book) => book.genre_name === selectedGenre
      );
    }

    if (selectedAuthor) {
      result = result.filter(
        (book) => book.author_name === selectedAuthor
      );
    }

    switch (sortBy) {

      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;

      case "bestseller":
        result.sort((a, b) => b.rating - a.rating);
        break;

      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      default:
        break;
    }

    return result;

  }, [
    books,
    search,
    selectedGenre,
    selectedAuthor,
    sortBy,
  ]);

  return (
    <>
      <Header />

      <main className="booklist-page-main">

        {/* BOOK LIST & FILTERS */}
        <section className="books-list">

          <div className="booklist-container">

            {/* CONTENT WRAPPER */}
            <div className="booklist-content-wrapper">

              {/* LEFT SIDEBAR - FILTERS */}
              <aside className="filters-sidebar">
                
                <div className="sidebar-header">
                  <h3>Danh sách truyện</h3>
                  <span className="results-count">({filteredBooks.length} kết quả)</span>
                </div>

                {/* SEARCH */}
                <div className="filter-group">
                  <label>Tìm kiếm</label>
                  <input
                    type="text"
                    placeholder="Tìm kiếm truyện, tác giả..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                </div>

                {/* GENRE */}
                <div className="filter-group">
                  <label>Thể loại</label>
                  <select 
                    value={selectedGenre} 
                    onChange={(e) => setSelectedGenre(e.target.value)}
                  >
                    <option value="">Tất cả thể loại</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* AUTHOR */}
                <div className="filter-group">
                  <label>Tác giả</label>
                  <select 
                    value={selectedAuthor} 
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                  >
                    <option value="">Tất cả tác giả</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* SORT */}
                <div className="filter-group">
                  <label>Sắp xếp</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="">Sắp xếp</option>
                    <option value="newest">Mới nhất</option>
                    <option value="bestseller">Bán chạy</option>
                    <option value="price-low">Giá thấp → cao</option>
                    <option value="price-high">Giá cao → thấp</option>
                  </select>
                </div>

              </aside>

              {/* RIGHT SIDE - BOOKS */}
              <div className="books-grid-container">

                <div className="books-grid">

                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                  />
                ))}

                </div>

                {filteredBooks.length === 0 && (
                  <div className="no-results">
                    Không tìm thấy truyện phù hợp
                  </div>
                )}

              </div>

            </div>
          </div>

        </section>

      </main>

      <Footer />
    </>
  );
};

export default BookList;