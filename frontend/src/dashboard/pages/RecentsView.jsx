import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import FileGrid from "../components/FileGrid";
import ShareModal from "../components/ShareModal";

export default function RecentsView() {
    const { files, setFiles } = useOutletContext();
    const [fileToShare, setFileToShare] = useState(null);

    const activeFiles = files.filter(f => !f.deleted);

    const handleDelete = (fileToDelete) => {
        if (!fileToDelete.id) return;
        setFiles(prev => prev.map(f => f.id === fileToDelete.id ? { ...f, deleted: true } : f));
    }

    return (
        <div className="max-w-7xl mx-auto relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e8e9f0] mb-2 tracking-tight">Recent Files</h1>
                    <p className="text-gray-500 dark:text-[#8b8fa8] text-sm">Files you have uploaded or interacted with recently will appear here.</p>
                </div>
            </div>

            <FileGrid files={activeFiles} onShare={(file) => setFileToShare(file)} onDelete={handleDelete} />

            {fileToShare && <ShareModal file={fileToShare} onClose={() => setFileToShare(null)} />}
        </div>
    );
}