import { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Trash2,
  Clock,
  User,
  HardDrive,
  FileType,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FilePreviewModal from './FilePreviewModal';
import ShareModal from './ShareModal';

function formatExpiry(dateStr) {
  if (!dateStr) return 'No expiry';
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} left`;
  return `${hours} hour${hours !== 1 ? 's' : ''} left`;
}

export default function FileDetailPanel({ file, onClose, onDelete, onDownload, onShare, onShareCreated }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-[#13151c] border-l border-gray-200 dark:border-[#1f2130] shadow-2xl shadow-black/20 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#1e2030] flex-shrink-0">
        <h3 className="text-gray-900 dark:text-[#e8e9f0] text-sm">File Details</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e2235] flex items-center justify-center text-gray-500 dark:text-[#555870] hover:text-gray-900 dark:hover:text-[#e8e9f0] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* File Preview */}
        <div className="px-6 py-8 flex flex-col items-center text-center border-b border-gray-200 dark:border-[#1e2030]">
          <div className="w-20 h-20 bg-gray-100 dark:bg-[#1e2235] rounded-2xl flex items-center justify-center mb-4 border border-gray-200 dark:border-[#1f2130]">
            <span className="text-sm text-gray-500 dark:text-[#555870] uppercase tracking-wider">{file.type}</span>
          </div>
          <h2 className="text-gray-900 dark:text-[#e8e9f0] mb-1 break-all px-4 text-base">{file.name}</h2>
          <p className="text-xs text-gray-500 dark:text-[#555870]">
            {file.sizeLabel || file.size} • {file.date}
          </p>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => onDownload && onDownload(file)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#4f6ef7] text-white rounded-lg text-xs hover:bg-[#3d5bd9] transition-colors"
            >
              <Download size={13} />
              Download
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-[#1e2235] text-gray-500 dark:text-[#8b8fa8] rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-[#1a1c26] border border-gray-200 dark:border-[#1f2130] transition-colors"
            >
              <Share2 size={13} />
              Share
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-[#1e2235] text-gray-500 dark:text-[#8b8fa8] rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-[#1a1c26] border border-gray-200 dark:border-[#1f2130] transition-colors"
            >
              <Eye size={13} />
              Preview
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-[#1e2030] px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-xs transition-all border-b-2 ${
              activeTab === 'details'
                ? 'border-[#4f6ef7] text-gray-900 dark:text-[#e8e9f0]'
                : 'border-transparent text-gray-500 dark:text-[#555870] hover:text-gray-700 dark:hover:text-[#8b8fa8]'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 text-xs transition-all border-b-2 ${
              activeTab === 'activity'
                ? 'border-[#4f6ef7] text-gray-900 dark:text-[#e8e9f0]'
                : 'border-transparent text-gray-500 dark:text-[#555870] hover:text-gray-700 dark:hover:text-[#8b8fa8]'
            }`}
          >
            Activity
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="px-6 py-5 space-y-5">
            {/* Metadata */}
            <div className="space-y-3">
              <p className="text-[10px] text-gray-500 dark:text-[#555870] uppercase tracking-widest">File Information</p>
              <div className="space-y-2">
                {[
                  { icon: FileType, label: 'Type', value: file.type },
                  { icon: HardDrive, label: 'Size', value: file.sizeLabel || file.size },
                  { icon: Clock, label: 'Modified', value: file.date },
                  { icon: Clock, label: 'Expires', value: formatExpiry(file.share_expires_at) },
                  { icon: User, label: 'Owner', value: file.sharedBy || 'Me' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-2.5 px-3 bg-gray-100 dark:bg-[#1e2235] rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-gray-400 dark:text-[#555870]" />
                        <span className="text-xs text-gray-500 dark:text-[#8b8fa8]">{item.label}</span>
                      </div>
                      <span className="text-xs text-gray-900 dark:text-[#e8e9f0]">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="px-6 py-5">
            <p className="text-[10px] text-gray-500 dark:text-[#555870] uppercase tracking-widest mb-3">Recent Activity</p>
            <div className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e2235] transition-colors">
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#1e2235] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] text-gray-500 dark:text-[#555870]">Y</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-[#8b8fa8]">
                  <span className="text-gray-900 dark:text-[#e8e9f0]">You</span> uploaded this file
                </p>
                <p className="text-[10px] text-gray-500 dark:text-[#555870]">{file.date}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-[#1e2030] flex-shrink-0">
        <button
          onClick={() => onDelete && onDelete(file.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-[#e05c5c] hover:bg-[#e05c5c]/10 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
          Move to Trash
        </button>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <FilePreviewModal
            file={{
              id: file.id,
              name: file.name,
              type: file.type,
              size: file.sizeLabel || file.size,
              url: file.url,
            }}
            onClose={() => setIsPreviewOpen(false)}
            onDownload={onDownload}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareOpen && (
          <ShareModal
            file={file}
            onClose={() => setIsShareOpen(false)}
            onShareCreated={onShareCreated}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}