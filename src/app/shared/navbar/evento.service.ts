import { Injectable } from '@angular/core';
import { Evento } from './evento.model';
import { CategoriaService } from './categoria.service';

export type DadosEvento = Omit<Evento, 'id' | 'organizadorEmail'>;

@Injectable({ providedIn: 'root' })
export class EventoService {
  private chave = 'eventos';

  constructor(private categoriaService: CategoriaService) {}

  listar(): Evento[] {
    const lista = JSON.parse(localStorage.getItem(this.chave) || '[]');
    let migrou = false;

    const eventos = lista.map((e: Evento & { categoria?: string }) => {
      // eventos antigos guardavam o nome da categoria em texto: passa a usar o id
      if (!e.categoriaId && e.categoria) {
        e.categoriaId = this.categoriaService.obterOuCriar(e.categoria).id;
        delete e.categoria;
        migrou = true;
      }
      return { ...e, valor: e.valor ?? 0 };
    });

    if (migrou) {
      this.gravar(eventos);
    }
    return eventos;
  }

  buscarPorId(id: number): Evento | undefined {
    return this.listar().find(e => e.id === id);
  }

  listarDoOrganizador(email: string): Evento[] {
    return this.listar().filter(e => e.organizadorEmail === email);
  }

  usaCategoria(categoriaId: number): boolean {
    return this.listar().some(e => e.categoriaId === categoriaId);
  }

  salvar(dados: DadosEvento, organizadorEmail: string): Evento {
    const evento: Evento = { id: Date.now(), ...dados, organizadorEmail };
    const lista = this.listar();
    lista.push(evento);
    this.gravar(lista);
    return evento;
  }

  atualizar(id: number, dados: DadosEvento): Evento | undefined {
    const lista = this.listar();
    const indice = lista.findIndex(e => e.id === id);
    if (indice < 0) {
      return undefined;
    }
    // id e organizador não mudam na edição
    lista[indice] = { ...lista[indice], ...dados, id, organizadorEmail: lista[indice].organizadorEmail };
    this.gravar(lista);
    return lista[indice];
  }

  excluir(id: number) {
    this.gravar(this.listar().filter(e => e.id !== id));
  }

  private gravar(lista: Evento[]) {
    localStorage.setItem(this.chave, JSON.stringify(lista));
  }
}
