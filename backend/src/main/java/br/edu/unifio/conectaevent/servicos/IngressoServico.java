package br.edu.unifio.conectaevent.servicos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.unifio.conectaevent.entidades.Evento;
import br.edu.unifio.conectaevent.entidades.Ingresso;
import br.edu.unifio.conectaevent.entidades.StatusIngresso;
import br.edu.unifio.conectaevent.entidades.Usuario;
import br.edu.unifio.conectaevent.excecoes.RecursoNaoEncontradoException;
import br.edu.unifio.conectaevent.excecoes.RegraNegocioException;
import br.edu.unifio.conectaevent.excecoes.RequisicaoInvalidaException;
import br.edu.unifio.conectaevent.repositorios.IngressoRepositorio;
import br.edu.unifio.conectaevent.repositorios.ReembolsoRepositorio;

@Service
public class IngressoServico {
    // Depois de 2 reembolsos no mesmo evento, o participante não pode mais comprar para ele.
    public static final long LIMITE_REEMBOLSOS_POR_EVENTO = 2;

    @Autowired
    private IngressoRepositorio ingressoRepositorio;

    @Autowired
    private ReembolsoRepositorio reembolsoRepositorio;

    @Autowired
    private EventoServico eventoServico;

    @Autowired
    private UsuarioServico usuarioServico;

    public List<Ingresso> listar() {
        return ingressoRepositorio.findAll(Sort.by(Sort.Direction.DESC, "dataCompra"));
    }

    public List<Ingresso> listarPorParticipante(Integer participanteId) {
        usuarioServico.buscarPorId(participanteId);
        return ingressoRepositorio.findByParticipanteIdOrderByDataCompraDesc(participanteId);
    }

    public List<Ingresso> listarPorEvento(Integer eventoId, StatusIngresso status) {
        eventoServico.buscarPorId(eventoId);
        if (status != null) {
            return ingressoRepositorio.findByEventoIdAndStatusOrderByTitular(eventoId, status);
        }
        return ingressoRepositorio.findByEventoIdOrderByTitular(eventoId);
    }

    public Ingresso buscarPorId(Integer id) {
        if (id == null) {
            throw new RequisicaoInvalidaException("Informe o id do ingresso.");
        }
        return ingressoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Ingresso com id " + id + " não encontrado."));
    }

    // Funcionalidade do PI: compra (inscrição) com controle de participantes.
    @Transactional
    public Ingresso comprar(Ingresso ingresso) {
        Evento evento = eventoServico.buscarPorId(ingresso.getEvento().getId());
        Usuario participante = usuarioServico.buscarPorId(ingresso.getParticipante().getId());

        if (!evento.getDataHora().isAfter(LocalDateTime.now())) {
            throw new RegraNegocioException("Não é possível comprar: o evento " + evento.getTitulo() + " já aconteceu.");
        }
        // Regra: um ingresso válido por pessoa por evento.
        if (ingressoRepositorio.existsByEventoIdAndParticipanteIdAndStatusIn(evento.getId(), participante.getId(),
                StatusIngresso.OCUPAM_VAGA)) {
            throw new RegraNegocioException(participante.getNome() + " já possui ingresso para este evento.");
        }
        // Regra: comprar e reembolsar o mesmo evento repetidamente não é permitido.
        long reembolsos = ingressoRepositorio.countByEventoIdAndParticipanteIdAndStatus(evento.getId(),
                participante.getId(), StatusIngresso.REEMBOLSADO);
        if (reembolsos >= LIMITE_REEMBOLSOS_POR_EVENTO) {
            throw new RegraNegocioException("Compra indisponível: " + participante.getNome() + " já efetuou "
                    + reembolsos + " reembolsos nesse evento.");
        }
        // Regra: não vender além da capacidade do evento.
        if (eventoServico.contarVendidos(evento.getId()) >= evento.getCapacidade()) {
            throw new RegraNegocioException("Ingressos esgotados para o evento " + evento.getTitulo() + ".");
        }

        ingresso.setId(null);
        ingresso.setEvento(evento);
        ingresso.setParticipante(participante);
        ingresso.setCodigo("CE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ingresso.setValor(evento.getValor());
        ingresso.setStatus(StatusIngresso.CONFIRMADO);
        ingresso.setDataCompra(LocalDateTime.now());
        return ingressoRepositorio.save(ingresso);
    }

    // Só o nome do titular pode mudar: evento, participante e valor ficam como na compra.
    public Ingresso atualizar(Integer id, Ingresso dados) {
        Ingresso ingresso = buscarPorId(id);
        if (ingresso.getStatus() != StatusIngresso.CONFIRMADO) {
            throw new RegraNegocioException("Só é possível alterar ingressos CONFIRMADOS. Situação atual: "
                    + ingresso.getStatus() + ".");
        }
        ingresso.setTitular(dados.getTitular());
        return ingressoRepositorio.save(ingresso);
    }

    public void excluir(Integer id) {
        Ingresso ingresso = buscarPorId(id);
        if (ingresso.getStatus() == StatusIngresso.UTILIZADO) {
            throw new RegraNegocioException("Não é possível excluir um ingresso já utilizado na entrada do evento.");
        }
        if (reembolsoRepositorio.existsByIngressoId(id)) {
            throw new RegraNegocioException("Não é possível excluir: o ingresso possui um pedido de reembolso.");
        }
        ingressoRepositorio.deleteById(id);
    }

    // Check-in na entrada do evento: lê o código do QR Code e marca como utilizado.
    public Ingresso validarEntrada(String codigo) {
        Ingresso ingresso = ingressoRepositorio.findByCodigo(codigo)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Ingresso com código " + codigo + " não encontrado."));

        switch (ingresso.getStatus()) {
            case UTILIZADO -> throw new RegraNegocioException("Este ingresso já foi utilizado.");
            case REEMBOLSO_SOLICITADO -> throw new RegraNegocioException("Este ingresso tem um reembolso em análise.");
            case REEMBOLSADO -> throw new RegraNegocioException("Este ingresso foi reembolsado e não é mais válido.");
            case CONFIRMADO -> ingresso.setStatus(StatusIngresso.UTILIZADO);
        }
        return ingressoRepositorio.save(ingresso);
    }
}
