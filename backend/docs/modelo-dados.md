# Modelo de dados – Conecta Event

Diagrama de classes das entidades JPA do backend (o GitHub desenha o diagrama automaticamente).

```mermaid
classDiagram
    direction LR

    class Usuario {
        +Integer id
        +String nome
        +String email
        +Perfil perfil
    }

    class Categoria {
        +Integer id
        +String nome
        +String descricao
    }

    class Evento {
        +Integer id
        +String titulo
        +String descricao
        +LocalDateTime dataHora
        +String local
        +BigDecimal valor
        +Integer capacidade
        +String imagem
    }

    class Ingresso {
        +Integer id
        +String codigo
        +String titular
        +BigDecimal valor
        +StatusIngresso status
        +LocalDateTime dataCompra
    }

    class Reembolso {
        +Integer id
        +String motivo
        +StatusReembolso status
        +BigDecimal valor
        +LocalDateTime dataSolicitacao
        +LocalDateTime dataDecisao
    }

    class Perfil {
        <<enumeration>>
        ORGANIZADOR
        PARTICIPANTE
    }

    class StatusIngresso {
        <<enumeration>>
        CONFIRMADO
        REEMBOLSO_SOLICITADO
        REEMBOLSADO
        UTILIZADO
    }

    class StatusReembolso {
        <<enumeration>>
        PENDENTE
        APROVADO
        RECUSADO
    }

    Categoria "1" <-- "0..*" Evento : classifica
    Usuario "1" <-- "0..*" Evento : organiza
    Evento "1" <-- "0..*" Ingresso : é vendido em
    Usuario "1" <-- "0..*" Ingresso : compra
    Ingresso "1" <-- "0..1" Reembolso : solicita
    Usuario ..> Perfil
    Ingresso ..> StatusIngresso
    Reembolso ..> StatusReembolso
```

## Tabelas geradas no MySQL

| Tabela | Chaves estrangeiras | Restrições |
|---|---|---|
| `usuario` | | `email` único |
| `categoria` | | `nome` único |
| `evento` | `categoria_id` → categoria, `organizador_id` → usuario | |
| `ingresso` | `evento_id` → evento, `participante_id` → usuario | `codigo` único |
| `reembolso` | `ingresso_id` → ingresso | `ingresso_id` único (1 pedido por ingresso) |

## Relacionamentos

- **Categoria 1 : N Evento** (`@ManyToOne` em `Evento.categoria`). Todo evento pertence a uma categoria.
- **Usuario 1 : N Evento** (`@ManyToOne` em `Evento.organizador`). Só usuários com perfil ORGANIZADOR podem organizar eventos.
- **Evento 1 : N Ingresso** (`@ManyToOne` em `Ingresso.evento`). A quantidade de ingressos válidos é limitada pela `capacidade` do evento.
- **Usuario 1 : N Ingresso** (`@ManyToOne` em `Ingresso.participante`). Cada participante tem no máximo um ingresso válido por evento.
- **Ingresso 1 : 0..1 Reembolso** (`@OneToOne` em `Reembolso.ingresso`). Cada ingresso pode ter no máximo um pedido de reembolso.

Os relacionamentos são mapeados só do lado "muitos" (unidirecionais). Assim, o JSON das respostas não entra em laço infinito.
