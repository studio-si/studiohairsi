
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  Scissors,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  Info
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment, Client, Service } from '../types';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentDetails from '../components/AppointmentDetails';

const DEFAULT_CLIENT_PHOTO = "https://i.ibb.co/HpCqCTGw/cliente.png";

const ScheduleView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('');

  // Estados de Visibilidade
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    const qAppts = query(collection(db, 'appointments'), orderBy('horaAgendamento', 'asc'));
    const unsubAppts = onSnapshot(qAppts, (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });

    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    const unsubServices = onSnapshot(collection(db, 'servicos'), (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    return () => { unsubAppts(); unsubClients(); unsubServices(); };
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'Concluído': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      case 'Não compareceu': return 'bg-orange-50 text-orange-500 border-orange-100';
      case 'Cancelado': return 'bg-rose-50 text-rose-500 border-rose-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100'; // Aguardando
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmado': return <CheckCircle2 size={14} />;
      case 'Concluído': return <CheckCircle2 size={14} />;
      case 'Não compareceu': return <AlertCircle size={14} />;
      case 'Cancelado': return <XCircle size={14} />;
      default: return <HelpCircle size={14} />;
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesDate = appt.dataAgendamento === selectedDate;
    const client = clients.find(c => c.id === appt.clienteId);
    const service = services.find(s => s.id === appt.servicoId);
    
    const clientName = (client?.displayName || "").toLowerCase();
    const serviceName = (service?.displayName || "").toLowerCase();
    
    const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || 
                         serviceName.includes(searchTerm.toLowerCase());
    
    const matchesService = filterService === '' || appt.servicoId === filterService;

    return matchesDate && matchesSearch && matchesService;
  });

  const handleEditFromDetails = (appt: Appointment) => {
    // Definimos o agendamento ANTES de abrir o formulário para garantir que os props cheguem povoados
    setSelectedAppt(appt);
    setIsDetailsOpen(false);
    setTimeout(() => {
      setIsFormOpen(true);
    }, 10);
  };

  const handleOpenNewForm = () => {
    setSelectedAppt(null);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (appt: Appointment) => {
    setSelectedAppt(appt);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-3xl font-serif text-slate-800">Agenda</h2>
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Gestão de Horários</p>
        </div>
        <button 
          onClick={handleOpenNewForm}
          className="w-full md:w-auto bg-gradient-to-tr from-rose-500 to-pink-400 text-white px-8 py-4 rounded-[2rem] shadow-xl shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest"
        >
          <Plus size={20} /> Novo Agendamento
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white/70 backdrop-blur-md p-4 rounded-[2.5rem] border border-pink-100/50 shadow-sm">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="font-serif font-bold text-slate-700">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex gap-2">
               <button className="p-2 text-rose-300 hover:bg-rose-50 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
               <button className="p-2 text-rose-300 hover:bg-rose-50 rounded-xl transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="flex justify-between overflow-x-auto gap-3 py-2 no-scrollbar scroll-smooth">
            {[-2, -1, 0, 1, 2, 3, 4, 5, 6].map(offset => {
              const d = new Date();
              d.setDate(d.getDate() + offset);
              const iso = d.toISOString().split('T')[0];
              const active = iso === selectedDate;
              return (
                <button 
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className={`flex flex-col items-center min-w-[3.5rem] p-4 rounded-[2rem] transition-all duration-300 ${
                    active ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105' : 'bg-pink-50/40 text-slate-400'
                  }`}
                >
                  <span className="text-[9px] uppercase font-black mb-1 opacity-70">
                    {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                  </span>
                  <span className="text-base font-bold">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente ou serviço..." 
              className="w-full h-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-md rounded-[2rem] border border-pink-100/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all text-sm placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={16} />
            <select 
              className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md rounded-[1.5rem] border border-pink-100/50 text-xs font-bold text-slate-500 appearance-none focus:outline-none"
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
            >
              <option value="">Todos os Serviços</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4 px-1">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appt) => {
            const client = clients.find(c => c.id === appt.clienteId);
            const service = services.find(s => s.id === appt.servicoId);
            
            return (
              <div 
                key={appt.id} 
                className="group relative animate-in slide-in-from-left duration-300"
                onClick={() => handleOpenDetails(appt)}
              >
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-[2.5rem] border border-pink-50 shadow-sm flex items-center justify-between hover:shadow-xl transition-all cursor-pointer active:scale-[0.99]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-pink-100 overflow-hidden shrink-0 shadow-inner">
                      <img 
                        src={client?.fotoUrl || DEFAULT_CLIENT_PHOTO} 
                        className="w-full h-full object-cover" 
                        alt={client?.displayName}
                        onError={(e) => (e.currentTarget.src = DEFAULT_CLIENT_PHOTO)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-rose-500 flex items-center gap-1">
                        <Clock size={10} /> {appt.horaAgendamento}
                      </span>
                      <div className="mt-0.5">
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{client?.displayName || 'Cliente'}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                          <Scissors size={10} className="text-rose-300" /> {service?.displayName || 'Serviço'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(appt.status)}`}>
                      {getStatusIcon(appt.status)}
                      {appt.status}
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-sm font-black text-rose-500">R$ {appt.valorAgendamento}</span>
                      <button className="p-1 text-slate-300"><MoreVertical size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-24 opacity-30 flex flex-col items-center">
            <CalendarIcon className="text-rose-200 mb-4" size={64} />
            <p className="font-serif italic text-slate-500 text-lg">Sem agendamentos para hoje.</p>
          </div>
        )}
      </div>

      {/* FORMULÁRIO DE TELA CHEIA (NOVO OU EDITAR AGENDAMENTO) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[150] bg-rose-50 animate-in slide-in-from-bottom duration-500 overflow-hidden flex flex-col">
          <header className="p-6 bg-white border-b border-rose-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-800">
                  {selectedAppt ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h3>
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">
                  {selectedAppt ? 'Alterar informações existentes' : 'Preencha os detalhes abaixo'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setIsFormOpen(false); setSelectedAppt(null); }}
              className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-95"
            >
              <X size={24} />
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
              <AppointmentForm 
                appointment={selectedAppt}
                initialDate={selectedDate} 
                onSuccess={() => { setIsFormOpen(false); setSelectedAppt(null); }} 
                onCancel={() => { setIsFormOpen(false); setSelectedAppt(null); }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* DETALHES DE TELA CHEIA */}
      {isDetailsOpen && selectedAppt && (
        <div className="fixed inset-0 z-[150] bg-white animate-in slide-in-from-bottom duration-500 overflow-hidden flex flex-col">
          <header className="p-6 bg-white border-b border-rose-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center shadow-md">
                <Info size={20} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-800">Detalhes da Agenda</h3>
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Informações do Agendamento</p>
              </div>
            </div>
            <button 
              onClick={() => { setIsDetailsOpen(false); setSelectedAppt(null); }}
              className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-95"
            >
              <X size={24} />
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
              <AppointmentDetails 
                appointment={selectedAppt} 
                onClose={() => { setIsDetailsOpen(false); setSelectedAppt(null); }} 
                onEdit={() => handleEditFromDetails(selectedAppt)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
