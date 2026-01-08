
import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
  async requestPermissions() {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (e) {
      console.warn("LocalNotifications not available in this environment", e);
      return false;
    }
  },

  async scheduleAppointmentNotification(appointmentId: string, clientName: string, serviceName: string, date: Date) {
    try {
      // Notify 1 hour before
      const notificationDate = new Date(date.getTime() - 60 * 60 * 1000);
      
      if (notificationDate < new Date()) return;

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Lembrete de Agendamento',
            body: `Próximo cliente: ${clientName} para ${serviceName} em 1 hora.`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: notificationDate },
            sound: 'default',
            attachments: [],
            extra: { appointmentId }
          }
        ]
      });
    } catch (e) {
      console.warn("Could not schedule local notification", e);
    }
  },

  async cancelAll() {
    try {
      await LocalNotifications.removeAllDeliveredNotifications();
    } catch (e) {
      console.warn("Notification error", e);
    }
  }
};
