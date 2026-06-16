import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Genres.css";

const Genres = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);

  // MODAL STATES
  const [modalType, setModalType] = useState(null); // 'add' | 'edit'
  const [formData, setFormData] = useState({ id: null, name: "" });

  const token = localStorage.getItem("token");

  const fetchGenres = async () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!token || !user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/genres");
      setGenres(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách thể loại:", error);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // ================= MODAL ACTIONS =================
  const openModal = (type, genre = null) => {
    setModalType(type);
    if (genre) {
      setFormData({ ...genre });
    } else {
      setFormData({ id: null, name: "" });
    }
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

  const handleSaveGenre = async () => {
    if (!formData.name) return alert("Nhập tên thể loại!");

    try {
      if (modalType === "add") {
        await axios.post("http://localhost:5000/api/genres", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (modalType === "edit") {
        await axios.put(`http://localhost:5000/api/genres/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      closeModal();
      fetchGenres();
    } catch (error) {
      console.error("Lỗi lưu thể loại", error);
      alert("Lưu thất bại");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Xóa thể loại này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/genres/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchGenres();
      } catch (error) {
        console.error("Lỗi xóa", error);
        alert("Xóa thất bại");
      }
    }
  };

  return (
    <div className="genres-page">
      {/* HEADER */}
      <div className="genres-header">
        <h2>Quản lý thể loại ({genres.length})</h2>

        <button
          className="genres-btn-add"
          onClick={() => openModal('add')}
        >
          ➕ Thêm thể loại
        </button>
      </div>

      {/* TABLE */}
      <div className="genres-table-container">
        <table className="genres-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên thể loại</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {/* DATA */}
            {genres.map((genre) => (
              <tr key={genre.id}>
                <td>{genre.id}</td>
                <td>{genre.name}</td>
                <td className="action-cell">
                  <div className="action-wrapper">
                      <button
                        className="btn-edit"
                        onClick={() => openModal('edit', genre)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(genre.id)}
                      >
                        🗑 Xóa
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {modalType && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalType === 'add' ? "Thêm thể loại mới" : "Sửa thông tin thể loại"}</h3>
            </div>
            <div className="form-group">
              <label>Tên thể loại</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleFormChange} 
                placeholder="Nhập tên thể loại"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveGenre}>💾 Lưu</button>
              <button className="btn-cancel" onClick={closeModal}>❌ Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Genres;