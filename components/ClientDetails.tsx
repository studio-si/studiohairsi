
import React from 'react';
import { Client } from '../types';
import { Phone, Calendar, Edit3, Heart, MessageSquare, Clock } from 'lucide-react';

interface ClientDetailsProps {
  client: Client;
  onEdit: () => void;
  onClose: () => void;
}

const DEFAULT_CLIENT_PHOTO = "https://i.ibb.co/HpCqCTGw/cliente.png";

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onEdit, onClose }) => {
  const whatsappUrl = `https://wa.me/55${client.telefone.replace(/\D/g, '')}`;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
      {/* Perfil Header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-[3rem] bg-pink-50 border-4 border-white shadow-xl overflow-hidden mb-4 relative z-10">
            <img 
              src={client.fotoUrl || DEFAULT_CLIENT_PHOTO} 
              alt={client.displayName} 
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = DEFAULT_CLIENT_PHOTO)}
            />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-tr from-rose-200 to-pink-100 rounded-[3.5rem] blur-xl opacity-40 animate-pulse"></div>
          
          <div className="absolute -bottom-1 -right-1 z-20 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg border-2 border-white">
            <Heart size={14} className="fill-white" />
          </div>
        </div>

        <h3 className="text-2xl font-serif font-bold text-slate-800 leading-tight">
          {client.displayName}
        </h3>
        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.2em] mt-1">
          Cliente VIP desde {new Date(client.createdAt).getFullYear()}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-3">
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100 group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md">
            <MessageSquare size={18} />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">WhatsApp</p>
            <p className="text-sm font-bold text-slate-800">{client.telefone}</p>
          </div>
        </a>

        <div className="flex items-center gap-4 p-5 bg-pink-50/50 rounded-[2rem] border border-pink-100/30">
          <div className="w-10 h-10 bg-rose-400 text-white rounded-2xl flex items-center justify-center shadow-md">
            <Clock size={18} />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Cadastrada em</p>
            <p className="text-sm font-bold text-slate-800">{formatDate(client.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button 
          onClick={onEdit}
          className="flex-1 py-4 bg-white border border-pink-100 text-slate-600 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pink-50 transition-all active:scale-95"
        >
          <Edit3 size={16} /> Editar Dados
        </button>
        <button 
          className="flex-1 py-4 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
          onClick={() => alert("Função de agendamento direto em breve!")}
        >
          <Calendar size={16} /> Novo Agendamento
        </button>
      </div>
    </div>
  );
};

export default ClientDetails;
