import { useState, useCallback, useRef } from 'react';
import { X, Upload, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { uploadFileApi } from '../services/api';

export default function UploadModal({ onClose, onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) {
      addFiles(dropped);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 0) {
      addFiles(selected);
    }
  };

  const addFiles = (newFiles) => {
    const formatted = newFiles.map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: formatSize(f.size),
      sizeBytes: f.size,
      progress: 0,
      status: 'pending',
      file: f,
    }));
    setFiles((prev) => [...prev, ...formatted]);

    formatted.forEach((f) => {
      uploadFile(f);
    });
  };

  const uploadFile = async (fItem) => {
    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fItem.id ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      const result = await uploadFileApi(fItem.file, (percent) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fItem.id ? { ...f, progress: percent } : f
          )
        );
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fItem.id ? { ...f, progress: 100, status: 'complete' } : f
        )
      );
    } catch (err) {
      console.error('Upload failed', err);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fItem.id ? { ...f, status: 'error', progress: 0 } : f
        )
      );
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const completedCount = files.filter((f) => f.status === 'complete').length;
  const hasFiles = files.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#13151c] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#1f2130] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#1e2030]">
          <div>
            <h3 className="text-gray-900 dark:text-[#e8e9f0]">Upload Files</h3>
            <p className="text-xs text-gray-500 dark:text-[#555870] mt-0.5">Files are stored securely</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e2235] flex items-center justify-center text-gray-500 dark:text-[#555870] hover:text-gray-900 dark:hover:text-[#e8e9f0] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center
              transition-all cursor-pointer
              ${isDragging
                ? 'border-[#4f6ef7] bg-gray-100 dark:bg-[#1e2235]'
                : 'border-gray-200 dark:border-[#1f2130] bg-gray-50 dark:bg-[#1e2235]/50 hover:border-gray-300 dark:hover:border-[#2a2d3e] hover:bg-gray-100 dark:hover:bg-[#1e2235]'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all ${isDragging ? 'bg-[#4f6ef7] text-white scale-110' : 'bg-gray-100 dark:bg-[#1a1c26] text-gray-500 dark:text-[#555870]'}`}>
              <Upload size={20} />
            </div>
            <p className="text-sm text-gray-500 dark:text-[#8b8fa8] mb-1">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#555870]">or click to browse</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-3 py-2.5 bg-gray-100 dark:bg-[#1e2235] rounded-lg"
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] flex items-center justify-center flex-shrink-0">
                    {file.status === 'complete' ? (
                      <CheckCircle2 size={14} className="text-[#4f6ef7]" />
                    ) : file.status === 'error' ? (
                      <X size={14} className="text-[#e05c5c]" />
                    ) : (
                      <FileText size={14} className="text-gray-400 dark:text-[#555870]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-[#8b8fa8] truncate">{file.name}</p>
                      <span className="text-[10px] text-gray-500 dark:text-[#555870] ml-2 flex-shrink-0">{file.size}</span>
                    </div>
                    {file.status !== 'complete' && file.status !== 'error' && (
                      <div className="w-full h-1 bg-gray-200 dark:bg-[#1e2030] rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-[#4f6ef7] rounded-full transition-all duration-500"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-500 dark:text-[#555870] hover:text-[#e05c5c] transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-[#1e2030] bg-gray-50 dark:bg-[#1e2235]/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-500 dark:text-[#555870] hover:text-gray-900 dark:hover:text-[#e8e9f0] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e2235]"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={!hasFiles}
            className="px-5 py-2.5 bg-[#4f6ef7] text-white rounded-lg text-sm hover:bg-[#3d5bd9] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {completedCount > 0 && completedCount === files.length
              ? `Done (${completedCount})`
              : `Upload${hasFiles ? ` (${files.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}