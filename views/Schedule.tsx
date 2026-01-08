
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment } from '../types';
import ModalWidget from '../components/ModalWidget';
import AppointmentForm from '../components/AppointmentForm';

const ScheduleView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });
    return () => unsubscribe();
  }, []);

  const dayAppointments = appointments
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-400">
      <div className="bg-white/70 backdrop-blur-md p-4 rounded-[2.5rem] border border-pink-100/50 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <button className="p-1 text-rose-300"><ChevronLeft size={20} /></button>
          <span className="font-serif font-bold text-slate-800 text-lg">
            {new Date(selectedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <button className="p-1 text-rose-300"><ChevronRight size={20} /></button>
        </div>
        <div className="flex justify-between overflow-x-auto gap-2 py-2">
          {[-2, -1, 0, 1, 2, 3, 4].map(offset => {
            const d = new Date();
            d.setDate(d.getDate() + offset);
            const iso = d.toISOString().split('T')[0];
            const active = iso === selectedDate;
            return (
              <button 
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={`flex flex-col items-center min-w-[3.5rem] p-3 rounded-2xl transition-all duration-300 ${
                  active ? 'bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-lg shadow-rose-200 scale-105' : 'bg-pink-50/50 text-slate-400'
                }`}
              >
                <span className="text-[10px] uppercase font-bold mb-1 opacity-80">
                  {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </span>
                <span className="text-base font-bold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center px-1">
        <h3 className="text-xl font-serif text-slate-800">Horários</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-100 flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Plus size={14} /> Agendar
        </button>
      </div>

      <div className="space-y-4">
        {dayAppointments.length > 0 ? (
          dayAppointments.map((appt) => (
            <div key={appt.id} className="relative pl-12 group">
               <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-pink-100"></div>
               <div className="absolute left-[-4px] top-4 w-2 h-2 rounded-full bg-rose-400 ring-4 ring-pink-50 group-hover:scale-125 transition-transform"></div>
               <div className="bg-white/80 backdrop-blur-sm p-4 rounded-[2rem] border border-pink-50 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-rose-500 mb-1">{appt.startTime}</span>
                    <h4 className="text-sm font-bold text-slate-800">{appt.clientName}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-medium tracking-tight">{appt.serviceName}</p>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100/50 active:bg-emerald-500 active:text-white transition-colors">
                    <Check size={18} />
                  </button>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-30 flex flex-col items-center">
            <CalendarIcon className="text-rose-200 mb-3" size={56} strokeWidth={1} />
            <p className="font-serif italic text-slate-500 text-sm">Nada agendado para hoje.</p>
          </div>
        )}
      </div>

      <ModalWidget 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Novo Agendamento"
      >
        <AppointmentForm 
          initialDate={selectedDate} 
          onSuccess={() => setIsModalOpen(false)} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </ModalWidget>
    </div>
  );
};

export default ScheduleView;
