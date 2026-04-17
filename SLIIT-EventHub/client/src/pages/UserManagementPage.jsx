import { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';
import Button   from '../components/ui/Button';

const ROLE_STYLES = {
  admin:       'bg-red-100    text-red-700',
  organizer:   'bg-indigo-100 text-indigo-700',
  participant: 'bg-green-100  text-green-700',
};

const ROLES = ['participant', 'organizer', 'admin'];

const UserManagementPage = () => {
  const [users,      setUsers]      = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [total,      setTotal]      = useState(0);
  const [toast,      setToast]      = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { limit: 50 };
      if (search)              params.search = search;
      if (roleFilter !== 'all') params.role  = roleFilter;
      const res = await adminApi.getAllUsers(params);
      setUsers(res.data  || []);
      setTotal(res.total || 0);
    } catch { /* fail silently */ }
    finally { setIsLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Change user role
  const handleRoleChange = async (userId, newRole) => {
    setActionLoading((p) => ({ ...p, [userId]: true }));
    try {
      const res = await adminApi.changeUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: res.data.role } : u));
      showToast(`Role updated to ${newRole} ✅`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    setActionLoading((p) => ({ ...p, [`s_${userId}`]: true }));
    try {
      const res = await adminApi.toggleUserStatus(userId, newStatus);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: res.data.isActive } : u));
      showToast(`User ${newStatus ? 'activated' : 'deactivated'} ✅`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading((p) => ({ ...p, [`s_${userId}`]: false }));
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? 'Loading...' : `${total} user${total !== 1 ? 's' : ''} registered`}
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="px-4 py-3 rounded-xl bg-gray-800 text-white text-sm">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4
                      flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                          text-gray-400 pointer-events-none"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300
                       text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Role filter */}
        <div className="flex gap-2">
          {['all', ...ROLES].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize
                         transition-colors
                         ${roleFilter === r
                           ? 'bg-gray-800 text-white'
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600
                            rounded-full animate-spin"/>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-400 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors
                                                ${!user.isActive ? 'opacity-50' : ''}`}>
                    {/* User info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center
                                        justify-center text-indigo-700 text-xs font-bold
                                        flex-shrink-0 uppercase">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={!!actionLoading[user.id]}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg
                                   border-0 cursor-pointer capitalize
                                   focus:outline-none focus:ring-2 focus:ring-indigo-300
                                   ${ROLE_STYLES[user.role] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r} className="bg-white text-gray-800">
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Joined date */}
                    <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1
                                       rounded-full text-xs font-medium
                                       ${user.isActive
                                         ? 'bg-green-100 text-green-700'
                                         : 'bg-red-100   text-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full
                                         ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}/>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Activate / Deactivate */}
                    <td className="px-4 py-3">
                      <Button
                        variant={user.isActive ? 'danger' : 'secondary'}
                        size="sm"
                        isLoading={!!actionLoading[`s_${user.id}`]}
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
