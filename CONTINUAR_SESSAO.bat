@echo off
title Inventario Wi-Fi - Ponto de Inicio - Sessao 31/08/2026
cd /d "G:\meu-projeto"
echo.
echo ========================================
echo  INVENTARIO DE REDES WI-FI - PONTO DE INICIO
echo ========================================
echo.
echo Data: 31/08/2026
echo Projeto: G:\meu-projeto
echo Producao: https://inventariodowifi.vercel.app
echo.
echo Admin: luiz.peixoto@oi.net.br / 21wqsaxz
echo.
echo ----------------------------------------
echo ULTIMO ACESSO - O QUE FOI FEITO:
echo ----------------------------------------
echo.
echo [1] CORRECAO DO CADASTRO (Solicitar acesso)
echo    - Antes: fluxo chamava api/request-access (rota que nao existe)
echo    - Agora: api/public?action=request-access  (src/components/AccessRequest.jsx)
echo    - Motivo do erro em prod: deploy antigo; refeito deploy e alias
echo.
echo [2] NOTIFICAR USUARIOS POR EMAIL (novo)
echo    - Nova aba "Notificar usuarios" no painel admin
echo    - Marca usuarios aprovados com checkboxes (+ marcar todos)
echo    - Assunto/mensagem tecnicos padrao editaveis
echo    - Novo endpoint: api/admin?action=send-update-alert
echo    - Email: "Atualizacao da pagina - Inventario de Redes Wi-Fi"
echo      Ass: Luiz Fernando - luiz.peixoto@oi.net.br
echo.
echo [3] DOCUMENTACAO ATUALIZADA
echo    - documentacao do projeto\Documentacao_Projeto_Inventario_WiFi.md
echo    - CONTEXTO.md
echo    - RESUMO_SESSAO.md
echo.
echo ----------------------------------------
echo COMANDOS UTEIS:
echo ----------------------------------------
echo  vercel dev --port 3333      ^<-- Rodar local
echo  vercel --prod --yes         ^<-- Deploy producao
echo  vercel alias set URL inventariodowifi.vercel.app  ^<-- Atualizar alias
echo  npm run build               ^<-- Build de producao
echo  npm run lint                ^<-- Lint
echo.
echo ----------------------------------------
echo ENDPOINTS ATUAIS (importante):
echo ----------------------------------------
echo  Login:      api/auth?action=login
echo  Cadastro:   api/public?action=request-access
echo  Admin:      api/admin?action=approve^|deny^|revoke^|send-update-alert...
echo  Sessoes:    api/sessions?action=sessions^&format=excel^|pdf^|csv
echo.
echo ----------------------------------------
echo ARQUIVOS MODIFICADOS (ultima sessao):
echo ----------------------------------------
echo  src/components/AccessRequest.jsx
echo  api/admin.js
echo  src/components/AdminPanel.jsx
echo  src/App.css
echo  documentacao do projeto\Documentacao_Projeto_Inventario_WiFi.md
echo  CONTEXTO.md
echo  RESUMO_SESSAO.md
echo.
echo Abrindo shell no diretorio do projeto...
echo.
cmd /k
