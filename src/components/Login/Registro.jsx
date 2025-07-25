import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const Registro = ({ onToggleView }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validación en tiempo real para el nombre
        if (name === 'name') {
            const hasNumbers = /\d/.test(value);
            if (hasNumbers) {
                setFieldErrors(prev => ({
                    ...prev,
                    name: 'Solo se permiten letras'
                }));
                return; // No actualizar el valor si contiene números
            } else {
                setFieldErrors(prev => ({
                    ...prev,
                    name: ''
                }));
            }
        }
        
        // Validación en tiempo real para el email
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                setFieldErrors(prev => ({
                    ...prev,
                    email: 'Por favor ingresa un email válido'
                }));
            } else {
                setFieldErrors(prev => ({
                    ...prev,
                    email: ''
                }));
            }
        }
        
        // Validación en tiempo real para la contraseña
        if (name === 'password') {
            if (value && value.length < 8) {
                setFieldErrors(prev => ({
                    ...prev,
                    password: 'La contraseña debe tener al menos 8 caracteres'
                }));
            } else {
                setFieldErrors(prev => ({
                    ...prev,
                    password: ''
                }));
            }
        }
        
        // Validación para confirmar contraseña
        if (name === 'confirmPassword') {
            if (value && value !== formData.password) {
                setFieldErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Las contraseñas no coinciden'
                }));
            } else {
                setFieldErrors(prev => ({
                    ...prev,
                    confirmPassword: ''
                }));
            }
        }
        
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Por favor completa todos los campos');
            return false;
        }

        // Verificar si hay números en el nombre
        const hasNumbers = /\d/.test(formData.name);
        if (hasNumbers) {
            setError('Solo se permiten letras');
            return false;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor ingresa un email válido');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const result = await register(formData.name, formData.email, formData.password);
            
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
                    <h1 className="auth-title">Crear cuenta</h1>
                    
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="auth-form-content">
                        <div className="input-group">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={`auth-input ${fieldErrors.name ? 'error' : ''}`}
                                placeholder="Nombre completo"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="name" className="input-label">
                                Nombre completo
                            </label>
                            {fieldErrors.name && (
                                <div className="field-error">
                                    {fieldErrors.name}
                                </div>
                            )}
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`auth-input ${fieldErrors.email ? 'error' : ''}`}
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="email" className="input-label">
                                Email
                            </label>
                            {fieldErrors.email && (
                                <div className="field-error">
                                    {fieldErrors.email}
                                </div>
                            )}
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={`auth-input ${fieldErrors.password ? 'error' : ''}`}
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="password" className="input-label">
                                Contraseña
                            </label>
                            {fieldErrors.password && (
                                <div className="field-error">
                                    {fieldErrors.password}
                                </div>
                            )}
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`auth-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                                placeholder="Confirmar contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="confirmPassword" className="input-label">
                                Confirmar contraseña
                            </label>
                            {fieldErrors.confirmPassword && (
                                <div className="field-error">
                                    {fieldErrors.confirmPassword}
                                </div>
                            )}
                        </div>
                        
                        <button 
                            type="submit" 
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>
                        
                        <div className="auth-terms-register">
                            <p>
                                Al hacer clic en "Crear cuenta", aceptas nuestros 
                                <a href="#" className="terms-link">Términos de uso</a> y 
                                <a href="#" className="terms-link">Política de privacidad</a>.
                            </p>
                        </div>
                    </form>
                    
                    <div className="auth-footer">
                        <p className="auth-switch">
                            ¿Ya tienes una cuenta? 
                            <button 
                                type="button" 
                                className="auth-link" 
                                onClick={() => onToggleView && onToggleView()}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Inicia sesión
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

export default Registro;