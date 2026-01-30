import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, RotateCcw, Mail, Lock, User as UserIcon, CheckCircle } from 'lucide-react';
import { brand } from '../branding/brand';

export function Login() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('nedpearson@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [faceRecognition, setFaceRecognition] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { login, signup, loginDemo, loginWithGoogle, forgotPassword, resetLocalData } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Focus email input when mode changes
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [mode]);

  const handleModeChange = (newMode: 'login' | 'signup' | 'forgot') => {
    setIsTransitioning(true);
    setError('');
    setSuccess('');
    setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);
    }, 150);
  };

  const handleResetAuth = () => {
    if (confirm('Reset all local auth data? This will clear all users, sessions, and app data. The page will reload.')) {
      resetLocalData();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess('Password reset link sent to your email!');
      setTimeout(() => {
        handleModeChange('login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await loginWithGoogle();
      setSuccess('Successfully signed in with Google!');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password, rememberMe);
        setSuccess('Welcome back! Signing you in...');
      } else {
        await signup(email, password, name, faceRecognition);
        setSuccess('Account created successfully! Welcome aboard!');
      }
    } catch (err: any) {
      if (err.message === 'ACCOUNT_EXISTS') {
        setError('Account already exists — please Sign In');
        setTimeout(() => {
          handleModeChange('login');
        }, 2000);
      } else {
        setError(err.message || (mode === 'login' ? 'Invalid email or password' : 'Failed to create account'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginDemo();
    } catch (_err: unknown) {
      setError('Failed to create demo workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel rounded-3xl shadow-2xl p-8 sm:p-10 neural-glow">
          {/* Logo and Slogan */}
          <div className="text-center mb-8">
            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src="/brand/pearson_nexus_ai_logo.png" 
                alt="Pearson Nexus AI Logo" 
                className="w-full h-full max-w-[520px] max-h-[260px] object-contain object-center"
              />
            </div>
            <p className="text-sm sm:text-base text-gray-400 font-medium tracking-wide px-4">
              {brand.slogan}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div 
              className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-xl backdrop-blur-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300"
              role="alert"
              aria-live="polite"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-green-300">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div 
              className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Mode Switcher */}
          {mode !== 'forgot' && (
            <div className="flex gap-2 mb-6" role="tablist" aria-label="Authentication mode">
              <button
                onClick={() => handleModeChange('login')}
                disabled={loading}
                className={`flex-1 py-3 rounded-xl font-medium smooth-transition ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800/70 border border-gray-700/50'
                }`}
                role="tab"
                aria-selected={mode === 'login' ? 'true' : 'false'}
                aria-controls="auth-form"
              >
                Sign In
              </button>
              <button
                onClick={() => handleModeChange('signup')}
                disabled={loading}
                className={`flex-1 py-3 rounded-xl font-medium smooth-transition ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800/70 border border-gray-700/50'
                }`}
                role="tab"
                aria-selected={mode === 'signup' ? 'true' : 'false'}
                aria-controls="auth-form"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Back to Login Link for Forgot Password */}
          {mode === 'forgot' && (
            <div className="mb-6">
              <button
                onClick={() => handleModeChange('login')}
                disabled={loading}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium smooth-transition flex items-center gap-1"
                aria-label="Back to sign in"
              >
                <span aria-hidden="true">←</span> Back to Sign In
              </button>
            </div>
          )}

          {/* Main Form */}
          <form 
            ref={formRef}
            onSubmit={mode === 'forgot' ? handleForgotPassword : handleSubmit} 
            className={`space-y-4 ${isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'} transition-opacity duration-150`}
            id="auth-form"
            role="tabpanel"
            aria-label={mode === 'login' ? 'Sign in form' : mode === 'signup' ? 'Sign up form' : 'Password reset form'}
          >
            {/* Forgot Password Title */}
            {mode === 'forgot' && (
              <div className="mb-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-sm text-gray-400">Enter your email and we'll send you a reset link.</p>
              </div>
            )}

            {/* Name Field - Sign Up Only */}
            {mode === 'signup' && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name <span className="text-red-400" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <UserIcon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ned Pearson"
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition backdrop-blur-sm"
                    required
                    disabled={loading}
                    aria-required="true"
                    aria-describedby={mode === 'signup' ? 'name-hint' : undefined}
                  />
                </div>
                <p id="name-hint" className="sr-only">Enter your full name for account creation</p>
              </div>
            )}

            {/* Email Field */}
            <div className={mode === 'signup' || mode === 'forgot' ? 'animate-in fade-in slide-in-from-right-2 duration-300' : ''}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email <span className="text-red-400" aria-label="required">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <input
                  ref={emailInputRef}
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nedpearson@gmail.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition backdrop-blur-sm"
                  required
                  disabled={loading}
                  aria-required="true"
                  aria-describedby="email-hint"
                />
              </div>
              <p id="email-hint" className="sr-only">Enter your email address</p>
            </div>

            {/* Password Field - Not for Forgot Password */}
            {mode !== 'forgot' && (
              <div className={mode === 'signup' ? 'animate-in fade-in slide-in-from-right-2 duration-300' : ''}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password <span className="text-red-400" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Lock className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full pl-11 pr-12 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition backdrop-blur-sm"
                    required
                    disabled={loading}
                    minLength={mode === 'signup' ? 6 : undefined}
                    aria-required="true"
                    aria-describedby="password-hint"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    disabled={loading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p id="password-hint" className="sr-only">
                  {mode === 'signup' ? 'Password must be at least 6 characters' : 'Enter your account password'}
                </p>
              </div>
            )}

            {/* Confirm Password Field - Sign Up Only */}
            {mode === 'signup' && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password <span className="text-red-400" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Lock className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition backdrop-blur-sm"
                    required
                    disabled={loading}
                    minLength={6}
                    aria-required="true"
                    aria-describedby="confirm-password-hint"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    disabled={loading}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p id="confirm-password-hint" className="sr-only">Re-enter your password to confirm</p>
              </div>
            )}

            {/* Remember Me - Login Only */}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-700 rounded focus:ring-cyan-500 focus:ring-2"
                    disabled={loading}
                    aria-describedby="remember-me-hint"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300 cursor-pointer">
                    Remember me
                  </label>
                  <p id="remember-me-hint" className="sr-only">Keep me signed in on this device</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleModeChange('forgot')}
                  disabled={loading}
                  className="text-sm text-cyan-400 hover:text-cyan-300 smooth-transition font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Face Recognition - Sign Up Only */}
            {mode === 'signup' && (
              <div className="flex items-start animate-in fade-in slide-in-from-right-2 duration-300">
                <input
                  id="face-recognition"
                  type="checkbox"
                  checked={faceRecognition}
                  onChange={(e) => setFaceRecognition(e.target.checked)}
                  className="w-4 h-4 mt-1 text-cyan-600 bg-gray-800 border-gray-700 rounded focus:ring-cyan-500 focus:ring-2"
                  disabled={loading}
                  aria-describedby="face-recognition-hint"
                />
                <label htmlFor="face-recognition" className="ml-2 text-sm text-gray-300 cursor-pointer">
                  Enable face recognition (coming soon - placeholder only)
                </label>
                <p id="face-recognition-hint" className="sr-only">Optional: Enable biometric authentication</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 smooth-transition shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label={
                mode === 'login' 
                  ? (loading ? 'Signing in, please wait' : 'Sign in to your account')
                  : mode === 'signup'
                  ? (loading ? 'Creating account, please wait' : 'Create new account')
                  : (loading ? 'Sending reset link, please wait' : 'Send password reset link')
              }
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  {mode === 'login' ? 'Signing In...' : mode === 'signup' ? 'Creating Account...' : 'Sending Link...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
              )}
            </button>
          </form>

          {/* Alternative Login Methods */}
          {mode !== 'forgot' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">or</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                type="button"
                className="mt-4 w-full bg-white text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-100 smooth-transition border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Sign in with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Demo Login Button */}
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                type="button"
                className="mt-3 w-full bg-gray-800/50 text-gray-300 py-3.5 rounded-xl font-semibold hover:bg-gray-800/70 smooth-transition border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Try demo workspace"
              >
                Try Demo
              </button>
            </div>
          )}

          {/* Info Text */}
          {mode !== 'forgot' && (
            <div className="mt-6 text-center text-xs text-gray-400" role="contentinfo">
              <p>Create account to access all features with full offline support.</p>
              <p className="mt-1">Demo creates a temporary workspace for testing.</p>
              <p className="mt-2 text-cyan-400/90">Default admin: nedpearson@gmail.com / 1Pearson2</p>
            </div>
          )}

          {/* Developer Reset Button */}
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <button
              onClick={handleResetAuth}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-gray-400 smooth-transition disabled:opacity-50 focus:outline-none focus:text-gray-400"
              aria-label="Reset local authentication data for development"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              Reset Local Auth & Data (Dev)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
