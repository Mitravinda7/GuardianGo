import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from '../context/LocationContext.jsx';
import { triggerSOS } from '../services/sosService.js';

export default function SOSButton() {
  const { user } = useAuth();
  const { location } = useLocation();
  const navigate = useNavigate();
  const [pressing, setPressing] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [timer, setTimer] = useState(null);

  const handleMouseDown = () => {
    if (!user) { navigate('/login'); return; }
    setPressing(true);
    const t = setTimeout(async () => {
      try {
        await triggerSOS(location, 'Emergency! I need help immediately.');
        setTriggered(true);
        setTimeout(() => setTriggered(false), 5000);
      } catch (err) {
        console.error(err);
      }
      setPressing(false);
    }, 3000);
    setTimer(t);
  };

  const handleMouseUp = () => {
    setPressing(false);
    if (timer) clearTimeout(timer);
  };

  return (
    <>
      <style>{`
        .sos-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 2000;
        }
        .sos-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--danger);
          color: white;
          border: none;
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.9rem;
          box-shadow: 0 4px 20px rgba(231,76,60,0.5);
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          position: relative;
          overflow: hidden;
        }
        .sos-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          transform: scale(0);
          transition: transform 3s linear;
        }
        .sos-btn.pressing::before { transform: scale(1); }
        .sos-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(231,76,60,0.6); }
        .sos-btn.triggered { background: var(--success); box-shadow: 0 4px 20px rgba(39,174,96,0.5); }
        .sos-pulse {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 3px solid var(--danger);
          animation: pulse 1.5s ease-out infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .sos-hint {
          position: absolute;
          bottom: 72px;
          right: 0;
          background: var(--text-main);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          white-space: nowrap;
          animation: fadeIn 0.2s ease;
        }
        .sos-hint::after {
          content: '';
          position: absolute;
          top: 100%;
          right: 20px;
          border: 6px solid transparent;
          border-top-color: var(--text-main);
        }
      `}</style>

      <div className="sos-fab">
        {pressing && <div className="sos-hint">Hold for 3 seconds to send SOS...</div>}
        {triggered && <div className="sos-hint" style={{ background: 'var(--success)' }}>✅ SOS Sent! Help is coming.</div>}
        <button
          className={`sos-btn ${pressing ? 'pressing' : ''} ${triggered ? 'triggered' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          title="Hold 3 seconds to trigger SOS"
        >
          <div className="sos-pulse"></div>
          {triggered ? '✓' : 'SOS'}
        </button>
      </div>
    </>
  );
}