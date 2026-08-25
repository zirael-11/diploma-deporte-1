CREATE SCHEMA IF NOT EXISTS catalog;

CREATE TABLE IF NOT EXISTS catalog.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS catalog.products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    main_category VARCHAR(100) NOT NULL,
    country VARCHAR(100) NULL,
    club VARCHAR(100) NULL,
    year VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price_num DECIMAL(10, 2) NOT NULL CHECK (price_num >= 0),
    price_str VARCHAR(50) NOT NULL,
    description TEXT NULL,
    image TEXT NOT NULL,
    image_hover TEXT NOT NULL
);

COMMENT ON TABLE catalog.products IS 'Товары в каталоге интернет-магазина DEPORTE';

INSERT INTO catalog.products (title, main_category, country, club, year, type, price_num, price_str, description, image, image_hover)
VALUES 
('Домашняя форма сборной: Испания (2026)', 'Форма сборных', 'Испания', NULL, '2026', 'Домашняя', 4900.00, '4 900 ₽', 'Официальная экипировка сборной Испании.', 'spainfuria2026.png', 'spain2furia2026.png'),
('Гостевая форма сборной: Германия (2026)', 'Форма сборных', 'Германия', NULL, '2026', 'Гостевая', 5300.00, '5 300 ₽', 'Официальная экипировка сборной Германии.', 'germangost2026.png', 'german2gost2026.png'),
('Домашняя форма сборной: Италия (2026)', 'Форма сборных', 'Италия', NULL, '2026', 'Домашняя', 4900.00, '4 900 ₽', 'Официальная экипировка сборной Италии.', 'italysbor2026.png', 'italy2sbor2026.png'),
('Домашняя форма сборной: Англия (2026)', 'Форма сборных', 'Англия', NULL, '2026', 'Домашняя', 4900.00, '4 900 ₽', 'Официальная экипировка сборной Англии.', 'englandhome2026.png', 'england2home2026.png'),
('Специальная форма сборной: Россия (2026)', 'Форма сборных', 'Россия', NULL, '2026', 'Специальная коллекция', 5700.00, '5 700 ₽', 'Эксклюзивный комплект сборной России.', 'russiaussr.png', 'russiaussr2.png')