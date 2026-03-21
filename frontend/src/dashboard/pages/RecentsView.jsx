import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import FileGrid from "../components/FileGrid";
import ShareModal from "../components/ShareModal";

export default function RecentsView() {
    const { files, setFiles } = useOutletContext();
    const [fileToShare, setFileToShare] = useState(null);

    // Only operate on files that are not strictly deleted
    const activeFiles = files.filter(f => !f.deleted);

    const handleDelete = (fileToDelete) => {
        if (!fileToDelete.id) return;
        setFiles(prev => prev.map(f => f.id === fileToDelete.id ? { ...f, deleted: true } : f));
    }

    return (
        <div className="max-w-7xl mx-auto relative">
            {/* Page Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight transition-colors duration-300">Recent Files</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">Files you have uploaded or interacted with recently will appear here.</p>
                </div>
            </div>
            
            {/* File Grid */}
            <FileGrid files={activeFiles} onShare={(file) => setFileToShare(file)} onDelete={handleDelete} />

            {/* Share Modal Portal */}
            {fileToShare && <ShareModal file={fileToShare} onClose={() => setFileToShare(null)} />}
        </div>
    );
}
