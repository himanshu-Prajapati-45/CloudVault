import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { revokeShareApi } from '../../services/api';
import { Link2, Copy, Check, X, Clock, Shield, Loader2, AlertCircle } from 'lucide-react';

export default function SharedLinksView() {
    const { files, setFiles } = useOutletContext();
    const [copiedId, setCopiedId] = useState(null);
    const [revoking, setRevoking] = useState(null);
    const [error, setError] = useState(null);

    const sharedFiles = useMemo(() => {
        return files.filter(f => f.share_token && !f.deleted);
    }, [files]);

    const handleCopy = (file) => {
        const shareUrl = `${window.location.origin}/share/${file.share_token}`;
        navigator.clipboard.writeText(shareUrl);
        setCopiedId(file.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleRevoke = async (file) => {
        if (!confirm(`Revoke share link for "${file.name}"?`)) return;
        setRevoking(file.id);
        setError(null);
        try {
            await revokeShareApi(file.id);
            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, share_token: null, share_expires_at: null } : f));
        } catch (err) {
            setError(err.message);
        } finally {
            setRevoking(null);
        }
    };

    const formatExpiry = (dateStr) => {
        if (!dateStr) return 'No expiry';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = date - now;
        if (diff < 0) return 'Expired';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
        return `${hours} hour${hours > 1 ? 's' : ''} left`;
    };

    if (sharedFiles.length === 0) {
        return (
            <div className="max-w-7xl mx-auto relative">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e8e9f0] mb-2 tracking-tight">Shared Links</h1>
                    <p className="text-gray-500 dark:text-[#8b8fa8] text-sm">Manage and revoke your active share links.</p>
                </div>
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#1f2130] bg-white dark:bg-[#13151c]">
                    <svg className="w-16 h-16 text-gray-400 dark:text-[#555870] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-[#8b8fa8]">No shared links</h3>
                    <p className="text-sm text-gray-500 dark:text-[#555870] mt-1 max-w-sm">Files you share will appear here. Open a file and click Share to create a link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto relative">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e8e9f0] mb-2 tracking-tight">Shared Links</h1>
                <p className="text-gray-500 dark:text-[#8b8fa8] text-sm">Manage and revoke your active share links.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-[#e05c5c]/10 border border-[#e05c5c]/30 rounded-xl flex items-center gap-3 text-[#e05c5c]">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {sharedFiles.map(file => (
                    <div key={file.id} className="bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-2xl p-5 hover:border-gray-300 dark:hover:border-[#2a2d3e] transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-[#e8e9f0] truncate">{file.name}</h3>
                                    {file.share_password && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] rounded-full text-[10px] font-medium">
                                            <Shield size={10} />
                                            Protected
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-[#8b8fa8]">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatExpiry(file.share_expires_at)}
                                    </div>
                                    <div>{file.size}</div>
                                    <div>{file.date}</div>
                                </div>
                            </div>

                            <div className="flex sm:flex-col items-center gap-2 sm:items-end">
                                <button
                                    onClick={() => handleRevoke(file)}
                                    disabled={revoking === file.id}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#e05c5c]/10 text-[#e05c5c] hover:bg-[#e05c5c]/20 border border-[#e05c5c]/30 transition-all disabled:opacity-50"
                                >
                                    {revoking === file.id ? <><Loader2 size={14} className="animate-spin" /> Revoking...</> : <><X size={14} /> Revoke</>}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 bg-gray-100 dark:bg-[#1e2235] rounded-xl px-4 py-2 border border-gray-200 dark:border-[#1f2130]">
                            <Link2 size={14} className="text-gray-500 dark:text-[#555870] flex-shrink-0" />
                            <code className="text-xs text-gray-500 dark:text-[#8b8fa8] font-mono truncate flex-1">
                                {window.location.origin}/share/{file.share_token}
                            </code>
                            <button
                                onClick={() => handleCopy(file)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                                    copiedId === file.id
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'bg-white dark:bg-[#13151c] text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-[#1f2130]'
                                }`}
                            >
                                {copiedId === file.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}