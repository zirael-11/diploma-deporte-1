CREATE SCHEMA IF NOT EXISTS catalog;



CREATE TABLE IF NOT EXISTS catalog.products (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    main_category VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    club VARCHAR(100) NULL,
    year VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price_num DECIMAL(10, 2) NOT NULL CHECK (price_num >= 0),
    price_str VARCHAR(50) NOT NULL,
    description TEXT NULL,
    image TEXT NOT NULL,
    image_hover TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE catalog.products IS 'Товары в каталоге internet-магазина DEPORTE';

INSERT INTO catalog.products (id, title, main_category, country, club, year, type, price_num, price_str, description, image, image_hover, created_at, updated_at)
VALUES
('1', 'Домашняя форма сборной Испании (2024)', 'Форма сборных', 'Испания', NULL, '2024', 'Домашняя', 4900.00, '4 900 ₽', 'Официальная экипировка сборной Испании.', 'spainfuria2026.png', 'spain2furia2026.png', NOW(), NOW()),
('2', 'Гостевая форма сборной Германии (2024)', 'Форма сборных', 'Германия', NULL, '2024', 'Гостевая', 5300.00, '5 300 ₽', 'Официальная экипировка сборной Германии.', 'germangost2026.png', 'german2gost2026.png', NOW(), NOW()),
('3', 'Домашняя форма сборной Италии (2024)', 'Форма сборных', 'Италия', NULL, '2024', 'Домашняя', 4900.00, '4 900 ₽', 'Официальная экипировка сборной Италии.', 'italysbor2026.png', 'italy2sbor2026.png', NOW(), NOW()),
('4', 'Домашняя форма сборной Англии (2024)', 'Форма сборных', 'Англия', NULL, '2024', 'Домашняя', 4900.00, '4 900 ₽', 'Официальная экипировка сборной Англии.', 'englandhome2026.png', 'england2home2026.png', NOW(), NOW()),
('5', 'Специальная форма сборной России (2024)', 'Форма сборных', 'Россия', NULL, '2024', 'Специальная', 5700.00, '5 700 ₽', 'Эксклюзивный комплект сборной России.', 'russiaussr.png', 'russiaussr2.png', NOW(), NOW());


CREATE SCHEMA IF NOT EXISTS catalog;
