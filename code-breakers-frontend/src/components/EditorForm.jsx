import React, { useState } from 'react';

const EditorForm = () => {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Editor registrado:', form);
    alert('Registro exitoso (solo frontend)');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro de Editor</h2>
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="email" placeholder="Email" type="email" onChange={handleChange} />
      <input name="password" placeholder="Contraseña" type="password" onChange={handleChange} />
      <button type="submit">Registrar</button>
    </form>
  );
};