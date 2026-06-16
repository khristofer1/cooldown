import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-100 p-5">
          <h2 className="text-xl font-semibold text-zinc-900">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab buttons */}
          <div className="flex rounded-xl bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                !isSignUp ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                isSignUp ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-zinc-900 py-3.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn size={18} />
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-150"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-zinc-400 uppercase">Or continue with</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full rounded-xl border border-zinc-200 bg-white py-3.5 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            {/* Google Logo */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
              />
              <path
                fill="#4285F4"
                d="M16.04 15.345c-1.077.732-2.432 1.164-4.04 1.164-2.955 0-5.46-1.996-6.355-4.686L1.62 14.94A11.947 11.947 0 0 0 12 24c3.24 0 6.19-1.065 8.405-2.885l-4.365-3.77z"
              />
              <path
                fill="#34A853"
                d="M12 16.51c2.955 0 5.46-1.996 6.355-4.686l4.025 3.115A11.947 11.947 0 0 1 12 24c-3.24 0-6.19-1.065-8.405-2.885l4.365-3.77z"
                transform="rotate(180 12 12)"
              />
              <path
                fill="#FBBC05"
                d="M23.49 12.275c0-.825-.075-1.62-.215-2.385H12v4.51h6.46c-.28 1.485-1.12 2.745-2.38 3.59l4.365 3.77c2.555-2.355 4.045-5.82 4.045-9.485z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
