import { Link } from 'react-router-dom';

const PageFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-400 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                       a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <span className="font-bold text-white text-sm">SLIIT EventHub</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              A real-time event management platform for SLIIT students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1.5">
              {[
                { to: '/home',          label: 'Home' },
                { to: '/events',        label: 'Events' },
                { to: '/announcements', label: 'Announcements' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-2">Contact</h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0
                       002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                hirush.k2@gmail.com
              </li>
              <li className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827
                       0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                SLIIT, Malabe
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-5 pt-4 flex flex-col sm:flex-row
                        justify-between items-center gap-1 text-xs text-gray-600">
          <p>&copy; {year} SLIIT EventHub — IT3040 ITPM Group 279</p>
          <p>React · Node.js · MongoDB</p>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
