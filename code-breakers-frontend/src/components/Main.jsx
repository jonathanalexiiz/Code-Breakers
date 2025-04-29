import React from 'react';
import { Outlet } from 'react-router-dom';
import "../styles/main.css"

const Main = () => {
  return (
    <main className='main-container'>
      <Outlet />
    </main>
  );
};

export default Main