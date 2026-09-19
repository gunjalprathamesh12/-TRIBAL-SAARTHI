import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Eye,
  CornerDownRight,
  CheckSquare,
} from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters.js';

const OfficerVerificationPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  // Deficiency Modal State
  const [deficiencyModalOpen, setDeficiencyModalOpen] = useState(false);
  const [deficiencyForm, setDeficiencyForm] = useState({
    category: 'INCOME_MISMATCH',
    severity: 'CRITICAL',
    title: 'Income Certificate Discrepancy Identified',
    description: 'Declared income differs from figure identified on Tahsildar revenue certificate.',
    remediationInstruction: 'Upload a fresh valid Tahsildar Income Certificate reflecting true FY 2024-25 figures.',
  });

  // Override AI Flag Modal State
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [targetFlag, setTargetFlag] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');

  const { addToast } = useNotification();
  const navigate = useNavigate();

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
        Loading verification scrutiny environment...
      </div>
    );
  }

  const { application, documents, verifications, eligibilityResult } = data;
  const profile = application.profileId;
  const currentDoc = documents?.[selectedDocIndex] || documents?.[0];
  const currentVerification = verifications?.find(
    (v) => v.documentId === currentDoc?._id
  );

  // Officer Actions
  const handleApprove = async () => {
    try {
      await api.put(`/applications/${id}/stage`, {
        status: 'SCRUTINY_PENDING',
        currentStage: 'Eligibility & Scrutiny',
        remarks: 'Documents verified and found in order. Forwarded to scrutiny & selection board.',
      });
      addToast({
        title: 'Application Verified',
        message: 'Successfully approved and forwarded to scrutiny cell.',
        type: 'success',
      });
      navigate('/officer/queue');
    } catch (err) {
      addToast({ title: 'Operation Failed', message: err.userMessage, type: 'error' });
    }
  };

  const handleRaiseDeficiency = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deficiencies', {
        applicationId: id,
        documentId: currentDoc?._id,
        category: deficiencyForm.category,
        severity: deficiencyForm.severity,
        title: deficiencyForm.title,
        description: deficiencyForm.description,
        remediationInstruction: deficiencyForm.remediationInstruction,
        evidence: {
          field: 'annualFamilyIncome',
          details: 'Flagged during side-by-side OCR scrutiny.',
        },
      });
      addToast({
        title: 'Deficiency Registered',
        message: 'Applicant has been notified to submit correction.',
        type: 'success',
      });
      setDeficiencyModalOpen(false);
      fetchDetail();
    } catch (err) {
      addToast({ title: 'Failed to raise deficiency', message: err.userMessage, type: 'error' });
    }
  };

  const handleOverrideFlag = async (e) => {
    e.preventDefault();
    if (!overrideReason || overrideReason.length < 5) {
      addToast({ title: 'Justification Required', message: 'Enter a valid override reason for audit.', type: 'warning' });
      return;
    }
    try {
      await api.post(`/applications/${id}/override-flag`, {
        flagCode: targetFlag.code,
        documentId: currentDoc._id,
        overrideReason,
      });
      addToast({
        title: 'AI Flag Overridden',
        message: 'Manual justification recorded in immutable audit log.',
        type: 'success',
      });
      setOverrideModalOpen(false);
      setOverrideReason('');
      fetchDetail();
    } catch (err) {
      addToast({ title: 'Override failed', message: err.userMessage, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 max-w-7xl mx-auto space-y-4">
      {/* Top Scrutiny Action Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/officer/queue')}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-gov-navy-900">
                {application.applicationNumber}
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                Scrutiny Mode
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-900">
              Candidate: {profile?.fullName} &bull; {profile?.tribeName} Tribe &bull; {application.schemeId?.shortTitle}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeficiencyModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Raise Deficiency
          </button>

          <button
            onClick={handleApprove}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approve & Move to Selection
          </button>
        </div>
      </div>

      {/* Document Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {documents?.map((doc, idx) => (
          <button
            key={doc._id}
            onClick={() => setSelectedDocIndex(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedDocIndex === idx
                ? 'bg-gov-navy-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {doc.docType?.replace(/_/g, ' ')}
            {verifications?.find((v) => v.documentId === doc._id)?.aiFlags?.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>
        ))}
      </div>

      {/* 3-Column Split-Screen Scrutiny Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PANEL: Document Scan View (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-gov-navy-900" />
              Document Scan Preview
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              SHA-256: {currentDoc?.documentHash?.slice(0, 16)}...
            </span>
          </div>

          {/* Realistic SVG Representation of Government Certificate */}
          <div className="border-2 border-amber-800/20 bg-amber-50/20 rounded-xl p-5 text-slate-800 font-serif min-h-[420px] flex flex-col justify-between shadow-inner">
            <div className="text-center space-y-1 border-b-2 border-amber-900/30 pb-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-950">
                GOVERNMENT OF {profile?.state?.toUpperCase() || 'JHARKHAND'}
              </div>
              <div className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
                {currentDoc?.docType?.replace(/_/g, ' ')}
              </div>
              <div className="text-[9px] font-mono text-slate-600">
                OFFICIAL REVENUE & STATUTORY RECORD &bull; REF: {currentVerification?.extractedData?.certificateNumber || 'INC/2024/98124'}
              </div>
            </div>

            <div className="py-4 text-xs space-y-2 leading-relaxed text-slate-800 font-sans">
              <p>
                This is to certify that <strong>{currentVerification?.extractedData?.candidateName || profile?.fullName}</strong>, resident of District <strong>{profile?.district}</strong>, State <strong>{profile?.state}</strong>, has been officially verified under the Statutory Framework.
              </p>
              {currentDoc?.docType === 'INCOME_CERTIFICATE' && (
                <div className="p-3 bg-white/80 rounded border border-amber-300 font-sans my-2">
                  <span className="text-slate-600 text-[11px]">Certified Annual Family Income:</span>
                  <div className="text-base font-extrabold text-gov-navy-950">
                    {formatINR(currentVerification?.extractedData?.annualIncome || 720000)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Statutory validity: Financial Year 2024-25
                  </span>
                </div>
              )}
              {currentDoc?.docType === 'ST_CERTIFICATE' && (
                <p>
                  Belongs to the <strong>{profile?.tribeName || 'Santhal'}</strong> community, recognized as a Scheduled Tribe under the Constitution (Scheduled Tribes) Order, 1950.
                </p>
              )}
            </div>

            <div className="flex justify-between items-end border-t border-amber-900/20 pt-3 text-[10px] text-slate-600 font-sans">
              <div>
                <div>Date of Issuance: {currentVerification?.extractedData?.issueDate || '2024-04-15'}</div>
                <div>Digital Seal ID: GOV-{currentDoc?._id?.slice(-8)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">Competent Authority</div>
                <div>SDM / Tehsildar Office</div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Field Extraction & Data Comparison (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-gov-navy-900" />
              OCR Field Extraction & Validation
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              Confidence {currentVerification?.overallConfidence || 97}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Candidate Name Check</span>
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-600">Form: {profile?.fullName}</span>
                <span className="text-slate-900">OCR: {currentVerification?.extractedData?.candidateName}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Certificate Identifier Ref</span>
              <div className="font-mono text-gov-navy-950 font-bold">
                {currentVerification?.extractedData?.certificateNumber || 'ST/JH/2023/1209'}
              </div>
            </div>

            {currentDoc?.docType === 'INCOME_CERTIFICATE' && (
              <div
                className={`p-3 rounded-lg border space-y-1.5 ${
                  currentVerification?.extractedData?.annualIncome !== profile?.annualFamilyIncome
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-slate-800">Annual Income Comparison:</span>
                  {currentVerification?.extractedData?.annualIncome !== profile?.annualFamilyIncome ? (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded">
                      Discrepancy
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Match
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">Applicant Declared:</span>
                    <div className="font-bold text-slate-900">{formatINR(profile?.annualFamilyIncome)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">OCR Extracted:</span>
                    <div className="font-bold text-red-700">
                      {formatINR(currentVerification?.extractedData?.annualIncome)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Issuing Authority</span>
              <div className="text-slate-800 font-medium">
                {currentVerification?.extractedData?.issuingAuthority || 'Revenue Department / Tahsildar'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Explainable AI & Anomaly Actions (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="font-bold text-xs text-gov-navy-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Why Was This Flagged?
            </div>

            {currentVerification?.aiFlags?.length > 0 ? (
              <div className="space-y-3">
                {currentVerification.aiFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-2 ${
                      flag.isOverridden
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-amber-50 border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 text-[11px]">{flag.title}</span>
                      <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-800 leading-relaxed">{flag.message}</p>

                    {!flag.isOverridden ? (
                      <button
                        onClick={() => {
                          setTargetFlag(flag);
                          setOverrideModalOpen(true);
                        }}
                        className="w-full bg-white hover:bg-slate-100 border border-amber-300 text-gov-navy-900 font-bold text-[11px] py-1.5 rounded-md transition-colors cursor-pointer mt-1"
                      >
                        Override AI Flag (With Reason)
                      </button>
                    ) : (
                      <div className="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                        Overridden by Officer: {flag.overrideReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  All Checks Passed
                </div>
                <p className="text-[11px] text-emerald-800">
                  No discrepancy or duplicate anomalies identified on this document.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Raise Deficiency */}
      {deficiencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-gov-navy-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Raise Deficiency to Applicant
              </h3>
              <button
                onClick={() => setDeficiencyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleRaiseDeficiency} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deficiency Category</label>
                <select
                  value={deficiencyForm.category}
                  onChange={(e) => setDeficiencyForm({ ...deficiencyForm, category: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="INCOME_MISMATCH">Income Mismatch</option>
                  <option value="MISSING_DOCUMENT">Missing Document</option>
                  <option value="NAME_MISMATCH">Name Spelling Discrepancy</option>
                  <option value="BLURRY_UNREADABLE_DOC">Blurry / Unreadable Scan</option>
                  <option value="EXPIRED_CERTIFICATE">Expired Certificate</option>
                  <option value="DUPLICATE_UPLOAD">Duplicate Certificate Signal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deficiency Title</label>
                <input
                  type="text"
                  required
                  value={deficiencyForm.title}
                  onChange={(e) => setDeficiencyForm({ ...deficiencyForm, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observation Description</label>
                <textarea
                  rows={2}
                  required
                  value={deficiencyForm.description}
                  onChange={(e) => setDeficiencyForm({ ...deficiencyForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Remediation Instruction for Student *
                </label>
                <textarea
                  rows={2}
                  required
                  value={deficiencyForm.remediationInstruction}
                  onChange={(e) => setDeficiencyForm({ ...deficiencyForm, remediationInstruction: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeficiencyModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Notify Applicant & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Override AI Flag */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-gov-navy-950">
              Manual Override of AI Flag: {targetFlag?.code}
            </h3>
            <p className="text-xs text-slate-600">
              Government auditing standards mandate a clear reason for overriding an AI discrepancy flag.
            </p>

            <form onSubmit={handleOverrideFlag} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Override Justification / Officer Remarks *
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Verified genuine Tahsildar signature manually; minor typo in OCR read."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold"
                >
                  Confirm Override & Record in Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerVerificationPage;
