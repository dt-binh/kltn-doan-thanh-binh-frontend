import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import "./BookDetail.css";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", image: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    // Cuộn lên đầu trang (Fix lỗi "màn hình trắng" do vị trí cuộn bị giữ lại từ trang trước)
    window.scrollTo(0, 0);

    const fetchBookAndReviews = async () => {
      try {
        const [bookRes, reviewsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/books/${id}`),
          axios.get(`http://localhost:5000/api/books/${id}/reviews`)
        ]);
        setBook(bookRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookAndReviews();
  }, [id]);

  // Tự động cuộn xuống phần đánh giá nếu URL có hash #reviews (từ nút Đánh giá ngay)
  useEffect(() => {
    if (!loading && location.hash === "#reviews") {
      const element = document.getElementById("reviews");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [loading, location.hash]);

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/cart",
        { book_id: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.error("Lỗi thêm giỏ hàng:", error);
        alert("Có lỗi xảy ra khi thêm vào giỏ hàng");
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    setUploadingImage(true);
    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` 
        }
      });
      setNewReview({ ...newReview, image: res.data.imageUrl });
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
      alert("Không thể tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để đánh giá");
      return;
    }
    
    setSubmittingReview(true);
    try {
      await axios.post(`http://localhost:5000/api/books/${id}/reviews`, newReview, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Đánh giá thành công!");
      setNewReview({ rating: 5, comment: "", image: "" });
      
      // Tải lại sách và đánh giá để cập nhật UI
      const [bookRes, reviewsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/books/${id}`),
        axios.get(`http://localhost:5000/api/books/${id}/reviews`)
      ]);
      setBook(bookRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Lỗi khi gửi đánh giá");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!book) return <div className="loading">Không tìm thấy sách.</div>;

  // Đảm bảo rating là số hợp lệ từ 0 - 5 để tránh lỗi RangeError của hàm repeat() gây trắng trang
  const ratingValue = Math.max(0, Math.min(5, book.rating ? Math.floor(Number(book.rating)) : 0));

  // Tính toán thống kê đánh giá
  const totalReviews = reviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let averageRating = 0;

  if (totalReviews > 0) {
    let totalScore = 0;
    reviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Number(r.rating) || 5));
      ratingCounts[star]++;
      totalScore += star;
    });
    averageRating = (totalScore / totalReviews).toFixed(1);
  }

  return (
    <>
      <Header />

      <main className="book-detail">
        <div className="detail-container">
          <p className="breadcrumb">
            <Link to="/">Trang chủ</Link> <span>›</span>{" "}
            <Link to="/books">Danh sách truyện</Link> <span>›</span>{" "}
            <strong>{book.title}</strong>
          </p>

          <div className="detail-content">
            <div className="detail-image">
              <img
                src={book.image}
                alt={book.title}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x400.png?text=No+Image";
                }}
              />
            </div>

            <div className="detail-info">
              <h1>{book.title}</h1>
              <p className="author">Tác giả: {book.author_name}</p>

              <div className="meta">
                <span className="genre">{book.genre_name}</span>
                <div className="rating">
                  {"★".repeat(ratingValue)}
            {"☆".repeat(Math.max(0, 5 - ratingValue))}
                  <span>({book.rating ? parseFloat(book.rating).toFixed(1) : "0"})</span>
                </div>
              </div>

              <div className="price-section">
          <div className="price">{(book.price || 0).toLocaleString()} ₫</div>

                <div className="quantity">
                  <label>Số lượng:</label>
                  <div className="qty-controls">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                </div>

                <button
                  onClick={addToCart}
                  className={`add-cart-btn ${added ? "added" : ""}`}
                >
                  {added ? "✅ Đã thêm" : "Thêm vào giỏ hàng"}
                </button>
              </div>
            </div>
          </div>

          <div className="description">
            <h2>Mô tả</h2>
            <p>{book.description}</p>
          </div>

          <div className="reviews" id="reviews">
            <h2>Đánh giá & Nhận xét</h2>

            {/* Thống kê đánh giá */}
            <div className="review-stats" style={{ display: "flex", flexWrap: "wrap", gap: "30px", marginBottom: "30px", padding: "20px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
              <div className="average-score" style={{ textAlign: "center", minWidth: "150px" }}>
                <div style={{ fontSize: "48px", fontWeight: "bold", color: "#f59e0b", lineHeight: "1" }}>{averageRating || "0"}</div>
                <div className="stars" style={{ color: "#f59e0b", fontSize: "20px", margin: "10px 0", letterSpacing: "2px" }}>
                  {"★".repeat(Math.round(averageRating || 0))}
                  {"☆".repeat(5 - Math.round(averageRating || 0))}
                </div>
                <div style={{ color: "#6b7280", fontSize: "14px" }}>{totalReviews} đánh giá</div>
              </div>
              
              <div className="rating-bars" style={{ flex: 1, minWidth: "250px" }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = ratingCounts[star];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <span style={{ minWidth: "45px", fontSize: "14px", color: "#4b5563", fontWeight: "500" }}>{star} Sao</span>
                      <div style={{ flex: 1, height: "10px", background: "#f3f4f6", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ width: `${percentage}%`, height: "100%", background: "#f59e0b", borderRadius: "5px", transition: "width 0.3s ease" }}></div>
                      </div>
                      <span style={{ minWidth: "40px", fontSize: "14px", color: "#6b7280", textAlign: "right" }}>{percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form đánh giá */}
            <div className="review-form" style={{ marginBottom: "30px", background: "#f9fafb", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <h3 style={{ marginTop: 0 }}>Viết đánh giá của bạn</h3>
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Đánh giá (Sao):</label>
                  <select 
                    value={newReview.rating} 
                    onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", width: "100%", maxWidth: "200px", outline: "none" }}
                  >
                    <option value={5}>5 Sao - Tuyệt vời</option>
                    <option value={4}>4 Sao - Rất tốt</option>
                    <option value={3}>3 Sao - Bình thường</option>
                    <option value={2}>2 Sao - Tạm được</option>
                    <option value={1}>1 Sao - Tệ</option>
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Bình luận:</label>
                  <textarea 
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    rows="3"
                    placeholder="Hãy chia sẻ cảm nhận của bạn về cuốn sách này..."
                    style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #d1d5db", fontFamily: "inherit", outline: "none", resize: "vertical" }}
                    required
                  ></textarea>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Đính kèm hình ảnh (Tùy chọn):</label>
                  <div style={{ display: "flex", gap: "15px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ position: "relative" }}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} id="review-image-upload" style={{ display: "none" }} />
                      <label htmlFor="review-image-upload" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "80px", height: "80px", border: "2px dashed #d1d5db", borderRadius: "8px", cursor: "pointer", color: "#6b7280", background: "#fff", transition: "all 0.2s" }}>
                        <span style={{ fontSize: "24px" }}>+</span>
                      </label>
                    </div>
                    
                    {uploadingImage && <div style={{ display: "flex", alignItems: "center", height: "80px", color: "#3b82f6", fontSize: "14px" }}>Đang tải ảnh lên...</div>}
                    
                    {newReview.image && (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img src={newReview.image} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #d1d5db" }} />
                        <button type="button" onClick={() => setNewReview({...newReview, image: ""})} style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontSize: "14px", lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>×</button>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={submittingReview} style={{ padding: "12px 24px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: submittingReview ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "15px", transition: "background 0.2s" }}>
                  {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </form>
            </div>

            <div className="review-list">
              {reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", background: "#f9fafb", borderRadius: "12px", border: "1px dashed #d1d5db" }}>
                  <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>📝</span>
                  <p style={{ color: "#6b7280", margin: 0 }}>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá truyện này!</p>
                </div>
              ) : (
        reviews.map(review => {
          // Xử lý an toàn cho review rating (bảo vệ trường hợp rating nằm ngoài khoảng mong muốn)
          const rValue = Math.max(0, Math.min(5, Number(review.rating) || 5));
          return (
                    <div key={review.id} className="review-item" style={{ marginBottom: "25px", paddingBottom: "25px", borderBottom: "1px solid #e5e7eb" }}>
                      <div className="review-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "40px", height: "40px", background: "#e5e7eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#6b7280", fontSize: "16px" }}>
                            {review.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="reviewer" style={{ fontWeight: "bold", display: "block", color: "#1f2937" }}>{review.username}</span>
                            <span className="stars" style={{ color: "#f59e0b", letterSpacing: "1px", fontSize: "14px" }}>
                              {"★".repeat(rValue)}
                              {"☆".repeat(5 - rValue)}
                            </span>
                          </div>
                </div>
                        <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                          {new Date(review.created_at).toLocaleDateString("vi-VN")}
                        </span>
              </div>
                      <p style={{ margin: "0 0 15px 0", color: "#4b5563", lineHeight: "1.6" }}>{review.comment}</p>
                      
                      {review.image && (
                        <div style={{ marginTop: "10px" }}>
                          <a href={review.image} target="_blank" rel="noopener noreferrer">
                            <img src={review.image} alt="Ảnh đánh giá" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "zoom-in" }} />
                          </a>
                        </div>
                      )}
            </div>
          );
        })
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BookDetail;