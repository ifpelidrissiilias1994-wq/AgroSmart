import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { parcelsApi, historyApi, type Parcel } from '../api';
import Nav from '../components/Nav';
import DotButton from '../components/DotButton';
import styles from './HistoricoPage.module.css';

const NAV_LINKS = [
  { label: 'PARCELAS', href: '/parcelas' },
  { label: 'HISTORICO', href: '/historico' },
  { label: 'REGISTRO', href: '/registro' },
  { label: 'AMBIENTE', href: '/environment' },
];

const METRICS = ['et0', 'etc_mm', 'ndvi', 'precip', 'tmin', 'tmax', 'vpd_kpa', 'balance_mm'];
const METRIC_LABELS: Record<string, string> = {
  et0: 'ET0', etc_mm: 'ETc', ndvi: 'NDVI', precip: 'Precip',
  tmin: 'T.Mín', tmax: 'T.Máx', vpd_kpa: 'VPD', balance_mm: 'Balance',
};

const fmt = (v: unknown, d = 2) => { if (v == null) return '—'; const n = Number(v); return isNaN(n) ? '—' : n.toFixed(d); };

const HistoricoPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['et0', 'etc_mm', 'precip', 'ndvi']);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    parcelsApi.list().then(p => {
      setParcels(p);
      if (p.length > 0) setSelectedId(p[0].id);
    }).catch(() => {});
    // Default: last 30 days
    const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 30);
    setDateTo(to.toISOString().slice(0, 10));
    setDateFrom(from.toISOString().slice(0, 10));
  }, []);

  const handleFilter = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {
        parcel_id: String(selectedId),
        metrics: selectedMetrics.join(','),
      };
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const result = await historyApi.series(params) as Record<string, unknown>;
      setData(result);
    } catch (_e) { setData(null); }
    setLoading(false);
  };

  const handleExport = async () => {
    if (!selectedId) return;
    try {
      const params: Record<string, string> = {
        parcel_id: String(selectedId),
        metrics: selectedMetrics.join(','),
      };
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const blob = await historyApi.exportXlsx(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `historico_${selectedId}.xlsx`; a.click();
      URL.revokeObjectURL(url);
    } catch (_e) { /* ignore */ }
  };

  const toggleMetric = (m: string) => {
    setSelectedMetrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const dates = data?.dates as string[] | undefined;

  return (
    <div className={styles.page}>
      <Nav links={NAV_LINKS} activeLink="/historico" user={user?.email} tag="andalucía" onLogout={logout} />

      <div className={styles.container}>
        <h1 className={styles.heading}>Histórico de Datos</h1>

        {/* Filters */}
        <div className={styles.filters}>
          <label className={styles.filterLabel}>
            PARCELA
            <select className={styles.select} value={selectedId ?? ''} onChange={e => setSelectedId(Number(e.target.value))}>
              {parcels.map(p => <option key={p.id} value={p.id}>{p.name || `#${p.id}`}</option>)}
            </select>
          </label>
          <label className={styles.filterLabel}>
            DESDE
            <input className={styles.dateInput} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </label>
          <label className={styles.filterLabel}>
            HASTA
            <input className={styles.dateInput} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </label>
          <DotButton variant="primary" onClick={handleFilter}>FILTRAR</DotButton>
          <DotButton variant="outline" onClick={handleExport}>EXPORTAR XLSX</DotButton>
        </div>

        {/* Metric chips */}
        <div className={styles.chips}>
          {METRICS.map(m => (
            <button key={m}
              className={`${styles.chip} ${selectedMetrics.includes(m) ? styles.chipActive : ''}`}
              onClick={() => toggleMetric(m)}
            >
              {METRIC_LABELS[m] || m}
            </button>
          ))}
        </div>

        {/* Data table */}
        {loading ? (
          <div className={styles.loading}>Cargando datos...</div>
        ) : dates && dates.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>FECHA</th>
                  {selectedMetrics.map(m => <th key={m}>{METRIC_LABELS[m]}</th>)}
                </tr>
              </thead>
              <tbody>
                {dates.map((d, i) => (
                  <tr key={i}>
                    <td>{d}</td>
                    {selectedMetrics.map(m => {
                      const arr = (data as Record<string, unknown>)?.[m] as number[] | undefined;
                      return <td key={m}>{fmt(arr?.[i])}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : data ? (
          <div className={styles.empty}>Sin datos para el rango seleccionado.</div>
        ) : null}
      </div>
    </div>
  );
};

export default HistoricoPage;
