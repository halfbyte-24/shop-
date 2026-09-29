import { Outlet, useLocation } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', color: 'var(--color-text-primary)' }}>
      <PublicNavbar />
      
      <main style={{ flex: '1 1 auto', paddingTop: isHomePage ? '0' : '80px' }}>
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}
