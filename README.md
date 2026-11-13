# ConectaEvent

Sistema web de eventos: o **organizador** publica eventos e acompanha as vendas; o **participante** compra ingressos (com QR Code) e pode pedir reembolso.

- **Front-end:** Angular 22 + Angular Material (esta pasta)
- **Back-end:** API REST em Spring Boot + MySQL (pasta [`backend/`](backend/README.md))

O front usa a API em todas as telas: os dados ficam no MySQL, não no navegador.

## Aplicação publicada

- **Site:** _preencher com o link do Render_
- **API:** _preencher com o link do Render_

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

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
