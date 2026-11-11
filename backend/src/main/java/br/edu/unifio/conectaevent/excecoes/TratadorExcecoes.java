package br.edu.unifio.conectaevent.excecoes;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.servlet.http.HttpServletRequest;

// Tratamento centralizado: converte as exceções em respostas HTTP com JSON padronizado.
@RestControllerAdvice
public class TratadorExcecoes {

    // 404: registro não existe
    @ExceptionHandler (RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> naoEncontrado(RecursoNaoEncontradoException e, HttpServletRequest requisicao) {
        return resposta(HttpStatus.NOT_FOUND, e.getMessage(), requisicao, null);
    }

    // 409: regra de negócio violada
    @ExceptionHandler (RegraNegocioException.class)
    public ResponseEntity<ErroResposta> regraNegocio(RegraNegocioException e, HttpServletRequest requisicao) {
        return resposta(HttpStatus.CONFLICT, e.getMessage(), requisicao, null);
    }

    // 400: dado obrigatório ausente detectado no serviço (ex.: id da categoria)
    @ExceptionHandler (RequisicaoInvalidaException.class)
    public ResponseEntity<ErroResposta> requisicaoInvalida(RequisicaoInvalidaException e,
            HttpServletRequest requisicao) {
        return resposta(HttpStatus.BAD_REQUEST, e.getMessage(), requisicao, null);
    }

    // 400: falha no Bean Validation (@Valid), com a mensagem de cada campo
    @ExceptionHandler (MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> validacao(MethodArgumentNotValidException e, HttpServletRequest requisicao) {
        Map<String, String> campos = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(erro -> campos.putIfAbsent(erro.getField(), erro.getDefaultMessage()));
        return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos. Verifique os campos informados.", requisicao, campos);
    }

    // 400: JSON malformado, data em formato errado ou valor de enum inexistente
    @ExceptionHandler (HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResposta> corpoInvalido(HttpMessageNotReadableException e,
            HttpServletRequest requisicao) {
        return resposta(HttpStatus.BAD_REQUEST,
                "Corpo da requisição inválido. Confira o JSON, as datas (aaaa-mm-ddThh:mm:ss) e os valores permitidos.",
                requisicao, null);
    }

    // 400: parâmetro de URL com tipo errado (ex.: /eventos/abc)
    @ExceptionHandler (MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResposta> tipoInvalido(MethodArgumentTypeMismatchException e,
            HttpServletRequest requisicao) {
        return resposta(HttpStatus.BAD_REQUEST,
                "Valor inválido para o parâmetro '" + e.getName() + "': " + e.getValue(), requisicao, null);
    }

    // 409: o banco recusou a operação (ex.: chave única duplicada)
    @ExceptionHandler (DataIntegrityViolationException.class)
    public ResponseEntity<ErroResposta> integridade(DataIntegrityViolationException e,
            HttpServletRequest requisicao) {
        return resposta(HttpStatus.CONFLICT, "Operação viola a integridade dos dados cadastrados.", requisicao, null);
    }

    private ResponseEntity<ErroResposta> resposta(HttpStatus status, String mensagem, HttpServletRequest requisicao,
            Map<String, String> campos) {
        ErroResposta corpo = new ErroResposta(LocalDateTime.now(), status.value(), status.getReasonPhrase(), mensagem,
                requisicao.getRequestURI(), campos);
        return ResponseEntity.status(status).body(corpo);
    }
}
