import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/browser.css';
import ViewVideo from '../components/Modals/ViewVideo';

const Browser = () => {
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('inicio');
    const [favorites, setFavorites] = useState([]);
    const [watchHistory, setWatchHistory] = useState([]);
    const [bannerVideos, setBannerVideos] = useState([]);
    const [categories, setCategories] = useState(['Todos']);
    
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchVideos();
        fetchBannerVideos();
        fetchCategories();
        if (user) {
            fetchFavorites();
            fetchWatchHistory();
        }
    }, [user]);

    useEffect(() => {
        filterVideos();
    }, [videos, searchTerm, selectedCategory]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (bannerVideos.length > 0) {
                setCurrentSlide((prev) => (prev + 1) % bannerVideos.length);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [bannerVideos]);

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7001/api/videos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar los videos');
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7001/api/favorites', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFavorites(response.data);
        } catch (err) {
            console.error('Error al cargar favoritos:', err);
        }
    };

    const fetchWatchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7001/api/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchHistory(response.data);
        } catch (err) {
            console.error('Error al cargar historial:', err);
        }
    };

    const fetchBannerVideos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7001/api/videos/banner', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBannerVideos(response.data);
        } catch (err) {
            console.error('Error al cargar videos del banner:', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7001/api/videos/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(['Todos', ...response.data]);
        } catch (err) {
            console.error('Error al cargar categorías:', err);
            setCategories(['Todos', 'Drama', 'Acción', 'Comedia', 'Terror', 'Romance', 'Ciencia Ficción']);
        }
    };

    const filterVideos = () => {
        let filtered = videos;
        
        if (selectedCategory !== 'Todos') {
            filtered = filtered.filter(video => 
                video.category && video.category.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }
        
        if (searchTerm) {
            filtered = filtered.filter(video =>
                video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        setFilteredVideos(filtered);
        setCurrentSlide(0);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVideo(null);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'favoritos':
                return (
                    <div className="videos-section">
                        <h3 className="section-title">
                            Mis Favoritos
                            <span className="results-count">({favorites.length} videos)</span>
                        </h3>
                        {favorites.length === 0 ? (
                            <div className="no-results">
                                <p>No tienes videos favoritos aún.</p>
                                <p>Agrega videos a favoritos desde el reproductor.</p>
                            </div>
                        ) : (
                            <div className="videos-grid">
                                {favorites.map(video => (
                                    <div 
                                        key={video.id} 
                                        className="video-card"
                                        onClick={() => handleVideoClick(video)}
                                    >
                                        <div className="card-image">
                                            <img 
                                                src={video.image || 'https://via.placeholder.com/300x200'} 
                                                alt={video.title}
                                                loading="lazy"
                                            />
                                            <div className="card-overlay">
                                                <button className="play-overlay">
                                                    <svg viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="card-info">
                                            <h4 className="card-title">{video.title}</h4>
                                            <div className="card-meta">
                                                <span className="card-year">{video.year}</span>
                                                <span className="card-genre">{video.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'historial':
                return (
                    <div className="videos-section">
                        <h3 className="section-title">
                            Historial de Visualización
                            <span className="results-count">({watchHistory.length} videos)</span>
                        </h3>
                        {watchHistory.length === 0 ? (
                            <div className="no-results">
                                <p>No has visto ningún video aún.</p>
                                <p>Tu historial aparecerá aquí cuando reproduzcas videos.</p>
                            </div>
                        ) : (
                            <div className="videos-grid">
                                {watchHistory.map((historyItem, index) => (
                                    <div 
                                        key={`${historyItem.video_id}-${index}`} 
                                        className="video-card"
                                        onClick={() => handleVideoClick(historyItem)}
                                    >
                                        <div className="card-image">
                                            <img 
                                                src={historyItem.image || 'https://via.placeholder.com/300x200'} 
                                                alt={historyItem.title}
                                                loading="lazy"
                                            />
                                            <div className="card-overlay">
                                                <button className="play-overlay">
                                                    <svg viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="watch-date">
                                                Visto: {new Date(historyItem.watched_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div className="card-info">
                                            <h4 className="card-title">{historyItem.title}</h4>
                                            <div className="card-meta">
                                                <span className="card-year">{historyItem.year}</span>
                                                <span className="card-genre">{historyItem.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <>
                        {/* Banner/Hero Section */}
                        {bannerVideos.length > 0 && (
                            <div className="hero-banner">
                                <div className="banner-background">
                                    <img 
                                        src={bannerVideos[currentSlide]?.image || 'https://via.placeholder.com/1920x1080'} 
                                        alt={bannerVideos[currentSlide]?.title}
                                        className="banner-image"
                                    />
                                    <div className="banner-overlay"></div>
                                </div>
                                
                                <div className="banner-content">
                                    <h2 className="banner-title">{bannerVideos[currentSlide]?.title}</h2>
                                    <p className="banner-year">{bannerVideos[currentSlide]?.year}</p>
                                    <p className="banner-description">
                                        {bannerVideos[currentSlide]?.description}
                                    </p>
                                    
                                    <div className="banner-buttons">
                                        <button 
                                            className="play-btn"
                                            onClick={() => handleVideoClick(bannerVideos[currentSlide])}
                                        >
                                            <svg viewBox="0 0 24 24" className="play-icon">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                            Reproducir
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Slide indicators */}
                                <div className="slide-indicators">
                                    {bannerVideos.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`indicator ${
                                                index === currentSlide ? 'active' : ''
                                            }`}
                                            onClick={() => setCurrentSlide(index)}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Videos Grid */}
                        <div className="videos-section">
                            <h3 className="section-title">
                                {selectedCategory === 'Todos' ? 'Todos los Videos' : `Videos de ${selectedCategory}`}
                                <span className="results-count">({filteredVideos.length} resultados)</span>
                            </h3>
                            
                            {filteredVideos.length === 0 ? (
                                <div className="no-results">
                                    <p>No se encontraron videos que coincidan con tu búsqueda.</p>
                                </div>
                            ) : (
                                <div className="videos-grid">
                                    {filteredVideos.map(video => (
                                        <div 
                                            key={video.id} 
                                            className="video-card"
                                            onClick={() => handleVideoClick(video)}
                                        >
                                            <div className="card-image">
                                                <img 
                                                    src={video.image || 'https://via.placeholder.com/300x200'} 
                                                    alt={video.title}
                                                    loading="lazy"
                                                />
                                                <div className="card-overlay">
                                                    <button className="play-overlay">
                                                        <svg viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="card-info">
                                                <h4 className="card-title">{video.title}</h4>
                                                <div className="card-meta">
                                                    <span className="card-year">{video.year}</span>
                                                    <span className="card-genre">{video.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                );
        }
    };

    if (loading) {
        return (
            <div className="browser-loading">
                <div className="loading-spinner"></div>
                <p>Cargando contenido...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="browser-error">
                <p>{error}</p>
                <button onClick={fetchVideos}>Reintentar</button>
            </div>
        );
    }



    return (
        <div className="browser">
            {/* Header */}
            <header className="browser-header">
                <div className="header-left">
                    <h1 className="logo">NETFOX</h1>
                    <nav className="nav-menu">
                        <button 
                            className={`nav-link ${activeSection === 'inicio' ? 'active' : ''}`}
                            onClick={() => setActiveSection('inicio')}
                        >
                            Inicio
                        </button>
                        <button 
                            className={`nav-link ${activeSection === 'favoritos' ? 'active' : ''}`}
                            onClick={() => setActiveSection('favoritos')}
                        >
                            Mis Favoritos
                        </button>
                        <button 
                            className={`nav-link ${activeSection === 'historial' ? 'active' : ''}`}
                            onClick={() => setActiveSection('historial')}
                        >
                            Historial
                        </button>
                    </nav>
                </div>
                
                <div className="header-right">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar videos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <svg className="search-icon" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                    </div>
                    
                    <div className="user-menu">
                        <span className="user-name">Hola, {user?.name || 'Usuario'}</span>
                        <button onClick={handleLogout} className="logout-btn">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Categories Filter - Solo mostrar en la sección de inicio */}
            {activeSection === 'inicio' && (
                <div className="categories-filter">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`category-btn ${
                                selectedCategory === category ? 'active' : ''
                            }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* Contenido dinámico según la sección activa */}
            {renderContent()}
            
            {/* Modal de Video */}
            <ViewVideo 
                video={selectedVideo}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onFavoriteChange={fetchFavorites}
                onHistoryChange={fetchWatchHistory}
            />
        </div>
    );
};

export default Browser;