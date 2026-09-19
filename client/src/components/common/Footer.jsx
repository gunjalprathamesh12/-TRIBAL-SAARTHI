import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Award, FileText, CheckCircle, HelpCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-sm border-t border-slate-800">
      {/* Upper disclaimer strip */}
      <div className="bg-amber-950/40 border-b border-amber-900/40 py-2.5 px-4 text-center text-xs text-amber-300 font-medium">
        <span>
          <strong>DEMO NOTICE:</strong> Prototype engineered for Smart India Hackathon (SIH Problem Statement 26239) — Ministry of Tribal Affairs. All beneficiary names, bank details, and Aadhaar numbers are purely synthetic demo data.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: MoTA Portal Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg tracking-tight">
              <span>TRIBAL SAARTHI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Enabled, transparent, and auditable scholarship and fellowship lifecycle management system designed for Scheduled Tribe students across India.
            </p>
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
              Ministry of Tribal Affairs, Shastri Bhawan, New Delhi - 110001
            </div>
          </div>

          {/* Column 2: Supported Schemes */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Official ST Schemes
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/schemes" className="hover:text-amber-400 transition-colors">
                  Pre-Matric Scholarship (Class 9 & 10)
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-amber-400 transition-colors">
                  Post-Matric Scholarship (PMS-ST)
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-amber-400 transition-colors">
                  Top Class Education in Premier Institutes
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-amber-400 transition-colors">
                  National Fellowship for ST (NFST)
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-amber-400 transition-colors">
                  National Overseas Scholarship (NOS)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Portals & Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/schemes?finder=true" className="hover:text-amber-400 transition-colors">
                  Find My Scholarship (AI Assist)
                </Link>
              </li>
              <li>
                <Link to="/demo" className="hover:text-amber-400 transition-colors font-medium text-amber-300">
                  SIH Evaluator Demo Suite
                </Link>
              </li>
              <li>
                <Link to="/applicant/help" className="hover:text-amber-400 transition-colors">
                  Grievance & Helpdesk
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy, Encryption & Data Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official References */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Official References
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a
                  href="https://tribal.nic.in/ScholarshiP.aspx"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  MoTA Scholarship Portal
                </a>
              </li>
              <li>
                <a
                  href="https://dbttribal.gov.in/AllScheme.aspx"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  DBT Tribal Schemes Portal
                </a>
              </li>
              <li>
                <span className="inline-block bg-slate-800 text-slate-300 px-2 py-1 rounded text-[11px]">
                  Direct Benefit Transfer (PFMS / APBS Compliant)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & credits */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} TRIBAL SAARTHI &bull; Smart India Hackathon Prototype (SIH PS 26239). All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              WCAG 2.1 AA Accessible
            </span>
            <span>&bull;</span>
            <span className="text-slate-400">National Informatics Centre Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
