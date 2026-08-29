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
4. Acesse o site em **<https://luizfernandodiaspeixoto-max.github.io/inventario-wifi/>**.

> ⚠️ Mantenha os **mesmos nomes de arquivo**, pois o código os procura pelo nome fixo.

## 🧱 Tecnologias

- React 19 + Vite
- Recharts (gráficos)
- PapaParse (CSV)
- SheetJS xlsx (Excel)
- Lucide (ícones)

---
Criado por **Luiz Fernando** · <luiz.peixoto@oi.net.br>
