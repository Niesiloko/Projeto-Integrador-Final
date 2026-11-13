// Evento no formato usado pelas telas (o EventoService converte o JSON da API para este formato).
export interface Evento {
  id: number;
  titulo: string;
  categoriaId: number;
  categoriaNome: string;
  data: string;         // "aaaa-mm-ddThh:mm", o formato do campo datetime-local
  local: string;
  descricao: string;
  valor: number;
  capacidade: number;   // quantos ingressos podem ser vendidos
  imagem?: string;
  organizadorId: number;
}

// Situação da lotação (GET /eventos/{id}/vagas)
export interface VagasEvento {
  eventoId: number;
  titulo: string;
  capacidade: number;
  vendidos: number;
  disponiveis: number;
  esgotado: boolean;
}
