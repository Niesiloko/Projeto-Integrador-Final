package br.edu.unifio.conectaevent.repositorios;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.edu.unifio.conectaevent.entidades.Ingresso;
import br.edu.unifio.conectaevent.entidades.StatusIngresso;

public interface IngressoRepositorio extends JpaRepository<Ingresso, Integer> {

    Optional<Ingresso> findByCodigo(String codigo);

    // Consulta derivada: ingressos de um participante ("Meus ingressos").
    List<Ingresso> findByParticipanteIdOrderByDataCompraDesc(Integer participanteId);

    List<Ingresso> findByEventoIdOrderByTitular(Integer eventoId);

    List<Ingresso> findByEventoIdAndStatusOrderByTitular(Integer eventoId, StatusIngresso status);

    // Quantos ingressos ocupam vaga no evento (usado no controle de capacidade).
    long countByEventoIdAndStatusIn(Integer eventoId, Collection<StatusIngresso> status);

    // Um ingresso válido por pessoa por evento.
    boolean existsByEventoIdAndParticipanteIdAndStatusIn(Integer eventoId, Integer participanteId,
            Collection<StatusIngresso> status);

    boolean existsByEventoId(Integer eventoId);

    boolean existsByParticipanteId(Integer participanteId);
}
