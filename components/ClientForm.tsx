
import React, { useState } from 'react';
import { Client } from '../types';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

interface ClientFormProps {
  client?: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Client>>(
    client || { name: '', phone: '', email: '' }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    try {
      if (client?.id) {
        await updateDoc(doc(db, 'clients', client.id), formData);
      } else {
        await addDoc(collection(db, 'clients'), {
          ...formData,
          createdAt: Date.now()
        });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-rose-300 uppercase ml-2 tracking-widest">Nome Completo</label>
        <input 
          type="text" 
          className="w-full mt-1 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm placeholder:text-slate-300"
          placeholder="Ex: Maria Eduarda"
          required
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-rose-300 uppercase ml-2 tracking-widest">WhatsApp / Telefone</label>
        <input 
          type="tel" 
          className="w-full mt-1 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm placeholder:text-slate-300"
          placeholder="(00) 00000-0000"
          required
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />
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
          {client ? 'Atualizar' : 'Salvar Cliente'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
