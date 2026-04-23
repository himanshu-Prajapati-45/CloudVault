import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchStorageStatsApi } from '../../services/api';

export default function Sidebar({ isDark, onToggleTheme }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [storage, setStorage] = useState({ used_bytes: 0, limit_bytes: 10 * 1024 * 1024 * 1024, percentage: 0 });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await fetchStorageStatsApi();
                setStorage(stats);
            } catch (err) {
                console.error("Storage lookup failed", err);
            }
        };
        loadStats();
    }, []);

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-72 bg-[#0a0c10] border-r border-[#1f2130] flex flex-col transition-colors duration-200">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-8 border-b border-[#1e2030]">
                <div className="flex items-center gap-3">
                    <img src="/src/assets/logo.png" alt="CloudVault" className="w-10 h-10 rounded-xl object-contain" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#e8e9f0] to-[#8b8fa8]">CloudVault</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                <NavLink to="/dashboard" end className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${isActive ? 'bg-[#1e2235] text-[#7b9cff] shadow-sm shadow-[#4f6ef7]/10' : 'text-[#8b8fa8] hover:bg-[#1e2235] hover:text-[#e8e9f0]'}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                    My Files
                </NavLink>

                <NavLink to="/dashboard/recents" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${isActive ? 'bg-[#1e2235] text-[#7b9cff] shadow-sm shadow-[#4f6ef7]/10' : 'text-[#8b8fa8] hover:bg-[#1e2235] hover:text-[#e8e9f0]'}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Recents
                </NavLink>

                <NavLink to="/dashboard/shared" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${isActive ? 'bg-[#1e2235] text-[#7b9cff] shadow-sm shadow-[#4f6ef7]/10' : 'text-[#8b8fa8] hover:bg-[#1e2235] hover:text-[#e8e9f0]'}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    Shared
                </NavLink>

                <NavLink to="/dashboard/shared-links" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${isActive ? 'bg-[#1e2235] text-[#7b9cff] shadow-sm shadow-[#4f6ef7]/10' : 'text-[#8b8fa8] hover:bg-[#1e2235] hover:text-[#e8e9f0]'}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    Shared Links
                </NavLink>

                <NavLink to="/dashboard/trash" className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${isActive ? 'bg-[#1e2235] text-[#7b9cff] shadow-sm shadow-[#4f6ef7]/10' : 'text-[#8b8fa8] hover:bg-[#1e2235] hover:text-[#e8e9f0]'}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Trash
                </NavLink>
            </nav>

            <div className="mt-auto pt-6 flex flex-col gap-4">
                {/* Storage Quota */}
                <div className="bg-[#13151c] p-4 rounded-xl border border-[#1f2130] mx-4">
                    <p className="text-sm font-semibold text-[#e8e9f0] mb-1">Storage Usage</p>
                    <p className="text-xs text-[#8b8fa8] mb-3">{formatSize(storage.used_bytes)} of {formatSize(storage.limit_bytes)} used</p>
                    <div className="w-full bg-[#1e2030] rounded-full h-2 overflow-hidden mb-1">
                        <div className="bg-gradient-to-r from-[#4f6ef7] to-[#7b9cff] h-2 rounded-full" style={{ width: `${storage?.percentage || 0}%` }}></div>
                    </div>
                    <p className="text-[10px] text-[#555870] text-right">{Math.round(storage.percentage)}% Full</p>
                </div>

                <div className="border-t border-[#1e2030] pt-4 px-4 mb-4">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#8b8fa8] hover:text-[#e05c5c] hover:bg-[#e05c5c]/10 transition-colors">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}
