import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function StatsOverview({ stats }) {
  return (
    <div className="lg:col-span-2 grid grid-cols-2 gap-3 md:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-xl p-4 md:p-5 shadow-sm hover:border-gray-300 dark:hover:border-[#2a2d3e] transition-all duration-300 cursor-default group relative overflow-hidden"
          >
            <div className="absolute -right-3 -top-3 w-16 h-16 bg-[#4f6ef7] rounded-full opacity-[0.08] group-hover:opacity-[0.15] transition-all duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-gray-100 dark:bg-[#1e2235] rounded-lg flex items-center justify-center group-hover:bg-[#4f6ef7] group-hover:text-white transition-all duration-300">
                  <Icon size={16} className="text-gray-400 dark:text-[#8b8fa8] group-hover:text-white transition-colors duration-300" />
                </div>
                {stat.trend === 'up' && (
                  <TrendingUp size={14} className="text-gray-400 dark:text-[#555870] group-hover:text-[#8b8fa8] transition-colors" />
                )}
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-[#555870] uppercase tracking-wider mb-1 group-hover:text-[#8b8fa8] transition-colors">
                {stat.label}
              </p>
              <p className="text-xl md:text-2xl text-gray-900 dark:text-[#e8e9f0] mb-1 tracking-tight">{stat.value}</p>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-[#555870]">{stat.change}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
