import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

/* --- Login/Signup Form --- */
function LoginForm({ activeTab, setActiveTab, formData, setFormData, showPassword, setShowPassword, isLoading, error, onSubmit, onGoogleSuccess, onGoogleError, variant, navigate }) {
	const isMobile = variant === 'mobile';

	return (
		<>
			{/* Tabs */}
			<div className="flex mb-6 rounded-lg p-1 bg-gray-100">
				<button
					onClick={() => setActiveTab('signin')}
					className={`flex-1 py-2.5 rounded-md text-sm transition-all ${activeTab === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
				>
					Sign In
				</button>
				<button
					onClick={() => setActiveTab('signup')}
					className={`flex-1 py-2.5 rounded-md text-sm transition-all ${activeTab === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
				>
					Create Account
				</button>
			</div>

			<AnimatePresence mode="wait">
				<motion.div
					key={activeTab + variant}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					transition={{ duration: 0.2, ease: 'easeInOut' }}
				>
					<div className="mb-6">
						<h2 className="text-2xl mb-2 tracking-tight text-gray-900">
							{activeTab === 'signin' ? 'Welcome back' : 'Get started'}
						</h2>
						<p className="text-sm text-gray-500">
							{activeTab === 'signin' ? 'Enter your credentials to access your files.' : 'Create an account to start storing files.'}
						</p>
					</div>
				</motion.div>
			</AnimatePresence>

			{error && (
				<div className="p-3 mb-4 text-sm rounded-lg border text-red-600 bg-red-50 border-red-200">
					{error}
				</div>
			)}

			<AnimatePresence mode="wait">
				<motion.form
					key={activeTab + '-form-' + variant}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					onSubmit={onSubmit}
					className="space-y-4"
				>
					<AnimatePresence mode="wait">
						{activeTab === 'signup' && (
							<motion.div
								key="fullname-field"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.2 }}
							>
								<label className="text-xs uppercase tracking-wider mb-1.5 block text-gray-500">Full Name</label>
								<input
									type="text"
									name="fullname"
									value={formData.fullname}
									onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
									className="w-full h-11 px-4 rounded-lg text-sm transition-all focus:outline-none mb-4 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"
									placeholder="Enter your name"
									required
								/>
							</motion.div>
						)}
					</AnimatePresence>

					<div>
						<label className="text-xs uppercase tracking-wider mb-1.5 block text-gray-500">Email</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className="w-full h-11 px-4 rounded-lg text-sm transition-all focus:outline-none bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"
							placeholder="name@gmail.com"
							required
						/>
					</div>

					<div>
						<div className="flex items-center justify-between mb-1.5">
							<label className="text-xs uppercase tracking-wider text-gray-500">Password</label>
						</div>
						<div className="relative">
							<input
								type={showPassword ? 'text' : 'password'}
								name="password"
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								className="w-full h-11 px-4 pr-10 rounded-lg text-sm transition-all focus:outline-none bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"
								placeholder="••••••••"
								required
							/>
							<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
								{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</div>

					<AnimatePresence>
						{activeTab === 'signin' && (
							<motion.div
								key="forgot-link"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="flex justify-end -mt-1"
							>
								<button
									type="button"
									onClick={() => navigate('/forgot-password')}
									className="text-xs transition-colors text-gray-400 hover:text-gray-600"
								>
									Forgot password?
								</button>
							</motion.div>
						)}
					</AnimatePresence>

					<AnimatePresence mode="wait">
						{activeTab === 'signup' && (
							<motion.div
								key="confirm-field"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.2 }}
							>
								<label className="text-xs uppercase tracking-wider mb-1.5 block text-gray-500">Confirm Password</label>
								<input
									type="password"
									name="confirm"
									value={formData.confirm}
									onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
									className="w-full h-11 px-4 rounded-lg text-sm transition-all focus:outline-none mb-4 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"
									placeholder="••••••••"
									required
								/>
							</motion.div>
						)}
					</AnimatePresence>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full h-11 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-60 bg-indigo-500 text-white hover:bg-indigo-600"
					>
						{isLoading ? (
							<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						) : (
							<>
								<span>{activeTab === 'signin' ? 'Sign In' : 'Create Account'}</span>
								<ArrowRight size={16} />
							</>
						)}
					</button>
				</motion.form>
			</AnimatePresence>

			{/* Divider */}
			<div className="flex items-center gap-4 my-5">
				<div className="flex-1 h-px bg-gray-200" />
				<span className="text-xs text-gray-400">or continue with</span>
				<div className="flex-1 h-px bg-gray-200" />
			</div>

			{/* Google OAuth */}
			<GoogleLogin
				onSuccess={onGoogleSuccess}
				onError={onGoogleError}
				render={({ onClick, disabled }) => (
					<button
						type="button"
						onClick={onClick}
						disabled={disabled || isLoading}
						className="w-full h-11 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-60 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
					>
						<svg viewBox="0 0 24 24" width="18" height="18">
							<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
							<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
							<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
							<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
						</svg>
						<span>{activeTab === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}</span>
					</button>
				)}
			/>


		</>
	);
}

/* --- Main LoginPage Component --- */
export default function LoginPage({ initialTab = 'signin' }) {
	const navigate = useNavigate();
	const { login, register, googleLogin, token } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({ fullname: '', email: '', password: '', confirm: '' });
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [activeTab, setActiveTab] = useState(initialTab);

	useEffect(() => {
		if (token) navigate('/dashboard');
	}, [token, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			if (activeTab === 'signup') {
				if (formData.password !== formData.confirm) {
					throw new Error('Passwords do not match');
				}
				await register(formData.fullname, formData.email, formData.password);
			} else {
				await login(formData.email, formData.password);
			}
			navigate('/dashboard');
		} catch (err) {
			setError(err.message || 'Authentication failed');
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSuccess = async (credentialResponse) => {
		try {
			setError('');
			await googleLogin(credentialResponse.credential);
			navigate('/dashboard');
		} catch (err) {
			setError(err.message || 'Google authentication failed');
		}
	};

	const handleGoogleError = () => {
		setError('Google authentication failed');
	};

	const formProps = {
		activeTab, setActiveTab,
		formData, setFormData,
		showPassword, setShowPassword,
		isLoading, error,
		onSubmit: handleSubmit,
		onGoogleSuccess: handleGoogleSuccess,
		onGoogleError: handleGoogleError,
		navigate,
	};

	return (
		<>
			{/* ===== MOBILE VIEW ===== */}
			<div className="lg:hidden relative min-h-screen w-full bg-gradient-to-br from-indigo-50 to-white overflow-auto">
				<div className="flex items-center gap-3 p-5 pt-6">
					<button
						onClick={() => navigate('/')}
						className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
					>
						<ArrowLeft size={16} className="text-gray-500" />
					</button>
					<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
						<img src="/src/assets/logo.png" alt="CloudVault" className="w-full h-full object-cover rounded-xl" />
					</div>
					<span className="text-gray-900 tracking-tight font-semibold">CloudVault</span>
				</div>

				<div className="flex items-start justify-center px-5 pb-8 pt-2">
					<div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
						<LoginForm {...formProps} variant="mobile" />
					</div>
				</div>
			</div>

			{/* ===== DESKTOP VIEW ===== */}
			<div className="hidden lg:flex min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-blue-50">
				{/* Left Side - Image */}
				<div className="w-5/12 relative overflow-hidden">
					<img src="/src/assets/123.png" alt="Cloud Storage" className="w-full h-full object-cover" />

					{/* Overlay header */}
					<div className="absolute top-0 left-0 right-0 p-8 z-20">
						<div className="flex items-center gap-3">
							<button
								onClick={() => navigate('/')}
								className="w-9 h-9 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center hover:bg-black/50 transition-colors backdrop-blur-sm"
							>
								<ArrowLeft size={16} className="text-white/70" />
							</button>
							<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
								<img src="/src/assets/logo.png" alt="CloudVault" className="w-full h-full object-cover rounded-xl" />
							</div>
							<span className="text-white/90 tracking-tight font-semibold">CloudVault</span>
						</div>
					</div>

					{/* Overlay footer */}
					<div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
						<h1 className="text-3xl text-white leading-tight tracking-tight mb-3" style={{ fontWeight: 300 }}>
							Secure Cloud<br />Document Storage<br />& Sharing.
						</h1>
						<p className="text-gray-300 max-w-xs leading-relaxed text-sm mb-4">
							Store, share, and manage your documents with secure cloud storage.
						</p>
					</div>
				</div>

				{/* Right Side - Form */}
				<div className="w-7/12 flex items-center justify-center p-12 lg:p-24 bg-white">
					<div className="w-full max-w-sm">
						<LoginForm {...formProps} variant="desktop" />
					</div>
				</div>
			</div>
		</>
	);
}
