import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, BookOpen, Zap } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-extrabold text-gov-navy-950">404</div>
          <h1 className="text-lg font-bold text-slate-900">Portal Page Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The scholarship resource or directory you requested does not exist or has been relocated under MoTA records.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2 text-xs">
          <Link
            to="/"
            className="w-full bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
          <Link
            to="/schemes"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Browse Scholarship Schemes
          </Link>
          <Link
            to="/demo"
            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 border border-amber-200 transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-600" /> Judge Demo Presentation Hub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
