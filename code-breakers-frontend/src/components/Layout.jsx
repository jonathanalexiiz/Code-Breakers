import React from 'react';
import Header from './Header';
import Footer from './Footer';
import '../styles/layout.css';
import { Outlet } from 'react-router-dom';

const Layout = ({ tipoUsuario, onLogout }) => {
  return (
    <div className="layout-container">
      <Header tipoUsuario={tipoUsuario} onLogout={onLogout} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
