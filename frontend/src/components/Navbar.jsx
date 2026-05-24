import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import TranslateWidget from './TranslateWidget.jsx';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: var(--navbar-height);
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 1000;
          box-shadow: var(--shadow);
        }
        .navbar-left { display: flex; align-items: center; gap: 16px; }
        .hamburger {
          background: none; border: none; cursor: pointer;
          padding: 8px; border-radius: 8px;
          display: flex; flex-direction: column; gap: 5px;
          transition: var(--transition);
        }
        .hamburger:hover { background: var(--bg); }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: var(--text-main); border-radius: 2px;
          transition: var(--transition);
        }
        .brand {
          font-family: var(--font-display); font-size: 1.4rem;
          font-weight: 800; color: var(--text-main);
          text-decoration: none; display: flex; align-items: center; gap: 8px;
        }
        .brand-icon {
          width: 32px; height: 32px; background: var(--primary);
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; font-size: 16px;
        }
        .navbar-right { display: flex; align-items: center; gap: 12px; }
        .user-menu { position: relative; }
        .user-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; background: var(--bg);
          border: 1px solid var(--border); border-radius: 24px;
          cursor: pointer; font-family: var(--font-body);
          font-size: 0.9rem; font-weight: 500; transition: var(--transition);
        }
        .user-btn:hover { border-color: var(--primary); }
        .user-avatar {
          width: 28px; height: 28px; background: var(--primary);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-weight: 700; font-size: 0.8rem;
        }
        .dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); box-shadow: var(--shadow-lg);
          min-width: 180px; overflow: hidden;
          animation: fadeIn 0.15s ease; z-index: 2001;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dropdown a, .dropdown button {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; color: var(--text-main);
          text-decoration: none; font-size: 0.9rem;
          background: none; border: none; width: 100%;
          cursor: pointer; transition: var(--transition);
          font-family: var(--font-body);
        }
        .dropdown a:hover, .dropdown button:hover { background: var(--bg); }
        .dropdown button { color: var(--danger); }
        .auth-links { display: flex; gap: 8px; }
      `}</style>

      <nav className="navbar">
        <div className="navbar-left">
          <button className="hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
          <Link to="/" className="brand">
            <div className="brand-icon">🛡️</div>
            GuardianGo
          </Link>
        </div>

        <div className="navbar-right">
          <TranslateWidget />
          {user ? (
            <div className="user-menu">
              <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                {user.name?.split(' ')[0]}
              </button>
              {dropdownOpen && (
                <div className="dropdown">
                  <Link to="/settings" onClick={() => setDropdownOpen(false)}>⚙️ Settings</Link>
                  <button onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}