import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderOpen,
  Clock,
  Trash2,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  Link2,
} from 'lucide-react';

// Sub-components
import DesktopSidebar from './Layout/DesktopSidebar';
import MobileSidebar from './Layout/MobileSidebar';
import NavHeader from './Layout/NavHeader';
import { useAuth } from '../context/AuthContext';
import { fetchFilesApi, fetchTrashedFilesApi, fetchStorageStatsApi } from '../services/api';

const COLLAPSED_W = 72;
const EXPANDED_W = 248;

const navItems = [
  { label: 'My Files', path: '/dashboard', icon: FolderOpen },
  { label: 'Recent', path: '/dashboard/recent', icon: Clock },
  { label: 'Shared Links', path: '/dashboard/shared-links', icon: Link2 },
  { label: 'Trash', path: '/dashboard/trash', icon: Trash2 },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef(null);

  // Theme state — local to this component, applied to root div only
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('cloudvault-theme') === 'dark';
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('cloudvault-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    // Ensure theme is always light on mount unless previously saved as dark
    const saved = localStorage.getItem('cloudvault-theme');
    setIsDark(saved === 'dark');
  }, []);

  // Real data state
  const [files, setFiles] = useState([]);
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [storage, setStorage] = useState({ used_bytes: 0, limit_bytes: 10 * 1024 * 1024 * 1024, percentage: 0 });

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'US';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.trim().substring(0, 2).toUpperCase();
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Fetch data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const loadData = async () => {
      try {
        const [active, trashed, stats] = await Promise.all([
          fetchFilesApi(),
          fetchTrashedFilesApi(),
          fetchStorageStatsApi(),
        ]);

        const formatFile = (f) => ({
          id: f.id,
          name: f.original_name || 'Untitled',
          type: (f.original_name || '').split('.').pop()?.toUpperCase() || 'FILE',
          size: f.file_size_bytes,
          sizeLabel: ((f.file_size_bytes || 0) / 1024 / 1024).toFixed(1) + ' MB',
          date: f.uploaded_at ? new Date(f.uploaded_at).toLocaleDateString() : 'Unknown',
          rawDate: f.uploaded_at || '',
          url: f.url,
          sharedBy: 'Me',
          share_token: f.share_token || null,
          share_expires_at: f.share_expires_at || null,
          share_password: f.share_password || null,
        });

        setFiles(active.map(formatFile));
        setTrashedFiles(trashed.map(formatFile));
        setStorage(stats);
      } catch (err) {
        console.error('Failed to load data', err);
      }
    };
    loadData();
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login');
  };

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setIsHovered(false), 200);
  };

  const expanded = isHovered;
  const storagePct = Math.round(storage.percentage || 0);

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 backdrop-blur-sm z-30 md:hidden bg-black/5"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <DesktopSidebar
        EXPANDED_W={EXPANDED_W}
        COLLAPSED_W={COLLAPSED_W}
        expanded={expanded}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        isDark={isDark}
        navItems={navItems}
        isActive={isActive}
        handleNav={handleNav}
        storagePct={storagePct}
        formatSize={formatSize}
        storage={storage}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isDark={isDark}
        navItems={navItems}
        handleNav={handleNav}
        isActive={isActive}
        storagePct={storagePct}
        formatSize={formatSize}
        storage={storage}
      />

      {/* ===== MAIN CONTENT — theme-aware ===== */}
      <main className="flex-1 md:ml-[72px] flex flex-col h-full">
        {/* Top Bar */}
        {/* Top Nav Header */}
        <NavHeader
          isDark={isDark}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          toggleTheme={toggleTheme}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          getInitials={getInitials}
          user={user}
          handleNav={handleNav}
          handleLogout={handleLogout}
        />

        {/* Content — theme-aware background */}
        <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#0d0f14]' : 'bg-white'}`}>
          <Outlet context={{ files, setFiles, trashedFiles, setTrashedFiles, searchQuery, storage, isDark, toggleTheme }} />
        </div>
      </main>
    </div>
  );
}
