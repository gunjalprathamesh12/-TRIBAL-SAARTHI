import Scheme from '../models/Scheme.js';
import SchemeRule from '../models/SchemeRule.js';
import { logAuditEvent } from '../services/auditService.js';
import { evaluateEligibility } from '../services/ai/eligibilityService.js';

// @desc    Get all active schemes
// @route   GET /api/schemes
export const getSchemes = async (req, res, next) => {
  try {
    const { educationLevel, schemeType, search } = req.query;
    const query = { activeStatus: true };

    if (educationLevel) {
      query.educationLevels = educationLevel;
    }
    if (schemeType) {
      query.schemeType = schemeType;
    }
    if (search) {
      query.$or = [
        { schemeName: { $regex: search, $options: 'i' } },
        { shortTitle: { $regex: search, $options: 'i' } },
        { schemeCode: { $regex: search, $options: 'i' } },
      ];
    }

    const schemes = await Scheme.find(query).sort({ createdAt: 1 });
    res.json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single scheme details with rules
// @route   GET /api/schemes/:id
export const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found.',
      });
    }

    const rules = await SchemeRule.find({ schemeId: scheme._id, isActive: true }).sort({
      priorityOrder: 1,
    });

    res.json({
      success: true,
      data: {
        ...scheme.toObject(),
        rules,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin create new scheme
// @route   POST /api/schemes
export const createScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.create({
      ...req.body,
      createdBy: req.user._id,
    });

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SCHEME_MODIFIED',
      entityType: 'Scheme',
      entityId: scheme._id,
      newState: scheme.toObject(),
      reason: `New scheme "${scheme.schemeName}" created by Admin`,
    });

    res.status(201).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update scheme
// @route   PUT /api/schemes/:id
export const updateScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found.',
      });
    }

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SCHEME_MODIFIED',
      entityType: 'Scheme',
      entityId: scheme._id,
      newState: scheme.toObject(),
      reason: `Scheme "${scheme.schemeName}" updated by Admin`,
    });

    res.json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rules for a scheme
// @route   GET /api/schemes/:id/rules
export const getSchemeRules = async (req, res, next) => {
  try {
    const rules = await SchemeRule.find({ schemeId: req.params.id }).sort({ priorityOrder: 1 });
    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update a scheme rule
// @route   POST /api/schemes/:id/rules
export const saveSchemeRule = async (req, res, next) => {
  try {
    const { ruleId, ruleCode, ruleName, description, field, operator, expectedValue, actionOnFail, failureMessage, successMessage, meritWeight, priorityOrder, isActive } = req.body;

    let rule;
    if (ruleId) {
      rule = await SchemeRule.findByIdAndUpdate(
        ruleId,
        {
          ruleCode,
          ruleName,
          description,
          field,
          operator,
          expectedValue,
          actionOnFail,
          failureMessage,
          successMessage,
          meritWeight,
          priorityOrder,
          isActive,
        },
        { new: true }
      );
    } else {
      rule = await SchemeRule.create({
        schemeId: req.params.id,
        ruleCode,
        ruleName,
        description,
        field,
        operator,
        expectedValue,
        actionOnFail,
        failureMessage,
        successMessage,
        meritWeight,
        priorityOrder,
        isActive: isActive !== undefined ? isActive : true,
      });
    }

    await logAuditEvent({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'RULE_MODIFIED',
      entityType: 'SchemeRule',
      entityId: rule._id,
      newState: rule.toObject(),
      reason: `Rule ${rule.ruleCode} configured by Admin`,
    });

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a scheme rule
// @route   DELETE /api/schemes/rules/:ruleId
export const deleteSchemeRule = async (req, res, next) => {
  try {
    const rule = await SchemeRule.findByIdAndDelete(req.params.ruleId);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({
      success: true,
      message: 'Rule deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Recommend schemes based on applicant criteria (Find My Scheme)
// @route   POST /api/schemes/recommend
export const recommendSchemes = async (req, res, next) => {
  try {
    const {
      educationLevel,
      annualFamilyIncome,
      category = 'ST',
      marksPercentage,
      studyLocation = 'India',
      institutionType,
    } = req.body;

    const allSchemes = await Scheme.find({ activeStatus: true });
    const recommendations = [];

    for (const scheme of allSchemes) {
      // Filter out overseas schemes if applicant specifies India-only and vice-versa
      if (studyLocation === 'Abroad' && scheme.schemeType !== 'OVERSEAS_SCHOLARSHIP') {
        continue;
      }
      if (studyLocation === 'India' && scheme.schemeType === 'OVERSEAS_SCHOLARSHIP') {
        continue;
      }

      // Check education level match
      const levelMatch = scheme.educationLevels.some(
        (lvl) => lvl.toLowerCase() === (educationLevel || '').toLowerCase()
      );

      // Income check
      const incomeMatch = !annualFamilyIncome || Number(annualFamilyIncome) <= scheme.incomeLimit;

      // Evaluation
      const mockProfile = {
        category,
        annualFamilyIncome: Number(annualFamilyIncome) || 200000,
        currentEducationLevel: educationLevel,
        previousExamMarksPercentage: Number(marksPercentage) || 60,
        institutionType: institutionType || 'Govt College',
        isPVTG: false,
      };

      const evalResult = await evaluateEligibility({
        applicantProfile: mockProfile,
        scheme,
      });

      recommendations.push({
        scheme,
        isEligible: evalResult.isEligible,
        decision: evalResult.decision,
        matchScore: evalResult.compositeMeritScore,
        reasons: evalResult.ruleResults.filter((r) => r.passed).map((r) => r.message),
        potentialDeficiencies: evalResult.failedRules,
        financialBenefits: scheme.financialBenefits,
        documentsRequired: scheme.documentsRequired,
      });
    }

    // Sort by match score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};
