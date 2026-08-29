# Inventário de Redes Wi-Fi

Dashboard consolidado de monitoramento de Access Points das redes **Intelbras, Aruba, Ruckus e Meraki**, com gráficos interativos, sistema de acesso protegido por login e painel de administração.

**Site em produção:** https://inventariodowifi.vercel.app

## 🚀 Rodar localmente

```bash
cd G:\meu-projeto
git pull
npm install
vercel dev --port 3333
```

Acesse: **http://localhost:3333**

Ou dê duplo clique no atalho **"Inventario Wi-Fi"** na Área de Trabalho.

## 🔐 Sistema de acesso

O site é protegido por login. O fluxo é:

1. O visitante clica em **"Solicitar acesso"** e informa nome + email
2. O pedido aparece no painel de administração
3. O admin aprova — o sistema gera uma senha e envia por email (ou mostra no painel)
4. O visitante loga com email + senha

### Credenciais do admin

| Campo | Valor |
|-------|-------|
| Email | `luiz.peixoto@oi.net.br` |
| Senha | `21wqsaxz` |

## 📊 Atualizar dados (CSV/XLSX)

Os dados ficam na pasta `public/data/`. Mantenha os **mesmos nomes** de arquivo.

| Fabricante | Arquivo | Formato |
|------------|---------|---------|
| Intelbras | `Device_Report.xlsx` | Excel |
| Aruba | `Device_Inventory_Report.csv` | CSV |
| Ruckus | `Inventario_Ruckus.csv` | CSV |
| Meraki | `Inventario_Meraki.csv` | CSV |

**Publicar dados atualizados:**

```bash
git add public/data/
git commit -m "Atualiza inventário"
git push
vercel --prod --yes
vercel alias set inventariodowifi-XXXX.vercel.app inventariodowifi.vercel.app
```

## 🔧 Variáveis de ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `UPSTASH_REDIS_REST_URL` | URL do banco Upstash Redis | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Token do banco Upstash Redis | ✅ |
| `JWT_SECRET` | Segredo para tokens JWT | ✅ |
| `ADMIN_EMAIL` | Email do administrador | ✅ |
| `ADMIN_SECRET` | Segredo para API /revoke | ➖ |
| `RESEND_API_KEY` | Chave do Resend (email) | ✅ |
| `MAIL_FROM` | Endereço de origem dos emails | ✅ |
| `SITE_URL` | URL pública do site | ✅ |

> O Resend está em modo teste (só envia para `luizfernandodiaspeixoto@gmail.com`). Para enviar para qualquer pessoa, verifique um domínio em https://resend.com/domains.

## 🧱 Stack

- React 19 + Vite 8
- Recharts, PapaParse, SheetJS, Lucide
- Vercel Serverless Functions (APIs)
- Upstash Redis (banco de usuários)
- Resend (email automático)
- JWT via jose (autenticação)

## 📄 Documentação

- `documentacao do projeto/Documentacao_Projeto_Inventario_WiFi.md` — documentação completa
- `CONTEXTO.md` — resumo rápido para retomar o projeto

---

Criado por **Luiz Fernando Peixoto** · luiz.peixoto@oi.net.br
