import React, { useState } from 'react';
import { books as initialBooks } from '../../data/mockData';
import '../../pages/admin/Dashboard.css';

const Books = () => {
  const [books, setBooks] = useState(initialBooks);

  // 🔥 EDIT
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // 🔥 ADD
  const [isAdding, setIsAdding] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    views: 0
  });

  // ================= EDIT =================
  const handleEdit = (book) => {
    setEditingId(book.id);
    setEditData(book);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    setBooks(prev =>
      prev.map(book =>
        book.id === editingId ? editData : book
      )
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // ================= DELETE =================
  const handleDelete = (id) => {
    if (window.confirm('Xóa truyện này?')) {
      setBooks(books.filter(book => book.id !== id));
    }
  };

  // ================= ADD =================
  const handleAdd = () => {
    if (!newBook.title) return alert('Nhập tiêu đề!');

    const book = {
      ...newBook,
      id: Date.now()
    };

    setBooks([book, ...books]);

    setNewBook({
      title: '',
      author: '',
      genre: '',
      views: 0
    });

    setIsAdding(false);
  };

  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="header">
        <h2>Quản lý truyện</h2>
        <button className="btn-add" onClick={() => setIsAdding(true)}>
          ➕ Thêm truyện
        </button>
      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tiêu đề</th>
            <th>Tác giả</th>
            <th>Thể loại</th>
            <th>Lượt xem</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>

          {/* 🔥 DÒNG THÊM */}
          {isAdding && (
            <tr>
              <td>--</td>

              <td>
                <input
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, title: e.target.value })
                  }
                />
              </td>

              <td>
                <input
                  value={newBook.author}
                  onChange={(e) =>
                    setNewBook({ ...newBook, author: e.target.value })
                  }
                />
              </td>

              <td>
                <input
                  value={newBook.genre}
                  onChange={(e) =>
                    setNewBook({ ...newBook, genre: e.target.value })
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={newBook.views}
                  onChange={(e) =>
                    setNewBook({ ...newBook, views: e.target.value })
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
          {books.slice(0, 10).map(book => (
            <tr key={book.id}>
              <td>{book.id}</td>

              <td>
                {editingId === book.id ? (
                  <input
                    name="title"
                    value={editData.title}
                    onChange={handleChange}
                  />
                ) : (
                  book.title
                )}
              </td>

              <td>
                {editingId === book.id ? (
                  <input
                    name="author"
                    value={editData.author}
                    onChange={handleChange}
                  />
                ) : (
                  book.author
                )}
              </td>

              <td>
                {editingId === book.id ? (
                  <input
                    name="genre"
                    value={editData.genre}
                    onChange={handleChange}
                  />
                ) : (
                  book.genre
                )}
              </td>

              <td>
                {editingId === book.id ? (
                  <input
                    type="number"
                    name="views"
                    value={editData.views}
                    onChange={handleChange}
                  />
                ) : (
                  book.views
                )}
              </td>

              <td>
                {editingId === book.id ? (
                  <>
                    <button onClick={handleSave}>💾 Lưu</button>
                    <button onClick={handleCancel}>❌ Hủy</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(book)}>✏️ Sửa</button>
                    <button onClick={() => handleDelete(book.id)}>🗑 Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
};

export default Books;