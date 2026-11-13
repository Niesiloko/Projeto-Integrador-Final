package br.edu.unifio.conectaevent.recursos;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.edu.unifio.conectaevent.entidades.Evento;
import br.edu.unifio.conectaevent.entidades.Ingresso;
import br.edu.unifio.conectaevent.entidades.Perfil;
import br.edu.unifio.conectaevent.entidades.Reembolso;
import br.edu.unifio.conectaevent.entidades.StatusReembolso;
import br.edu.unifio.conectaevent.entidades.Usuario;
import br.edu.unifio.conectaevent.servicos.EventoServico;
import br.edu.unifio.conectaevent.servicos.IngressoServico;
import br.edu.unifio.conectaevent.servicos.ReembolsoServico;
import br.edu.unifio.conectaevent.servicos.UsuarioServico;
import jakarta.validation.Valid;

@RestController
@RequestMapping ("usuarios")
public class UsuarioRecurso {
    @Autowired
    private UsuarioServico usuarioServico;

    @Autowired
    private EventoServico eventoServico;

    @Autowired
    private IngressoServico ingressoServico;

    @Autowired
    private ReembolsoServico reembolsoServico;

    // GET /usuarios ou GET /usuarios?perfil=ORGANIZADOR
    @GetMapping
    public List<Usuario> listar(@RequestParam (required = false) Perfil perfil) {
        return usuarioServico.listar(perfil);
    }

    // Quem está logado: o front chama esta rota no login para validar e-mail e senha
    // e descobrir o id, o nome e o perfil do usuário.
    @GetMapping ("me")
    public Usuario usuarioLogado(Authentication autenticacao) {
        return usuarioServico.buscarPorEmail(autenticacao.getName());
    }

    @GetMapping ("{id}")
    public Usuario buscarPorId(@PathVariable Integer id) {
        return usuarioServico.buscarPorId(id);
    }

    // "Meus eventos" do organizador
    @GetMapping ("{id}/eventos")
    public List<Evento> listarEventos(@PathVariable Integer id) {
        return eventoServico.listarPorOrganizador(id);
    }

    // "Meus ingressos" do participante
    @GetMapping ("{id}/ingressos")
    public List<Ingresso> listarIngressos(@PathVariable Integer id) {
        return ingressoServico.listarPorParticipante(id);
    }

    // Reembolsos dos eventos do organizador (padrão: PENDENTE)
    @GetMapping ("{id}/reembolsos")
    public List<Reembolso> listarReembolsos(@PathVariable Integer id,
            @RequestParam (required = false) StatusReembolso status) {
        return reembolsoServico.listarPorOrganizador(id, status);
    }

    @PostMapping
    @ResponseStatus (HttpStatus.CREATED)
    public Usuario salvar(@Valid @RequestBody Usuario usuario) {
        return usuarioServico.salvar(usuario);
    }

    // Cadastro pelo site, sem login (rota liberada na SegurancaConfiguracao).
    @PostMapping ("cadastro")
    @ResponseStatus (HttpStatus.CREATED)
    public Usuario cadastrar(@Valid @RequestBody Usuario usuario) {
        return usuarioServico.cadastrar(usuario);
    }

    @PutMapping ("{id}")
    public Usuario atualizar(@PathVariable Integer id, @Valid @RequestBody Usuario usuario) {
        return usuarioServico.atualizar(id, usuario);
    }

    @DeleteMapping ("{id}")
    @ResponseStatus (HttpStatus.NO_CONTENT)
    public void excluirPorId(@PathVariable Integer id) {
        usuarioServico.excluir(id);
    }
}
