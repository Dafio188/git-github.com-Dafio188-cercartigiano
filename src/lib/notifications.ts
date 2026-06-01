import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';

export type NotificationType = 'new_proposal' | 'new_message' | 'proposal_accepted' | 'job_completed';

/**
 * Sends a notification to a specific user.
 * This both creates an in-app notification and simulates an email send.
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, any>
) {
  try {
    // 1. Create In-App Notification
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
      ...metadata
    });

    // 2. Simulate Email Sending
    // In a real app, this would call a Cloud Function or an API like SendGrid/Resend
    console.log(`[EMAIL SIMULATION] Sending ${type} to user ${userId}:`, {
      title,
      message,
      metadata
    });

    // 3. Increment unread count on user profile (optional shortcut for global bell)
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      unreadNotificationsCount: increment(1)
    }).catch(e => console.warn("User profile unread count update failed:", e));

    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}

/**
 * Specialized helper for new messages in a job context
 */
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  jobId: string,
  jobTitle: string,
  messageText: string
) {
  // Update Job's unread counter for visual badge on card
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, {
    [`unreadMessagesCount.${recipientId}`]: increment(1)
  });

  return sendNotification(
    recipientId,
    'new_message',
    'Nuovo Messaggio',
    `${senderName} ti ha scritto per "${jobTitle}": "${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}"`,
    { jobId, externalLink: `/jobs/${jobId}` }
  );
}

/**
 * Specialized helper for new proposals
 */
export async function notifyNewProposal(
  clientId: string,
  jobId: string,
  jobTitle: string
) {
  return sendNotification(
    clientId,
    'new_proposal',
    'Nuovo Preventivo Ricevuto',
    `Un professionista ha inviato un preventivo per la tua richiesta: "${jobTitle}"`,
    { jobId, externalLink: `/jobs/${jobId}` }
  );
}
