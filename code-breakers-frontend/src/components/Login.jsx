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

    if (value.trim() === '') {
      setError((prev) => ({ ...prev, [name]: `El campo ${name} es obligatorio` }));
    } else {
      setError((prev) => ({ ...prev, [name]: '', general: '' }));
    }
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
      // Petición real al backend Laravel
      const res = await api.post('/login', {
        email: form.email,
        password: form.password,
      });

      const token = res.data.token;

      // Guardar el token en localStorage
      localStorage.setItem('token', token);

      // Llamamos al callback que indica que el usuario está autenticado
      onLogin();

      // Redirigimos a la página protegida
      navigate('/home');

    } catch (err) {
      console.error(err);
      setError((prev) => ({
        ...prev,
        general: 'Credenciales incorrectas o error del servidor',
      }));
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
            placeholder="ejemplo@correo.com"
            value={form.email}
            onChange={handleChange}
            className={error.email ? 'input-error' : ''}
          />
          {error.email && <span className="error">{error.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
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
