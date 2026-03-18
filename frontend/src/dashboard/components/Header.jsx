import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onSearch }) {
    const [isDark, setIsDark] = useState(false);
    const { user } = useAuth();

    // Calculate initials
    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return "US";
        const trimmed = name.trim();
        if (!trimmed) return "US";
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return trimmed.substring(0, 2).toUpperCase();
    };

    // Initial check for dark mode on mount
    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="h-20 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
            <div className="relative w-96 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search files, folders..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 border border-transparent dark:border-slate-700 text-slate-900 dark:text-slate-200 text-sm rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                />
            </div>

            <div className="flex items-center gap-5">
                {/* Theme Toggle Button */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Toggle Theme"
                >
                    {isDark ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    )}
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 transition-colors duration-300"></div>
                <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border-2 border-white dark:border-slate-700 flex items-center justify-center text-white font-bold select-none shadow-md transition-colors duration-300">
                        {getInitials(user?.name)}
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Personal Account</p>
                    </div>
                </button>
            </div>
        </header>
    );
}