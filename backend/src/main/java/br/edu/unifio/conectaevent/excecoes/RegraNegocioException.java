package br.edu.unifio.conectaevent.excecoes;

// Operação válida no formato, mas que viola uma regra do negócio -> 409 Conflict.
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
