
export interface Client {
  id?: string;
  displayName: string;
  telefone: string;
  fotoUrl: string;
  createdAt: number;
}

export interface Service {
  id?: string;
  displayName: string;
  descricao: string;
  duracao: number;
  valorServico: number;
  status: boolean;
  createdAt: number;
}

export interface Appointment {
  id?: string;
  clienteId: string;
  clienteNome?: string; // Campo auxiliar para exibição rápida
  servicoId: string;
  servicoNome?: string; // Campo auxiliar para exibição rápida
  dataAgendamento: string; // YYYY-MM-DD
  horaAgendamento: string; // HH:MM
  horaFinal: string; // HH:MM (Calculado: inicio + duração)
  valorAgendamento: number;
  status: 'Aguardando confirmação' | 'Confirmado' | 'Concluído' | 'Não compareceu' | 'Cancelado';
  observacao: string;
  createdAt: number;
}

export interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface FinancialRecord {
  month: string;
  revenue: number;
  appointments: number;
}
