package br.edu.unifio.conectaevent.servicos;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.unifio.conectaevent.entidades.Ingresso;
import br.edu.unifio.conectaevent.entidades.Reembolso;
import br.edu.unifio.conectaevent.entidades.StatusIngresso;
import br.edu.unifio.conectaevent.entidades.StatusReembolso;
import br.edu.unifio.conectaevent.excecoes.RecursoNaoEncontradoException;
import br.edu.unifio.conectaevent.excecoes.RegraNegocioException;
import br.edu.unifio.conectaevent.excecoes.RequisicaoInvalidaException;
import br.edu.unifio.conectaevent.repositorios.IngressoRepositorio;
import br.edu.unifio.conectaevent.repositorios.ReembolsoRepositorio;

@Service
public class ReembolsoServico {
    // Prazo mínimo entre o pedido e o início do evento (mesma regra do front-end).
    public static final long PRAZO_REEMBOLSO_HORAS = 48;

    @Autowired
    private ReembolsoRepositorio reembolsoRepositorio;

    @Autowired
    private IngressoRepositorio ingressoRepositorio;

    @Autowired
    private IngressoServico ingressoServico;

    @Autowired
    private UsuarioServico usuarioServico;

    public List<Reembolso> listar(StatusReembolso status) {
        if (status != null) {
            return reembolsoRepositorio.findByStatusOrderByDataSolicitacao(status);
        }
        return reembolsoRepositorio.findAll(Sort.by("dataSolicitacao"));
    }

    public List<Reembolso> listarPorOrganizador(Integer organizadorId, StatusReembolso status) {
        usuarioServico.buscarPorId(organizadorId);
        return reembolsoRepositorio.buscarPorOrganizadorEStatus(organizadorId,
                status != null ? status : StatusReembolso.PENDENTE);
    }

    public Reembolso buscarPorId(Integer id) {
        if (id == null) {
            throw new RequisicaoInvalidaException("Informe o id do reembolso.");
        }
        return reembolsoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Reembolso com id " + id + " não encontrado."));
    }

    @Transactional
    public Reembolso solicitar(Reembolso reembolso) {
        Ingresso ingresso = ingressoServico.buscarPorId(reembolso.getIngresso().getId());

        if (reembolsoRepositorio.existsByIngressoId(ingresso.getId())) {
            throw new RegraNegocioException("Este ingresso já possui um pedido de reembolso.");
        }
        if (ingresso.getStatus() != StatusIngresso.CONFIRMADO) {
            throw new RegraNegocioException("Só ingressos CONFIRMADOS podem ser reembolsados. Situação atual: "
                    + ingresso.getStatus() + ".");
        }
        // Regra: reembolso só até 48 horas antes do início do evento.
        long horasAteEvento = Duration.between(LocalDateTime.now(), ingresso.getEvento().getDataHora()).toHours();
        if (horasAteEvento < PRAZO_REEMBOLSO_HORAS) {
            throw new RegraNegocioException("Prazo de reembolso encerrado: o pedido deve ser feito até "
                    + PRAZO_REEMBOLSO_HORAS + " horas antes do evento (faltam " + Math.max(0, horasAteEvento)
                    + " horas).");
        }

        reembolso.setId(null);
        reembolso.setIngresso(ingresso);
        reembolso.setStatus(StatusReembolso.PENDENTE);
        reembolso.setValor(ingresso.getValor());
        reembolso.setDataSolicitacao(LocalDateTime.now());
        reembolso.setDataDecisao(null);

        ingresso.setStatus(StatusIngresso.REEMBOLSO_SOLICITADO);
        ingressoRepositorio.save(ingresso);
        return reembolsoRepositorio.save(reembolso);
    }

    // Enquanto pendente, o participante pode corrigir o motivo.
    public Reembolso atualizar(Integer id, Reembolso dados) {
        Reembolso reembolso = buscarPendente(id);
        reembolso.setMotivo(dados.getMotivo());
        return reembolsoRepositorio.save(reembolso);
    }

    // Excluir = desistir do pedido: o ingresso volta a valer.
    @Transactional
    public void excluir(Integer id) {
        Reembolso reembolso = buscarPendente(id);
        Ingresso ingresso = reembolso.getIngresso();
        ingresso.setStatus(StatusIngresso.CONFIRMADO);
        ingressoRepositorio.save(ingresso);
        reembolsoRepositorio.delete(reembolso);
    }

    // Organizador aprova: devolução integral e o ingresso é invalidado (libera a vaga).
    @Transactional
    public Reembolso aprovar(Integer id) {
        Reembolso reembolso = buscarPendente(id);
        reembolso.setStatus(StatusReembolso.APROVADO);
        reembolso.setDataDecisao(LocalDateTime.now());

        Ingresso ingresso = reembolso.getIngresso();
        ingresso.setStatus(StatusIngresso.REEMBOLSADO);
        ingressoRepositorio.save(ingresso);
        return reembolsoRepositorio.save(reembolso);
    }

    // Organizador recusa: o ingresso volta a valer normalmente.
    @Transactional
    public Reembolso recusar(Integer id) {
        Reembolso reembolso = buscarPendente(id);
        reembolso.setStatus(StatusReembolso.RECUSADO);
        reembolso.setDataDecisao(LocalDateTime.now());

        Ingresso ingresso = reembolso.getIngresso();
        ingresso.setStatus(StatusIngresso.CONFIRMADO);
        ingressoRepositorio.save(ingresso);
        return reembolsoRepositorio.save(reembolso);
    }

    private Reembolso buscarPendente(Integer id) {
        Reembolso reembolso = buscarPorId(id);
        if (reembolso.getStatus() != StatusReembolso.PENDENTE) {
            throw new RegraNegocioException("Este reembolso já foi " + reembolso.getStatus().name().toLowerCase()
                    + " e não pode mais ser alterado.");
        }
        return reembolso;
    }
}
