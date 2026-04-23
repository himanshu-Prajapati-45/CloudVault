import React from 'react';
import {
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react';

export default function FileListView({
  files,
  selectedIds,
  toggleSelect,
  allSelected,
  toggleSelectAll,
  setSelectedFile,
  getFileIcon,
  formatBytes,
  isShared,
  isTrash,
  handleRestoreFile,
}) {
  return (
    <div className="bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-11 px-5 py-3 bg-gray-100 dark:bg-[#1e2235] border-b border-gray-200 dark:border-[#1f2130] text-[11px] text-gray-500 dark:text-[#555870] uppercase tracking-wider">
        <div className="col-span-4 flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
          </button>
          <span>Name</span>
        </div>
        <div className="col-span-2">{isShared ? 'Shared By' : 'Type'}</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-1 text-right">{isTrash && 'Action'}</div>
      </div>

      {files.map((file) => {
        const isSelected = selectedIds.has(file.id);
        return (
          <div
            key={file.id}
            className={`grid grid-cols-1 md:grid-cols-11 items-center px-5 py-3 border-b border-gray-100 dark:border-[#1f2130] last:border-0 hover:bg-gray-50 dark:hover:bg-[#1e2235]/50 transition-colors group ${isSelected ? 'bg-indigo-50/30 dark:bg-[#1e2235]' : ''}`}
          >
            <div className="col-span-4 flex items-center gap-3 min-w-0">
              <button
                onClick={() => toggleSelect(file.id)}
                className={`transition-all ${isSelected ? 'text-[#4f6ef7] opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600'}`}
              >
                {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
              </button>
              <div
                onClick={() => setSelectedFile(file)}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1e2235] flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-[#1a1c26] transition-colors cursor-pointer"
              >
                {getFileIcon(file.type, 16)}
              </div>
              <p
                onClick={() => setSelectedFile(file)}
                className={`text-sm font-medium truncate cursor-pointer ${isTrash ? 'text-gray-400 dark:text-[#555870] line-through' : 'text-gray-900 dark:text-[#e8e9f0]'}`}
              >
                {file.name}
              </p>
            </div>

            <div
              onClick={() => setSelectedFile(file)}
              className="w-full flex md:contents gap-4 pl-12 md:pl-0 text-xs md:text-sm"
            >
              {isShared ? (
                <div className="md:col-span-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-[#1e2235] flex-shrink-0 hidden md:flex items-center justify-center">
                    <span className="text-[8px] text-gray-500 dark:text-[#555870]">{(file.sharedBy || 'U')[0]}</span>
                  </div>
                  <span className="text-gray-500 dark:text-[#8b8fa8]">{file.sharedBy}</span>
                </div>
              ) : (
                <div className="md:col-span-2 text-gray-500 dark:text-[#555870] hidden md:flex items-center gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1e2235] text-[10px] text-gray-500 dark:text-[#8b8fa8] uppercase tracking-wider">
                    {file.type}
                  </span>
                </div>
              )}
              <div className="md:col-span-2 text-gray-500 dark:text-[#555870] text-xs">{file.sizeLabel || formatBytes(file.size)}</div>
              <div className="md:col-span-2 text-gray-500 dark:text-[#555870] text-xs">{file.date}</div>
              {isTrash && (
                <div className="md:col-span-1 hidden md:flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRestoreFile(file.id); }}
                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#555870] hover:text-gray-900 dark:hover:text-[#e8e9f0] px-2 py-1 hover:bg-gray-100 dark:hover:bg-[#1a1c26] rounded transition-colors"
                  >
                    <RotateCcw size={12} />
                    <span>Restore</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
