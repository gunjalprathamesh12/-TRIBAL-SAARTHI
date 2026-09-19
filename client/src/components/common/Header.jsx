import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';
import {
  GraduationCap,
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Zap,
  Menu,
  X,
  FileText,
  HelpCircle,
  Layers,
  ChevronDown,
} from 'lucide-react';

const Header = ({ onOpenSearch }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const {
    language,
    setLanguage,
    decreaseFontSize,
    resetFontSize,
    increaseFontSize,
    toggleContrast,
    highContrast,
    t,
  } = useAccessibility();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = async (role) => {
    try {
      await switchDemoRole(role);
      setRoleDropdownOpen(false);
      // Navigate to appropriate role dashboard
      if (role === 'APPLICANT') navigate('/applicant/dashboard');
      else if (role === 'VERIFICATION_OFFICER' || role === 'SCRUTINY_OFFICER') navigate('/officer/queue');
      else if (role === 'SELECTION_COMMITTEE') navigate('/selection');
      else if (role === 'FINANCE_OFFICER') navigate('/finance');
      else if (role === 'ADMIN' || role === 'SUPER_ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'APPLICANT':
        return '/applicant/dashboard';
      case 'VERIFICATION_OFFICER':
      case 'SCRUTINY_OFFICER':
        return '/officer/queue';
      case 'SELECTION_COMMITTEE':
        return '/selection';
      case 'FINANCE_OFFICER':
        return '/finance';
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* 1. Indian National Tricolor & Accessibility Top Bar */}
      <div className="w-full h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600 border-b border-slate-200"></div>

      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-medium tracking-wide flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            GOVERNMENT OF INDIA &bull; MINISTRY OF TRIBAL AFFAIRS
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            SIH PS 26239: Smart Education Theme
          </span>
        </div>

        {/* Accessibility & Language Toolbar */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center bg-slate-800 rounded px-1 border border-slate-700">
            <button
              onClick={decreaseFontSize}
              title="Decrease Font Size"
              className="px-1.5 py-0.5 hover:text-amber-400 font-semibold cursor-pointer"
            >
              A-
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={resetFontSize}
              title="Default Font Size"
              className="px-1.5 py-0.5 hover:text-amber-400 font-semibold cursor-pointer"
            >
              A
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={increaseFontSize}
              title="Increase Font Size"
              className="px-1.5 py-0.5 hover:text-amber-400 font-semibold cursor-pointer"
            >
              A+
            </button>
          </div>

          <button
            onClick={toggleContrast}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              highContrast
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                : 'border-slate-700 hover:border-slate-500 text-slate-300'
            }`}
          >
            {highContrast ? 'Standard Contrast' : 'High Contrast'}
          </button>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (HI)</option>
            <option value="mr">मराठी (MR)</option>
          </select>

          {/* Judge Demo Quick Link */}
          <Link
            to="/demo"
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-2.5 py-0.5 rounded flex items-center gap-1 shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Judge Demo Hub</span>
          </Link>
        </div>
      </div>

      {/* 2. Main GovTech Branding & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-gov-navy-900 to-gov-navy-700 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform border border-amber-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-gov-navy-950">
                TRIBAL SAARTHI
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                MoTA AI Portal
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Scholarship & Fellowship Management System &bull; MoTA
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-slate-100 text-gov-navy-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-gov-navy-900'
            }`}
          >
            {t('home')}
          </Link>

          <Link
            to="/schemes"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname.startsWith('/schemes')
                ? 'bg-slate-100 text-gov-navy-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-gov-navy-900'
            }`}
          >
            {t('schemes')}
          </Link>

          <Link
            to="/schemes?finder=true"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 transition-colors"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
            {t('findScheme')}
          </Link>

          <Link
            to="/privacy"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-gov-navy-900 transition-colors"
          >
            Security & Privacy
          </Link>
        </nav>

        {/* Global Search & User Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Ctrl+K Button */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            title="Search schemes, applicants or applications (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search portal...</span>
            <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] text-slate-500 shadow-2xs font-mono">
              Ctrl+K
            </kbd>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {/* Role Switcher Pill for Demo */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 bg-gov-navy-50 hover:bg-gov-navy-100 text-gov-navy-900 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-gov-navy-200 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-gov-navy-700" />
                  <span className="hidden sm:inline">Role:</span> {user.role.replace('_', ' ')}
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs animate-in fade-in">
                    <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
                      Switch Demo Persona
                    </div>
                    {[
                      { role: 'APPLICANT', label: 'Applicant Student' },
                      { role: 'VERIFICATION_OFFICER', label: 'Verification Officer' },
                      { role: 'SCRUTINY_OFFICER', label: 'Scrutiny Officer' },
                      { role: 'SELECTION_COMMITTEE', label: 'Selection Committee' },
                      { role: 'FINANCE_OFFICER', label: 'Finance / DBT Officer' },
                      { role: 'ADMIN', label: 'System Administrator' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        onClick={() => handleRoleSwitch(item.role)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                          user.role === item.role ? 'font-bold text-gov-navy-900 bg-amber-50' : 'text-slate-700'
                        }`}
                      >
                        <span>{item.label}</span>
                        {user.role === item.role && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Portal Workspace Button */}
              <Link
                to={getDashboardPath()}
                className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Workspace</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Logout"
                className="text-slate-600 hover:text-red-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-gov-navy-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-xs transition-colors"
              >
                {t('register')}
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-md"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation collapse */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-800 border-b border-slate-100"
          >
            {t('home')}
          </Link>
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-800 border-b border-slate-100"
          >
            {t('schemes')}
          </Link>
          <Link
            to="/schemes?finder=true"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-amber-800 border-b border-slate-100"
          >
            {t('findScheme')}
          </Link>
          <Link
            to="/demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-amber-700"
          >
            Judge Demo Presentation Hub
          </Link>
        </div>
      )}
    </header>
  );
};

const SparklesIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
  </svg>
);

export default Header;
