
import React, { useState } from 'react';
import { Service } from '../types';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

interface ServiceFormProps {
  service?: Service;
  onSuccess: () => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Service>>(
    service || { name: '', price: 0, durationMinutes: 30 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    try {
      if (service?.id) {
        await updateDoc(doc(db, 'services', service.id), formData);
      } else {
        await addDoc(collection(db, 'services'), formData);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-rose-300 uppercase ml-2 tracking-widest">Nome do Serviço</label>
        <input 
          type="text" 
          className="w-full mt-1 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
          required
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-rose-300 uppercase ml-2 tracking-widest">Preço (R$)</label>
          <input 
            type="number" 
            className="w-full mt-1 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
            required
            value={formData.price}
            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-rose-300 uppercase ml-2 tracking-widest">Duração (min)</label>
          <input 
            type="number" 
            className="w-full mt-1 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
            required
            value={formData.durationMinutes}
            onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})}
          />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 text-sm font-semibold text-slate-400"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="flex-1 py-4 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-rose-200 active:scale-95 transition-all"
        >
          {service ? 'Atualizar' : 'Salvar Serviço'}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;
