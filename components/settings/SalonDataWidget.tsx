
import React, { useState, useEffect, useRef } from 'react';
import { Store, MapPin, Camera, Loader2, Phone, CheckCircle2, Save } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const CLOUD_NAME = "dbxkfyyyu";
const UPLOAD_PRESET = "studiosi";
const DEFAULT_LOGO = "https://i.ibb.co/wh62vzvP/logo.png";

const SalonDataWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [salonInfo, setSalonInfo] = useState({
    displayName: '',
    endereco: '',
    telefone: '',
    logoUrl: DEFAULT_LOGO
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega os dados iniciais do Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'configuracoes', 'infoSalao'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSalonInfo({
          displayName: data.displayName || '',
          endereco: data.endereco || '',
          telefone: data.telefone || '',
          logoUrl: data.logoUrl || DEFAULT_LOGO
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Máscara de Telefone (xx) xxxxx-xxxx
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
    setSalonInfo({ ...salonInfo, telefone: formatted });
  };

  // Upload para Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        setSalonInfo(prev => ({ ...prev, logoUrl: data.secure_url }));
        // Salva imediatamente a nova URL do logo
        await setDoc(doc(db, 'configuracoes', 'infoSalao'), {
          logoUrl: data.secure_url
        }, { merge: true });
      }
    } catch (error) {
      console.error("Erro no upload Cloudinary:", error);
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  // Salva todos os campos de texto no Firebase
  const handleSaveAll = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, 'configuracoes', 'infoSalao'), {
        displayName: salonInfo.displayName,
        endereco: salonInfo.endereco,
        telefone: salonInfo.telefone,
        logoUrl: salonInfo.logoUrl
      }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar no Firebase:", err);
      alert("Erro ao salvar dados.");
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
          <Store size={24} />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-800">Dados do Salão</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identidade do Negócio</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Logo Upload Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-[2.5rem] bg-pink-50 border-2 border-dashed border-pink-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-rose-300 shadow-inner">
              {uploading ? (
                <Loader2 className="text-rose-400 animate-spin" size={32} />
              ) : (
                <img src={salonInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2.5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform border-2 border-white">
              <Camera size={14} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>
          <p className="text-[10px] text-rose-400 font-bold mt-4 uppercase tracking-tighter">Alterar Logo do Studio</p>
        </div>

        <div className="space-y-4">
          {/* Nome do Salão */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-tighter">Nome do Salão</label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={16} />
              <input 
                type="text" 
                value={salonInfo.displayName}
                onChange={(e) => setSalonInfo({...salonInfo, displayName: e.target.value})}
                placeholder="Ex: Studio Hair Simone"
                className="w-full pl-12 pr-4 py-4 bg-pink-50/30 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-tighter">Telefone / WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={16} />
              <input 
                type="text" 
                value={salonInfo.telefone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="w-full pl-12 pr-4 py-4 bg-pink-50/30 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-tighter">Endereço Completo</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={16} />
              <input 
                type="text" 
                value={salonInfo.endereco}
                onChange={(e) => setSalonInfo({...salonInfo, endereco: e.target.value})}
                placeholder="Rua, Número, Bairro, Cidade"
                className="w-full pl-12 pr-4 py-4 bg-pink-50/30 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSaveAll}
          disabled={saving || uploading}
          className={`w-full mt-4 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            success 
              ? 'bg-emerald-500 text-white shadow-emerald-100' 
              : 'bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-rose-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Salvando Dados...
            </>
          ) : success ? (
            <>
              <CheckCircle2 size={18} />
              Dados Salvos com Sucesso!
            </>
          ) : (
            <>
              <Save size={18} />
              Salvar Dados do Salão
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SalonDataWidget;
