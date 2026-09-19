import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { GraduationCap, Lock, Mail, Phone, User, Calendar, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    dob: '2004-06-15',
    state: 'Jharkhand',
    district: 'Ranchi',
    category: 'ST',
    tribeName: 'Santhal',
    educationLevel: 'Undergraduate',
  });

  const [otpStep, setOtpStep] = useState(false);
  const [demoOtp, setDemoOtp] = useState('123456');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      addToast({ title: 'Validation Error', message: 'Please fill all mandatory fields.', type: 'warning' });
      return;
    }
    setOtpStep(true);
    addToast({
      title: 'Demo OTP Dispatched',
      message: 'Simulated 6-digit verification code sent to your mobile. Use Demo OTP: 123456.',
      type: 'info',
    });
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...formData, demoOtp });
      addToast({
        title: 'Registration Complete',
        message: 'Welcome to Tribal Saarthi! Your applicant profile has been initialized.',
        type: 'success',
      });
      navigate('/applicant/dashboard');
    } catch (err) {
      addToast({
        title: 'Registration Failed',
        message: err.userMessage || 'Could not complete registration.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-gov-navy-900 text-amber-400 flex items-center justify-center mx-auto shadow-md border border-amber-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-gov-navy-950 tracking-tight">
            Applicant Registration
          </h2>
          <p className="text-xs text-slate-600">
            Scheduled Tribe Students Portal &bull; Ministry of Tribal Affairs
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          {!otpStep ? (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (As per Aadhaar/10th Marksheet) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Munda"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Tribe (Community) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tribeName}
                    onChange={(e) => setFormData({ ...formData, tribeName: e.target.value })}
                    placeholder="e.g. Santhal, Bhil, Gond, Munda"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Education Level *
                  </label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                  >
                    <option value="Class 10">Class 9 / 10</option>
                    <option value="Class 12">Class 11 / 12</option>
                    <option value="Undergraduate">Undergraduate (UG)</option>
                    <option value="Postgraduate">Postgraduate (PG)</option>
                    <option value="Ph.D">Ph.D / M.Phil</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to OTP Verification <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalRegister} className="space-y-4">
              <div className="text-center space-y-2 py-3">
                <div className="inline-block p-3 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Verify Mobile Number & Identity
                </h3>
                <p className="text-xs text-slate-600">
                  A verification code has been dispatched to <strong>+91 {formData.mobile}</strong>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center space-y-1">
                <div className="text-xs font-bold text-amber-900">SIH Hackathon Demo OTP Simulation:</div>
                <div className="text-lg font-mono font-extrabold text-amber-700 tracking-widest">
                  123456
                </div>
                <div className="text-[10px] text-amber-800">
                  Enter <strong>123456</strong> below to complete registration
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={demoOtp}
                  onChange={(e) => setDemoOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-colors"
                >
                  {loading ? 'Creating Account...' : 'Confirm & Register'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-700 hover:text-amber-800">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
