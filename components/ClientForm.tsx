
import React, { useState, useRef } from 'react';
import { Client } from '../types';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Camera, Loader2, X } from 'lucide-react';

interface ClientFormProps {
  client?: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

const CLOUD_NAME = "dbxkfyyyu";
const UPLOAD_PRESET = "clienteSi";
const DEFAULT_CLIENT_PHOTO = "https://i.ibb.co/HpCqCTGw/cliente.png";
const SUCCESS_IMAGE = "https://i.ibb.co/5Wq15M0j/cliente-Sucesso.png";

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>(
    client || { displayName: '', telefone: '', fotoUrl: DEFAULT_CLIENT_PHOTO }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length <= 11) {
      if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length > 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: cloudFormData,
      });
      const data = await response.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, fotoUrl: data.secure_url }));
      }
    } catch (error) {
      console.error("Erro no upload Cloudinary:", error);
      alert("Erro ao carregar foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.telefone) return;

    setSaving(true);
    try {
      if (client?.id) {
        await updateDoc(doc(db, 'clients', client.id), {
          displayName: formData.displayName,
          telefone: formData.telefone,
          fotoUrl: formData.fotoUrl
        });
        onSuccess();
      } else {
        await addDoc(collection(db, 'clients'), {
          displayName: formData.displayName,
          telefone: formData.telefone,
          fotoUrl: formData.fotoUrl || DEFAULT_CLIENT_PHOTO,
          createdAt: Date.now()
        });
        
        // Ativa o estado de sucesso
        setShowSuccessModal(true);
        
        // Timer para iniciar a saída suave
        setTimeout(() => {
          setIsExiting(true);
          // Timer para fechar de fato após o fade-out
          setTimeout(() => {
            setShowSuccessModal(false);
            onSuccess();
          }, 500);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar cliente.");
    } finally {
      setSaving(false);
    }
  };

  // Se estiver em estado de sucesso, exibe apenas o modal com animação global
  if (showSuccessModal) {
    return (
      <div className={`flex flex-col items-center text-center py-6 transition-all duration-500 ease-in-out ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in duration-500'}`}>
        <div className="w-56 h-56 mb-6">
          <img src={SUCCESS_IMAGE} alt="Sucesso" className="w-full h-full object-contain" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-800">Cliente Cadastrada!</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto leading-relaxed">
          Tudo pronto! Os dados foram salvos com sucesso no Studio Simone.
        </p>
        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse delay-75"></div>
          <div className="w-2 h-2 rounded-full bg-rose-300 animate-pulse delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
      {/* Upload de Foto */}
      <div className="flex flex-col items-center mb-2">
        <div 
          className="relative group cursor-pointer" 
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-24 h-24 rounded-[2rem] bg-pink-50 border-2 border-dashed border-pink-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-rose-300 shadow-inner">
            {uploading ? (
              <Loader2 className="text-rose-400 animate-spin" size={24} />
            ) : (
              <img 
                src={formData.fotoUrl || DEFAULT_CLIENT_PHOTO} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
            <Camera size={12} />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
        </div>
        <p className="text-[9px] text-rose-300 font-bold mt-3 uppercase tracking-widest">Toque para adicionar foto</p>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-rose-300 uppercase ml-2 tracking-widest">Nome da Cliente</label>
        <input 
          type="text" 
          className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm font-medium"
          placeholder="Ex: Ana Clara Silva"
          required
          value={formData.displayName}
          onChange={e => setFormData({...formData, displayName: e.target.value})}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-rose-300 uppercase ml-2 tracking-widest">WhatsApp / Telefone</label>
        <input 
          type="tel" 
          className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm font-bold"
          placeholder="(00) 00000-0000"
          required
          maxLength={15}
          value={formData.telefone}
          onChange={handlePhoneChange}
        />
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
          disabled={saving || uploading}
          className="flex-1 py-4 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : (client ? 'Atualizar' : 'Salvar Cliente')}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
