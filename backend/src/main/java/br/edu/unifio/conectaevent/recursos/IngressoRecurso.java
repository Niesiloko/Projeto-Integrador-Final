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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.edu.unifio.conectaevent.entidades.Ingresso;
import br.edu.unifio.conectaevent.servicos.IngressoServico;
import jakarta.validation.Valid;

@RestController
@RequestMapping ("ingressos")
public class IngressoRecurso {
    @Autowired
    private IngressoServico ingressoServico;

    @GetMapping
    public List<Ingresso> listar() {
        return ingressoServico.listar();
    }

    @GetMapping ("{id}")
    public Ingresso buscarPorId(@PathVariable Integer id) {
        return ingressoServico.buscarPorId(id);
    }

    // Compra do ingresso: { "evento": {"id": 1}, "participante": {"id": 3}, "titular": "..." }
    @PostMapping
    @ResponseStatus (HttpStatus.CREATED)
    public Ingresso comprar(@Valid @RequestBody Ingresso ingresso) {
        return ingressoServico.comprar(ingresso);
    }

    @PutMapping ("{id}")
    public Ingresso atualizar(@PathVariable Integer id, @Valid @RequestBody Ingresso ingresso) {
        return ingressoServico.atualizar(id, ingresso);
    }

    @DeleteMapping ("{id}")
    @ResponseStatus (HttpStatus.NO_CONTENT)
    public void excluirPorId(@PathVariable Integer id) {
        ingressoServico.excluir(id);
    }

    // Check-in na entrada do evento, pelo código lido no QR Code
    @PostMapping ("check-in/{codigo}")
    public Ingresso validarEntrada(@PathVariable String codigo) {
        return ingressoServico.validarEntrada(codigo);
    }
}
