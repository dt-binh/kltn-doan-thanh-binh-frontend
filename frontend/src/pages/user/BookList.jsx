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

      <main>

        {/* HERO */}
        <section className="hero-small">

          <div className="booklist-container">

            {/* LEFT */}
            <div className="hero-content">

              <h1>Danh sách truyện</h1>

              <p className="hero-desc">
                Khám phá tất cả truyện trong cửa hàng
              </p>

            </div>

            {/* FILTERS */}
            <div className="filters">

              {/* SEARCH */}
              <input
                type="text"
                placeholder="Tìm kiếm truyện, tác giả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />

              {/* GENRE */}
              <div className="dropdown">

                <div className="dropdown-btn">
                  {selectedGenre || "Tất cả thể loại"}
                </div>

                <div className="dropdown-menu">

                  <div className="dropdown-content">

                    <div
                      onClick={() => setSelectedGenre("")}
                    >
                      Tất cả thể loại
                    </div>

                    {genres.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGenre(g.name)}
                      >
                        {g.name}
                      </div>
                    ))}

                  </div>

                </div>

              </div>

              {/* AUTHOR */}
              <div className="dropdown">

                <div className="dropdown-btn">
                  {selectedAuthor || "Tất cả tác giả"}
                </div>

                <div className="dropdown-menu">

                  <div className="dropdown-content">

                    <div
                      onClick={() => setSelectedAuthor("")}
                    >
                      Tất cả tác giả
                    </div>

                    {authors.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAuthor(a.name)}
                      >
                        {a.name}
                      </div>
                    ))}

                  </div>

                </div>

              </div>

              {/* SORT */}
              <div className="dropdown">

                <div className="dropdown-btn">

                  {sortBy === ""
                    ? "Sắp xếp"
                    : sortBy === "newest"
                    ? "Mới nhất"
                    : sortBy === "bestseller"
                    ? "Bán chạy"
                    : sortBy === "price-low"
                    ? "Giá thấp → cao"
                    : "Giá cao → thấp"}

                </div>

                <div className="dropdown-menu">

                  <div className="dropdown-content">

                    <div
                      onClick={() => setSortBy("")}
                    >
                      Sắp xếp
                    </div>

                    <div
                      onClick={() => setSortBy("newest")}
                    >
                      Mới nhất
                    </div>

                    <div
                      onClick={() => setSortBy("bestseller")}
                    >
                      Bán chạy
                    </div>

                    <div
                      onClick={() => setSortBy("price-low")}
                    >
                      Giá thấp → cao
                    </div>

                    <div
                      onClick={() => setSortBy("price-high")}
                    >
                      Giá cao → thấp
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* BOOK LIST */}
        <section className="books-list">

          <div className="booklist-container">

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

        </section>

      </main>

      <Footer />
    </>
  );
};

export default BookList;