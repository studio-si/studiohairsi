
import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, MoreHorizontal } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Client } from '../types';
import ModalWidget from '../components/ModalWidget';
import ClientForm from '../components/ClientForm';

const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  useEffect(() => {
    const q = query(collection(db, 'clients'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const closePortal = () => {
    setIsModalOpen(false);
    setEditingClient(undefined);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-serif text-slate-800">Clientes</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 text-white p-2.5 rounded-2xl shadow-lg shadow-rose-100 active:scale-95 transition-transform"
        >
          <Plus size={20} />
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

      <div className="space-y-3">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-[2rem] border border-pink-50 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-rose-500 font-serif text-lg font-bold">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{client.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{client.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${client.phone}`} className="p-2 text-rose-400 bg-pink-50 rounded-xl">
                  <Phone size={16} />
                </a>
                <button onClick={() => handleEdit(client)} className="p-2 text-slate-300 hover:text-rose-400">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-30">
             <p className="font-serif italic text-slate-500">Nenhuma cliente cadastrada...</p>
          </div>
        )}
      </div>

      <ModalWidget 
        isOpen={isModalOpen} 
        onClose={closePortal} 
        title={editingClient ? "Editar Cliente" : "Nova Cliente"}
      >
        <ClientForm 
          client={editingClient} 
          onSuccess={closePortal} 
          onCancel={closePortal} 
        />
      </ModalWidget>
    </div>
  );
};

export default ClientsView;
