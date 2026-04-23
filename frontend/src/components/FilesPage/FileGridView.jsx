import React from 'react';
import { 
  CheckSquare, 
  Square, 
  Link2 
} from 'lucide-react';

export default function FileGridView({
  files,
  selectedIds,
  toggleSelect,
  setSelectedFile,
  getFileIcon,
  formatBytes,
  isTrash
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {files.map((file) => {
        const isSelected = selectedIds.has(file.id);
        return (
          <div
            key={file.id}
            className={`
              bg-white dark:bg-[#13151c] border rounded-xl p-4
              hover:border-gray-300 dark:hover:border-[#2a2d3e] transition-all duration-200 cursor-pointer group relative
              ${isTrash ? 'opacity-60 hover:opacity-100' : ''}
              ${isSelected ? 'border-[#4f6ef7]/50 bg-gray-100 dark:bg-[#1e2235] ring-1 ring-[#4f6ef7]/30' : 'border-gray-200 dark:border-[#1f2130]'}
            `}
          >
            {/* Checkbox */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}
              className={`absolute top-3 left-3 z-10 transition-all ${
                isSelected
                  ? 'text-[#4f6ef7] opacity-100'
                  : 'text-gray-500 dark:text-[#555870] opacity-0 group-hover:opacity-100 hover:text-[#8b8fa8]'
              }`}
            >
              {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>
            <div
              onClick={() => setSelectedFile(file)}
              className={`w-full aspect-[4/3] bg-gray-100 dark:bg-[#1e2235] rounded-lg mb-3 flex flex-col items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-[#1a1c26] transition-colors relative overflow-hidden`}
            >
              <div className="mb-2">
                {getFileIcon(file.type, 28)}
              </div>
              <span className="text-[10px] text-gray-500 dark:text-[#555870] uppercase tracking-wider">{file.type}</span>
              <div className="absolute bottom-3 left-4 right-4 space-y-1.5 opacity-20">
                <div className="h-px bg-gray-300 dark:bg-[#555870] w-full" />
                <div className="h-px bg-gray-300 dark:bg-[#555870] w-3/4" />
                <div className="h-px bg-gray-300 dark:bg-[#555870] w-1/2" />
              </div>
            </div>
            <p
              onClick={() => setSelectedFile(file)}
              className={`text-sm truncate mb-1.5 ${isTrash ? 'text-gray-400 dark:text-[#555870] line-through' : 'text-gray-500 dark:text-[#8b8fa8] group-hover:text-gray-900 dark:group-hover:text-[#e8e9f0]'}`}
            >
              {file.name}
              {file.share_token && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#4f6ef7]/20 text-[#4f6ef7] text-[9px] rounded-full font-medium">
                  <Link2 size={8} />
                  Shared
                </span>
              )}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500 dark:text-[#555870]">{file.sizeLabel || formatBytes(file.size)}</span>
              <span className="text-[11px] text-gray-500 dark:text-[#555870]">{file.date}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
