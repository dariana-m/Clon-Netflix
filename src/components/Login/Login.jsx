import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const Login = ({ onToggleView }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.email || !formData.password) {
            setError('Por favor completa todos los campos');
            setLoading(false);
            return;
        }

        try {
            const result = await login(formData.email, formData.password);
            
            if (result.success) {
                navigate('/browse');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        }
        
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <Link to="/" className="auth-logo">
                    NETFOX
                </Link>
            </div>

            <div className="auth-form-container">
                <div className="auth-form">
                    <h1 className="auth-title">Iniciar sesión</h1>
                    
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="auth-form-content">
                        <div className="input-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="auth-input"
                                placeholder="Email o número de teléfono"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="email" className="input-label">
                                Email o número de teléfono
                            </label>
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="auth-input"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="password" className="input-label">
                                Contraseña
                            </label>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                        
                        <div className="auth-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Recuérdame
                            </label>
                            <a href="#" className="help-link">¿Necesitas ayuda?</a>
                        </div>
                    </form>
                    
                    <div className="auth-footer">
                        <p className="auth-switch">
                            ¿Primera vez en Netflix? 
                            <button 
                                type="button" 
                                className="auth-link" 
                                onClick={() => onToggleView && onToggleView()}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Suscríbete ahora
                            </button>
                        </p>
                        
                        <p className="auth-terms">
                            Esta página está protegida por Google reCAPTCHA para comprobar que no eres un robot.
                            <a href="#" className="terms-link"> Más info.</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;