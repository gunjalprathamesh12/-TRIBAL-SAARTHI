import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import {
  Award,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  User,
  Sliders,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

const SelectionPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [quotaFilter, setQuotaFilter] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const [scoreForm, setScoreForm] = useState({
    academicPerformanceScore: 35,
    researchAdmissionScore: 18,
    schemeSpecificScore: 17,
    specialVulnerabilityScore: 15,
    vote: 'APPROVE',
    comments: 'Recommended on high merit and verified socio-economic background.',
  });

  const { addToast } = useNotification();

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      let url = '/selection/candidates?';
      if (quotaFilter) url += `quota=${quotaFilter}&`;
      const res = await api.get(url);
      if (res.success) {
        setCandidates(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [quotaFilter]);

  const handleOpenReview = (candidate) => {
    setSelectedCandidate(candidate);
    setScoreForm({
      academicPerformanceScore: candidate.academicPerformanceScore || 35,
      researchAdmissionScore: candidate.researchAdmissionScore || 18,
      schemeSpecificScore: candidate.schemeSpecificScore || 17,
      specialVulnerabilityScore: candidate.specialVulnerabilityScore || 15,
      vote: 'APPROVE',
      comments: 'Recommended for national selection award.',
    });
    setReviewModalOpen(true);
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/selection/${selectedCandidate._id}/review`, scoreForm);
      addToast({
        title: 'Score & Vote Recorded',
        message: 'Committee evaluation successfully updated.',
        type: 'success',
      });
      setReviewModalOpen(false);
      fetchCandidates();
    } catch (err) {
      addToast({ title: 'Evaluation failed', message: err.userMessage, type: 'error' });
    }
  };

  const handleFinalApproval = async (candidate) => {
    try {
      await api.post(`/selection/${candidate._id}/approve`, {
        sanctionAmount: candidate.schemeId?.financialBenefits?.totalEstimatedAnnualValue || 50000,
        remarks: 'Approved by National Selection Committee on final merit list.',
      });
      addToast({
        title: 'Candidate Awarded Scholarship',
        message: 'Sanction order generated and queued for DBT disbursement.',
        type: 'success',
      });
      fetchCandidates();
    } catch (err) {
      addToast({ title: 'Approval failed', message: err.userMessage, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              National Selection Committee Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Merit screening, scoring breakdown (Academic 40, Research 20, Scheme 20, Vulnerability 20), and quota monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-amber-50 text-amber-900 border border-amber-300 font-bold px-3 py-1.5 rounded-lg">
            Human-in-the-Loop Selection Board
          </span>
        </div>
      </div>

      {/* Quota Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: '', label: 'All Quotas' },
            { id: 'GENERAL_ST', label: 'General ST Quota' },
            { id: 'PVTG_ST', label: 'PVTG Priority Quota' },
            { id: 'FEMALE_ST', label: 'Female ST Merit' },
            { id: 'DIVYANG_ST', label: 'Divyang ST Quota' },
          ].map((q) => (
            <button
              key={q.id}
              onClick={() => setQuotaFilter(q.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                quotaFilter === q.id
                  ? 'bg-gov-navy-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Showing {candidates.length} candidates
        </span>
      </div>

      {/* Merit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            Evaluating merit scores...
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No candidates found in this quota category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Candidate Name</th>
                  <th className="p-3.5">Scheme</th>
                  <th className="p-3.5">Academic (40)</th>
                  <th className="p-3.5">Research (20)</th>
                  <th className="p-3.5">Scheme Spec (20)</th>
                  <th className="p-3.5">Vulnerability (20)</th>
                  <th className="p-3.5">Total Score</th>
                  <th className="p-3.5">Quota</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {candidates.map((cand, idx) => (
                  <tr key={cand._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-gov-navy-900">
                      #{idx + 1}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {cand.applicantId?.name || 'Applicant'}
                    </td>
                    <td className="p-3.5 text-slate-800">
                      {cand.schemeId?.shortTitle}
                    </td>
                    <td className="p-3.5 font-mono">{cand.academicPerformanceScore || 35}</td>
                    <td className="p-3.5 font-mono">{cand.researchAdmissionScore || 18}</td>
                    <td className="p-3.5 font-mono">{cand.schemeSpecificScore || 17}</td>
                    <td className="p-3.5 font-mono">{cand.specialVulnerabilityScore || 15}</td>
                    <td className="p-3.5 font-bold font-mono text-amber-700">
                      {cand.totalMeritScore || 85}/100
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {cand.quotaCategory}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cand.selectionStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cand.selectionStatus === 'SHORTLISTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cand.selectionStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReview(cand)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] px-2.5 py-1 rounded"
                        >
                          Score
                        </button>
                        {cand.selectionStatus !== 'APPROVED' && (
                          <button
                            onClick={() => handleFinalApproval(cand)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1 rounded transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Committee Score Modal */}
      {reviewModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-gov-navy-950">
              Committee Merit Review: {selectedCandidate.applicantId?.name}
            </h3>
            <p className="text-xs text-slate-600">
              Score candidate against transparent benchmarks approved under MoTA guidelines.
            </p>

            <form onSubmit={handleScoreSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Academic Score (Max 40)
                  </label>
                  <input
                    type="number"
                    max={40}
                    min={0}
                    value={scoreForm.academicPerformanceScore}
                    onChange={(e) =>
                      setScoreForm({ ...scoreForm, academicPerformanceScore: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Research / Admission (Max 20)
                  </label>
                  <input
                    type="number"
                    max={20}
                    min={0}
                    value={scoreForm.researchAdmissionScore}
                    onChange={(e) =>
                      setScoreForm({ ...scoreForm, researchAdmissionScore: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Scheme-Specific Criteria (Max 20)
                  </label>
                  <input
                    type="number"
                    max={20}
                    min={0}
                    value={scoreForm.schemeSpecificScore}
                    onChange={(e) =>
                      setScoreForm({ ...scoreForm, schemeSpecificScore: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    PVTG / Vulnerability (Max 20)
                  </label>
                  <input
                    type="number"
                    max={20}
                    min={0}
                    value={scoreForm.specialVulnerabilityScore}
                    onChange={(e) =>
                      setScoreForm({ ...scoreForm, specialVulnerabilityScore: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Committee Vote</label>
                <select
                  value={scoreForm.vote}
                  onChange={(e) => setScoreForm({ ...scoreForm, vote: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="APPROVE">Approve for Selection</option>
                  <option value="SHORTLIST">Shortlist in Merit Rank</option>
                  <option value="HOLD">Hold for Further Scrutiny</option>
                  <option value="REJECT">Reject (With Reason)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Committee Comments</label>
                <textarea
                  rows={2}
                  value={scoreForm.comments}
                  onChange={(e) => setScoreForm({ ...scoreForm, comments: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionPage;
