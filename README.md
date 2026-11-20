# Conecta Event

**Projeto Integrador IV – Engenharia de Software, 4º termo – UniFIO**

Sistema web de eventos: o **organizador** publica eventos com capacidade limitada e acompanha as vendas num dashboard; o **participante** compra ingressos (com QR Code) e pode pedir reembolso até 48 horas antes do evento, que o organizador aprova ou recusa.

- **Front-end:** Angular 22 + Angular Material (raiz deste repositório)
- **Back-end:** API REST em Spring Boot + MySQL (pasta [`backend/`](backend/README.md))

O front usa a API em todas as telas: os dados ficam no banco MySQL, não no navegador.

## Integrantes

| Nome completo | ID acadêmico |
|---|---|
| Lucas Scalada Noesse | 272362 |
| Kauã Yury Furtado | 272866 |
| Ana Carolina Medeiro | 273548 |
| Ana Clara Correa | 272358 |

## Objetivo do backend

Oferecer uma API REST que guarda os dados do Conecta Event no MySQL e aplica as regras do negócio: controle de capacidade na compra de ingressos (inscrição e controle de participantes), um ingresso por pessoa por evento, limite de 2 reembolsos por pessoa no mesmo evento, reembolso até 48 horas antes com aprovação do organizador, check-in do ingresso na entrada e acesso separado por perfil (organizador e participante). Detalhes no [README do backend](backend/README.md).

## Tecnologias

- **Back-end:** Java 21, Spring Boot 4.1 (Web MVC, Data JPA, Validation, Security com HTTP Basic), MySQL 8, Lombok, Maven
- **Front-end:** Angular 22 (`standalone: false`, NgModules, sem SSR), Angular Material, RxJS
- **Testes da API:** Postman
- **Nuvem:** Render (site e API em Docker) e TiDB Cloud (banco compatível com MySQL)

## Documentação

| Material | Onde |
|---|---|
| Diagrama de classes (documentação técnica, PDF) | [backend/docs/DocumentacaoTecnicaUMLConectaEvent.pdf](backend/docs/DocumentacaoTecnicaUMLConectaEvent.pdf) |
| Modelo de dados | [backend/docs/modelo-dados.md](backend/docs/modelo-dados.md) |
| Endpoints, permissões, regras e consultas | [backend/docs/documentacao-api.md](backend/docs/documentacao-api.md) |
| Coleção Postman (com variáveis e respostas salvas) | [backend/postman/conecta-event.postman_collection.json](backend/postman/conecta-event.postman_collection.json) |
| Configurar e executar o backend | [backend/README.md](backend/README.md) |
| Publicar na nuvem | [PUBLICACAO.md](PUBLICACAO.md) |

## Aplicação publicada

- **Repositório:** https://github.com/lucas-noesse/Projeto-Integrador-Final
- **Site:** https://conecta-event.onrender.com
- **API:** https://conecta-event-api.onrender.com (exemplo: [`/eventos/futuros`](https://conecta-event-api.onrender.com/eventos/futuros))

Hospedagem: site e API no [Render](https://render.com) (plano gratuito) e banco MySQL no [TiDB Cloud](https://tidbcloud.com) (compatível com MySQL, plano Starter gratuito).

**Acesso para teste:** organizador `ana@conectaevent.com` / `organizador123` · participante `carla@email.com` / `participante123` (as contas também aparecem na tela de login; clique nelas para preencher). Veja abaixo o que cada perfil acessa.

O **pagamento é simulado** (projeto acadêmico): na compra, o participante escolhe Pix (QR Code de demonstração) ou cartão (use `4111 1111 1111 1111`, qualquer validade futura e qualquer CVV). Nenhuma cobrança é feita e os dados do cartão não são enviados à API.

O primeiro acesso pode levar até 2 minutos: no plano gratuito, a API "dorme" quando não é usada (o site avisa enquanto ela acorda). Ao acordar, os dados voltam aos exemplos iniciais.

Passo a passo de como publicar: [PUBLICACAO.md](PUBLICACAO.md).

## Como rodar o sistema completo

No GitHub Codespaces (o `.devcontainer` já instala Java, Maven, MySQL e Node), abra **dois terminais**:

```bash
# Terminal 1 – API (porta 8080)
cd backend
./mvnw spring-boot:run
```

```bash
# Terminal 2 – site (porta 4200)
npm install
npm start
```

Abra a porta **4200**. O Angular repassa as chamadas `/api/...` para a API na porta 8080 (arquivo `proxy.conf.json`), então não é preciso deixar a porta 8080 pública.

A cada início da API, o banco volta aos dados de exemplo (`backend/src/main/resources/import.sql`).

### Contas de teste

| Perfil | E-mail | Senha | O que vê no menu |
|---|---|---|---|
| Organizador | `ana@conectaevent.com` | `organizador123` | Dashboard, Criar evento, Meus eventos, Categorias |
| Participante | `carla@email.com` | `participante123` | Meus ingressos |

Na tela de cadastro, a pessoa escolhe se quer ser organizador ou participante. Sem login, dá para ver a vitrine de eventos e os detalhes de cada um.

### Endereço da API

- Desenvolvimento (`npm start`): `/api`, pelo proxy, em `src/environments/environment.ts`.
- Produção (`ng build`): endereço público da API, em `src/environments/environment.production.ts`.

## Comandos do front-end

| Comando | O que faz |
|---|---|
| `npm install` | Instala as dependências (só na primeira vez) |
| `npm start` | Roda o site em modo de desenvolvimento em `http://localhost:4200` (com o proxy para a API) |
| `npm run build` | Gera a versão de produção em `dist/conecta-event/browser` |
