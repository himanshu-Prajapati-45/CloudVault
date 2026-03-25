import { useState, useEffect } from 'react';
import { shareFileApi } from '../../services/api';

export default function ShareModal({ file, onClose }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file?.id) return;

    const generateLink = async () => {
      try {
        const data = await shareFileApi(file.id);
        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
        setShareUrl(`${apiBase}${data.share_url}`);
      } catch (err) {
        setError(err.message || 'Failed to generate share link');
      } finally {
        setLoading(false);
      }
    };
    generateLink();
  }, [file]);

  if (!file) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Share File</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Anyone with this link can view and download <span className="font-semibold text-slate-700 dark:text-slate-200 truncate inline-block max-w-[200px] align-bottom">{file.name}</span>
        </p>

        {/* Link Input area */}
        {loading ? (
          <div className="flex items-center justify-center py-4 text-sm text-slate-500">Generating link...</div>
        ) : error ? (
          <div className="p-3 mb-4 text-sm text-red-500 bg-red-100/10 rounded-xl border border-red-500/50">{error}</div>
        ) : (
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
            />
            <button
              onClick={handleCopy}
              className={`min-w-[80px] flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${copied ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'}`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {/* Warning / Expiry component */}
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Link Expiry</h3>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1 leading-relaxed">This secure link will automatically expire in 24 hours to protect your privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
