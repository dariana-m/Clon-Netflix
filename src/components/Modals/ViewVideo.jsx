import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import '../../styles/viewVideo.css';

const ViewVideo = ({ video, isOpen, onClose, onFavoriteChange, onHistoryChange }) => {
    const playerRef = useRef(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    // Función para convertir URLs de Dropbox a enlaces directos
    const getDirectDropboxUrl = (url) => {
        if (url && url.includes('dropbox.com')) {
            // Convertir URL de Dropbox a enlace directo
            return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                     .replace('dropbox.com', 'dl.dropboxusercontent.com')
                     .replace('?dl=0', '')
                     .replace('?dl=1', '');
        }
        return url;
    };

    useEffect(() => {
        if (isOpen && video) {
            checkIfFavorite();
            console.log('Modal abierto, video listo para reproducir');
        }
    }, [isOpen, video]);

    // Verificar si el video está en favoritos
    const checkIfFavorite = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:7001/api/favorites/check/${video.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(response.data.isFavorite);
        } catch (error) {
            console.error('Error al verificar favorito:', error);
        }
    };

    // Agregar/quitar de favoritos
    const toggleFavorite = async () => {
        if (!video || loading) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            if (isFavorite) {
                await axios.delete(`http://localhost:7001/api/favorites/${video.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsFavorite(false);
            } else {
                await axios.post('http://localhost:7001/api/favorites', 
                    { videoId: video.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsFavorite(true);
            }
            
            // Actualizar la lista de favoritos en el componente padre
            if (onFavoriteChange) {
                onFavoriteChange();
            }
        } catch (error) {
            console.error('Error al actualizar favorito:', error);
        } finally {
            setLoading(false);
        }
    };

    // Agregar al historial
    const addToHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:7001/api/history', 
                { videoId: video.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Video agregado al historial');
            
            // Actualizar la lista de historial en el componente padre
            if (onHistoryChange) {
                onHistoryChange();
            }
        } catch (error) {
            console.error('Error al agregar al historial:', error);
        }
    };

    const handleFullscreen = async () => {
        // Agregar al historial cuando se hace clic en pantalla completa
        await addToHistory();
        
        try {
            // Try different approaches for fullscreen with react-player v3
            const player = playerRef.current;
            
            if (player) {
                // Try to get the video element directly
                const videoElement = player.querySelector('video');
                if (videoElement && videoElement.requestFullscreen) {
                    videoElement.requestFullscreen().catch(err => {
                        console.error("Error with video element fullscreen:", err);
                        // Fallback to container
                        const container = document.getElementById('video-container');
                        if (container && container.requestFullscreen) {
                            container.requestFullscreen().catch(err2 => {
                                console.error("Error with container fullscreen:", err2);
                            });
                        }
                    });
                } else {
                    // Fallback to container
                    const container = document.getElementById('video-container');
                    if (container && container.requestFullscreen) {
                        container.requestFullscreen().catch(err => {
                            console.error("Error with container fullscreen:", err);
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error in handleFullscreen:", error);
        }
    };

    const handleModalClick = (e) => {
        // Cerrar modal solo si se hace click en el overlay, no en el contenido
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !video) return null;

    return (
        <div className="video-modal-overlay" onClick={handleModalClick}>
            <div className="video-modal-content">
                <button className="modal-close-btn" onClick={onClose}>
                    <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                </button>

                <div className="video-container" id="video-container">
                    <ReactPlayer
                        ref={playerRef}
                        src={getDirectDropboxUrl(video.videoUrl)}
                        controls={true}
                        playing={true}
                        width="100%"
                        height="100%"
                    />
                </div>

                <div className="video-info">
                    <h2 className="video-title">{video.title}</h2>
                    <p> {video.description}</p>
                    <div className="video-meta">
                        <span className="video-year">{video.year}</span>
                        <span className="video-category">{video.category}</span>
                    </div>
                    <div className="video-actions">
                        <button 
                            className={`favorite-btn ${isFavorite ? 'active' : ''}`} 
                            onClick={toggleFavorite}
                            disabled={loading}
                        >
                            <svg viewBox="0 0 24 24">
                                <path d={isFavorite 
                                    ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    : "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
                                } />
                            </svg>
                            {isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
                        </button>
                        
                        <button className="fullscreen-btn" onClick={handleFullscreen}>
                            <svg viewBox="0 0 24 24">
                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                            </svg>
                            Ver en Pantalla Completa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewVideo;