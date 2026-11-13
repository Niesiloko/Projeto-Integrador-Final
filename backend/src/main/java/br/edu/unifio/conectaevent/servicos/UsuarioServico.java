package br.edu.unifio.conectaevent.servicos;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private PasswordEncoder codificadorSenha;

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

    // Usuário autenticado na requisição (o e-mail é o nome de usuário do HTTP Basic).
    public Usuario buscarPorEmail(String email) {
        return usuarioRepositorio.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário com e-mail " + email + " não encontrado."));
    }

    public Usuario salvar(Usuario usuario) {
        usuario.setId(null);
        if (usuarioRepositorio.existsByEmailIgnoreCase(usuario.getEmail())) {
            throw new RegraNegocioException("Já existe um usuário com o e-mail " + usuario.getEmail() + ".");
        }
        // A senha nunca é gravada como foi digitada: o BCrypt gera um "hash" que não pode ser desfeito.
        if (usuario.getSenha() != null) {
            usuario.setSenha(codificadorSenha.encode(usuario.getSenha()));
        }
        return usuarioRepositorio.save(usuario);
    }

    // Cadastro pelo site (rota pública): igual ao salvar, mas a senha é obrigatória para poder entrar depois.
    public Usuario cadastrar(Usuario usuario) {
        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            throw new RequisicaoInvalidaException("Informe uma senha para criar a conta.");
        }
        return salvar(usuario);
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
        // Sem senha no JSON, mantém a atual.
        if (dados.getSenha() != null) {
            usuario.setSenha(codificadorSenha.encode(dados.getSenha()));
        }
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
