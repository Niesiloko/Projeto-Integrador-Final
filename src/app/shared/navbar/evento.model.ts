export interface Evento {
  id: number;
  titulo: string;
  categoria: string;
  data: string;        
  local: string;
  descricao: string;
  valor: number;
  imagem?: string;
  organizadorEmail?: string;
}