import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  CheckCircle2,
  Link2,
  Lock,
  Clock,
  Shield,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { shareFileApi } from '../services/api';

const EXPIRY_OPTIONS = [
  { value: 1, label: '1 Hour' },
  { value: 24, label: '24 Hours' },
  { value: 72, label: '3 Days' },
  { value: 168, label: '7 Days' },
];

export default function ShareModal({ file, onClose, onShareCreated }) {
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const [expiryHours, setExpiryHours] = useState(24);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const generateAndCopy = async () => {
    if (!file?.id) return;
    setIsGenerating(true);
    setError('');
    try {
      const result = await shareFileApi(
        file.id,
        expiryHours,
        passwordEnabled ? password : null
      );
      const baseUrl = window.location.origin;
      const token = result.share_url.split('/share/')[1];
      const link = `${baseUrl}/share/${token}`;
      setShareLink(link);
      await navigator.clipboard.writeText(link).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (onShareCreated) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiryHours);
        onShareCreated({
          ...file,
          share_token: token,
          share_expires_at: expiresAt.toISOString(),
          share_password: passwordEnabled ? true : null
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate share link');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white dark:bg-[#13151c] rounded-2xl shadow-2xl shadow-black/30 border border-gray-200 dark:border-[#1f2130] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#1e2030]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1e2235] flex items-center justify-center flex-shrink-0">
              <Link2 size={14} className="text-[#4f6ef7]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm text-gray-900 dark:text-[#e8e9f0]">Share File</h2>
              <p className="text-[11px] text-gray-500 dark:text-[#555870] truncate max-w-[240px]">{file?.name || 'File'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e2235] flex items-center justify-center text-gray-500 dark:text-[#555870] hover:text-gray-900 dark:hover:text-[#e8e9f0] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Error */}
          {error && (
            <p className="text-xs text-[#e05c5c] bg-[#e05c5c]/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Expiry */}
          <div>
            <label className="text-[10px] text-gray-500 dark:text-[#555870] uppercase tracking-widest mb-2 flex items-center gap-1">
              <Clock size={11} />
              Link Expiry
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setExpiryHours(opt.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                    expiryHours === opt.value
                      ? 'bg-[#4f6ef7] text-white border-[#4f6ef7]'
                      : 'bg-gray-100 dark:bg-[#1e2235] text-gray-500 dark:text-[#8b8fa8] border-gray-200 dark:border-[#1f2130] hover:border-gray-300 dark:hover:border-[#2a2d3e]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <button
              onClick={() => setPasswordEnabled(!passwordEnabled)}
              className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#8b8fa8] hover:text-gray-900 dark:hover:text-[#e8e9f0] transition-colors"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                passwordEnabled ? 'bg-[#4f6ef7] border-[#4f6ef7]' : 'border-gray-300 dark:border-[#2a2d3e]'
              }`}>
                {passwordEnabled && <CheckCircle2 size={8} className="text-white" />}
              </div>
              <Lock size={12} />
              Password protection
            </button>

            <AnimatePresence>
              {passwordEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set a password"
                      className="w-full h-10 px-3 pr-10 bg-gray-100 dark:bg-[#1e2235] border border-gray-200 dark:border-[#1f2130] rounded-xl text-sm text-gray-900 dark:text-[#e8e9f0] placeholder-gray-400 dark:placeholder-[#555870] focus:outline-none focus:border-[#4f6ef7] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#555870] hover:text-gray-700 dark:hover:text-[#8b8fa8] text-xs"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* QR Code + Link */}
          <AnimatePresence mode="wait">
            {shareLink ? (
              <motion.div
                key="qr-display"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-gray-100 dark:bg-[#1e2235] p-3 rounded-2xl border border-gray-200 dark:border-[#1f2130] shadow-sm inline-block">
                    <QRCodeSVG
                      value={shareLink}
                      size={140}
                      level="M"
                      includeMargin={false}
                      bgColor="#1e2235"
                      fgColor="#e8e9f0"
                    />
                  </div>
                </div>

                {/* Share link */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1e2235] rounded-xl px-3 py-2.5 border border-gray-200 dark:border-[#1f2130] overflow-hidden">
                  <Link2 size={12} className="text-gray-500 dark:text-[#555870] flex-shrink-0" />
                  <span className="text-[11px] text-gray-500 dark:text-[#8b8fa8] font-mono truncate block min-w-0 flex-1">
                    {shareLink}
                  </span>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink).catch(() => {});
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`w-full h-10 flex items-center justify-center gap-2 text-xs font-medium rounded-xl transition-all ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#4f6ef7] text-white hover:bg-[#3d5bd9]'
                  }`}
                >
                  {copied ? (
                    <><CheckCircle2 size={14} /> Copied!</>
                  ) : (
                    <><Copy size={14} /> Copy Link</>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="generate-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  onClick={generateAndCopy}
                  disabled={isGenerating}
                  className="w-full h-11 bg-[#4f6ef7] text-white rounded-xl text-sm font-medium hover:bg-[#3d5bd9] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Link2 size={15} />
                      Generate & Copy Link
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-[#1e2235]/50 border-t border-gray-200 dark:border-[#1e2030] flex items-center gap-1.5">
          <Shield size={10} className="text-gray-500 dark:text-[#555870]" />
          <span className="text-[10px] text-gray-500 dark:text-[#555870]">Encrypted link · AES-256</span>
        </div>
      </motion.div>
    </motion.div>
  );
}