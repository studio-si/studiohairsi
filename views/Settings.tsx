
import React from 'react';
import SalonDataWidget from '../components/settings/SalonDataWidget';
import BusinessHoursWidget from '../components/settings/BusinessHoursWidget';
import DaysOffWidget from '../components/settings/DaysOffWidget';
import NotificationSettingsWidget from '../components/settings/NotificationSettingsWidget';

const SettingsView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-left duration-500 pb-20">
      <div className="px-1">
        <h2 className="text-3xl font-serif font-bold text-slate-800">Configurações</h2>
        <p className="text-sm text-rose-400 font-medium">Gerencie as regras e informações do seu Studio</p>
      </div>

      {/* Grid de Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Widget: Dados do Salão */}
        <section>
          <SalonDataWidget />
        </section>

        {/* Widget: Horários de Funcionamento */}
        <section>
          <BusinessHoursWidget />
        </section>

        {/* Widget: Dias de Folga */}
        <section>
          <DaysOffWidget />
        </section>

        {/* Widget: Notificações */}
        <section>
          <NotificationSettingsWidget />
        </section>
      </div>

      <div className="pt-10 text-center">
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
          Versão 1.1.0 • Studio Hair Admin Premium
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
