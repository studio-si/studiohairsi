
import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import DashboardView from './views/Dashboard';
import ClientsView from './views/Clients';
import ServicesView from './views/Services';
import ScheduleView from './views/Schedule';
import FinanceView from './views/Finance';
import SettingsView from './views/Settings';
import { NotificationService } from './services/notificationService';

type ViewType = 'dashboard' | 'clients' | 'services' | 'schedule' | 'finance' | 'settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    NotificationService.requestPermissions();

    // Busca o logo dinamicamente do Firebase
    const unsubLogo = onSnapshot(doc(db, 'configuracoes', 'infoSalao'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLogoUrl(data.logoUrl || null);
      }
    });

    return () => unsubLogo();
  }, []);

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

  return (
    <div className="flex h-screen w-full overflow-hidden relative font-sans">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-rose-900/10 backdrop-blur-[2px] z-[60] transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR - Responsive Drawer */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 w-72 glass-card h-full z-[70] border-r border-pink-100/50 flex flex-col transform transition-transform duration-500 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8 flex items-center justify-between border-b border-pink-100/30">
          <div className="flex items-center gap-4">
            {/* Logo do Firebase com tratamento de fallback */}
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Studio Hair" className="w-full h-full object-cover" onError={() => setLogoUrl(null)} />
              ) : (
                <span className="text-rose-400 font-serif font-bold text-xl">S</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-800 leading-tight">Studio Hair</h1>
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Simone O.</p>
            </div>
          </div>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
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
          
          <div className="flex items-center gap-4">
             <button className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-pink-50 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="w-10 h-10 rounded-2xl overflow-hidden border border-pink-100 shadow-sm">
                <img src="https://picsum.photos/seed/simone/100/100" alt="Simone" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        <main className="p-6 md:p-12 max-w-7xl mx-auto">
           {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
