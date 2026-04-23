import React from 'react';
import { Shield } from 'lucide-react';

export default function StorageStatus({ usedGB, limitGB, usedPercent }) {
  return (
    <div className="mb-6 bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-xl p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#4f6ef7] rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-900 dark:text-[#e8e9f0]">Encrypted Storage</p>
            <p className="text-[11px] text-gray-500 dark:text-[#555870]">AES-256 encryption &bull; Local Storage</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:min-w-[280px]">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-500 dark:text-[#8b8fa8] uppercase tracking-wider">{usedGB} GB used</span>
              <span className="text-[10px] text-gray-500 dark:text-[#555870]">{limitGB} GB</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-[#1e2030] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#4f6ef7] to-[#7b9cff] rounded-full transition-all duration-700"
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
