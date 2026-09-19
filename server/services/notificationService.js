import Notification from '../models/Notification.js';

export const sendNotification = async ({
  userId,
  title,
  message,
  type = 'INFO',
  channel = 'MULTI_CHANNEL',
  link = '/applicant/dashboard',
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      channel,
      link,
      metadata: {
        ...metadata,
        smsText: `[Tribal Saarthi MoTA] ${title}: ${message.slice(0, 120)}... Track at portal.`,
        emailSubject: `[Ministry of Tribal Affairs] Notification: ${title}`,
      },
    });

    console.log(`[Notification Sent] To: ${userId} | Channel: ${channel} | Title: "${title}"`);
    return notification;
  } catch (error) {
    console.error('[Notification Dispatch Error]', error.message);
    return null;
  }
};
