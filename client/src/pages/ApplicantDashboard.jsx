import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import {
  GraduationCap,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  CreditCard,
  Bell,
  UploadCloud,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  User,
  PlusCircle,
} from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters.js';

const ApplicantDashboard = () => {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [deficiencies, setDeficiencies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appRes, defRes, notifRes] = await Promise.all([
          api.get('/applications'),
          api.get('/deficiencies?status=OPEN'),
          api.get('/notifications'),
        ]);

        setApplications(appRes.data || []);
        setDeficiencies(defRes.data || []);
        setNotifications(notifRes.data?.slice(0, 4) || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Draft</span>;
      case 'SUBMITTED':
      case 'UNDER_VERIFICATION':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Under Verification</span>;
      case 'DEFICIENCY_RAISED':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse">Deficiency Action Required</span>;
      case 'CORRECTION_SUBMITTED':
        return <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Correction Submitted</span>;
      case 'SHORTLISTED':
      case 'SANCTIONED':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold">Sanctioned</span>;
      case 'DISBURSED':
        return <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">Disbursed via DBT</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Rejected</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Applicant Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gov-navy-900 text-amber-400 flex items-center justify-center font-bold text-xl shadow-md border border-amber-500/20">
            {user?.name?.[0] || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
                Welcome, {user?.name}
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300">
                ST Candidate Verified
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Tribe: <strong className="text-slate-800">{profile?.tribeName || 'Scheduled Tribe'}</strong> &bull; State: {profile?.state || 'Jharkhand'} &bull; DBT Aadhaar Linked: Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/schemes"
            className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Apply For New Scheme
          </Link>
        </div>
      </div>

      {/* 2. Priority Action Banner if Deficiencies Exist */}
      {deficiencies.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 rounded-xl shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-950">
                Action Required: {deficiencies.length} Deficiency Pending Remediation
              </h3>
              <p className="text-xs text-slate-900/90 font-medium">
                Verification officers have requested document or field correction. Please resolve within statutory deadline.
              </p>
            </div>
          </div>

          <Link
            to="/applicant/deficiencies"
            className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg whitespace-nowrap shadow-xs"
          >
            Resolve Now
          </Link>
        </div>
      )}

      {/* 3. Main Dashboard Layout: Left Applications, Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gov-navy-900" />
              My Scholarship Applications ({applications.length})
            </h2>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Loading your applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800">No applications created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the 5 official MoTA scholarship and fellowship schemes and start your application journey.
              </p>
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 bg-gov-navy-900 text-white font-semibold text-xs px-4 py-2 rounded-lg"
              >
                Browse Supported Schemes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 font-semibold">
                        Application No: {app.applicationNumber}
                      </div>
                      <h3 className="font-bold text-sm text-gov-navy-950 mt-0.5">
                        {app.schemeId?.schemeName || 'MoTA Scheme'}
                      </h3>
                    </div>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>

                  {/* Stage Progress Timeline Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Current Stage:</span>
                      <span className="text-gov-navy-900">{app.currentStage}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gov-navy-900 h-full rounded-full transition-all duration-500"
                        style={{
                          width:
                            app.status === 'DRAFT'
                              ? '20%'
                              : app.status === 'SUBMITTED'
                              ? '40%'
                              : app.status === 'UNDER_VERIFICATION'
                              ? '55%'
                              : app.status === 'DEFICIENCY_RAISED'
                              ? '50%'
                              : app.status === 'SANCTIONED'
                              ? '80%'
                              : app.status === 'DISBURSED'
                              ? '100%'
                              : '60%',
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* AI Verification Indicator */}
                  {app.aiVerificationSummary && (
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-gov-navy-700" />
                        AI Verification Confidence:
                      </span>
                      <span className="font-bold text-slate-800">
                        {app.aiVerificationSummary.confidenceScore}% (Queue: {app.aiVerificationSummary.recommendedQueue?.replace(/_/g, ' ')})
                      </span>
                    </div>
                  )}

                  {/* Sanction Details if applicable */}
                  {app.sanctionOrderNo && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between text-xs text-emerald-900">
                      <div>
                        <div className="font-bold">Sanction Order: {app.sanctionOrderNo}</div>
                        <div className="text-[11px] text-emerald-800">
                          Approved Amount: {formatINR(app.sanctionAmount)} via Direct Benefit Transfer
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-emerald-700" />
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Submitted: {formatDate(app.submissionDate || app.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {app.status === 'DRAFT' ? (
                        <Link
                          to={`/applicant/application/new?draftId=${app._id}`}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
                        >
                          Resume Draft
                        </Link>
                      ) : (
                        <Link
                          to={`/applicant/application/${app._id}`}
                          className="bg-slate-100 hover:bg-slate-200 text-gov-navy-900 font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          View Full Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Profile Summary & Notifications */}
        <div className="space-y-6">
          {/* Quick Demographic Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gov-navy-900" />
              Verified Student Demographics
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Scheduled Tribe:</span>
                <span className="font-semibold text-slate-800">{profile?.tribeName || 'Santhal'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ST Certificate:</span>
                <span className="font-mono font-semibold text-slate-800">{profile?.stCertificateNo || 'ST/JH/2023/1209'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Annual Family Income:</span>
                <span className="font-semibold text-slate-800">{formatINR(profile?.annualFamilyIncome || 180000)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Education Level:</span>
                <span className="font-semibold text-slate-800">{profile?.currentEducationLevel || 'Undergraduate'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Aadhaar DBT Status:</span>
                <span className="font-semibold text-emerald-700">Active Seeded (PFMS)</span>
              </div>
            </div>
            <Link
              to="/applicant/profile"
              className="block text-center text-xs font-bold text-gov-navy-900 hover:text-amber-700 pt-2 border-t border-slate-100"
            >
              Edit Full Student Profile &rarr;
            </Link>
          </div>

          {/* Recent In-App Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Bell className="w-4 h-4 text-gov-navy-900" />
                Recent Alerts
              </h3>
              <Link to="/applicant/notifications" className="text-[11px] font-semibold text-amber-700">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {notifications.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No new notifications.</div>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-xs text-slate-900">{n.title}</div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                    <div className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Help & Grievance Link */}
          <div className="bg-gov-navy-50 rounded-xl border border-gov-navy-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-gov-navy-700" />
              <div>
                <div className="font-bold text-xs text-gov-navy-950">Need Help or Clarification?</div>
                <div className="text-[11px] text-slate-600">Raise a support ticket with state welfare cell</div>
              </div>
            </div>
            <Link
              to="/applicant/help"
              className="bg-gov-navy-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs"
            >
              Helpdesk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
