import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
    <span className={styles.navIcon}>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#7c6aff" opacity="0.15"/>
            <path d="M7 10h14M7 14h10M7 18h6" stroke="#7c6aff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="21" cy="18" r="3" fill="#7c6aff"/>
          </svg>
          <span className={styles.logoText}>TaskFlow</span>
        </div>

        <nav className={styles.nav}>
          <NavItem to="/dashboard" label="Dashboard" icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          } />
          <NavItem to="/projects" label="Projects" icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4a2 2 0 012-2h2l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          } />
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className="avatar">{initials}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>
          <button className={`btn btn-ghost btn-sm ${styles.logoutBtn}`} onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
