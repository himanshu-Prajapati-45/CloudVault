import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFileApi } from '../../services/api';

export default function UploadDropzone({ onUploadSuccess }) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      alert("File is either too large (max 10GB) or unsupported.");
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setUploadFile({ name: file.name, size: file.size });

    try {
      const result = await uploadFileApi(file, (percent) => {
        setProgress(percent);
      });
      setProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadFile(null);
        if (onUploadSuccess) {
          const ext = file.name.split('.').pop() || 'tmp';
          onUploadSuccess({
              id: result.file_id,
              name: file.name,
              type: ext,
              size: (file.size / 1024 / 1024).toFixed(1) + " MB",
              date: new Date().toLocaleDateString(),
              url: result.url,
              deleted: false
          });
        }
      }, 300);
    } catch (err) {
      setIsUploading(false);
      alert("Upload failed: " + err.message);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024 * 1024,
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-[#4f6ef7] bg-[#4f6ef7]/10' : 'border-gray-200 dark:border-[#1f2130] hover:border-gray-300 dark:hover:border-[#2a2d3e] bg-white dark:bg-[#13151c]'}`}
      >
        <input {...getInputProps()} />
        <svg className="w-12 h-12 text-[#4f6ef7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        <p className="text-gray-500 dark:text-[#8b8fa8] font-medium transition-colors duration-300">Drag & drop files here, or click to select</p>
        <p className="text-gray-500 dark:text-[#555870] text-sm mt-2 transition-colors duration-300">Supports all file types (Max 10GB)</p>
      </div>

      {isUploading && (
        <div className="mt-4 bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-xl p-4 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 min-w-0 mr-3">
              <span className="font-medium text-gray-900 dark:text-[#e8e9f0] text-sm truncate block">{uploadFile?.name || "Uploading..."}</span>
              <span className="text-xs text-gray-500 dark:text-[#555870]">{uploadFile ? (uploadFile.size / 1024 / 1024).toFixed(1) + " MB" : ""}</span>
            </div>
            <span className="text-[#4f6ef7] font-semibold text-sm">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-[#1e2030] rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#4f6ef7] to-[#7b9cff] h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}