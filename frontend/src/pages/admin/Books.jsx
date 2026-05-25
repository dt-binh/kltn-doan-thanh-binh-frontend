import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Books.css";

// Component hiển thị ảnh chống nhấp nháy
const BookImage = ({ src, alt }) => {
  const [error, setError] = useState(false);
  const imageUrl = error || !src ? "https://placehold.co/45x65?text=No+Img" : src;

  return (
    <img
      src={imageUrl}
      alt={alt}
      style={{
        width: "45px",
        height: "65px",
        objectFit: "cover",
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
      }}
      onError={() => setError(true)}
    />
  );
};

const Books = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ADD
  const [isAdding, setIsAdding] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author_id: "",
    genre_id: "",
    price: 0,
    image: "",
    description: "",
    views: 0
  });

  const token = localStorage.getItem("token");

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
        axios.get("http://localhost:5000/api/authors")
      ]);
      setBooks(bRes.data);
      setGenres(gRes.data);
      setAuthors(aRes.data);
    } catch (error) {
      console.error("Lỗi fetch data:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= EDIT =================
  const handleEdit = (book) => {
    setEditingId(book.id);
    setEditData({
      title: book.title,
      author_id: book.author_id,
      genre_id: book.genre_id,
      price: book.price,
      image: book.image,
      description: book.description,
      views: book.views || 0
    });
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/books/${editingId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error("Lỗi cập nhật sách", error);
      alert("Cập nhật thất bại");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Xóa truyện này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        console.error("Lỗi xóa sách", error);
      }
    }
  };

  // ================= ADD =================
  const handleAddChange = (e) => {
    setNewBook({
      ...newBook,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = async () => {
    if (!newBook.title) return alert("Nhập tiêu đề!");
    if (!newBook.author_id) return alert("Chọn tác giả!");
    if (!newBook.genre_id) return alert("Chọn thể loại!");

    try {
      await axios.post("http://localhost:5000/api/books", newBook, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdding(false);
      setNewBook({
        title: "",
        author_id: "",
        genre_id: "",
        price: 0,
        image: "",
        description: "",
        views: 0
      });
      fetchData();
    } catch (error) {
      console.error("Lỗi thêm sách", error);
      alert("Thêm thất bại");
    }
  };

  // ================= UPLOAD IMAGE =================
  const handleImageUpload = async (e, isEditing) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const imageUrl = res.data.imageUrl;
      if (isEditing) {
        setEditData({ ...editData, image: imageUrl });
      } else {
        setNewBook({ ...newBook, image: imageUrl });
      }
    } catch (error) {
      console.error("Lỗi tải ảnh lên:", error);
      alert("Tải ảnh thất bại!");
    }
  };

  return (
    <div className="books-page">
      {/* HEADER */}
      <div className="books-header">
        <h2>Quản lý truyện</h2>

        <button
          className="btn-add"
          onClick={() => setIsAdding(!isAdding)}
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
              <th>Hình ảnh</th>
              <th>Lượt xem</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {/* ADD ROW */}
            {isAdding && (
              <tr className="add-row">
                <td>--</td>

                <td>
                  <input
                    name="title"
                    placeholder="Nhập tiêu đề"
                    value={newBook.title}
                    onChange={handleAddChange}
                  />
                </td>

                <td>
                  <select name="author_id" value={newBook.author_id} onChange={handleAddChange}>
                    <option value="">Chọn tác giả</option>
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </td>

                <td>
                  <select name="genre_id" value={newBook.genre_id} onChange={handleAddChange}>
                    <option value="">Chọn thể loại</option>
                    {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </td>

                <td>
                  <input
                    type="number"
                    name="price"
                    value={newBook.price}
                    onChange={handleAddChange}
                    placeholder="Giá"
                  />
                </td>

                <td>
                  <input
                    type="text"
                    name="image"
                    value={newBook.image}
                    onChange={handleAddChange}
                    placeholder="URL ảnh (vd: https://...)"
                    style={{ marginBottom: "6px" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    style={{ fontSize: "12px", width: "100%" }}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    name="views"
                    value={newBook.views}
                    onChange={handleAddChange}
                  />
                </td>

                <td className="action-cell">
                  <button className="btn-save" onClick={handleAdd}>
                    💾 Lưu
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setIsAdding(false)}
                  >
                    ❌ Hủy
                  </button>
                </td>
              </tr>
            )}

            {/* DATA ROWS */}
            {books.slice(0, 10).map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>

                <td>
                  {editingId === book.id ? (
                    <input
                      name="title"
                      value={editData.title}
                      onChange={handleEditChange}
                    />
                  ) : (
                    book.title
                  )}
                </td>

                <td>
                  {editingId === book.id ? (
                    <select name="author_id" value={editData.author_id} onChange={handleEditChange}>
                      <option value="">Chọn tác giả</option>
                      {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  ) : (
                    book.author_name
                  )}
                </td>

                <td>
                  {editingId === book.id ? (
                    <select name="genre_id" value={editData.genre_id} onChange={handleEditChange}>
                      <option value="">Chọn thể loại</option>
                      {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  ) : (
                    book.genre_name
                  )}
                </td>

                <td>
                  {editingId === book.id ? (
                    <input
                      type="number"
                      name="price"
                      value={editData.price}
                      onChange={handleEditChange}
                    />
                  ) : (
                    `${book.price.toLocaleString()} ₫`
                  )}
                </td>

                <td>
                  {editingId === book.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <input
                        type="text"
                        name="image"
                        value={editData.image}
                        onChange={handleEditChange}
                        placeholder="URL ảnh"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        style={{ fontSize: "12px", width: "100%" }}
                      />
                    </div>
                  ) : (
                    <BookImage src={book.image} alt={book.title} />
                  )}
                </td>

                <td>
                  {editingId === book.id ? (
                    <input
                      type="number"
                      name="views"
                      value={editData.views}
                      onChange={handleEditChange}
                    />
                  ) : (
                    book.views
                  )}
                </td>

                <td className="action-cell">
                  {editingId === book.id ? (
                    <>
                      <button className="btn-save" onClick={handleSave}>
                        💾 Lưu
                      </button>
                      <button className="btn-cancel" onClick={handleCancel}>
                        ❌ Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(book)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(book.id)}
                      >
                        🗑 Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Books;