import mongoose from 'mongoose';

const committeeReviewSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  memberName: { type: String },
  vote: { type: String, enum: ['APPROVE', 'REJECT', 'HOLD', 'SHORTLIST'] },
  scoreAwarded: { type: Number },
  comments: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const selectionSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Merit Matrix
    academicPerformanceScore: { type: Number, default: 0, max: 40 },
    researchAdmissionScore: { type: Number, default: 0, max: 20 },
    schemeSpecificScore: { type: Number, default: 0, max: 20 },
    specialVulnerabilityScore: { type: Number, default: 0, max: 20 }, // PVTG, Girls, Divyang
    totalMeritScore: { type: Number, default: 0, max: 100 },
    stateRank: { type: Number },
    nationalRank: { type: Number },
    quotaCategory: {
      type: String,
      enum: ['GENERAL_ST', 'PVTG_ST', 'FEMALE_ST', 'DIVYANG_ST'],
      default: 'GENERAL_ST',
    },
    selectionStatus: {
      type: String,
      enum: ['IN_REVIEW', 'SHORTLISTED', 'APPROVED', 'HELD', 'REJECTED'],
      default: 'IN_REVIEW',
      index: true,
    },
    approvedSanctionAmount: {
      type: Number,
      default: 0,
    },
    committeeReviews: [committeeReviewSchema],
    selectionRemarks: {
      type: String,
    },
    selectedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Selection = mongoose.model('Selection', selectionSchema);

export default Selection;
