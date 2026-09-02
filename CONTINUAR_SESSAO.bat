@echo off
title Inventario Wi-Fi - Ponto de Inicio - Sessao 01/09/2026
cd /d "G:\meu-projeto"
echo.
echo ========================================
echo  INVENTARIO DE REDES WI-FI - PONTO DE INICIO
echo ========================================
echo.
echo Data: 01/09/2026
echo Projeto: G:\meu-projeto
echo Producao: https://inventariodowifi.vercel.app
echo.
echo Admin: luiz.peixoto@oi.net.br / 21wqsaxz
echo.
echo ----------------------------------------
echo ULTIMO ACESSO - O QUE FOI FEITO:
echo ----------------------------------------
echo.
echo [1] EMAIL AO ADMIN AO SOLICITAREM ACESSO (novo)
echo    - Antes: api/public?action=request-access so salvava o pedido;
echo      o admin so via a solicitacao entrando no painel admin.
echo    - Agora: api/public.js envia email ao admin com nome/email do
echo      solicitante e link para o painel (luiz.peixoto@oi.net.br)
echo    - Deploy feito: commit c85e201, deploy inventariodowifi-fr7petzrw
echo    - Alias inventariodowifi.vercel.app atualizado
echo.
echo [2] CORRECAO DO CADASTRO (Solicitar acesso) - sessao 31/08
echo    - Antes: fluxo chamava api/request-access (rota que nao existe)
echo    - Agora: api/public?action=request-access  (src/components/AccessRequest.jsx)
echo    - Motivo do erro em prod: deploy antigo; refeito deploy e alias
echo.
echo [3] NOTIFICAR USUARIOS POR EMAIL (31/08)
echo    - Nova aba "Notificar usuarios" no painel admin
echo    - Marca usuarios aprovados com checkboxes (+ marcar todos)
echo    - Assunto/mensagem tecnicos padrao editaveis
echo    - Novo endpoint: api/admin?action=send-update-alert
echo.
echo ----------------------------------------
echo ATENCAO - EMAIL EM MODO TESTE (Resend):
echo ----------------------------------------
echo Emails so chegam para endereco verificado na conta Resend
echo (provavelmente luizfernandodiaspeixoto@gmail.com). Para receber
echo no oi.net.br: verificar email/dominio em https://resend.com/domains
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
echo  Cadastro:   api/public?action=request-access  ^<-- agora avisa admin por email
echo  Admin:      api/admin?action=approve^|deny^|revoke^|send-update-alert...
echo  Sessoes:    api/sessions?action=sessions^&format=excel^|pdf^|csv
echo.
echo ----------------------------------------
echo ARQUIVOS MODIFICADOS (ultima sessao):
echo ----------------------------------------
echo  api/public.js  ^<-- email ao admin em nova solicitacao de acesso
echo.
echo Abrindo shell no diretorio do projeto...
echo.
cmd /k