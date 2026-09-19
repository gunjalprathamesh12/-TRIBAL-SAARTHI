import mongoose from 'mongoose';

const ruleEvaluationItemSchema = new mongoose.Schema({
  ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchemeRule' },
  ruleCode: { type: String, required: true },
  ruleName: { type: String, required: true },
  field: { type: String, required: true },
  operator: { type: String, required: true },
  expectedValue: mongoose.Schema.Types.Mixed,
  actualValue: mongoose.Schema.Types.Mixed,
  passed: { type: Boolean, required: true },
  actionOnFail: { type: String, default: 'NOT_ELIGIBLE' },
  message: { type: String, required: true },
  meritPointsAwarded: { type: Number, default: 0 },
});

const eligibilityResultSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    decision: {
      type: String,
      enum: ['ELIGIBLE', 'NOT_ELIGIBLE', 'NEEDS_HUMAN_REVIEW'],
      required: true,
    },
    compositeMeritScore: {
      type: Number,
      default: 0,
    },
    scoreBreakdown: {
      academicScore: { type: Number, default: 0 },
      socialPVTGScore: { type: Number, default: 0 },
      economicScore: { type: Number, default: 0 },
      schemeSpecificScore: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
    },
    ruleResults: [ruleEvaluationItemSchema],
    failedRules: [String],
    warnings: [String],
    requiresHumanReview: {
      type: Boolean,
      default: false,
    },
    humanReviewReasons: [String],
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
    officerOverride: {
      isOverridden: { type: Boolean, default: false },
      officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      previousDecision: { type: String },
      newDecision: { type: String },
      overrideReason: { type: String },
      overriddenAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

const EligibilityResult = mongoose.model('EligibilityResult', eligibilityResultSchema);

export default EligibilityResult;
