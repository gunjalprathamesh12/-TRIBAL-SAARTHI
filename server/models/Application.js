import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  stageName: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  officerRole: {
    type: String,
    default: 'SYSTEM',
  },
  remarks: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApplicantProfile',
      required: true,
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_VERIFICATION',
        'DEFICIENCY_RAISED',
        'CORRECTION_SUBMITTED',
        'SCRUTINY_PENDING',
        'SELECTION_REVIEW',
        'SHORTLISTED',
        'SANCTIONED',
        'DISBURSEMENT_PENDING',
        'DISBURSED',
        'REJECTED',
      ],
      default: 'DRAFT',
      index: true,
    },
    currentStage: {
      type: String,
      enum: [
        'Draft Creation',
        'Application Submitted',
        'Document Verification',
        'Deficiency Resolution',
        'Eligibility & Scrutiny',
        'Selection Committee Review',
        'Sanction Order Processing',
        'Direct Benefit Transfer (DBT)',
        'Award Disbursed / Completed',
        'Application Rejected',
      ],
      default: 'Draft Creation',
    },
    wizardStepCompleted: {
      type: Number,
      default: 1,
    },
    submissionDate: {
      type: Date,
    },
    formDataSnapshot: {
      type: mongoose.Schema.Types.Mixed,
    },
    aiVerificationSummary: {
      overallRiskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW',
      },
      recommendedQueue: {
        type: String,
        enum: ['LOW_REVIEW_EFFORT', 'NORMAL_REVIEW', 'ATTENTION_REQUIRED', 'MANUAL_REVIEW'],
        default: 'NORMAL_REVIEW',
      },
      confidenceScore: {
        type: Number,
        default: 95,
      },
      flagsCount: {
        type: Number,
        default: 0,
      },
      lastEvaluatedAt: {
        type: Date,
      },
      aiSummaryNote: {
        type: String,
      },
    },
    eligibilitySummary: {
      isEligible: { type: Boolean, default: true },
      decision: {
        type: String,
        enum: ['ELIGIBLE', 'NOT_ELIGIBLE', 'NEEDS_HUMAN_REVIEW'],
        default: 'NEEDS_HUMAN_REVIEW',
      },
      meritScore: { type: Number, default: 0 },
      passedRulesCount: { type: Number, default: 0 },
      failedRulesCount: { type: Number, default: 0 },
      summary: { type: String },
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationRemarks: {
      type: String,
    },
    sanctionOrderNo: {
      type: String,
    },
    sanctionAmount: {
      type: Number,
      default: 0,
    },
    statusHistory: [statusHistorySchema],
    isDemoRecord: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);

export default Application;
