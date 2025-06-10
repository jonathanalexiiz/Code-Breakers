import Layout from './Layout';
import { Outlet } from 'react-router-dom';

const LayoutDocente = ({ onLogout }) => {
  return (
    <Layout tipoUsuario="docente" onLogout={onLogout}>
      <Outlet />
    </Layout>
  );
};

export default LayoutDocente;
