import { ChangeDetectorRef, Component } from '@angular/core';
import * as QRCode from 'qrcode';
import { Ingresso } from '../../shared/navbar/ingresso.model';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { AuthService } from '../../shared/auth.service';
import { mensagemDeErro } from '../../shared/api';

@Component({
  selector: 'app-meus-ingressos',
  standalone: false,
  styleUrl: './meus-ingressos.scss',
  templateUrl: './meus-ingressos.html',
})
export class MeusIngressos {

  ingressos: Ingresso[] = [];
  qrs: Record<number, string> = {};
  carregando = true;
  erro = '';

  // a confirmação e o resultado aparecem no próprio cartão do ingresso
  confirmandoReembolso?: number;
  motivo = '';
  enviando = false;
  avisos: Record<number, { texto: string; erro: boolean }> = {};

  constructor(
    public ingressoService: IngressoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.carregar();
  }

  carregar() {
    const usuario = this.auth.usuarioLogado;
    if (!usuario) {
      return;
    }
    this.ingressoService.listarDoUsuario(usuario.id).subscribe({
      next: ingressos => {
        this.ingressos = ingressos;
        this.erro = '';
        this.gerarQrCodes();
      },
      error: erro => this.erro = mensagemDeErro(erro)
    }).add(() => {
      this.carregando = false;
      this.cdr.markForCheck();
    });
  }

  private gerarQrCodes() {
    this.ingressos.filter(i => this.valido(i)).forEach(async ing => {
      this.qrs[ing.id] = await QRCode.toDataURL(ing.codigo, { width: 160, margin: 1 });
      this.cdr.markForCheck();
    });
  }

  // o QR Code só vale enquanto o ingresso não foi reembolsado nem utilizado
  valido(ing: Ingresso): boolean {
    return ing.status === 'CONFIRMADO' || ing.status === 'REEMBOLSO_SOLICITADO';
  }

  // aviso de que este é o último reembolso permitido no evento
  ehUltimoReembolso(ing: Ingresso): boolean {
    return this.ingressoService.ehUltimoReembolso(this.ingressos, ing);
  }

  // primeiro clique: pede o motivo e a confirmação no cartão
  pedirReembolso(ing: Ingresso) {
    delete this.avisos[ing.id];
    this.motivo = '';
    this.confirmandoReembolso = ing.id;
  }

  // clique em "Sim, solicitar"
  reembolsar(ing: Ingresso) {
    if (this.motivo.trim().length < 5) {
      this.avisos[ing.id] = { texto: 'Conte o motivo do reembolso (pelo menos 5 caracteres).', erro: true };
      return;
    }
    this.enviando = true;
    this.ingressoService.solicitarReembolso(ing.id, this.motivo).subscribe({
      next: () => {
        this.confirmandoReembolso = undefined;
        this.avisos[ing.id] = { texto: 'Reembolso solicitado. Aguarde a aprovação do organizador.', erro: false };
        this.carregar();
      },
      // ex.: 409 "Prazo de reembolso encerrado: o pedido deve ser feito até 48 horas antes do evento"
      error: erro => {
        this.confirmandoReembolso = undefined;
        this.avisos[ing.id] = { texto: mensagemDeErro(erro), erro: true };
      }
    }).add(() => {
      this.enviando = false;
      this.cdr.markForCheck();
    });
  }

  rotulo(status: string): string {
    const nomes: Record<string, string> = {
      CONFIRMADO: 'Confirmado',
      REEMBOLSO_SOLICITADO: 'Reembolso solicitado',
      REEMBOLSADO: 'Reembolsado',
      UTILIZADO: 'Utilizado'
    };
    return nomes[status] ?? status;
  }
}
