package br.edu.unifio.conectaevent.repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.edu.unifio.conectaevent.entidades.Reembolso;
import br.edu.unifio.conectaevent.entidades.StatusReembolso;

public interface ReembolsoRepositorio extends JpaRepository<Reembolso, Integer> {

    // Consulta derivada: reembolsos por situação.
    List<Reembolso> findByStatusOrderByDataSolicitacao(StatusReembolso status);

    // Consulta JPQL: pedidos dos eventos de um organizador, numa situação.
    // Navega Reembolso -> Ingresso -> Evento -> Organizador.
    @Query ("""
            select r from Reembolso r
            where r.ingresso.evento.organizador.id = :organizadorId
              and r.status = :status
            order by r.dataSolicitacao
            """)
    List<Reembolso> buscarPorOrganizadorEStatus(@Param ("organizadorId") Integer organizadorId,
            @Param ("status") StatusReembolso status);

    boolean existsByIngressoId(Integer ingressoId);
}
