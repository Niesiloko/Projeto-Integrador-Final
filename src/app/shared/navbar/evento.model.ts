export interface Evento {
  id: number;
  titulo: string;
  categoriaId: number;
  data: string;
  local: string;
  descricao: string;
  valor: number;
  imagem?: string;
  organizadorEmail?: string;
}
