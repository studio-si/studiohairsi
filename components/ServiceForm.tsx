
import React, { useState } from 'react';
import { Service } from '../types';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface ServiceFormProps {
  service?: Service;
  onSuccess: () => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSuccess, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>(
    service || { 
      displayName: '', 
      valorServico: 0, 
      duracao: 30, 
      descricao: '',
      status: true 
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.valorServico) return;

    setSaving(true);
    try {
      if (service?.id) {
        await updateDoc(doc(db, 'servicos', service.id), {
          displayName: formData.displayName,
          descricao: formData.descricao,
          valorServico: Number(formData.valorServico),
          duracao: Number(formData.duracao),
          status: formData.status
        });
      } else {
        await addDoc(collection(db, 'servicos'), {
          displayName: formData.displayName,
          descricao: formData.descricao,
          valorServico: Number(formData.valorServico),
          duracao: Number(formData.duracao),
          status: true,
          createdAt: Date.now()
        });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar serviço.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-rose-300 uppercase ml-2 tracking-widest">Nome do Serviço</label>
        <input 
          type="text" 
          placeholder="Ex: Corte Feminino"
          className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm font-medium"
          required
          value={formData.displayName}
          onChange={e => setFormData({...formData, displayName: e.target.value})}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-rose-300 uppercase ml-2 tracking-widest">Descrição</label>
        <textarea 
          placeholder="Descreva o que está incluso..."
          rows={2}
          className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm font-medium resize-none"
          value={formData.descricao}
          onChange={e => setFormData({...formData, descricao: e.target.value})}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black text-rose-300 uppercase ml-2 tracking-widest">Valor (R$)</label>
          <input 
            type="number" 
            className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm font-bold"
            required
            value={formData.valorServico}
            onChange={e => setFormData({...formData, valorServico: Number(e.target.value)})}
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black text-rose-300 uppercase ml-2 tracking-widest">Duração (min)</label>
          <input 
            type="number" 
            className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm font-bold"
            required
            value={formData.duracao}
            onChange={e => setFormData({...formData, duracao: Number(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 text-sm font-bold text-slate-400 uppercase tracking-tighter"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={saving}
          className="flex-1 py-4 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : (service ? 'Atualizar' : 'Criar Serviço')}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;
