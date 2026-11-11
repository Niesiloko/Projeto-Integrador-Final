package br.edu.unifio.conectaevent.entidades;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Categoria {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank (message = "O nome da categoria é obrigatório")
    @Size (min = 2, max = 50, message = "O nome deve ter entre 2 e 50 caracteres")
    @Column (unique = true)
    private String nome;

    @Size (max = 255, message = "A descrição deve ter no máximo 255 caracteres")
    private String descricao;
}
