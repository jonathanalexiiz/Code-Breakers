import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Main from './Main';
import '../styles/layout.css';

import { Outlet } from 'react-router-dom';

const Layout = ({ tipoUsuario, onLogout }) => {
  return (
    <div className="layout-container">
      <Header tipoUsuario={tipoUsuario} onLogout={onLogout} />
       <Main/>
      <Footer />
    </div>
  );
};

export default Layout;
