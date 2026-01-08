
import React, { useState, useEffect } from 'react';
import { Plus, Clock, Tag, Scissors, Trash2, Edit3, Loader2, AlertCircle, X } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Service } from '../types';
import ModalWidget from '../components/ModalWidget';
import ServiceForm from '../components/ServiceForm';

const SERVICES_ICON = "https://jardimdasamericas.com.br/uploads/2018/02/ico-salao-beleza-medium.png";
const THINKING_AVATAR = "https://i.ibb.co/KjNQjfHy/avatar-Pensando.png";

const ServicesView: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [serviceToManage, setServiceToManage] = useState<Service | null>(null);

  useEffect(() => {
    // Escuta a coleção 'servicos'
    const q = query(collection(db, 'servicos'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (svc: Service) => {
    setEditingService(svc);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'servicos', id), { status: !currentStatus });
    } catch (err) {
      console.error("Erro ao alternar status:", err);
    }
  };

  const confirmDelete = (svc: Service) => {
    setServiceToManage(svc);
    setIsConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!serviceToManage?.id) return;
    try {
      await deleteDoc(doc(db, 'servicos', serviceToManage.id));
      setIsConfirmModalOpen(false);
      setServiceToManage(null);
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  const handleDeactivateOnly = async () => {
    if (!serviceToManage?.id) return;
    try {
      await updateDoc(doc(db, 'servicos', serviceToManage.id), { status: false });
      setIsConfirmModalOpen(false);
      setServiceToManage(null);
    } catch (err) {
      console.error("Erro ao desativar:", err);
    }
  };

  const closePortal = () => {
    setIsModalOpen(false);
    setEditingService(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-rose-400 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-serif text-slate-800">Serviços</h2>
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Menu de Procedimentos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-rose-100 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-tighter"
        >
          <Plus size={18} /> Adicionar Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {services.length > 0 ? (
          services.map((service) => (
            <div 
              key={service.id} 
              className={`bg-white/80 backdrop-blur-md p-5 rounded-[2.5rem] border transition-all flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md ${!service.status ? 'opacity-60 border-slate-100' : 'border-pink-50'}`}
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="w-16 h-16 bg-pink-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-inner p-2">
                  <img src={SERVICES_ICON} alt="Serviço" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-800 leading-tight">{service.displayName}</h4>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-1 italic">"{service.descricao}"</p>
                  <div className="flex gap-3 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                    <span className="flex items-center gap-1"><Clock size={12} className="text-rose-300" /> {service.duracao} min</span>
                    <span className="flex items-center gap-1 text-rose-500 font-black"><Tag size={12} /> R$ {service.valorServico}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-pink-50/50">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${service.status ? 'text-rose-400' : 'text-slate-300'}`}>
                    {service.status ? 'Ativo' : 'Inativo'}
                  </span>
                  <button 
                    onClick={() => handleToggleStatus(service.id!, service.status)}
                    className={`w-10 h-5 rounded-full relative transition-all duration-300 ${service.status ? 'bg-rose-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${service.status ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => confirmDelete(service)}
                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-30">
            <p className="font-serif italic text-slate-500">Nenhum serviço disponível...</p>
          </div>
        )}
      </div>

      {/* Widget de Formulário (Modal Principal) */}
      <ModalWidget 
        isOpen={isModalOpen} 
        onClose={closePortal} 
        title={editingService ? "Editar Serviço" : "Novo Serviço"}
      >
        <ServiceForm 
          service={editingService} 
          onSuccess={closePortal} 
          onCancel={closePortal} 
        />
      </ModalWidget>

      {/* Modal de Confirmação "Pensando" */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[320px] rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300 relative text-center">
            <button 
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-pink-50 border-4 border-white shadow-xl overflow-hidden mb-2">
                <img src={THINKING_AVATAR} alt="Pensando..." className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-slate-800">Deseja excluir?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Você pode apenas <span className="text-rose-500 font-bold">desativar</span> o serviço se preferir não removê-lo completamente.
                </p>
              </div>

              <div className="w-full space-y-3 pt-4">
                <button 
                  onClick={handleDeactivateOnly}
                  className="w-full py-3.5 bg-rose-50 text-rose-500 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle size={16} />
                  Apenas Desativar
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full py-3.5 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all"
                >
                  Excluir Permanentemente
                </button>
                <button 
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"
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

export default ServicesView;
