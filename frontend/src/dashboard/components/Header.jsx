import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onSearch, isDark, onToggleTheme }) {
    const [search, setSearch] = useState("");
    const { user } = useAuth();

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return "US";
        const trimmed = name.trim();
        if (!trimmed) return "US";
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return trimmed.substring(0, 2).toUpperCase();
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    return (
        <header className={`h-20 px-8 flex items-center justify-between transition-colors duration-200 ${
            isDark
                ? 'bg-[#0d0f14]/95 backdrop-blur-md border-b border-[#1e2030]'
                : 'bg-white border-b border-gray-100'
        }`}>
            <div className="relative w-96 group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                    isDark ? 'text-[#555870] group-focus-within:text-[#4f6ef7]' : 'text-gray-400 group-focus-within:text-indigo-500'
                }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search files, folders..."
                    value={search}
                    onChange={handleSearchChange}
                    className={`w-full transition-all focus:outline-none pr-4 ${
                        isDark
                            ? 'bg-[#1a1c26] border border-[#2a2d3e] text-[#e8e9f0] placeholder-[#555870] focus:border-[#4f6ef7] focus:ring-1 focus:ring-[#4f6ef7] rounded-full pl-11 py-2.5 text-sm'
                            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 rounded-full pl-11 py-2.5 text-sm'
                    }`}
                />
            </div>

            <div className="flex items-center gap-5">
                {/* Theme Toggle Button */}
                <button
                    onClick={onToggleTheme}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1e2235] transition-colors ${
                        isDark ? 'text-[#8b8fa8] hover:text-[#e8e9f0]' : 'text-gray-500 hover:text-gray-900'
                    }`}
                    title="Toggle Theme"
                >
                    {isDark ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    )}
                </button>

                <div className={`h-8 w-px ${isDark ? 'bg-[#1e2030]' : 'bg-gray-200'}`}></div>
                <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border-2 flex items-center justify-center text-white font-bold select-none shadow-md transition-colors duration-200 ${isDark ? 'border-[#1f2130]' : 'border-white'}`}>
                        {getInitials(user?.name)}
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className={`text-sm font-medium transition-colors duration-200 ${isDark ? 'text-[#e8e9f0]' : 'text-gray-900'}`}>{user?.name || "User"}</p>
                        <p className={`text-xs transition-colors duration-200 ${isDark ? 'text-[#8b8fa8]' : 'text-gray-500'}`}>Personal Account</p>
                    </div>
                </button>
            </div>
        </header>
    );
}
