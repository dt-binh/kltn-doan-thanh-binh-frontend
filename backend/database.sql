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

    status ENUM('active', 'inactive')
    DEFAULT 'active',

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