import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

// AppShell — wraps all protected pages
// No sidebar — navigation is handled entirely by NavBar
const AppShell = () => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <NavBar />
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppShell;