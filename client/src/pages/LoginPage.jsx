import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, switchDemoRole } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/applicant/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      addToast({
        title: 'Login Successful',
        message: `Welcome back, ${data.name}!`,
        type: 'success',
      });

      // Navigate based on role
      if (data.role === 'APPLICANT') navigate('/applicant/dashboard');
      else if (data.role === 'VERIFICATION_OFFICER' || data.role === 'SCRUTINY_OFFICER') navigate('/officer/queue');
      else if (data.role === 'SELECTION_COMMITTEE') navigate('/selection');
      else if (data.role === 'FINANCE_OFFICER') navigate('/finance');
      else if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else navigate(from);
    } catch (err) {
      addToast({
        title: 'Authentication Failed',
        message: err.userMessage || 'Invalid email or password. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role, emailAddress) => {
    setEmail(emailAddress);
    setPassword('Demo@123');
    setLoading(true);
    try {
      const data = await switchDemoRole(role);
      addToast({
        title: 'Demo Persona Activated',
        message: `Signed in as ${data.name} (${role})`,
        type: 'success',
      });

      if (role === 'APPLICANT') navigate('/applicant/dashboard');
      else if (role === 'VERIFICATION_OFFICER' || role === 'SCRUTINY_OFFICER') navigate('/officer/queue');
      else if (role === 'SELECTION_COMMITTEE') navigate('/selection');
      else if (role === 'FINANCE_OFFICER') navigate('/finance');
      else if (role === 'ADMIN' || role === 'SUPER_ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      addToast({
        title: 'Demo Switch Failed',
        message: 'Could not switch demo persona. Ensure backend database is seeded.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gov-navy-900 text-amber-400 flex items-center justify-center mx-auto shadow-md border border-amber-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-gov-navy-950 tracking-tight">
            Sign In to Tribal Saarthi
          </h2>
          <p className="text-xs text-slate-600">
            Official Ministry of Tribal Affairs Scholarship Management System
          </p>
        </div>

        {/* Demo Fast Logins Box for Judges */}
        <div className="bg-amber-50/80 border border-amber-300/80 rounded-xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>SIH Judge 1-Click Fast Login:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('APPLICANT', 'applicant@demo.com')}
              className="bg-white hover:bg-amber-100/60 border border-amber-200 text-slate-800 font-semibold p-2 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-gov-navy-900">Applicant</div>
              <div className="text-[10px] text-slate-500">applicant@demo.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('VERIFICATION_OFFICER', 'verifier@demo.com')}
              className="bg-white hover:bg-amber-100/60 border border-amber-200 text-slate-800 font-semibold p-2 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-gov-navy-900">Verification Officer</div>
              <div className="text-[10px] text-slate-500">verifier@demo.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('SELECTION_COMMITTEE', 'committee@demo.com')}
              className="bg-white hover:bg-amber-100/60 border border-amber-200 text-slate-800 font-semibold p-2 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-gov-navy-900">Selection Board</div>
              <div className="text-[10px] text-slate-500">committee@demo.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('FINANCE_OFFICER', 'finance@demo.com')}
              className="bg-white hover:bg-amber-100/60 border border-amber-200 text-slate-800 font-semibold p-2 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-gov-navy-900">Finance & DBT</div>
              <div className="text-[10px] text-slate-500">finance@demo.com</div>
            </button>
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="applicant@demo.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Demo@123"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            New student applicant?{' '}
            <Link to="/register" className="font-bold text-amber-700 hover:text-amber-800">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
