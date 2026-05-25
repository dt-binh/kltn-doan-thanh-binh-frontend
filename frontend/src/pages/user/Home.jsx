import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import BookCard from "../../components/common/BookCard";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, genresRes] = await Promise.all([
          axios.get("http://localhost:5000/api/books"),
          axios.get("http://localhost:5000/api/genres"),
        ]);
        setBooks(booksRes.data);
        setGenres(genresRes.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  const featuredBooks = books.slice(0, 8);

  return (
    <div className="home-page">
      <Header />

      <main className="home-main">
        <div className="home-banner">
          <div className="home-banner-content">
            <h1>Chào mừng đến với BOOKS SHOP</h1>
            <p>Khám phá những bộ truyện tranh tuyệt vời nhất!</p>
            <Link to="/books" className="home-btn-primary">
              Mua ngay
            </Link>
          </div>
        </div>

        <section className="home-categories">
          <div className="home-container">
            <div className="home-section-header">
              <h2>Thể loại phổ biến</h2>
              <Link to="/books" className="home-view-all">
                Xem tất cả →
              </Link>
            </div>

            <div className="home-genre-grid">
              {genres.slice(0, 8).map((genre) => (
                <Link key={genre.id} to={`/books?genre=${encodeURIComponent(genre.name)}`} className="home-genre-card">
                  <div className="home-genre-icon">📚</div>
                  <p>{genre.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-featured">
          <div className="home-container">
            <div className="home-section-header">
              <h2>Truyện nổi bật</h2>
              <Link to="/books" className="home-view-all">
                Xem thêm →
              </Link>
            </div>

            <div className="home-books-grid">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;