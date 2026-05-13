import React, { useState } from "react";
import "./Genres.css";

const Genres = () => {
  // DATA
  const initialGenres = [
    { id: 1, name: "Hành động", books: 45 },
    { id: 2, name: "Lãng mạn", books: 32 },
    { id: 3, name: "Kinh dị", books: 18 },
    { id: 4, name: "Hài hước", books: 25 },
  ];

  const [genres, setGenres] = useState(initialGenres);

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ADD
  const [isAdding, setIsAdding] = useState(false);
  const [newGenre, setNewGenre] = useState({
    name: "",
    books: 0,
  });

  // ================= EDIT =================
  const handleEdit = (genre) => {
    setEditingId(genre.id);
    setEditData(genre);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    setGenres((prev) =>
      prev.map((g) => (g.id === editingId ? editData : g))
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // ================= DELETE =================
  const handleDelete = (id) => {
    if (window.confirm("Xóa thể loại này?")) {
      setGenres((prev) => prev.filter((g) => g.id !== id));
    }
  };

  // ================= ADD =================
  const handleAdd = () => {
    if (!newGenre.name) return alert("Nhập tên thể loại!");

    const genre = {
      ...newGenre,
      id: Date.now(),
      books: Number(newGenre.books),
    };

    setGenres((prev) => [genre, ...prev]);

    setNewGenre({
      name: "",
      books: 0,
    });

    setIsAdding(false);
  };

  return (
    <div className="genres-page">
      {/* HEADER */}
      <div className="genres-header">
        <h2>Quản lý thể loại</h2>

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
              <th>Số truyện</th>
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

                <td>
                  <input
                    type="number"
                    value={newGenre.books}
                    onChange={(e) =>
                      setNewGenre({ ...newGenre, books: e.target.value })
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

                <td>
                  {editingId === genre.id ? (
                    <input
                      type="number"
                      name="books"
                      value={editData.books}
                      onChange={handleChange}
                    />
                  ) : (
                    genre.books
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