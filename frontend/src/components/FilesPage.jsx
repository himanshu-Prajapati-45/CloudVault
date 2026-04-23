import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import UploadModal from './UploadModal';
import FileDetailPanel from './FileDetailPanel';
import ShareModal from './ShareModal';

// Sub-components
import StatsOverview from './FilesPage/StatsOverview';
import RecentActivity from './FilesPage/RecentActivity';
import StorageStatus from './FilesPage/StorageStatus';
import FileToolbar from './FilesPage/FileToolbar';
import FileListView from './FilesPage/FileListView';
import FileGridView from './FilesPage/FileGridView';
import EmptyState from './FilesPage/EmptyState';
import {
  Plus,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  Share2,
  Trash2,
  MoreHorizontal,
  File,
  FileText,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  RotateCcw,
  Trash,
  CheckSquare,
  Square,
  AlertTriangle,
  HardDrive,
  Users,
  Activity,
  TrendingUp,
  Clock,
  Upload,
  FolderPlus,
  Link2,
  Star,
  FileCode,
  Shield,
  Folder,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  deleteFileApi,
  permanentDeleteFileApi,
  restoreFileApi,
  uploadFileApi,
  fetchFilesApi,
  fetchTrashedFilesApi,
  fetchStorageStatsApi,
} from '../services/api';

function getFileIcon(type, size) {
  const s = size || 18;
  switch (type) {
    case 'PDF': return <FileText size={s} className="text-[#8b8fa8]" />;
    case 'PNG':
    case 'JPG':
    case 'JPEG':
    case 'GIF':
    case 'SVG':
    case 'WEBP':
    case 'FIG': return <FileImage size={s} className="text-[#8b8fa8]" />;
    case 'ZIP':
    case 'RAR':
    case '7Z':
    case 'TAR':
    case 'GZ': return <FileArchive size={s} className="text-[#8b8fa8]" />;
    case 'XLSX':
    case 'XLS':
    case 'CSV': return <FileSpreadsheet size={s} className="text-[#8b8fa8]" />;
    case 'MD':
    case 'JS':
    case 'JSX':
    case 'TS':
    case 'TSX':
    case 'JSON':
    case 'HTML':
    case 'CSS':
    case 'PY': return <FileCode size={s} className="text-[#8b8fa8]" />;
    case 'FOLDER': return <Folder size={s} className="text-[#8b8fa8]" />;
    default: return <File size={s} className="text-[#8b8fa8]" />;
  }
}

function getFileTypeBg(type) {
  switch (type) {
    case 'PDF': return 'bg-[#1e2235]';
    case 'PNG':
    case 'JPG':
    case 'JPEG':
    case 'FIG': return 'bg-[#1e2235]';
    case 'ZIP': return 'bg-[#1e2235]';
    case 'XLSX':
    case 'CSV': return 'bg-[#1e2235]';
    case 'FOLDER': return 'bg-[#1e2235]';
    default: return 'bg-[#1e2235]';
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)).toString().replace(/\.?0+$/, '') + ' ' + sizes[i];
}

function getPageConfig(pathname) {
  if (pathname.includes('shared')) return { key: 'shared', title: 'Shared with Me', subtitle: 'Files shared by your team members', isShared: true, isTrash: false, isDashboard: false };
  if (pathname.includes('recent')) return { key: 'recent', title: 'Recent Files', subtitle: 'Your recently accessed files', isShared: false, isTrash: false, isDashboard: false };
  if (pathname.includes('trash')) return { key: 'trash', title: 'Trash', subtitle: 'Items are permanently deleted after 30 days', isShared: false, isTrash: true, isDashboard: false };
  return { key: 'dashboard', title: 'My Files', subtitle: 'Manage and organize your documents', isShared: false, isTrash: false, isDashboard: true };
}

export default function FilesPage() {
  const location = useLocation();
  const { files: allFiles, setFiles, trashedFiles, setTrashedFiles, searchQuery, storage } = useOutletContext();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  // Sort & Filter
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Share modal
  const [shareFile, setShareFile] = useState(null);
  const [shareBulk, setShareBulk] = useState(false);

  // Handle share created - update file with share_token
  const handleShareCreated = (updatedFile) => {
    setFiles(prev => prev.map(f => f.id === updatedFile.id ? { ...f, ...updatedFile } : f));
    if (selectedFile?.id === updatedFile.id) {
      setSelectedFile(prev => ({ ...prev, ...updatedFile }));
    }
    setShareFile(null);
  };

  const config = getPageConfig(location.pathname);
  const { title, subtitle, isShared, isTrash, isDashboard } = config;

  // Filter by search query from Layout header
  const searchFiltered = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return allFiles;
    const q = searchQuery.toLowerCase();
    return allFiles.filter((f) => f.name.toLowerCase().includes(q));
  }, [allFiles, searchQuery]);

  // Get base files for current page
  const baseFiles = useMemo(() => {
    if (isTrash) return trashedFiles;
    if (isDashboard) return searchFiltered;
    if (isShared) return searchFiltered.filter((f) => f.sharedBy && f.sharedBy !== 'Me');
    // recent — sort by date desc, take last 10
    return [...searchFiltered].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate)).slice(0, 10);
  }, [isShared, isTrash, isDashboard, searchFiltered, trashedFiles]);

  // Apply filter
  const filteredFiles = useMemo(() => {
    if (filterType === 'all') return baseFiles;
    return baseFiles.filter((f) => f.type === filterType);
  }, [baseFiles, filterType]);

  // Apply sort
  const files = useMemo(() => {
    const sorted = [...filteredFiles].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
        case 'size':
          cmp = (a.size || 0) - (b.size || 0);
          break;
        case 'date':
          cmp = new Date(a.rawDate || 0) - new Date(b.rawDate || 0);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredFiles, sortField, sortDirection]);

  // Available types for filter
  const availableTypes = useMemo(() => {
    const types = new Set(baseFiles.map((f) => f.type));
    return Array.from(types).sort();
  }, [baseFiles]);

  // Clear selection when page changes
  const prevKey = useRef(config.key);
  if (prevKey.current !== config.key) {
    prevKey.current = config.key;
    setSelectedIds(new Set());
    setShowSortMenu(false);
    setShowFilterMenu(false);
  }


  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortMenu(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Selection helpers
  const allSelected = files.length > 0 && selectedIds.size === files.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(files.map((f) => f.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };


  // Real API: Delete file (soft delete → moves to trash)
  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFileApi(fileId);
      const file = allFiles.find((f) => f.id === fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (file) {
        setTrashedFiles((prev) => [{ ...file, date: 'Deleted just now' }, ...prev]);
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // Real API: Restore file from trash
  const handleRestoreFile = async (fileId) => {
    try {
      await restoreFileApi(fileId);
      const file = trashedFiles.find((f) => f.id === fileId);
      setTrashedFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (file) {
        setFiles((prev) => [{ ...file, date: 'Restored just now' }, ...prev]);
      }
    } catch (err) {
      console.error('Restore failed', err);
    }
  };

  // Real API: Permanent delete
  const handlePermanentDelete = async (fileId) => {
    try {
      await permanentDeleteFileApi(fileId);
      setTrashedFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error('Permanent delete failed', err);
    }
  };

  // Bulk actions with real API
  const handleBulkDelete = async () => {
    if (isTrash) {
      // Permanent delete from trash
      await Promise.allSettled(
        [...selectedIds].map((id) => permanentDeleteFileApi(id))
      );
      setTrashedFiles((prev) => prev.filter((f) => !selectedIds.has(f.id)));
    } else if (isDashboard) {
      // Soft delete → move to trash
      await Promise.allSettled(
        [...selectedIds].map((id) => deleteFileApi(id))
      );
      const toTrash = allFiles.filter((f) => selectedIds.has(f.id));
      setFiles((prev) => prev.filter((f) => !selectedIds.has(f.id)));
      setTrashedFiles((prev) => [...toTrash.map((f) => ({ ...f, date: 'Deleted just now' })), ...prev]);
    }
    setSelectedIds(new Set());
  };

  const handleBulkRestore = async () => {
    await Promise.allSettled(
      [...selectedIds].map((id) => restoreFileApi(id))
    );
    const toRestore = trashedFiles.filter((f) => selectedIds.has(f.id));
    setTrashedFiles((prev) => prev.filter((f) => !selectedIds.has(f.id)));
    setFiles((prev) => [...toRestore.map((f) => ({ ...f, date: 'Restored just now' })), ...prev]);
    setSelectedIds(new Set());
  };

  const handleEmptyTrash = async () => {
    await Promise.allSettled(
      trashedFiles.map((f) => permanentDeleteFileApi(f.id))
    );
    setTrashedFiles([]);
    setSelectedIds(new Set());
  };

  // Upload callback — refresh file list after upload
  const handleUploadComplete = async () => {
    setIsUploadOpen(false);
    try {
      const [active, stats] = await Promise.all([fetchFilesApi(), fetchStorageStatsApi()]);
      const formatFile = (f) => ({
        id: f.id,
        name: f.original_name || 'Untitled',
        type: (f.original_name || '').split('.').pop()?.toUpperCase() || 'FILE',
        size: f.file_size_bytes,
        sizeLabel: formatBytes(f.file_size_bytes),
        date: f.uploaded_at ? new Date(f.uploaded_at).toLocaleDateString() : 'Unknown',
        rawDate: f.uploaded_at || '',
        url: f.url,
        sharedBy: 'Me',
        share_token: f.share_token || null,
        share_expires_at: f.share_expires_at || null,
        share_password: f.share_password || null,
      });
      setFiles(active.map(formatFile));
    } catch (err) {
      console.error('Failed to refresh files', err);
    }
  };

  // Download handler
  const handleDownload = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      // Fetch the special download URL which has Content-Disposition set
      const response = await fetch(`${API_URL}/files/${file.id}/download`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      
      if (!response.ok) throw new Error('Download request failed');
      
      const data = await response.json();
      if (data.download_url) {
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = file.name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download via API failed, falling back to direct URL:', error);
      if (file.url) {
        const link = document.createElement('a');
        if (file.url.startsWith('http')) {
          link.href = file.url;
        } else {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const baseUrl = API_URL.replace('/api', '');
          link.href = `${baseUrl}${file.url}`;
        }
        link.download = file.name;
        link.target = '_blank';
        link.click();
      }
    }
  };

  // Stats from real data
  const usedGB = storage ? (storage.used_bytes / (1024 * 1024 * 1024)).toFixed(1) : '0';
  const limitGB = storage ? (storage.limit_bytes / (1024 * 1024 * 1024)).toFixed(0) : '10';
  const usedPercent = storage ? Math.round(storage.percentage || (storage.used_bytes / storage.limit_bytes * 100)) : 0;

  const stats = [
    { label: 'Total Files', value: String(allFiles.length), change: `${allFiles.length} active files`, icon: File, trend: 'up' },
    { label: 'Storage Used', value: `${usedGB} GB`, change: `${usedPercent}% of ${limitGB} GB`, icon: HardDrive, trend: 'neutral' },
    { label: 'Shared Files', value: String(allFiles.filter(f => f.share_token && !f.deleted).length || '0'), change: 'Active shared links', icon: Users, trend: 'up' },
    { label: 'In Trash', value: String(trashedFiles.length), change: 'Auto-deleted after 30 days', icon: Activity, trend: 'neutral' },
  ];

  const quickActions = [
    { label: 'Upload File', icon: Upload, action: () => setIsUploadOpen(true) },
  ];

  const sortOptions = [
    { label: 'Name', field: 'name' },
    { label: 'Date', field: 'date' },
    { label: 'Size', field: 'size' },
    { label: 'Type', field: 'type' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isTrash && <Trash size={20} className="text-gray-500 dark:text-[#555870]" />}
            {isShared && <Users size={20} className="text-gray-500 dark:text-[#555870]" />}
            <h1 className="text-2xl md:text-3xl text-gray-900 dark:text-[#e8e9f0] tracking-tight">{title}</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#555870] mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {isTrash ? (
            <button
              onClick={handleEmptyTrash}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#1e2235] text-gray-500 dark:text-[#8b8fa8] rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a1c26] transition-colors text-sm border border-gray-200 dark:border-[#1f2130]"
            >
              <Trash size={16} />
              <span>Empty Trash</span>
            </button>
          ) : (
            <>
              {isDashboard && quickActions.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.label}
                    onClick={qa.action}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm ${
                      qa.label === 'Upload File'
                        ? 'bg-[#4f6ef7] text-white hover:bg-[#3d5bd9] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#1e2235] text-gray-500 dark:text-[#8b8fa8] hover:bg-gray-200 dark:hover:bg-[#1a1c26] border border-gray-200 dark:border-[#1f2130]'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{qa.label}</span>
                  </button>
                );
              })}
              {!isDashboard && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#4f6ef7] text-white rounded-lg hover:bg-[#3d5bd9] transition-all shadow-sm text-sm"
                >
                  <Plus size={16} />
                  <span>Upload</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dashboard Stats + Activity */}
      {isDashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatsOverview stats={stats} />
          <RecentActivity files={allFiles} onSelectFile={setSelectedFile} />
        </div>
      )}


      {/* Bulk Action Bar */}
      {someSelected && (
        <div className="mb-4 flex items-center gap-3 bg-gray-100 dark:bg-[#1e2235] text-gray-900 dark:text-[#e8e9f0] rounded-xl px-5 py-3 shadow-lg border border-gray-200 dark:border-[#1f2130]">
          <span className="text-sm">{selectedIds.size} selected</span>
          <div className="flex-1" />
          {!isTrash && (
            <>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#13151c] hover:bg-gray-50 dark:hover:bg-[#1a1c26] transition-colors text-xs border border-gray-200 dark:border-[#1f2130]">
                <Download size={13} />
                Download
              </button>
              <button
                onClick={() => setShareBulk(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#13151c] hover:bg-gray-50 dark:hover:bg-[#1a1c26] transition-colors text-xs border border-gray-200 dark:border-[#1f2130]"
              >
                <Share2 size={13} />
                Share
              </button>
            </>
          )}
          {isTrash && (
            <button
              onClick={handleBulkRestore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#13151c] hover:bg-gray-50 dark:hover:bg-[#1a1c26] transition-colors text-xs border border-gray-200 dark:border-[#1f2130]"
            >
              <RotateCcw size={13} />
              Restore
            </button>
          )}
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e05c5c]/20 hover:bg-[#e05c5c]/30 text-[#e05c5c] transition-colors text-xs"
          >
            <Trash2 size={13} />
            {isTrash ? 'Delete Forever' : 'Delete'}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="w-7 h-7 rounded-lg bg-white dark:bg-[#13151c] hover:bg-gray-50 dark:hover:bg-[#1a1c26] flex items-center justify-center transition-colors ml-1 border border-gray-200 dark:border-[#1f2130]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <FileToolbar
        allSelected={allSelected}
        toggleSelectAll={toggleSelectAll}
        sortRef={sortRef}
        showSortMenu={showSortMenu}
        setShowSortMenu={setShowSortMenu}
        setShowFilterMenu={setShowFilterMenu}
        sortOptions={sortOptions}
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        filterRef={filterRef}
        showFilterMenu={showFilterMenu}
        filterType={filterType}
        setFilterType={setFilterType}
        availableTypes={availableTypes}
        getFileIcon={getFileIcon}
        filesCount={files.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
       {/* Files */}
      {files.length === 0 ? (
        <EmptyState isTrash={isTrash} filterType={filterType} />
      ) : viewMode === 'list' ? (
        <FileListView
          files={files}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
          allSelected={allSelected}
          toggleSelectAll={toggleSelectAll}
          setSelectedFile={setSelectedFile}
          getFileIcon={getFileIcon}
          formatBytes={formatBytes}
          isShared={isShared}
          isTrash={isTrash}
          handleRestoreFile={handleRestoreFile}
        />
      ) : (
        <FileGridView
          files={files}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
          setSelectedFile={setSelectedFile}
          getFileIcon={getFileIcon}
          formatBytes={formatBytes}
          isTrash={isTrash}
        />
      )}

      {/* Trash Warning */}
      {isTrash && trashedFiles.length > 0 && (
        <div className="mt-6 flex items-start gap-3 p-4 bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-xl">
          <AlertTriangle size={16} className="text-gray-400 dark:text-[#8b8fa8] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500 dark:text-[#8b8fa8]">Items in trash will be permanently deleted after 30 days.</p>
            <p className="text-xs text-gray-500 dark:text-[#555870] mt-1">You can restore files before they are permanently removed.</p>
          </div>
        </div>
      )}

      {/* File Detail Panel */}
      <AnimatePresence>
        {selectedFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/5 backdrop-blur-[1px]"
              onClick={() => setSelectedFile(null)}
            />
            <FileDetailPanel
              file={selectedFile}
              onClose={() => setSelectedFile(null)}
              onDelete={(id) => handleDeleteFile(id)}
              onDownload={handleDownload}
              onShare={(file) => setShareFile(file)}
              onShareCreated={handleShareCreated}
            />
          </>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      {isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUpload={handleUploadComplete}
        />
      )}

      {/* Share Modal — single file */}
      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => setShareFile(null)}
          onShareCreated={handleShareCreated}
        />
      )}

      {/* Share Modal — bulk */}
      {shareBulk && (
        <ShareModal
          file={files.find(f => selectedIds.has(f.id))}
          onClose={() => setShareBulk(false)}
          onShareCreated={handleShareCreated}
        />
      )}
    </div>
  );
}
