import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import {
  AlertTriangle,
  Upload,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { formatDate } from '../utils/formatters.js';

const DeficiencyResolverPage = () => {
  const [deficiencies, setDeficiencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeficiency, setSelectedDeficiency] = useState(null);
  const [correctionField, setCorrectionField] = useState('');
  const [applicantRemarks, setApplicantRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useNotification();

  const fetchDeficiencies = async () => {
    try {
      const res = await api.get('/deficiencies');
      if (res.success) {
        setDeficiencies(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeficiencies();
  }, []);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeficiency) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/deficiencies/${selectedDeficiency._id}/resolve`, {
        updatedField: selectedDeficiency.evidence?.field || 'annualFamilyIncome',
        newValue: correctionField || '220000',
        applicantRemarks,
      });

      if (res.success) {
        addToast({
          title: 'Correction Submitted Successfully',
          message: 'Your corrected details have been submitted for re-verification.',
          type: 'success',
        });
        setSelectedDeficiency(null);
        setCorrectionField('');
        setApplicantRemarks('');
        fetchDeficiencies();
      }
    } catch (err) {
      addToast({
        title: 'Correction Submission Failed',
        message: err.userMessage || 'Could not submit correction.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
            Deficiency Remediation Center
          </h1>
        </div>
        <p className="text-xs text-slate-600">
          Transparent resolution workflow: Review officer observations, upload corrected certificates, or amend data fields.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading deficiencies records...
        </div>
      ) : deficiencies.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Zero Pending Deficiencies</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All your uploaded documents and declared credentials have satisfied automated and primary verification standards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deficiencies List (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {deficiencies.map((def) => (
              <div
                key={def._id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition-colors space-y-3 ${
                  def.status === 'OPEN'
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-900">
                        {def.deficiencyCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          def.status === 'OPEN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {def.status === 'OPEN' ? 'Action Required' : 'Correction Submitted'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-gov-navy-950 mt-1">{def.title}</h3>
                  </div>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Due: {formatDate(def.deadlineDate)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{def.description}</p>

                {/* Evidence Card */}
                {def.evidence && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs space-y-1">
                    <div className="font-semibold text-amber-950 text-[11px]">
                      Observation Evidence:
                    </div>
                    <div className="text-slate-700 text-[11px]">
                      {def.evidence.details || `Field: ${def.evidence.field}`}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-900">Remediation Instruction: </span>
                  <span className="text-slate-700">{def.remediationInstruction}</span>
                </div>

                {def.status === 'OPEN' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedDeficiency(def)}
                      className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Resolve & Resubmit <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Correction Panel (Right Col) */}
          <div className="space-y-4">
            {selectedDeficiency ? (
              <div className="bg-white rounded-xl border border-amber-300 shadow-md p-5 space-y-4 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-xs text-gov-navy-950">
                    Remediate: {selectedDeficiency.deficiencyCode}
                  </h3>
                  <button
                    onClick={() => setSelectedDeficiency(null)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Corrected Value (if amending field)
                    </label>
                    <input
                      type="text"
                      value={correctionField}
                      onChange={(e) => setCorrectionField(e.target.value)}
                      placeholder="e.g. Correct Annual Income (₹ 2,20,000)"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Upload Replacement Document
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-600 font-medium">
                        Click to select corrected PDF scan
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Applicant Remarks / Explanation *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={applicantRemarks}
                      onChange={(e) => setApplicantRemarks(e.target.value)}
                      placeholder="Explain the correction or attach Tahsildar issuance details..."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-colors cursor-pointer"
                  >
                    {submitting ? 'Submitting to Officer...' : 'Confirm & Resubmit'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-semibold text-slate-700">Select a Deficiency to Remediate</div>
                <p className="text-[11px]">
                  Click "Resolve & Resubmit" on any open deficiency card to upload replacement files or update your declaration.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeficiencyResolverPage;
