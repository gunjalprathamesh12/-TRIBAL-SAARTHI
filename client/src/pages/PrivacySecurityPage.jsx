import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Database,
  EyeOff,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';

const PrivacySecurityPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gov-navy-950 via-gov-navy-900 to-gov-navy-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-3 border border-slate-800">
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>STATUTORY COMPLIANCE ARCHITECTURE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Security, Privacy & Data Protection Framework
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          TRIBAL SAARTHI is engineered in strict accordance with the Digital Personal Data Protection (DPDP) Act 2023, Aadhaar Data Vault circulars, CERT-In cybersecurity guidelines, and National Informatics Centre (NIC) security benchmarks.
        </p>
      </div>

      {/* Core Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Aadhaar Data Vault */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Aadhaar Data Vault & Cryptographic Masking
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with UIDAI regulations, raw 12-digit Aadhaar numbers are never stored in clear text or persistent application databases. Only reference keys and masked tokens (e.g. <code className="bg-slate-100 text-gov-navy-900 px-1 py-0.5 rounded font-mono">XXXX-XXXX-8921</code>) are processed for PFMS payment bridge synchronization.
          </p>
        </div>

        {/* Pillar 2: SHA-256 Hashing */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Cryptographic Document Tamper Detection
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every uploaded statutory certificate (Caste Certificate, Income Certificate, Marksheet) has a cryptographically immutable SHA-256 checksum calculated upon upload. If a file is altered or submitted under another applicant's record, the anomaly detection engine immediately flags duplicate or tampered evidence.
          </p>
        </div>

        {/* Pillar 3: Role-Based Access Control */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Strict Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every route and controller operation requires explicit JWT token verification and role assertion. Scrutiny officers cannot authorize payments, students cannot view unreleased selection rankings, and audit logs record every sensitive transition with officer identifiers and timestamps.
          </p>
        </div>

        {/* Pillar 4: Immutable Audit Trail */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Immutable Audit Trail & Anti-Fraud Ledger
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            All lifecycle transitions — including application submission, OCR extraction overrides, deficiency remediation, selection committee merit scores, and DBT batch disbursements — generate structured audit events to prevent administrative discretion and ensure public scrutiny compliance.
          </p>
        </div>
      </div>

      {/* DPDP Act 2023 Principles Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Digital Personal Data Protection (DPDP) Act 2023 Alignment
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="p-3 font-bold">DPDP Statutory Principle</th>
                <th className="p-3 font-bold">Portal Implementation Mechanism</th>
                <th className="p-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-3 font-semibold text-slate-900">Purpose Limitation</td>
                <td className="p-3">Data collected strictly for MoTA ST scholarship eligibility determination and PFMS transfer.</td>
                <td className="p-3 text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Data Minimization</td>
                <td className="p-3">Only essential socio-demographic, academic, and banking fields requested during application.</td>
                <td className="p-3 text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Consent & Transparency</td>
                <td className="p-3">Explicit applicant consent obtained on step 10 declaration before AI evaluation.</td>
                <td className="p-3 text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Storage Limitation</td>
                <td className="p-3">Automated archival schedules aligned with General Financial Rules (GFR) government records retention.</td>
                <td className="p-3 text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluator CTA */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-700" />
            Explore the Live SIH Evaluation Suite
          </div>
          <p className="text-xs text-amber-800">
            Experience the automated OCR audit, AI discrepancy triggers, and role transitions in real time.
          </p>
        </div>
        <Link
          to="/demo"
          className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          Open Judge Demo Hub &rarr;
        </Link>
      </div>
    </div>
  );
};

export default PrivacySecurityPage;
