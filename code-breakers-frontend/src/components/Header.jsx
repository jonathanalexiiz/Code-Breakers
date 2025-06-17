import React from 'react';
import "../styles/header.css";
import Navbar from './Navbar';

const Header = ({ tipoUsuario, onLogout }) => {
  return (
    <header className="header-container">
      <div className="titulo-header">Juegos Interactivos</div>
      <Navbar tipoUsuario={tipoUsuario} onLogout={onLogout} />
    </header>
  );
};

export default Header;
