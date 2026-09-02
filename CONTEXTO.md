# CONTEXTO DO PROJETO — Inventário de Redes Wi-Fi

> Leia este arquivo ao iniciar uma nova sessão neste projeto. Ele resume tudo
> o que foi feito, configurado e pendente para continuar SEM perguntar ao usuário
> o que já foi definido antes.

## 📍 Onde o projeto está
- Pasta: **`G:\meu-projeto`**
- Repositório: `github.com/luizfernandodiaspeixoto-max/inventario-do-wifi.git`
- Site em produção: **https://inventariodowifi.vercel.app**

## 🔐 Credenciais do admin (produção e local)
- Login: `luiz.peixoto@oi.net.br`
- Senha: `21wqsaxz`

## 🗄️ Upstash Redis (banco de usuários/visitas)
- `UPSTASH_REDIS_REST_URL=https://distinct-terrapin-174656.upstash.io`
- `UPSTASH_REDIS_REST_TOKEN` → valor no `G:\meu-projeto\.env.local` e no Vercel
  (não colocar segredos neste arquivo — o GitHub bloqueia push com tokens)
- Já testado (ping: PONG). Admin criado. Usuário de teste foi removido.

## ✉️ Envio de email — EMAILJS (atual)
- **EmailJS** (gratuito, 200 emails/mês): `EMAILJS_SERVICE_ID`, `EMAILJS_PUBLIC_KEY`,
  `EMAILJS_PRIVATE_KEY` no `.env.local` e no Vercel.
  - Dois templates: `EMAILJS_TEMPLATE_UPDATE` (atualização da página, `template_9r13m4s`)
    e `EMAILJS_TEMPLATE_NEWUSER` (novo usuário/senha, `template_usfk3qg`).
  - `lib/email.js` (`sendMail({ to, subject, text, template })`) escolhe o template por `template`:
    `'update'` → atualização da página; sem template/`'newuser'` → novo usuário.
  - Endpoint `send-update-alert` (admin.js) usa `template: 'update'`.
- Histórico: Resend (modo teste, não entregava) → Brevo (precisava SMS para criar chave, não recebia)
  → Mailjet (conta bloqueada) → EmailJS (funcionando).

## ✉️ Envio de email — BREVO/Resend (histórico, NÃO usar)
- **Brevo** (300 emails/dia): **não funcionou** — pede confirmação por SMS para criar a API key,
  e o usuário não recebe o SMS no Brasil.
- **Resend**: modo teste — só entrega para email verificado na conta. Não usar como principal.

## 🔐 Outras env vars (em G:\meu-projeto\.env.local e no Vercel)
- `ADMIN_EMAIL=luiz.peixoto@oi.net.br`
- `JWT_SECRET` → no `.env.local` e Vercel
- `ADMIN_SECRET` → no `.env.local` e Vercel
- `SITE_URL=https://inventariodowifi.vercel.app`

## 🚀 Como rodar local
1. Duplo clique em `G:\meu-projeto\Atualizar Projeto.bat` (ou atalho na Área de
   Trabalho "Inventario Wi-Fi")
2. OU no terminal:
```
cd G:\meu-projeto
vercel dev --port 3333
```
3. Site local: http://localhost:3333

## 📊 Como atualizar dados (CSV/Excel)
Substituir arquivos em `public/data/`, manter os MESMOS nomes e push:
```
git add public/data/
git commit -m "Atualiza inventário"
git push
```

## ⚙️ Como publicar no Vercel (produção)
```
cd G:\meu-projeto
vercel --prod --yes
vercel alias set <URL-NEW-DEPLOY> inventariodowifi.vercel.app
```
> ⚠️ Sempre conferir se o novo deploy está na URL `inventariodowifi.vercel.app`
> (o Vercel às vezes cria alias diferente).

## ✅ Já implementado / concluído
- Sistema de login via email + senha (tokens JWT, 30 dias)
- Pedido de acesso por nome + email (botão "Solicitar acesso")
- **Email ao admin quando alguém solicita acesso** — ao salvar o pedido, enviado email para
  `luiz.peixoto@oi.net.br` com nome/email do solicitante e link para o painel (`api/public.js`)
- Painel admin: aprovar/recusar pedidos, listar usuários, nova senha, remover acesso, criar usuário
- Seed do admin por endpoint protegido
- Contador de visitas exibido no painel admin (total + hoje) — API `api/sessions.js`
- Registro e exportação de sessões (Excel/PDF/CSV) no painel admin
- **Notificar usuários:** botão no painel admin para marcar usuários e enviar email de alerta de atualização da página (assunto/mensagem técnicos padrão, assinado por Luiz Fernando)
- Logo Oi substituído por logo WiFi (`public/logo-wifi.svg`)
- Botão "Administração" movido para o cabeçalho (ao lado de "Atualizar dados")
- Atalhos de atualização: `atualizar.ps1`, `Atualizar Projeto.bat`, atalho na Área de Trabalho

## 🧭 Endpoints atuais (importante)
- Login/logout/check-admin/visitas: `/api/auth?action=login|logout|check-admin|visits`
- Solicitar acesso: `/api/public?action=request-access` (⚠️ já foi `api/request-access` — rota que não existe)
- Adm: `/api/admin?action=approve|deny|create-user|send-password|revoke|send-update-alert|pending|users|visits`
- Sessões/visitas/exportação: `/api/sessions?action=visits|sessions` (+ `&format=excel|pdf|csv`)

## 🕘 Última sessão (01/09/2026)
**Email de notificação de nova solicitação de acesso**
- **Antes:** `api/public?action=request-access` só salvava o pedido no banco. O admin não recebia
  nenhum email ao solicitarem acesso — precisava entrar no painel para ver os pedidos.
- **Agora:** `api/public.js` envia email para `ADMIN_EMAIL` com nome/email do solicitante e link
  para o painel, logo após salvar o pedido. Commit `c85e201`, deploy `inventariodowifi-fr7petzrw`,
  alias `inventariodowifi.vercel.app` atualizado.
- ⚠️ Resend ainda em modo TESTE — emails só chegam para endereço verificado na conta Resend
  (provavelmente luizfernandodiaspeixoto@gmail.com). Para receber no oi.net.br, verificar email/
  domínio em https://resend.com/domains.

## 🕘 Sessão anterior (31/08/2026)
1. **Correção do cadastro (Solicitar acesso)** — `src/components/AccessRequest.jsx` chamava
   `api/request-access` (rota inexistente). Corrigido para `api/public?action=request-access`.
   O deploy em produção ainda estava com o código antigo; feito commit, push e novo deploy +
   atualização do alias `inventariodowifi.vercel.app`.
2. **Notificação de usuários por email** — nova aba "Notificar usuários" no painel admin:
   - Marca usuários aprovados com checkboxes (e "marcar todos")
   - Assunto/mensagem técnicos padrão editáveis
   - Novo endpoint `api/admin?action=send-update-alert`
   - Email padrão: "Atualização da página — Inventário de Redes Wi-Fi", assinado por
     Luiz Fernando (luiz.peixoto@oi.net.br)
   - Arquivos: `api/admin.js`, `src/components/AdminPanel.jsx`, `src/App.css`

## 🧱 Stack
- React 19 + Vite, Recharts, PapaParse, SheetJS, Lucide
- Vercel Serverless Functions (pasta `api/`), Upstash Redis, Brevo (envio de email), Resend (fallback), jose (JWT)

## 🕘 Sessão atual (02/09/2026) — Concluída
**Migração definitiva para EmailJS — envio de email real funcionando**
- **Problema:** emails não chegavam. Resend em modo teste, Brevo pede SMS para criar chave
  (não recebido no Brasil), Mailjet bloqueou a conta (401 mj-0001).
- **Solução:** EmailJS (gratuito, 200 emails/mês) com **dois templates**:
  - `template_9r13m4s` → atualização da página (botão "Notificar usuários" / `send-update-alert`)
  - `template_usfk3qg` → novo usuário (criação conta, aprovação, nova senha)
- **Arquivos modificados:**
  - `lib/email.js` — reescrito: `sendMail({to, subject, text, template})` usa
    `EMAILJS_TEMPLATE_UPDATE` ou `EMAILJS_TEMPLATE_NEWUSER`.
  - `api/admin.js` — `send-update-alert` chama `sendMail` com `template: 'update'`.
  - `.env.local` — removidas MAILJET/RESEND/BREVO; adicionadas EMAILJS_* (service, public, private, 2 templates).
- **Vercel:** removida `EMAILJS_TEMPLATE_ID`; adicionadas `EMAILJS_TEMPLATE_UPDATE` e
  `EMAILJS_TEMPLATE_NEWUSER`.
- **Testado:** envio de atualização da página e de novo usuário chegaram com conteúdo correto.
  Deploy `inventariodowifi-ge603k37n`, alias `inventariodowifi.vercel.app` atualizado.

## 📝 Observações para próximas sessões
- $username é Luiz Fernando. Responde em português.
- Não commitar `.env.local` (está no .gitignore).
- Fluxo de testes do admin usa senha atualizada (ver "Credenciais").