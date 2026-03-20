import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFileApi } from '../../services/api';

export default function UploadDropzone({ onUploadSuccess }) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      alert("File is either too large (max 100MB) or unsupported format.");
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(30);

    try {
      const result = await uploadFileApi(file);
      setProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
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
      }, 500);
    } catch (err) {
      setIsUploading(false);
      alert("Upload failed: " + err.message);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024 * 1024, // 10 GB
    // Removed specific 'accept' type to allow all file extensions as requested
  });

  return (
    <div className="mb-8">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-800/20'}`}
      >
        <input {...getInputProps()} />
        <svg className="w-12 h-12 text-indigo-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        <p className="text-slate-700 dark:text-slate-300 font-medium transition-colors duration-300">Drag & drop files here, or click to select</p>
        <p className="text-slate-500 dark:text-slate-500 text-sm mt-2 transition-colors duration-300">Supports all file types (Max 10GB)</p>
      </div>

      {isUploading && (
        <div className="mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm transition-colors duration-300">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-800 dark:text-slate-200">Uploading...</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
