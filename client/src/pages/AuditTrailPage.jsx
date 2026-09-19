import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { History, Search, Filter, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { formatDateTime } from '../utils/formatters.js';

const AuditTrailPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/audit?limit=50&';
      if (actionFilter) url += `action=${actionFilter}&`;
      if (userRoleFilter) url += `userRole=${userRoleFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(url);
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, userRoleFilter, search]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-gov-navy-900" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              Immutable System Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Cryptographically indexable event log recording all AI OCR evaluations, officer approvals, flag overrides, and DBT transfers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Statutory Accountability
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gov-navy-900 text-xs"
          >
            <option value="">All Action Types</option>
            <option value="APPLICATION_SUBMITTED">APPLICATION_SUBMITTED</option>
            <option value="OCR_COMPLETED">OCR_COMPLETED</option>
            <option value="RULE_EVALUATED">RULE_EVALUATED</option>
            <option value="DEFICIENCY_RAISED">DEFICIENCY_RAISED</option>
            <option value="CORRECTION_SUBMITTED">CORRECTION_SUBMITTED</option>
            <option value="OFFICER_APPROVED">OFFICER_APPROVED</option>
            <option value="AI_FLAG_OVERRIDDEN">AI_FLAG_OVERRIDDEN</option>
            <option value="SANCTION_CREATED">SANCTION_CREATED</option>
            <option value="PAYMENT_UPDATED">PAYMENT_UPDATED</option>
          </select>

          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gov-navy-900 text-xs"
          >
            <option value="">All Roles</option>
            <option value="APPLICANT">APPLICANT</option>
            <option value="VERIFICATION_OFFICER">VERIFICATION_OFFICER</option>
            <option value="SELECTION_COMMITTEE">SELECTION_COMMITTEE</option>
            <option value="FINANCE_OFFICER">FINANCE_OFFICER</option>
            <option value="SYSTEM">SYSTEM / AI</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reason or user..."
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gov-navy-900"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Querying audit events...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">No audit events match filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor / User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Action Code</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Reason & Description</th>
                  <th className="p-3.5 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">{log.userName}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-gov-navy-900 text-[11px]">
                      {log.action}
                    </td>
                    <td className="p-3.5 text-slate-600">{log.entityType}</td>
                    <td className="p-3.5 text-slate-700 max-w-sm">{log.reason || 'Routine lifecycle update'}</td>
                    <td className="p-3.5 font-mono text-[10px] text-slate-400 text-right">
                      {log.ipAddress || '127.0.0.1'}
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

export default AuditTrailPage;
