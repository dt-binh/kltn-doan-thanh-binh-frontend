import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Genres.css";

const Genres = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ADD
  const [isAdding, setIsAdding] = useState(false);
  const [newGenre, setNewGenre] = useState({ name: "" });

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

  // ================= EDIT =================
  const handleEdit = (genre) => {
    setEditingId(genre.id);
    setEditData({ name: genre.name });
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/genres/${editingId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchGenres();
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

  // ================= ADD =================
  const handleAdd = async () => {
    if (!newGenre.name) return alert("Nhập tên thể loại!");

    try {
      await axios.post("http://localhost:5000/api/genres", newGenre, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewGenre({ name: "" });
      setIsAdding(false);
      fetchGenres();
    } catch (error) {
      console.error("Lỗi thêm", error);
      alert("Thêm thất bại");
    }
  };

  return (
    <div className="genres-page">
      {/* HEADER */}
      <div className="genres-header">
        <h2>Quản lý thể loại ({genres.length})</h2>

        <button
          className="genres-btn-add"
          onClick={() => setIsAdding(!isAdding)}
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
            {/* ADD ROW */}
            {isAdding && (
              <tr className="add-row">
                <td>--</td>

                <td>
                  <input
                    placeholder="Nhập tên thể loại"
                    value={newGenre.name}
                    onChange={(e) =>
                      setNewGenre({ ...newGenre, name: e.target.value })
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
            {genres.map((genre) => (
              <tr key={genre.id}>
                <td>{genre.id}</td>

                <td>
                  {editingId === genre.id ? (
                    <input
                      name="name"
                      value={editData.name}
                      onChange={handleChange}
                    />
                  ) : (
                    genre.name
                  )}
                </td>

                <td className="action-cell">
                  {editingId === genre.id ? (
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
                        onClick={() => handleEdit(genre)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(genre.id)}
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

export default Genres;