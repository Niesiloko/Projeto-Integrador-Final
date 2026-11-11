package br.edu.unifio.conectaevent.recursos;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import br.edu.unifio.conectaevent.dtos.VagasEvento;
import br.edu.unifio.conectaevent.entidades.Evento;
import br.edu.unifio.conectaevent.entidades.Ingresso;
import br.edu.unifio.conectaevent.entidades.StatusIngresso;
import br.edu.unifio.conectaevent.servicos.EventoServico;
import br.edu.unifio.conectaevent.servicos.IngressoServico;
import jakarta.validation.Valid;

@RestController
@RequestMapping ("eventos")
public class EventoRecurso {
    @Autowired
    private EventoServico eventoServico;

    @Autowired
    private IngressoServico ingressoServico;

    // GET /eventos, /eventos?categoriaId=1 ou /eventos?titulo=rock
    @GetMapping
    public List<Evento> listar(@RequestParam (required = false) Integer categoriaId,
            @RequestParam (required = false) String titulo) {
        return eventoServico.listar(categoriaId, titulo);
    }

    @GetMapping ("futuros")
    public List<Evento> listarFuturos() {
        return eventoServico.listarFuturos();
    }

    @GetMapping ("{id}")
    public Evento buscarPorId(@PathVariable Integer id) {
        return eventoServico.buscarPorId(id);
    }

    @GetMapping ("{id}/vagas")
    public VagasEvento consultarVagas(@PathVariable Integer id) {
        return eventoServico.consultarVagas(id);
    }

    // Lista de participantes do evento: /eventos/1/ingressos?status=CONFIRMADO
    @GetMapping ("{id}/ingressos")
    public List<Ingresso> listarIngressos(@PathVariable Integer id,
            @RequestParam (required = false) StatusIngresso status) {
        return ingressoServico.listarPorEvento(id, status);
    }

    @PostMapping
    @ResponseStatus (HttpStatus.CREATED)
    public Evento salvar(@Valid @RequestBody Evento evento) {
        return eventoServico.salvar(evento);
    }

    @PutMapping ("{id}")
    public Evento atualizar(@PathVariable Integer id, @Valid @RequestBody Evento evento) {
        return eventoServico.atualizar(id, evento);
    }

    @DeleteMapping ("{id}")
    @ResponseStatus (HttpStatus.NO_CONTENT)
    public void excluirPorId(@PathVariable Integer id) {
        eventoServico.excluir(id);
    }
}
