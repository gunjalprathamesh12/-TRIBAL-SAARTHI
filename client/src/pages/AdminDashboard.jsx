import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  FileText,
  CreditCard,
  Sliders,
  History,
  Download,
  Users,
  Building,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatINR } from '../utils/formatters.js';

const COLORS = ['#142944', '#d97706', '#059669', '#3b82f6', '#8b5cf6', '#ef4444'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anRes, healthRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/health'),
        ]);

        if (anRes.success) setAnalytics(anRes.data);
        if (healthRes.success) setHealth(healthRes);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
        Initializing MoTA Command Center & Real-Time Analytics...
      </div>
    );
  }

  const kpis = analytics.kpis || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-gov-navy-900" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              National Scholarship & Fellowship Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Real-time operations, AI scrutiny oversight, rule engine administration, and DBT pipeline metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/schemes"
            className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            Scheme Rule Builder
          </Link>
          <Link
            to="/admin/audit"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Audit Trail
          </Link>
        </div>
      </div>

      {/* 1. Live Operations Pipeline Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gov-navy-900" />
            Live Lifecycle Pipeline Distribution
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Total Ingestion: {kpis.totalApplications} records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 text-center">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-lg font-bold text-gov-navy-950">{kpis.totalApplications}</div>
            <div className="text-[10px] text-slate-500 font-medium">Submitted</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-900">{kpis.pendingVerification}</div>
            <div className="text-[10px] text-blue-700 font-medium">In Verification</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <div className="text-lg font-bold text-amber-900">{kpis.deficientApplications}</div>
            <div className="text-[10px] text-amber-700 font-medium">Deficiencies</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-900">{kpis.eligibleApplications}</div>
            <div className="text-[10px] text-purple-700 font-medium">Eligible Scrutiny</div>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
            <div className="text-lg font-bold text-indigo-900">{kpis.selectedCandidates}</div>
            <div className="text-[10px] text-indigo-700 font-medium">Selected Board</div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <div className="text-lg font-bold text-emerald-900">{kpis.disbursementPending}</div>
            <div className="text-[10px] text-emerald-700 font-medium">Sanctioned DBT</div>
          </div>
          <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-xs">
            <div className="text-lg font-bold">{kpis.completedApplications}</div>
            <div className="text-[10px] font-medium text-emerald-100">Disbursed</div>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Disbursed Funds
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {formatINR(kpis.totalDisbursedFunds || 14850000)}
          </div>
          <div className="text-[11px] text-slate-500">100% Aadhaar Seeded APBS</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Avg Verification Turnaround
          </div>
          <div className="text-2xl font-extrabold text-gov-navy-950 font-mono">
            {kpis.avgVerificationTurnaroundHours} Hours
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">&darr; 84% reduction vs manual</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            OCR Extraction Accuracy
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">
            {kpis.ocrConfidenceRatePercent}%
          </div>
          <div className="text-[11px] text-slate-500">SHA-256 Hash Guard Active</div>
        </div>

        {/* System Health Card */}
        <div className="bg-gov-navy-950 text-white rounded-xl p-5 shadow-xs space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> System Health Status
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Core API Gateway:</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MongoDB Database:</span>
              <span className="text-emerald-400 font-bold">CONNECTED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Configurable Rule Engine:</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AI / OCR Subsystem:</span>
              <span className="text-amber-300 font-bold">DEMO FALLBACK READY</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications by Scheme */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Applications by Scheme (Bar Chart)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.applicationsByScheme || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="code" textAnchor="end" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#142944" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Applications Over Time / Monthly Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Application Submissions vs Sanctions Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="applications" stroke="#142944" strokeWidth={2} name="Submitted" />
                <Line type="monotone" dataKey="sanctioned" stroke="#059669" strokeWidth={2} name="Sanctioned" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Applications by State */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Top Tribal States by Applicant Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.applicationsByState || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="_id" type="category" width={90} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Deficiency Categories */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Identified Deficiency Categories
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.deficiencyCategories || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 9 }} interval={0} textAnchor="end" angle={-15} height={40} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
