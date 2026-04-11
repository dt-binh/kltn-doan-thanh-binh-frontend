import React, { useState } from 'react';
import '../../pages/admin/Dashboard.css';

const Genres = () => {
  // 🔥 DATA
  const initialGenres = [
    { id: 1, name: 'Hành động', books: 45 },
    { id: 2, name: 'Lãng mạn', books: 32 },
    { id: 3, name: 'Kinh dị', books: 18 },
    { id: 4, name: 'Hài hước', books: 25 },
  ];

  const [genres, setGenres] = useState(initialGenres);

  // ================= EDIT =================
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (genre) => {
    setEditingId(genre.id);
    setEditData(genre);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    setGenres(prev =>
      prev.map(g =>
        g.id === editingId ? editData : g
      )
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // ================= DELETE =================
  const handleDelete = (id) => {
    if (window.confirm('Xóa thể loại này?')) {
      setGenres(genres.filter(g => g.id !== id));
    }
  };

  // ================= ADD =================
  const [isAdding, setIsAdding] = useState(false);
  const [newGenre, setNewGenre] = useState({
    name: '',
    books: 0
  });

  const handleAdd = () => {
    if (!newGenre.name) return alert('Nhập tên thể loại!');

    const genre = {
      ...newGenre,
      id: Date.now()
    };

    setGenres([genre, ...genres]);

    setNewGenre({
      name: '',
      books: 0
    });

    setIsAdding(false);
  };

  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="header">
        <h2>Quản lý thể loại</h2>
        <button className="btn-add" onClick={() => setIsAdding(true)}>
          ➕ Thêm thể loại
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên thể loại</th>
              <th>Số truyện</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>

            {/* 🔥 ROW ADD */}
            {isAdding && (
              <tr>
                <td>--</td>

                <td>
                  <input
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

                <td>
                  <button onClick={handleAdd}>💾 Lưu</button>
                  <button onClick={() => setIsAdding(false)}>❌ Hủy</button>
                </td>
              </tr>
            )}

            {/* 🔥 DATA */}
            {genres.map(genre => (
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

                <td>
                  {editingId === genre.id ? (
                    <>
                      <button onClick={handleSave}>💾 Lưu</button>
                      <button onClick={handleCancel}>❌ Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(genre)}>✏️ Sửa</button>
                      <button onClick={() => handleDelete(genre.id)}>🗑 Xóa</button>
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