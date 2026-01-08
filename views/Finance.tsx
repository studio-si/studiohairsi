
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

const FinanceView: React.FC = () => {
  const data = [
    { name: 'Jan', value: 4200 },
    { name: 'Fev', value: 3800 },
    { name: 'Mar', value: 5100 },
    { name: 'Abr', value: 6400 },
    { name: 'Mai', value: 7200 },
    { name: 'Jun', value: 6800 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="px-1">
        <h2 className="text-2xl font-serif text-slate-800">Financeiro</h2>
        <p className="text-xs text-slate-400">Visão geral de desempenho</p>
      </div>

      {/* Primary Card */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-pink-50 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Mensal (Jun)</p>
            <h3 className="text-3xl font-serif font-bold text-slate-800 mt-1">R$ 6.840,00</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center gap-1 text-xs font-bold">
            <TrendingUp size={14} /> +12%
          </div>
        </div>
        
        <div className="h-48 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#F43F5E', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="value" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-100">
           <div className="bg-emerald-500 text-white w-8 h-8 rounded-xl flex items-center justify-center mb-3">
             <DollarSign size={16} />
           </div>
           <span className="text-[10px] text-emerald-700 font-bold uppercase">Receitas</span>
           <p className="text-lg font-bold text-slate-800">R$ 8.120</p>
        </div>
        <div className="bg-rose-500/10 p-4 rounded-3xl border border-rose-100">
           <div className="bg-rose-500 text-white w-8 h-8 rounded-xl flex items-center justify-center mb-3">
             <TrendingDown size={16} />
           </div>
           <span className="text-[10px] text-rose-700 font-bold uppercase">Despesas</span>
           <p className="text-lg font-bold text-slate-800">R$ 1.280</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-700 ml-1">Comparativo Semestral</h4>
        <div className="bg-white p-4 rounded-3xl border border-pink-50 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip cursor={{ fill: '#fff1f2' }} />
              <Bar dataKey="value" fill="#FDA4AF" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinanceView;
