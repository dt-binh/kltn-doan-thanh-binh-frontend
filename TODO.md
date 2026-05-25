# TODO

## Mục tiêu: Sửa `database.sql` cho khớp với các trang bạn đang làm (frontend dùng mockData)

1. Xác định frontend đang dùng dữ liệu gì (đã đọc mockData.js): books/genres/authors/orders/users.
2. Đối chiếu database hiện tại: chỉ có `users, stories, categories, chapters...` (không có tables cho books/genres/authors/orders).
3. Chốt hướng sửa database:
   - (A) Tạo thêm tables tương ứng với `mockData` để admin/user có thể dùng.
   - (B) Hoặc sửa lại frontend để dùng `stories/categories/chapters`.
4. (Đã chốt tạm) Thực hiện hướng (A):
   - Thêm tables `books`, `authors`, `book_authors?` (hoặc gộp vào `books.author`), `genres`, `orders`.
5. Đồng bộ constraint/kiểu dữ liệu để khỏi lỗi khi insert/select.
6. Update `database.sql` kèm seed dữ liệu mẫu từ `mockData.js` (ít nhất 7 books + danh sách genre/authors + users mẫu).
7. (Nếu cần) Cập nhật backend để có endpoint trả về đúng cấu trúc tables mới.

- [x] Đã sửa `backend/database.sql` để thêm tables `genres/authors/books/orders` phù hợp với mockData/front-end admin/user.
- [x] Đã cập nhật `server.js` thêm các API thay thế MockData.
- [x] Chuyển đổi các Component Frontend (Admin/User): Xóa `mockData`, thay bằng `axios` và `useEffect` để fetch dữ liệu thực.
