import { useState } from 'react';
import { useSelector } from 'react-redux';
import Button from '../components/ui/Button';

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 py-4
                  border-b border-gray-100 last:border-0">
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer
                  rounded-full border-2 border-transparent transition-colors
                  duration-200 ease-in-out focus:outline-none
                  ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full
                        bg-white shadow transform ring-0 transition duration-200
                        ease-in-out
                        ${checked ? 'translate-x-5' : 'translate-x-0'}`}/>
    </button>
  </div>
);

const SettingsPage = () => {
  const { currentUser } = useSelector((s) => s.user);
  const [saved, setSaved]   = useState(false);

  // Notification preferences state
  const [settings, setSettings] = useState({
    emailNewAnnouncements: true,
    emailEventApproval:    true,
    emailEventReminder:    true,
    browserNotifications:  false,
    weeklyDigest:          false,
  });

  const toggle = (key) => setSettings((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    // In a real app this would call an API
    // For demo purposes we just show a success message
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account preferences and notifications
        </p>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200
                        text-green-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
          Settings saved successfully
        </div>
      )}

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          Account Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name',  value: `${currentUser?.firstName} ${currentUser?.lastName}` },
            { label: 'Email',      value: currentUser?.email },
            { label: 'Role',       value: currentUser?.role },
            { label: 'Status',     value: 'Active' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notification preferences */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0
                       00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0
                       .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          Notification Preferences
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Choose what updates you want to receive
        </p>

        <div className="space-y-0">
          <Toggle
            label="New Announcements"
            description="Get notified when a new campus announcement is posted"
            checked={settings.emailNewAnnouncements}
            onChange={() => toggle('emailNewAnnouncements')}
          />
          <Toggle
            label="Event Approval Updates"
            description="Receive email when your event is approved or rejected"
            checked={settings.emailEventApproval}
            onChange={() => toggle('emailEventApproval')}
          />
          <Toggle
            label="Event Reminders"
            description="Get a reminder email 24 hours before registered events"
            checked={settings.emailEventReminder}
            onChange={() => toggle('emailEventReminder')}
          />
          <Toggle
            label="Browser Notifications"
            description="Show desktop notifications for real-time updates"
            checked={settings.browserNotifications}
            onChange={() => toggle('browserNotifications')}
          />
          <Toggle
            label="Weekly Digest"
            description="Receive a weekly summary of upcoming events"
            checked={settings.weeklyDigest}
            onChange={() => toggle('weeklyDigest')}
          />
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} size="md">
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0
                       0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2
                       0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
            </svg>
          </div>
          Appearance
        </h2>
        <div className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Theme</p>
            <p className="text-xs text-gray-400 mt-0.5">Light theme is currently active</p>
          </div>
          <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
            Light ☀️
          </span>
        </div>
      </div>

      {/* About */}
      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
        <p className="text-sm font-semibold text-indigo-800">SLIIT EventHub</p>
        <p className="text-xs text-indigo-600 mt-1 leading-relaxed">
          Version 1.0.0 · IT3040 ITPM 2025 · Group 279<br/>
          Built with React, Node.js, MongoDB and Socket.IO
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
