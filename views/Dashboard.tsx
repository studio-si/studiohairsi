import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, DollarSign, ArrowRight } from 'lucide-react';
// Follow strictly the spacing and import rules for Google GenAI
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Props {
  onNavigate: (view: 'dashboard' | 'clients' | 'services' | 'schedule' | 'finance' | 'settings') => void;
}

const DashboardView: React.FC<Props> = ({ onNavigate }) => {
  const [tip, setTip] = useState<string>("Buscando dica estratégica do dia...");

  // Leverage Gemini API to provide dynamic management advice for the business owner
  useEffect(() => {
    const fetchAITip = async () => {
      try {
        // Create a new GoogleGenAI instance right before making an API call to ensure current key
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Use gemini-3-flash-preview for basic text tasks (Summarization, proofreading, simple Q&A)
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'Como especialista em gestão de salões de beleza, dê uma dica curta (máximo 15 palavras) e inspiradora para Simone, dona do salão Studio Hair. Fale sobre fidelização de clientes ou excelência no serviço.',
        });

        // Use the .text property getter to extract the response string (do not call as a function)
        const generatedText = response.text;
        if (generatedText) {
          setTip(generatedText.trim());
        }
      } catch (error) {
        console.error("Failed to generate AI tip:", error);
        // Fallback to static tip if API fails
        setTip("Um atendimento personalizado cria fidelidade eterna. Lembre-se de ouvir os desejos das suas clientes.");
      }
    };

    fetchAITip();
  }, []);

  const stats = [
    { label: 'Hoje', value: '8', icon: Calendar, color: 'bg-pink-50 text-pink-600', border: 'border-pink-100' },
    { label: 'Clientes', value: '142', icon: UserCheck, color: 'bg-rose-50 text-rose-600', border: 'border-rose-100' },
    { label: 'Ganhos', value: 'R$ 840', icon: DollarSign, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl shadow-rose-200/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-serif mb-2">Olá, Simone Oliveira!</h2>
          <p className="text-white/80 text-sm md:text-lg mb-6 max-w-md">Seu studio está bombando! Você tem 3 agendamentos pendentes para as próximas horas.</p>
          <button 
            onClick={() => onNavigate('schedule')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all inline-flex shadow-inner"
          >
            Acessar Agenda Completa <ArrowRight size={18} />
          </button>
        </div>
        <div className="hidden lg:block w-48 h-48 bg-white/10 rounded-full border-8 border-white/5 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border ${stat.border} flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1`}>
                <div className={`p-4 rounded-2xl ${stat.color} mb-4`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</span>
                <span className="text-xl md:text-3xl font-bold text-slate-800 mt-1">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Tips / Promotion Section - Powered by Gemini */}
          <div className="hidden md:block bg-white/40 border border-white p-8 rounded-[2.5rem] backdrop-blur-md shadow-sm relative overflow-hidden">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-100/30 rounded-full blur-3xl"></div>
             <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
               <span className="w-6 h-0.5 bg-rose-200"></span> Insight Studio AI
             </h4>
             <p className="text-lg text-slate-600 font-serif italic leading-relaxed">
               "{tip}"
             </p>
          </div>
        </div>

        {/* Right Column: Today's Appointments */}
        <div className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-xl font-serif text-slate-700">Próximos do Dia</h3>
            <button className="text-xs text-rose-500 font-bold hover:underline" onClick={() => onNavigate('schedule')}>Ver todos</button>
          </div>
          
          <div className="space-y-4">
            {[
              { time: '14:30', client: 'Ana Paula', service: 'Mechas + Hidratação', price: 280 },
              { time: '16:00', client: 'Beatriz Silva', service: 'Corte Bordado', price: 120 },
              { time: '17:30', client: 'Carla Lima', service: 'Escova Modelada', price: 80 },
              { time: '19:00', client: 'Debora Souza', service: 'Pintura Completa', price: 210 },
            ].map((item, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-sm p-5 rounded-[2rem] border border-pink-50 flex items-center justify-between shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="bg-pink-50 text-rose-500 text-xs font-black w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors shadow-sm">
                    {item.time}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.client}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{item.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-rose-500">R$ {item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;