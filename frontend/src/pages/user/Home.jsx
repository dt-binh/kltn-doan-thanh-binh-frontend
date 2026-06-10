// Import React và các Hook cần dùng
import React, { useEffect, useState } from "react";

// Thư viện gọi API
import axios from "axios";

// Các component dùng chung
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import BookCard from "../../components/common/BookCard";

// Điều hướng giữa các trang
import { Link } from "react-router-dom";

// CSS của trang Home
import "./Home.css";

const Home = () => {

  // Lưu danh sách sách
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, genresRes] = await Promise.all([
          axios.get("http://localhost:5000/api/books"),
          axios.get("http://localhost:5000/api/genres"),
        ]);

        // Lưu dữ liệu sách vào state
        setBooks(booksRes.data);

        // Lưu dữ liệu thể loại vào state
        setGenres(genresRes.data);

      } catch (error) {

        // Hiển thị lỗi nếu gọi API thất bại
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchData();

  }, []);

  // Mỗi trang hiển thị 8 cuốn sách
  const itemsPerPage = 8;

  // Tổng số trang
  const totalPages = Math.ceil(
    books.length / itemsPerPage
  );
  const indexOfLastItem =
    currentPage * itemsPerPage;
  const indexOfFirstItem =
    indexOfLastItem - itemsPerPage;
  const currentBooks = books.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="home-page">

      {/* Header */}

      <Header />
      <main className="home-main">
        <div className="home-banner">
          <div className="home-banner-content">
            <h1>BOOKS SHOP</h1>
            <p>
              Khám phá những bộ truyện tranh tuyệt vời nhất!
            </p>
            {/* Nút chuyển sang trang danh sách sách */}
            <Link
              to="/books"
              className="home-btn-primary"
            >
              Mua ngay
            </Link>
          </div>
        </div>
        <section className="home-categories">
          <div className="home-container">
            <div className="home-section-header">
              <h2>Thể loại phổ biến</h2>
              <Link
                to="/books"
                className="home-view-all"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="home-genre-grid">
              {/* Chỉ lấy 8 thể loại đầu tiên */}
              {genres.slice(0, 8).map((genre) => (

                <Link
                  key={genre.id}
                  to={`/books?genre=${encodeURIComponent(
                    genre.name
                  )}`}

                  className="home-genre-card"
                >
                  <div className="home-genre-icon">
                    📚
                  </div>
                  <p>{genre.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="home-featured">
          <div className="home-container">

            {/* Tiêu đề khu vực */}
            <div className="home-section-header">
              <h2>Truyện nổi bật</h2>
              <Link
                to="/books"
                className="home-view-all"
              >
                Xem thêm →
              </Link>
            </div>
            {/* Danh sách sách */}
            <div className="home-books-grid">
              {currentBooks.map((book) => (
                // Hiển thị từng cuốn sách
                <BookCard
                  key={book.id}
                  book={book}
                />

              ))}

            </div>

            {/* =====================================================
                PHÂN TRANG
            ===================================================== */}
            {totalPages > 1 && (

              <div className="home-pagination">

                {/* Nút trang trước */}
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(currentPage - 1)
                  }
                  className="home-pagination-btn"
                >
                  &laquo; Trước
                </button>
                {/* Danh sách số trang */}
                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((page) => (

                  <button
                    key={page}
                    onClick={() =>
                      setCurrentPage(page)
                    }

                    className={`home-pagination-btn ${
                      currentPage === page
                        ? "home-pagination-active"
                        : ""
                    }`}
                  >
                    {page}
                  </button>

                ))}
                <button
                  disabled={
                    currentPage === totalPages
                  }

                  onClick={() =>
                    setCurrentPage(currentPage + 1)
                  }

                  className="home-pagination-btn"
                >
                  Sau &raquo;
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      {/* Footer cuối trang */}
      <Footer />

    </div>
  );
};

export default Home;