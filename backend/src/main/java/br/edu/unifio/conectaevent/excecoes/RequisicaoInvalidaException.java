package br.edu.unifio.conectaevent.excecoes;

// Dados da requisição incompletos ou incorretos -> 400 Bad Request.
public class RequisicaoInvalidaException extends RuntimeException {

    public RequisicaoInvalidaException(String mensagem) {
        super(mensagem);
    }
}
