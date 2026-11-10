import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ThemeToggle from '../components/ThemeToggle';
import { Lock, User, Utensils, AlertCircle } from 'lucide-react';

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create basic auth token
      const basicAuth = 'Basic ' + btoa(username + ':' + password);

      // Save auth token
      localStorage.setItem('auth', basicAuth);

      // Verify dashboard auth
      await api.get('/api/admin/dashboard?fromDate=2026-03-01&toDate=2026-03-30');

      // Then call login endpoint
      await api.get('/api/auth/login');

      navigate('/admin/dashboard');
    } catch (err) {
      console.log('Login error:', err.response?.status, err.response?.data);
      setError('Invalid username or password. Please try again.');
      localStorage.removeItem('auth');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative transition-colors duration-200">
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-5 right-5">
        <ThemeToggle showLabel={true} />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl transition-colors duration-200">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 mb-3 text-3xl">
            🍽
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Hotel Online
          </h1>
          <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mt-1">
            Admin Management Portal
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Sign in to access multi-branch operations, analytics, and reports.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 dark:focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 dark:focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-orange-600/30 disabled:opacity-60 cursor-pointer mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Maharashtrian Thali Restaurant System • v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
