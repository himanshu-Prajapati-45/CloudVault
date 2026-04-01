import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { fetchFilesApi, fetchTrashedFilesApi } from "../../services/api";

export default function DashboardLayout() {
    const [files, setFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadFiles = async () => {
            try {
                // Fetch both active and trashed files to merge into the global context
                const active = await fetchFilesApi();
                const trashed = await fetchTrashedFilesApi();
                
                const formatFile = (f) => ({
                    id: f.id,
                    name: f.original_name || "Untitled",
                    type: (f.original_name || "").split('.').pop() || "unknown",
                    size: ((f.file_size_bytes || 0) / 1024 / 1024).toFixed(1) + " MB",
                    date: f.uploaded_at ? new Date(f.uploaded_at).toLocaleDateString() : "Unknown",
                    url: f.url,
                    deleted: f.is_trashed || false
                });

                setFiles([...active.map(formatFile), ...trashed.map(formatFile)]);
            } catch (err) {
                console.error("Failed to load files", err);
            }
        };
        loadFiles();
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-300 font-sans overflow-hidden transition-colors duration-300 relative">
            {/* Sidebar Component */}
            <Sidebar />

            <div className="flex-1 flex flex-col relative w-full">
                {/* Decorative Background Accents */}
                <div className="absolute top-[-15%] left-[-10%] w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-300"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-300"></div>

                {/* Header Component */}
                <Header onSearch={setSearchQuery} />

                {/* Main scrollable content */}
                <main className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar">
                    <Outlet context={{ files, setFiles, searchQuery }} />
                </main>
            </div>
        </div>
    );
}
