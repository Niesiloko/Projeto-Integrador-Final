package br.edu.unifio.conectaevent.entidades;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Ingresso {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Integer id;

    // Código usado no QR Code e na entrada do evento (gerado pelo sistema).
    @Column (unique = true)
    private String codigo;

    @NotNull (message = "O evento é obrigatório")
    @ManyToOne
    private Evento evento;

    @NotNull (message = "O participante é obrigatório")
    @ManyToOne
    private Usuario participante;

    @NotBlank (message = "O nome do titular é obrigatório")
    @Size (min = 3, max = 100, message = "O nome do titular deve ter entre 3 e 100 caracteres")
    private String titular;

    // Valor pago: copiado do evento no momento da compra.
    private BigDecimal valor;

    @Enumerated (EnumType.STRING)
    private StatusIngresso status;

    private LocalDateTime dataCompra;
}
