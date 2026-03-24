import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// ── Stat card component ────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
      </svg>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Quick action card ──────────────────────────────────────
const ActionCard = ({ to, label, description, icon }) => (
  <Link to={to}
        className="bg-white rounded-xl border border-gray-200 p-5
                   hover:border-gray-300 hover:shadow-sm transition-all group">
    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center
                    justify-center mb-3 group-hover:bg-gray-200 transition-colors">
      <svg className="w-5 h-5 text-gray-600" fill="none"
           stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
      </svg>
    </div>
    <p className="text-sm font-semibold text-gray-800">{label}</p>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </Link>
);

// ── Main HomePage ──────────────────────────────────────────
const HomePage = () => {
  const { currentUser } = useSelector((s) => s.user);
  const isOrganizer     = currentUser?.role === 'organizer';
  const isAdmin         = currentUser?.role === 'admin';

  const currentHour     = new Date().getHours();
  const greeting        = currentHour < 12 ? 'Good morning'
                        : currentHour < 18 ? 'Good afternoon'
                        : 'Good evening';

  return (
    <div className="space-y-8">

      {/* Welcome banner */}
      <div className="bg-gray-800 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center
                        md:justify-between gap-4">
          <div>
            <p className="text-gray-400 text-sm">{greeting}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              Welcome back, {currentUser?.firstName}! 👋
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Here is what is happening on campus today.
            </p>
          </div>

          {/* Role badge */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5
                             bg-gray-700 rounded-full text-xs font-medium
                             text-gray-300 capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"/>
              {currentUser?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase
                       tracking-wider mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Events"       value="—"
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            color="bg-gray-700" />
          <StatCard label="Upcoming Events"    value="—"
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            color="bg-gray-600" />
          <StatCard label="Registered Events"  value="—"
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            color="bg-gray-500" />
          <StatCard label="Announcements"      value="—"
            icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            color="bg-gray-400" />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Stats will load once backend is fully connected.
        </p>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase
                       tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <ActionCard
            to="/events"
            label="Browse Events"
            description="View and register for upcoming campus events"
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />

          <ActionCard
            to="/announcements"
            label="Announcements"
            description="Stay updated with the latest campus news"
            icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />

          <ActionCard
            to="/profile"
            label="My Profile"
            description="View and update your account details"
            icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />

          {/* Only organizers and admins see this */}
          {(isOrganizer || isAdmin) && (
            <ActionCard
              to="/events/create"
              label="Create Event"
              description="Schedule a new event for SLIIT students"
              icon="M12 4v16m8-8H4"
            />
          )}

          {/* Only admins see this */}
          {isAdmin && (
            <ActionCard
              to="/admin"
              label="Admin Dashboard"
              description="Manage users, events and system settings"
              icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
