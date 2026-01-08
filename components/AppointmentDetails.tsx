
import React, { useState, useEffect } from 'react';
import { Appointment, Client, Service } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { 
  User, 
  Scissors, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock3,
  Loader2,
  ChevronRight,
  Edit3
} from 'lucide-react';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit?: () => void;
}

const DEFAULT_CLIENT_PHOTO = "https://i.ibb.co/HpCqCTGw/cliente.png";

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ appointment, onClose, onEdit }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubClient = onSnapshot(doc(db, 'clients', appointment.clienteId), (snap) => {
      if (snap.exists()) setClient({ id: snap.id, ...snap.data() } as Client);
    });
    const unsubService = onSnapshot(doc(db, 'servicos', appointment.servicoId), (snap) => {
      if (snap.exists()) setService({ id: snap.id, ...snap.data() } as Service);
    });
    return () => { unsubClient(); unsubService(); };
  }, [appointment]);

  const handleUpdateStatus = async (newStatus: Appointment['status']) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'appointments', appointment.id!), { status: newStatus });
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const statusOptions: { label: Appointment['status']; icon: any; color: string; desc: string }[] = [
    { label: 'Aguardando confirmação', icon: Clock3, color: 'text-slate-400', desc: 'Cliente ainda não confirmou o horário' },
    { label: 'Confirmado', icon: CheckCircle2, color: 'text-blue-500', desc: 'Horário garantido na agenda' },
    { label: 'Concluído', icon: CheckCircle2, color: 'text-emerald-500', desc: 'Serviço finalizado com sucesso' },
    { label: 'Não compareceu', icon: AlertCircle, color: 'text-orange-500', desc: 'Faltou sem aviso prévio' },
    { label: 'Cancelado', icon: XCircle, color: 'text-rose-500', desc: 'Horário liberado para outros' },
  ];

  const whatsappUrl = client?.telefone 
    ? `https://wa.me/55${client.telefone.replace(/\D/g, '')}?text=Olá ${client.displayName}, estou entrando em contato do Studio Hair Simone sobre seu agendamento de ${service?.displayName} no dia ${formatDateBR(appointment.dataAgendamento)} às ${appointment.horaAgendamento}.`
    : '#';

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300 pb-20">
      {/* CARD DE PERFIL CENTRAL */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-[3.5rem] bg-rose-50 border-4 border-white shadow-2xl overflow-hidden relative z-10">
            <img 
              src={client?.fotoUrl || DEFAULT_CLIENT_PHOTO} 
              className="w-full h-full object-cover" 
              alt={client?.displayName}
              onError={(e) => (e.currentTarget.src = DEFAULT_CLIENT_PHOTO)}
            />
          </div>
          <div className="absolute -inset-4 bg-gradient-to-tr from-rose-200 to-pink-100 rounded-full blur-2xl opacity-40 animate-pulse"></div>
          <div className={`absolute bottom-1 right-1 z-20 p-2 rounded-2xl shadow-lg border-2 border-white ${
            appointment.status === 'Concluído' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}>
            <CheckCircle2 size={16} className="text-white" />
          </div>
        </div>

        <div>
          <h4 className="text-3xl font-serif font-bold text-slate-800">{client?.displayName || 'Cliente'}</h4>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
              {appointment.status}
            </span>
          </div>
        </div>
      </div>

      {/* AÇÕES RÁPIDAS (Agora em 2 colunas após remoção do Ticket) */}
      <div className="grid grid-cols-2 gap-3">
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-[2rem] border border-emerald-100 group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 mb-2 group-hover:scale-110 transition-transform">
            <Phone size={18} />
          </div>
          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">WhatsApp</span>
        </a>

        <button 
          onClick={onEdit}
          className="flex flex-col items-center justify-center p-4 bg-rose-50 rounded-[2rem] border border-rose-100 group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-100 mb-2 group-hover:scale-110 transition-transform">
            <Edit3 size={18} />
          </div>
          <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Editar</span>
        </button>
      </div>

      {/* DETALHES TÉCNICOS */}
      <section className="space-y-4">
        <h5 className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Especificações</h5>
        <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
          {/* Serviço */}
          <div className="p-6 flex items-center gap-4 border-b border-slate-100 bg-white/50">
            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
              <Scissors size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] text-slate-400 font-black uppercase">Serviço Solicitado</p>
              <p className="text-base font-bold text-slate-700">{service?.displayName || 'Serviço'}</p>
            </div>
            <span className="text-lg font-black text-rose-500">R$ {appointment.valorAgendamento}</span>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2">
            <div className="p-6 flex items-center gap-4 border-r border-slate-100">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase">Data</p>
                <p className="text-sm font-bold text-slate-700">{formatDateBR(appointment.dataAgendamento)}</p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase">Horário</p>
                <p className="text-sm font-bold text-slate-700">{appointment.horaAgendamento}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OBSERVAÇÕES */}
      {appointment.observacao && (
        <section className="space-y-4">
          <h5 className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
            <MessageSquare size={14} className="text-rose-300" /> Notas da Simone
          </h5>
          <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-100 text-sm text-slate-600 leading-relaxed font-medium italic">
            "{appointment.observacao}"
          </div>
        </section>
      )}

      {/* GESTÃO DE STATUS */}
      <section className="space-y-4">
        <h5 className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Atualizar Situação</h5>
        <div className="space-y-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.label}
              disabled={updating || appointment.status === opt.label}
              onClick={() => handleUpdateStatus(opt.label)}
              className={`w-full flex items-center gap-4 p-5 rounded-3xl border transition-all text-left group ${
                appointment.status === opt.label 
                ? 'bg-slate-800 text-white border-slate-800 shadow-xl scale-[1.02]' 
                : 'bg-white text-slate-600 border-slate-100 hover:border-rose-200'
              } disabled:opacity-50`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                appointment.status === opt.label ? 'bg-white/20' : 'bg-slate-50'
              }`}>
                <opt.icon size={18} className={appointment.status === opt.label ? 'text-white' : opt.color} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{opt.label}</p>
                <p className={`text-[9px] ${appointment.status === opt.label ? 'text-white/60' : 'text-slate-400'}`}>{opt.desc}</p>
              </div>
              {appointment.status === opt.label && <CheckCircle2 size={18} className="text-white animate-in zoom-in" />}
              {updating && appointment.status !== opt.label && <Loader2 size={16} className="animate-spin opacity-30" />}
              <ChevronRight size={16} className={`transition-opacity ${appointment.status === opt.label ? 'opacity-0' : 'opacity-20 group-hover:opacity-100'}`} />
            </button>
          ))}
        </div>
      </section>

      {/* BOTÃO DE FECHAR RODAPÉ */}
      <div className="pt-6">
        <button 
          onClick={onClose}
          className="w-full py-5 bg-slate-100 text-slate-500 rounded-[2.5rem] text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
        >
          Voltar para Agenda
        </button>
      </div>
    </div>
  );
};

export default AppointmentDetails;
