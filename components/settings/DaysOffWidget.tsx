
import React, { useState, useEffect } from 'react';
import { CalendarOff, Plus, Trash2, Loader2, Info, AlertCircle, X } from 'lucide-react';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../firebase';
import ModalWidget from '../ModalWidget';

interface HolidayData {
  diaFolga: string;
  ativo: boolean;
  motivo: string;
}

interface HolidayMap {
  [key: string]: HolidayData;
}

const DaysOffWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState<HolidayData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [holidayToManage, setHolidayToManage] = useState<string | null>(null);
  const [newHoliday, setNewHoliday] = useState({ diaFolga: '', motivo: '' });
  const [saving, setSaving] = useState(false);

  const THINKING_AVATAR = "https://i.ibb.co/KjNQjfHy/avatar-Pensando.png";

  // Carrega os dados do Firebase
  // Estrutura solicitada: configuracoes (col) / holiday (doc) / dayOff (map)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'configuracoes', 'holiday'), (docSnap) => {
      if (docSnap.exists()) {
        const fullData = docSnap.data() as HolidayMap || {};
        const list = Object.values(fullData).sort((a, b) => a.diaFolga.localeCompare(b.diaFolga));
        setHolidays(list);
      } else {
        setHolidays([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday.diaFolga || !newHoliday.motivo) return;

    setSaving(true);
    try {
      const holidayKey = newHoliday.diaFolga;
      // Salva exatamente no formato: configuracoes/holiday -> dayOff (map)
      await setDoc(doc(db, 'configuracoes', 'holiday'), {
          [holidayKey]: {
            diaFolga: newHoliday.diaFolga,
            motivo: newHoliday.motivo,
            ativo: true // Inicial como solicitado
        }
      }, { merge: true });

      setNewHoliday({ diaFolga: '', motivo: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao adicionar folga:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHoliday = async (dateKey: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'configuracoes', 'holiday'), {
        [`${dateKey}.ativo`]: !currentStatus
      });
    } catch (err) {
      console.error("Erro ao alternar status da folga:", err);
    }
  };

  const confirmDelete = (dateKey: string) => {
    setHolidayToManage(dateKey);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteHoliday = async () => {
    if (!holidayToManage) return;
    try {
      await updateDoc(doc(db, 'configuracoes', 'holiday'), {
        [`${holidayToManage}`]: deleteField()
      });
      setIsConfirmModalOpen(false);
      setHolidayToManage(null);
    } catch (err) {
      console.error("Erro ao deletar folga:", err);
    }
  };

  const handleJustDeactivate = async () => {
    if (!holidayToManage) return;
    try {
      await updateDoc(doc(db, 'configuracoes', 'holiday'), {
        [`${holidayToManage}.ativo`]: false
      });
      setIsConfirmModalOpen(false);
      setHolidayToManage(null);
    } catch (err) {
      console.error("Erro ao desativar folga:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-pink-100/50 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 className="text-rose-400 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-pink-100/50 shadow-sm hover:shadow-xl transition-all h-full relative">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
          <CalendarOff size={24} />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-800">Dias de Folga</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ausências e Feriados</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
        {holidays.length > 0 ? (
          holidays.map((holiday) => (
            <div 
              key={holiday.diaFolga} 
              className={`p-5 rounded-[2rem] border transition-all flex items-center justify-between ${
                holiday.ativo ? 'bg-rose-50/30 border-rose-100/50' : 'bg-slate-50/50 border-slate-100 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{formatDate(holiday.diaFolga)}</span>
                  {!holiday.ativo && (
                    <span className="text-[8px] font-black uppercase bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Inativo</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">"{holiday.motivo}"</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleToggleHoliday(holiday.diaFolga, holiday.ativo)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${holiday.ativo ? 'bg-rose-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${holiday.ativo ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>

                <button 
                  onClick={() => confirmDelete(holiday.diaFolga)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400 font-serif italic">Nenhum dia de folga planejado.</p>
          </div>
        )}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-4 py-4 border-2 border-dashed border-pink-100 rounded-[2rem] text-pink-300 text-xs font-bold hover:border-rose-200 hover:text-rose-400 hover:bg-rose-50/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Adicionar Data de Folga
        </button>
      </div>

      {/* Modal Novo Dia de Folga */}
      <ModalWidget 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Novo Dia de Folga"
      >
        <form onSubmit={handleAddHoliday} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-rose-300 uppercase ml-2 tracking-widest">Selecione a Data</label>
            <input 
              type="date" 
              required
              value={newHoliday.diaFolga}
              onChange={e => setNewHoliday({...newHoliday, diaFolga: e.target.value})}
              className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-rose-300 uppercase ml-2 tracking-widest">Motivo (ex: Feriado, Curso)</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Feriado de Corpus Christi"
              value={newHoliday.motivo}
              onChange={e => setNewHoliday({...newHoliday, motivo: e.target.value})}
              className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 text-sm font-semibold text-slate-400"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 py-4 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : "Confirmar Folga"}
            </button>
          </div>
        </form>
      </ModalWidget>

      {/* Modal de Confirmação de Exclusão - MUITO COMPACTO E FORA DO CLIPPING */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-[300px] rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in duration-300 relative">
            <div className="absolute top-2 right-2">
              <button onClick={() => setIsConfirmModalOpen(false)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                <img src={THINKING_AVATAR} alt="Pensando..." className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-slate-800">Deseja excluir?</h3>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Lembre-se que você também pode apenas <span className="text-rose-500 font-bold">desativar</span> esta folga.
                </p>
              </div>

              <div className="w-full space-y-2 mt-2">
                <button 
                  onClick={handleJustDeactivate}
                  className="w-full py-2.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle size={14} />
                  Apenas Desativar
                </button>
                <button 
                  onClick={handleDeleteHoliday}
                  className="w-full py-2.5 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-xl text-[10px] font-bold shadow-md active:scale-95 transition-all"
                >
                  Excluir Permanentemente
                </button>
                <button 
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="w-full py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaysOffWidget;
