import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApplicantProfile from '../models/ApplicantProfile.js';
import { logAuditEvent } from '../services/auditService.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'tribal_saarthi_sih_2026_jwt_secret_key_secure',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new applicant user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      dob,
      state,
      district,
      category = 'ST',
      tribeName = 'Santhal',
      educationLevel = 'Undergraduate',
      demoOtp,
    } = req.body;

    // Verify demo OTP if submitted
    if (demoOtp && demoOtp !== '123456') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Demo OTP. Use demo OTP: 123456',
        errorCode: 'INVALID_OTP',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists in the portal.',
        errorCode: 'USER_EXISTS',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password,
      role: 'APPLICANT',
      designation: 'Scholarship Applicant',
      isDemoAccount: true,
    });

    // Create default applicant profile
    const profile = await ApplicantProfile.create({
      userId: user._id,
      fullName: name,
      dob: dob || new Date('2003-05-15'),
      gender: 'Male',
      fatherName: 'Late/Shri ' + name.split(' ')[0] + ' Senior',
      motherName: 'Smt. Devi',
      category: 'ST',
      tribeName,
      stCertificateNo: `ST/2023/${Math.floor(100000 + Math.random() * 900000)}`,
      state: state || 'Jharkhand',
      district: district || 'Ranchi',
      pincode: '834001',
      addressLine: 'Tribal Welfare Hostel, Near Circular Road',
      currentEducationLevel: educationLevel,
      courseName: 'Bachelor of Technology (Computer Science)',
      previousExamMarksPercentage: 76.5,
      institutionName: 'National Institute of Technology (NIT) Jamshedpur',
      institutionType: 'Premier Institute (IIT/NIT/IIM/AIIMS)',
      annualFamilyIncome: 180000,
      incomeCertificateNo: `INC/2024/${Math.floor(10000 + Math.random() * 90000)}`,
      accountHolderName: name,
      accountNumberMasked: 'XXXX XXXX 4821',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      branchName: 'Ranchi Main Branch',
    });

    await logAuditEvent({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'APPLICATION_CREATED',
      entityType: 'User',
      entityId: user._id,
      reason: 'New applicant registered on Tribal Saarthi portal',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to Tribal Saarthi!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileId: profile._id,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      user.lastLogin = new Date();
      await user.save();

      let profile = null;
      if (user.role === 'APPLICANT') {
        profile = await ApplicantProfile.findOne({ userId: user._id });
      }

      return res.json({
        success: true,
        message: 'Login successful.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          department: user.department,
          designation: user.designation,
          isDemoAccount: user.isDemoAccount,
          profileId: profile ? profile._id : null,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user info
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let profile = null;
    if (user.role === 'APPLICANT') {
      profile = await ApplicantProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick demo switch role for hackathon judges
// @route   POST /api/auth/demo-switch
export const switchDemoRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetEmailMap = {
      APPLICANT: 'applicant@demo.com',
      VERIFICATION_OFFICER: 'verifier@demo.com',
      SCRUTINY_OFFICER: 'scrutiny@demo.com',
      SELECTION_COMMITTEE: 'committee@demo.com',
      FINANCE_OFFICER: 'finance@demo.com',
      ADMIN: 'admin@demo.com',
    };

    const targetEmail = targetEmailMap[role] || 'applicant@demo.com';
    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo user for role ${role} not found. Ensure database is seeded.`,
      });
    }

    let profile = null;
    if (user.role === 'APPLICANT') {
      profile = await ApplicantProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      message: `Switched demo role to ${user.role} (${user.name})`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        department: user.department,
        designation: user.designation,
        isDemoAccount: true,
        profileId: profile ? profile._id : null,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update applicant profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const profile = await ApplicantProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Applicant profile not found.' });
    }

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PROFILE_UPDATED',
      entityType: 'ApplicantProfile',
      entityId: profile._id,
      reason: 'Student updated socio-demographic / academic profile',
    });

    res.json({
      success: true,
      message: 'Student profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
