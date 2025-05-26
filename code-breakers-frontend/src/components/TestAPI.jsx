import React, { useEffect } from 'react';
import axios from 'axios';

const TestAPI = () => {
  useEffect(() => {
    axios.get('http://localhost:8000/api/test')
      .then(res => console.log('✅ Respuesta:', res.data))
      .catch(err => console.error('❌ Error de conexión:', err));
  }, []);

  return null;
};

export default TestAPI;
