import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import FileGrid from "../components/FileGrid";
import UploadDropzone from "../components/UploadDropzone";
import ShareModal from "../components/ShareModal";
import { deleteFileApi } from "../../services/api";

export default function MyFilesView() {
    const { files, setFiles, searchQuery } = useOutletContext();
    const [showUpload, setShowUpload] = useState(false);
    const [fileToShare, setFileToShare] = useState(null);
    const [filter, setFilter] = useState('All');

    // Filter by type and search query
    const filteredFiles = useMemo(() => {
        let result = files.filter(f => !f.deleted);

        // Filter by Category
        if (filter === 'Documents') result = result.filter(f => ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(f.type));
        else if (filter === 'Images') result = result.filter(f => ['img', 'png', 'jpg', 'jpeg'].includes(f.type));
        else if (filter === 'Archives') result = result.filter(f => ['zip', 'rar'].includes(f.type));

        // Filter by Search Query
        if (searchQuery) {
            result = result.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        
        return result;
    }, [filter, files, searchQuery]);

    const handleUploadSuccess = (newFile) => {
        setFiles(prev => [newFile, ...prev]);
        setShowUpload(false);
    };

    const handleDelete = async (fileToDelete) => {
        if (!fileToDelete.id) {
            alert('Cannot delete this file.');
            return;
        }
        try {
            await deleteFileApi(fileToDelete.id);
            setFiles(prev => prev.map(f => f.id === fileToDelete.id ? { ...f, deleted: true } : f));
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    }

    return (
        <div className="max-w-7xl mx-auto relative">
            {/* Page Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight transition-colors duration-300">My Files</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">Manage and organize your secure cloud storage.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Filter Pills */}
                    <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 mb-1 sm:mb-0 rounded-xl transition-colors duration-300">
                        {['All', 'Documents', 'Images', 'Archives'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === f ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setShowUpload(!showUpload)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/30 transition-all w-full sm:w-auto hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showUpload ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"}></path></svg>
                        {showUpload ? "Cancel Upload" : "Upload New"}
                    </button>
                </div>
            </div>

            {/* Upload Dropzone */}
            {showUpload && <UploadDropzone onUploadSuccess={handleUploadSuccess} />}
            
            {/* File Grid */}
            <FileGrid files={filteredFiles} onShare={(file) => setFileToShare(file)} onDelete={handleDelete} />

            {/* Share Modal Portal */}
            {fileToShare && <ShareModal file={fileToShare} onClose={() => setFileToShare(null)} />}
        </div>
    );
}
