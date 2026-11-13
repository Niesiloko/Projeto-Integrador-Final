# Publicação na nuvem – passo a passo

O sistema tem três partes, e cada uma vai para um serviço gratuito:

| Parte | Serviço | Plano |
|---|---|---|
| Banco de dados (MySQL) | [TiDB Cloud](https://tidbcloud.com) – compatível com MySQL | Starter (gratuito) |
| API (Spring Boot) | [Render](https://render.com) – Web Service com Docker | Free |
| Site (Angular) | [Render](https://render.com) – Static Site | Free |

Faça na ordem: **banco → API → site**. Cada parte precisa do endereço da anterior.

> **Importante sobre o plano gratuito do Render:** a API "dorme" depois de 15 minutos sem uso. O próximo acesso a acorda, o que leva de 1 a 2 minutos (o site mostra o aviso "Acordando o servidor..."). Ao acordar, a API recria as tabelas e recarrega os dados de exemplo do `import.sql`, então o sistema sempre volta ao estado inicial.

---

## 1. Banco de dados (TiDB Cloud)

1. Acesse **https://tidbcloud.com** e crie a conta (pode entrar com o GitHub ou Google).
2. Crie um cluster do tipo **Starter** (gratuito).
   - Provedor: **AWS**. Região: **N. Virginia (us-east-1)** — a mesma região em que vamos colocar a API no Render, para ficarem perto.
   - Nome: `conecta-event`.
3. Com o cluster criado, clique em **Connect**.
   - Clique em **Generate Password** e **guarde a senha** (ela só aparece uma vez).
   - Anote o **Host**, a **Port** (normalmente `4000`) e o **User** (algo como `xxxxxxxx.root`).
4. Monte o endereço de conexão (**DB_URL**), trocando `SEU_HOST` pelo host anotado:

   ```
   jdbc:mysql://SEU_HOST:4000/conectaevent?createDatabaseIfNotExist=true&sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3
   ```

   (`sslMode=VERIFY_IDENTITY` liga a conexão criptografada, que o TiDB Cloud exige.)

Você vai usar três valores no próximo passo: **DB_URL**, **User** e **senha**.

## 2. API (Render – Web Service)

1. Acesse **https://render.com** e entre com a conta do **GitHub** (a dona do repositório).
2. Clique em **New → Web Service** e escolha o repositório **Projeto-Integrador-Final** (se ele não aparecer, clique em *Configure account* e libere o acesso a ele).
3. Preencha:

   | Campo | Valor |
   |---|---|
   | Name | `conecta-event-api` |
   | Region | **Virginia (US East)** |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Language / Runtime | **Docker** (o Render encontra o `backend/Dockerfile`) |
   | Instance Type | **Free** |

4. Em **Environment Variables**, adicione:

   | Key | Value |
   |---|---|
   | `DB_URL` | o endereço montado no passo 1.4 |
   | `DB_USERNAME` | o User do TiDB (`xxxxxxxx.root`) |
   | `DB_PASSWORD` | a senha gerada no TiDB |

5. Clique em **Deploy Web Service**. O primeiro build leva uns 5 a 10 minutos (o Maven baixa as dependências).
6. Quando aparecer **Live**, copie o endereço da API no topo da página (algo como `https://conecta-event-api.onrender.com`).
7. Teste no navegador: `https://SEU-ENDERECO.onrender.com/eventos/futuros` deve mostrar uma lista de eventos em JSON.

> Se o endereço for **diferente** de `https://conecta-event-api.onrender.com` (o Render acrescenta letras quando o nome já está em uso), troque o valor em `src/environments/environment.production.ts`, faça commit e push **antes** do passo 3.

## 3. Site (Render – Static Site)

1. No Render, clique em **New → Static Site** e escolha o mesmo repositório.
2. Preencha:

   | Campo | Valor |
   |---|---|
   | Name | `conecta-event` |
   | Branch | `main` |
   | Root Directory | *(deixe vazio)* |
   | Build Command | `npm ci && npm run build` |
   | Publish Directory | `dist/conecta-event/browser` |

3. Em **Environment Variables**, adicione `NODE_VERSION` = `22` (versão do Node exigida pelo Angular 22).
4. Clique em **Deploy Static Site**.
5. Quando terminar, abra o menu **Redirects/Rewrites** do site e crie a regra:

   | Source | Destination | Action |
   |---|---|---|
   | `/*` | `/index.html` | **Rewrite** |

   Sem essa regra, abrir um endereço interno direto (ex.: `/eventos/meus-ingressos`) ou apertar F5 numa tela dá erro 404: quem conhece as rotas é o Angular, e ele está no `index.html`.

6. O endereço do site aparece no topo (algo como `https://conecta-event.onrender.com`). **Esse é o link para entregar.**

## 4. Conferir antes de entregar

O enunciado pede para executar o fluxo principal pelo link publicado. Abra o site e faça:

1. Na Home, espere os eventos aparecerem (o primeiro acesso acorda a API).
2. Entre como **participante** (`carla@email.com` / `participante123`), compre um ingresso e peça um reembolso.
3. Saia e entre como **organizador** (`ana@conectaevent.com` / `organizador123`); em **Meus eventos**, aprove o reembolso; crie um evento.
4. Aperte **F5** em alguma tela interna para conferir a regra do passo 3.5.

## Atualizações

A cada push na branch `main`, o Render publica a nova versão da API e do site sozinho.

## Se algo der errado

- **API não sobe (Deploy failed):** abra a aba **Logs** do serviço no Render. Erro com `Access denied` ou `Communications link failure` indica DB_URL, usuário ou senha errados.
- **Site abre, mas não mostra eventos:** confira se o endereço em `environment.production.ts` é o mesmo da API e se a API responde em `/eventos/futuros`.
