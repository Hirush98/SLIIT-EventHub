import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import SideNav from './SideNav';
import PageFooter from './PageFooter';

// AppShell = the wrapper that holds NavBar + SideNav + main content + Footer
// Every protected page renders inside this shell
const AppShell = () => {
  // Controls whether sidebar is open on mobile
  const [sideNavOpen, setSideNavOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Top navigation bar — always visible */}
      <NavBar onMenuClick={() => setSideNavOpen(true)} />

      {/* Body = sidebar + main content side by side */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <SideNav
          isOpen={sideNavOpen}
          onClose={() => setSideNavOpen(false)}
        />

        {/* Main content area — scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
            {/* Outlet renders whichever page is matched by the route */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <PageFooter />
    </div>
  );
};

export default AppShell;
