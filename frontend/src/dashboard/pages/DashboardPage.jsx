import { useState } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FileGrid from "../components/FileGrid";
import UploadDropzone from "../components/UploadDropzone";
import ShareModal from "../components/ShareModal";

export default function DashboardPage() {
    const [showUpload, setShowUpload] = useState(false);
    const [fileToShare, setFileToShare] = useState(null);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-300 font-sans overflow-hidden transition-colors duration-300 relative">
            {/* Sidebar Component */}
            <Sidebar />

            <div className="flex-1 flex flex-col relative w-full">
                {/* Decorative Background Accents */}
                <div className="absolute top-[-15%] left-[-10%] w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-300"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-300"></div>

                {/* Header Component */}
                <Header />

                {/* Main scrollable content */}
                <main className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto relative">
                        
                        {/* Page Title & Actions */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight transition-colors duration-300">My Files</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">Manage and organize your secure cloud storage.</p>
                            </div>
                            
                            <button 
                                onClick={() => setShowUpload(!showUpload)}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showUpload ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"}></path></svg>
                                {showUpload ? "Cancel Upload" : "Upload New"}
                            </button>
                        </div>

                        {/* Upload Dropzone */}
                        {showUpload && <UploadDropzone onUploadSuccess={() => setShowUpload(false)} />}
                        
                        {/* File Grid */}
                        <FileGrid onShare={(file) => setFileToShare(file)} />
                    </div>
                </main>
            </div>

            {/* Share Modal Portal */}
            {fileToShare && <ShareModal file={fileToShare} onClose={() => setFileToShare(null)} />}
        </div>
    );
}