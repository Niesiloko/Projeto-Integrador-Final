package br.edu.unifio.conectaevent.dtos;

// Resposta do GET /eventos/{id}/vagas: situação da lotação de um evento.
public record VagasEvento(
        Integer eventoId,
        String titulo,
        Integer capacidade,
        long vendidos,
        long disponiveis,
        boolean esgotado) {
}
