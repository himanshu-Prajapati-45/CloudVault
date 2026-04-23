import React from 'react';
import { Trash, File } from 'lucide-react';

export default function EmptyState({ isTrash, filterType }) {
  return (
    <div className="py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-[#1e2235] rounded-2xl flex items-center justify-center mx-auto mb-4">
        {isTrash ? <Trash size={24} className="text-gray-400 dark:text-[#555870]" /> : <File size={24} className="text-gray-400 dark:text-[#555870]" />}
      </div>
      <p className="text-gray-500 dark:text-[#8b8fa8] mb-1">{isTrash ? 'Trash is empty' : 'No files found'}</p>
      <p className="text-sm text-gray-500 dark:text-[#555870]">
        {isTrash ? 'Items you delete will appear here' : filterType !== 'all' ? `No ${filterType} files found. Try a different filter.` : 'Upload files to get started'}
      </p>
    </div>
  );
}
