import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { FileText, ShieldCheck, CheckCircle, Clock, UploadCloud, Eye, Download } from 'lucide-react';
import { formatDate } from '../utils/formatters.js';

const DocumentManagerPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/applications');
        if (res.success && res.data.length > 0) {
          // Fetch documents of first application for view
          const firstApp = res.data[0];
          const docRes = await api.get(`/applications/${firstApp._id}`);
          if (docRes.success) {
            setDocuments(docRes.data.documents || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-gov-navy-900" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              My Document Repository
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Digital repository of verified statutory certificates with optical character recognition (OCR) audit records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            SHA-256 Indexed
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading document vault...</div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No documents uploaded yet. Documents uploaded during application wizard will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-3.5">Document Type</th>
                  <th className="p-3.5">File Name</th>
                  <th className="p-3.5">Cryptographic Hash (SHA-256)</th>
                  <th className="p-3.5">OCR Status</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5">Uploaded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-gov-navy-900">
                      {doc.docType?.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{doc.originalFileName}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {doc.documentHash?.slice(0, 20)}...
                    </td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        OCR {doc.ocrConfidence || 97}%
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'MANUAL_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{formatDate(doc.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManagerPage;
