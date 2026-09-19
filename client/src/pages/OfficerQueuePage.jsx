import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Clock,
  ArrowRight,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { formatDate } from '../utils/formatters.js';

const OfficerQueuePage = () => {
  const [applications, setApplications] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQueue, setActiveQueue] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('');
  const [search, setSearch] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      let url = '/applications?';
      if (activeQueue) url += `queue=${activeQueue}&`;
      if (selectedScheme) url += `schemeId=${selectedScheme}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const [appRes, schemeRes] = await Promise.all([
        api.get(url),
        api.get('/schemes'),
      ]);

      setApplications(appRes.data || []);
      setSchemes(schemeRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeQueue, selectedScheme, search]);

  const getQueueBadge = (queue) => {
    switch (queue) {
      case 'MANUAL_REVIEW':
        return (
          <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
            MANUAL REVIEW
          </span>
        );
      case 'ATTENTION_REQUIRED':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
            ATTENTION REQUIRED
          </span>
        );
      case 'NORMAL_REVIEW':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
            NORMAL REVIEW
          </span>
        );
      case 'LOW_REVIEW_EFFORT':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
            LOW REVIEW EFFORT
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
            NORMAL REVIEW
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Officer Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-gov-navy-900" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              Verification & Scrutiny Work Queue
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Human-in-the-Loop decision support interface for verification officers & scrutiny committees.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-gov-navy-50 text-gov-navy-900 px-3 py-1.5 rounded-lg font-bold border border-gov-navy-200">
            Active Queue: {applications.length} Applications
          </span>
        </div>
      </div>

      {/* Filter Tabs for Prioritized Queues */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: '', label: 'All Queues' },
            { id: 'ATTENTION_REQUIRED', label: 'Attention Required' },
            { id: 'MANUAL_REVIEW', label: 'Manual Review (High Risk)' },
            { id: 'LOW_REVIEW_EFFORT', label: 'Low Review Effort' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveQueue(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeQueue === tab.id
                  ? 'bg-gov-navy-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search application ID..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gov-navy-900"
            />
          </div>

          <select
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gov-navy-900"
          >
            <option value="">All Schemes</option>
            {schemes.map((s) => (
              <option key={s._id} value={s._id}>
                {s.shortTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            Refreshing verification queue...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No applications match current queue filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-3.5">Application ID</th>
                  <th className="p-3.5">Candidate & Tribe</th>
                  <th className="p-3.5">Scheme</th>
                  <th className="p-3.5">Submission Date</th>
                  <th className="p-3.5">Rule Check</th>
                  <th className="p-3.5">AI Review Effort</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-gov-navy-900">
                      {app.applicationNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">
                        {app.profileId?.fullName || app.applicantId?.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {app.profileId?.tribeName || 'ST'} &bull; {app.profileId?.state}
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">
                      {app.schemeId?.shortTitle || 'ST Scheme'}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {formatDate(app.submissionDate || app.createdAt)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                          app.eligibilitySummary?.decision === 'ELIGIBLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.eligibilitySummary?.decision || 'Under Check'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {getQueueBadge(app.aiVerificationSummary?.recommendedQueue)}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/officer/verify/${app._id}`}
                        className="inline-flex items-center gap-1.5 bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Scrutinize
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerQueuePage;
