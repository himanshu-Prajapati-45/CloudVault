import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import FileGrid from "../components/FileGrid";
import { restoreFileApi, permanentDeleteFileApi } from "../../services/api";

export default function TrashView() {
    const { files, setFiles } = useOutletContext();
    const trashedFiles = files.filter(f => f.deleted);

    const handleRestore = async (fileToRestore) => {
        try {
            await restoreFileApi(fileToRestore.id);
            setFiles(prev => prev.map(f => f.id === fileToRestore.id ? { ...f, deleted: false } : f));
        } catch (err) {
            alert("Restore failed: " + err.message);
        }
    };

    const handlePermanentDelete = async (fileToDelete) => {
        try {
            await permanentDeleteFileApi(fileToDelete.id);
            setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
        } catch (err) {
            alert("Permanent delete failed: " + err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight transition-colors duration-300">Trash Bin</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">Items here will be permanently deleted after 30 days.</p>
                </div>
            </div>
            
            {trashedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Trash is empty</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Files you delete will show up here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {trashedFiles.map((file) => (
                        <div key={file.id} className="group relative bg-red-50/50 dark:bg-red-900/10 backdrop-blur-xl border border-red-200 dark:border-red-900/50 rounded-2xl p-5 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 truncate">{file.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{file.size} • {file.date}</p>
                            
                            <div className="flex gap-2 mt-auto">
                                <button 
                                    onClick={() => handleRestore(file)}
                                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    Restore
                                </button>
                                <button 
                                    onClick={() => handlePermanentDelete(file)}
                                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    Del Forever
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
