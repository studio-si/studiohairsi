
import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
  async requestPermissions() {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (e) {
      console.warn("LocalNotifications não disponível neste ambiente", e);
      return false;
    }
  },

  async scheduleStudioNotification(
    id: string, 
    clientName: string, 
    serviceName: string, 
    dateStr: string, 
    timeStr: string, 
    leadMinutes: number
  ) {
    try {
      // 1. Criar objeto de data para o agendamento
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      const appointmentDate = new Date(year, month - 1, day, hours, minutes);
      
      // 2. Calcular o momento da notificação (Data do Agendamento - Antecedência)
      const triggerDate = new Date(appointmentDate.getTime() - leadMinutes * 60000);

      // Se o horário de notificação já passou, não agenda
      if (triggerDate < new Date()) {
        console.log("Horário de notificação já passou, ignorando agendamento local.");
        return false;
      }

      const notificationId = Math.floor(Math.random() * 1000000);

      await LocalNotifications.schedule({
        notifications: [
          {
            title: '📅 Agendamento do dia',
            body: `👩 ${clientName}\n✂️ ${serviceName}\n⏰ ${timeStr}`,
            id: notificationId,
            schedule: { at: triggerDate },
            sound: 'default',
            extra: { appointmentId: id }
          }
        ]
      });
      return true;
    } catch (e) {
      console.error("Erro ao agendar notificação local:", e);
      return false;
    }
  },

  async cancelAll() {
    try {
      await LocalNotifications.removeAllDeliveredNotifications();
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch (e) {
      console.warn("Erro ao limpar notificações:", e);
    }
  }
};
