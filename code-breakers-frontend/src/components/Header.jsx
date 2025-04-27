import React from 'react';
import "../styles/header.css";
import Navbar from './Navbar';
import "../styles/header.css";

const Header = () => {
    return (
        <header className='header-container'>
            
            <div> Juegos Interactivos </div>
            <Navbar/>

        </header>
    );
};

export default Header