import SchemeRule from '../../models/SchemeRule.js';

/**
 * Helper to evaluate a single binary or set condition
 */
const evaluateCondition = (actualValue, operator, expectedValue) => {
  if (actualValue === undefined || actualValue === null) {
    return false;
  }

  switch (operator) {
    case '==':
      if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
        return actualValue.trim().toLowerCase() === expectedValue.trim().toLowerCase();
      }
      return actualValue == expectedValue;

    case '!=':
      if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
        return actualValue.trim().toLowerCase() !== expectedValue.trim().toLowerCase();
      }
      return actualValue != expectedValue;

    case '>':
      return Number(actualValue) > Number(expectedValue);

    case '<':
      return Number(actualValue) < Number(expectedValue);

    case '>=':
      return Number(actualValue) >= Number(expectedValue);

    case '<=':
      return Number(actualValue) <= Number(expectedValue);

    case 'IN':
      if (Array.isArray(expectedValue)) {
        return expectedValue.some((val) =>
          String(val).trim().toLowerCase() === String(actualValue).trim().toLowerCase()
        );
      }
      return false;

    case 'NOT IN':
      if (Array.isArray(expectedValue)) {
        return !expectedValue.some((val) =>
          String(val).trim().toLowerCase() === String(actualValue).trim().toLowerCase()
        );
      }
      return true;

    default:
      return false;
  }
};

/**
 * Dynamic Configurable Eligibility & Merit Engine
 * Evaluates rules from the database and returns transparent decision support.
 */
export const evaluateEligibility = async ({
  applicantProfile,
  scheme,
  customRules = null,
  applicationDocuments = [],
}) => {
  // Fetch rules from database if not passed directly
  const rules =
    customRules ||
    (await SchemeRule.find({ schemeId: scheme._id, isActive: true }).sort({ priorityOrder: 1 }));

  const ruleResults = [];
  const failedRules = [];
  const warnings = [];
  const humanReviewReasons = [];
  let requiresHumanReview = false;
  let isEligible = true;

  // Merit scoring breakdown
  let academicScore = 0;
  let socialPVTGScore = 0;
  let economicScore = 0;
  let schemeSpecificScore = 0;

  // 1. Calculate Base Merit Points from Profile
  const marks = applicantProfile.previousExamMarksPercentage || 0;
  academicScore = Math.min(40, Math.round((marks / 100) * 40));

  if (applicantProfile.isPVTG) {
    socialPVTGScore += 15;
  }
  if (applicantProfile.disabilityStatus) {
    socialPVTGScore += 5;
  }
  socialPVTGScore = Math.min(20, socialPVTGScore);

  // Economic vulnerability (lower income = higher score)
  const income = applicantProfile.annualFamilyIncome || 250000;
  if (income <= 150000) economicScore = 20;
  else if (income <= 250000) economicScore = 15;
  else if (income <= 450000) economicScore = 10;
  else economicScore = 5;

  // Scheme specific scoring
  if (scheme.schemeType === 'FELLOWSHIP' && applicantProfile.netJrfStatus !== 'NOT_APPLICABLE') {
    schemeSpecificScore += 18;
  } else if (scheme.schemeType === 'OVERSEAS_SCHOLARSHIP' && applicantProfile.qsWorldRank && applicantProfile.qsWorldRank <= 200) {
    schemeSpecificScore += 20;
  } else {
    schemeSpecificScore += 12;
  }

  // 2. Evaluate Each Configurable Rule
  for (const rule of rules) {
    let actualValue = applicantProfile[rule.field];

    // Special field evaluations
    if (rule.field === 'nationality') {
      actualValue = 'Indian'; // All applicants in portal are Indian nationals
    } else if (rule.field === 'age') {
      if (applicantProfile.dob) {
        const diffMs = Date.now() - new Date(applicantProfile.dob).getTime();
        actualValue = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
      } else {
        actualValue = 22;
      }
    } else if (rule.field === 'hasMandatoryDocuments') {
      // Check if all mandatory documents required by scheme are present
      const mandatoryDocTypes = (scheme.documentsRequired || [])
        .filter((d) => d.isMandatory)
        .map((d) => d.docType);
      
      const uploadedDocTypes = applicationDocuments.map((d) => d.docType);
      const missing = mandatoryDocTypes.filter((dt) => !uploadedDocTypes.includes(dt));
      actualValue = missing.length === 0;
    }

    const passed = evaluateCondition(actualValue, rule.operator, rule.expectedValue);

    let meritPoints = 0;
    if (passed && rule.meritWeight) {
      meritPoints = rule.meritWeight;
    }

    const resultItem = {
      ruleId: rule._id,
      ruleCode: rule.ruleCode,
      ruleName: rule.ruleName,
      field: rule.field,
      operator: rule.operator,
      expectedValue: rule.expectedValue,
      actualValue: actualValue !== undefined ? actualValue : 'Not Provided',
      passed,
      actionOnFail: rule.actionOnFail,
      message: passed ? (rule.successMessage || 'Criteria met') : rule.failureMessage,
      meritPointsAwarded: meritPoints,
    };

    ruleResults.push(resultItem);

    if (!passed) {
      if (rule.actionOnFail === 'NOT_ELIGIBLE') {
        isEligible = false;
        failedRules.push(rule.failureMessage);
      } else if (rule.actionOnFail === 'NEEDS_HUMAN_REVIEW') {
        requiresHumanReview = true;
        humanReviewReasons.push(rule.failureMessage);
      } else if (rule.actionOnFail === 'WARNING') {
        warnings.push(rule.failureMessage);
      }
    }
  }

  // Composite decision
  let decision = 'ELIGIBLE';
  if (!isEligible) {
    decision = 'NOT_ELIGIBLE';
  } else if (requiresHumanReview || warnings.length > 0) {
    decision = 'NEEDS_HUMAN_REVIEW';
  }

  const totalScore = Math.min(100, academicScore + socialPVTGScore + economicScore + schemeSpecificScore);

  return {
    decision,
    isEligible,
    requiresHumanReview,
    compositeMeritScore: totalScore,
    scoreBreakdown: {
      academicScore,
      socialPVTGScore,
      economicScore,
      schemeSpecificScore,
      totalScore,
    },
    ruleResults,
    failedRules,
    warnings,
    humanReviewReasons,
    evaluatedAt: new Date(),
  };
};
