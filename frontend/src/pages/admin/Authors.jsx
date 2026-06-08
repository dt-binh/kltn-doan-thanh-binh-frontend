import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Authors.css";

const Authors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ADD
  const [isAdding, setIsAdding] = useState(false);
  const [newAuthor, setNewAuthor] = useState({ name: "", country: "" });

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

  // ================= EDIT =================
  const handleEdit = (author) => {
    setEditingId(author.id);
    setEditData({ name: author.name, country: author.country });
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/authors/${editingId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchAuthors();
    } catch (error) {
      console.error("Lỗi cập nhật", error);
      alert("Cập nhật thất bại");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Xóa tác giả này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/authors/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAuthors();
      } catch (error) {
        console.error("Lỗi xóa", error);
        alert("Xóa thất bại");
      }
    }
  };

  // ================= ADD =================
  const handleAdd = async () => {
    if (!newAuthor.name) return alert("Nhập tên tác giả!");
    if (!newAuthor.country) return alert("Nhập quốc gia!");

    try {
      await axios.post("http://localhost:5000/api/authors", newAuthor, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewAuthor({ name: "", country: "" });
      setIsAdding(false);
      fetchAuthors();
    } catch (error) {
      console.error("Lỗi thêm", error);
      alert("Thêm thất bại");
    }
  };

  return (
    <div className="authors-page">
      {/* HEADER */}
      <div className="authors-header">
        <h2>Quản lý tác giả ({authors.length})</h2>

        <button
          className="authors-btn-add"
          onClick={() => setIsAdding(!isAdding)}
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
            {/* ADD ROW */}
            {isAdding && (
              <tr className="add-row">
                <td>--</td>

                <td>
                  <input
                    placeholder="Nhập tên tác giả"
                    value={newAuthor.name}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, name: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    placeholder="Nhập quốc gia"
                    value={newAuthor.country}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, country: e.target.value })
                    }
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

            {/* DATA */}
            {authors.map((author) => (
              <tr key={author.id}>
                <td>{author.id}</td>

                <td>
                  {editingId === author.id ? (
                    <input
                      name="name"
                      value={editData.name}
                      onChange={handleChange}
                    />
                  ) : (
                    author.name
                  )}
                </td>

                <td>
                  {editingId === author.id ? (
                    <input
                      name="country"
                      value={editData.country}
                      onChange={handleChange}
                    />
                  ) : (
                    author.country
                  )}
                </td>

                <td className="action-cell">
                  {editingId === author.id ? (
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
                        onClick={() => handleEdit(author)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(author.id)}
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

export default Authors;