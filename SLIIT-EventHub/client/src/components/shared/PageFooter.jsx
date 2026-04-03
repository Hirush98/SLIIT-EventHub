import { Link } from 'react-router-dom';

const PageFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f3560 0%, #1a4f7f 60%, #154070 100%)',
      color: 'rgba(255,255,255,0.85)',
      borderTop: '1px solid rgba(240,180,41,0.20)',
      marginTop: 'auto',
    }}>
      {/* Gold accent line */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, #f0b429 30%, #f5c84a 50%, #f0b429 70%, transparent 100%)',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
        }}>

          {/* Brand */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
            }}>
              <img
                src="/sliit-logo.png"
                alt="SLIIT Logo"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain',
                }}
              />
              <span style={{
                fontWeight: '600',
                color: '#ffffff',
                fontSize: '0.95rem',
              }}>SLIIT EventHub</span>
            </div>
            <p style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.60)',
              lineHeight: '1.5',
              margin: 0,
            }}>
              Campus event management platform by SLIIT IT3040 ITPM Group 279.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Quick Links</h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              {[
                { to: '/home', label: 'Home' },
                { to: '/events', label: 'Events' },
                { to: '/announcements', label: 'Announcements' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.65)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f0b429'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Contact</h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.65)',
              }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                hirush.k2@gmail.com
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.65)',
              }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                SLIIT, Malabe
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          borderTop: '1px solid rgba(240,180,41,0.15)',
          paddingTop: '0.75rem',
          marginTop: '1rem',
        }}>
          {/* Bottom info */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '4px',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.50)',
          }}>
            <p style={{ margin: 0 }}>
              &copy; {year} SLIIT EventHub — IT3040 ITPM Group 279
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: '#f0b429' }}>•</span> React · Node.js · MongoDB <span style={{ color: '#f0b429' }}>•</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
