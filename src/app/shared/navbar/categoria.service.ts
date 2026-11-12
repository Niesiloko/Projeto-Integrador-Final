import { Injectable } from '@angular/core';
import { Categoria } from './categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private chave = 'categorias';

  // categorias iniciais, criadas na primeira vez que o sistema é aberto
  private padrao: Omit<Categoria, 'id'>[] = [
    { nome: 'Música', descricao: 'Shows, festivais e apresentações musicais' },
    { nome: 'Tecnologia', descricao: 'Palestras, hackathons e meetups' },
    { nome: 'Esportes', descricao: 'Corridas, campeonatos e atividades esportivas' },
    { nome: 'Teatro', descricao: 'Peças, stand-up e espetáculos' },
    { nome: 'Workshops', descricao: 'Oficinas e cursos práticos' }
  ];

  listar(): Categoria[] {
    const salvo = localStorage.getItem(this.chave);
    if (salvo === null) {
      const iniciais = this.padrao.map((c, i) => ({ id: i + 1, ...c }));
      this.gravar(iniciais);
      return iniciais;
    }
    const lista: Categoria[] = JSON.parse(salvo);
    return lista.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  buscarPorId(id: number): Categoria | undefined {
    return this.listar().find(c => c.id === id);
  }

  // nome para exibir nas telas; evento sem categoria aparece como "Sem categoria"
  nome(id?: number): string {
    return (id && this.buscarPorId(id)?.nome) || 'Sem categoria';
  }

  // procura pelo nome (sem diferenciar maiúsculas nem acentos) e cria se não existir
  obterOuCriar(nome: string): Categoria {
    const existente = this.listar().find(c => this.normalizar(c.nome) === this.normalizar(nome));
    return existente ?? this.criar(nome);
  }

  salvar(categoria: Omit<Categoria, 'id'> & { id?: number }): { ok: boolean; mensagem: string } {
    const nome = categoria.nome.trim();
    if (!nome) {
      return { ok: false, mensagem: 'Informe o nome da categoria.' };
    }

    const lista = this.listar();
    const repetida = lista.find(c => this.normalizar(c.nome) === this.normalizar(nome) && c.id !== categoria.id);
    if (repetida) {
      return { ok: false, mensagem: `Já existe a categoria "${repetida.nome}".` };
    }

    if (categoria.id) {
      const atual = lista.find(c => c.id === categoria.id);
      if (!atual) {
        return { ok: false, mensagem: 'Categoria não encontrada.' };
      }
      atual.nome = nome;
      atual.descricao = categoria.descricao?.trim();
      this.gravar(lista);
      return { ok: true, mensagem: 'Categoria atualizada.' };
    }

    this.criar(nome, categoria.descricao);
    return { ok: true, mensagem: 'Categoria criada.' };
  }

  // a regra de não excluir categoria em uso fica na tela, que conhece os eventos
  excluir(id: number) {
    this.gravar(this.listar().filter(c => c.id !== id));
  }

  private criar(nome: string, descricao?: string): Categoria {
    const lista = this.listar();
    const categoria: Categoria = {
      id: Math.max(0, ...lista.map(c => c.id)) + 1,
      nome: nome.trim(),
      descricao: descricao?.trim()
    };
    lista.push(categoria);
    this.gravar(lista);
    return categoria;
  }

  // "Música", "musica" e " MUSICA " viram "musica": tira acentos, espaços das pontas e maiúsculas
  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  }

  private gravar(lista: Categoria[]) {
    localStorage.setItem(this.chave, JSON.stringify(lista));
  }
}
