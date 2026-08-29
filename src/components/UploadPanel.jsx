import { useRef, useState } from 'react'
import { UploadCloud, RefreshCw, X, FileSpreadsheet } from 'lucide-react'
import { readRowsFromFile, mapRowsForVendor } from '../utils/dataLoader'

const VENDORS = [
  { id: 'intelbras', label: 'Intelbras', hint: 'Device_Report.xlsx' },
  { id: 'aruba', label: 'Aruba', hint: 'Device_Inventory_Report.csv' },
  { id: 'ruckus', label: 'Ruckus', hint: 'Inventario_Ruckus.csv' },
  { id: 'meraki', label: 'Meraki', hint: 'Inventario_Meraki.csv' },
]

export default function UploadPanel({ onUpload, onClose }) {
  const [vendor, setVendor] = useState('intelbras')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  function handleFile(e) {
    const f = e.target.files && e.target.files[0]
    setFile(f || null)
    setStatus(null)
  }

  function handleUpload() {
    if (!file) {
      setStatus({ type: 'error', message: 'Selecione um arquivo primeiro.' })
      return
    }
    setLoading(true)
    setStatus(null)
    readRowsFromFile(file)
      .then((rows) => {
        const mapped = mapRowsForVendor(vendor, rows)
        onUpload(vendor, mapped)
        setStatus({ type: 'ok', message: `${mapped.length} registros carregados para ${VENDORS.find((v) => v.id === vendor).label}.` })
      })
      .catch((err) => {
        setStatus({ type: 'error', message: String(err && err.message ? err.message : err) })
      })
      .finally(() => setLoading(false))
  }

  const current = VENDORS.find((v) => v.id === vendor)

  return (
    <div className="upload-overlay" onClick={onClose}>
      <div className="upload-panel" onClick={(e) => e.stopPropagation()}>
        <div className="upload-head">
          <div>
            <h3>Atualizar dados</h3>
            <p>Envie um arquivo CSV ou XLSX para o fabricante selecionado.</p>
          </div>
          <button className="upload-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="upload-vendors">
          {VENDORS.map((v) => (
            <button
              key={v.id}
              className={`upload-vendor ${vendor === v.id ? 'active' : ''}`}
              onClick={() => {
                setVendor(v.id)
                setFile(null)
                setStatus(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="upload-field">
          <label>Fabricante</label>
          <span className="upload-field-value">{current.label} — esperado: <code>{current.hint}</code></span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,.xlsx,.xls"
          onChange={handleFile}
          className="upload-input"
        />

        {file ? (
          <div className="upload-filename">
            <FileSpreadsheet size={16} />
            <span>{file.name}</span>
          </div>
        ) : (
          <div className="upload-drop" onClick={() => inputRef.current && inputRef.current.click()}>
            <UploadCloud size={26} />
            <span>Clique para escolher o arquivo</span>
          </div>
        )}

        {status ? (
          <div className={`upload-msg ${status.type === 'ok' ? 'ok' : 'error'}`}>
            {status.message}
          </div>
        ) : null}

        <div className="upload-actions">
          <button className="upload-btn primary" onClick={handleUpload} disabled={loading}>
            {loading ? <RefreshCw size={16} className="spin" /> : <UploadCloud size={16} />}
            {loading ? 'Carregando...' : 'Carregar e exibir'}
          </button>
          {file ? (
            <button
              className="upload-btn ghost"
              onClick={() => {
                setFile(null)
                setStatus(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              Limpar
            </button>
          ) : null}
        </div>

        <p className="upload-note">
          Os dados carregados são exibidos imediatamente nesta sessão. Para publicar para todos, faça o
          push do arquivo para a pasta <code>public/data/</code> no repositório.
        </p>
      </div>
    </div>
  )
}
