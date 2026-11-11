package br.edu.unifio.conectaevent.entidades;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Evento {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank (message = "O título é obrigatório")
    @Size (min = 3, max = 120, message = "O título deve ter entre 3 e 120 caracteres")
    private String titulo;

    @Size (max = 2000, message = "A descrição deve ter no máximo 2000 caracteres")
    @Column (length = 2000)
    private String descricao;

    @NotNull (message = "A data e hora do evento são obrigatórias")
    @Future (message = "A data do evento deve estar no futuro")
    private LocalDateTime dataHora;

    @NotBlank (message = "O local é obrigatório")
    @Size (max = 150, message = "O local deve ter no máximo 150 caracteres")
    @Column (name = "local_evento") // "local" é palavra-chave no MySQL
    private String local;

    @NotNull (message = "O valor do ingresso é obrigatório")
    @DecimalMin (value = "0.00", message = "O valor do ingresso não pode ser negativo")
    private BigDecimal valor;

    @NotNull (message = "A capacidade é obrigatória")
    @Min (value = 1, message = "A capacidade deve ser de pelo menos 1 pessoa")
    @Max (value = 100000, message = "A capacidade deve ser de no máximo 100000 pessoas")
    private Integer capacidade;

    @Size (max = 500, message = "O endereço da imagem deve ter no máximo 500 caracteres")
    private String imagem;

    @NotNull (message = "A categoria é obrigatória")
    @ManyToOne
    private Categoria categoria;

    @NotNull (message = "O organizador é obrigatório")
    @ManyToOne
    private Usuario organizador;
}
