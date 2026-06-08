const fs = require('fs');
let data = fs.readFileSync('backend/server.js', 'utf8');

let regex = /const checkSql = "SELECT \* FROM reviews WHERE book_id \= \? AND user_id \= \?";[\s\S]*?res.status\(201\).json\(\{ message: "Thêm đánh giá thành công" \}\);\s*\}\);\s*\}\);\s*\}\);/;

let replaceStr = `const checkOrderSql = "SELECT orders.id FROM orders JOIN order_items ON orders.id = order_items.order_id WHERE orders.user_id = ? AND order_items.book_id = ? AND orders.status = 'Đã giao'";
  db.query(checkOrderSql, [user_id, id], (err, orderResults) => {
    if (err) return res.status(500).json(err);
    if (orderResults.length === 0) {
      return res.status(400).json({ message: "Bạn chỉ có thể đánh giá khi đơn hàng đè giao thành công" });
    }

    const checkSql = "SELECT * FROM reviews WHERE book_id = ? AND user_id = ?";
    db.query(checkSql, [id, user_id], (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length > 0) return res.status(400).json({ message: "Bạn đã đánh giá truyện này rồi" });

      const insertSql = "INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [id, user_id, rating, comment], (err, result) => {
        if (err) return res.status(500).json(err);
        
        const updateRatingSql = "UPDATE books SET rating = (SELECT AVG(rating) FROM reviews WHERE book_id = ?) WHERE id = ?";
        db.query(updateRatingSql, [id, id], (err) => {
          if (err) console.error("Lỗi cập nhật rating sách", err);
          res.status(201).json({ message: "Thêm đánh giá thành công" });
        });
      });
    });
  });`;

if (regex.test(data)) {
  data = data.replace(regex, replaceStr);
  fs.writeFileSync('backend/server.js', data);
  console.log('Regex Match Found and Replaced!');
} else {
  console.log('Regex Match NOT Found!');
}