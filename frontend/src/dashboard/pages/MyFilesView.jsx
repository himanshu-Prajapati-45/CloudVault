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

    const filteredFiles = useMemo(() => {
        let result = files.filter(f => !f.deleted);

        if (filter === 'Documents') result = result.filter(f => ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(f.type));
        else if (filter === 'Images') result = result.filter(f => ['img', 'png', 'jpg', 'jpeg'].includes(f.type));
        else if (filter === 'Archives') result = result.filter(f => ['zip', 'rar'].includes(f.type));

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e8e9f0] mb-2 tracking-tight">My Files</h1>
                    <p className="text-gray-500 dark:text-[#8b8fa8] text-sm">Manage and organize your secure cloud storage.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex bg-gray-100 dark:bg-[#1e2235] p-1 mb-1 sm:mb-0 rounded-xl">
                        {['All', 'Documents', 'Images', 'Archives'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === f ? 'bg-[#4f6ef7] text-white shadow-sm' : 'text-gray-500 dark:text-[#8b8fa8] hover:text-gray-900 dark:hover:text-[#e8e9f0]'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="flex items-center justify-center gap-2 bg-[#4f6ef7] hover:bg-[#3d5bd9] text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-[#4f6ef7]/20 transition-all w-full sm:w-auto"
                    >
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showUpload ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"}></path></svg>
                        {showUpload ? "Cancel Upload" : "Upload New"}
                    </button>
                </div>
            </div>

            {showUpload && <UploadDropzone onUploadSuccess={handleUploadSuccess} />}

            <FileGrid files={filteredFiles} onShare={(file) => setFileToShare(file)} onDelete={handleDelete} onDetails={(file) => {
                if (file?.url) window.open(file.url, '_blank');
            }} />

            {fileToShare && <ShareModal file={fileToShare} onClose={() => setFileToShare(null)} />}
        </div>
    );
}