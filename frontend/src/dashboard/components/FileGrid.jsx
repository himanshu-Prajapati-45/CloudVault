import FileCard from "./FileCard";

export default function FileGrid({ files = [], onShare, onDelete, onDetails }) {
    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#1f2130] bg-white dark:bg-[#13151c]">
                <svg className="w-16 h-16 text-gray-400 dark:text-[#555870] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                <h3 className="text-lg font-semibold text-gray-500 dark:text-[#8b8fa8]">No files yet</h3>
                <p className="text-sm text-gray-500 dark:text-[#555870] mt-1 max-w-sm">Upload your first file by clicking the "Upload New" button above.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files.map((file, index) => (
                <FileCard key={file.id || index} file={file} onShare={() => onShare && onShare(file)} onDelete={() => onDelete && onDelete(file)} onDetails={() => onDetails && onDetails(file)} />
            ))}
        </div>
    );
}