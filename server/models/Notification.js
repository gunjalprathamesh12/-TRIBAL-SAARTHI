import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['INFO', 'SUCCESS', 'WARNING', 'DEFICIENCY', 'SELECTION', 'DISBURSEMENT', 'SYSTEM'],
      default: 'INFO',
    },
    channel: {
      type: String,
      enum: ['IN_APP', 'SMS_SIMULATION', 'EMAIL_SIMULATION', 'MULTI_CHANNEL'],
      default: 'MULTI_CHANNEL',
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
      smsText: String,
      emailSubject: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
