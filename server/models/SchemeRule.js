import mongoose from 'mongoose';

const schemeRuleSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    ruleCode: {
      type: String,
      required: true,
      trim: true,
    },
    ruleName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    field: {
      type: String,
      required: true,
      enum: [
        'category',
        'annualFamilyIncome',
        'currentEducationLevel',
        'previousExamMarksPercentage',
        'institutionType',
        'isPVTG',
        'disabilityStatus',
        'age',
        'nationality',
        'qsWorldRank',
        'netJrfStatus',
        'hasMandatoryDocuments',
        'gender',
        'state',
      ],
    },
    operator: {
      type: String,
      required: true,
      enum: ['==', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN'],
    },
    expectedValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    actionOnFail: {
      type: String,
      enum: ['NOT_ELIGIBLE', 'NEEDS_HUMAN_REVIEW', 'WARNING'],
      default: 'NOT_ELIGIBLE',
    },
    failureMessage: {
      type: String,
      required: true,
    },
    successMessage: {
      type: String,
      default: 'Criteria satisfied successfully',
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
    meritWeight: {
      type: Number,
      default: 0,
    },
    priorityOrder: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SchemeRule = mongoose.model('SchemeRule', schemeRuleSchema);

export default SchemeRule;
