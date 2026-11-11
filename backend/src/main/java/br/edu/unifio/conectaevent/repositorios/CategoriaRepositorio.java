package br.edu.unifio.conectaevent.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;

import br.edu.unifio.conectaevent.entidades.Categoria;

public interface CategoriaRepositorio extends JpaRepository<Categoria, Integer> {

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Integer id);
}
