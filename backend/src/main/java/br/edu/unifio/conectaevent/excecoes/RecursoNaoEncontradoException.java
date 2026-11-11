package br.edu.unifio.conectaevent.excecoes;

// Registro procurado não existe -> 404 Not Found.
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
