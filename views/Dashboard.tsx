
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  UserCheck, 
  DollarSign, 
  ArrowRight, 
  Clock, 
  Scissors, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment, Client, Service } from '../types';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Props {
  onNavigate: (view: 'dashboard' | 'clients' | 'services' | 'schedule' | 'finance' | 'settings') => void;
}

const DEFAULT_CLIENT_PHOTO = "https://i.ibb.co/HpCqCTGw/cliente.png";

const DashboardView: React.FC<Props> = ({ onNavigate }) => {
  const [tip, setTip] = useState<string>("Buscando sua motivação do dia...");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });

  useEffect(() => {
    // 1. Escutar Agendamentos de Hoje
    const qAppts = query(collection(db, 'appointments'), where('dataAgendamento', '==', todayStr));
    const unsubAppts = onSnapshot(qAppts, (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });

    // 2. Escutar Total de Clientes
    const unsubClientsCount = onSnapshot(collection(db, 'clients'), (snap) => {
      setClientsCount(snap.size);
      setAllClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });

    // 3. Escutar Serviços (para nomes na lista)
    const unsubServices = onSnapshot(collection(db, 'servicos'), (snap) => {
      setAllServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    // 4. Buscar Frase do Dia via Gemini
    const fetchAITip = async () => {
      try {
        // Garantimos que a chave de API esteja presente. Em alguns builds móveis, process.env pode se comportar de forma instável
        if (!process.env.API_KEY) {
          throw new Error("API_KEY não configurada");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'Você é um mentor de sucesso para cabeleireiras. Escreva uma frase motivacional curta (máximo 12 palavras) para Simone, dona do salão Studio Hair, para inspirar o dia de trabalho dela. Use um tom elegante e acolhedor.',
        });

        if (response && response.text) {
          setTip(response.text.trim());
        } else {
          throw new Error("Resposta vazia da IA");
        }
      } catch (error) {
        console.error("Erro ao buscar frase via IA:", error);
        // Fallbacks elegantes em caso de falha de conexão ou API no mobile
        const fallbacks = [
          "Sua arte transforma vidas. Brilhe hoje, Simone!",
          "O Studio Hair é o palco do seu sucesso. Mãos à obra!",
          "Cada cliente é uma oportunidade de espalhar beleza.",
          "Excelência é o seu padrão. Tenha um dia maravilhoso!",
          "Simone, seu talento é o que faz o Studio Hair ser único."
        ];
        setTip(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
      }
    };

    fetchAITip();

    return () => { unsubAppts(); unsubClientsCount(); unsubServices(); };
  }, [todayStr]);

  // Cálculos de Métricas
  const todayAppts = appointments.length;
  const todayRevenue = appointments
    .filter(a => a.status === 'Confirmado' || a.status === 'Concluído')
    .reduce((acc, curr) => acc + curr.valorAgendamento, 0);

  // Próximos agendamentos (Hoje e que ainda vão acontecer)
  const upcomingAppts = appointments
    .filter(a => a.horaAgendamento >= currentTimeStr && a.status !== 'Cancelado')
    .sort((a, b) => a.horaAgendamento.compare(b.horaAgendamento));

  const pendingCount = appointments.filter(a => a.status === 'Aguardando confirmação').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="text-rose-400 animate-spin" size={40} />
        <p className="text-rose-300 font-serif italic">Preparando seu Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl shadow-rose-200/50 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Scissors size={200} />
        </div>
        
        <div className="text-center md:text-left z-10">
          <h2 className="text-3xl md:text-5xl font-serif mb-3 italic">Olá, Simone!</h2>
          <p className="text-white/90 text-sm md:text-lg mb-8 max-w-md leading-relaxed">
            Seu studio está bombando! Você tem <span className="font-black underline">{pendingCount}</span> {pendingCount === 1 ? 'agendamento pendente' : 'agendamentos pendentes'} para as próximas horas.
          </p>
          <button 
            onClick={() => onNavigate('schedule')}
            className="bg-white text-rose-500 hover:bg-rose-50 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all inline-flex shadow-xl active:scale-95"
          >
            Acessar Agenda Completa <ArrowRight size={18} />
          </button>
        </div>
        
        <div className="hidden lg:block w-40 h-40 bg-white/20 rounded-[3rem] border-8 border-white/5 animate-pulse rotate-12"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Motivation */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Grid Real-time */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard 
              label="Hoje" 
              value={todayAppts.toString()} 
              icon={Calendar} 
              color="bg-pink-50 text-pink-600" 
              border="border-pink-100" 
            />
            <StatCard 
              label="Clientes" 
              value={clientsCount.toString()} 
              icon={UserCheck} 
              color="bg-rose-50 text-rose-600" 
              border="border-rose-100" 
            />
            <StatCard 
              label="Ganhos" 
              value={`R$ ${todayRevenue}`} 
              icon={DollarSign} 
              color="bg-emerald-50 text-emerald-600" 
              border="border-emerald-100" 
            />
          </div>

          {/* Frase do Dia - Powered by Gemini */}
          <div className="bg-white/60 border border-white p-8 rounded-[2.5rem] backdrop-blur-md shadow-sm relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-100/30 rounded-full blur-3xl group-hover:bg-rose-200/40 transition-colors"></div>
             <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
               <Sparkles size={14} /> Frase do dia
             </h4>
             <p className="text-xl md:text-2xl text-slate-700 font-serif italic leading-relaxed">
               "{tip}"
             </p>
          </div>
        </div>

        {/* Right Column: Next of the Day */}
        <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-800">Próximos do Dia</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Fila de Atendimento</p>
            </div>
            <button 
              className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:underline" 
              onClick={() => onNavigate('schedule')}
            >
              Ver todos
            </button>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {upcomingAppts.length > 0 ? (
              upcomingAppts.map((appt) => {
                const client = allClients.find(c => c.id === appt.clienteId);
                const service = allServices.find(s => s.id === appt.servicoId);
                
                return (
                  <div 
                    key={appt.id} 
                    className="bg-white/90 backdrop-blur-sm p-4 rounded-[2rem] border border-pink-50 flex items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                    onClick={() => onNavigate('schedule')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-pink-100 overflow-hidden shrink-0 shadow-inner">
                          <img 
                            src={client?.fotoUrl || DEFAULT_CLIENT_PHOTO} 
                            className="w-full h-full object-cover" 
                            alt={client?.displayName}
                            onError={(e) => (e.currentTarget.src = DEFAULT_CLIENT_PHOTO)}
                          />
                        </div>
                        <div className="absolute -top-2 -left-2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg shadow-sm">
                          {appt.horaAgendamento}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-rose-500 transition-colors line-clamp-1">
                          {client?.displayName || 'Cliente'}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                          <Scissors size={10} className="text-rose-300" /> {service?.displayName || 'Serviço'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                        R$ {appt.valorAgendamento}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white/40 rounded-[2rem] border border-dashed border-rose-100">
                <Clock className="mx-auto text-rose-200 mb-2" size={32} />
                <p className="text-xs text-slate-400 font-serif italic">Nenhum atendimento<br/>restante para hoje.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente de Card de Estatística
const StatCard = ({ label, value, icon: Icon, color, border }: any) => (
  <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-[2.2rem] border ${border} flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1`}>
    <div className={`p-4 rounded-2xl ${color} mb-3 shadow-inner`}>
      <Icon size={22} />
    </div>
    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
    <span className="text-xl md:text-2xl font-black text-slate-800 mt-1 tracking-tight">{value}</span>
  </div>
);

export default DashboardView;
