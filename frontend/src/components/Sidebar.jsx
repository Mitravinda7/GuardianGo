import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '🗺️', label: 'Safe Route' },
  { to: '/alerts', icon: '🔔', label: 'Alerts' },
  { to: '/community', icon: '👥', label: 'Community' },
  { to: '/report', icon: '📝', label: 'Report Issue' },
  { to: '/sos', icon: '🚨', label: 'SOS Emergency', danger: true },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
  { to: '/about', icon: 'ℹ️', label: 'About' },
];

export default function Sidebar({ isOpen, onClose}) {
  return (
    <>
      <style>{`
        .sidebar {
          position: fixed;
          top: var(--navbar-height);
          left: 0;
          width: var(--sidebar-width);
          height: calc(100vh - var(--navbar-height));
          background: var(--surface);
          border-right: 1px solid var(--border);
          padding: 24px 0;
          overflow-y: auto;
          z-index: 900;
          transform: translateX(0);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: var(--shadow);
        }
        .sidebar.closed { transform: translateX(-100%); }
        .sidebar-section { padding: 0 12px; margin-bottom: 8px; }
        .sidebar-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--text-light);
          text-transform: uppercase;
          padding: 0 12px;
          margin-bottom: 8px;
          margin-top: 16px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: var(--transition);
          margin-bottom: 4px;
        }
        .nav-item:hover { background: var(--bg); color: var(--text-main); }
        .nav-item.active { background: var(--primary); color: var(--text-main); font-weight: 600; }
        .nav-item.danger { color: var(--danger); }
        .nav-item.danger:hover { background: #FEE; }
        .nav-item.danger.active { background: var(--danger); color: white; }
        .nav-icon { font-size: 1.2rem; width: 24px; text-align: center; }
        .sidebar-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          border-top: 1px solid var(--border);
          background: var(--surface);
        }
        .safety-tip {
          background: linear-gradient(135deg, #FFF9E6, #FFF3CD);
          border-radius: var(--radius);
          padding: 12px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          border-left: 3px solid var(--primary);
        }
        .safety-tip strong { color: var(--text-main); display: block; margin-bottom: 4px; font-size: 0.85rem; }
      `}</style>

      <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
        {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            zIndex: -1,
            background: 'rgba(0,0,0,0.3)',
          }}
        />
      )}
        <div className="sidebar-label">Navigation</div>
        <div className="sidebar-section">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-item ${item.danger ? 'danger' : ''} ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="safety-tip">
            <strong>💡 Safety Tip</strong>
            Always share your live location with a trusted contact when traveling at night.
          </div>
        </div>
      </aside>
    </>
  );
}