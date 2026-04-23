import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';

function getFileIcon(type, size, isDark) {
  const cls = isDark ? 'text-[#8b8fa8]' : 'text-gray-400';
  switch (type) {
    case 'PDF': return <Icons.FileText size={size} className={cls} />;
    case 'PNG':
    case 'JPG':
    case 'FIG': return <Icons.FileImage size={size} className={cls} />;
    case 'ZIP': return <Icons.FileArchive size={size} className={cls} />;
    case 'XLSX':
    case 'CSV': return <Icons.FileSpreadsheet size={size} className={cls} />;
    case 'MD': return <Icons.FileCode size={size} className={cls} />;
    default: return <Icons.File size={size} className={cls} />;
  }
}

function getTypeColor(type, isDark) {
  if (isDark) {
    switch (type) {
      case 'PDF': return 'dark:bg-[#e05c5c]/20 dark:text-[#e05c5c]';
      case 'PNG':
      case 'JPG': return 'dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'ZIP': return 'dark:bg-[#f59e0b]/20 dark:text-[#f59e0b]';
      case 'XLSX': return 'dark:bg-[#4f6ef7]/20 dark:text-[#4f6ef7]';
      default: return 'dark:bg-[#4f6ef7]/20 dark:text-[#4f6ef7]';
    }
  }
  switch (type) {
    case 'PDF': return 'bg-[#e05c5c]/20 text-[#e05c5c]';
    case 'PNG':
    case 'JPG': return 'bg-emerald-500/20 text-emerald-400';
    case 'ZIP': return 'bg-[#f59e0b]/20 text-[#f59e0b]';
    case 'XLSX': return 'bg-[#4f6ef7]/20 text-[#4f6ef7]';
    default: return 'bg-[#4f6ef7]/20 text-[#4f6ef7]';
  }
}

export default function PublicSharedPage() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('cloudvault-theme') === 'dark');
  const { id } = useParams();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [showAccessLog, setShowAccessLog] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sharedFile, setSharedFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async (pwd = null) => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const url = pwd ? `${API_URL}/share/${id}?password=${encodeURIComponent(pwd)}` : `${API_URL}/share/${id}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setSharedFile(data);
          setDownloadUrl(data.download_url);
          setPreviewUrl(data.preview_url);
          setIsUnlocked(true);
        } else if (response.status === 401) {
          const err = await response.json().catch(() => ({}));
          setPasswordError(true);
          setSharedFile({ requires_password: true, name: 'Protected File' });
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchSharedFile();
  }, [id]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setPasswordError(true); return; }
    setLoading(true);
    setPasswordError(false);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/share/${id}?password=${encodeURIComponent(password)}`);
      if (response.ok) {
        const data = await response.json();
        setSharedFile(data);
        setDownloadUrl(data.download_url);
        setPreviewUrl(data.preview_url);
        setIsUnlocked(true);
      } else if (response.status === 401) {
        setPasswordError(true);
      } else { setNotFound(true); }
    } catch { setNotFound(true); }
    setLoading(false);
  };

  const handleDownload = () => {
    if (isDownloading || downloadComplete || !downloadUrl) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    window.location.href = downloadUrl;
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setDownloadComplete(true);
          setTimeout(() => setDownloadComplete(false), 3000);
          return 100;
        }
        return prev + Math.random() * 30 + 20;
      });
    }, 200);
  };

  const progress = Math.min(downloadProgress, 100);
  const file = sharedFile || { name: 'Loading...', type: 'FILE', size: '--', expires_at: null, is_password_protected: false };
  const fileTypeLabel = file.type ? file.type.split('/')[0].toUpperCase() : 'FILE';
  const fileSizeLabel = file.size ? (file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : file.size < 1024 * 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / (1024 * 1024 * 1024)).toFixed(1)} GB`) : '--';

  const displayFile = {
    ...file, type: fileTypeLabel, size: fileSizeLabel, sharedBy: 'CloudVault User', sharedByEmail: '',
    expiresIn: file.expires_at ? (() => {
      const diff = new Date(file.expires_at) - new Date();
      if (diff < 0) return 'Expired';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days} day${days !== 1 ? 's' : ''} left`;
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    })() : 'No expiry',
    uploadedDate: '--', downloadCount: 0, maxDownloads: '∞', isPasswordProtected: file.is_password_protected || false, permissions: ['View', 'Download'], accessLog: [],
  };
  const downloadsRemaining = typeof displayFile.maxDownloads === 'number' ? displayFile.maxDownloads - displayFile.downloadCount : null;

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen w-full bg-white dark:bg-[#0d0f14] flex flex-col">
      <header className="w-full flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 bg-white dark:bg-[#0d0f14] border-b border-gray-200 dark:border-[#1f2130] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
            <img src="/src/assets/logo.png" alt="CloudVault" className="w-full h-full object-cover rounded-lg" />
          </div>
          <span className="text-gray-900 dark:text-[#e8e9f0] text-sm tracking-tight">CloudVault</span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#4f6ef7]/20 text-[10px] text-[#4f6ef7] uppercase tracking-wider">Public Link</span>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8 md:py-14">
        <AnimatePresence mode="wait">
          {notFound ? (
            <motion.div key="not-found" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-[#1e2235] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icons.AlertTriangle size={36} className="text-red-500 dark:text-[#e05c5c]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e8e9f0] mb-2">Link Expired or Invalid</h2>
              <p className="text-gray-500 dark:text-[#8b8fa8] text-sm mb-6">This share link is no longer valid. It may have been revoked or has exceeded its expiry time.</p>
              <Link to="/" className="px-6 py-2.5 bg-[#4f6ef7] text-white rounded-xl text-sm font-medium hover:bg-[#3d5bd9] transition-colors inline-block">Go to CloudVault</Link>
            </motion.div>
          ) : !isUnlocked ? (
            <motion.div key="password-gate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="w-full max-w-md">
              <div className="bg-white dark:bg-[#13151c] rounded-2xl border border-gray-200 dark:border-[#1f2130] shadow-xl shadow-black/20 overflow-hidden">
                <div className="bg-gray-50 dark:bg-[#0d0f14] px-8 py-10 flex flex-col items-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 dark:bg-white/[0.06] border border-white/10 dark:border-white/[0.08] flex items-center justify-center backdrop-blur-sm">
                      <Icons.Lock size={32} className="text-gray-400 dark:text-[#8b8fa8]" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#4f6ef7] rounded-lg flex items-center justify-center shadow-lg">
                      <Icons.Fingerprint size={14} className="text-white" />
                    </div>
                  </motion.div>
                  <h2 className="text-gray-900 dark:text-[#e8e9f0] text-lg mt-5 tracking-tight">Password Protected</h2>
                  <p className="text-gray-400 dark:text-[#555870] text-xs mt-1.5 text-center max-w-[260px]">This file requires a password to access. Enter the password shared with you.</p>
                </div>
                <form onSubmit={handleUnlock} className="p-6 space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-400 dark:text-[#555870] uppercase tracking-wider mb-1.5 block">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }} placeholder="Enter file password" className={`w-full h-11 px-4 pr-10 bg-gray-100 dark:bg-[#1e2235] border border-gray-200 dark:border-[#1f2130] rounded-lg text-gray-900 dark:text-[#e8e9f0] placeholder-gray-400 dark:placeholder-[#555870] focus:outline-none focus:border-[#4f6ef7] transition-all text-sm ${passwordError ? 'border-red-500 dark:border-[#e05c5c]' : ''}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#555870] hover:text-gray-600 transition-colors">{showPassword ? <Icons.EyeOff size={15} /> : <Icons.Eye size={15} />}</button>
                    </div>
                    <AnimatePresence>{passwordError && (<motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-[#e05c5c] mt-1.5 flex items-center gap-1"><Icons.AlertTriangle size={11} />Incorrect password</motion.p>)}</AnimatePresence>
                  </div>
                  <button type="submit" className="w-full h-11 bg-[#4f6ef7] text-white rounded-xl hover:bg-[#3d5bd9] transition-all shadow-sm flex items-center justify-center gap-2 text-sm"><Icons.Lock size={14} />Unlock File</button>
                </form>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-[#555870]"><span>Shared by</span><span className="text-gray-600 dark:text-[#8b8fa8]">{displayFile.sharedBy}</span><span className="w-1 h-1 bg-gray-400 dark:bg-[#555870] rounded-full" /><span className="flex items-center gap-1"><Icons.Clock size={10} />Expires in {displayFile.expiresIn}</span></div>
            </motion.div>
          ) : (
            <motion.div key="file-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="w-full max-w-2xl space-y-4">
              <div className="bg-white dark:bg-[#13151c] rounded-2xl border border-gray-200 dark:border-[#1f2130] shadow-xl shadow-black/20 overflow-hidden">
                <div className="bg-gray-50 dark:bg-[#0d0f14] px-6 md:px-8 py-8 md:py-10 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  <div className="relative flex flex-col items-center justify-center gap-4 text-center">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="relative flex-shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-2xl flex items-center justify-center backdrop-blur-sm">{getFileIcon(fileTypeLabel, 36, isDark)}</div>
                      <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-lg flex items-center justify-center shadow-md text-[9px] tracking-wider ${getTypeColor(fileTypeLabel, isDark)}`}>{fileTypeLabel}</div>
                    </motion.div>
                    <div className="flex-1 min-w-0 flex flex-col items-center">
                      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="text-lg md:text-xl text-gray-900 dark:text-[#e8e9f0] tracking-tight break-all leading-snug">{displayFile.name}</motion.h1>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.35 }} className="flex items-center justify-center gap-2 mt-2 text-[11px] text-gray-400 dark:text-[#555870]">
                        <span className="flex items-center gap-1"><Icons.HardDrive size={10} />{displayFile.size}</span>
                        {displayFile.isPasswordProtected && (
                          <>
                            <span className="w-1 h-1 bg-gray-400 dark:bg-[#555870] rounded-full" />
                            <span className="flex items-center gap-1"><Icons.Lock size={10} />Protected</span>
                          </>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
                <div className="p-5 md:p-6 space-y-4">
                  <div className="flex gap-3">
                    <motion.button onClick={handleDownload} disabled={isDownloading} whileTap={{ scale: 0.98 }} className={`flex-1 h-12 rounded-xl text-sm flex items-center justify-center gap-2 transition-all relative overflow-hidden ${downloadComplete ? 'bg-[#4f6ef7] text-white' : 'bg-[#4f6ef7] text-white hover:bg-[#3d5bd9] shadow-sm'}`}>
                      {isDownloading && (<motion.div className="absolute inset-y-0 left-0 bg-[#3d5bd9]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />)}
                      <span className="relative z-10 flex items-center gap-2">{downloadComplete ? (<><Icons.CheckCircle2 size={16} />Complete</>) : isDownloading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{Math.round(progress)}%</>) : (<><Icons.Download size={16} />Download<span className="text-white/50 text-xs hidden sm:inline">({displayFile.size})</span></>)}</span>
                    </motion.button>
                    <motion.button onClick={() => setIsPreviewOpen(true)} whileTap={{ scale: 0.98 }} className="h-12 px-6 rounded-xl text-sm flex items-center justify-center gap-2 bg-gray-100 dark:bg-[#1e2235] text-gray-900 dark:text-[#e8e9f0] hover:bg-gray-200 dark:hover:bg-[#2a2d3e] transition-all border border-gray-200 dark:border-[#1f2130]"><Icons.Eye size={16} />Preview</motion.button>
                  </div>
                  {downloadsRemaining <= 3 && downloadsRemaining > 0 && (<div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#1e2235] rounded-lg text-xs text-gray-600 dark:text-[#8b8fa8]"><Icons.AlertTriangle size={12} className="text-amber-500 dark:text-[#f59e0b] flex-shrink-0" /><span>{downloadsRemaining} download{downloadsRemaining !== 1 ? 's' : ''} remaining for this link</span></div>)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>{isPreviewOpen && (<FilePreviewModal file={{ name: displayFile.name, type: displayFile.type, size: displayFile.size, url: previewUrl }} onClose={() => setIsPreviewOpen(false)} onDownload={handleDownload} />)}</AnimatePresence>
      <footer className="w-full text-center py-5 border-t border-gray-200 dark:border-[#1f2130] bg-white dark:bg-[#0d0f14] flex-shrink-0"><p className="text-[10px] text-gray-400 dark:text-[#555870] uppercase tracking-widest">Cloud-Vault</p></footer>
    </div></div>
  );
}
