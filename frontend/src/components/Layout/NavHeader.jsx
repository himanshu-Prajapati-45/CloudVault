import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Search, Sun, Moon, Settings, LogOut } from 'lucide-react';

export default function NavHeader({
  isDark,
  setIsMobileMenuOpen,
  searchQuery,
  setSearchQuery,
  toggleTheme,
  showProfileMenu,
  setShowProfileMenu,
  getInitials,
  user,
  handleNav,
  handleLogout
}) {
  return (
    <header className={`h-14 flex items-center justify-between px-4 md:px-6 border-b flex-shrink-0 sticky top-0 z-20 transition-colors duration-200 ${isDark ? 'bg-[#0d0f14]/95 backdrop-blur-md border-[#1e2030]' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center gap-3">
        <button className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'text-[#8b8fa8] hover:bg-[#1e2235]' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="relative">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-[#555870]' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-40 md:w-56 lg:w-72 h-9 pl-9 pr-4 rounded-lg text-sm transition-all duration-300 ${isDark
              ? 'bg-[#1a1c26] border border-[#2a2d3e] text-[#e8e9f0] placeholder-[#555870] focus:outline-none focus:border-[#4f6ef7]'
              : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'text-[#8b8fa8] hover:text-[#e8e9f0] hover:bg-[#1e2235]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className={`hidden md:block h-5 w-px mx-1 ${isDark ? 'bg-[#1e2030]' : 'bg-gray-200'}`} />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1e2235]' : 'hover:bg-gray-100'}`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{getInitials(user?.name)}</span>
            </div>
            <span className={`text-xs hidden lg:inline ${isDark ? 'text-[#8b8fa8]' : 'text-gray-600'}`}>{user?.name || 'User'}</span>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className={`absolute right-0 top-11 w-56 rounded-xl shadow-xl z-50 overflow-hidden origin-top-right ${isDark ? 'bg-[#13151c] border border-[#1f2130] shadow-black/20' : 'bg-white border border-gray-100 shadow-gray-200/40'}`}
                >
                  <div className={`px-4 py-3 ${isDark ? 'border-[#1e2030]' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-bold">{getInitials(user?.name)}</span>
                      </div>
                      <div>
                        <p className={`text-sm leading-tight ${isDark ? 'text-[#e8e9f0]' : 'text-gray-900'}`}>{user?.name || 'User'}</p>
                        <p className={`text-[11px] leading-tight ${isDark ? 'text-[#8b8fa8]' : 'text-gray-500'}`}>Personal Account</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1.5">
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: 0.03 }}
                      onClick={() => handleNav('/dashboard/settings')}
                      className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-xs transition-colors cursor-pointer ${isDark ? 'text-[#8b8fa8] hover:bg-[#1e2235]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Settings size={14} className={isDark ? 'text-[#555870]' : 'text-gray-400'} />
                      Settings
                    </motion.button>
                  </div>
                  <div className={`border-t py-1.5 ${isDark ? 'border-[#1e2030]' : 'border-gray-100'}`}>
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: 0.09 }}
                      onClick={handleLogout}
                      className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-xs transition-colors cursor-pointer ${isDark ? 'text-[#e05c5c] hover:bg-[#e05c5c]/10' : 'text-red-500 hover:bg-red-50'}`}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
