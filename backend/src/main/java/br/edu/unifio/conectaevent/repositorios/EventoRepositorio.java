package br.edu.unifio.conectaevent.repositorios;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.edu.unifio.conectaevent.entidades.Evento;

public interface EventoRepositorio extends JpaRepository<Evento, Integer> {

    // Consulta derivada: eventos de uma categoria, do mais próximo ao mais distante.
    List<Evento> findByCategoriaIdOrderByDataHora(Integer categoriaId);

    // Consulta derivada: busca por parte do título, sem diferenciar maiúsculas.
    List<Evento> findByTituloContainingIgnoreCaseOrderByDataHora(String titulo);

    // Consulta JPQL: eventos que ainda vão acontecer (a "vitrine" do site).
    @Query ("select e from Evento e where e.dataHora > :agora order by e.dataHora")
    List<Evento> buscarFuturos(@Param ("agora") LocalDateTime agora);

    List<Evento> findByOrganizadorIdOrderByDataHora(Integer organizadorId);

    boolean existsByCategoriaId(Integer categoriaId);

    boolean existsByOrganizadorId(Integer organizadorId);
}
