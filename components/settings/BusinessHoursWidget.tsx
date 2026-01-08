
import React, { useState, useEffect } from 'react';
import { Clock, Info, Loader2, CheckCircle2, Save, Calendar } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface DayConfig {
  active: boolean;
  open: string;
  close: string;
}

interface BusinessHours {
  [key: string]: DayConfig;
}

const DAYS_OF_WEEK = [
  { id: 'segunda', label: 'Segunda-feira' },
  { id: 'terca', label: 'Terça-feira' },
  { id: 'quarta', label: 'Quarta-feira' },
  { id: 'quinta', label: 'Quinta-feira' },
  { id: 'sexta', label: 'Sexta-feira' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' },
];

const BusinessHoursWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hours, setHours] = useState<BusinessHours>({});

  // Carrega os dados do Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'configuracoes', 'horarios'), (docSnap) => {
      if (docSnap.exists()) {
        setHours(docSnap.data() as BusinessHours);
      } else {
        // Inicializa com valores padrão se não existir
        const initial: BusinessHours = {};
        DAYS_OF_WEEK.forEach(day => {
          initial[day.id] = {
            active: day.id !== 'domingo',
            open: '09:00',
            close: '18:00'
          };
        });
        setHours(initial);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleToggleDay = (dayId: string) => {
    setHours(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], active: !prev[dayId].active }
    }));
  };

  const handleTimeChange = (dayId: string, field: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, 'configuracoes', 'horarios'), hours);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar horários:", err);
      alert("Erro ao salvar horários de funcionamento.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-pink-100/50 shadow-sm flex items-center justify-center min-h-[400px]">
        <Loader2 className="text-rose-400 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-pink-100/50 shadow-sm hover:shadow-xl transition-all h-full relative">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
          <Clock size={24} />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-800">Horários</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Abertura e Fechamento</p>
        </div>
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => {
          const config = hours[day.id] || { active: false, open: '09:00', close: '18:00' };
          return (
            <div key={day.id} className="p-4 bg-pink-50/20 rounded-3xl border border-pink-100/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.active ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
                    <Calendar size={14} />
                  </div>
                  <span className={`text-sm font-bold ${config.active ? 'text-slate-800' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                </div>
                
                {/* Custom Toggle Switch */}
                <button 
                  onClick={() => handleToggleDay(day.id)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${config.active ? 'bg-rose-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${config.active ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className={`flex items-center gap-4 transition-opacity duration-300 ${config.active ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Abertura</label>
                  <input 
                    type="time" 
                    value={config.open}
                    onChange={(e) => handleTimeChange(day.id, 'open', e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-pink-100 text-rose-500 font-bold text-xs outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Fechamento</label>
                  <input 
                    type="time" 
                    value={config.close}
                    onChange={(e) => handleTimeChange(day.id, 'close', e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-pink-100 text-rose-500 font-bold text-xs outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-6 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex gap-3">
          <Info className="text-rose-400 shrink-0" size={16} />
          <p className="text-[10px] text-rose-600 leading-relaxed font-medium">
            Estes horários definem os períodos em que você estará disponível para novos agendamentos no sistema.
          </p>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`w-full mt-4 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            success 
              ? 'bg-emerald-500 text-white shadow-emerald-100' 
              : 'bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-rose-100'
          } disabled:opacity-50`}
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Salvando Horários...
            </>
          ) : success ? (
            <>
              <CheckCircle2 size={18} />
              Horários Salvos!
            </>
          ) : (
            <>
              <Save size={18} />
              Salvar Horários de Funcionamento
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BusinessHoursWidget;
