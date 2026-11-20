import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import * as QRCode from 'qrcode';
import { Evento } from '../../shared/navbar/evento.model';
import { EventoService } from '../../shared/navbar/evento.service';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { AuthService } from '../../shared/auth.service';
import { mensagemDeErro } from '../../shared/api';

type Forma = 'pix' | 'cartao';

// Tela de checkout SIMULADA (projeto acadêmico): não existe cobrança de verdade.
// Os dados do cartão ficam só na memória desta tela, para validar o formato, e NUNCA são enviados à API
// nem guardados. Depois da "aprovação", a compra é registrada pelo mesmo POST /ingressos de antes.
@Component({
  selector: 'app-pagamento',
  standalone: false,
  templateUrl: './pagamento.html',
  styleUrl: './pagamento.scss'
})
export class Pagamento {
  evento?: Evento;
  carregando = true;
  bloqueio = '';   // motivo de não poder comprar (esgotado, já comprou...): esconde o formulário
  erro = '';       // erro de digitação ou da API: aparece dentro do formulário

  titular = '';
  forma: Forma = 'pix';
  processando = false;

  // Pix simulado
  pixCopiaECola = '';
  pixQrCode = '';
  copiado = false;

  // Cartão simulado (não sai desta tela)
  cartao = { numero: '', nome: '', validade: '', cvv: '' };

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private ingressoService: IngressoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    const id = Number(route.snapshot.paramMap.get('id'));
    const usuario = this.auth.usuarioLogado!;
    this.titular = usuario.nome;

    // confere de novo se ainda dá para comprar (alguém pode ter aberto esta tela pelo endereço)
    forkJoin({
      evento: this.eventoService.buscarPorId(id),
      vagas: this.eventoService.vagas(id),
      meus: this.ingressoService.listarDoUsuario(usuario.id)
    }).subscribe({
      next: ({ evento, vagas, meus }) => {
        const motivo =
          new Date(evento.data).getTime() <= Date.now() ? 'Este evento já aconteceu.'
          : vagas.esgotado ? 'Os ingressos deste evento estão esgotados.'
          : this.ingressoService.jaComprou(meus, evento.id) ? 'Você já tem um ingresso para este evento.'
          : this.ingressoService.compraBloqueada(meus, evento.id) ? 'Compra indisponível: limite de reembolsos neste evento.'
          : '';
        this.evento = evento;
        this.bloqueio = motivo;
        if (!motivo) {
          this.gerarPix(evento);
        }
      },
      error: erro => this.bloqueio = erro.status === 404 ? 'Evento não encontrado.' : mensagemDeErro(erro)
    }).add(() => {
      this.carregando = false;
      this.cdr.markForCheck();
    });
  }

  // "copia e cola" e QR Code de mentira, só para a demonstração (não é um Pix válido)
  private async gerarPix(evento: Evento) {
    const valor = evento.valor.toFixed(2);
    const referencia = Date.now().toString(36).toUpperCase();
    this.pixCopiaECola = `PIX-SIMULADO|CONECTA-EVENT|EVENTO-${evento.id}|R$${valor}|REF-${referencia}`;
    this.pixQrCode = await QRCode.toDataURL(this.pixCopiaECola, { width: 200, margin: 1 });
    this.cdr.markForCheck();
  }

  async copiarPix() {
    await navigator.clipboard?.writeText(this.pixCopiaECola).catch(() => undefined);
    this.copiado = true;
    this.cdr.markForCheck();
    setTimeout(() => { this.copiado = false; this.cdr.markForCheck(); }, 2000);
  }

  // ---- máscaras: deixam o texto no formato enquanto a pessoa digita ----

  formatarNumero() {
    const digitos = this.cartao.numero.replace(/\D/g, '').slice(0, 16);
    this.cartao.numero = digitos.replace(/(\d{4})(?=\d)/g, '$1 '); // "4111111111111111" -> "4111 1111 1111 1111"
  }

  formatarValidade() {
    const digitos = this.cartao.validade.replace(/\D/g, '').slice(0, 4);
    this.cartao.validade = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
  }

  formatarCvv() {
    this.cartao.cvv = this.cartao.cvv.replace(/\D/g, '').slice(0, 4);
  }

  // validação só de FORMATO (não existe banco de verdade para aprovar)
  private erroDoCartao(): string {
    const { numero, nome, validade, cvv } = this.cartao;
    if (numero.replace(/\D/g, '').length !== 16) {
      return 'O número do cartão deve ter 16 dígitos.';
    }
    if (nome.trim().length < 3) {
      return 'Informe o nome impresso no cartão.';
    }
    const [mes, ano] = validade.split('/').map(Number);
    if (!mes || mes > 12 || ano === undefined || validade.length !== 5) {
      return 'Informe a validade no formato MM/AA.';
    }
    const fimDaValidade = new Date(2000 + ano, mes, 1); // primeiro dia do mês seguinte
    if (fimDaValidade.getTime() <= Date.now()) {
      return 'Este cartão está vencido.';
    }
    if (cvv.length < 3) {
      return 'O CVV deve ter 3 ou 4 dígitos.';
    }
    return '';
  }

  confirmar() {
    if (!this.evento || this.processando) {
      return;
    }
    if (this.titular.trim().length < 3) {
      this.erro = 'Informe o nome do titular do ingresso (pelo menos 3 caracteres).';
      return;
    }
    if (this.forma === 'cartao') {
      const problema = this.erroDoCartao();
      if (problema) {
        this.erro = problema;
        return;
      }
    }
    this.erro = '';
    this.processando = true;

    // simula o tempo de resposta de um meio de pagamento e depois registra a compra na API
    setTimeout(() => this.registrarCompra(this.evento!), 1500);
  }

  private registrarCompra(evento: Evento) {
    const usuario = this.auth.usuarioLogado!;
    this.ingressoService.comprar(evento.id, usuario.id, this.titular.trim()).subscribe({
      next: () => {
        this.cartao = { numero: '', nome: '', validade: '', cvv: '' }; // apaga os dados digitados
        this.router.navigate(['/eventos/meus-ingressos'], { queryParams: { comprado: evento.id } });
      },
      // a API confere tudo de novo (ex.: esgotou enquanto a pessoa pagava) e explica o motivo
      error: erro => {
        this.processando = false;
        this.erro = mensagemDeErro(erro);
        this.cdr.markForCheck();
      }
    });
  }
}
