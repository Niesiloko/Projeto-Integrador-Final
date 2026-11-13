# Conecta Event – Backend REST

**Projeto Integrador – Engenharia de Software, 4º termo – UniFIO**
Disciplina: Padrões de Desenvolvimento Web

## Descrição

O **Conecta Event** é um sistema web de eventos. O organizador publica eventos, o participante compra ingressos (com código para QR Code) e pode pedir reembolso, e o organizador aprova ou recusa o pedido e valida os ingressos na entrada.

O front-end em Angular fica na raiz deste repositório. Esta pasta (`backend/`) contém a API REST.

## Objetivo do backend

Oferecer uma API REST que guarda os dados do Conecta Event num banco MySQL e aplica as regras do negócio:

- controle de capacidade na compra de ingressos (inscrição e controle de participantes);
- um ingresso por pessoa por evento, e no máximo 2 reembolsos por pessoa no mesmo evento;
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
    ├── configuracoes/  Spring Security (HTTP Basic com os usuários do banco, CORS)
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

### Na nuvem (Docker)

O `Dockerfile` desta pasta compila e roda a API num container (usado no Render). A conexão com o banco vem de variáveis de ambiente; sem elas, valem os padrões do Codespaces:

| Variável | Padrão (Codespaces) |
|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/conectaevent?createDatabaseIfNotExist=true` |
| `DB_USERNAME` | `conecta` |
| `DB_PASSWORD` | `conecta123` |
| `PORT` | `8080` |

O container ativa o perfil `nuvem` (`application-nuvem.properties`): sem SQL no log e com o fuso de Brasília no banco e no Java, para a regra das 48 horas não errar em 3 horas. Passo a passo da publicação: [PUBLICACAO.md](../PUBLICACAO.md).

### Dados de exemplo

A cada início, as tabelas são recriadas (`ddl-auto=create`) e o arquivo `src/main/resources/import.sql` carrega 5 usuários, 5 categorias, 5 eventos, 6 ingressos e 1 reembolso pendente. As datas dos eventos são relativas ao dia atual:

- o evento 3 (Corrida Noturna) acontece em 1 dia, para demonstrar o prazo de reembolso de 48 horas;
- o evento 4 (Workshop de Angular) tem capacidade 2 e já está esgotado.

## Usuários de teste (HTTP Basic)

O login usa os usuários da tabela `usuario`: o **nome de usuário é o e-mail** e o perfil do usuário define o que ele pode fazer. As senhas ficam guardadas como hash **BCrypt** (nunca em texto puro) e não aparecem nas respostas da API.

| E-mail | Senha | Perfil | Pode |
|---|---|---|---|
| `ana@conectaevent.com` | `organizador123` | ORGANIZADOR | cadastrar categorias, eventos e usuários; aprovar ou recusar reembolsos; fazer check-in |
| `bruno@conectaevent.com` | `organizador123` | ORGANIZADOR | o mesmo |
| `carla@email.com` | `participante123` | PARTICIPANTE | comprar ingressos; pedir, alterar e cancelar reembolso |
| `diego@email.com`, `elisa@email.com` | `participante123` | PARTICIPANTE | o mesmo |

Os dois perfis podem fazer qualquer consulta (`GET`). As senhas são apenas de teste.
Novos usuários podem criar a própria conta pela rota pública `POST /usuarios/cadastro` (é o que a tela de cadastro do site usa).

## Testes com Postman

1. Importe `postman/conecta-event.postman_collection.json` no Postman.
2. Inicie a API (o banco volta aos dados de exemplo).
3. Execute as pastas **na ordem** (01 a 06). Os ids usados nas requisições contam com essa ordem.

As variáveis (`baseUrl`, usuários e senhas) estão na própria coleção.

## Integração com o front-end

O front-end Angular (raiz do repositório) usa esta API em todas as telas; os dados não ficam mais no navegador.

- **Login:** a tela de login chama `GET /usuarios/me` com o e-mail e a senha (HTTP Basic). Se a API aceitar, o front guarda o usuário e envia a credencial em todas as requisições seguintes (interceptor `src/app/shared/auth.interceptor.ts`).
- **Rotas públicas:** a vitrine (`GET /eventos/futuros`, `/eventos/{id}` e `/eventos/{id}/vagas`) e o cadastro (`POST /usuarios/cadastro`) funcionam sem login.
- **CORS:** liberado para o front poder chamar a API de outro endereço.
- **Janela de login do navegador:** quando a requisição vem do front (cabeçalho `X-Requested-With`), o 401 não traz o `WWW-Authenticate`, e a mensagem de erro aparece na própria tela.

Como rodar os dois juntos: veja o [README principal](../README.md).

## Documentação

- [Modelo de dados (diagrama de classes)](docs/modelo-dados.md)
- [Endpoints, permissões, regras de negócio e consultas](docs/documentacao-api.md)

## Integrantes

| Nome completo  | ID acadêmico |
|---|---|
| Lucas Scalada Noesse | 272362 |
| Kauã Yury Furtado    | 272866 |
| Ana Carolina Medeiro | 273548 |
| Ana Clara Correa     | 272358 |
