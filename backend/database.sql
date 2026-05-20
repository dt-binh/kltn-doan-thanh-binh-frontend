-- =========================================================
-- RESET DATABASE
-- =========================================================
DROP DATABASE IF EXISTS truyen_db;

CREATE DATABASE truyen_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE truyen_db;

-- =========================================================
-- USERS
-- =========================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    avatar VARCHAR(255)
    DEFAULT 'default-avatar.png',

    role ENUM('user', 'admin')
    DEFAULT 'user',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- GENRES
-- =========================================================
CREATE TABLE genres (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    books INT DEFAULT 0
);

-- =========================================================
-- AUTHORS
-- =========================================================
CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,

    country VARCHAR(100),

    books INT DEFAULT 0
);

-- =========================================================
-- BOOKS
-- =========================================================
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    author_id INT NOT NULL,
    genre_id INT NOT NULL,

    price INT NOT NULL DEFAULT 0,

    rating DECIMAL(3,2)
    DEFAULT 0,

    views INT DEFAULT 0,

    image VARCHAR(255),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (author_id)
    REFERENCES authors(id),

    FOREIGN KEY (genre_id)
    REFERENCES genres(id)
);

-- =========================================================
-- CART ITEMS
-- =========================================================
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    book_id INT NOT NULL,

    quantity INT DEFAULT 1,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (book_id)
    REFERENCES books(id)
    ON DELETE CASCADE
);

-- =========================================================
-- ORDERS
-- =========================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    total INT NOT NULL DEFAULT 0,

    status VARCHAR(50) NOT NULL,

    order_date DATE NOT NULL,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================================================
-- ORDER ITEMS
-- =========================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,
    book_id INT NOT NULL,

    quantity INT DEFAULT 1,

    price INT NOT NULL,

    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

    FOREIGN KEY (book_id)
    REFERENCES books(id)
    ON DELETE CASCADE
);

-- =========================================================
-- SAMPLE GENRES
-- =========================================================
INSERT INTO genres (name, books) VALUES
('Hành động', 45),
('Lãng mạn', 32),
('Kinh dị', 18),
('Hài hước', 25),
('Fantasy', 10),
('Văn học thiếu nhi', 7),
('Sci-Fi', 6),
('Self-help', 4),
('Văn học Việt', 8);

-- =========================================================
-- SAMPLE AUTHORS
-- =========================================================
INSERT INTO authors (name, country, books) VALUES
('J.K. Rowling', 'Anh', 12),
('Tô Hoài', 'Việt Nam', 10),
('Nguyễn Nhật Ánh', 'Việt Nam', 8),
('J.R.R. Tolkien', 'Anh', 7),
('Dale Carnegie', 'Mỹ', 6),
('Vũ Trọng Phụng', 'Việt Nam', 5),
('George Orwell', 'Anh', 4);

-- =========================================================
-- SAMPLE USERS
-- Password: 123456
-- =========================================================
INSERT INTO users (
    username,
    email,
    password,
    role
)
VALUES
(
    'admin',
    'admin@gmail.com',
    '$2b$10$3euPcmQFCiblsZeEu5s7p.9Jx4Q1UQK4q0vB9xvG5LhX5gYyJw8U2',
    'admin'
),
(
    'beeuser',
    'user@gmail.com',
    '$2b$10$3euPcmQFCiblsZeEu5s7p.9Jx4Q1UQK4q0vB9xvG5LhX5gYyJw8U2',
    'user'
);

-- =========================================================
-- SAMPLE BOOKS
-- =========================================================
INSERT INTO books (
    title,
    author_id,
    genre_id,
    price,
    rating,
    views,
    image,
    description
)
VALUES
(
    'Harry Potter và Hòn đá Phù thủy',
    1,
    5,
    150000,
    4.8,
    120,
    'https://images.unsplash.com/photo-1611100481087-2eb79ea4cf83?w=300&h=450&fit=crop',
    'Cuốn sách kinh điển về cậu bé phù thủy Harry Potter.'
),

(
    'Dế Mèn phiêu lưu ký',
    2,
    6,
    80000,
    4.5,
    98,
    'https://via.placeholder.com/300x450/4F46E5/FFFFFF?text=Dế+Mèn',
    'Tác phẩm bất hủ của văn học Việt Nam.'
),

(
    'Cho tôi xin một vé đi tuổi thơ',
    3,
    9,
    120000,
    4.7,
    110,
    'https://via.placeholder.com/300x450/10B981/FFFFFF?text=Tuổi+Thơ',
    'Tác phẩm nổi tiếng của Nguyễn Nhật Ánh.'
),

(
    'The Lord of the Rings',
    4,
    5,
    250000,
    4.9,
    220,
    'https://images.unsplash.com/photo-1603158047734-364f505d09e1?w=300&h=450&fit=crop',
    'Epic fantasy nổi tiếng thế giới.'
),

(
    'Đắc nhân tâm',
    5,
    8,
    90000,
    4.6,
    76,
    'https://via.placeholder.com/300x450/F59E0B/FFFFFF?text=Đắc+Nhân+Tâm',
    'Kinh điển phát triển bản thân.'
),

(
    'Số đỏ',
    6,
    9,
    65000,
    4.4,
    64,
    'https://via.placeholder.com/300x450/EF4444/FFFFFF?text=Số+Đỏ',
    'Tiểu thuyết hiện thực phê phán.'
),

(
    '1984',
    7,
    7,
    110000,
    4.7,
    88,
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=450&fit=crop',
    'Dystopian classic nổi tiếng.'
);

-- =========================================================
-- SAMPLE ORDERS
-- =========================================================
INSERT INTO orders (
    user_id,
    total,
    status,
    order_date
)
VALUES
(2, 300000, 'Đã giao', '2024-10-01'),
(2, 150000, 'Đang xử lí', '2024-10-02'),
(2, 500000, 'Đã hủy', '2024-10-03');

-- =========================================================
-- SAMPLE ORDER ITEMS
-- =========================================================
INSERT INTO order_items (
    order_id,
    book_id,
    quantity,
    price
)
VALUES
(1, 1, 1, 150000),
(1, 2, 1, 80000),
(2, 3, 1, 120000),
(3, 4, 2, 250000);