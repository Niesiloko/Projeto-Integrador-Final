# Documentação da API – Conecta Event

URL base: `http://localhost:8080`. Todas as rotas exigem autenticação **HTTP Basic**.

| Usuário | Senha | Perfil |
|---|---|---|
| `organizador` | `organizador123` | ORGANIZADOR |
| `participante` | `participante123` | PARTICIPANTE |

## Permissões

| Operação | Quem pode |
|---|---|
| Qualquer `GET` | Qualquer usuário autenticado |
| `POST`/`PUT`/`DELETE` em `/categorias`, `/eventos` e `/usuarios` | ORGANIZADOR |
| `POST /ingressos/check-in/{codigo}` | ORGANIZADOR |
| `POST /reembolsos/{id}/aprovar` e `/recusar` | ORGANIZADOR |
| `POST`/`PUT`/`DELETE` em `/ingressos` e `/reembolsos` | PARTICIPANTE |

Sem credenciais ou com senha errada, a resposta é **401 Unauthorized**. Com um usuário autenticado sem o perfil exigido, é **403 Forbidden**.

## Códigos de resposta

| Código | Quando |
|---|---|
| 200 OK | Consulta ou atualização bem-sucedida |
| 201 Created | Registro criado |
| 204 No Content | Registro excluído |
| 400 Bad Request | Dados inválidos (Bean Validation), JSON malformado ou parâmetro com tipo errado |
| 401 Unauthorized | Sem autenticação ou credenciais inválidas |
| 403 Forbidden | Perfil sem permissão |
| 404 Not Found | Registro não encontrado |
| 409 Conflict | Regra de negócio violada ou dado duplicado |

Formato dos erros:

```json
{
  "momento": "2026-11-11T20:15:00",
  "status": 400,
  "erro": "Bad Request",
  "mensagem": "Dados inválidos. Verifique os campos informados.",
  "caminho": "/eventos",
  "campos": {
    "titulo": "O título é obrigatório",
    "capacidade": "A capacidade deve ser de pelo menos 1 pessoa"
  }
}
```

---

## Categorias – `/categorias`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/categorias` | Lista as categorias (ordem alfabética) |
| GET | `/categorias/{id}` | Busca uma categoria |
| POST | `/categorias` | Cria uma categoria |
| PUT | `/categorias/{id}` | Atualiza uma categoria |
| DELETE | `/categorias/{id}` | Exclui uma categoria (409 se houver eventos nela) |

```json
{ "nome": "Gastronomia", "descricao": "Festivais e feiras gastronômicas" }
```

## Usuários – `/usuarios`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/usuarios?perfil=ORGANIZADOR` | Lista os usuários, com filtro opcional por perfil |
| GET | `/usuarios/{id}` | Busca um usuário |
| GET | `/usuarios/{id}/eventos` | Eventos organizados pelo usuário |
| GET | `/usuarios/{id}/ingressos` | Ingressos comprados pelo usuário |
| GET | `/usuarios/{id}/reembolsos?status=PENDENTE` | Reembolsos dos eventos do organizador (padrão: PENDENTE) |
| POST | `/usuarios` | Cria um usuário (409 se o e-mail já existir) |
| PUT | `/usuarios/{id}` | Atualiza um usuário |
| DELETE | `/usuarios/{id}` | Exclui um usuário (409 se ele tiver eventos ou ingressos) |

```json
{ "nome": "Fernanda Alves", "email": "fernanda@email.com", "perfil": "PARTICIPANTE" }
```

## Eventos – `/eventos`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/eventos` | Lista todos os eventos (por data) |
| GET | `/eventos?categoriaId=1` | Eventos de uma categoria |
| GET | `/eventos?titulo=rock` | Busca por parte do título |
| GET | `/eventos/futuros` | Só os eventos que ainda vão acontecer |
| GET | `/eventos/{id}` | Busca um evento |
| GET | `/eventos/{id}/vagas` | Capacidade, vendidos, disponíveis e se está esgotado |
| GET | `/eventos/{id}/ingressos?status=CONFIRMADO` | Lista de participantes do evento |
| POST | `/eventos` | Cria um evento |
| PUT | `/eventos/{id}` | Atualiza um evento |
| DELETE | `/eventos/{id}` | Exclui um evento (409 se já tiver ingressos) |

```json
{
  "titulo": "Palestra de Spring Boot",
  "descricao": "Introdução a APIs REST com Spring Boot.",
  "dataHora": "2027-06-20T19:00:00",
  "local": "Auditório - UniFIO",
  "valor": 30.00,
  "capacidade": 80,
  "imagem": null,
  "categoria": { "id": 2 },
  "organizador": { "id": 1 }
}
```

## Ingressos – `/ingressos`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/ingressos` | Lista os ingressos |
| GET | `/ingressos/{id}` | Busca um ingresso |
| POST | `/ingressos` | **Compra** um ingresso (o código, o valor e o status são gerados pelo sistema) |
| PUT | `/ingressos/{id}` | Altera o nome do titular (só ingressos CONFIRMADOS) |
| DELETE | `/ingressos/{id}` | Exclui um ingresso (409 se já tiver sido utilizado ou tiver reembolso) |
| POST | `/ingressos/check-in/{codigo}` | Valida o ingresso na entrada do evento (marca como UTILIZADO) |

```json
{ "evento": { "id": 5 }, "participante": { "id": 3 }, "titular": "Carla Mendes" }
```

No `PUT`, o corpo é o mesmo, mas só o `titular` é alterado.

## Reembolsos – `/reembolsos`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/reembolsos?status=PENDENTE` | Lista os reembolsos, com filtro opcional por status |
| GET | `/reembolsos/{id}` | Busca um reembolso |
| POST | `/reembolsos` | Solicita reembolso de um ingresso |
| PUT | `/reembolsos/{id}` | Altera o motivo (só enquanto PENDENTE) |
| DELETE | `/reembolsos/{id}` | Desiste do pedido (só PENDENTE): o ingresso volta a CONFIRMADO |
| POST | `/reembolsos/{id}/aprovar` | Organizador aprova: ingresso REEMBOLSADO e vaga liberada |
| POST | `/reembolsos/{id}/recusar` | Organizador recusa: ingresso volta a CONFIRMADO |

```json
{ "ingresso": { "id": 1 }, "motivo": "Tive um imprevisto de saúde na família." }
```

---

## Regras de negócio (camada Service)

| Regra | Onde | Resposta |
|---|---|---|
| Não vender ingresso além da capacidade do evento | `IngressoServico.comprar` | 409 |
| Um ingresso válido por participante por evento | `IngressoServico.comprar` | 409 |
| No máximo 2 reembolsos por participante no mesmo evento; depois disso, a compra é bloqueada | `IngressoServico.comprar` | 409 |
| Não vender ingresso de evento que já aconteceu | `IngressoServico.comprar` | 409 |
| Reembolso só até 48 horas antes do evento, com devolução integral | `ReembolsoServico.solicitar` | 409 |
| Só ingressos CONFIRMADOS podem pedir reembolso, e só um pedido por ingresso | `ReembolsoServico.solicitar` | 409 |
| Reembolso só pode ser aprovado, recusado, alterado ou cancelado enquanto PENDENTE | `ReembolsoServico` | 409 |
| Check-in só de ingresso CONFIRMADO (não reutilizável) | `IngressoServico.validarEntrada` | 409 |
| Só usuários com perfil ORGANIZADOR organizam eventos | `EventoServico` | 409 |
| A capacidade não pode ficar menor que os ingressos já vendidos | `EventoServico.atualizar` | 409 |
| Não excluir categoria com eventos, evento com ingressos ou usuário com eventos ou ingressos | Serviços de cada entidade | 409 |
| E-mail de usuário e nome de categoria não se repetem | `UsuarioServico`, `CategoriaServico` | 409 |

## Consultas personalizadas (Spring Data JPA)

| Consulta | Tipo | Repositório |
|---|---|---|
| Eventos por categoria | Método derivado | `EventoRepositorio.findByCategoriaIdOrderByDataHora` |
| Eventos por parte do título | Método derivado | `EventoRepositorio.findByTituloContainingIgnoreCaseOrderByDataHora` |
| Eventos futuros | `@Query` (JPQL) | `EventoRepositorio.buscarFuturos` |
| Ingressos de um participante | Método derivado | `IngressoRepositorio.findByParticipanteIdOrderByDataCompraDesc` |
| Ingressos de um evento por status | Método derivado | `IngressoRepositorio.findByEventoIdAndStatusOrderByTitular` |
| Contagem de vagas ocupadas | Método derivado (`count`) | `IngressoRepositorio.countByEventoIdAndStatusIn` |
| Usuários por perfil | Método derivado | `UsuarioRepositorio.findByPerfilOrderByNome` |
| Reembolsos dos eventos de um organizador | `@Query` (JPQL) | `ReembolsoRepositorio.buscarPorOrganizadorEStatus` |
