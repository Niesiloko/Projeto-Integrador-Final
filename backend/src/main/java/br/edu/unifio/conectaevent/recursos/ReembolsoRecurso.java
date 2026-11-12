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

import br.edu.unifio.conectaevent.entidades.Reembolso;
import br.edu.unifio.conectaevent.entidades.StatusReembolso;
import br.edu.unifio.conectaevent.servicos.ReembolsoServico;
import jakarta.validation.Valid;

@RestController
@RequestMapping ("reembolsos")
public class ReembolsoRecurso {
    @Autowired
    private ReembolsoServico reembolsoServico;

    // GET /reembolsos ou /reembolsos?status=PENDENTE
    @GetMapping
    public List<Reembolso> listar(@RequestParam (required = false) StatusReembolso status) {
        return reembolsoServico.listar(status);
    }

    @GetMapping ("{id}")
    public Reembolso buscarPorId(@PathVariable Integer id) {
        return reembolsoServico.buscarPorId(id);
    }

    // Pedido de reembolso: { "ingresso": {"id": 1}, "motivo": "..." }
    @PostMapping
    @ResponseStatus (HttpStatus.CREATED)
    public Reembolso solicitar(@Valid @RequestBody Reembolso reembolso) {
        return reembolsoServico.solicitar(reembolso);
    }

    @PutMapping ("{id}")
    public Reembolso atualizar(@PathVariable Integer id, @Valid @RequestBody Reembolso reembolso) {
        return reembolsoServico.atualizar(id, reembolso);
    }

    @DeleteMapping ("{id}")
    @ResponseStatus (HttpStatus.NO_CONTENT)
    public void excluirPorId(@PathVariable Integer id) {
        reembolsoServico.excluir(id);
    }

    @PostMapping ("{id}/aprovar")
    public Reembolso aprovar(@PathVariable Integer id) {
        return reembolsoServico.aprovar(id);
    }

    @PostMapping ("{id}/recusar")
    public Reembolso recusar(@PathVariable Integer id) {
        return reembolsoServico.recusar(id);
    }
}
