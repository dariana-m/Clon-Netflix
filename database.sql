-- Active: 1743786824105@@127.0.0.1@3306@netfox
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS netfox;
USE netfox;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar usuario de prueba (opcional)
-- INSERT INTO users (name, email, password) VALUES 
-- ('Usuario Test', 'test@netfox.com', '$2a$10$example_hashed_password');

-- Mostrar estructura de la tabla

CREATE TABLE videos (
    id_video INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200),
    genero VARCHAR(100),
    anio VARCHAR(5),
    imagen VARCHAR(500),
    url VARCHAR(500),
    descripcion VARCHAR(1000)
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    video_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id_video) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, video_id)
);

-- Tabla de historial
CREATE TABLE IF NOT EXISTS watch_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    video_id INT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id_video) ON DELETE CASCADE,
    INDEX idx_user_watched (user_id, watched_at)
)