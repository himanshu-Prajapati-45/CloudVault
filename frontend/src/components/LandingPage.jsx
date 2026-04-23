import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Zap,
  Share2,
  Users,
  Globe,
  HardDrive,
  ArrowRight,
  ChevronDown,
  Check,
  Cloud,
  Menu,
  X,
  Mail,
  Terminal,
  Link,
  Shield,
  Database,
  Server,
} from 'lucide-react';
import Hero3D from './Hero3D';

// ── Scroll reveal hook ──────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: threshold },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  };
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const token = localStorage.getItem('token');

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(token ? '/dashboard' : '/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <img src="/src/assets/logo.png" alt="CloudVault" className="w-full h-full object-cover rounded-xl" />
            </div>
            <span className="text-white font-bold tracking-tight">CloudVault</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Get Started
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/5 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-400 hover:text-white py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <button onClick={() => { navigate('/login'); setMobileOpen(false); }} className="text-sm text-gray-300 py-2 text-left">Sign In</button>
            <button onClick={() => { navigate('/register'); setMobileOpen(false); }} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-medium">
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      {/* Transparent background to show full-page 3D effect */}


      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-300">Zero Knowledge • AES-256</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6"
        >
          Your Privacy, Our Priority.
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Cloud Storage Redefined.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed"
        >
          End-to-end encrypted file storage with expiring share links, team workspaces, and a REST API. Upload a file, get a link, share it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            See how it works
            <ChevronDown size={16} />
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-500 mt-6"
        >
          Free up to 10 GB • No credit card required
        </motion.p>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      title: 'End-to-End Encryption',
      desc: 'Files are encrypted client-side with AES-256 before upload. Only you hold the keys — we can\'t read your data.',
    },
    {
      title: 'Expiring Share Links',
      desc: 'Generate secure links with password protection, custom expiry, and download limits. Revoke anytime.',
    },
    {
      title: 'Up to 10GB per File',
      desc: 'Upload large files without compression. Photos, videos, design files — handle anything up to 10 gigabytes.',
    },
    {
      title: 'Team Workspaces',
      desc: 'Share files and folders with your team. Set permissions, track activity, and manage access from one dashboard.',
    },
    {
      title: 'REST API',
      desc: 'Programmatic access to upload, download, and manage files. Integrate CloudVault into your own apps.',
    },
    {
      title: '10 GB Free',
      desc: 'No credit card required. Get started with 10 gigabytes of encrypted storage, forever free.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          {...useReveal()}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Features
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <h3 className="text-white font-semibold text-lg mb-3">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ───────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Upload',
      desc: 'Drag files onto the dashboard or use the API. Any file type up to 10GB.',
    },
    {
      num: '02',
      title: 'Encrypt',
      desc: 'Files are encrypted client-side with AES-256 before they leave your browser.',
    },
    {
      num: '03',
      title: 'Share',
      desc: 'Generate a link with optional password and expiry. Send it anywhere.',
    },
    {
      num: '04',
      title: 'Access',
      desc: 'Download from any device. Revoke links instantly if needed.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          {...useReveal()}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-indigo-400/40 mb-4">{step.num}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="py-16 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Get 10 GB of encrypted storage free. No credit card.</p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
        </div>


      </div>
    </footer>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden relative" style={{ backgroundColor: '#0a0a0a' }}>
      <Hero3D isFullPage />
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <Footer />
    </div>
  );
}