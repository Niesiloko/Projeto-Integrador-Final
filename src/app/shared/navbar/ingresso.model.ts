export type StatusIngresso =
  | 'CONFIRMADO'
  | 'REEMBOLSO_SOLICITADO'
  | 'REEMBOLSADO'
  | 'UTILIZADO';

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
  compradorEmail: string;
}