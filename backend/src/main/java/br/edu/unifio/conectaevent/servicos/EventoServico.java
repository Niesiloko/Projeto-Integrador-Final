package br.edu.unifio.conectaevent.servicos;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import br.edu.unifio.conectaevent.dtos.VagasEvento;
import br.edu.unifio.conectaevent.entidades.Evento;
import br.edu.unifio.conectaevent.entidades.Perfil;
import br.edu.unifio.conectaevent.entidades.StatusIngresso;
import br.edu.unifio.conectaevent.entidades.Usuario;
import br.edu.unifio.conectaevent.excecoes.RecursoNaoEncontradoException;
import br.edu.unifio.conectaevent.excecoes.RegraNegocioException;
import br.edu.unifio.conectaevent.excecoes.RequisicaoInvalidaException;
import br.edu.unifio.conectaevent.repositorios.EventoRepositorio;
import br.edu.unifio.conectaevent.repositorios.IngressoRepositorio;

@Service
public class EventoServico {
    @Autowired
    private EventoRepositorio eventoRepositorio;

    @Autowired
    private IngressoRepositorio ingressoRepositorio;

    @Autowired
    private CategoriaServico categoriaServico;

    @Autowired
    private UsuarioServico usuarioServico;

    public List<Evento> listar(Integer categoriaId, String titulo) {
        if (categoriaId != null) {
            categoriaServico.buscarPorId(categoriaId);
            return eventoRepositorio.findByCategoriaIdOrderByDataHora(categoriaId);
        }
        if (titulo != null && !titulo.isBlank()) {
            return eventoRepositorio.findByTituloContainingIgnoreCaseOrderByDataHora(titulo);
        }
        return eventoRepositorio.findAll(Sort.by("dataHora"));
    }

    public List<Evento> listarFuturos() {
        return eventoRepositorio.buscarFuturos(LocalDateTime.now());
    }

    public List<Evento> listarPorOrganizador(Integer organizadorId) {
        usuarioServico.buscarPorId(organizadorId);
        return eventoRepositorio.findByOrganizadorIdOrderByDataHora(organizadorId);
    }

    public Evento buscarPorId(Integer id) {
        if (id == null) {
            throw new RequisicaoInvalidaException("Informe o id do evento.");
        }
        return eventoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Evento com id " + id + " não encontrado."));
    }

    public Evento salvar(Evento evento) {
        evento.setId(null);
        evento.setCategoria(categoriaServico.buscarPorId(evento.getCategoria().getId()));
        evento.setOrganizador(buscarOrganizador(evento.getOrganizador().getId()));
        return eventoRepositorio.save(evento);
    }

    public Evento atualizar(Integer id, Evento dados) {
        Evento evento = buscarPorId(id);

        // Regra: a capacidade não pode ficar menor que os ingressos já vendidos.
        long vendidos = contarVendidos(id);
        if (dados.getCapacidade() < vendidos) {
            throw new RegraNegocioException("A capacidade não pode ser menor que os " + vendidos
                    + " ingressos já vendidos para este evento.");
        }

        evento.setTitulo(dados.getTitulo());
        evento.setDescricao(dados.getDescricao());
        evento.setDataHora(dados.getDataHora());
        evento.setLocal(dados.getLocal());
        evento.setValor(dados.getValor());
        evento.setCapacidade(dados.getCapacidade());
        evento.setImagem(dados.getImagem());
        evento.setCategoria(categoriaServico.buscarPorId(dados.getCategoria().getId()));
        evento.setOrganizador(buscarOrganizador(dados.getOrganizador().getId()));
        return eventoRepositorio.save(evento);
    }

    public void excluir(Integer id) {
        buscarPorId(id);
        // Regra: evento com ingressos não pode ser apagado (perderia o histórico de vendas).
        if (ingressoRepositorio.existsByEventoId(id)) {
            throw new RegraNegocioException("Não é possível excluir: o evento já possui ingressos vendidos.");
        }
        eventoRepositorio.deleteById(id);
    }

    public VagasEvento consultarVagas(Integer id) {
        Evento evento = buscarPorId(id);
        long vendidos = contarVendidos(id);
        long disponiveis = Math.max(0, evento.getCapacidade() - vendidos);
        return new VagasEvento(evento.getId(), evento.getTitulo(), evento.getCapacidade(), vendidos, disponiveis,
                disponiveis == 0);
    }

    public long contarVendidos(Integer eventoId) {
        return ingressoRepositorio.countByEventoIdAndStatusIn(eventoId, StatusIngresso.OCUPAM_VAGA);
    }

    // Regra: só usuários com perfil ORGANIZADOR podem ser responsáveis por um evento.
    private Usuario buscarOrganizador(Integer usuarioId) {
        Usuario usuario = usuarioServico.buscarPorId(usuarioId);
        if (usuario.getPerfil() != Perfil.ORGANIZADOR) {
            throw new RegraNegocioException("O usuário " + usuario.getNome() + " não tem perfil ORGANIZADOR.");
        }
        return usuario;
    }
}
