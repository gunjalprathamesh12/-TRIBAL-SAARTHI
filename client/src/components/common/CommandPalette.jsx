import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Search, X, BookOpen, FileText, User, ArrowRight, CornerDownLeft } from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ schemes: [], applications: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ schemes: [], applications: [] });
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults({ schemes: [], applications: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [schemeRes, appRes] = await Promise.all([
          api.get(`/schemes?search=${encodeURIComponent(query)}`),
          api.get(`/applications?search=${encodeURIComponent(query)}`).catch(() => ({ data: [] })),
        ]);

        setResults({
          schemes: schemeRes.data?.slice(0, 4) || [],
          applications: appRes.data?.slice(0, 5) || [],
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-20">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 px-4 py-3 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schemes, application number, or certificate ID..."
            className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400 text-slate-900"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] text-slate-500 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-6 text-center text-xs text-slate-500">Searching MoTA records...</div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-slate-500 text-xs">
              <p className="font-medium text-slate-700">Quick Navigation Shortcuts</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => {
                    navigate('/schemes');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" /> All Schemes
                </button>
                <button
                  onClick={() => {
                    navigate('/demo');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1"
                >
                  ⚡ Judge Demo Hub
                </button>
              </div>
            </div>
          )}

          {/* Schemes results */}
          {results.schemes.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Schemes Matching Query
              </div>
              <div className="space-y-1">
                {results.schemes.map((scheme) => (
                  <div
                    key={scheme._id}
                    onClick={() => {
                      navigate(`/schemes`);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg hover:bg-slate-100 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-gov-navy-700 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-gov-navy-900">
                          {scheme.schemeName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Income Limit: ₹{scheme.incomeLimit?.toLocaleString('en-IN')} &bull; Level: {scheme.educationLevels?.join(', ')}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gov-navy-900" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications results */}
          {results.applications.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Applications Matching Query
              </div>
              <div className="space-y-1">
                {results.applications.map((app) => (
                  <div
                    key={app._id}
                    onClick={() => {
                      navigate(`/applicant/application/${app._id}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg hover:bg-slate-100 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {app.applicationNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Status: <span className="font-medium text-slate-700">{app.status}</span> &bull; Stage: {app.currentStage}
                        </div>
                      </div>
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && query && results.schemes.length === 0 && results.applications.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching records found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
