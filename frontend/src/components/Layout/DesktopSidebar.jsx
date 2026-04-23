import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export default function DesktopSidebar({
  EXPANDED_W,
  COLLAPSED_W,
  expanded,
  onMouseEnter,
  onMouseLeave,
  isDark,
  navItems,
  isActive,
  handleNav,
  storagePct,
  formatSize,
  storage
}) {
  return (
    <motion.aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-40 border-r overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#0a0c10] border-[#1f2130]' : 'bg-white border-gray-200'
      }`}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`h-14 flex items-center px-5 gap-3 flex-shrink-0 border-b ${isDark ? 'border-[#1e2030]' : 'border-gray-200'}`}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
          <img src="/src/assets/logo.png" alt="CloudVault" className="w-full h-full object-cover rounded-xl" />
        </div>
        <motion.span
          animate={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : -8 }}
          transition={{ duration: 0.2, delay: expanded ? 0.08 : 0 }}
          className={`tracking-tight whitespace-nowrap overflow-hidden font-semibold ${isDark ? 'text-[#e8e9f0]' : 'text-gray-900'}`}
        >
          CloudVault
        </motion.span>
      </motion.div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-4 space-y-1 overflow-y-auto overflow-x-hidden">
        <motion.p
          animate={{ opacity: expanded ? 1 : 0, height: expanded ? 'auto' : 0 }}
          transition={{ duration: 0.2 }}
          className={`px-3 mb-2 text-[10px] uppercase tracking-widest whitespace-nowrap overflow-hidden ${isDark ? 'text-[#555870]' : 'text-gray-400'}`}
        >
          Storage
        </motion.p>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ x: active ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNav(item.path)}
              className={`flex items-center w-full gap-3 rounded-lg transition-colors cursor-pointer relative ${expanded ? 'px-3 py-2.5 justify-start' : 'px-0 py-2.5 justify-center'} ${
                active
                  ? isDark ? 'text-[#7b9cff]' : 'text-indigo-600'
                  : isDark ? 'text-[#8b8fa8] hover:text-[#e8e9f0] hover:bg-[#1e2235]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNavBg"
                  className={`absolute inset-0 rounded-lg shadow-sm ${isDark ? 'bg-[#1e2235]' : 'bg-indigo-50'}`}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-3 w-full ${expanded ? 'justify-start' : 'justify-center'}`}>
                <Icon size={18} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
                <motion.span
                  animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
                  transition={{ duration: 0.18, delay: expanded ? 0.06 : 0 }}
                  className="text-sm whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
                {active && expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 0.5, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="ml-auto"
                  >
                    <ChevronRight size={14} />
                  </motion.span>
                )}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Storage Usage */}
      <div className="px-2 mb-3 flex justify-center">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="expanded-storage"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full px-1 overflow-hidden"
            >
              <div className={`rounded-xl p-4 border ${isDark ? 'bg-[#13151c] border-[#1f2130]' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs whitespace-nowrap ${isDark ? 'text-[#8b8fa8]' : 'text-gray-600'}`}>Storage Used</span>
                  <span className={`text-xs ${isDark ? 'text-[#e8e9f0]' : 'text-gray-900'}`}>{storagePct}%</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#1e2030]' : 'bg-gray-200'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePct}%` }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="h-full bg-gradient-to-r from-[#4f6ef7] to-[#7b9cff] rounded-full"
                  />
                </div>
                <p className={`text-[10px] mt-2 whitespace-nowrap ${isDark ? 'text-[#555870]' : 'text-gray-400'}`}>
                  {formatSize(storage.used_bytes)} of {formatSize(storage.limit_bytes)}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-storage"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center justify-center"
            >
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke={isDark ? '#1e2030' : '#e5e7eb'} strokeWidth="3" />
                  <motion.circle
                    cx="20" cy="20" r="16" fill="none" stroke="url(#storageGradientDark)" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - storagePct / 100) }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                  <defs>
                    <linearGradient id="storageGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4f6ef7" />
                      <stop offset="100%" stopColor="#7b9cff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-[8px] ${isDark ? 'text-[#8b8fa8]' : 'text-gray-500'}`}>{storagePct}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
