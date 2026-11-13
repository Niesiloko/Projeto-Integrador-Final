export type StatusIngresso =
  | 'CONFIRMADO'
  | 'REEMBOLSO_SOLICITADO'
  | 'REEMBOLSADO'
  | 'UTILIZADO';

// Ingresso no formato usado pelas telas (o IngressoService converte o JSON da API).
export interface Ingresso {
  id: number;
  codigo: string;
  eventoId: number;
  eventoNome: string;
  data: string;
  local: string;
  titular: string;
  valor: number;
  status: StatusIngresso;
  participanteId: number;
}

// Pedido de reembolso, com o ingresso a que ele se refere.
export interface Reembolso {
  id: number;
  motivo: string;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
  ingresso: Ingresso;
}
