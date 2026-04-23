import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  File,
  AlertCircle,
  Loader2,
  FileVideo,
  FileAudio,
} from 'lucide-react';

/* ─── Preview type detection ─── */
function getPreviewType(type) {
  switch (type) {
    case 'PDF': return 'pdf';
    case 'JPG': case 'JPEG': case 'PNG': case 'GIF': case 'BMP': case 'TIFF': case 'WEBP': case 'SVG': case 'IMG': return 'image';
    case 'MP4': case 'WEBM': case 'MOV': case 'OGG': case 'MPEG': case 'AVI': case 'WMV': case 'FLV': case 'MKV': case 'MPEGPS': case '3GPP': return 'video';
    case 'MP3': case 'WAV': case 'OPUS': case 'M4A': case 'FLAC': case 'AAC': return 'audio';
    case 'TXT': case 'MD': case 'HTML': case 'CSS': case 'JS': case 'JSX': case 'TS': case 'TSX': case 'JSON': case 'XML': case 'YAML': case 'PY': case 'RB': case 'PHP': case 'C': case 'CPP': case 'H': case 'JAVA': case 'KT': case 'SWIFT': case 'GO': case 'RS': case 'CS': case 'SQL': case 'SH': case 'BASH': case 'ZSH': case 'PS1': case 'YML': case 'ENV': case 'CSV': case 'LOG': case 'TOML': case 'INI': case 'CONF': case 'CONFIG': case 'MAKEFILE': case 'Dockerfile': return 'text';
    default: return 'unsupported';
  }
}

function getFileTypeLabel(name) {
  if (!name) return 'FILE';
  let ext = name.split('.').pop()?.toUpperCase();
  // Normalize common aliases
  if (ext === 'JPEG') ext = 'JPG';
  if (ext === 'MP4') ext = 'MP4';
  return ext || 'FILE';
}

/* ─── Format bytes ─── */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)).toString().replace(/\.?0+$/, '') + ' ' + sizes[i];
}

/* ─── Text file content fetcher ─── */
async function fetchTextContent(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch file');
  return response.text();
}

/* ─── Icon helpers ─── */
function FileTypeIcon({ type, size = 14 }) {
  const cls = 'text-gray-400';
  switch (type) {
    case 'PDF': return <FileText size={size} className={cls} />;
    case 'JPG': case 'JPEG': case 'PNG': case 'GIF': case 'BMP': case 'TIFF': case 'SVG': return <FileImage size={size} className={cls} />;
    case 'ZIP': case 'RAR': case '7Z': case 'TAR': case 'GZ': return <FileArchive size={size} className={cls} />;
    case 'XLSX': case 'CSV': case 'XLS': return <FileSpreadsheet size={size} className={cls} />;
    case 'MP4': case 'WEBM': case 'MOV': case 'AVI': case 'WMV': case 'MKV': return <FileVideo size={size} className={cls} />;
    case 'MP3': case 'WAV': case 'OGG': case 'OPUS': case 'M4A': case 'FLAC': return <FileAudio size={size} className={cls} />;
    case 'TXT': case 'MD': case 'HTML': case 'CSS': case 'JS': case 'PY': case 'RB': case 'PHP': case 'C': case 'CPP': case 'JAVA': case 'JSON': case 'XML': case 'YAML': case 'LOG': case 'SQL': case 'SH': case 'GO': case 'RS': case 'CS': case 'SWIFT': case 'KT': case 'INI': case 'CONF': case 'YML': case 'ENV': case 'MAKEFILE': case 'Dockerfile': return <FileCode size={size} className={cls} />;
    default: return <File size={size} className={cls} />;
  }
}

/* ─── Preview Modal ─── */
export default function FilePreviewModal({ file, onClose, onDownload }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [textContent, setTextContent] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState(false);

  const typeLabel = getFileTypeLabel(file.name);
  const previewType = getPreviewType(typeLabel);
  const fileSize = typeof file.size === 'number' ? formatBytes(file.size) : (file.size || '--');

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // Fetch text file content when entering text preview
  useEffect(() => {
    if (previewType === 'text' && file.url) {
      setTextLoading(true);
      setTextError(false);
      setTextContent(null);
      fetchTextContent(file.url)
        .then((content) => {
          setTextContent(content);
          setTextLoading(false);
        })
        .catch(() => {
          setTextError(true);
          setTextLoading(false);
        });
    }
  }, [previewType, file.url]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name || 'download';
      link.target = '_blank';
      link.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex flex-col bg-gray-950/95 backdrop-blur-md"
    >
      {/* Top Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-white/[0.06] flex-shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            <FileTypeIcon type={typeLabel} size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white truncate max-w-[200px] md:max-w-[400px]">{file.name}</p>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>{typeLabel}</span>
              <span className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
              <span>{fileSize}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Download"
          >
            <Download size={15} />
          </button>
          <div className="w-px h-5 bg-white/[0.08] mx-1 hidden md:block" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </motion.header>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="flex-1 overflow-auto flex items-start justify-center p-4 md:p-8"
        >
          {/* ── Image ── */}
          {previewType === 'image' && (
            <div className="flex items-center justify-center min-h-full w-full">
              {file.url ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className={`max-w-full object-contain rounded-lg ${isFullscreen ? 'max-w-[1200px]' : ''}`}
                />
              ) : (
                <div className="text-center py-20">
                  <FileImage size={64} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Preview not available</p>
                </div>
              )}
            </div>
          )}

          {/* ── Video ── */}
          {previewType === 'video' && (
            <div className="flex items-center justify-center min-h-full w-full max-w-4xl">
              {file.url ? (
                <video
                  src={file.url}
                  controls
                  className={`max-w-full rounded-lg ${isFullscreen ? 'max-w-[1200px]' : ''}`}
                  style={{ maxHeight: '80vh' }}
                />
              ) : (
                <div className="text-center py-20">
                  <FileVideo size={64} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Preview not available</p>
                </div>
              )}
            </div>
          )}

          {/* ── Audio ── */}
          {previewType === 'audio' && (
            <div className="flex flex-col items-center justify-center min-h-full w-full max-w-2xl">
              <div className="w-24 h-24 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-8">
                <FileAudio size={40} className="text-gray-400" />
              </div>
              <p className="text-white text-lg font-medium mb-6">{file.name}</p>
              {file.url ? (
                <audio src={file.url} controls className="w-full max-w-md" />
              ) : (
                <p className="text-gray-500 text-sm">Audio preview not available</p>
              )}
            </div>
          )}

          {/* ── PDF ── */}
          {previewType === 'pdf' && (
            <div className="w-full h-full flex flex-col items-center">
              {file.url ? (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`}
                  className="w-full rounded-lg overflow-hidden"
                  style={{ height: '80vh', maxWidth: isFullscreen ? '1200px' : '800px' }}
                  frameBorder="0"
                  title={file.name}
                />
              ) : (
                <div className="text-center py-20">
                  <FileText size={64} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">PDF preview not available</p>
                </div>
              )}
            </div>
          )}

          {/* ── Text / Code ── */}
          {previewType === 'text' && (
            <div className="w-full max-w-4xl">
              {textLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={32} className="text-gray-500 animate-spin mb-4" />
                  <p className="text-gray-500 text-sm">Loading file...</p>
                </div>
              ) : textError ? (
                <div className="text-center py-20">
                  <AlertCircle size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">Could not load file content</p>
                </div>
              ) : textContent !== null ? (
                <pre className="w-full bg-white/5 border border-white/10 rounded-xl p-6 text-left text-sm text-gray-300 overflow-x-auto font-mono whitespace-pre-wrap" style={{ maxHeight: '75vh' }}>
                  <code>{textContent}</code>
                </pre>
              ) : null}
            </div>
          )}

          {/* ── Unsupported ── */}
          {previewType === 'unsupported' && (
            <div className="text-center py-20">
              <AlertCircle size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Preview not available for this file type</p>
              <p className="text-gray-600 text-xs mt-2">{typeLabel} files cannot be previewed</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
