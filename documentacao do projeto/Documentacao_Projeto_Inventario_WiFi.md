# Inventário de Redes Wi-Fi

**Documentação Completa do Projeto — Procedimentos, Comandos e Configuração**

---

## 1. Resumo do Projeto

Dashboard web para monitoramento de Access Points das redes Intelbras, Aruba, Ruckus e Meraki, com gráficos interativos, filtros, KPIs consolidados, sistema de acesso protegido por login e painel de administração.

**Site em produção:** https://inventariodowifi.vercel.app  
**Repositório:** https://github.com/luizfernandodiaspeixoto-max/inventario-do-wifi

### 1.1 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite 8 |
| Gráficos | Recharts 3 |
| Parsing CSV | PapaParse 5 |
| Parsing Excel | SheetJS xlsx |
| Ícones | Lucide React |
| Lint | OxLint |
| Deploy | Vercel Serverless Functions |
| Banco de dados | Upstash Redis |
| Envio de email | Resend |
| Autenticação | JWT (jose) |
| CI/CD | GitHub Actions (GitHub Pages, opcional) |

### 1.2 Estrutura do Projeto

```
meu-projeto/
├── public/
│   ├── data/
│   │   ├── Device_Report.xlsx          (Intelbras)
│   │   ├── Device_Inventory_Report.csv (Aruba)
│   │   ├── Inventario_Ruckus.csv       (Ruckus)
│   │   └── Inventario_Meraki.csv       (Meraki)
│   ├── favicon.svg
│   ├── icons.svg
│   └── logo-wifi.svg                   (novo logo)
├── src/
│   ├── components/
│   │   ├── IntelbrasDashboard.jsx
│   │   ├── ArubaDashboard.jsx
│   │   ├── RuckusDashboard.jsx
│   │   ├── MerakiDashboard.jsx
│   │   ├── UploadPanel.jsx
│   │   ├── LoginScreen.jsx             (tela de login)
│   │   ├── AccessRequest.jsx           (solicitação de acesso)
│   │   └── AdminPanel.jsx              (painel admin com visitas)
│   ├── utils/
│   │   ├── dataLoader.js
│   │   ├── api.js
│   │   └── auth.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── api/                                (Vercel Serverless Functions)
│   ├── auth.js                         (login, logout, check-admin, visitas)
│   ├── admin.js                        (pedidos, usuários, senhas, notificação)
│   ├── public.js                       (solicitação de acesso)
│   └── sessions.js                     (visitas + sessões + exportação)
├── lib/                                (bibliotecas compartilhadas)
│   ├── admin.js
│   ├── auth.js                         (JWT)
│   ├── db.js                           (Upstash Redis)
│   ├── email.js                        (Resend)
│   └── http.js
├── documentacao do projeto/
│   ├── Documentacao_Projeto_Inventario_WiFi.docx
│   └── Documentacao_Projeto_Inventario_WiFi.md   (este arquivo)
├── CONTEXTO.md                         (resumo para retomar o projeto)
├── atualizar.ps1                       (script de atualização)
├── Atualizar Projeto.bat               (atalho .bat)
├── .env.local
├── .github/workflows/deploy.yml
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 2. Instalação e Configuração Local

### 2.1 Pré-requisitos

- Node.js 20+ instalado
- npm ou yarn instalado
- Git instalado
- Conta no GitHub
- Localização do projeto: `G:\meu-projeto`

### 2.2 Forma rápida (atalho)

Dê duplo clique no atalho **"Inventario Wi-Fi"** na Área de Trabalho ou em `G:\meu-projeto\Atualizar Projeto.bat`. O script faz automaticamente:
1. `git pull` (pega atualizações)
2. Verifica dependências
3. Abre o servidor local em http://localhost:3333

### 2.3 Forma manual (terminal)

```bash
cd G:\meu-projeto
git pull
npm install
vercel dev --port 3333
```

Acesse: **http://localhost:3333**

### 2.4 Build de produção

```bash
npm run build
```

### 2.5 Rodar lint

```bash
npm run lint
```

---

## 3. Sistema de Acesso e Autenticação

### 3.1 Fluxo de solicitação de acesso

1. O visitante clica em **"Solicitar acesso"** na tela de login
2. Informa nome e email
3. O pedido fica **pendente** no painel de administração
4. O admin aprova ou recusa
5. Ao aprovar: gera uma senha e envia por email (se configurado) **ou** exibe a senha no painel para copiar
6. O visitante loga com email + senha recebida

### 3.2 Credenciais do administrador

| Campo | Valor |
|-------|-------|
| Email | `luiz.peixoto@oi.net.br` |
| Senha | `21wqsaxz` |

> ⚠️ A senha foi alterada. Não utilize a senha antiga `vBgKGh3KKQ`.

### 3.3 Painel de administração

Acessível apenas para o admin. Funcionalidades (abas do painel):
- **Pedidos pendentes:** ver, aprovar ou recusar pedidos de acesso
- **Usuários aprovados:** listar, gerar nova senha, remover acesso
- **Criar usuário:** criar conta manualmente (com senha automática ou definida)
- **Notificar usuários:** marcar usuários e enviar email de alerta de atualização da página
- **Sessões:** listar sessões de acesso e exportar em Excel/PDF/CSV
- **Contador de visitas:** total de visitas ao site + visitas hoje (sempre visível no topo)

O botão "Administração" aparece no cabeçalho ao lado de "Atualizar dados".

### 3.4 Envio de email automático

- **Provedor:** Resend
- **Configuração atual:** modo teste (só envia email para `luizfernandodiaspeixoto@gmail.com`)
- Para enviar email para qualquer pessoa, é necessário verificar um domínio em https://resend.com/domains
- Quando o email não puder ser entregue, a senha aparece no painel admin (comportamento esperado)

---

## 4. Variáveis de Ambiente

### 4.1 Arquivo `.env.local` (para testes locais)

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `RESEND_API_KEY` | Chave de API do Resend | ✅ |
| `MAIL_FROM` | Endereço de origem dos emails | ✅ |
| `ADMIN_EMAIL` | Email do administrador | ✅ |
| `JWT_SECRET` | Segredo para tokens JWT | ✅ |
| `SITE_URL` | URL pública do site | ✅ |
| `UPSTASH_REDIS_REST_URL` | URL do banco Upstash Redis | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Token do banco Upstash Redis | ✅ |
| `ADMIN_SECRET` | Segredo para remoção de acessos via API | ➖ |

### 4.2 Configuração no Vercel

As mesmas variáveis devem ser configuradas em **Vercel → Project Settings → Environment Variables**.

---

## 5. Atualização dos Dados (CSV/XLSX)

### 5.1 Arquivos de dados

| Fabricante | Arquivo (em `public/data/`) | Formato |
|------------|-----------------------------|---------|
| Intelbras | `Device_Report.xlsx` | Excel (.xlsx) |
| Aruba | `Device_Inventory_Report.csv` | CSV |
| Ruckus | `Inventario_Ruckus.csv` | CSV |
| Meraki | `Inventario_Meraki.csv` | CSV |

> ⚠️ Mantenha os **MESMOS NOMES** de arquivo. O código procura pelo nome fixo.

### 5.2 Upload via botão no site

1. Acesse o site
2. Clique em **"Atualizar dados"** no cabeçalho
3. Faça login com as credenciais do admin
4. Selecione o fabricante
5. Escolha o arquivo CSV ou XLSX
6. Clique em **"Carregar e exibir"**
7. Os gráficos atualizam instantaneamente (dados só valem para esta sessão)

### 5.3 Atualização permanente (via git push)

```bash
git add public/data/
git commit -m "Atualiza inventário"
git push
vercel --prod --yes
```

---

## 6. Publicação no Vercel

### 6.1 Deploy em produção

```bash
cd G:\meu-projeto
vercel --prod --yes
```

### 6.2 Configurar domínio de produção

```bash
vercel alias set <URL-DO-NOVO-DEPLOY> inventariodowifi.vercel.app
```

### 6.3 Verificar deploy

```bash
vercel ls
vercel inspect <URL-DO-DEPLOY>
```

### 6.4 Variáveis no Vercel

Para adicionar/atualizar variáveis no Vercel:

```bash
# Adicionar variável (com valor lido do arquivo, sem trailing whitespace)
[System.IO.File]::WriteAllText(".env.tmp", "valor")
Get-Content -Raw .env.tmp | vercel env add NOME_VARIAVEL production --yes

# Remover variável
vercel env rm NOME_VARIAVEL production --yes
```

---

## 7. API Endpoints

Todas as APIs ficam em `api/` e são executadas como Vercel Serverless Functions (Node.js).

### 7.1 Autenticação (`api/auth.js`)

| Endpoint | Método | Descrição | Auth |
|----------|--------|-----------|------|
| `/api/auth?action=login` | POST | Login (email + senha → token JWT 30 dias) | Não |
| `/api/auth?action=logout` | POST | Encerrar sessão | Token/sessionId |
| `/api/auth?action=check-admin` | GET | Verificar se é admin (retorna `isAdmin`) | Bearer token |
| `/api/auth?action=visits` | POST | Registrar visita (incrementa contadores) | Não |

### 7.2 Acesso público (`api/public.js`)

| Endpoint | Método | Descrição | Auth |
|----------|--------|-----------|------|
| `/api/public?action=request-access` | POST | Solicitar acesso (nome + email) | Não |

### 7.3 Administração (`api/admin.js`)

| Endpoint | Método | Descrição | Auth |
|----------|--------|-----------|------|
| `/api/admin?action=pending` | GET | Listar pedidos pendentes | Bearer token (admin) |
| `/api/admin?action=users` | GET | Listar usuários aprovados | Bearer token (admin) |
| `/api/admin?action=visits` | GET | Consultar contagem de visitas | Bearer token (admin) |
| `/api/admin?action=approve` | POST | Aprovar pedido (gera senha, envia email) | Bearer token (admin) |
| `/api/admin?action=deny` | POST | Recusar pedido | Bearer token (admin) |
| `/api/admin?action=create-user` | POST | Criar usuário manualmente | Bearer token (admin) |
| `/api/admin?action=send-password` | POST | Gerar nova senha para usuário | Bearer token (admin) |
| `/api/admin?action=revoke` | POST | Remover acesso de usuário | Bearer token (admin) |
| `/api/admin?action=send-update-alert` | POST | Enviar email de alerta de atualização para usuários selecionados | Bearer token (admin) |

### 7.4 Sessões e exportação (`api/sessions.js`)

| Endpoint | Método | Descrição | Auth |
|----------|--------|-----------|------|
| `/api/sessions?action=visits` | GET | Consultar contagem de visitas | Não |
| `/api/sessions?action=visits` | POST | Registrar visita | Não |
| `/api/sessions?action=sessions` | GET | Listar sessões de acesso | Bearer token (admin) |
| `/api/sessions?action=sessions&format=excel` | GET | Exportar sessões em Excel | Bearer token (admin) |
| `/api/sessions?action=sessions&format=pdf` | GET | Exportar sessões em PDF | Bearer token (admin) |
| `/api/sessions?action=sessions&format=csv` | GET | Exportar sessões em CSV | Bearer token (admin) |

### 7.5 Exemplo: enviar alerta de atualização via curl

```bash
curl -X POST "https://inventariodowifi.vercel.app/api/admin?action=send-update-alert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{"emails":["usuario@exemplo.com"],"subject":"Atualização da página","message":"A página foi atualizada."}'
```

---

## 8. Funcionalidades Implementadas

### 8.1 Visão Geral
- Dashboard consolidado dos 4 fabricantes
- Cards clicáveis com totais de APs ativos por fabricante
- Botão "Atualizar dados" e botão "Administração" no cabeçalho
- Indicador de última atualização
- Contador de visitas no painel admin

### 8.2 Login e Autenticação
- Tela de login com email + senha
- Botão "Solicitar acesso" para novos usuários (envia pedido pendente ao admin)
- Tokens JWT válidos por 30 dias (armazenados no sessionStorage)
- Verificação de admin em cada requisição

### 8.3 Painel de Administração
- Lista de pedidos pendentes com aprovação/recusa
- Lista de usuários aprovados
- Geração de nova senha para usuários
- Remoção de acesso
- Criação manual de usuários
- Contador de visitas: total e do dia atual
- Registro de sessões de acesso (login/logout/duração/IP)
- Exportação de sessões em Excel, PDF e CSV
- **Notificação de usuários:** marcar usuários com checkboxes e enviar email de alerta de atualização da página (com assunto e mensagem técnicos padrão, assinado por Luiz Fernando)

### 8.4 Dashboard Intelbras
- KPIs: Total, Online, Offline, Sites, Modelo predominante, Disponibilidade
- Gráficos: Donut status, Modelos, APs por site, Status por site (stacked)
- Filtros: Site/Estado, Modelo

### 8.5 Dashboard Aruba
- KPIs: Total licenciados, Clientes, Modelos, Expiração, Arquivados
- Gráficos: Modelos licenciados, Clientes, Expiração de licenças, Subscription tier
- Filtros: Modelo, Cliente

### 8.6 Dashboard Ruckus
- KPIs: Total, Online, Offline, Flagged, Clientes conectados, Zonas
- Gráficos: Status donut, Modelos, Configuração, Status por zona (stacked), APs por zona
- Filtros: Modelo, Zona/Local, Status

### 8.7 Dashboard Meraki
- KPIs: APs Ativos (MR), Redes com APs, Organizações, Redes com tráfego
- Gráficos: APs por rede, APs por organização, Tipo de rede (pie), Tráfego por rede
- Gráfico "wide" para visualização completa das redes

### 8.8 Upload de Dados
- Botão "Atualizar dados" no cabeçalho
- Tela de login antes do upload
- Seleção de fabricante
- Upload de arquivos CSV ou XLSX
- Atualização instantânea dos gráficos

### 8.9 Marca d'Água
- Fundo sutil com padrão visual que não interfere nos dados
- Logo WiFi no cabeçalho e favicon

---

## 9. Links Importantes

| Recurso | URL |
|---------|-----|
| Repositório | https://github.com/luizfernandodiaspeixoto-max/inventario-do-wifi |
| Site em produção | https://inventariodowifi.vercel.app |
| Dashboard Vercel | https://vercel.com/luizfernandodiaspeixoto-maxgithubioinventario/inventariodowifi |
| GitHub Actions | https://github.com/luizfernandodiaspeixoto-max/inventario-do-wifi/actions |
| Configurações Pages | https://github.com/luizfernandodiaspeixoto-max/inventario-do-wifi/settings/pages |
| Console Upstash | https://console.upstash.com |
| Resend | https://resend.com |

---

## 10. Comandos Resumidos

### 10.1 Setup / Atualizar local

```bash
cd G:\meu-projeto
git pull
npm install
vercel dev --port 3333
```

Ou: duplo clique em `Atualizar Projeto.bat` / atalho na Área de Trabalho.

### 10.2 Atualizar dados e publicar

```bash
git add public/data/
git commit -m "Atualiza inventário"
git push
vercel --prod --yes
vercel alias set inventariodowifi-XXXX.vercel.app inventariodowifi.vercel.app
```

### 10.3 Verificar deploy

```bash
vercel ls
```

### 10.4 Build de produção

```bash
npm run build
npm run lint
```

---

## 11. Informações de Acesso

| Item | Valor |
|------|-------|
| Usuário GitHub | luizfernandodiaspeixoto-max |
| Email | luiz.peixoto@oi.net.br |
| Repositório | inventario-do-wifi |
| URL do site | inventariodowifi.vercel.app |
| Login admin | luiz.peixoto@oi.net.br |
| Senha admin | 21wqsaxz |
| Localização do projeto | G:\meu-projeto |
| Branch | main |

---

## 12. Arquivo de Contexto e Ponto de Início

Existe o arquivo `CONTEXTO.md` na raiz do projeto com um resumo rápido para retomar o trabalho sem precisar ler toda esta documentação. Em uma nova sessão do opencode, basta digitar: **"leia o CONTEXTO.md do projeto"**.

Também existe o arquivo `CONTINUAR_SESSAO.bat` (atalho/ponto de início) que, ao ser aberto, mostra o resumo completo do último acesso: o que foi feito, os arquivos modificados e os comandos úteis, além de abrir o terminal já no diretório do projeto.

---

*Documentação gerada automaticamente*  
Criado por **Luiz Fernando Peixoto** | luiz.peixoto@oi.net.br  
Atualizado em 31 de agosto de 2026
