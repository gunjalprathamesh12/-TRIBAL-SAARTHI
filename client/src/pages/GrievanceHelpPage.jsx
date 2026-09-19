import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Send,
  Building,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters.js';

const GrievanceHelpPage = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  const [form, setForm] = useState({
    category: 'DBT_PAYMENT_FAILURE',
    priority: 'NORMAL',
    subject: '',
    description: '',
  });

  const { addToast } = useNotification();

  const fetchGrievances = async () => {
    try {
      const res = await api.get('/grievances');
      if (res.success) {
        setGrievances(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      addToast({
        title: 'Missing Information',
        message: 'Please fill in both subject and description.',
        type: 'warning',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/grievances', form);
      if (res.success) {
        addToast({
          title: 'Ticket Submitted',
          message: `Your grievance ${res.data?.ticketId || ''} has been registered with MoTA Helpdesk.`,
          type: 'success',
        });
        setForm({
          category: 'DBT_PAYMENT_FAILURE',
          priority: 'NORMAL',
          subject: '',
          description: '',
        });
        setNewTicketOpen(false);
        fetchGrievances();
      }
    } catch (err) {
      addToast({
        title: 'Submission Failed',
        message: err.userMessage || 'Could not register grievance ticket.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-gov-navy-900" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              Grievance Redressal & Student Helpdesk
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Ministry of Tribal Affairs Student Support Cell &bull; Direct resolution for DBT, document verification & scheme queries.
          </p>
        </div>

        <button
          onClick={() => setNewTicketOpen(!newTicketOpen)}
          className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {newTicketOpen ? 'Close Form' : 'Raise New Grievance'}
        </button>
      </div>

      {/* New Ticket Form Accordion */}
      {newTicketOpen && (
        <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-md animate-in fade-in space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Register a New Grievance Ticket
            </h2>
            <p className="text-xs text-slate-500">
              Tickets are directly routed to state nodal officers with a guaranteed 48-hour SLA response.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                >
                  <option value="DBT_PAYMENT_FAILURE">DBT Payment / Aadhaar Bridge Failure</option>
                  <option value="DOCUMENT_VERIFICATION">Document Scrutiny / OCR Discrepancy</option>
                  <option value="SCHEME_ELIGIBILITY">Eligibility Calculation Dispute</option>
                  <option value="TECHNICAL_GLITCH">Portal Upload / Submission Error</option>
                  <option value="OTHER">Other General Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                >
                  <option value="LOW">Low - General query</option>
                  <option value="NORMAL">Normal - Standard request</option>
                  <option value="HIGH">High - Urgent timeline</option>
                  <option value="URGENT">Urgent - Scholarship deadline at risk</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief summary of your grievance..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Please describe what happened, including any relevant transaction numbers, dates, or college remarks..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNewTicketOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting...' : 'Submit Grievance Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Tickets List + Support Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Grievances */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              My Submitted Tickets ({grievances.length})
            </h2>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Loading grievances...
            </div>
          ) : grievances.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
              <FileQuestion className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No active grievances</div>
              <p className="text-xs text-slate-500">
                You haven't filed any support requests. If you face any issues with verification or DBT payment, click "Raise New Grievance".
              </p>
            </div>
          ) : (
            grievances.map((g) => {
              const isExpanded = expandedTicketId === g._id;
              return (
                <div
                  key={g._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedTicketId(isExpanded ? null : g._id)}
                    className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/70"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-gov-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                          {g.ticketId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            g.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : g.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {g.status}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {g.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {g.subject}
                      </h3>
                      <div className="text-[11px] text-slate-400">
                        Submitted on {formatDateTime(g.createdAt)}
                      </div>
                    </div>

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-700 mb-1">Your Issue Description:</div>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg leading-relaxed">
                          {g.description}
                        </p>
                      </div>

                      {g.resolutionRemarks ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1">
                          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            Official Officer Resolution:
                          </div>
                          <p className="text-emerald-800 leading-relaxed">
                            {g.resolutionRemarks}
                          </p>
                          {g.resolvedAt && (
                            <div className="text-[10px] text-emerald-600 pt-1">
                              Resolved on {formatDateTime(g.resolvedAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-lg text-xs">
                          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>Under scrutiny with MoTA Nodal Officer. Target resolution within 48 business hours.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right 1 Col: MoTA Support Contacts & FAQs */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-gov-navy-900" />
              MoTA Official Support Desk
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">National Toll-Free Helpline</div>
                  <p className="text-slate-500">1800-11-7788 (Mon-Sat, 9AM - 6PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Scholarship Cell Email</div>
                  <p className="text-slate-500">support-tribalsaarthi@gov.in</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Ministry Address</div>
                  <p className="text-slate-500">Shastri Bhawan, Dr. Rajendra Prasad Rd, New Delhi 110001</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-2.5 text-xs">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Frequently Asked Help Questions
            </div>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong className="text-white block">Why did my DBT payment fail?</strong>
                Ensure your bank account is seeded with Aadhaar and NPCI mapper is active.
              </p>
              <p>
                <strong className="text-white block">How to respond to a deficiency?</strong>
                Go to "Deficiencies" tab and re-upload the requested certificate within 15 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceHelpPage;
