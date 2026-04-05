import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { parcelsApi, dailyApi, type Parcel, type DailyMetrics } from '../api';
import Nav from '../components/Nav';
import DotButton from '../components/DotButton';
import MetricCard from '../components/MetricCard';
import MetricGrid from '../components/MetricGrid';
import SpacedHeading from '../components/SpacedHeading';
import styles from './DetallePage.module.css';

const NAV_LINKS = [
  { label: 'PARCELAS', href: '/parcelas' },
  { label: 'HISTORICO', href: '/historico' },
  { label: 'REGISTRO', href: '/registro' },
  { label: 'AMBIENTE', href: '/environment' },
];

const fmt = (v: unknown, digits = 2) => {
  if (v == null) return '—';
  const n = Number(v);
  return isNaN(n) ? '—' : n.toFixed(digits);
};

const DetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [daily, setDaily] = useState<DailyMetrics | null>(null);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalcing, setRecalcing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const pid = Number(id);
    setLoading(true);
    Promise.all([
      parcelsApi.get(pid),
      dailyApi.latest(pid).catch(() => null),
      dailyApi.summary(pid, 30).catch(() => null),
    ]).then(([p, d, s]) => {
      setParcel(p);
      setDaily(d as DailyMetrics);
      setSummary(s as Record<string, unknown>);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleRecalc = async () => {
    if (!id) return;
    setRecalcing(true);
    try {
      await parcelsApi.recalc(Number(id), { today: true });
      const d = await dailyApi.latest(Number(id)).catch(() => null);
      setDaily(d as DailyMetrics);
    } catch (_e) { /* ignore */ }
    setRecalcing(false);
  };

  const handleDownload = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/daily/${id}/today?debug=1`, { credentials: 'same-origin' });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `parcel_${id}_report.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (_e) { /* ignore */ }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Nav links={NAV_LINKS} user={user?.email} tag="andalucía" onLogout={logout} />
        <div className={styles.loading}>Cargando parcela...</div>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className={styles.page}>
        <Nav links={NAV_LINKS} user={user?.email} tag="andalucía" onLogout={logout} />
        <div className={styles.loading}>Parcela no encontrada.</div>
      </div>
    );
  }

  const states = daily?.states || [];
  const trends = (summary as Record<string, unknown>)?.trends as Record<string, unknown> | undefined;

  return (
    <div className={styles.page}>
      <Nav links={NAV_LINKS} user={user?.email} tag="andalucía" onLogout={logout} />

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link to="/parcelas" className={styles.crumbLink}>Parcelas</Link>
          <span className={styles.crumbSep}>/</span>
          <span>{parcel.name || `Parcela #${parcel.id}`}</span>
        </div>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{parcel.name || `Parcela #${parcel.id}`}</h1>
          <span className={styles.badge}>Normal</span>
        </div>

        <div className={styles.actions}>
          <DotButton variant="primary" onClick={handleRecalc}>
            {recalcing ? 'RECALCULANDO...' : 'ACTUALIZAR DATOS HOY'}
          </DotButton>
          <DotButton variant="outline" onClick={handleDownload}>DESCARGAR JSON</DotButton>
          <Link to="/registro" style={{ textDecoration: 'none' }}><DotButton variant="outline">AÑADIR REGISTRO</DotButton></Link>
          <Link to="/historico" style={{ textDecoration: 'none' }}><DotButton variant="outline">HISTORICO</DotButton></Link>
        </div>

        <SpacedHeading>Hoy</SpacedHeading>
        <MetricGrid columns={3}>
          <MetricCard label="ET0" value={fmt(daily?.et0)} unit="mm/día" />
          <MetricCard label="ETc" value={fmt(daily?.etc_mm)} unit="mm/día" />
          <MetricCard label="VPD" value={fmt(daily?.vpd_kpa)} unit="kPa" />
        </MetricGrid>
        <MetricGrid columns={3}>
          <MetricCard label="NDVI" value={fmt(daily?.ndvi)} />
          <MetricCard label="PRECIPITACION" value={fmt(daily?.precip, 1)} unit="mm" />
          <MetricCard label="TEMPERATURA" value={daily?.tmin != null && daily?.tmax != null ? `${fmt(daily.tmin, 0)}° / ${fmt(daily.tmax, 0)}°` : '—'} />
        </MetricGrid>

        {states.length > 0 && (
          <div className={styles.statesRow}>
            {states.map((s, i) => (
              <div key={i} className={`${styles.stateChip} ${styles[`state_${s.level}`] || ''}`}>
                <strong>{s.sem}</strong> {s.message}
              </div>
            ))}
          </div>
        )}

        {summary && (
          <>
            <SpacedHeading>Resumen 30 días</SpacedHeading>
            <MetricGrid columns={4}>
              <MetricCard label="ET0 MEDIA" value={fmt(trends?.et0_avg)} unit="mm/día" />
              <MetricCard label="PRECIP TOTAL" value={fmt(trends?.precip_total, 1)} unit="mm" />
              <MetricCard label="DIAS ALERTA" value={fmt(trends?.alert_days, 0)} />
              <MetricCard label="VPD MEDIO" value={fmt(trends?.vpd_avg)} unit="kPa" />
            </MetricGrid>
          </>
        )}

        <SpacedHeading>Detalles</SpacedHeading>
        <div className={styles.details}>
          <div><strong>Cultivo:</strong> {parcel.crop || '—'}</div>
          <div><strong>Variedad:</strong> {parcel.variety || '—'}</div>
          <div><strong>Área:</strong> {parcel.area_ha ? `${parcel.area_ha} ha` : '—'}</div>
          <div><strong>Estación AEMET:</strong> {parcel.aemet_station_id || '—'}</div>
          <div><strong>Coordenadas:</strong> {parcel.lat && parcel.lon ? `${parcel.lat.toFixed(4)}, ${parcel.lon.toFixed(4)}` : '—'}</div>
          <div><strong>Riego:</strong> {parcel.irrigation_system || '—'}</div>
        </div>
      </div>
    </div>
  );
};

export default DetallePage;
