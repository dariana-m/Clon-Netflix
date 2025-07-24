const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 7001;
const JWT_SECRET = process.env.JWT_SECRET || 'netfox_secret_key';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'netfox',
};

// Crear un pool de conexiones
const pool = mysql.createPool(dbConfig);

// Verificar la conexión a la base de datos al iniciar el servidor
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos MySQL establecida.');
    connection.release();
});

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.userId = decoded.id;
        next();
    });
};

// Ruta de registro
app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    try {
        // Verificar si el usuario ya existe
        pool.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error del servidor' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ message: 'El usuario ya existe' });
            }
            
            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insertar nuevo usuario
            pool.query(
                'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
                [name, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error al crear usuario' });
                    }
                    
                    const token = jwt.sign({ id: result.insertId }, JWT_SECRET, { expiresIn: '24h' });
                    res.status(201).json({
                        message: 'Usuario creado exitosamente',
                        token,
                        user: { id: result.insertId, name, email }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Ruta de login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    
    pool.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        const user = results[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    });
});

// Obtener todos los videos de la base de datos
app.get('/api/videos', verifyToken, (req, res) => {
    pool.query('SELECT id_video as id, titulo as title, genero as category, anio as year, imagen as image, url as videoUrl, descripcion as description FROM videos ORDER BY id_video DESC', (err, results) => {
        if (err) {
            console.error('Error al obtener videos:', err);
            return res.status(500).json({ message: 'Error del servidor' });
        }
        res.json(results);
    });
});

// Buscar videos por título
app.get('/api/videos/search', verifyToken, (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return pool.query('SELECT id_video as id, titulo as title, genero as category, anio as year, imagen as image, url as videoUrl, descripcion as description FROM videos ORDER BY id_video DESC', (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error del servidor' });
            }
            res.json(results);
        });
    }
    
    pool.query(
        'SELECT id_video as id, titulo as title, genero as category, anio as year, imagen as image, url as videoUrl, descripcion as description FROM videos WHERE titulo LIKE ? ORDER BY id_video DESC',
        [`%${q}%`],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error del servidor' });
            }
            res.json(results);
        }
    );
});

// Obtener videos por categoría
app.get('/api/videos/category/:category', verifyToken, (req, res) => {
    const { category } = req.params;
    
    pool.query(
        'SELECT id_video as id, titulo as title, genero as category, anio as year, imagen as image, url as videoUrl, descripcion as description FROM videos WHERE genero = ? ORDER BY id_video DESC',
        [category],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error del servidor' });
            }
            res.json(results);
        }
    );
});

// Obtener categorías de videos disponibles (6 aleatorias)
app.get('/api/videos/categories', verifyToken, (req, res) => {
    pool.query('SELECT DISTINCT genero as category FROM videos WHERE genero IS NOT NULL ORDER BY RAND() LIMIT 6', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error del servidor' });
            }
        const categories = results.map(row => row.category);
        res.json(categories);
    });
});

// Obtener video destacado (el más reciente)
app.get('/api/videos/featured', verifyToken, (req, res) => {
    pool.query('SELECT id_video as id, titulo as title, genero as category, anio as year, imagen as image, url as videoUrl, descripcion as description FROM videos ORDER BY id_video DESC LIMIT 1', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error del servidor' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No hay videos disponibles' });
        }
        res.json(results[0]);
    });
});

// Obtener 5 videos aleatorios para el banner
app.get('/api/videos/banner', verifyToken, (req, res) => {
    pool.query('SELECT id_video as id, titulo as title, genero as category, anio as year, imagen as image, url as videoUrl, descripcion as description FROM videos ORDER BY RAND() LIMIT 5', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error del servidor' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No hay videos disponibles' });
        }
        res.json(results);
    });
});

// Verificar token
app.get('/api/verify', verifyToken, (req, res) => {
    pool.query('SELECT id, name, email FROM users WHERE id = ?', [req.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.json({
            success: true,
            user: results[0]
        });
    });
});

// ===== RUTAS DE FAVORITOS =====

// Agregar video a favoritos
app.post('/api/favorites', verifyToken, (req, res) => {
    const { videoId } = req.body;
    const userId = req.userId;
    
    if (!videoId) {
        return res.status(400).json({ message: 'ID del video es requerido' });
    }
    
    pool.query(
        'INSERT INTO favorites (user_id, video_id) VALUES (?, ?)',
        [userId, videoId],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'El video ya está en favoritos' });
                }
                return res.status(500).json({ message: 'Error al agregar a favoritos' });
            }
            res.status(201).json({ message: 'Video agregado a favoritos' });
        }
    );
});

// Quitar video de favoritos
app.delete('/api/favorites/:videoId', verifyToken, (req, res) => {
    const { videoId } = req.params;
    const userId = req.userId;
    
    pool.query(
        'DELETE FROM favorites WHERE user_id = ? AND video_id = ?',
        [userId, videoId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error al quitar de favoritos' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Favorito no encontrado' });
            }
            res.json({ message: 'Video quitado de favoritos' });
        }
    );
});

// Obtener favoritos del usuario
app.get('/api/favorites', verifyToken, (req, res) => {
    const userId = req.userId;
    
    pool.query(
        `SELECT v.id_video as id, v.titulo as title, v.genero as category, 
         v.anio as year, v.imagen as image, v.url as videoUrl, 
         v.descripcion as description, f.created_at as favorited_at
         FROM favorites f 
         JOIN videos v ON f.video_id = v.id_video 
         WHERE f.user_id = ? 
         ORDER BY f.created_at DESC`,
        [userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error al obtener favoritos' });
            }
            res.json(results);
        }
    );
});

// Verificar si un video está en favoritos
app.get('/api/favorites/check/:videoId', verifyToken, (req, res) => {
    const { videoId } = req.params;
    const userId = req.userId;
    
    pool.query(
        'SELECT id FROM favorites WHERE user_id = ? AND video_id = ?',
        [userId, videoId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error al verificar favorito' });
            }
            res.json({ isFavorite: results.length > 0 });
        }
    );
});

// ===== RUTAS DE HISTORIAL =====

// Agregar video al historial
app.post('/api/history', verifyToken, (req, res) => {
    const { videoId } = req.body;
    const userId = req.userId;
    
    if (!videoId) {
        return res.status(400).json({ message: 'ID del video es requerido' });
    }
    
    pool.query(
        'INSERT INTO watch_history (user_id, video_id) VALUES (?, ?)',
        [userId, videoId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error al agregar al historial' });
            }
            res.status(201).json({ message: 'Video agregado al historial' });
        }
    );
});

// Obtener historial del usuario
app.get('/api/history', verifyToken, (req, res) => {
    const userId = req.userId;
    
    pool.query(
        `SELECT v.id_video as id, v.titulo as title, v.genero as category, 
         v.anio as year, v.imagen as image, v.url as videoUrl, 
         v.descripcion as description, h.watched_at
         FROM watch_history h 
         JOIN videos v ON h.video_id = v.id_video 
         WHERE h.user_id = ? 
         ORDER BY h.watched_at DESC`,
        [userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error al obtener historial' });
            }
            res.json(results);
        }
    );
});

// Limpiar historial del usuario
app.delete('/api/history', verifyToken, (req, res) => {
    const userId = req.userId;
    
    pool.query(
        'DELETE FROM watch_history WHERE user_id = ?',
        [userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error al limpiar historial' });
            }
            res.json({ message: 'Historial limpiado exitosamente' });
        }
    );
});

// Iniccializamos el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});