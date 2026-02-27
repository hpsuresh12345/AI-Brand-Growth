import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 
                      flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 
                    flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500
                          shadow-2xl shadow-violet-500/40 mb-4 ring-2 ring-violet-400/20">
            <span className="text-2xl font-black text-white">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Lead Conversion Engine
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to manage your leads with AI power
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl 
                        border border-slate-700/50 p-8 animate-fadeIn">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 
                            text-red-300 text-sm animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 
                          rounded-xl text-white placeholder-slate-500
                          focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
                          transition-all duration-200"
                placeholder="admin@leadengine.com"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 
                          rounded-xl text-white placeholder-slate-500
                          focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
                          transition-all duration-200"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-white
                        bg-gradient-to-r from-violet-600 via-violet-500 to-blue-500
                        shadow-lg shadow-violet-500/30
                        hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02]
                        active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 relative overflow-hidden group">
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                              translate-x-[-200%] group-hover:translate-x-[200%] 
                              transition-transform duration-700" />
              <span className="relative">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </span>
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 text-center mb-3">Demo Credentials:</p>
            <div className="bg-slate-800/50 rounded-lg p-3 text-xs font-mono">
              <div className="text-slate-300 mb-1">
                <span className="text-slate-500">Email:</span> admin@leadengine.com
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">Password:</span> admin123
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Powered by Claude AI & FastAPI
        </p>
      </div>
    </div>
  );
}
