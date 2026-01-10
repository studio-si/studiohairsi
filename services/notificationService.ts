
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
      // 1. Criar objeto de data para o agendamento garantindo o formato local correto
      // dateStr: YYYY-MM-DD, timeStr: HH:MM
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Criamos a data no contexto local do dispositivo para evitar shifts de fuso horário
      const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      // 2. Calcular o momento da notificação (Data do Agendamento - Antecedência)
      const triggerDate = new Date(appointmentDate.getTime() - (leadMinutes * 60000));

      // Se o horário de notificação já passou em relação ao "agora" do dispositivo, não agenda
      const now = new Date();
      if (triggerDate <= now) {
        console.log(`[NotificationService] Horário de disparo (${triggerDate.toISOString()}) já passou ou é agora. Pulando.`);
        return false;
      }

      const notificationId = Math.floor(Math.random() * 1000000);

      // Agendamento via Capacitor utilizando o objeto Date diretamente para o campo 'at'
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '📅 Lembrete de Atendimento',
            body: `Cliente: ${clientName}\nServiço: ${serviceName}\nHorário: ${timeStr}`,
            id: notificationId,
            schedule: { 
              at: triggerDate, // Capacitor aceita o objeto Date e lida com o agendamento nativo
              allowWhileIdle: true 
            },
            sound: 'default',
            extra: { appointmentId: id }
          }
        ]
      });

      console.log(`[NotificationService] Notificação agendada para: ${triggerDate.toLocaleString('pt-BR')}`);
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
