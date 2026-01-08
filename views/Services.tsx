
import React, { useState, useEffect } from 'react';
import { Plus, Clock, Tag, Scissors } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Service } from '../types';
import ModalWidget from '../components/ModalWidget';
import ServiceForm from '../components/ServiceForm';

const ServicesView: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();

  useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (svc: Service) => {
    setEditingService(svc);
    setIsModalOpen(true);
  };

  const closePortal = () => {
    setIsModalOpen(false);
    setEditingService(undefined);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-serif text-slate-800">Serviços</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 text-white p-2.5 rounded-2xl shadow-lg shadow-rose-100 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {services.length > 0 ? (
          services.map((service) => (
            <div 
              key={service.id} 
              onClick={() => handleEdit(service)}
              className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-pink-50 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all cursor-pointer"
            >
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">{service.name}</h4>
                <div className="flex gap-3 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  <span className="flex items-center gap-1"><Clock size={12} /> {service.durationMinutes} min</span>
                  <span className="flex items-center gap-1 text-rose-500"><Tag size={12} /> R$ {service.price}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition-all">
                 <Scissors size={18} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-30">
            <p className="font-serif italic text-slate-500">Nenhum serviço disponível...</p>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default ServicesView;
