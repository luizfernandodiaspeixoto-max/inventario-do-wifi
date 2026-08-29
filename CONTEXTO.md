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

## ✉️ Resend (email automático)
- `RESEND_API_KEY` → valor no `G:\meu-projeto\.env.local` e no Vercel
- `MAIL_FROM="Inventário Wi-Fi <onboarding@resend.dev>"`
- ⚠️ Modo TESTE: só entrega email para `luizfernandodiaspeixoto@gmail.com`
- Usuário decidiu NÃO verificar domínio. Para emails de outros endereços a senha é
  mostrada no painel admin (comportamento esperado, não é bug).

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
- Painel admin: aprovar/recusar pedidos, listar usuários, nova senha, remover acesso
- Seed do admin por endpoint protegido
- Contador de visitas exibido no painel admin (total + hoje) — API `api/visits.js`
- Logo Oi substituído por logo WiFi (`public/logo-wifi.svg`)
- Botão "Administração" movido para o cabeçalho (ao lado de "Atualizar dados")
- Atalhos de atualização: `atualizar.ps1`, `Atualizar Projeto.bat`, atalho na Área de Trabalho

## 🧱 Stack
- React 19 + Vite, Recharts, PapaParse, SheetJS, Lucide
- Vercel Serverless Functions (pasta `api/`), Upstash Redis, Resend, jose (JWT)

## 📝 Observações para próximas sessões
- $username é Luiz Fernando. Responde em português.
- Não commitar `.env.local` (está no .gitignore).
- Fluxo de testes do admin usa senha atualizada (ver "Credenciais").