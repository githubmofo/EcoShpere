// src/services/notification.service.ts
// Notification business logic

export class NotificationService {
  // TODO: Implement notification logic
  static async sendNotification(userId: string, message: string): Promise<void> {
    console.log(`[Notification] to ${userId}: ${message}`);
  }
}
