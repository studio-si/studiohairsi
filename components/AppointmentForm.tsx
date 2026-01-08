
import React, { useState, useEffect } from 'react';
import { Appointment, Client, Service } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { NotificationService } from '../services/notificationService';

interface AppointmentFormProps {
  initialDate: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialDate, onSuccess, onCancel }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    time: '09:00',
    date: initialDate
  });

  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    // Fix: Changed collection name from 'services' to 'servicos' to match the database structure
    const unsubServices = onSnapshot(collection(db, 'servicos'), (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });
    return () => { unsubClients(); unsubServices(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === formData.clientId);
    const service = services.find(s => s.id === formData.serviceId);
    
    if (!client || !service) return;

    try {
      // Fix: Updated service.name to service.displayName and service.price to service.valorServico
      const apptData: Appointment = {
        clientId: client.id!,
        clientName: client.name,
        serviceId: service.id!,
        serviceName: service.displayName,
        date: formData.date,
        startTime: formData.time,
        endTime: '',
        status: 'scheduled',
        totalPrice: service.valorServico
      };

      const docRef = await addDoc(collection(db, 'appointments'), apptData);
      
      const [hours, minutes] = formData.time.split(':').map(Number);
      const apptDateTime = new Date(formData.date);
      apptDateTime.setHours(hours, minutes);
      
      await NotificationService.scheduleAppointmentNotification(
        docRef.id,
        client.name,
        service.displayName,
        apptDateTime
      );

      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-rose-300 uppercase ml-2 tracking-widest">Cliente</label>
        <select 
          className="w-full mt-1 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm appearance-none"
          required
          value={formData.clientId}
          onChange={e => setFormData({...formData, clientId: e.target.value})}
        >
          <option value="">Selecionar Cliente</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] font-bold text-rose-300 uppercase ml-2 tracking-widest">Serviço</label>
        <select 
          className="w-full mt-1 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm appearance-none"
          required
          value={formData.serviceId}
          onChange={e => setFormData({...formData, serviceId: e.target.value})}
        >
          <option value="">Selecionar Serviço</option>
          {/* Fix: Updated s.name to s.displayName and s.price to s.valorServico to match Service type */}
          {services.map(s => <option key={s.id} value={s.id}>{s.displayName} - R$ {s.valorServico}</option>)}
        </select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-rose-300 uppercase ml-2 tracking-widest">Data</label>
          <input 
            type="date" 
            className="w-full mt-1 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
            required
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-rose-300 uppercase ml-2 tracking-widest">Horário</label>
          <input 
            type="time" 
            className="w-full mt-1 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
            required
            value={formData.time}
            onChange={e => setFormData({...formData, time: e.target.value})}
          />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 text-sm font-semibold text-slate-400"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="flex-1 py-4 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-rose-200 active:scale-95 transition-all"
        >
          Confirmar
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;