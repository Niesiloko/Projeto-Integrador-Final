import { ChangeDetectorRef, Component } from '@angular/core';
import * as QRCode from 'qrcode';
import { Ingresso } from '../../shared/navbar/ingresso.model';
import { IngressoService } from '../../shared/navbar/ingresso.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-meus-ingressos',
  standalone: false,
  styleUrl: './meus-ingressos.scss',
  templateUrl: './meus-ingressos.html',
})
export class MeusIngressos {

  ingressos: Ingresso[] = [];
  qrs: Record<number, string> = {};

  // a confirmação e o resultado aparecem no próprio cartão do ingresso
  confirmandoReembolso?: number;
  avisos: Record<number, { texto: string; erro: boolean }> = {};

  constructor(
    private ingressoService: IngressoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.carregar();
  }

  carregar() {
    const usuario = this.auth.usuarioLogado;
    this.ingressos = usuario ? this.ingressoService.listarDoUsuario(usuario.email) : [];

    this.ingressos.filter(i => this.valido(i)).forEach(async ing => {
      this.qrs[ing.id] = await QRCode.toDataURL(ing.codigo, { width: 160, margin: 1 });
      this.cdr.detectChanges();
    });
  }

  // o QR Code só vale enquanto o ingresso não foi reembolsado nem utilizado
  valido(ing: Ingresso): boolean {
    return ing.status === 'CONFIRMADO' || ing.status === 'REEMBOLSO_SOLICITADO';
  }

  // primeiro clique: pede confirmação no cartão
  pedirReembolso(ing: Ingresso) {
    delete this.avisos[ing.id];
    this.confirmandoReembolso = ing.id;
  }

  // clique em "Sim, solicitar"
  reembolsar(ing: Ingresso) {
    this.confirmandoReembolso = undefined;
    const resultado = this.ingressoService.solicitarReembolso(ing.id);
    this.avisos[ing.id] = { texto: resultado.mensagem, erro: !resultado.ok };
    this.carregar();
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