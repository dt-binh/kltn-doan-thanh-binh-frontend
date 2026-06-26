import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Authors.css";
import { ToastContainer, useToast } from "../../components/common/Toast";

const Authors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const { toasts, showToast, removeToast } = useToast();

  // MODAL STATES
  const [modalType, setModalType] = useState(null); // 'add' | 'edit'
  const [formData, setFormData] = useState({ id: null, name: "", country: "" });

  const token = localStorage.getItem("token");

  const fetchAuthors = async () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!token || !user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/authors");
      setAuthors(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách tác giả:", error);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // ================= MODAL ACTIONS =================
  const openModal = (type, author = null) => {
    setModalType(type);
    if (author) {
      setFormData({ ...author });
    } else {
      setFormData({ id: null, name: "", country: "" });
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

  const handleSaveAuthor = async () => {
    if (!formData.name) return showToast("Nhập tên tác giả!", "warning");
    if (!formData.country) return showToast("Nhập quốc gia!", "warning");

    try {
      if (modalType === "add") {
        await axios.post("http://localhost:5000/api/authors", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Thêm tác giả thành công!", "success");
      } else if (modalType === "edit") {
        await axios.put(`http://localhost:5000/api/authors/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Cập nhật tác giả thành công!", "success");
      }
      closeModal();
      fetchAuthors();
    } catch (error) {
      console.error("Lỗi lưu tác giả", error);
      showToast(error.response?.data?.message || "Lưu thất bại!", "error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Xóa tác giả này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/authors/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Xóa tác giả thành công!", "success");
        fetchAuthors();
      } catch (error) {
        console.error("Lỗi xóa", error);
        showToast(error.response?.data?.message || "Xóa thất bại!", "error");
      }
    }
  };

  return (
    <div className="authors-page">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* HEADER */}
      <div className="authors-header">
        <h2>Quản lý tác giả ({authors.length})</h2>

        <button
          className="authors-btn-add"
          onClick={() => openModal('add')}
        >
          ➕ Thêm tác giả
        </button>
      </div>

      {/* TABLE */}
      <div className="authors-table-container">
        <table className="authors-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên tác giả</th>
              <th>Quốc gia</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {/* DATA */}
            {authors.map((author) => (
              <tr key={author.id}>
                <td>{author.id}</td>
                <td>{author.name}</td>
                <td>{author.country}</td>
                <td className="action-cell">
                  <div className="action-wrapper">
                      <button
                        className="btn-edit"
                        onClick={() => openModal('edit', author)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(author.id)}
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
              <h3>{modalType === 'add' ? "Thêm tác giả mới" : "Sửa thông tin tác giả"}</h3>
            </div>
            <div className="form-group">
              <label>Tên tác giả</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleFormChange} 
                placeholder="Nhập tên tác giả"
              />
            </div>
            <div className="form-group">
              <label>Quốc gia</label>
              <input 
                name="country" 
                value={formData.country} 
                onChange={handleFormChange} 
                placeholder="Nhập quốc gia"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveAuthor}>💾 Lưu</button>
              <button className="btn-cancel" onClick={closeModal}>❌ Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authors;