
import React, { useState, useEffect } from 'react';
import { Appointment, Client, Service } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, getDoc, getDocs, where } from 'firebase/firestore';
import { 
  Loader2, 
  CheckCircle2, 
  User, 
  Scissors, 
  Calendar, 
  Clock, 
  Info,
  ChevronDown,
  Clock3,
  AlertCircle,
  XCircle,
  ChevronRight,
  X
} from 'lucide-react';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  initialDate: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const SUCCESS_IMAGE = "https://i.ibb.co/hRZrgFf7/agendando.png";
const ERROR_IMAGE = "https://i.ibb.co/ycqGJL4R/decepcao.png";

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, initialDate, onSuccess, onCancel }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  
  // Controles de Dropdowns Customizados
  const [clientSearch, setClientSearch] = useState('');
  const [isClientListOpen, setIsClientListOpen] = useState(false);
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Appointment>>({
    clienteId: '',
    servicoId: '',
    dataAgendamento: initialDate,
    horaAgendamento: '09:00',
    valorAgendamento: 0,
    status: 'Aguardando confirmação',
    observacao: ''
  });

  // Função auxiliar para calcular a hora de término
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + durationMinutes);
    
    const endHours = String(date.getHours()).padStart(2, '0');
    const endMinutes = String(date.getMinutes()).padStart(2, '0');
    return `${endHours}:${endMinutes}`;
  };

  // Converte HH:MM para minutos totais desde 00:00 para comparação fácil
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Efeito para carregar dados se for EDIÇÃO
  useEffect(() => {
    if (appointment) {
      setFormData({
        ...appointment
      });
    }
  }, [appointment]);

  useEffect(() => {
    const unsubClients = onSnapshot(query(collection(db, 'clients'), orderBy('displayName', 'asc')), (snap) => {
      const clientsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientsList);
      
      if (appointment) {
        const currentClient = clientsList.find(c => c.id === appointment.clienteId);
        if (currentClient) setClientSearch(currentClient.displayName);
      }
    });

    const unsubServices = onSnapshot(collection(db, 'servicos'), (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)).filter(s => s.status));
    });
    
    return () => { unsubClients(); unsubServices(); };
  }, [appointment]);

  const handleSelectService = (service: Service) => {
    setFormData({
      ...formData,
      servicoId: service.id!,
      valorAgendamento: service.valorServico
    });
    setIsServiceListOpen(false);
  };

  const handleSelectClient = (client: Client) => {
    setFormData({ ...formData, clienteId: client.id! });
    setClientSearch(client.displayName);
    setIsClientListOpen(false);
  };

  const filteredClients = clients.filter(c => 
    (c.displayName || "").toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedService = services.find(s => s.id === formData.servicoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.servicoId) {
      setErrorMsg("Por favor, selecione a cliente e o serviço antes de continuar.");
      return;
    }

    const currentService = services.find(s => s.id === formData.servicoId);
    if (!currentService) return;

    setSaving(true);
    try {
      // 1. VERIFICAR FOLGA (HOLIDAY)
      const holidayDoc = await getDoc(doc(db, 'configuracoes', 'holiday'));
      if (holidayDoc.exists()) {
        const holidays = holidayDoc.data();
        const selectedHoliday = holidays[formData.dataAgendamento!];
        if (selectedHoliday && selectedHoliday.ativo) {
          setErrorMsg(`O Studio não funcionará no dia selecionado: ${selectedHoliday.motivo}.`);
          setSaving(false);
          return;
        }
      }

      // 2. VERIFICAR HORÁRIO DE FUNCIONAMENTO
      const horariosDoc = await getDoc(doc(db, 'configuracoes', 'horarios'));
      if (horariosDoc.exists()) {
        const weekDays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const selectedDateObj = new Date(formData.dataAgendamento + 'T00:00:00');
        const dayName = weekDays[selectedDateObj.getDay()];
        const dayConfig = horariosDoc.data()[dayName];

        if (!dayConfig || !dayConfig.active) {
          setErrorMsg(`O Studio Simone não abre aos ${dayName === 'sabado' || dayName === 'domingo' ? dayName + 's' : dayName + '-feiras'}.`);
          setSaving(false);
          return;
        }

        const startMin = timeToMinutes(formData.horaAgendamento!);
        const openMin = timeToMinutes(dayConfig.open);
        const closeMin = timeToMinutes(dayConfig.close);

        if (startMin < openMin || startMin >= closeMin) {
          setErrorMsg(`Horário fora do expediente. O Studio funciona das ${dayConfig.open} às ${dayConfig.close} neste dia.`);
          setSaving(false);
          return;
        }
      }

      // 3. VERIFICAR CONFLITO DE HORÁRIO
      const horaFinal = calculateEndTime(formData.horaAgendamento || "09:00", currentService.duracao);
      const newStart = timeToMinutes(formData.horaAgendamento!);
      const newEnd = timeToMinutes(horaFinal);

      const q = query(collection(db, 'appointments'), where('dataAgendamento', '==', formData.dataAgendamento));
      const apptsSnap = await getDocs(q);
      
      const hasOverlap = apptsSnap.docs.some(docSnap => {
        const appt = docSnap.data() as Appointment;
        // Ignora o próprio agendamento em caso de edição
        if (appointment?.id && docSnap.id === appointment.id) return false;
        // Ignora cancelados ou não comparecidos
        if (appt.status === 'Cancelado' || appt.status === 'Não compareceu') return false;

        const existStart = timeToMinutes(appt.horaAgendamento);
        const existEnd = timeToMinutes(appt.horaFinal);

        // Lógica de interseção de horários
        return (newStart < existEnd && newEnd > existStart);
      });

      if (hasOverlap) {
        setErrorMsg("Ops! Este horário já está ocupado ou entra em conflito com outro agendamento.");
        setSaving(false);
        return;
      }

      // SE PASSOU EM TUDO, SALVA
      const payload = {
        ...formData,
        horaFinal,
      };

      if (appointment?.id) {
        const { id, ...dataToUpdate } = payload;
        await updateDoc(doc(db, 'appointments', appointment.id), dataToUpdate);
        onSuccess();
      } else {
        await addDoc(collection(db, 'appointments'), {
          ...payload,
          createdAt: Date.now()
        });
        
        setShowSuccess(true);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => onSuccess(), 600);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocorreu um erro ao validar o agendamento. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const statusOptions: { label: Appointment['status']; icon: any; color: string }[] = [
    { label: 'Aguardando confirmação', icon: Clock3, color: 'bg-slate-100 text-slate-500' },
    { label: 'Confirmado', icon: CheckCircle2, color: 'bg-blue-100 text-blue-600' },
    { label: 'Concluído', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Não compareceu', icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
    { label: 'Cancelado', icon: XCircle, color: 'bg-rose-100 text-rose-600' },
  ];

  if (showSuccess) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] text-center p-6 transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-95 translate-y-10' : 'opacity-100 scale-100 animate-in fade-in zoom-in duration-500'}`}>
        <div className="w-64 h-64 mb-8 relative">
           <div className="absolute inset-0 bg-rose-200/30 rounded-full blur-3xl animate-pulse"></div>
           <img src={SUCCESS_IMAGE} alt="Agendado" className="w-full h-full object-contain relative z-10" />
        </div>
        <h3 className="text-3xl font-serif font-bold text-slate-800 mb-3">Agendamento Realizado!</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
          O horário foi reservado com sucesso. A cliente já pode ser notificada!
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* MODAL DE ERRO CUSTOMIZADO */}
      {errorMsg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[340px] rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300 relative text-center">
            <button 
              onClick={() => setErrorMsg(null)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center space-y-5">
              <div className="w-48 h-48 mb-2">
                <img src={ERROR_IMAGE} alt="Erro" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-slate-800">Ops, não deu!</h3>
                <p className="text-sm text-slate-500 leading-relaxed px-2">
                  {errorMsg}
                </p>
              </div>

              <button 
                onClick={() => setErrorMsg(null)}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-4"
              >
                Entendi, vou ajustar
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10 pb-20 max-w-xl mx-auto">
        {/* SEÇÃO 1: CLIENTE */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center font-bold text-xs italic">1</div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Cliente</h4>
          </div>
          
          <div className="relative">
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300" size={20} />
              <input 
                type="text" 
                placeholder="Pesquisar nome da cliente..." 
                className="w-full pl-14 pr-6 py-5 bg-white rounded-3xl border border-rose-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all text-lg font-medium placeholder:text-slate-300"
                value={clientSearch}
                onChange={(e) => { setClientSearch(e.target.value); setIsClientListOpen(true); }}
                onFocus={() => { setIsClientListOpen(true); setIsServiceListOpen(false); }}
              />
            </div>
            
            {isClientListOpen && clientSearch && (
              <div className="absolute z-[160] w-full mt-2 bg-white rounded-[2rem] border border-rose-100 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                {filteredClients.length > 0 ? (
                  filteredClients.map(c => (
                    <button 
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectClient(c)}
                      className="w-full p-5 flex items-center justify-between hover:bg-rose-50 transition-colors text-left border-b border-rose-50 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden bg-rose-50 flex items-center justify-center border border-rose-100">
                          {c.fotoUrl ? <img src={c.fotoUrl} className="w-full h-full object-cover" /> : <User size={16} className="text-rose-300" />}
                        </div>
                        <span className="text-base font-bold text-slate-700">{c.displayName}</span>
                      </div>
                      <ChevronRight size={18} className="text-rose-200" />
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-slate-400 italic">Nenhum resultado...</div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SEÇÃO 2: SERVIÇO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center font-bold text-xs italic">2</div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Serviço</h4>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => { setIsServiceListOpen(!isServiceListOpen); setIsClientListOpen(false); }}
              className={`w-full flex items-center justify-between pl-14 pr-6 py-5 bg-white rounded-3xl border transition-all text-left shadow-sm ${isServiceListOpen ? 'border-rose-300 ring-4 ring-rose-50' : 'border-rose-100'}`}
            >
              <Scissors className="absolute left-5 text-rose-300" size={20} />
              <div className="flex-1">
                {selectedService ? (
                  <div className="flex justify-between items-center pr-4">
                    <span className="text-lg font-bold text-slate-700">{selectedService.displayName}</span>
                    <span className="text-sm font-black text-rose-500">R$ {formData.valorAgendamento}</span>
                  </div>
                ) : (
                  <span className="text-lg font-medium text-slate-300">Selecione o procedimento...</span>
                )}
              </div>
              <ChevronDown className={`text-rose-300 transition-transform duration-300 ${isServiceListOpen ? 'rotate-180' : ''}`} size={20} />
            </button>

            {isServiceListOpen && (
              <div className="absolute z-[160] w-full mt-2 bg-white rounded-[2rem] border border-rose-100 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                {services.length > 0 ? (
                  services.map(s => (
                    <button 
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectService(s)}
                      className={`w-full p-5 flex items-center justify-between hover:bg-rose-50 transition-colors text-left border-b border-rose-50 last:border-0 ${formData.servicoId === s.id ? 'bg-rose-50/50' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-700">{s.displayName}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.duracao} minutos</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-rose-500">R$ {s.valorServico}</span>
                        {formData.servicoId === s.id && <CheckCircle2 size={18} className="text-rose-500" />}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-slate-400 italic">Nenhum serviço ativo encontrado.</div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SEÇÃO 3: DATA E HORA */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center font-bold text-xs italic">3</div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Quando</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300" size={20} />
              <input 
                type="date" 
                className="w-full pl-14 pr-6 py-5 bg-white rounded-[1.5rem] border border-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-50 text-base font-bold text-slate-700 shadow-sm"
                value={formData.dataAgendamento}
                onChange={e => setFormData({...formData, dataAgendamento: e.target.value})}
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300" size={20} />
              <input 
                type="time" 
                className="w-full pl-14 pr-6 py-5 bg-white rounded-[1.5rem] border border-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-50 text-base font-bold text-slate-700 shadow-sm"
                value={formData.horaAgendamento}
                onChange={e => setFormData({...formData, horaAgendamento: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: FINALIZAÇÃO */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center font-bold text-xs italic">4</div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Finalização</h4>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-rose-100 shadow-sm space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest mb-2 block">Valor Final (R$)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500 font-bold">R$</span>
                <input 
                  type="number" 
                  className="w-full pl-12 pr-6 py-4 bg-rose-50/30 rounded-2xl border border-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-50 text-2xl font-black text-rose-500"
                  value={formData.valorAgendamento}
                  onChange={e => setFormData({...formData, valorAgendamento: Number(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest mb-3 block">Status Atual</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setFormData({...formData, status: opt.label})}
                    className={`px-4 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${
                      formData.status === opt.label 
                      ? 'bg-slate-800 border-slate-800 text-white shadow-lg scale-105' 
                      : `${opt.color.split(' ')[0]} border-transparent text-slate-500 hover:border-rose-100`
                    }`}
                  >
                    <opt.icon size={14} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest mb-2 block">Notas Adicionais</label>
              <div className="relative">
                <Info className="absolute left-5 top-5 text-rose-300" size={20} />
                <textarea 
                  rows={3}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-rose-50 text-sm font-medium resize-none placeholder:text-slate-300"
                  placeholder="Observações importantes..."
                  value={formData.observacao}
                  onChange={e => setFormData({...formData, observacao: e.target.value})}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-6 bg-gradient-to-tr from-rose-600 to-pink-500 text-white rounded-[2.5rem] text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 size={24} className="animate-spin" /> : (appointment ? <><CheckCircle2 size={24} /> Atualizar Agenda</> : <><CheckCircle2 size={24} /> Confirmar Horário</>)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
