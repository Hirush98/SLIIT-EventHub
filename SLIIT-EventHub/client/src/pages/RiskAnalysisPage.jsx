import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import Button from '../components/ui/Button';

// Stat card component (reused design from AdminDashboardPage)
const StatCard = ({ label, value, icon, color, subtext }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm
                  p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                     flex-shrink-0 ${color}`}>
      <svg className="w-6 h-6 text-white" fill="none"
           stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth="2" d={icon}/>
      </svg>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const RiskAnalysisPage = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchRiskAnalysis = async () => {
      try {
        setIsLoading(true);
        const res = await adminApi.getRiskAnalysis();
        if (res.success) {
          setData(res.data);
          setSummary(res.summary);
        }
      } catch (error) {
        console.error("Failed to load risk analysis", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRiskAnalysis();
  }, []);

  const filteredData = filter === 'All' 
    ? data 
    : data.filter(item => item.riskLevel === filter);

  // Stats setup based on summary
  const stats = [
    {
      label: 'Total Analyzed',
      value: summary?.totalAnalyzed || 0,
      color: 'bg-blue-500',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      label: 'High Risk',
      value: summary?.highRisk || 0,
      color: 'bg-red-500',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    {
      label: 'Medium Risk',
      value: summary?.mediumRisk || 0,
      color: 'bg-orange-400',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Low Risk',
      value: summary?.lowRisk || 0,
      color: 'bg-green-500',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Risky Users Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Identify and monitor organizers based on their event behavior
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Filters Header */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-800">Organizer Risk Reports</h2>
          <div className="flex gap-2">
            {['All', 'High', 'Medium', 'Low'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors border
                  ${filter === level
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {level} {level !== 'All' ? 'Risk' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"/>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">No organizers found in this category.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Organizer</th>
                  <th className="px-6 py-4 font-medium text-center">Total Events</th>
                  <th className="px-6 py-4 font-medium text-center">Rejected</th>
                  <th className="px-6 py-4 font-medium text-center">Cancelled</th>
                  <th className="px-6 py-4 font-medium text-center">Conflicts</th>
                  <th className="px-6 py-4 font-medium" style={{ width: '150px' }}>Risk Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50/50 transition-colors">
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold overflow-hidden flex-shrink-0">
                          {user.profilePhoto ? (
                            <img src={user.profilePhoto} alt={user.firstName} className="w-full h-full object-cover" />
                          ) : (
                            user.firstName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Stats */}
                    <td className="px-6 py-4 text-center font-medium text-gray-700">{user.totalEvents}</td>
                    <td className="px-6 py-4 text-center text-red-600">{user.rejectedCount}</td>
                    <td className="px-6 py-4 text-center text-orange-500">{user.cancelledCount}</td>
                    <td className="px-6 py-4 text-center text-yellow-600">{user.conflictCount}</td>
                    
                    {/* Score Bar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700 w-6 text-right">{user.riskScore}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              user.riskLevel === 'High' ? 'bg-red-500' :
                              user.riskLevel === 'Medium' ? 'bg-orange-400' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(user.riskScore, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    {/* Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${user.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                          user.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                        {user.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysisPage;
