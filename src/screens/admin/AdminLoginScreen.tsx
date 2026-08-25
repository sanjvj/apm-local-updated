import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo, Container } from '../../components';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export const AdminLoginScreen: FC = () => {
  const navigate = useNavigate();
  const { adminLogin, isAdminAuthenticated } = useAuth();

  if (isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = adminLogin(email, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--mahogany)] via-[var(--red-dark)] to-[var(--mahogany-soft)] text-white flex flex-col justify-center items-center py-12 px-4 select-none">
      <Container className="w-full max-w-md flex flex-col gap-6 items-center">
        {/* Back to Storefront Link */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[var(--gold)] hover:underline cursor-pointer self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customer Storefront</span>
        </button>

        {/* Login Card */}
        <div className="w-full bg-white text-gray-900 border border-[var(--line)] rounded-[var(--radius)] p-6 sm:p-8 shadow-2xl flex flex-col gap-6 relative">
          
          {/* Header & Combined Logo Lockup */}
          <div className="flex flex-col items-center gap-3 text-center border-b border-gray-100 pb-5">
            <BrandLogo
              variant="full"
              badgeSize="lg"
              theme="dark"
            />
            <div className="flex flex-col gap-1 mt-2">
              <h1 className="font-display font-bold text-xl text-[var(--mahogany)]">
                Admin Portal Sign In
              </h1>
              <span className="font-mono text-xs text-gray-500 font-medium">
                Madurai Kitchen & Dispatch Management
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs font-sans text-red-700 font-semibold animate-scale-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-xs font-mono font-bold text-gray-700">
                Admin Email Address <span className="text-[var(--crimson)]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter authorized admin email"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-sans text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-xs font-mono font-bold text-gray-700">
                Admin Password <span className="text-[var(--crimson)]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 font-mono text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="
                w-full py-3.5 px-4 rounded-xl bg-[var(--crimson)] text-white font-sans font-bold text-sm
                hover:bg-[var(--crimson-dark)] active:scale-[0.99] transition-all duration-150 shadow-md
                flex items-center justify-center gap-2 cursor-pointer mt-2
              "
            >
              <ShieldCheck className="w-4 h-4 text-[var(--gold)]" />
              <span>Sign In to Admin Panel</span>
            </button>
          </form>

        </div>
      </Container>
    </div>
  );
};
