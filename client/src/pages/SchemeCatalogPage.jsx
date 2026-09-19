import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api.js';
import {
  GraduationCap,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const SchemeCatalogPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const location = useLocation();

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        let url = '/schemes?';
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (selectedLevel) url += `educationLevel=${encodeURIComponent(selectedLevel)}&`;
        if (selectedType) url += `schemeType=${encodeURIComponent(selectedType)}&`;

        const res = await api.get(url);
        if (res.success) {
          setSchemes(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch schemes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [search, selectedLevel, selectedType]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-gov-navy-900" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              Ministry of Tribal Affairs Schemes Directory
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Centrally sponsored scholarships and fellowships for Scheduled Tribe students (Academic Year 2025-2026)
          </p>
        </div>

        <Link
          to="/#finder"
          className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-4 py-2.5 rounded-lg border border-amber-300 flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-700" />
          AI Scheme Finder Assistant
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by scheme name or keywords..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy-900"
          />
        </div>

        <div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gov-navy-900"
          >
            <option value="">All Education Levels</option>
            <option value="Class 10">Class 9 / 10</option>
            <option value="Class 12">Class 11 / 12</option>
            <option value="Undergraduate">Undergraduate (UG)</option>
            <option value="Postgraduate">Postgraduate (PG)</option>
            <option value="Ph.D">Ph.D / Research</option>
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gov-navy-900"
          >
            <option value="">All Scheme Types</option>
            <option value="SCHOLARSHIP">Standard Scholarships</option>
            <option value="FELLOWSHIP">Doctoral Fellowships</option>
            <option value="OVERSEAS_SCHOLARSHIP">Overseas Scholarships</option>
          </select>
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          Loading official scholarship schemes...
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          No schemes match your filter criteria. Try clearing search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme) => (
            <div
              key={scheme._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-gov-navy-50 text-gov-navy-900 border border-gov-navy-200 px-2 py-0.5 rounded uppercase">
                    {scheme.schemeCode}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Apply before: {new Date(scheme.applicationEndDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-gov-navy-950 leading-snug">
                    {scheme.schemeName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {scheme.description}
                  </p>
                </div>

                {/* Key Eligibility Highlights */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
                    Core Eligibility Criteria:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-500">Income Limit:</span> Up to ₹
                      {scheme.incomeLimit?.toLocaleString('en-IN')}/yr
                    </div>
                    <div>
                      <span className="text-slate-500">Target Category:</span> {scheme.applicableCategory}
                    </div>
                    <div>
                      <span className="text-slate-500">Levels:</span> {scheme.educationLevels?.join(', ')}
                    </div>
                    <div>
                      <span className="text-slate-500">Min. Marks:</span> {scheme.minAcademicPercentage}%
                    </div>
                  </div>
                </div>

                {/* Financial Benefits Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold text-[11px] flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                    Financial Benefits & Allowances:
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    {scheme.financialBenefits?.benefitSummary}
                  </p>
                </div>

                {/* Mandatory Documents List */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-800 text-[11px]">
                    Mandatory Scanned Documents Required:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {scheme.documentsRequired?.map((doc, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {doc.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                <a
                  href="https://tribal.nic.in/ScholarshiP.aspx"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  MoTA Guidelines
                </a>

                <Link
                  to="/applicant/application/new"
                  state={{ schemeId: scheme._id }}
                  className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-colors"
                >
                  Start Application <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemeCatalogPage;
