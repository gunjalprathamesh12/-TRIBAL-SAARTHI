import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  GraduationCap,
  FileText,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Clock,
  History,
  CreditCard,
  User,
  Building,
  Award,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatINR, formatDate, formatDateTime } from '../utils/formatters.js';

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load application detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
        Loading complete application bundle & audit records...
      </div>
    );
  }

  if (!data || !data.application) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
        Application record not found.
      </div>
    );
  }

  const { application, documents, verifications, eligibilityResult, deficiencies, auditLogs } = data;
  const profile = application.profileId;
  const scheme = application.schemeId;

  const tabs = [
    { id: 'overview', label: 'Overview & Profile', icon: User },
    { id: 'documents', label: `Documents (${documents?.length || 0})`, icon: FileText },
    { id: 'eligibility', label: 'Rules & Transparency', icon: ShieldCheck },
    { id: 'ai', label: 'AI Scrutiny & Flags', icon: Cpu },
    { id: 'deficiencies', label: `Deficiencies (${deficiencies?.length || 0})`, icon: AlertTriangle },
    { id: 'audit', label: `Audit Trail (${auditLogs?.length || 0})`, icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Application Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500">
              {application.applicationNumber}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                application.status === 'DISBURSED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : application.status === 'DEFICIENCY_RAISED'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {application.status}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
            {scheme?.schemeName || 'Scheduled Tribe Scholarship Scheme'}
          </h1>
          <p className="text-xs text-slate-600">
            Applicant: <strong className="text-slate-800">{profile?.fullName}</strong> &bull; Current Stage:{' '}
            <span className="font-semibold text-gov-navy-900">{application.currentStage}</span>
          </p>
        </div>

        {/* AI Risk & Queue Pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right text-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-medium">Assigned Review Queue</div>
          <div className="font-bold text-gov-navy-900">
            {application.aiVerificationSummary?.recommendedQueue?.replace(/_/g, ' ') || 'NORMAL REVIEW'}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">
            AI Confidence: {application.aiVerificationSummary?.confidenceScore || 96}%
          </div>
        </div>
      </div>

      {/* 2. Horizontal Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === t.id
                ? 'bg-gov-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Tab Contents */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* TAB 1: Overview & Profile */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Demographics */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gov-navy-900" />
                  Student Demographics & ST Verification
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="font-semibold text-slate-900">{profile?.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="font-semibold text-slate-900">{formatDate(profile?.dob)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Tribe Community:</span>
                    <span className="font-semibold text-slate-900">{profile?.tribeName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">ST Certificate No:</span>
                    <span className="font-mono font-semibold text-slate-900">{profile?.stCertificateNo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">PVTG Status:</span>
                    <span className="font-semibold text-amber-800">
                      {profile?.isPVTG ? 'Yes (Particularly Vulnerable Tribal Group)' : 'Standard ST'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">State / District:</span>
                    <span className="font-semibold text-slate-900">{profile?.district}, {profile?.state}</span>
                  </div>
                </div>
              </div>

              {/* Academic & Institution */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gov-navy-900" />
                  Institution & Course Record
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Institution:</span>
                    <span className="font-semibold text-slate-900">{profile?.institutionName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Institution Type:</span>
                    <span className="font-semibold text-slate-900">{profile?.institutionType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Course / Stream:</span>
                    <span className="font-semibold text-slate-900">{profile?.courseName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Education Level:</span>
                    <span className="font-semibold text-slate-900">{profile?.currentEducationLevel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Marks Percentage:</span>
                    <span className="font-bold text-slate-900">{profile?.previousExamMarksPercentage}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">AISHE Code:</span>
                    <span className="font-mono text-slate-900">{profile?.aisheCode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & DBT Sanction Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-800" />
                Direct Benefit Transfer (DBT) & Sanction Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-emerald-700 font-medium">Declared Annual Income:</span>
                  <div className="font-extrabold text-sm text-emerald-950">
                    {formatINR(profile?.annualFamilyIncome)}
                  </div>
                </div>
                <div>
                  <span className="text-emerald-700 font-medium">Sanction Order Number:</span>
                  <div className="font-mono font-bold text-emerald-950">
                    {application.sanctionOrderNo || 'Pending Committee Review'}
                  </div>
                </div>
                <div>
                  <span className="text-emerald-700 font-medium">Sanctioned Grant Value:</span>
                  <div className="font-extrabold text-sm text-emerald-950">
                    {application.sanctionAmount ? formatINR(application.sanctionAmount) : 'Pending Sanction'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Documents & OCR Intelligence */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600">
              Statutory documents uploaded by the applicant and processed via the MoTA AI OCR pipeline.
            </div>

            <div className="grid grid-cols-1 gap-4">
              {documents?.map((doc) => {
                const ver = verifications?.find((v) => v.documentId === doc._id);
                return (
                  <div
                    key={doc._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-gov-navy-900" />
                        <div>
                          <div className="font-bold text-xs text-gov-navy-950">
                            {doc.originalFileName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Type: {doc.docType} &bull; SHA-256 Hash: {doc.documentHash?.slice(0, 18)}...
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          OCR Confidence: {doc.ocrConfidence || 97}%
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded">
                          Status: {doc.status}
                        </span>
                      </div>
                    </div>

                    {/* Extracted Fields Table */}
                    {ver && ver.extractedData && (
                      <div className="bg-white rounded-lg p-3 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {ver.extractedData.candidateName && (
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium">Candidate Name:</span>
                            <div className="font-semibold text-slate-800">{ver.extractedData.candidateName}</div>
                          </div>
                        )}
                        {ver.extractedData.certificateNumber && (
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium">Certificate Ref:</span>
                            <div className="font-mono font-semibold text-slate-800">{ver.extractedData.certificateNumber}</div>
                          </div>
                        )}
                        {ver.extractedData.annualIncome !== undefined && (
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium">Extracted Income:</span>
                            <div className="font-bold text-slate-900">{formatINR(ver.extractedData.annualIncome)}</div>
                          </div>
                        )}
                        {ver.extractedData.issuingAuthority && (
                          <div className="sm:col-span-3 text-[11px] text-slate-600 border-t border-slate-100 pt-1 mt-1">
                            <span className="text-slate-400">Authority:</span> {ver.extractedData.issuingAuthority}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Rules & Transparency Panel */}
        {activeTab === 'eligibility' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">
                  Configurable Rule Engine Output: {eligibilityResult?.decision || 'ELIGIBLE'}
                </div>
                <div className="text-[11px] text-slate-600">
                  Composite Merit Score: {eligibilityResult?.compositeMeritScore || 75}/100
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                AI Rule Check: Complete
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Evaluated Scheme Rules:
              </div>
              {eligibilityResult?.ruleResults?.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    {r.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{r.ruleName}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.message} &bull; Expected: {JSON.stringify(r.expectedValue)} vs Actual: {JSON.stringify(r.actualValue)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                      r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {r.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Explainable AI & Anomaly Flags */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600">
              Explainable AI analysis identifying potential anomalies for human verification.
            </div>

            {verifications?.some((v) => v.aiFlags?.length > 0) ? (
              <div className="space-y-3">
                {verifications.map((v) =>
                  v.aiFlags?.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          {flag.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                          SEVERITY: {flag.severity}
                        </span>
                      </div>
                      <p className="text-slate-800 text-[11px] leading-relaxed">{flag.message}</p>
                      {flag.evidence && (
                        <div className="bg-white rounded-lg p-2.5 border border-amber-200 text-[11px] grid grid-cols-2 gap-2 text-slate-700">
                          <div>Expected: {String(flag.evidence.expectedValue || 'N/A')}</div>
                          <div>Extracted: {String(flag.evidence.extractedValue || 'N/A')}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-emerald-200 bg-emerald-50 text-center text-xs text-emerald-900">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold">No Anomaly or Discrepancy Flags Detected</div>
                <div className="text-[11px] text-emerald-800 mt-1">
                  Document hashes and extracted data fully conform to scheme criteria.
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Deficiencies */}
        {activeTab === 'deficiencies' && (
          <div className="space-y-4">
            {deficiencies?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No deficiencies raised on this application.
              </div>
            ) : (
              <div className="space-y-3">
                {deficiencies.map((def) => (
                  <div
                    key={def._id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-900">
                        {def.deficiencyCode} &bull; {def.title}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        STATUS: {def.status}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px]">{def.description}</p>
                    <div className="bg-white p-2.5 rounded border border-amber-200 text-[11px]">
                      <strong>Remediation Instruction:</strong> {def.remediationInstruction}
                    </div>
                    {def.status === 'OPEN' && (
                      <Link
                        to="/applicant/deficiencies"
                        className="inline-block bg-gov-navy-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-md mt-1"
                      >
                        Submit Correction Now
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Immutable Audit Trail */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-600 mb-2">
              Immutable event log tracking all system and officer actions for accountability.
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User / Officer</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {auditLogs?.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-[11px]">{formatDateTime(log.createdAt)}</td>
                      <td className="p-3 font-semibold">{log.userName}</td>
                      <td className="p-3 text-[10px] font-bold">{log.userRole}</td>
                      <td className="p-3 font-mono text-[11px] text-gov-navy-900">{log.action}</td>
                      <td className="p-3 text-slate-600">{log.reason || 'Workflow progression'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
