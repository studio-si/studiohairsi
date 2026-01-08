
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  CalendarDays, 
  LineChart, 
  Settings, 
  PlusCircle,
  Bell,
  LogOut,
  Menu,
  X,
  Clock,
  ChevronRight,
  Info
} from 'lucide-react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import DashboardView from './views/Dashboard';
import ClientsView from './views/Clients';
import ServicesView from './views/Services';
import ScheduleView from './views/Schedule';
import FinanceView from './views/Finance';
import SettingsView from './views/Settings';
import { NotificationService } from './services/notificationService';
import { Appointment } from './types';
import AppointmentDetails from './components/AppointmentDetails';

type ViewType = 'dashboard' | 'clients' | 'services' | 'schedule' | 'finance' | 'settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Estados de Notificações
  const [pendingAppts, setPendingAppts] = useState<Appointment[]>([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [selectedApptForDetail, setSelectedApptForDetail] = useState<Appointment | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    NotificationService.requestPermissions();

    // Listener para o Logo do Salão
    const unsubLogo = onSnapshot(doc(db, 'configuracoes', 'infoSalao'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLogoUrl(data.logoUrl || null);
      }
    });

    // Listener para Agendamentos Pendentes de Hoje
    const qPending = query(
      collection(db, 'appointments'), 
      where('dataAgendamento', '==', todayStr),
      where('status', '==', 'Aguardando confirmação')
    );
    
    const unsubPending = onSnapshot(qPending, (snap) => {
      setPendingAppts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });

    // Fechar dropdown ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubLogo();
      unsubPending();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [todayStr]);

  const menuItems = [
    { type: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { type: 'schedule', label: 'Agenda', icon: CalendarDays },
    { type: 'clients', label: 'Clientes', icon: Users },
    { type: 'services', label: 'Serviços', icon: Scissors },
    { type: 'finance', label: 'Financeiro', icon: LineChart },
    { type: 'settings', label: 'Ajustes', icon: Settings },
  ] as const;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView onNavigate={setActiveView} />;
      case 'schedule': return <ScheduleView />;
      case 'clients': return <ClientsView />;
      case 'services': return <ServicesView />;
      case 'finance': return <FinanceView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView onNavigate={setActiveView} />;
    }
  };

  const handleNavigate = (view: ViewType) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  const handleOpenApptDetail = (appt: Appointment) => {
    setSelectedApptForDetail(appt);
    setIsNotifDropdownOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative font-sans">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-rose-900/10 backdrop-blur-[2px] z-[60] transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 w-72 glass-card h-full z-[70] border-r border-pink-100/50 flex flex-col transform transition-transform duration-500 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8 flex items-center justify-between border-b border-pink-100/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Studio Hair" className="w-full h-full object-cover" onError={() => setLogoUrl(null)} />
              ) : (
                <span className="text-rose-400 font-serif font-bold text-xl">S</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-800 leading-tight">Studio Hair</h1>
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Simone M.</p>
            </div>
          </div>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button 
              key={item.type}
              onClick={() => handleNavigate(item.type)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                activeView === item.type 
                ? 'bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-lg shadow-rose-200' 
                : 'text-slate-400 hover:bg-pink-50/50 hover:text-rose-400'
              }`}
            >
              <item.icon size={22} className={activeView === item.type ? 'fill-rose-100/20' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-pink-100/30">
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
            <LogOut size={20} />
            <span className="font-semibold text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50/50 relative">
        <header className="sticky top-0 z-50 flex items-center justify-between p-6 md:px-12 bg-white/40 backdrop-blur-xl border-b border-pink-100/20">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-rose-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-serif font-bold text-slate-800 capitalize">
              {menuItems.find(m => m.type === activeView)?.label || activeView}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
             <button 
               onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
               className={`p-2.5 rounded-xl transition-all relative ${isNotifDropdownOpen ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:text-rose-400 hover:bg-pink-50'}`}
             >
                <Bell size={20} />
                {pendingAppts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                    {pendingAppts.length}
                  </span>
                )}
             </button>

             {/* DROPDOWN DE NOTIFICAÇÕES */}
             {isNotifDropdownOpen && (
               <div className="absolute top-full right-0 mt-4 w-80 glass-card rounded-[2rem] border border-rose-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-[100] overflow-hidden">
                  <div className="p-6 border-b border-rose-50 bg-white/50">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} className="text-rose-500" /> Pendentes Hoje
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar p-2">
                    {pendingAppts.length > 0 ? (
                      pendingAppts.map((appt) => (
                        <button 
                          key={appt.id}
                          onClick={() => handleOpenApptDetail(appt)}
                          className="w-full p-4 hover:bg-rose-50/50 rounded-2xl transition-all flex items-center justify-between group border-b border-rose-50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 font-bold text-[10px] group-hover:bg-rose-500 group-hover:text-white transition-colors">
                              {appt.horaAgendamento}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-slate-700 line-clamp-1">Cliente Pendente</p>
                              <p className="text-[10px] text-slate-400 font-medium tracking-tighter">Status: {appt.status}</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-rose-200 group-hover:text-rose-400 transition-all group-hover:translate-x-1" />
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center opacity-40">
                        <Info size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-serif italic text-slate-500">Tudo em ordem!<br/>Sem pendências para hoje.</p>
                      </div>
                    )}
                  </div>
                  {pendingAppts.length > 0 && (
                    <button 
                      onClick={() => { handleNavigate('schedule'); setIsNotifDropdownOpen(false); }}
                      className="w-full py-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors"
                    >
                      Ver Agenda Completa
                    </button>
                  )}
               </div>
             )}

             <div className="w-10 h-10 rounded-2xl overflow-hidden border border-pink-100 shadow-sm cursor-pointer hover:scale-105 transition-transform" onClick={() => handleNavigate('settings')}>
                <img src="https://i.ibb.co/cKbP5rdD/perfil.png" alt="Simone" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        <main className="p-6 md:p-12 max-w-7xl mx-auto">
           {renderView()}
        </main>
      </div>

      {/* MODAL DE DETALHES GLOBAL (Acionado pelas notificações) */}
      {selectedApptForDetail && (
        <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-bottom duration-500 overflow-hidden flex flex-col">
          <header className="p-6 bg-white border-b border-rose-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center shadow-md">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-800">Aprovação Rápida</h3>
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Confirmação de Agendamento</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedApptForDetail(null)}
              className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-95"
            >
              <X size={24} />
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
              <AppointmentDetails 
                appointment={selectedApptForDetail} 
                onClose={() => setSelectedApptForDetail(null)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
