import React, { useState } from 'react';
import '../../pages/admin/Dashboard.css';

const Authors = () => {
  // 🔥 DATA
  const initialAuthors = [
    { id: 1, name: 'Nguyễn Nhật Ánh', books: 25, country: 'Việt Nam' },
    { id: 2, name: 'J.K. Rowling', books: 12, country: 'Anh' },
    { id: 3, name: 'Haruki Murakami', books: 8, country: 'Nhật' },
  ];

  const [authors, setAuthors] = useState(initialAuthors);

  // ================= EDIT =================
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (author) => {
    setEditingId(author.id);
    setEditData(author);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    setAuthors(prev =>
      prev.map(a =>
        a.id === editingId ? editData : a
      )
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // ================= DELETE =================
  const handleDelete = (id) => {
    if (window.confirm('Xóa tác giả này?')) {
      setAuthors(authors.filter(a => a.id !== id));
    }
  };

  // ================= ADD =================
  const [isAdding, setIsAdding] = useState(false);
  const [newAuthor, setNewAuthor] = useState({
    name: '',
    books: 0,
    country: ''
  });

  const handleAdd = () => {
    if (!newAuthor.name) return alert('Nhập tên tác giả!');

    const author = {
      ...newAuthor,
      id: Date.now()
    };

    setAuthors([author, ...authors]);

    setNewAuthor({
      name: '',
      books: 0,
      country: ''
    });

    setIsAdding(false);
  };

  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="header">
        <h2>Quản lý tác giả</h2>
        <button className="btn-add" onClick={() => setIsAdding(true)}>
          ➕ Thêm tác giả
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên tác giả</th>
              <th>Số truyện</th>
              <th>Quốc gia</th>
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
                    value={newAuthor.name}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, name: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={newAuthor.books}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, books: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    value={newAuthor.country}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, country: e.target.value })
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
            {authors.map(author => (
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
                      type="number"
                      name="books"
                      value={editData.books}
                      onChange={handleChange}
                    />
                  ) : (
                    author.books
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

                <td>
                  {editingId === author.id ? (
                    <>
                      <button onClick={handleSave}>💾 Lưu</button>
                      <button onClick={handleCancel}>❌ Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(author)}>✏️ Sửa</button>
                      <button onClick={() => handleDelete(author.id)}>🗑 Xóa</button>
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