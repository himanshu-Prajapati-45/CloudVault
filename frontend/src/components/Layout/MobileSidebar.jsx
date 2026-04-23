import React from 'react';
import { X, ChevronRight } from 'lucide-react';

export default function MobileSidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isDark,
  navItems,
  handleNav,
  isActive,
  storagePct,
  formatSize,
  storage
}) {
  return (
    <aside className={`w-[260px] flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:hidden ${
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    } ${isDark ? 'bg-[#0a0c10] border-r border-[#1f2130]' : 'bg-white border-r border-gray-200'}`}>
      <div className={`h-14 flex items-center px-5 gap-3 flex-shrink-0 border-b ${isDark ? 'border-[#1e2030]' : 'border-gray-200'}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
          <img src="/src/assets/logo.png" alt="CloudVault" className="w-full h-full object-cover rounded-xl" />
        </div>
        <span className={`tracking-tight font-semibold ${isDark ? 'text-[#e8e9f0]' : 'text-gray-900'}`}>CloudVault</span>
        <button className={`ml-auto transition-colors ${isDark ? 'text-[#555870] hover:text-[#e8e9f0]' : 'text-gray-400 hover:text-gray-600'}`} onClick={() => setIsMobileMenuOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
        <p className={`px-3 mb-2 text-[10px] uppercase tracking-widest ${isDark ? 'text-[#555870]' : 'text-gray-400'}`}>Storage</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${active ? isDark ? 'bg-[#1e2235] text-[#7b9cff]' : 'bg-indigo-50 text-indigo-600' : isDark ? 'text-[#8b8fa8] hover:text-[#e8e9f0] hover:bg-[#1e2235]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          );
        })}
      </nav>

      <div className={`px-3 mb-3 rounded-xl p-4 border ${isDark ? 'bg-[#13151c] border-[#1f2130]' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs ${isDark ? 'text-[#8b8fa8]' : 'text-gray-600'}`}>Storage Used</span>
          <span className={`text-xs ${isDark ? 'text-[#e8e9f0]' : 'text-gray-900'}`}>{storagePct}%</span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#1e2030]' : 'bg-gray-200'}`}>
          <div className="h-full bg-gradient-to-r from-[#4f6ef7] to-[#7b9cff] rounded-full" style={{ width: `${storagePct}%` }} />
        </div>
        <p className={`text-[10px] mt-2 ${isDark ? 'text-[#555870]' : 'text-gray-400'}`}>{formatSize(storage.used_bytes)} of {formatSize(storage.limit_bytes)}</p>
      </div>
    </aside>
  );
}
