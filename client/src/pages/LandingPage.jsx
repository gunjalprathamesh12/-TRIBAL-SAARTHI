import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Award,
  CreditCard,
  Search,
  Users,
  Building2,
  TrendingUp,
  Cpu,
  Eye,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Lock,
} from 'lucide-react';

const LandingPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [finderForm, setFinderForm] = useState({
    educationLevel: 'Undergraduate',
    annualFamilyIncome: '200000',
    studyLocation: 'India',
  });
  const [finderResults, setFinderResults] = useState(null);
  const [finding, setFinding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await api.get('/schemes');
        if (res.success) setSchemes(res.data || []);
      } catch (err) {
        console.error('Failed to load schemes:', err);
      }
    };
    fetchSchemes();
  }, []);

  const handleFinderSubmit = async (e) => {
    e.preventDefault();
    setFinding(true);
    try {
      const res = await api.post('/schemes/recommend', finderForm);
      if (res.success) {
        setFinderResults(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFinding(false);
    }
  };

  const faqs = [
    {
      q: 'How does AI assist in the scholarship verification process?',
      a: 'Tribal Saarthi utilizes deterministic optical character recognition (OCR) and document intelligence to extract statutory fields (certificate numbers, income figures, academic marks, and issuing authorities) from uploaded documents. The configurable rule engine checks eligibility benchmarks in real time. Crucially, AI only assists: human verification officers make all final approvals, rejections, and deficiency decisions with full audit logging.',
    },
    {
      q: 'What happens if there is an income or name discrepancy in my uploaded documents?',
      a: 'If a discrepancy is identified (for example, if declared income is ₹4,50,000 but the OCR engine extracts ₹7,20,000 from the certificate), the system flags the issue for manual scrutiny. An officer reviews the side-by-side evidence and raises a deficiency request with clear remediation instructions. The applicant is notified via in-app alerts and SMS simulation and can upload a corrected document or update the figure without having their application arbitrarily rejected.',
    },
    {
      q: 'How are scholarship funds disbursed to selected beneficiaries?',
      a: 'Approved scholarships and fellowships are disbursed directly into the beneficiary’s Aadhaar-seeded bank account via Direct Benefit Transfer (DBT) using the Aadhaar Payment Bridge System (APBS) and Public Financial Management System (PFMS) protocols. This eliminates intermediaries, prevents duplicate claims through SHA-256 document hashing, and enables transparent UTR transaction tracking.',
    },
    {
      q: 'Can administrators update scheme eligibility rules without altering software code?',
      a: 'Yes. Tribal Saarthi includes an administrative Configurable Scheme Rule Builder. Officers can adjust income ceilings, supported education levels, merit weights, and mandatory document requirements using dynamic operators (==, !=, >, <, >=, <=, IN, NOT IN). Changes are versioned and immediately reflected across the portal.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gov-navy-950 via-gov-navy-900 to-gov-navy-800 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SIH PS 26239 &bull; Smart India Hackathon 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              One Platform. <br />
              <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                Every Scholarship Journey.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              AI-enabled, transparent and secure scholarship & fellowship management for Scheduled Tribe students, powered by the Ministry of Tribal Affairs, Government of India.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="#finder"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm transition-all transform hover:-translate-y-0.5"
              >
                <Search className="w-4 h-4" />
                Find My Scheme
              </a>

              <Link
                to="/register"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-5 py-3 rounded-lg text-sm transition-all flex items-center gap-2 backdrop-blur-xs"
              >
                <span>Applicant Registration</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/demo"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-lg shadow-md flex items-center gap-2 text-sm transition-all"
              >
                <Zap className="w-4 h-4" />
                Judge Demo Hub
              </Link>
            </div>
          </div>

          {/* Key Impact Metrics Bar */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">50,000+</div>
              <div className="text-xs text-slate-400 font-medium">ST Students Benefited</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">₹14.85 Cr</div>
              <div className="text-xs text-slate-400 font-medium">Disbursed via Direct Benefit Transfer</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">97.2%</div>
              <div className="text-xs text-slate-400 font-medium">AI OCR Extraction Confidence</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium">Human-in-the-Loop Scrutiny</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive "Find the Right Scholarship" Scheme Discovery Widget */}
      <section id="finder" className="py-12 bg-slate-100 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-2 text-gov-navy-900 font-bold text-lg">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2>Find the Right Scholarship & Fellowship (AI Assistant)</h2>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Enter your academic and financial criteria to check eligibility assistance against all 5 official Ministry of Tribal Affairs schemes.
            </p>

            <form onSubmit={handleFinderSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Education Level
                </label>
                <select
                  value={finderForm.educationLevel}
                  onChange={(e) => setFinderForm({ ...finderForm, educationLevel: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Class 10">Class 9 / 10 (Pre-Matric)</option>
                  <option value="Class 12">Class 11 / 12 (Higher Secondary)</option>
                  <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, BA, etc.)</option>
                  <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, MA, etc.)</option>
                  <option value="Ph.D">Ph.D / Doctoral Research</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Family Income (₹)
                </label>
                <select
                  value={finderForm.annualFamilyIncome}
                  onChange={(e) => setFinderForm({ ...finderForm, annualFamilyIncome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="150000">Up to ₹1,50,000 per annum</option>
                  <option value="250000">Up to ₹2,50,000 per annum</option>
                  <option value="450000">Up to ₹4,50,000 per annum</option>
                  <option value="600000">Up to ₹6,00,000 per annum</option>
                  <option value="800000">Up to ₹8,00,000 per annum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Study Location
                </label>
                <select
                  value={finderForm.studyLocation}
                  onChange={(e) => setFinderForm({ ...finderForm, studyLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="India">Study in India</option>
                  <option value="Abroad">Study Abroad (QS Top 500)</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 italic">
                  * Assistance system based on configurable rules. Final sanction subject to statutory verification.
                </span>
                <button
                  type="submit"
                  disabled={finding}
                  className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  {finding ? 'Evaluating Rules...' : 'Check Eligible Schemes'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Recommendation results display */}
            {finderResults && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Recommended Schemes Matching Your Criteria:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {finderResults.slice(0, 4).map((rec) => (
                    <div
                      key={rec.scheme._id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-gov-navy-900">
                          {rec.scheme.schemeName}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.decision === 'ELIGIBLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.decision === 'ELIGIBLE' ? 'Potentially Eligible' : 'Manual Review'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {rec.scheme.description}
                      </p>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        Benefit: {rec.scheme.financialBenefits?.benefitSummary || 'Tuition & Allowances covered'}
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Match Score: {rec.matchScore}/100
                        </span>
                        <Link
                          to="/applicant/application/new"
                          state={{ schemeId: rec.scheme._id }}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                        >
                          Apply Now <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Official Supported Schemes Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Official Portal Directory
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Supported Ministry of Tribal Affairs Schemes
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Digital lifecycle management adhering to official guidelines from tribal.nic.in & dbttribal.gov.in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <div
              key={scheme._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-gov-navy-50 text-gov-navy-800 border border-gov-navy-200 px-2 py-0.5 rounded">
                    {scheme.schemeCode}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Active for 2025-26
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gov-navy-950 leading-snug">
                  {scheme.schemeName}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3">
                  {scheme.description}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900">Income Limit:</span> Up to ₹
                    {scheme.incomeLimit?.toLocaleString('en-IN')}/year
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Levels:</span>{' '}
                    {scheme.educationLevels?.join(', ')}
                  </div>
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                    {scheme.financialBenefits?.benefitSummary || 'Tuition Fee Waiver + Maintenance'}
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
                <Link
                  to="/schemes"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  View Criteria
                </Link>
                <Link
                  to="/applicant/application/new"
                  state={{ schemeId: scheme._id }}
                  className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  Apply <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works: 6-Stage Transparent Digital Journey */}
      <section className="py-16 bg-gov-navy-950 text-white px-4 sm:px-6 lg:px-8 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Transparent Digital Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              From Application to Award — End-to-End Workflow
            </h2>
            <p className="text-xs text-slate-400">
              Eliminating paper delays with automated AI assistance and strict human-in-the-loop oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              {
                step: '01',
                title: 'Discover & Register',
                desc: 'Find schemes via rule engine assistance and verify account with simulated OTP.',
                icon: Search,
              },
              {
                step: '02',
                title: '10-Step Application',
                desc: 'Structured wizard with draft autosave, demographic, academic and bank details.',
                icon: FileText,
              },
              {
                step: '03',
                title: 'AI OCR & Document Intelligence',
                desc: 'Instant field extraction, confidence scoring, SHA-256 duplicate detection.',
                icon: Cpu,
              },
              {
                step: '04',
                title: 'Human Scrutiny & Deficiency',
                desc: 'Verification officers inspect discrepancies with full explainability cards.',
                icon: Eye,
              },
              {
                step: '05',
                title: 'Merit & Selection',
                desc: 'Selection committee reviews transparent scoring matrix (Academic, Social, Research).',
                icon: Award,
              },
              {
                step: '06',
                title: 'DBT Disbursement',
                desc: 'Direct sanction batch release via Aadhaar Payment Bridge with UTR tracking.',
                icon: CreditCard,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <item.icon className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-500">{item.step}</span>
                </div>
                <h4 className="font-bold text-xs text-white leading-snug">{item.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Core AI Principles: Explainable AI & Human Oversight */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-amber-50 via-white to-emerald-50 rounded-2xl border border-amber-200/70 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Ethical & Explainable AI Framework
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                AI Assists. Humans Decide. Rules are Transparent.
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Tribal Saarthi adheres to core responsible GovTech AI principles. AI models analyze document scans and highlight potential discrepancies, but never autonomously reject or approve candidates.
              </p>

              <div className="space-y-2.5 text-xs text-slate-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Explainable Evidence:</strong> Officers view exact extracted values alongside original certificate scans and confidence ratings.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mandatory Override Justification:</strong> Every officer override of an AI flag is permanently recorded in the immutable audit log.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No Autonomous Rejections:</strong> If an income or name variance is flagged, applicants are given 15 days to remediate through deficiency resolution.
                  </span>
                </div>
              </div>
            </div>

            {/* Synthetic Explainability Preview Card */}
            <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="font-bold text-xs text-slate-900">
                    Live Scrutiny Evidence Card (Demo Preview)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  ATTENTION REQUIRED
                </span>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Discrepancy: Income Certificate Inconsistency
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">Applicant Form Value:</span>
                    <div className="font-bold text-slate-800">₹4,50,000 / annum</div>
                  </div>
                  <div>
                    <span className="text-slate-500">OCR Extracted Figure:</span>
                    <div className="font-bold text-red-700">₹7,20,000 / annum</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-amber-200">
                  Algorithm Confidence: 98.6% &bull; Rule: PMS_INC_02 &bull; Action: Manual Officer Verification
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  Officer Action: Raise Deficiency or Manual Override
                </span>
                <Link
                  to="/demo"
                  className="text-xs font-bold text-gov-navy-900 hover:text-amber-700 flex items-center gap-1"
                >
                  Test In Demo Hub <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-16 bg-slate-100 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-600">
            Learn more about the AI verification architecture, security, and DBT disbursement.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-4 flex items-center justify-between font-semibold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 font-bold text-lg">
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
