import { useState, useEffect, useRef } from 'react';

const INDIAN_LANGUAGES = [
  { code: 'hi', label: 'हिंदी', name: 'Hindi' },
  { code: 'te', label: 'తెలుగు', name: 'Telugu' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ml', label: 'മലയാളം', name: 'Malayalam' },
  { code: 'mr', label: 'मराठी', name: 'Marathi' },
  { code: 'bn', label: 'বাংলা', name: 'Bengali' },
  { code: 'gu', label: 'ગુજરાતી', name: 'Gujarati' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
  { code: 'ur', label: 'اردو', name: 'Urdu' },
];

const OTHER_LANGUAGES = [
  { code: 'en', label: 'English', name: 'English' },
  { code: 'ar', label: 'العربية', name: 'Arabic' },
  { code: 'zh-CN', label: '中文', name: 'Chinese' },
  { code: 'fr', label: 'Français', name: 'French' },
  { code: 'de', label: 'Deutsch', name: 'German' },
  { code: 'ja', label: '日本語', name: 'Japanese' },
  { code: 'es', label: 'Español', name: 'Spanish' },
];

const ALL_LANGS = [...INDIAN_LANGUAGES, ...OTHER_LANGUAGES];

export default function TranslateWidget() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const ref = useRef(null);

  useEffect(() => {
    // Inject aggressive banner-hiding styles
    const style = document.createElement('style');
    style.id = 'gt-hide-styles';
    style.textContent = `
      .goog-te-banner-frame,
      .goog-te-banner-frame.skiptranslate,
      #goog-gt-tt,
      .goog-te-balloon-frame,
      div#goog-gt-,
      .goog-tooltip,
      .goog-tooltip:hover,
      .goog-text-highlight,
      .goog-te-gadget-simple,
      .goog-te-menu-value,
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
      .VIpgJd-ZVi9od-aZ2wEe-OiiCO,
      .skiptranslate {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      body {
        top: 0 !important;
        position: static !important;
      }
      .goog-te-gadget {
        height: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);

    // Load Google Translate script
    if (!document.getElementById('gt-script')) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', autoDisplay: false },
          'gt-mount'
        );
      };
      const script = document.createElement('script');
      script.id = 'gt-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.head.appendChild(script);
    }

    // Keep hiding the banner even if it re-appears
    const observer = new MutationObserver(() => {
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) banner.style.cssText = 'display:none!important;height:0!important;';
      document.body.style.top = '0';
      document.body.style.position = 'static';
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeLang = (lang) => {
    setCurrent(lang.code);
    setOpen(false);

    if (lang.code === 'en') {
      // Reset to English
      document.cookie = 'googtrans=/en/en; path=/';
      document.cookie = `googtrans=/en/en; path=/; domain=.${location.hostname}`;
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
      } else {
        window.location.reload();
      }
      return;
    }

    // Set cookie
    document.cookie = `googtrans=/en/${lang.code}; path=/`;
    document.cookie = `googtrans=/en/${lang.code}; path=/; domain=.${location.hostname}`;

    // Trigger translate
    const attempt = (tries = 0) => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang.code;
        select.dispatchEvent(new Event('change'));
        // Force hide banner again after translation
        setTimeout(() => {
          const banner = document.querySelector('.goog-te-banner-frame');
          if (banner) banner.style.cssText = 'display:none!important;';
          document.body.style.top = '0';
        }, 500);
      } else if (tries < 20) {
        setTimeout(() => attempt(tries + 1), 300);
      }
    };
    attempt();
  };

  const currentLang = ALL_LANGS.find(l => l.code === current);

  return (
    <>
      <style>{`
        .tw-wrap { position: relative; }
        .tw-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 20px; cursor: pointer;
          font-family: var(--font-body); font-size: 0.85rem;
          font-weight: 500; color: var(--text-main);
          transition: var(--transition); white-space: nowrap;
          user-select: none;
        }
        .tw-btn:hover { border-color: var(--primary); background: #FFFBF0; }
        .tw-menu {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: 0 8px 32px rgba(0,0,0,0.14);
          width: 220px; z-index: 99999;
          max-height: 400px; overflow-y: auto;
          animation: twFade 0.15s ease;
        }
        @keyframes twFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tw-section {
          padding: 7px 14px 5px;
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--text-light); background: var(--bg);
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 1;
        }
        .tw-item {
          padding: 10px 16px; cursor: pointer;
          font-size: 0.88rem; color: var(--text-main);
          transition: background 0.15s;
          display: flex; align-items: center; justify-content: space-between;
        }
        .tw-item:hover { background: var(--bg); }
        .tw-item.active { background: #FFF9E6; font-weight: 700; }
        .tw-item.active::after { content: '✓'; color: var(--secondary); font-size: 0.8rem; }
        .tw-divider { height: 1px; background: var(--border); }
      `}</style>

      {/* Hidden Google Translate mount - totally invisible */}
      <div id="gt-mount" style={{
        position: 'absolute', width: 0, height: 0,
        overflow: 'hidden', opacity: 0, pointerEvents: 'none'
      }} />

      <div className="tw-wrap" ref={ref}>
        <button className="tw-btn" onClick={() => setOpen(o => !o)}>
          🌐 {currentLang?.label || 'Language'}
          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>▾</span>
        </button>

        {open && (
          <div className="tw-menu">
            <div className="tw-section">🇮🇳 Indian Languages</div>
            {INDIAN_LANGUAGES.map(l => (
              <div key={l.code}
                className={`tw-item ${current === l.code ? 'active' : ''}`}
                onClick={() => changeLang(l)}>
                <span>{l.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{l.name}</span>
              </div>
            ))}
            <div className="tw-divider" />
            <div className="tw-section">🌍 Other Languages</div>
            {OTHER_LANGUAGES.map(l => (
              <div key={l.code}
                className={`tw-item ${current === l.code ? 'active' : ''}`}
                onClick={() => changeLang(l)}>
                <span>{l.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{l.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}