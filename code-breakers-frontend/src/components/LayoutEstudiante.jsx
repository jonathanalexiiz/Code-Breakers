import Layout from './Layout';
import { Outlet } from 'react-router-dom';

const LayoutEstudiante = ({ onLogout }) => {
  return (
    <Layout tipoUsuario="estudiante" onLogout={onLogout}>
      <Outlet />
    </Layout>
  );
};

export default LayoutEstudiante;
