import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import {
  Zap,
  Play,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Award,
  CreditCard,
  User,
  Sliders,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

const DemoHubPage = () => {
  const { user, switchDemoRole } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoRoles = [
    {
      role: 'APPLICANT',
      name: 'Rahul Kumar',
      email: 'applicant@demo.com',
      desc: 'Scheduled Tribe applicant student discovering schemes and submitting applications.',
      path: '/applicant/dashboard',
    },
    {
      role: 'VERIFICATION_OFFICER',
      name: 'Dr. Rameshwar Oraon',
      email: 'verifier@demo.com',
      desc: 'Senior verification officer reviewing side-by-side OCR extractions and raising deficiencies.',
      path: '/officer/queue',
    },
    {
      role: 'SELECTION_COMMITTEE',
      name: 'Prof. Arjun Munda',
      email: 'committee@demo.com',
      desc: 'Selection board chairperson scoring merit benchmarks and issuing sanctions.',
      path: '/selection',
    },
    {
      role: 'FINANCE_OFFICER',
      name: 'Shri Sanjeev Kumar',
      email: 'finance@demo.com',
      desc: 'Finance officer executing Aadhaar Payment Bridge System (APBS) batch disbursements.',
      path: '/finance',
    },
    {
      role: 'ADMIN',
      name: 'MoTA System Administrator',
      email: 'admin@demo.com',
      desc: 'System administrator managing the configurable rule builder, audit trail, and analytics.',
      path: '/admin/dashboard',
    },
  ];

  const demoScenarios = [
    {
      id: 1,
      title: '1. Fully Eligible Happy Path',
      scheme: 'Top Class Education for ST',
      desc: 'Eligible student with verified ST caste certificate and income <= 6.0 Lakh. Smooth automated pass to scrutiny.',
      badge: 'HAPPY PATH',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 2,
      title: '2. Missing Income Certificate',
      scheme: 'Post-Matric ST Scholarship',
      desc: 'Student uploaded bonafide and marksheet but omitted mandatory income proof. AI flags missing document.',
      badge: 'DEFICIENCY',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 3,
      title: '3. Intentional Income Mismatch',
      scheme: 'PMS-ST Scheme',
      desc: 'Application declared ₹4,50,000 vs OCR extracted ₹7,20,000 from certificate scan. Flags manual scrutiny.',
      badge: 'AI DISCREPANCY',
      badgeColor: 'bg-red-100 text-red-800',
    },
    {
      id: 4,
      title: '4. Name Spelling Variance',
      scheme: 'Pre-Matric ST',
      desc: 'Applicant name "Rahul Kumar" differs from "Rahul K." on marksheet. Levenshtein fuzzy match advisory flag.',
      badge: 'ANOMALY SIGNAL',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 5,
      title: '5. Duplicate Certificate Reused',
      scheme: 'National Fellowship (NFST)',
      desc: 'Caste certificate number ST/JH/2023/1209 was previously submitted by another applicant. Duplicate alarm.',
      badge: 'FRAUD SIGNAL',
      badgeColor: 'bg-red-100 text-red-900 font-bold',
    },
    {
      id: 6,
      title: '6. Overseas Scholarship Candidate',
      scheme: 'National Overseas Scholarship (NOS)',
      desc: 'Unconditional admission to University of Oxford (QS Rank Top 10). Full foreign allowance evaluation.',
      badge: 'OVERSEAS',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 7,
      title: '7. Doctoral Fellowship Research',
      scheme: 'National Fellowship for ST (NFST)',
      desc: 'Ph.D candidate with approved research synopsis on tribal ethnobotany and JRF entitlement.',
      badge: 'FELLOWSHIP',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
  ];

  const walkthroughSteps = [
    {
      step: 1,
      title: 'Scheme Recommendation Engine',
      actor: 'Applicant Student',
      details:
        'Student inputs Ph.D, ST Category, ₹4,50,000 income, India. Configurable rule engine dynamically recommends National Fellowship for ST (NFST).',
      evidence: 'Rule evaluated: eduLevel IN ["M.Phil", "Ph.D"] AND income <= 800000 -> MATCH',
    },
    {
      step: 2,
      title: '10-Step Application Wizard',
      actor: 'Applicant Student',
      details:
        'Applicant fills demographic, tribal community, and institution credentials with draft autosave at every stage.',
      evidence: 'Autosaved to MongoDB with application number TS-2025-NFST-1002.',
    },
    {
      step: 3,
      title: 'Document Upload & Cryptographic Hashing',
      actor: 'AI Ingestion Pipeline',
      details:
        'Uploaded certificates are cryptographically hashed using SHA-256 to ensure data integrity and prevent cross-applicant duplication.',
      evidence: 'Document Hash: sha256-a9b814... (Index recorded in database).',
    },
    {
      step: 4,
      title: 'AI OCR Extraction & Classification',
      actor: 'Document Intelligence Service',
      details:
        'OCR engine extracts candidate name, certificate reference, and income figure with 97.4% confidence score.',
      evidence: 'Extracted: Name: Rahul Kumar | Certificate: INC/2024/98124.',
    },
    {
      step: 5,
      title: 'Intentional Income Mismatch Identified',
      actor: 'AI Anomaly Detector',
      details:
        'Discrepancy detected: Application declared ₹4,50,000 vs OCR extracted ₹7,20,000 from the Tahsildar certificate.',
      evidence: 'Flag: INCOME_MISMATCH | Severity: CRITICAL | Queue: ATTENTION REQUIRED.',
    },
    {
      step: 6,
      title: 'Human-in-the-Loop Scrutiny Review',
      actor: 'Verification Officer',
      details:
        'Officer inspects split-screen view: Original certificate scan on left, OCR extraction in center, and "Why was this flagged?" evidence card on right.',
      evidence: 'Decision: Officer confirms mismatch and raises deficiency.',
    },
    {
      step: 7,
      title: 'Deficiency Raised to Applicant',
      actor: 'Verification Officer',
      details:
        'Officer raises formal deficiency request DEF-2026-1002 with 15-day remediation deadline. Student is notified via in-app alert and simulated SMS.',
      evidence: 'Application stage transitioned to: Deficiency Resolution.',
    },
    {
      step: 8,
      title: 'Applicant Uploads Corrected Document',
      actor: 'Applicant Student',
      details:
        'Student logs into Deficiency Center, uploads newly issued valid Revenue Income Certificate for ₹2,20,000, and submits explanation.',
      evidence: 'Application stage transitioned to: Correction Submitted.',
    },
    {
      step: 9,
      title: 'Automated AI Re-Verification',
      actor: 'Eligibility Engine',
      details:
        'System automatically re-scans corrected certificate. Extracted income ₹2,20,000 satisfies scheme ceiling (<= ₹8,00,000). Decision: ELIGIBLE.',
      evidence: 'All mandatory rules verified: 5/5 PASSED.',
    },
    {
      step: 10,
      title: 'Selection Board Merit Evaluation',
      actor: 'Selection Committee',
      details:
        'National Selection Committee reviews transparent scoring: Academic (35/40), Research (18/20), Scheme (17/20), Vulnerability (15/20) -> 85/100.',
      evidence: 'Rank: #1 in State Merit List &bull; Status: APPROVED.',
    },
    {
      step: 11,
      title: 'Sanction Order Generation',
      actor: 'Selection Board & MoTA',
      details:
        'Official Sanction Order MoTA/2026/NFST/0942 generated for annual grant of ₹4,68,000/-. Transferred to Finance Division.',
      evidence: 'Sanction Amount: ₹4,68,000/- &bull; DBT Batch Generated.',
    },
    {
      step: 12,
      title: 'Direct Benefit Transfer (DBT) via APBS',
      actor: 'Finance / DBT Officer',
      details:
        'Finance officer executes batch release via PFMS / Aadhaar Payment Bridge. Transaction ref UTR RBI2026031809412 credited to masked account XXXX XXXX 4821.',
      evidence: 'Status: DISBURSED &bull; Student notified: "Scholarship Disbursed".',
    },
  ];

  const handleRoleSelect = async (roleObj) => {
    try {
      await switchDemoRole(roleObj.role);
      addToast({
        title: 'Demo Persona Activated',
        message: `Now acting as ${roleObj.name} (${roleObj.role})`,
        type: 'success',
      });
      navigate(roleObj.path);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gov-navy-950 via-gov-navy-900 to-gov-navy-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-3 border border-slate-800">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span>Smart India Hackathon (SIH PS 26239) Evaluator Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          TRIBAL SAARTHI &bull; End-to-End Judge Demonstration Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Switch between any of the 5 stakeholder personas with a single click, launch 7 pre-configured test scenarios, or run the complete 12-step guided judge interactive walkthrough.
        </p>
      </div>

      {/* 1. Instant 1-Click Role Switcher */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-gov-navy-950 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-amber-600" />
          1. Instant Stakeholder Persona Switcher (Single Click Login)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {demoRoles.map((r) => (
            <button
              key={r.role}
              onClick={() => handleRoleSelect(r)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
                user?.role === r.role
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-white border-slate-200 hover:border-gov-navy-800'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gov-navy-800 bg-slate-100 px-2 py-0.5 rounded">
                    {r.role.replace(/_/g, ' ')}
                  </span>
                  {user?.role === r.role && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  )}
                </div>
                <div className="font-bold text-xs text-slate-900">{r.name}</div>
                <p className="text-[11px] text-slate-500 leading-snug">{r.desc}</p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-bold text-gov-navy-900 flex items-center justify-between">
                <span>Switch & Open Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Automated 12-Step Judge Presentation Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="text-base sm:text-lg font-extrabold text-gov-navy-950">
                2. Complete 12-Step Lifecycle Presentation Stepper
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              Step-by-step interactive walkthrough demonstrating the full journey from scheme discovery to DBT disbursement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous Step
            </button>

            <span className="text-xs font-mono font-bold text-slate-600 px-2">
              Step {activeStep} of 12
            </span>

            <button
              onClick={() => setActiveStep((prev) => Math.min(12, prev + 1))}
              disabled={activeStep === 12}
              className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs disabled:opacity-40"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Active Step Showcase Card */}
        {(() => {
          const st = walkthroughSteps[activeStep - 1];
          return (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gov-navy-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                    {st.step}
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-gov-navy-950">
                    {st.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-white border border-slate-300 px-2.5 py-1 rounded-md">
                  Active Actor: {st.actor}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {st.details}
              </p>

              <div className="bg-white rounded-lg p-3.5 border border-slate-200 text-xs font-mono space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Verification & Audit Record Evidence:
                </div>
                <div className="text-slate-800">{st.evidence}</div>
              </div>
            </div>
          );
        })()}

        {/* Stepper Dots Bar */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pt-2">
          {walkthroughSteps.map((st) => (
            <button
              key={st.step}
              onClick={() => setActiveStep(st.step)}
              className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded transition-all cursor-pointer ${
                st.step === activeStep
                  ? 'bg-gov-navy-900 text-white shadow-xs'
                  : st.step < activeStep
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {st.step}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Pre-Configured Test Scenarios */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-gov-navy-950 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          3. Pre-Configured SIH Test Scenarios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoScenarios.map((sc) => (
            <div
              key={sc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Scenario #{sc.id}</span>
                </div>
                <h3 className="font-bold text-xs text-gov-navy-950">{sc.title}</h3>
                <div className="text-[11px] font-semibold text-gov-navy-800">
                  Target: {sc.scheme}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{sc.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    addToast({
                      title: `Loaded ${sc.title}`,
                      message: 'Scenario test environment ready.',
                      type: 'info',
                    });
                    navigate('/officer/queue');
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-gov-navy-900 font-bold text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Launch in Officer Queue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoHubPage;
