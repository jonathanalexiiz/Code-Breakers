import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Importar
import '../styles/login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState({ email: '', password: '' });
  const navigate = useNavigate(); // 👈 Hook para redirigir

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (value.trim() === '') {
      setError({ ...error, [name]: `El campo ${name} es obligatorio` });
    } else {
      setError({ ...error, [name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      email: form.email ? '' : 'El email es obligatorio',
      password: form.password ? '' : 'La contraseña es obligatoria',
    };

    setError(newErrors);

    // Aquí validas credenciales (puedes personalizar esto)
    const isValid = form.email === 'admin@correo.com' && form.password === '123456';

    if (!newErrors.email && !newErrors.password) {
      if (isValid) {
        navigate('/home'); // 👈 Redirige si es válido
      } else {
        alert('Credenciales incorrectas');
      }
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

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
