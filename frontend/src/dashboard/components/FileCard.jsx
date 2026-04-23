import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import FilePreviewModal from '../../components/FilePreviewModal';

export default function FileCard({ file, onShare, onDelete, onDetails }) {
    const getType = (name) => {
        let ext = (name || '').split('.').pop()?.toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        return ext || 'file';
    };

    const fileType = getType(file?.name);

    const getIcon = (type) => {
        switch (type) {
            case 'pdf': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>;
            case 'zip': case 'rar': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>;
            case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp': case 'svg': case 'img': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
            default: return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
        }
    };

    const getColors = (type) => {
        switch (type) {
            case 'pdf': return 'bg-[#e05c5c]/20 text-[#e05c5c]';
            case 'zip': case 'rar': return 'bg-[#f59e0b]/20 text-[#f59e0b]';
            case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp': case 'svg': case 'img': return 'bg-emerald-500/20 text-emerald-400';
            default: return 'bg-[#4f6ef7]/20 text-[#4f6ef7]';
        }
    };

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const previewableTypes = [
      'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'img',
      'mp4', 'webm', 'mov', 'ogg', 'mpeg',
      'mp3', 'wav', 'opus', 'm4a', 'flac',
      'txt', 'md', 'html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml', 'yaml', 'yml', 'py', 'rb', 'php', 'c', 'cpp', 'h', 'java', 'kt', 'swift', 'go', 'rs', 'cs', 'sql', 'sh', 'bash', 'zsh', 'log', 'ini', 'conf', 'toml', 'env', 'csv',
    ];

    const handlePreview = (e) => {
        e.stopPropagation();
        setIsPreviewOpen(true);
    };

    const handleDownload = async (e) => {
        e.stopPropagation();
        if (!file?.id) {
            alert('File not found.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const response = await fetch(`${apiUrl}/files/${file.id}/download`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            if (!response.ok) throw new Error('Download failed');
            const data = await response.json();
            if (data.download_url) {
                window.location.href = data.download_url;
            }
        } catch (err) {
            alert('Download failed: ' + err.message);
        }
    };

    const handleCardClick = (e) => {
        if (e.target.closest('button')) return;
        if (onDetails) {
            onDetails();
        }
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                className="group relative bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-2xl p-5 hover:border-gray-300 dark:hover:border-[#2a2d3e] transition-all duration-300 cursor-pointer shadow-sm"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColors(fileType)} transition-colors duration-300`}>
                        {getIcon(fileType)}
                    </div>
                    {file?.share_token && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-[#4f6ef7]/20 text-[#4f6ef7] rounded-full text-[10px] font-medium" title="Shared">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            Shared
                        </div>
                    )}
                </div>

                <div className="mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-[#e8e9f0] truncate transition-colors duration-300" title={file?.name}>{file?.name || "Untitled"}</h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs text-gray-500 dark:text-[#8b8fa8] mt-2 transition-colors duration-300">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                        <span>{file?.size || "0 KB"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{file?.date || "Unknown"}</span>
                    </div>
                </div>

                <div className="flex gap-2 mt-5 pt-4 border-t border-gray-200 dark:border-[#1f2130]">
                  {previewableTypes.includes(fileType) && (
                    <button
                        onClick={handlePreview}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#4f6ef7]/20 text-[#4f6ef7] hover:bg-[#4f6ef7] hover:text-white rounded-lg text-xs font-semibold transition-colors border border-[#4f6ef7]/30"
                        title="Preview"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        Preview
                    </button>
                  )}
                </div>
            </div>

            <AnimatePresence>
                {isPreviewOpen && (
                    <FilePreviewModal
                        file={{
                            name: file?.name,
                            type: fileType.toUpperCase(),
                            size: file?.size,
                            url: file?.url,
                        }}
                        onClose={() => setIsPreviewOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}