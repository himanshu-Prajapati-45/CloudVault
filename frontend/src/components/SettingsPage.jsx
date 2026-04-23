import { useState, useEffect } from 'react';
import { User, Shield, Bell, HardDrive, Key, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { changePasswordApi } from '../services/api';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { storage } = useOutletContext();
  const [activeSection, setActiveSection] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [notifications, setNotifications] = useState([
    { id: 1, label: 'Email notifications', desc: 'Receive email alerts for file activity', enabled: true },
    { id: 2, label: 'Upload alerts', desc: 'Notify when files finish uploading', enabled: true },
    { id: 3, label: 'Storage warnings', desc: 'Alert when storage is nearly full', enabled: true },
    { id: 4, label: 'Share notifications', desc: 'Notify when files are shared with you', enabled: false },
  ]);
  const [sharing, setSharing] = useState([]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    await new Promise((r) => setTimeout(r, 800));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const toggleNotification = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePasswordApi(currentPassword, newPassword);
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User, desc: 'Manage your account information' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Password and authentication' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email and push preferences' },
    { id: 'storage', label: 'Storage', icon: HardDrive, desc: 'Manage your storage plan' },
  ];

  const usedGB = storage ? (storage.used_bytes / (1024 * 1024 * 1024)).toFixed(2) : '0';
  const limitGB = storage ? (storage.limit_bytes / (1024 * 1024 * 1024)).toFixed(0) : '10';
  const usedPct = storage ? Math.round(storage.percentage || (storage.used_bytes / storage.limit_bytes * 100)) : 0;
  const isGoogleUser = user?.auth_provider === 'google';

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-56 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-left ${
                    activeSection === section.id
                      ? 'bg-gray-900 text-white dark:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="text-sm">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeSection === 'profile' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-gray-900 dark:text-white mb-4 text-sm font-medium">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-300 dark:focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Sign-in Method</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={isGoogleUser ? 'Google' : 'Email'}
                      disabled
                      className="flex-1 h-10 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    />
                    {isGoogleUser && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-lg">Secure</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saveStatus === 'saving'}
                  className={`px-4 py-2 rounded-lg text-xs hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                    saveStatus === 'saved'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-60`}
                >
                  {saveStatus === 'saving' && (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {saveStatus === 'saved' && <span>&#10003;</span>}
                  {saveStatus === 'idle' && 'Save Changes'}
                  {saveStatus === 'saving' && 'Saving...'}
                  {saveStatus === 'saved' && 'Saved!'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-gray-900 dark:text-white text-sm font-medium">
                    {isGoogleUser ? 'Set Password' : 'Change Password'}
                  </h3>
                  {isGoogleUser && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  {isGoogleUser
                    ? 'Set a password to access your account even without Google. Otherwise, you can only sign in with Google.'
                    : 'Update your password regularly for better security'}
                </p>

                {passwordError && (
                  <div className="flex items-center gap-2 p-3 mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                    <AlertCircle size={13} />
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 mb-4 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <CheckCircle2 size={13} />
                    {passwordSuccess}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                  {!isGoogleUser && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                      {isGoogleUser ? 'New Password' : 'New Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        minLength={8}
                        className="w-full h-10 px-3 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-xs hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {passwordLoading && (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isGoogleUser ? 'Set Password' : 'Update Password'}
                  </button>
                </form>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-900 dark:text-white text-sm">Sign-in Methods</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {isGoogleUser
                        ? 'Your account is linked to Google. Set a password above to also sign in with email.'
                        : 'Your account uses email and password.'}
                    </p>
                  </div>
                  {isGoogleUser && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Google</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-gray-900 dark:text-white mb-1 text-sm font-medium">Notification Preferences</h3>
              <p className="text-xs text-gray-400 mb-6">Choose what alerts you receive</p>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <Bell size={14} className="text-gray-500 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{n.label}</p>
                        <p className="text-[10px] text-gray-400">{n.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleNotification(n.id)}
                      className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${
                        n.enabled ? 'bg-gray-900 dark:bg-gray-500 justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'storage' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-gray-900 dark:text-white mb-4 text-sm font-medium">Storage Usage</h3>
              <div className="mb-6">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl text-gray-900 dark:text-white">{usedGB} GB</span>
                  <span className="text-sm text-gray-400">of {limitGB} GB</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 dark:bg-gray-400 rounded-full"
                    style={{ width: `${Math.min(usedPct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">{usedPct}% used &bull; {formatBytes(storage?.used_bytes || 0)} of {formatBytes(storage?.limit_bytes || 0)}</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Files', size: usedGB + ' GB', pct: usedPct },
                  { label: 'Available', size: (parseFloat(limitGB) - parseFloat(usedGB)).toFixed(2) + ' GB', pct: 100 - usedPct },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-20">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 dark:bg-gray-500 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-400 w-16 text-right">{item.size}</span>
                  </div>
                ))}
              </div>
              <button className="mt-6 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Upgrade Plan
              </button>
            </div>
          )}

                  </div>
      </div>
    </div>
  );
}
