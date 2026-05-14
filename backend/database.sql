CREATE DATABASE IF NOT EXISTS truyen_db
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
    avatar VARCHAR(255) DEFAULT NULL,

    role ENUM('user', 'admin') DEFAULT 'user',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- CATEGORIES
-- =========================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE
);

-- =========================================================
-- STORIES
-- =========================================================
CREATE TABLE stories (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    author VARCHAR(100) DEFAULT NULL,

    description TEXT,

    cover_image VARCHAR(255) DEFAULT NULL,
    banner_image VARCHAR(255) DEFAULT NULL,

    status ENUM('ongoing', 'completed') DEFAULT 'ongoing',

    views INT DEFAULT 0,
    likes INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- STORY CATEGORIES
-- =========================================================
CREATE TABLE story_categories (
    story_id INT NOT NULL,
    category_id INT NOT NULL,

    PRIMARY KEY (story_id, category_id),

    FOREIGN KEY (story_id)
    REFERENCES stories(id)
    ON DELETE CASCADE,

    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE CASCADE
);

-- =========================================================
-- CHAPTERS
-- =========================================================
CREATE TABLE chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,

    story_id INT NOT NULL,

    chapter_number FLOAT NOT NULL,

    title VARCHAR(255) DEFAULT NULL,

    content LONGTEXT NOT NULL,

    views INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (story_id)
    REFERENCES stories(id)
    ON DELETE CASCADE
);

-- =========================================================
-- COMMENTS
-- =========================================================
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    story_id INT NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (story_id)
    REFERENCES stories(id)
    ON DELETE CASCADE
);

-- =========================================================
-- FAVORITES
-- =========================================================
CREATE TABLE favorites (
    user_id INT NOT NULL,
    story_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, story_id),

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (story_id)
    REFERENCES stories(id)
    ON DELETE CASCADE
);

-- =========================================================
-- READING HISTORY
-- =========================================================
CREATE TABLE reading_history (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    story_id INT NOT NULL,
    chapter_id INT NOT NULL,

    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (story_id)
    REFERENCES stories(id)
    ON DELETE CASCADE,

    FOREIGN KEY (chapter_id)
    REFERENCES chapters(id)
    ON DELETE CASCADE
);

-- =========================================================
-- SAMPLE CATEGORIES
-- =========================================================
INSERT INTO categories (name, slug) VALUES
('Action', 'action'),
('Adventure', 'adventure'),
('Comedy', 'comedy'),
('Drama', 'drama'),
('Fantasy', 'fantasy'),
('Romance', 'romance'),
('Horror', 'horror'),
('School Life', 'school-life'),
('Sci-Fi', 'sci-fi'),
('Slice of Life', 'slice-of-life');

-- =========================================================
-- SAMPLE STORIES
-- =========================================================
INSERT INTO stories (
    title,
    slug,
    author,
    description,
    cover_image,
    status
) VALUES
(
    'Huyết Chiến Ma Thần',
    'huyet-chien-ma-than',
    'Bee Author',
    'Một thiếu niên bước vào con đường tu luyện đầy máu và bóng tối.',
    'uploads/covers/story1.jpg',
    'ongoing'
),
(
    'Thanh Xuân Học Đường',
    'thanh-xuan-hoc-duong',
    'Bee Author',
    'Câu chuyện tuổi trẻ tại ngôi trường cấp ba đầy cảm xúc.',
    'uploads/covers/story2.jpg',
    'completed'
);

-- =========================================================
-- SAMPLE CHAPTERS
-- =========================================================
INSERT INTO chapters (
    story_id,
    chapter_number,
    title,
    content
) VALUES
(
    1,
    1,
    'Khởi đầu',
    'Nội dung chapter 1...'
),
(
    1,
    2,
    'Bí mật cổ xưa',
    'Nội dung chapter 2...'
),
(
    2,
    1,
    'Ngày đầu nhập học',
    'Nội dung chapter 1 của truyện học đường...'
);

-- =========================================================
-- SAMPLE STORY CATEGORIES
-- =========================================================
INSERT INTO story_categories (story_id, category_id) VALUES
(1, 1),
(1, 5),
(2, 4),
(2, 6);

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