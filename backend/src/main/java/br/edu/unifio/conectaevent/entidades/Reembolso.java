package br.edu.unifio.conectaevent.entidades;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Reembolso {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Integer id;

    // Cada ingresso pode ter no máximo um pedido de reembolso.
    @NotNull (message = "O ingresso é obrigatório")
    @OneToOne
    @JoinColumn (unique = true)
    private Ingresso ingresso;

    @NotBlank (message = "O motivo é obrigatório")
    @Size (min = 5, max = 500, message = "O motivo deve ter entre 5 e 500 caracteres")
    private String motivo;

    @Enumerated (EnumType.STRING)
    private StatusReembolso status;

    // Valor a devolver: integral, igual ao valor pago no ingresso.
    private BigDecimal valor;

    private LocalDateTime dataSolicitacao;

    private LocalDateTime dataDecisao;
}
