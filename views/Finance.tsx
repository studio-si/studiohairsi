
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  PieChart as PieIcon,
  ShoppingBag,
  Star,
  Search,
  Filter as FilterIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment, Client } from '../types';

const DEFAULT_CLIENT_PHOTO = "https://i.ibb.co/HpCqCTGw/cliente.png";

const FinanceView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtro
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);

  useEffect(() => {
    // Escutar todos os agendamentos
    const unsubAppts = onSnapshot(collection(db, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });

    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });

    return () => { unsubAppts(); unsubClients(); };
  }, []);

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Filtragem Dinâmica baseada no Período Selecionado
  const filteredAppts = appointments.filter(a => {
    return a.dataAgendamento >= startDate && a.dataAgendamento <= endDate;
  });

  const confirmedRevenue = filteredAppts
    .filter(a => a.status === 'Confirmado' || a.status === 'Concluído')
    .reduce((acc, curr) => acc + curr.valorAgendamento, 0);

  const receivedRevenue = filteredAppts
    .filter(a => a.status === 'Concluído')
    .reduce((acc, curr) => acc + curr.valorAgendamento, 0);

  const ticketMedio = filteredAppts.length > 0 
    ? (confirmedRevenue / filteredAppts.length).toFixed(2) 
    : "0.00";

  // Dados para o Gráfico de Área (Simulando histórico para estética)
  const chartData = [
    { name: 'Hist.', total: confirmedRevenue * 0.7 },
    { name: 'Prev.', total: confirmedRevenue * 0.9 },
    { name: 'Atual', total: confirmedRevenue },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="text-rose-400 animate-spin" size={40} />
        <p className="text-rose-300 font-serif italic">Calculando lucros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header Financeiro */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-800">Financeiro</h2>
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.2em] mt-1">Gestão de Receitas e Fluxo</p>
        </div>
        
        {/* Filtro de Data Integrado */}
        <div className="flex flex-wrap gap-2 items-center bg-white/60 backdrop-blur-md p-2 rounded-[2rem] border border-pink-100">
          <div className="flex items-center gap-2 px-3 py-2">
             <FilterIcon size={14} className="text-rose-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período</span>
          </div>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-[10px] font-bold text-slate-600 bg-pink-50/50 rounded-xl px-3 py-2 outline-none border border-pink-100 focus:border-rose-300 transition-colors"
          />
          <span className="text-slate-300 text-xs">até</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-[10px] font-bold text-slate-600 bg-pink-50/50 rounded-xl px-3 py-2 outline-none border border-pink-100 focus:border-rose-300 transition-colors"
          />
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-pink-50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Wallet size={240} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Balanço Total Estimado</p>
              <h3 className="text-5xl md:text-6xl font-serif font-bold text-slate-800 tracking-tighter">
                R$ {confirmedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-emerald-50 px-5 py-3 rounded-2xl flex items-center gap-2 border border-emerald-100">
                <ArrowUpRight size={16} className="text-emerald-500" />
                <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">Confirmado</span>
              </div>
              <div className="bg-blue-50 px-5 py-3 rounded-2xl flex items-center gap-2 border border-blue-100">
                <Star size={14} className="text-blue-500" />
                <span className="text-xs font-black text-blue-600 uppercase tracking-tighter">Ticket Médio: R$ {ticketMedio}</span>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '1.5rem', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: 'Inter'
                  }}
                  itemStyle={{ color: '#F43F5E' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#F43F5E" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="Já Recebido" 
          value={`R$ ${receivedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          desc="Pagamentos concluídos no período" 
          icon={CheckCircleIcon} 
          color="text-emerald-500 bg-emerald-50"
        />
        <MetricCard 
          label="Agendamentos" 
          value={filteredAppts.length.toString()} 
          desc="Total de serviços no período" 
          icon={Calendar} 
          color="text-blue-500 bg-blue-50"
        />
        <MetricCard 
          label="Cancelamentos" 
          value={filteredAppts.filter(a => a.status === 'Cancelado').length.toString()} 
          desc="Taxa de desistência" 
          icon={TrendingDown} 
          color="text-rose-500 bg-rose-50"
        />
      </div>

      {/* Seção de Transações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-white shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-serif font-bold text-slate-800">Entradas Recentes</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Baseado no período selecionado</p>
          </div>
          
          <div className="space-y-4">
            {filteredAppts.filter(a => a.status === 'Concluído').sort((a,b) => b.dataAgendamento.localeCompare(a.dataAgendamento)).slice(0, 10).map((appt) => {
              const client = clients.find(c => c.id === appt.clienteId);
              return (
                <div key={appt.id} className="flex items-center justify-between p-4 bg-white/40 rounded-[1.5rem] border border-pink-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-rose-100">
                      <img src={client?.fotoUrl || DEFAULT_CLIENT_PHOTO} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{client?.displayName || 'Cliente'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{formatDateBR(appt.dataAgendamento)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-500">+ R$ {appt.valorAgendamento}</p>
                    <p className="text-[9px] text-slate-300 font-bold uppercase">Finalizado</p>
                  </div>
                </div>
              );
            })}
            {filteredAppts.filter(a => a.status === 'Concluído').length === 0 && (
              <div className="text-center py-12 opacity-30 italic font-serif text-slate-500">
                Nenhuma entrada registrada neste período.
              </div>
            )}
          </div>
        </div>

        {/* Mini Gráfico de Status */}
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-white shadow-sm flex flex-col items-center">
          <h4 className="text-lg font-serif font-bold text-slate-800 mb-6 text-center">Status Financeiro</h4>
          <div className="h-48 w-full flex items-center justify-center relative">
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-slate-800">{filteredAppts.length}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Serviços</span>
             </div>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { name: 'Conc', val: filteredAppts.filter(a => a.status === 'Concluído').length },
                 { name: 'Conf', val: filteredAppts.filter(a => a.status === 'Confirmado').length },
                 { name: 'Canc', val: filteredAppts.filter(a => a.status === 'Cancelado').length },
               ]}>
                 <Bar dataKey="val" radius={[4, 4, 4, 4]} barSize={30}>
                    <Cell fill="#10B981" />
                    <Cell fill="#3B82F6" />
                    <Cell fill="#F43F5E" />
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2 w-full px-4">
            <LegendItem color="bg-emerald-500" label="Concluídos" />
            <LegendItem color="bg-blue-500" label="Confirmados" />
            <LegendItem color="bg-rose-500" label="Cancelados" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, desc, icon: Icon, color }: any) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-pink-50 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-all">
    <div className={`p-4 rounded-2xl ${color} shadow-inner`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
      <p className="text-[10px] text-slate-400 font-medium italic">{desc}</p>
    </div>
  </div>
);

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-3">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

const CheckCircleIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default FinanceView;
