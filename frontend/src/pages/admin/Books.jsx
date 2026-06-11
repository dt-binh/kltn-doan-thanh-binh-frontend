import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Books.css";

// Component hiển thị ảnh chống nhấp nháy
const BookImage = ({ src, alt }) => {
  const [error, setError] = useState(false);

  const imageUrl =
    error || !src
      ? "https://placehold.co/45x65?text=No+Img"
      : src;

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="book-thumbnail"
      onError={() => setError(true)}
    />
  );
};

const Books = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);

  // MODAL STATES
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'import'
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    author_id: "",
    genre_id: "",
    price: 0,
    stock: 0,
    image: "",
    description: "",
  });
  const [importAmount, setImportAmount] = useState(0);

  const token = localStorage.getItem("token");

  // ================= PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = books.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(books.length / itemsPerPage);

  const fetchData = async () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    try {
      const [bRes, gRes, aRes] = await Promise.all([
        axios.get("http://localhost:5000/api/books"),
        axios.get("http://localhost:5000/api/genres"),
        axios.get("http://localhost:5000/api/authors"),
      ]);

      setBooks(bRes.data);
      setGenres(gRes.data);
      setAuthors(aRes.data);
    } catch (error) {
      console.error("Lỗi fetch data:", error);

      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.status === 403)
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= MODAL ACTIONS =================

  const openModal = (type, book = null) => {
    setModalType(type);
    if (book) {
      setFormData({ ...book });
    } else {
      setFormData({
        id: null,
        title: "",
        author_id: "",
        genre_id: "",
        price: 0,
        stock: 0,
        image: "",
        description: "",
      });
    }
    setImportAmount(0);
  };

  const closeModal = () => {
    setModalType(null);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveBook = async () => {
    if (!formData.title) return alert("Nhập tiêu đề!");
    if (!formData.author_id) return alert("Chọn tác giả!");
    if (!formData.genre_id) return alert("Chọn thể loại!");

    try {
      if (modalType === "add") {
        await axios.post("http://localhost:5000/api/books", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (modalType === "edit") {
        await axios.put(`http://localhost:5000/api/books/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Lỗi lưu sách", error);
      alert("Lưu thất bại");
    }
  };

  const handleSaveImport = async () => {
    if (importAmount <= 0) return alert("Số lượng nhập phải lớn hơn 0");

    const updatedStock = Number(formData.stock) + Number(importAmount);
    const payload = { ...formData, stock: updatedStock };

    try {
      await axios.put(`http://localhost:5000/api/books/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Lỗi nhập hàng", error);
      alert("Nhập hàng thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa truyện này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
      } catch (error) {
        console.error("Lỗi xóa sách", error);
      }
    }
  };

  // ================= UPLOAD IMAGE =================

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const imageUrl = res.data.imageUrl;

      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error("Lỗi tải ảnh lên:", error);
      alert("Tải ảnh thất bại!");
    }
  };

  return (
    <div className="books-page">
      {/* HEADER */}
      <div className="books-header">
        <h2>Quản lý truyện ({books.length})</h2>

        <button
          className="btn-add"
          onClick={() => openModal('add')}
        >
          ➕ Thêm truyện
        </button>
      </div>

      {/* TABLE */}
      <div className="books-table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Tác giả</th>
              <th>Thể loại</th>
              <th>Giá</th>
              <th className="col-stock">Số lượng</th>
              <th>Hình ảnh</th>
              <th className="col-action">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {currentBooks.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.author_name}</td>
                <td>{book.genre_name}</td>
                <td>{`${book.price.toLocaleString()} ₫`}</td>
                <td>{book.stock || 0}</td>
                <td><BookImage src={book.image} alt={book.title} /></td>
                <td className="action-cell">
                  <div className="action-wrapper">
                    <button className="btn-edit" onClick={() => openModal('edit', book)} title="Sửa">✏️</button>
                    <button className="btn-import" onClick={() => openModal('import', book)} title="Nhập hàng">📦</button>
                    <button className="btn-delete" onClick={() => handleDelete(book.id)} title="Xóa">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="pagination-btn"
          >
            &laquo; Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`pagination-btn ${
                currentPage === page ? "active-page" : ""
              }`}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="pagination-btn"
          >
          Sau &raquo;
        </button>
      </div>

      {/* MODALS */}
      {modalType && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalType === 'import' ? (
              <>
                <div className="modal-header">
                  <h3>Nhập hàng: {formData.title}</h3>
                </div>
                <div className="form-group">
                  <label>Tồn kho hiện tại</label>
                  <input type="number" value={formData.stock} disabled />
                </div>
                <div className="form-group">
                  <label>Số lượng nhập thêm</label>
                  <input
                    type="number"
                    value={importAmount}
                    onChange={(e) => setImportAmount(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn-save" onClick={handleSaveImport}>Xác nhận</button>
                  <button className="btn-cancel" onClick={closeModal}>Hủy</button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <h3>{modalType === 'add' ? "Thêm truyện mới" : "Sửa thông tin truyện"}</h3>
                </div>
                <div className="form-group">
                  <label>Tiêu đề</label>
                  <input name="title" value={formData.title} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Tác giả</label>
                  <select name="author_id" value={formData.author_id} onChange={handleFormChange}>
                    <option value="">Chọn tác giả</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Thể loại</label>
                  <select name="genre_id" value={formData.genre_id} onChange={handleFormChange}>
                    <option value="">Chọn thể loại</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá</label>
                  <input type="number" name="price" value={formData.price} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Số lượng {modalType === 'edit' && "(Không thể sửa trực tiếp)"}</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormChange}
                    disabled={modalType === 'edit'}
                  />
                </div>
                <div className="form-group">
                  <label>Hình ảnh</label>
                  <div className="image-upload-box" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleFormChange}
                      placeholder="URL ảnh"
                      style={{ flex: 1, maxWidth: 'none' }}
                    />
                    <label className="file-upload-label" style={{ marginBottom: 0 }}>
                      📁 Chọn ảnh
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleFormChange}
                    rows="3"
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button className="btn-save" onClick={handleSaveBook}>💾 Lưu</button>
                  <button className="btn-cancel" onClick={closeModal}>❌ Hủy</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;