import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { fetchFilesApi, fetchTrashedFilesApi } from "../../services/api";

export default function DashboardLayout() {
    const [files, setFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Theme state — local to this component, applied to root div only
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem("cloudvault-theme") === "dark";
    });

    const toggleTheme = () => {
        setIsDark(prev => {
            const next = !prev;
            localStorage.setItem("cloudvault-theme", next ? "dark" : "light");
            return next;
        });
    };

    useEffect(() => {
        const saved = localStorage.getItem("cloudvault-theme");
        setIsDark(saved === "dark");
    }, []);

    useEffect(() => {
        const loadFiles = async () => {
            try {
                const active = await fetchFilesApi();
                const trashed = await fetchTrashedFilesApi();

                const formatFile = (f) => ({
                    id: f.id,
                    name: f.original_name || "Untitled",
                    type: (f.original_name || "").split('.').pop() || "unknown",
                    size: ((f.file_size_bytes || 0) / 1024 / 1024).toFixed(1) + " MB",
                    date: f.uploaded_at ? new Date(f.uploaded_at).toLocaleDateString() : "Unknown",
                    url: f.url,
                    deleted: f.is_trashed || false,
                    share_token: f.share_token || null,
                    share_expires_at: f.share_expires_at || null,
                    share_password: f.share_password || null
                });

                setFiles([...active.map(formatFile), ...trashed.map(formatFile)]);
            } catch (err) {
                console.error("Failed to load files", err);
            }
        };
        loadFiles();
    }, []);

    return (
        <div className={`flex h-screen font-sans overflow-hidden relative transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
            {/* Sidebar — always dark */}
            <Sidebar isDark={isDark} onToggleTheme={toggleTheme} />

            <div className="flex-1 flex flex-col relative w-full">
                {/* Header Component */}
                <Header onSearch={setSearchQuery} isDark={isDark} onToggleTheme={toggleTheme} />

                {/* Main scrollable content */}
                <main className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar bg-white dark:bg-[#0d0f14]">
                    <Outlet context={{ files, setFiles, searchQuery, isDark, toggleTheme }} />
                </main>
            </div>
        </div>
    );
}
