package br.edu.unifio.conectaevent.servicos;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import br.edu.unifio.conectaevent.entidades.Perfil;
import br.edu.unifio.conectaevent.entidades.Usuario;
import br.edu.unifio.conectaevent.excecoes.RecursoNaoEncontradoException;
import br.edu.unifio.conectaevent.excecoes.RegraNegocioException;
import br.edu.unifio.conectaevent.excecoes.RequisicaoInvalidaException;
import br.edu.unifio.conectaevent.repositorios.EventoRepositorio;
import br.edu.unifio.conectaevent.repositorios.IngressoRepositorio;
import br.edu.unifio.conectaevent.repositorios.UsuarioRepositorio;

@Service
public class UsuarioServico {
    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private EventoRepositorio eventoRepositorio;

    @Autowired
    private IngressoRepositorio ingressoRepositorio;

    public List<Usuario> listar(Perfil perfil) {
        if (perfil != null) {
            return usuarioRepositorio.findByPerfilOrderByNome(perfil);
        }
        return usuarioRepositorio.findAll(Sort.by("nome"));
    }

    public Usuario buscarPorId(Integer id) {
        if (id == null) {
            throw new RequisicaoInvalidaException("Informe o id do usuário.");
        }
        return usuarioRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário com id " + id + " não encontrado."));
    }

    public Usuario salvar(Usuario usuario) {
        usuario.setId(null);
        if (usuarioRepositorio.existsByEmailIgnoreCase(usuario.getEmail())) {
            throw new RegraNegocioException("Já existe um usuário com o e-mail " + usuario.getEmail() + ".");
        }
        return usuarioRepositorio.save(usuario);
    }

    public Usuario atualizar(Integer id, Usuario dados) {
        Usuario usuario = buscarPorId(id);

        if (usuarioRepositorio.existsByEmailIgnoreCaseAndIdNot(dados.getEmail(), id)) {
            throw new RegraNegocioException("Já existe outro usuário com o e-mail " + dados.getEmail() + ".");
        }
        // Regra: quem já organiza eventos não pode deixar de ser organizador.
        if (usuario.getPerfil() == Perfil.ORGANIZADOR && dados.getPerfil() != Perfil.ORGANIZADOR
                && eventoRepositorio.existsByOrganizadorId(id)) {
            throw new RegraNegocioException("O usuário organiza eventos e não pode deixar de ser ORGANIZADOR.");
        }

        usuario.setNome(dados.getNome());
        usuario.setEmail(dados.getEmail());
        usuario.setPerfil(dados.getPerfil());
        return usuarioRepositorio.save(usuario);
    }

    public void excluir(Integer id) {
        buscarPorId(id);
        if (eventoRepositorio.existsByOrganizadorId(id)) {
            throw new RegraNegocioException("Não é possível excluir: o usuário organiza eventos.");
        }
        if (ingressoRepositorio.existsByParticipanteId(id)) {
            throw new RegraNegocioException("Não é possível excluir: o usuário possui ingressos.");
        }
        usuarioRepositorio.deleteById(id);
    }
}
