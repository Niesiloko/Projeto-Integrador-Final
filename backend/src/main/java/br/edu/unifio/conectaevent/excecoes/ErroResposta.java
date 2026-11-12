package br.edu.unifio.conectaevent.excecoes;

import java.time.LocalDateTime;
import java.util.Map;

// Corpo padrão de todas as respostas de erro da API.
// "campos" só vem preenchido em erros de validação (400).
public record ErroResposta(
        LocalDateTime momento,
        int status,
        String erro,
        String mensagem,
        String caminho,
        Map<String, String> campos) {
}
