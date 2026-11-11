package br.edu.unifio.conectaevent.entidades;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Usuario {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank (message = "O nome é obrigatório")
    @Size (min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
    private String nome;

    @NotBlank (message = "O e-mail é obrigatório")
    @Email (message = "O e-mail informado é inválido")
    @Size (max = 120, message = "O e-mail deve ter no máximo 120 caracteres")
    @Column (unique = true)
    private String email;

    @NotNull (message = "O perfil é obrigatório (ORGANIZADOR ou PARTICIPANTE)")
    @Enumerated (EnumType.STRING)
    private Perfil perfil;
}
