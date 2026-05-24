export default function About() {
  return (
    <>
      <style>{`
        .about-hero {
          background: linear-gradient(135deg, #2D2D2D 0%, #1a1a1a 100%);
          color: white;
          padding: 64px 32px;
          text-align: center;
        }
        .about-hero-icon {
          width: 80px; height: 80px;
          background: var(--primary);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 40px;
          margin: 0 auto 24px;
        }
        .about-hero-title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .about-hero-sub { color: rgba(255,255,255,0.7); font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
        .about-body { padding: 48px 32px; max-width: 900px; margin: 0 auto; }
        .about-section { margin-bottom: 48px; }
        .about-section-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 12px;
        }
        .about-text { color: var(--text-secondary); line-height: 1.8; font-size: 1rem; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 24px; }
        .feature-card {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 24px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
        .feature-icon { font-size: 2rem; margin-bottom: 12px; }
        .feature-title { font-weight: 700; margin-bottom: 8px; font-family: var(--font-display); }
        .feature-desc { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; }
        .tech-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .tech-tag {
          padding: 6px 14px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
      `}</style>

      <div className="about-hero">
        <div className="about-hero-icon">🛡️</div>
        <h1 className="about-hero-title">GuardianGo</h1>
        <p className="about-hero-sub">Your digital travel safety companion — combining maps, community, and emergency support into one platform.</p>
      </div>

      <div className="about-body">
        <div className="about-section">
          <h2 className="about-section-title">🎯 Our Mission</h2>
          <p className="about-text">GuardianGo was built to solve a real problem — travelers often face unsafe routes, isolated areas, and emergency situations without access to reliable safety information. We bridge the gap between navigation and personal safety by focusing not just on where you travel, but how safely you can get there.</p>
        </div>

        <div className="about-section">
          <h2 className="about-section-title">✨ Core Features</h2>
          <div className="features-grid">
            {[
              { icon: '🗺️', title: 'Safe Route Mapping', desc: 'Interactive map with color-coded safety zones — green, orange, and red — so you instantly understand risk levels.' },
              { icon: '🚨', title: 'SOS Emergency System', desc: 'Hold the SOS button for 3 seconds to instantly alert your emergency contacts via SMS and email with your live location.' },
              { icon: '👥', title: 'Community Reports', desc: 'Real community-driven safety reports with upvotes and downvotes to validate accuracy.' },
              { icon: '🔔', title: 'Real-time Alerts', desc: 'Live alerts pushed instantly to your city feed via WebSocket — no refresh needed.' },
              { icon: '🧭', title: 'Travel Buddy Check-in', desc: 'Set a destination and check-in interval. If you miss a check-in, your contacts are notified.' },
              { icon: '🌡️', title: 'Safety Score', desc: 'Every area gets a dynamic 1–10 safety score calculated from community reports within 2km.' },
            ].map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section">
          <h2 className="about-section-title">💻 Technology Stack</h2>
          <p className="about-text">Built with modern, open-source technologies for reliability and scalability.</p>
          <div className="tech-tags">
            {['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Leaflet.js', 'OpenStreetMap', 'JWT Auth', 'Twilio SMS', 'Nodemailer', 'Vite', 'Google Translate'].map(t => (
              <span className="tech-tag" key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}