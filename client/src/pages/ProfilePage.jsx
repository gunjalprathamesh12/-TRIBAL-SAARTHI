import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import {
  User,
  ShieldCheck,
  Award,
  CreditCard,
  Building,
  CheckCircle,
  Save,
  AlertTriangle,
  FileText,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

const ProfilePage = () => {
  const { user, profile: initialProfile } = useAuth();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    dob: '',
    gender: 'Male',
    fatherName: '',
    motherName: '',
    maritalStatus: 'Single',
    aadhaarMasked: 'XXXX-XXXX-8921',
    category: 'ST',
    tribeName: 'Santhal',
    subTribe: '',
    isPVTG: false,
    stCertificateNo: '',
    stIssuingAuthority: 'Sub-Divisional Officer (SDO) / Tehsildar',
    state: 'Jharkhand',
    district: 'Ranchi',
    pincode: '834001',
    addressLine: '',
    currentEducationLevel: 'Undergraduate',
    courseName: 'B.Tech in Computer Science',
    institutionName: 'Birla Institute of Technology (BIT Mesra)',
    institutionType: 'Premier Institute (IIT/NIT/IIM/AIIMS)',
    previousExamMarksPercentage: 88.5,
    annualFamilyIncome: 180000,
    bankName: 'State Bank of India',
    bankAccountNumber: 'XXXX XXXX 4821',
    ifscCode: 'SBIN0001234',
    isAadhaarLinkedToBank: true,
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.data.profile) {
          const p = res.data.profile;
          setProfile((prev) => ({
            ...prev,
            ...p,
            dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : prev.dob,
          }));
        } else if (user) {
          setProfile((prev) => ({
            ...prev,
            fullName: user.name || prev.fullName,
          }));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', profile);
      if (res.success) {
        addToast({
          title: 'Profile Updated',
          message: 'Your student demographic and academic profile has been saved successfully.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Update Failed',
        message: err.userMessage || 'Could not update profile details.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-gov-navy-900" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              Student Beneficiary Profile
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Official demographic, scheduled tribe lineage, institutional credentials, and PFMS-linked DBT bank details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Aadhaar e-KYC Verified</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Basic Identity & Contact */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gov-navy-900" />
              1. Identity & Personal Details
            </h2>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Masked UID: {profile.aadhaarMasked || 'XXXX-XXXX-8921'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={profile.dob}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Father's Name</label>
              <input
                type="text"
                name="fatherName"
                value={profile.fatherName}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mother's Name</label>
              <input
                type="text"
                name="motherName"
                value={profile.motherName}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marital Status</label>
              <select
                name="maritalStatus"
                value={profile.maritalStatus}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Domicile State</label>
              <input
                type="text"
                name="state"
                value={profile.state}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                name="district"
                value={profile.district}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={profile.pincode}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Permanent Residential Address</label>
            <input
              type="text"
              name="addressLine"
              value={profile.addressLine}
              onChange={handleChange}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
              placeholder="House/Plot No., Village/Ward, Post Office..."
              required
            />
          </div>
        </div>

        {/* Section 2: Tribal Caste Credentials & PVTG */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              2. Scheduled Tribe (ST) Demographics
            </h2>
            <span className="text-[11px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-200">
              Constitutional Category: ST
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recognized ST Tribe</label>
              <input
                type="text"
                name="tribeName"
                value={profile.tribeName}
                onChange={handleChange}
                placeholder="e.g. Santhal, Bhil, Gond, Munda, Khasi, Bodo"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sub-Tribe (Optional)</label>
              <input
                type="text"
                name="subTribe"
                value={profile.subTribe || ''}
                onChange={handleChange}
                placeholder="Clan / Sub-community"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ST Caste Certificate No.</label>
              <input
                type="text"
                name="stCertificateNo"
                value={profile.stCertificateNo}
                onChange={handleChange}
                placeholder="ST/JH/2023/123456"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issuing Authority</label>
              <input
                type="text"
                name="stIssuingAuthority"
                value={profile.stIssuingAuthority}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Family Income (INR)</label>
              <input
                type="number"
                name="annualFamilyIncome"
                value={profile.annualFamilyIncome}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none font-semibold text-slate-900"
                required
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isPVTG"
                name="isPVTG"
                checked={profile.isPVTG}
                onChange={handleChange}
                className="w-4 h-4 text-gov-navy-900 rounded border-slate-300 focus:ring-gov-navy-900"
              />
              <label htmlFor="isPVTG" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Belongs to Particularly Vulnerable Tribal Group (PVTG)
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Academic Institution Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-gov-navy-900" />
              3. Educational Background
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Education Level</label>
              <select
                name="currentEducationLevel"
                value={profile.currentEducationLevel}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
                <option value="Diploma">Diploma</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Ph.D">Ph.D / Doctoral</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course / Degree Name</label>
              <input
                type="text"
                name="courseName"
                value={profile.courseName}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Previous Exam Score (%)</label>
              <input
                type="number"
                step="0.1"
                name="previousExamMarksPercentage"
                value={profile.previousExamMarksPercentage}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none font-semibold text-slate-900"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Name of Enrolled Institution</label>
              <input
                type="text"
                name="institutionName"
                value={profile.institutionName}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Category</label>
              <select
                name="institutionType"
                value={profile.institutionType}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
              >
                <option value="Premier Institute (IIT/NIT/IIM/AIIMS)">Premier Institute (IIT/NIT/IIM/AIIMS)</option>
                <option value="Central University">Central University</option>
                <option value="State University">State University</option>
                <option value="Govt College">Govt College</option>
                <option value="Private University">Private University</option>
                <option value="Govt School">Govt School</option>
                <option value="Recognized School">Recognized School</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Bank Account & DBT Direct Transfer Gateway */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              4. Direct Benefit Transfer (DBT) & Bank Credentials
            </h2>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              PFMS / APBS Active
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 leading-relaxed">
            <strong>Aadhaar Payment Bridge System (APBS) Notice:</strong> Scholarship sanctions are directly credited to your Aadhaar-seeded primary bank account via NPCI mapper. No intermediaries or cash withdrawals required.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={profile.bankName}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Account (Masked)</label>
              <input
                type="text"
                name="bankAccountNumber"
                value={profile.bankAccountNumber}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={profile.ifscCode}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-900 focus:outline-none font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Footer Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile Changes...' : 'Save & Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
