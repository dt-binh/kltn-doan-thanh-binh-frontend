# TODO - Tích hợp Backend API cho Frontend

- [ ] Tạo `frontend/src/services/api.js` từ `backend/frontend-api-service.js`.
- [ ] Cập nhật Auth:
  - [x] `frontend/src/pages/user/Login.jsx` gọi `authAPI.login` + lưu token/user + redirect.
  - [x] `frontend/src/pages/user/Register.jsx` gọi `authAPI.register` + redirect.
  - [ ] (Nếu cần) cập nhật `frontend/src/pages/user/Profile.jsx` dùng `authAPI.getMe/updateMe`.

- [ ] Cập nhật User:
  - [ ] `frontend/src/pages/user/Home.jsx` lấy books/genres từ API.
  - [x] `frontend/src/pages/user/BookList.jsx` thay mock bằng `booksAPI.getAll` + `genresAPI.getAll` + `authorsAPI.getAll`.

  - [ ] `frontend/src/pages/user/BookDetail.jsx` lấy book theo id bằng `booksAPI.getById`.
  - [ ] `frontend/src/pages/user/Cart.jsx` tích hợp tạo/refresh cart (nếu có API) hoặc giữ local cart nhưng đồng bộ book data từ API.
  - [ ] `frontend/src/pages/user/Checkout.jsx` tạo order bằng `ordersAPI.create` + điều hướng sau khi đặt.
- [ ] Cập nhật Admin:
  - [ ] `frontend/src/pages/admin/Dashboard.jsx` gọi `statsAPI.get`.
  - [ ] `frontend/src/pages/admin/Users.jsx` gọi `usersAPI.getAll` + toggle status/delete.
  - [ ] `frontend/src/pages/admin/Orders.jsx` gọi `ordersAPI.getAll` + update status/delete.
  - [ ] `frontend/src/pages/admin/Books.jsx` gọi `booksAPI.getAll` + CRUD.
  - [ ] `frontend/src/pages/admin/Genres.jsx` gọi `genresAPI.getAll` + CRUD.
  - [ ] `frontend/src/pages/admin/Authors.jsx` gọi `authorsAPI.getAll` + CRUD.
- [ ] Đồng bộ token cho tất cả request (đã có trong api.js).
- [ ] Chạy thử:
  - [ ] Backend seed + chạy server.
  - [ ] Frontend chạy + test luồng user + admin.

