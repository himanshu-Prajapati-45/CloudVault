import React from 'react';
import { Clock, Upload } from 'lucide-react';

export default function RecentActivity({ files, onSelectFile }) {
  return (
    <div className="bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-gray-900 dark:text-[#e8e9f0] flex items-center gap-2">
          <Clock size={14} className="text-gray-400 dark:text-[#555870]" />
          Recent Activity
        </h3>
        <span className="text-[10px] text-gray-500 dark:text-[#555870] uppercase tracking-wider">Today</span>
      </div>
      <div className="space-y-1">
        {files.slice(0, 4).map((file) => (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e2235] transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[#1e2235] group-hover:bg-gray-200 dark:group-hover:bg-[#1a1c26] flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
              <Upload size={12} className="text-gray-400 dark:text-[#555870]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-[#8b8fa8] leading-relaxed">
                <span className="text-gray-900 dark:text-[#e8e9f0]">You</span>{' '}
                uploaded{' '}
                <span className="text-gray-500 dark:text-[#8b8fa8] truncate underline decoration-gray-200 dark:decoration-[#1e2030] underline-offset-2 group-hover:text-gray-900 dark:group-hover:text-[#e8e9f0] group-hover:decoration-gray-300 dark:group-hover:decoration-[#555870] transition-colors">{file.name}</span>
              </p>
              <p className="text-[10px] text-gray-500 dark:text-[#555870] mt-0.5">{file.date}</p>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-[#555870] text-center py-6">No recent activity</p>
        )}
      </div>
    </div>
  );
}
