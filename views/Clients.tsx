
import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, MoreHorizontal, User, Loader2 } from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Client } from '../types';
import ModalWidget from '../components/ModalWidget';
import ClientForm from '../components/ClientForm';
import ClientDetails from '../components/ClientDetails';

const DEFAULT_CLIENT_PHOTO = "https://i.ibb.co/HpCqCTGw/cliente.png";

const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para Controle de Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'clients'), orderBy('displayName', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(false); 
    setIsFormOpen(true);
  };

  const closeModals = () => {
    setIsFormOpen(false);
    setIsDetailsOpen(false);
    setSelectedClient(undefined);
  };

  // Correção crítica: Proteção contra campos indefinidos no filtro
  const filteredClients = clients.filter(c => {
    const name = (c.displayName || "").toLowerCase();
    const phone = (c.telefone || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return name.includes(term) || phone.includes(term);
  });

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
          <h2 className="text-2xl font-serif text-slate-800">Clientes</h2>
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Base de Dados Alfabética</p>
        </div>
        <button 
          onClick={() => { setSelectedClient(undefined); setIsFormOpen(true); }}
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-rose-100 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-tighter"
        >
          <Plus size={18} /> Nova Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou celular..." 
          className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-md rounded-[2rem] border border-pink-100/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all text-sm placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div 
              key={client.id} 
              className="bg-white/80 backdrop-blur-sm p-4 rounded-[2.5rem] border border-pink-50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
              onClick={() => handleOpenDetails(client)}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.5rem] bg-pink-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  <img 
                    src={client.fotoUrl || DEFAULT_CLIENT_PHOTO} 
                    alt={client.displayName} 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = DEFAULT_CLIENT_PHOTO)}
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{client.displayName || 'Sem Nome'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{client.telefone || '(00) 00000-0000'}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="p-3 text-rose-300 bg-rose-50/50 rounded-2xl">
                  <MoreHorizontal size={16} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 opacity-30">
             <p className="font-serif italic text-slate-500">Nenhuma cliente encontrada...</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <ModalWidget 
        isOpen={isDetailsOpen} 
        onClose={closeModals} 
        title="Perfil da Cliente"
      >
        {selectedClient && (
          <ClientDetails 
            client={selectedClient} 
            onEdit={() => handleOpenEdit(selectedClient)} 
            onClose={closeModals}
          />
        )}
      </ModalWidget>

      {/* Modal de Formulário (Novo/Editar) */}
      <ModalWidget 
        isOpen={isFormOpen} 
        onClose={closeModals} 
        title={selectedClient ? "Editar Cliente" : "Nova Cliente"}
      >
        <ClientForm 
          client={selectedClient} 
          onSuccess={closeModals} 
          onCancel={closeModals} 
        />
      </ModalWidget>
    </div>
  );
};

export default ClientsView;
