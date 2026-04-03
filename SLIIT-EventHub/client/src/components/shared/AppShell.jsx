import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

// AppShell — wraps all protected pages
// No sidebar — navigation is handled entirely by NavBar
const AppShell = () => (
  <div className="flex min-h-screen flex-col">
    <NavBar />
    <main className="relative flex-1">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(26,79,156,0.08),transparent_62%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppShell;
