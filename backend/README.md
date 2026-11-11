# Conecta Event – Backend REST

**Projeto Integrador – Engenharia de Software, 4º termo – UniFIO**
Disciplina: Padrões de Desenvolvimento Web

## Descrição

O **Conecta Event** é um sistema web de eventos. O organizador publica eventos, o participante compra ingressos (com código para QR Code) e pode pedir reembolso, e o organizador aprova ou recusa o pedido e valida os ingressos na entrada.

O front-end em Angular fica na raiz deste repositório. Esta pasta (`backend/`) contém a API REST.

## Objetivo do backend

Oferecer uma API REST que guarda os dados do Conecta Event num banco MySQL e aplica as regras do negócio:

- controle de capacidade na compra de ingressos (inscrição e controle de participantes);
- um ingresso por pessoa por evento;
- reembolso integral até 48 horas antes do evento, com aprovação do organizador;
- check-in do ingresso na entrada do evento;
- acesso separado por perfil (organizador e participante).

Este projeto partiu do [projeto de e-commerce da disciplina](https://github.com/sergiodelfino/ecommerce-backend-4a/tree/main/ecommerce) e foi adaptado ao domínio de eventos.

## Tecnologias

- Java 21
- Spring Boot 4.1 (Web MVC, Data JPA, Validation, Security)
- MySQL 8
- Lombok
- Maven (wrapper `mvnw`)
- Postman (testes da API)

## Estrutura

```
backend/
├── pom.xml
├── docs/
│   ├── modelo-dados.md         diagrama de classes e relacionamentos
│   └── documentacao-api.md     endpoints, permissões, regras e consultas
├── postman/
│   └── conecta-event.postman_collection.json
└── src/main/java/br/edu/unifio/conectaevent/
    ├── entidades/      Usuario, Categoria, Evento, Ingresso, Reembolso e enums
    ├── repositorios/   acesso a dados (Spring Data JPA) e consultas personalizadas
    ├── servicos/       regras de negócio
    ├── recursos/       controllers REST
    ├── excecoes/       exceções personalizadas e @RestControllerAdvice
    ├── configuracoes/  Spring Security (HTTP Basic, usuários em memória)
    └── dtos/           respostas que não são entidades (vagas do evento)
```

Os controllers (`recursos`) só chamam os serviços. Os serviços acessam os repositórios.

## Como executar

### No GitHub Codespaces (recomendado)

O repositório tem um `.devcontainer` com Java 21, Maven, MySQL e Node.js. Ao criar o Codespace, o MySQL é iniciado e o banco `conectaevent` é criado automaticamente.

```bash
cd backend
./mvnw spring-boot:run
```

A API fica em `http://localhost:8080`. Na primeira execução, o Maven baixa as dependências, o que pode levar alguns minutos.

### Na máquina local

1. Instale o Java 21 e o MySQL 8.
2. Crie o banco e o usuário:
   ```sql
   CREATE DATABASE conectaevent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'conecta'@'%' IDENTIFIED BY 'conecta123';
   GRANT ALL PRIVILEGES ON conectaevent.* TO 'conecta'@'%';
   ```
3. Na pasta `backend`, rode `./mvnw spring-boot:run` (no Windows: `mvnw.cmd spring-boot:run`).

### Dados de exemplo

A cada início, as tabelas são recriadas (`ddl-auto=create`) e o arquivo `src/main/resources/import.sql` carrega 5 usuários, 5 categorias, 5 eventos, 6 ingressos e 1 reembolso pendente. As datas dos eventos são relativas ao dia atual:

- o evento 3 (Corrida Noturna) acontece em 1 dia, para demonstrar o prazo de reembolso de 48 horas;
- o evento 4 (Workshop de Angular) tem capacidade 2 e já está esgotado.

## Usuários de teste (HTTP Basic)

| Usuário | Senha | Perfil | Pode |
|---|---|---|---|
| `organizador` | `organizador123` | ORGANIZADOR | cadastrar categorias, eventos e usuários; aprovar ou recusar reembolsos; fazer check-in |
| `participante` | `participante123` | PARTICIPANTE | comprar ingressos; pedir, alterar e cancelar reembolso |

Os dois perfis podem fazer qualquer consulta (`GET`). As senhas são apenas de teste.

## Testes com Postman

1. Importe `postman/conecta-event.postman_collection.json` no Postman.
2. Inicie a API (o banco volta aos dados de exemplo).
3. Execute as pastas **na ordem** (01 a 06). Os ids usados nas requisições contam com essa ordem.

As variáveis (`baseUrl`, usuários e senhas) estão na própria coleção.

## Documentação

- [Modelo de dados (diagrama de classes)](docs/modelo-dados.md)
- [Endpoints, permissões, regras de negócio e consultas](docs/documentacao-api.md)

## Integrantes

| Nome completo | ID acadêmico |
|---|---|
| _preencher_ | _preencher_ |
| _preencher_ | _preencher_ |
| _preencher_ | _preencher_ |
| _preencher_ | _preencher_ |
