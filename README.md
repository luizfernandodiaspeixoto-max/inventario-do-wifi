# Inventário de Redes Wi-Fi

Dashboard consolidado de monitoramento de Access Points das redes **Intelbras, Aruba, Ruckus e Meraki**, com separação clara por fabricante.

## 🚀 Rodar localmente

```bash
npm install
npm run dev
```

- **Build de produção:** `npm run build`
- **Lint:** `npm run lint`

## 📊 Como atualizar os dados (CSV/XLSX)

Os dados ficam na pasta **`public/data/`**. Para atualizar, basta **substituir os arquivos** e enviar as alterações (push) — o site é publicado automaticamente pelo GitHub Actions.

| Fabricante | Arquivo (em `public/data/`) | Formato |
|------------|-----------------------------|---------|
| Intelbras  | `Device_Report.xlsx`        | Excel   |
| Aruba      | `Device_Inventory_Report.csv` | CSV   |
| Ruckus     | `Inventario_Ruckus.csv`     | CSV     |
| Meraki     | `Inventario_Meraki.csv`     | CSV     |

### Passo a passo para atualizar

1. Substitua os arquivos na pasta `public/data/` **mantendo o mesmo nome**.
2. Faça o commit e o push:

```bash
git add public/data/
git commit -m "Atualiza inventário"
git push
```

3. O GitHub Actions reconstrói e publica o site automaticamente (leva ~1 min).
4. Acesse o site em **<https://luizfernandodiaspeixoto-max.github.io/inventario-do-wifi/>**.

> ⚠️ Mantenha os **mesmos nomes de arquivo**, pois o código os procura pelo nome fixo.

## 🔐 Sistema de acesso (login automático)

O site é protegido por login. O acesso é **aprovado via link por email**:

1. O visitante clica em **"Solicitar acesso"** e informa nome + email.
2. O sistema envia um email para você (`luiz.peixoto@oi.net.br`) com um botão **"Aprovar acesso"**.
3. Ao clicar em aprovar, o sistema **gera uma senha automaticamente** e a envia por email ao visitante.
4. O visitante entra no site com o email e a senha recebida.

> Você também pode **remover o acesso** de alguém via API (ver abaixo).

### Configuração no Vercel

Sem servidor próprio (site estático), o backend usa **Vercel Serverless Functions**. As variáveis abaixo devem ser configuradas em **Vercel → Project Settings → Environment Variables** (ou no `.env.local` para testes locais):

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `RESEND_API_KEY` | ✅ | Chave de API do Resend (envios de email). Crie em https://resend.com |
| `MAIL_FROM` | ✅ | Endereço de origem (domínio verificado no Resend, ou `onboarding@resend.dev` para testes) |
| `ADMIN_EMAIL` | ✅ | Seu email que recebe e aprova os pedidos (`luiz.peixoto@oi.net.br`) |
| `JWT_SECRET` | ✅ | Segredo aleatório/longo para assinar os tokens de sessão |
| `SITE_URL` | ✅ | URL pública do site (ex.: `https://meu-projeto.vercel.app`) |
| `UPSTASH_REDIS_REST_URL` | ✅ | URL do banco Redis (Upstash) — armazena usuários |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Token do banco Redis (Upstash) |
| `ADMIN_SECRET` | ➖ | Segredo para remover acessos via API `/api/revoke` |

**Passo a passo:**
- Crie um banco Redis grátis em https://console.upstash.com (tipo Redis) e copie a URL e o token REST.
- Crie uma API Key em https://resend.com e, idealmente, **verifique um domínio** para poder enviar email real (o domínio padrão `onboarding@resend.dev` serve só para testes).
- Configure todas as variáveis acima no Vercel e faça redeploy.

### Remover acesso de uma pessoa (opcional)

```bash
curl -X POST https://SEU-SITE/api/revoke \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: SEU_ADMIN_SECRET" \
  -d '{"email":"pessoa@exemplo.com"}'
```

### Limitação

O armazenamento em memória (fallback sem Redis) **não persiste entre recarregamentos** — em produção é obrigatório configurar o Upstash Redis.

## 🧱 Tecnologias

- React 19 + Vite
- Recharts (gráficos)
- PapaParse (CSV)
- SheetJS xlsx (Excel)
- Lucide (ícones)
- Vercel Serverless Functions (API de autenticação)
- Resend (envio de email) + Upstash Redis (banco) + jose (JWT)

---
Criado por **Luiz Fernando** · <luiz.peixoto@oi.net.br>
