
import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Clock, Loader2, CheckCircle2, Save, Info } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface NotificationConfig {
  antecedencia: string;
  antecedenciaMinutos: number;
  ativo: boolean;
}

const NotificationSettingsWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>({
    antecedencia: '01:00',
    antecedenciaMinutos: 60,
    ativo: true
  });

  // Carrega configurações do Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'configuracoes', 'notificacao'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data() as NotificationConfig);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleToggle = () => {
    setConfig(prev => ({ ...prev, ativo: !prev.ativo }));
  };

  const handleTimeChange = (value: string) => {
    // Converte HH:mm para minutos totais
    const [hours, minutes] = value.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes;
    
    setConfig(prev => ({
      ...prev,
      antecedencia: value,
      antecedenciaMinutos: totalMinutes
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, 'configuracoes', 'notificacao'), config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar configurações de notificação:", err);
      alert("Erro ao salvar preferências.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-pink-100/50 shadow-sm flex items-center justify-center min-h-[350px]">
        <Loader2 className="text-rose-400 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-pink-100/50 shadow-sm hover:shadow-xl transition-all h-full relative overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
          <Bell size={24} />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-800">Notificações</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Alertas de Agendamento</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Ativação das Notificações */}
        <div className="p-5 bg-pink-50/20 rounded-[2rem] border border-pink-100/30 transition-all flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${config.ativo ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Notificações Locais</p>
              <p className="text-[10px] text-slate-400 font-medium">Lembretes automáticos no celular</p>
            </div>
          </div>

          <button 
            onClick={handleToggle}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${config.ativo ? 'bg-rose-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${config.ativo ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Definição de Antecedência */}
        <div className={`space-y-4 transition-all duration-300 ${config.ativo ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none'}`}>
          <div className="p-5 bg-white rounded-[2rem] border border-pink-100/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3 ml-1">
              <Clock size={14} className="text-rose-400" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Antecedência do Lembrete</label>
            </div>
            
            <div className="flex items-center gap-4">
              <input 
                type="time" 
                value={config.antecedencia}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="flex-1 p-4 bg-pink-50/30 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-rose-200 text-rose-500 font-bold text-lg text-center transition-all"
              />
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
                <span className="text-xl font-serif font-bold text-slate-700">{config.antecedenciaMinutos} <small className="text-xs">min</small></span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex gap-3">
            <Info className="text-rose-400 shrink-0" size={16} />
            <p className="text-[10px] text-rose-600 leading-relaxed font-medium">
              A notificação será disparada {config.antecedenciaMinutos} minutos antes de cada agendamento confirmado.
            </p>
          </div>
        </div>

        {/* Botão Salvar */}
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
              Salvando...
            </>
          ) : success ? (
            <>
              <CheckCircle2 size={18} />
              Preferências Salvas!
            </>
          ) : (
            <>
              <Save size={18} />
              Salvar Preferências
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsWidget;
