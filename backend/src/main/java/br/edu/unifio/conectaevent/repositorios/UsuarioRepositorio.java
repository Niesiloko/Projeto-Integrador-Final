package br.edu.unifio.conectaevent.repositorios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.edu.unifio.conectaevent.entidades.Perfil;
import br.edu.unifio.conectaevent.entidades.Usuario;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Integer> {

    // Consulta derivada: usuários de um perfil (ex.: só os organizadores).
    List<Usuario> findByPerfilOrderByNome(Perfil perfil);

    // Usado no login: o e-mail é o nome de usuário do HTTP Basic.
    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Integer id);
}
