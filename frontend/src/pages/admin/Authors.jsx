import React, { useState } from "react";
import "./Authors.css";

const Authors = () => {
  // DATA
  const initialAuthors = [
    { id: 1, name: "Nguyễn Nhật Ánh", books: 25, country: "Việt Nam" },
    { id: 2, name: "J.K. Rowling", books: 12, country: "Anh" },
    { id: 3, name: "Haruki Murakami", books: 8, country: "Nhật" },
  ];

  const [authors, setAuthors] = useState(initialAuthors);

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ADD
  const [isAdding, setIsAdding] = useState(false);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    books: 0,
    country: "",
  });

  // ================= EDIT =================
  const handleEdit = (author) => {
    setEditingId(author.id);
    setEditData(author);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    setAuthors((prev) =>
      prev.map((a) => (a.id === editingId ? editData : a))
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // ================= DELETE =================
  const handleDelete = (id) => {
    if (window.confirm("Xóa tác giả này?")) {
      setAuthors((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // ================= ADD =================
  const handleAdd = () => {
    if (!newAuthor.name) return alert("Nhập tên tác giả!");
    if (!newAuthor.country) return alert("Nhập quốc gia!");

    const author = {
      ...newAuthor,
      id: Date.now(),
      books: Number(newAuthor.books),
    };

    setAuthors((prev) => [author, ...prev]);

    setNewAuthor({
      name: "",
      books: 0,
      country: "",
    });

    setIsAdding(false);
  };

  return (
    <div className="authors-page">
      {/* HEADER */}
      <div className="authors-header">
        <h2>Quản lý tác giả</h2>

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
              <th>Số truyện</th>
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
                    type="number"
                    value={newAuthor.books}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, books: e.target.value })
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