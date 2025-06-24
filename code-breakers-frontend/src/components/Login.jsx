import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import '../styles/login.css';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState({ email: '', password: '', general: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    setError((prev) => ({
      ...prev,
      [name]: value.trim() === '' ? `El campo ${name} es obligatorio` : '',
      general: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: form.email ? '' : 'El email es obligatorio',
      password: form.password ? '' : 'La contraseña es obligatoria',
    };
    setError((prev) => ({ ...prev, ...newErrors }));
    if (newErrors.email || newErrors.password) return;

    try {
      const res = await api.post('/login', {
        email: form.email,
        password: form.password,
      });
      console.log('Respuesta del login:', res);

      const { token, user } = res.data;
      if (!token) {
        console.error('❌ No se recibió un token del backend.');
        setError((prev) => ({
          ...prev,
          general: 'Error: no se recibió token del servidor',
        }));
        return;
      }

      localStorage.setItem('token', token);
      console.log("🔐 Token guardado:", localStorage.getItem('token'));
      onLogin({ ...user, token });
       navigate('/home');

    } catch (err) {
      console.error("Error:", err);
      const mensaje = err.response?.data?.message || 'Error de conexión con el servidor';
      setError((prev) => ({ ...prev, general: mensaje }));
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>🔐 Iniciar Sesión</h2>

        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            className={error.email ? 'input-error' : ''}
          />
          {error.email && <span className="error">{error.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={error.password ? 'input-error' : ''}
          />
          {error.password && <span className="error">{error.password}</span>}
        </div>

        {error.general && <p className="error">{error.general}</p>}

        <button className="btn-login" type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
