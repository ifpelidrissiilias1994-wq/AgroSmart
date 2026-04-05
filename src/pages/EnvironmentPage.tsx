import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { parcelsApi, type Parcel } from '../api';
import Nav from '../components/Nav';
import styles from './EnvironmentPage.module.css';

const NAV_LINKS = [
  { label: 'PARCELAS', href: '/parcelas' },
  { label: 'HISTORICO', href: '/historico' },
  { label: 'REGISTRO', href: '/registro' },
  { label: 'AMBIENTE', href: '/environment' },
];

const EnvironmentPage: React.FC = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [soilSummary, setSoilSummary] = useState<Record<string, unknown> | null>(null);
  const [airQuality, setAirQuality] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    parcelsApi.list().then(p => {
      setParcels(p);
      if (p.length > 0) setSelectedId(p[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    Promise.all([
      parcelsApi.soilSummary(selectedId).catch(() => null),
      parcelsApi.airQuality(selectedId).catch(() => null),
    ]).then(([soil, air]) => {
      setSoilSummary(soil as Record<string, unknown>);
      setAirQuality(air as Record<string, unknown>);
    }).finally(() => setLoading(false));
  }, [selectedId]);

  const handleRefresh = async () => {
    if (!selectedId) return;
    setRefreshing(true);
    try {
      const soil = await parcelsApi.soilRefresh(selectedId, { replace_existing: true }) as Record<string, unknown>;
      setSoilSummary(soil);
    } catch (_e) { /* ignore */ }
    setRefreshing(false);
  };

  const handleExport = async () => {
    if (!selectedId) return;
    try {
      const blob = await parcelsApi.environmentExport(selectedId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `environment_${selectedId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_e) { /* ignore */ }
  };

  const fmt = (v: unknown, digits = 1) => {
    if (v == null || v === '') return '—';
    const n = Number(v);
    return isNaN(n) ? String(v) : n.toFixed(digits);
  };

  return (
    <div className={styles.page}>
      <Nav links={NAV_LINKS} activeLink="/environment" user={user?.email} tag="andalucía" />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Ambiente: Suelo y Aire</h1>
          <p className={styles.desc}>Datos de suelo (IGME/ITACyL) y calidad del aire para tu parcela.</p>
        </div>

        <div className={styles.controls}>
          <select className={styles.select} value={selectedId ?? ''} onChange={e => setSelectedId(Number(e.target.value))}>
            {parcels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className={styles.btn} onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Actualizando...' : 'ACTUALIZAR SUELO'}
          </button>
          <button className={styles.btnOutline} onClick={handleExport}>DESCARGAR XLSX</button>
        </div>

        {loading ? (
          <div className={styles.loading}>Cargando datos...</div>
        ) : (
          <div className={styles.grid}>
            {/* Soil Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Perfil de Suelo</h2>
              {soilSummary ? (
                <div className={styles.metrics}>
                  <div className={styles.metric}><span className={styles.metricLabel}>MUESTRAS</span><span className={styles.metricValue}>{fmt(soilSummary.num_muestras, 0)}</span></div>
                  <div className={styles.metric}><span className={styles.metricLabel}>pH MEDIO</span><span className={styles.metricValue}>{fmt(soilSummary.ph_medio)}</span></div>
                  <div className={styles.metric}><span className={styles.metricLabel}>MAT. ORGÁNICA</span><span className={styles.metricValue}>{fmt(soilSummary.materia_organica_media)}%</span></div>
                  <div className={styles.metric}><span className={styles.metricLabel}>ARENA</span><span className={styles.metricValue}>{fmt(soilSummary.arena_media)}%</span></div>
                  <div className={styles.metric}><span className={styles.metricLabel}>LIMO</span><span className={styles.metricValue}>{fmt(soilSummary.limo_media)}%</span></div>
                  <div className={styles.metric}><span className={styles.metricLabel}>ARCILLA</span><span className={styles.metricValue}>{fmt(soilSummary.arcilla_media)}%</span></div>
                  <div className={styles.metric}><span className={styles.metricLabel}>TEXTURA</span><span className={styles.metricValue}>{String(soilSummary.textura || '—')}</span></div>
                  <div className={styles.metric}><span className={styles.metricLabel}>APTITUD</span><span className={styles.metricValue}>{String(soilSummary.aptitud || '—')}</span></div>
                </div>
              ) : (
                <p className={styles.empty}>Sin datos de suelo disponibles.</p>
              )}
            </div>

            {/* Air Quality Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Calidad del Aire</h2>
              {airQuality ? (
                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>PROVEEDOR</span>
                    <span className={styles.metricValue}>{String((airQuality as Record<string, unknown>).provider || '—')}</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>DISTANCIA</span>
                    <span className={styles.metricValue}>{fmt((airQuality as Record<string, unknown>).distance_km)} km</span>
                  </div>
                  {airQuality.data && typeof airQuality.data === 'object' &&
                    Object.entries(airQuality.data as Record<string, unknown>).map(([k, v]) => (
                      <div key={k} className={styles.metric}>
                        <span className={styles.metricLabel}>{k.toUpperCase()}</span>
                        <span className={styles.metricValue}>{fmt(v)}</span>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className={styles.empty}>Sin datos de calidad del aire disponibles.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentPage;
