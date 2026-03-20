export default function PlaceholderView({ title, description, icon }) {
    return (
        <div className="max-w-7xl mx-auto h-[70vh] flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                {icon}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">{description}</p>
        </div>
    );
}
