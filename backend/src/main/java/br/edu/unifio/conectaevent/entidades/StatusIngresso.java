package br.edu.unifio.conectaevent.entidades;

import java.util.List;

public enum StatusIngresso {
    CONFIRMADO,
    REEMBOLSO_SOLICITADO,
    REEMBOLSADO,
    UTILIZADO;

    // Status que ainda ocupam uma vaga no evento (só o reembolsado libera a vaga).
    public static final List<StatusIngresso> OCUPAM_VAGA = List.of(CONFIRMADO, REEMBOLSO_SOLICITADO, UTILIZADO);
}
