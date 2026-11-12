export interface Evento {
  id: number;
  titulo: string;
  categoriaId: number;
  data: string;
  local: string;
  descricao: string;
  valor: number;
  capacidade: number;   // quantos ingressos podem ser vendidos
  imagem?: string;
  organizadorEmail?: string;
}
